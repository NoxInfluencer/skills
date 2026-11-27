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
const toolListPath = `${skillPath}/references/tool-list.md`;
const fixturePrefix = 'nox-workbuddy-mcp-test-';
// Copy only public plugin content, excluding developer caches and node_modules.
const fixturePaths = [
  '.mcp.json', 'assets/icon.png', skillPath,
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

test('MCP includes one correctly named Skill with generated documentation for every listed tool', () => {
  const skill = assembled.entries.get(`${skillPath}/SKILL.md`).toString();
  const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter);
  assert.equal(parseDocument(frontmatter[1]).get('name'), 'noxinfluencer-mcp');
  assert.deepEqual([...assembled.entries.keys()].filter(path => /^skills\/[^/]+\/SKILL\.md$/.test(path)), [`${skillPath}/SKILL.md`]);
  const original = readFileSync(resolve(repositoryRoot, pluginPath, toolListPath), 'utf8');
  const packaged = assembled.entries.get(toolListPath).toString();
  assert.equal(packaged, original.replaceAll('{baseDir}/references/', '@references/')
    .replaceAll('`references/handoffs.md`', '`@references/handoffs.md`'));
  assert.equal(toolNames(packaged).length, 167);
  const documented = [...packaged.matchAll(/@(references\/tool-parameters-[\w-]+\.md)/g)].flatMap(([, path]) => {
    const packagedReference = assembled.entries.get(`${skillPath}/${path}`);
    assert.deepEqual(packagedReference, readFileSync(resolve(repositoryRoot, pluginPath, skillPath, path)));
    return [...packagedReference.toString().matchAll(/^## `([^`]+)`$/gm)].map(([, name]) => name);
  });
  assert.deepEqual(documented.sort(), toolNames(packaged).sort());
  assert.ok(![...assembled.entries.keys()].some(path => /mcp-tools\.json$/.test(path)));
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
  assert.match(oauth, /^## Common Host Connection Setup$/m);
  assert.match(oauth, /^## WorkBuddy Authorization$/m);
  assert.doesNotMatch(oauth, /^## (?:Codex Authorization Only|Other Hosts)$/m);
  assert.match(oauth, /native|连接|Connect/);
});

test('MCP packages changes to the plugin references and tool list directly', t => {
  const root = fixture(t);
  const reference = resolve(root, pluginPath, skillPath, 'references/creator.md');
  writeFileSync(reference, readFileSync(reference) + '\nPlugin-directory-reference-proof.\n');
  const path = resolve(root, pluginPath, toolListPath);
  const original = readFileSync(path, 'utf8');
  const [firstTool] = toolNames(original);
  writeFileSync(path, original.replace(`- \`${firstTool}\``, '- `plugin_directory_tool_proof`'));
  const result = createMcpEntries({ root });
  assert.match(result.entries.get(`${skillPath}/references/creator.md`).toString(), /Plugin-directory-reference-proof/);
  assert.match(result.entries.get(toolListPath).toString(), /^- `plugin_directory_tool_proof`$/m);
});

test('MCP rejects a missing plugin tool list', t => {
  const root = fixture(t);
  rmSync(resolve(root, pluginPath, toolListPath));
  assert.throws(() => createMcpEntries({ root }), /Missing plugin OAuth\/tool-list resource/);
});

test('MCP rejects an empty list or duplicate tool names', t => {
  const root = fixture(t);
  const path = resolve(root, pluginPath, toolListPath);
  const original = readFileSync(path, 'utf8');
  const [firstTool] = toolNames(original);
  writeFileSync(path, original + `\n- \`${firstTool}\`\n`);
  assert.throws(() => createMcpEntries({ root }), /unique tool names/);
  writeFileSync(path, '# MCP Tool List\n');
  assert.throws(() => createMcpEntries({ root }), /at least one tool/);
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
