import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { createExpertEntries, packageExpert, validateExpertEntries } from './package_expert.mjs';
import { readZipEntries } from '../../v2/tests/helpers/zip-reader.mjs';

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const pluginPath = 'plugins/noxinfluencer';
const manifestPath = '.codebuddy-plugin/plugin.json';
const agentPath = 'agents/influencer-marketing-manager.md';
const productName = 'noxinfluencer-plugin';
const managerName = 'influencer-marketing-manager-plugin';
const fixturePaths = [
  '.codex-plugin/plugin.json', '.plugin/plugin.json', '.mcp.json', 'README.md', 'LICENSE', 'assets/logo.png',
  'skills/noxinfluencer-mcp', 'skills/influencer-marketing-manager',
].map(path => `${pluginPath}/${path}`);

function sourceSnapshot(root) {
  const files = new Map();
  const walk = path => {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = join(path, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.set(relative(root, target).split(sep).join('/'), readFileSync(target));
    }
  };
  for (const path of fixturePaths) {
    const target = resolve(root, path);
    if (statSync(target).isDirectory()) walk(target);
    else files.set(path, readFileSync(target));
  }
  return files;
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'nox-workbuddy-expert-test-'));
  t.after(() => {
    const contained = relative(resolve(tmpdir()), resolve(root));
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    assert.ok(basename(root).startsWith('nox-workbuddy-expert-test-'));
    rmSync(root, { recursive: true, force: true });
  });
  for (const path of fixturePaths) {
    const target = resolve(root, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repositoryRoot, path), target, { recursive: true });
  }
  return root;
}

function editManifest(entries, edit) {
  const manifest = JSON.parse(entries.get(manifestPath));
  edit(manifest);
  entries.set(manifestPath, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
}

function editFrontmatter(entries, path, edit) {
  const content = entries.get(path).toString();
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(match, `Missing frontmatter in test entry: ${path}`);
  const document = parseDocument(match[1]);
  assert.deepEqual(document.errors, []);
  edit(document);
  entries.set(path, Buffer.from(`---\n${document.toString()}---\n${content.slice(match[0].length)}`));
}

let assembled;
let sourcesBefore;
let sourcesAfter;
before(() => {
  sourcesBefore = sourceSnapshot(repositoryRoot);
  assembled = createExpertEntries();
  sourcesAfter = sourceSnapshot(repositoryRoot);
  validateExpertEntries(assembled.entries);
});

test('Expert assembly preserves the source plugin and generates its WorkBuddy structure', () => {
  assert.deepEqual(sourcesAfter, sourcesBefore);
  assert.deepEqual(assembled.manifest.dependencies.connectors, ['noxinfluencer-mcp']);
  const source = JSON.parse(readFileSync(resolve(repositoryRoot, pluginPath, '.plugin/plugin.json')));
  assert.equal(source.name, 'noxinfluencer');
  assert.equal(assembled.manifest.name, 'influencer-marketing-manager');
  assert.equal(assembled.manifest.version, '0.1.3');
  assert.equal(assembled.manifest.plugin, 'influencer-marketing-manager');
  assert.equal(assembled.manifest.agentName, 'influencer-marketing-manager');
  assert.deepEqual(assembled.manifest.agents, [`./${agentPath}`]);
  assert.equal(assembled.entries.has('agents/noxinfluencer-expert.md'), false);
  const agent = assembled.entries.get(agentPath).toString().match(/^---\n([\s\S]*?)\n---/);
  assert.equal(parseDocument(agent[1]).get('name'), 'influencer-marketing-manager');
});

test('Expert builds from a plugin-only fixture without any separate content source', t => {
  const root = fixture(t);
  for (const path of ['experts', 'v2/source', 'skills', 'scripts/workbuddy/mcp']) {
    assert.equal(existsSync(resolve(root, path)), false);
  }
  const result = createExpertEntries({ root });
  assert.ok(result.inputs.length > 0);
  assert.ok(result.inputs.every(path => path.startsWith(`${pluginPath}/`)));
  assert.equal(result.entries.get('avatars/expert.png').equals(readFileSync(resolve(root, pluginPath, 'assets/logo.png'))), true);
  assert.equal(result.entries.get('LICENSE').equals(readFileSync(resolve(root, pluginPath, 'LICENSE'))), true);
  const sourceIndex = readFileSync(resolve(root, pluginPath, 'skills/noxinfluencer-mcp/references/tool-list.md'), 'utf8');
  const index = result.entries.get(`skills/${productName}/references/tool-list.md`).toString();
  assert.match(sourceIndex, /references\/tool-parameters-/);
  assert.doesNotMatch(index, /references\/tool-parameters-/);
  assert.deepEqual(index.match(/^- `[^`]+`$/gm), sourceIndex.match(/^- `[^`]+`$/gm));
});

test('Expert packaging follows edits to actual plugin files and metadata', t => {
  const root = fixture(t);
  const creator = resolve(root, pluginPath, 'skills/noxinfluencer-mcp/references/creator.md');
  writeFileSync(creator, readFileSync(creator) + '\nPlugin-directory-source-proof.\n');
  const metadataPath = resolve(root, pluginPath, '.plugin/plugin.json');
  const metadata = JSON.parse(readFileSync(metadataPath));
  metadata.author = { name: 'Plugin Fixture Author', email: 'fixture@example.com' };
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  const result = createExpertEntries({ root });
  assert.match(result.entries.get(`skills/${productName}/references/creator.md`).toString(), /Plugin-directory-source-proof/);
  assert.deepEqual(result.manifest.author, metadata.author);
});

test('Expert requires its avatar and author metadata in the source plugin', t => {
  const root = fixture(t);
  rmSync(resolve(root, pluginPath, 'assets/logo.png'));
  assert.throws(() => createExpertEntries({ root }));
  const metadataPath = resolve(root, pluginPath, '.plugin/plugin.json');
  const metadata = JSON.parse(readFileSync(metadataPath));
  delete metadata.author.email;
  writeFileSync(metadataPath, JSON.stringify(metadata) + '\n');
  assert.throws(() => createExpertEntries({ root }), /author name\/email/);
});

test('Manager references the installed and available product Skill from the same Expert', () => {
  const manager = assembled.entries.get(`skills/${managerName}/SKILL.md`).toString();
  assert.match(manager, /Every reference to `noxinfluencer-plugin`/);
  assert.match(manager, /already installed and available in the current WorkBuddy context/);
  assert.match(manager, /continue strategy, workflow design and analysis/);
  assert.match(manager, /\.\.\/noxinfluencer-plugin\/SKILL\.md/);
  assert.doesNotMatch(manager, /`noxinfluencer`|`noxinfluencer-mcp` product Skill/);
  const entries = new Map(assembled.entries);
  entries.set(`skills/${managerName}/SKILL.md`, Buffer.from(manager.replace('already installed and available in the current WorkBuddy context', 'provided here')));
  assert.throws(() => validateExpertEntries(entries), /Manager must check/);
});

test('Expert preserves MCP-only boundaries and explanatory CLI context from the plugin', () => {
  const product = assembled.entries.get(`skills/${productName}/SKILL.md`).toString();
  assert.match(product, /all NoxInfluencer business operations use the connected NoxInfluencer MCP connector/);
  assert.match(product, /Do not install or fall back to a business CLI/);
  assert.match(product, /shared Skills or CLI workflows/);
  const manager = assembled.entries.get(`skills/${managerName}/SKILL.md`).toString();
  assert.match(manager, /Use MCP only for these operations/);
  assert.match(manager, /refers to the CLI or a browser/);
  assert.match(manager, /standalone Skills\/CLI/);
  const automation = assembled.entries.get(`skills/${productName}/references/campaign-agent-automation-mcp.md`).toString();
  assert.match(automation, /same business meaning as the CLI addition command/);
  assert.match(automation, /there is no CLI body-file wrapper/);
  assert.match(assembled.entries.get(`skills/${productName}/references/tool-execution.md`).toString(), /Never invent a missing tool or fall back to CLI/);
  assert.match(assembled.entries.get(`skills/${productName}/references/workbuddy-runtime.md`).toString(), /Never substitute a CLI backend/);
  assert.match(assembled.entries.get(agentPath).toString(), /不安装或切换到 CLI/);
  const readme = assembled.entries.get('README.md').toString();
  assert.match(readme, /installing the NoxInfluencer CLI or copying an API key is not required/);
  assert.match(readme, /source `noxinfluencer-mcp`/);
  assert.doesNotMatch(readme, /under review/);
  const auth = assembled.entries.get(`skills/${productName}/references/oauth-and-scopes.md`).toString();
  assert.match(auth, /WorkBuddy's native authorization action/);
  assert.match(auth, /connection declared as a dependency by this Expert/);
  assert.match(auth, /continuation steps in “One Attempt, Then Resume”/);
  assert.match(auth, /Never build an authorization URL or run NoxInfluencer CLI login\/business commands/);
  assert.doesNotMatch(auth, /codex mcp login|Codex Authorization Only|supplied by this installed plugin|steps above/);
});

test('Expert preserves contextual operation names instead of treating them as executable commands', () => {
  const cooperation = assembled.entries.get(`skills/${productName}/references/campaign-cooperation-management.md`).toString();
  assert.match(cooperation, /`auto-advance settings-get`/);
  assert.match(cooperation, /`automations get\/switch`/);
  assert.match(cooperation, /`notes save`/);
  assert.match(cooperation, /Record-save is a separate cooperation detail operation/);
  const invitation = assembled.entries.get(`skills/${productName}/references/campaign-invitation-management.md`).toString();
  assert.match(invitation, /`settings-get`/);
  assert.match(invitation, /`settings-save`/);
  assert.match(invitation, /`settings-apply`/);
  assert.match(invitation, /`regions`/);
});

test('Expert validation rejects a name that differs from the existing WorkBuddy asset', () => {
  const entries = new Map(assembled.entries);
  editManifest(entries, manifest => { manifest.name = manifest.plugin = 'noxinfluencer-expert'; });
  assert.throws(() => validateExpertEntries(entries), /identity/);
});

test('package version can change without editing the source plugin manifest', () => {
  const result = createExpertEntries({ version: '0.1.7' });
  assert.equal(result.manifest.version, '0.1.7');
  assert.equal(JSON.parse(readFileSync(resolve(repositoryRoot, pluginPath, '.plugin/plugin.json'))).version, '1.0.1');
  assert.throws(() => createExpertEntries({ version: 'not-a-version' }), /semantic versioning/);
  assert.deepEqual(sourceSnapshot(repositoryRoot), sourcesBefore);
});

test('Expert dependency uses the public connector source instead of a backend connector ID', () => {
  const entries = new Map(assembled.entries);
  editManifest(entries, manifest => { manifest.dependencies.connectors = ['oc_e701b8b6011f3b3e']; });
  assert.throws(() => validateExpertEntries(entries));
});

test('Expert validation rejects a bundled product with the standalone skill identity', () => {
  const entries = new Map(assembled.entries);
  editFrontmatter(entries, `skills/${productName}/SKILL.md`, document => { document.set('name', 'noxinfluencer'); });
  assert.throws(() => validateExpertEntries(entries));
});

test('Expert validation rejects an omitted business reference used by the Manager', () => {
  const entries = new Map(assembled.entries);
  assert.equal(entries.delete(`skills/${managerName}/references/playbook.md`), true);
  assert.throws(() => validateExpertEntries(entries));
});

test('Expert validation rejects an Agent that preloads a skill absent from its package', () => {
  const entries = new Map(assembled.entries);
  editFrontmatter(entries, agentPath, document => { document.set('skills', [managerName, 'unbundled-marketing-skill']); });
  assert.throws(() => validateExpertEntries(entries));
});

test('Expert Agent cannot declare its own tools over the connector dependency', () => {
  const entries = new Map(assembled.entries);
  editFrontmatter(entries, agentPath, document => { document.set('tools', ['*']); });
  assert.throws(() => validateExpertEntries(entries));
});

test('two independently written Expert ZIPs contain the complete MCP Expert and identical bytes', async t => {
  const root = fixture(t);
  const originalSources = sourceSnapshot(root);
  const firstPath = resolve(root, 'dist/noxinfluencer-workbuddy-expert-0.1.3.zip');
  const secondPath = resolve(root, 'dist/expert-second-test.zip');
  const first = await packageExpert({ root });
  const second = await packageExpert({ root, output: secondPath, version: '0.1.3' });
  assert.equal(first.path, firstPath);
  assert.equal(second.path, secondPath);
  const firstBytes = readFileSync(firstPath);
  assert.deepEqual(readFileSync(secondPath), firstBytes);
  assert.equal(first.sha256, createHash('sha256').update(firstBytes).digest('hex'));
  assert.equal(second.sha256, first.sha256);

  const entries = readZipEntries(firstPath);
  validateExpertEntries(entries);
  assert.equal(JSON.parse(entries.get(manifestPath)).version, '0.1.3');
  assert.equal(JSON.parse(entries.get(manifestPath)).name, 'influencer-marketing-manager');
  assert.equal(first.files, entries.size);
  assert.equal(second.files, entries.size);
  for (const name of [productName, managerName]) {
    const path = `skills/${name}/SKILL.md`;
    assert.ok(entries.has(path), `Missing packaged Skill: ${path}`);
    const frontmatter = entries.get(path).toString().match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter);
    assert.equal(parseDocument(frontmatter[1]).get('name'), name);
  }
  assert.ok(entries.has(`skills/${productName}/references/oauth-and-scopes.md`));
  assert.ok(entries.has(`skills/${managerName}/references/playbook.md`));
  for (const path of [manifestPath, agentPath, 'avatars/expert.png', 'README.md']) assert.ok(entries.has(path), path);
  assert.deepEqual(JSON.parse(entries.get(manifestPath)).dependencies.connectors, ['noxinfluencer-mcp']);

  for (const path of entries.keys()) {
    assert.ok(!/^skills\/(?:noxinfluencer|noxinfluencer-v2|noxinfluencer-mcp|influencer-marketing-manager)\//.test(path), `Unexpected legacy Skill: ${path}`);
    assert.ok(!/(?:^|\/)(?:evals|node_modules|\.codex-plugin)(?:\/|$)/.test(path), `Unexpected development resource: ${path}`);
    assert.ok(!/(?:^|\/)(?:\.mcp\.json|mcp\.json|connector-meta\.json|start-codex-oauth\.ps1)$/.test(path), `Expert bundles its own connector or Codex OAuth: ${path}`);
    assert.doesNotMatch(path, /\/tool-parameters-[\w-]+\.md$/);
  }
  assert.deepEqual(sourceSnapshot(root), originalSources);
});
