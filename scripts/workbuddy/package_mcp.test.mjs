import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { createMcpEntries, mcpVersion, packageMcp } from './package_mcp.mjs';
import { readZipEntries } from '../../v2/tests/helpers/zip-reader.mjs';

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const pluginPath = 'plugins/noxinfluencer';
const skillPath = 'skills/noxinfluencer-mcp';
const catalogPath = `${pluginPath}/resources/mcp-tools.json`;
const fixturePrefix = 'nox-workbuddy-mcp-test-';
// Copy only public plugin content, excluding developer caches and node_modules.
const fixturePaths = [
  '.mcp.json', 'assets/icon.png', 'skills/noxinfluencer-mcp', 'resources/mcp-tools.json',
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
  const root = mkdtempSync(join(tmpdir(), fixturePrefix));
  t.after(() => {
    const contained = relative(resolve(tmpdir()), resolve(root));
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    assert.ok(basename(root).startsWith(fixturePrefix));
    rmSync(root, { recursive: true, force: true });
  });
  for (const path of fixturePaths) {
    const target = resolve(root, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repositoryRoot, path), target, { recursive: true });
  }
  return root;
}

function editCatalog(root, edit) {
  const path = resolve(root, catalogPath);
  const catalog = JSON.parse(readFileSync(path));
  edit(catalog);
  writeFileSync(path, JSON.stringify(catalog, null, 2) + '\n');
}

function toolNames(markdown) {
  return [...markdown.matchAll(/^- `([^`]+)`\s*$/gm)].map(match => match[1]);
}

let assembled;
before(() => { assembled = createMcpEntries(); });

test('MCP assembles entirely from public plugin content without standalone content sources', t => {
  const root = fixture(t);
  const originalSources = sourceSnapshot(root);
  for (const path of ['experts', 'v2/source', 'skills', 'scripts/workbuddy/mcp']) {
    assert.equal(existsSync(resolve(root, path)), false, path);
  }
  const result = createMcpEntries({ root });
  assert.equal(result.entries.size, 35);
  assert.equal(result.toolCount, 167);
  assert.ok(result.inputs.length > 0);
  assert.ok(result.inputs.every(path => path.startsWith(`${pluginPath}/`)), JSON.stringify(result.inputs));
  assert.equal(result.entries.get('icon.png').equals(readFileSync(resolve(root, pluginPath, 'assets/icon.png'))), true);
  assert.deepEqual(sourceSnapshot(root), originalSources);
});

test('MCP retains the published connector identity, HTTPS transport and host-managed OAuth configuration', () => {
  const meta = JSON.parse(assembled.entries.get('connector-meta.json'));
  assert.deepEqual(meta, assembled.meta);
  assert.equal(meta.source, 'noxinfluencer-mcp');
  assert.equal(meta.name, 'Nox 聚星红人营销 MCP');
  assert.equal(meta.type, 'mcp');
  assert.equal(meta.auth_mode, 'server-side');
  assert.deepEqual(meta.server_auth, {
    auth_type: 'mcp_oauth',
    data: { mcp_oauth: { server_url: 'https://skill.noxinfluencer.com/mcp', scopes: 'noxinfluencer.agent.user' } },
  });
  for (const name of ['client_id', 'client_secret', 'redirect_uri']) {
    assert.equal(Object.hasOwn(meta.server_auth.data.mcp_oauth, name), false);
  }
  assert.deepEqual(JSON.parse(assembled.entries.get('mcp.json')), {
    mcpServers: { 'noxinfluencer-mcp': { type: 'streamableHttp', url: 'https://skill.noxinfluencer.com/mcp', timeout: 30000 } },
  });
  assert.ok(meta.examples_zh.length > 0);
  assert.ok(meta.examples_en.length > 0);
});

test('MCP defaults to 1.0.4 and can reproduce 1.0.3 metadata without changing any other entry', () => {
  assert.equal(mcpVersion, '1.0.4');
  assert.equal(assembled.meta.version, mcpVersion);
  const previous = createMcpEntries({ version: '1.0.3' });
  assert.equal(previous.meta.version, '1.0.3');
  assert.deepEqual({ ...previous.meta, version: mcpVersion }, assembled.meta);
  assert.deepEqual([...previous.entries.keys()].sort(), [...assembled.entries.keys()].sort());
  for (const [path, bytes] of previous.entries) {
    if (path !== 'connector-meta.json') assert.deepEqual(bytes, assembled.entries.get(path), path);
  }
  assert.throws(() => createMcpEntries({ version: 'not-a-version' }), /version/i);
});

test('MCP includes one correctly named Skill and documents every catalogued tool across ten parameter references', () => {
  const skill = assembled.entries.get(`${skillPath}/SKILL.md`).toString();
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter);
  assert.equal(parseDocument(frontmatter[1]).get('name'), 'noxinfluencer-mcp');
  assert.deepEqual([...assembled.entries.keys()].filter(path => /^skills\/[^/]+\/SKILL\.md$/.test(path)), [`${skillPath}/SKILL.md`]);
  const catalog = JSON.parse(readFileSync(resolve(repositoryRoot, catalogPath)));
  assert.equal(catalog.schema_version, 1);
  assert.equal(catalog.tools.length, 167);
  const expectedNames = catalog.tools.map(tool => tool.name).sort();
  const listedNames = toolNames(assembled.entries.get(`${skillPath}/references/tool-list.md`).toString());
  assert.deepEqual(listedNames.sort(), expectedNames);
  const references = [...assembled.entries.keys()].filter(path => /\/references\/tool-parameters-[a-z0-9-]+\.md$/.test(path));
  assert.equal(references.length, 10);
  const documentedNames = references.flatMap(path => [...assembled.entries.get(path).toString().matchAll(/^## `([^`]+)`\s*$/gm)].map(match => match[1]));
  assert.deepEqual(documentedNames.sort(), expectedNames);
  assert.equal(new Set(documentedNames).size, 167);
});

test('MCP omits Manager and Codex OAuth execution while preserving the prohibition on CLI fallback', () => {
  for (const [path, bytes] of assembled.entries) {
    assert.doesNotMatch(path, /influencer-marketing-manager|start-codex-oauth|(?:^|\/)scripts\//i);
    if (!path.endsWith('.md')) continue;
    assert.doesNotMatch(bytes.toString(), /influencer-marketing-manager|\bManager examples\b|codex mcp login|start-codex-oauth|noxinfluencer\.codex\.user/i, path);
  }
  assert.match(assembled.entries.get(`${skillPath}/SKILL.md`).toString(), /Do not install or fall back to a business CLI/);
  assert.match(assembled.entries.get(`${skillPath}/references/tool-execution.md`).toString(), /Never invent a missing tool or fall back to CLI/);
  assert.match(assembled.entries.get(`${skillPath}/references/tool-execution.md`).toString(), /source: `noxinfluencer-mcp`/);
  assert.doesNotMatch(assembled.entries.get(`${skillPath}/references/tool-execution.md`).toString(), /connected `noxinfluencer` provider/);
  const oauth = assembled.entries.get(`${skillPath}/references/oauth-and-scopes.md`).toString();
  assert.match(oauth, /WorkBuddy/);
  assert.match(oauth, /native|连接|Connect/);
});

test('MCP takes reference and tool-description edits from the actual plugin without generated-source drift checks', t => {
  const root = fixture(t);
  const reference = resolve(root, pluginPath, 'skills/noxinfluencer-mcp/references/creator.md');
  writeFileSync(reference, readFileSync(reference) + '\nPlugin-directory-reference-proof.\n');
  editCatalog(root, catalog => { catalog.tools[0].description = 'Plugin-directory-tool-purpose-proof.'; });
  const result = createMcpEntries({ root });
  assert.match(result.entries.get(`${skillPath}/references/creator.md`).toString(), /Plugin-directory-reference-proof/);
  const parameterText = [...result.entries].filter(([path]) => /tool-parameters-/.test(path)).map(([, bytes]) => bytes.toString()).join('\n');
  assert.match(parameterText, /Plugin-directory-tool-purpose-proof/);
});

test('MCP rejects duplicate names in the plugin tool catalog', t => {
  const root = fixture(t);
  editCatalog(root, catalog => { catalog.tools.push(structuredClone(catalog.tools[0])); });
  assert.throws(() => createMcpEntries({ root }), /duplicate/i);
});

test('MCP rejects a catalog tool without its human-readable purpose', t => {
  const root = fixture(t);
  editCatalog(root, catalog => { delete catalog.tools[0].description; });
  assert.throws(() => createMcpEntries({ root }), /description|purpose/i);
});

test('MCP rejects malformed parameter schemas instead of emitting incomplete documentation', t => {
  const root = fixture(t);
  editCatalog(root, catalog => { catalog.tools[0].input_schema = { type: 'object', properties: [] }; });
  assert.throws(() => createMcpEntries({ root }), /schema|properties/i);
});

test('MCP rejects a source Skill tool list that differs from the canonical plugin catalog', t => {
  const root = fixture(t);
  const path = resolve(root, pluginPath, 'skills/noxinfluencer-mcp/references/tool-list.md');
  const firstTool = JSON.parse(readFileSync(resolve(root, catalogPath))).tools[0].name;
  const original = readFileSync(path, 'utf8');
  const changed = original.replace(`- \`${firstTool}\``, '- `missing_catalog_tool_for_test`');
  assert.notEqual(changed, original);
  writeFileSync(path, changed);
  assert.throws(() => createMcpEntries({ root }), /catalog|tool.list|tool list|mismatch/i);
});

test('two independently written MCP ZIPs are deterministic, complete and leave plugin inputs unchanged', async t => {
  const root = fixture(t);
  const originalSources = sourceSnapshot(root);
  const firstPath = resolve(root, 'dist/mcp-first-test.zip');
  const secondPath = resolve(root, 'dist/mcp-second-test.zip');
  const first = await packageMcp({ root, outputPath: firstPath });
  const second = await packageMcp({ root, outputPath: secondPath });
  assert.equal(first.path, firstPath);
  assert.equal(second.path, secondPath);
  assert.equal(first.version, mcpVersion);
  assert.equal(first.tools, 167);
  assert.equal(first.files, 35);
  const bytes = readFileSync(firstPath);
  assert.deepEqual(readFileSync(secondPath), bytes);
  assert.equal(first.sha256, createHash('sha256').update(bytes).digest('hex'));
  assert.equal(second.sha256, first.sha256);
  const entries = readZipEntries(firstPath);
  assert.deepEqual(entries, createMcpEntries({ root }).entries);
  assert.equal(entries.size, first.files);
  assert.equal(JSON.parse(entries.get('connector-meta.json')).version, mcpVersion);
  assert.deepEqual(sourceSnapshot(root), originalSources);
});
