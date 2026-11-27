import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync, renameSync, existsSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { build, createOutputs, repositoryRoot, assertPublicFile } from '../scripts/build.mjs';
import { createFileRecord, readDirectoryFileMap } from '../scripts/lib/canonical-files.mjs';
import { packageV2 } from '../scripts/package.mjs';
import { readZipEntries } from './helpers/zip-reader.mjs';
import { updateSnapshot } from '../scripts/update-snapshot.mjs';

/** 构造不依赖私仓的最小公开维护工程，用于真实生成、漂移和回滚检查。 */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'nox-v2-public-'));
  // Copy the public delivery surface, excluding ignored machine-local tooling.
  for (const path of ['v2/source', 'skills/influencer-marketing-manager',
    '.grok-plugin/marketplace.json', '.claude-plugin/marketplace.json', '.workbuddy-plugin/marketplace.json', '.agents/plugins/marketplace.json',
    ...['.codex-plugin', '.plugin', '.workbuddy-plugin', '.mcp.json', 'assets', 'skills'].map(path => `plugins/noxinfluencer/${path}`)]) {
    mkdirSync(dirname(resolve(root, path)), { recursive: true });
    cpSync(resolve(repositoryRoot, path), resolve(root, path), { recursive: true });
  }
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function assertManagerProductBinding(manager, root, productSkill) {
  const shared = readDirectoryFileMap(resolve(root, 'skills/influencer-marketing-manager'));
  assert.deepEqual(manager, new Map([...shared].map(([path, bytes]) => [
    path, path.endsWith('.md') ? Buffer.from(bytes.toString().replaceAll('`noxinfluencer-v2`', `\`${productSkill}\``)) : bytes,
  ])));
  assert.ok(manager.get('SKILL.md').toString().includes(`Otherwise use the \`${productSkill}\` product Skill`));
}

function originalChannelFiles(root) {
  const files = new Map();
  for (const prefix of ['plugins/noxinfluencer', '.claude-plugin', '.agents/plugins']) {
    for (const [path, bytes] of readDirectoryFileMap(resolve(root, prefix))) {
      if (prefix === 'plugins/noxinfluencer' && path.startsWith('.grok-plugin/')) continue;
      files.set(`${prefix}/${path}`, bytes);
    }
  }
  return files;
}

test('Grok selects the shared plugin root and preserves existing channel files', t => {
  const root = fixture(t);
  const original = originalChannelFiles(root);
  const marketplacePath = resolve(root, '.grok-plugin/marketplace.json');
  const marketplaceBefore = readFileSync(marketplacePath);
  build({ root });
  const marketplace = JSON.parse(readFileSync(marketplacePath));
  const entry = marketplace.plugins.find(plugin => plugin.name === 'noxinfluencer');
  assert.ok(entry, 'Grok marketplace must advertise the shared NoxInfluencer plugin');
  assert.equal(entry.source, './plugins/noxinfluencer');
  const pluginRoot = resolve(root, entry.source);
  assert.equal(pluginRoot, resolve(root, 'plugins/noxinfluencer'));
  assert.notEqual(pluginRoot, resolve(root, 'plugins/noxinfluencer/.plugin'));
  const manifestPath = resolve(pluginRoot, '.grok-plugin/plugin.json');
  assert.equal(dirname(dirname(manifestPath)), pluginRoot);
  const manifest = JSON.parse(readFileSync(manifestPath));
  assert.deepEqual(manifest, JSON.parse(readFileSync(resolve(pluginRoot, '.plugin/plugin.json'))));
  assert.equal(manifest.name, 'noxinfluencer');
  assert.equal(manifest.version, entry.version);
  for (const name of ['noxinfluencer-mcp', 'influencer-marketing-manager']) {
    const skill = readFileSync(resolve(pluginRoot, 'skills', name, 'SKILL.md'), 'utf8');
    assert.match(skill, new RegExp(`^name: ${name}\\r?$`, 'm'));
  }
  const mcp = JSON.parse(readFileSync(resolve(pluginRoot, '.mcp.json')));
  assert.equal(mcp.mcpServers.noxinfluencer.type, 'http');
  assert.equal(mcp.mcpServers.noxinfluencer.url, 'https://skill.noxinfluencer.com/mcp');
  assert.deepEqual(originalChannelFiles(root), original);
  assert.deepEqual(readFileSync(marketplacePath), marketplaceBefore);
  build({ root, check: true });
  assert.deepEqual(originalChannelFiles(root), original);
});

test('Grok manifest drift is checked without changing existing channel files', t => {
  const root = fixture(t);
  build({ root });
  const original = originalChannelFiles(root);
  const path = resolve(root, 'plugins/noxinfluencer/.grok-plugin/plugin.json');
  writeFileSync(path, 'Grok manifest drift\n');
  assert.throws(() => build({ root, check: true }), /Configuration drift/);
  assert.equal(readFileSync(path, 'utf8'), 'Grok manifest drift\n');
  assert.deepEqual(originalChannelFiles(root), original);
});

test('WorkBuddy gets a recognized manifest and a checked Agent template', t => {
  const root = fixture(t);
  const marketplacePath = resolve(root, '.workbuddy-plugin/marketplace.json');
  const marketplaceBefore = readFileSync(marketplacePath);
  const marketplace = JSON.parse(marketplaceBefore);
  const entry = marketplace.plugins.find(plugin => plugin.name === 'noxinfluencer');
  assert.equal(marketplace.name, 'noxinfluencer-plugins');
  assert.ok(entry);
  assert.equal(entry.source, './plugins/noxinfluencer');
  assert.equal(resolve(root, entry.source), resolve(root, 'plugins/noxinfluencer'));
  const path = resolve(root, 'plugins/noxinfluencer/.workbuddy-plugin/plugin.json');
  rmSync(path);
  build({ root });
  assert.deepEqual(readFileSync(path), readFileSync(resolve(root, 'plugins/noxinfluencer/.plugin/plugin.json')));
  assert.equal(JSON.parse(readFileSync(path)).version, entry.version);
  assert.deepEqual(readFileSync(marketplacePath), marketplaceBefore);
  const template = resolve(root, 'plugins/noxinfluencer/.workbuddy-plugin/expert-agent.md.tmpl');
  const source = resolve(root, 'v2/source/noxinfluencer/adapters/mcp/workbuddy-expert-agent.md');
  assert.deepEqual(readFileSync(template), readFileSync(source));
  build({ root, check: true });
  const manifestBytes = readFileSync(path);
  writeFileSync(path, 'WorkBuddy manifest drift\n');
  assert.throws(() => build({ root, check: true }), /Configuration drift.*plugin\.json/);
  assert.equal(readFileSync(path, 'utf8'), 'WorkBuddy manifest drift\n');
  writeFileSync(path, manifestBytes);
  writeFileSync(template, 'WorkBuddy Agent template drift\n');
  assert.throws(() => build({ root, check: true }), /Configuration drift.*expert-agent\.md\.tmpl/);
  assert.equal(readFileSync(template, 'utf8'), 'WorkBuddy Agent template drift\n');
});

test('one business source produces both runtimes and preserves shared Manager business bytes', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  const generic = first.outputs.get('skills/noxinfluencer-v2');
  const mcp = first.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const mcpSpecific = new Set(['references/creator.md', 'references/monitor.md', 'references/campaign-agent-automation.md', 'references/tool-list.md']);
  for (const [path, bytes] of generic) if (path.startsWith('references/') && mcp.has(path) && !mcpSpecific.has(path)) assert.equal(bytes.toString(), mcp.get(path).toString(), path);
  assert.equal(generic.has('scripts/nox-cli.mjs'), true);
  assert.equal(mcp.has('scripts/nox-cli.mjs'), false);
  assert.equal(generic.has('references/runtime-cli.md'), true);
  assert.equal(mcp.has('references/runtime-cli.md'), false);
  assertManagerProductBinding(first.outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager'), root, 'noxinfluencer-mcp');
  const path = resolve(root, 'v2/source/noxinfluencer/shared/references/creator.md');
  writeFileSync(path, readFileSync(path)+'\nUse current evidence for this creator decision.\n');
  const next = createOutputs(root);
  assert.notDeepEqual(next.outputs.get('skills/noxinfluencer-v2'), generic);
  assert.notDeepEqual(next.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'), mcp);
});

test('CLI adapter changes do not change the fixed MCP artifact', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  const path = resolve(root,'v2/source/noxinfluencer/adapters/cli/files.md');
  writeFileSync(path, readFileSync(path)+'\nPreserve the chosen local destination.\n');
  const next = createOutputs(root);
  assert.notDeepEqual(first.outputs.get('skills/noxinfluencer-v2'), next.outputs.get('skills/noxinfluencer-v2'));
  assert.notDeepEqual(first.outputs.get('skills/noxinfluencer-cli'), next.outputs.get('skills/noxinfluencer-cli'));
  assert.deepEqual(first.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'), next.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'));
});

test('the fixed CLI Skill reuses shared and CLI files and ships its own entrypoint', t => {
  const root = fixture(t);
  const { outputs } = createOutputs(root);
  const cli = outputs.get('skills/noxinfluencer-cli');
  const universal = outputs.get('skills/noxinfluencer-v2');
  const entrypoint = cli.get('SKILL.md').toString();
  assert.match(entrypoint, /^name: noxinfluencer-cli$/m);
  assert.match(entrypoint, /Use the isolated NoxInfluencer V2 CLI for every NoxInfluencer operation/);
  assert.match(entrypoint, /Pause account operations and their result files when account authorization is missing or the connection drops/);
  assert.doesNotMatch(entrypoint, /Runtime Selection|runtime-mcp\.md/);
  assert.match(cli.get('references/auth.md').toString(), /nox-cli\.mjs" --install/);

  const manifest = JSON.parse(cli.get('skill-build-manifest.json'));
  assert.equal(manifest.runtime, 'cli');
  assert.ok(manifest.source_files.some(({ path }) => path === 'shared/core.md'));
  assert.ok(manifest.source_files.some(({ path }) => path === 'cli.md'));
  assert.ok(manifest.source_files.some(({ path }) => path === 'snapshots/cli-schema.json'));
  assert.ok(manifest.source_files.every(({ path }) => !/^(?:adapters\/(?:mcp|plugin)\/|snapshots\/mcp-)/.test(path)));
  for (const path of ['references/creator.md', 'references/campaign-agent-automation-cli.md',
    'scripts/nox-cli.mjs', 'cli-package.json', 'campaign-runtime-contract.json']) {
    assert.ok(cli.has(path), path);
    assert.deepEqual(cli.get(path), universal.get(path));
  }
  for (const path of ['references/setup.md', 'references/runtime-mcp.md', 'references/tool-list.md', 'scripts/start-codex-oauth.ps1']) {
    assert.ok(universal.has(path), path);
    assert.equal(cli.has(path), false, path);
  }
  for (const [path, bytes] of cli) {
    if (path.endsWith('.md')) assert.doesNotMatch(bytes.toString(), /\bMCP\b/, path);
  }
  for (const record of manifest.output_files) assert.deepEqual(record, createFileRecord(record.path, cli.get(record.path)));
});

test('the MCP adapter feeds both packaging targets and stays out of the CLI artifact', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  for (const resource of ['oauth-and-scopes.md', 'handoffs.md', 'tool-execution.md', 'runtime.md']) {
    const source = resolve(root, 'v2/source/noxinfluencer/adapters/mcp', resource);
    writeFileSync(source, readFileSync(source, 'utf8') + '\nShared MCP revision.\n');
  }
  const next = createOutputs(root);
  for (const path of ['skills/noxinfluencer-v2', 'plugins/noxinfluencer/skills/noxinfluencer-mcp']) {
    assert.notDeepEqual(next.outputs.get(path), first.outputs.get(path));
    for (const name of ['oauth-and-scopes', 'handoffs', 'tool-execution', 'runtime-mcp']) {
      const guide = next.outputs.get(path).get(`references/${name}.md`);
      assert.match(guide.toString(), /Shared MCP revision/);
      assert.deepEqual(guide, next.outputs.get('skills/noxinfluencer-v2').get(`references/${name}.md`));
    }
  }
  assert.deepEqual(next.outputs.get('skills/noxinfluencer-cli'), first.outputs.get('skills/noxinfluencer-cli'));
  const mcp = next.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  assert.doesNotMatch(mcp.get('SKILL.md').toString(), /## Runtime Selection/);
  for (const [path, bytes] of mcp) {
    if (path.endsWith('.md')) assert.doesNotMatch(bytes.toString(), /nox-cli\.mjs|@noxinfluencer\/cli|references\/runtime-cli\.md/, path);
  }
});

test('changes to Manager guidance reach the bundled Manager through its single source', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  const path = resolve(root, 'skills/influencer-marketing-manager/SKILL.md');
  writeFileSync(path, readFileSync(path) + '\nShared Manager revision.\n');
  const next = createOutputs(root);
  assert.deepEqual(next.outputs.get('skills/noxinfluencer-v2'), first.outputs.get('skills/noxinfluencer-v2'));
  assert.deepEqual(next.outputs.get('skills/noxinfluencer-cli'), first.outputs.get('skills/noxinfluencer-cli'));
  assert.deepEqual(next.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'),
    first.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'));
  assert.notDeepEqual(next.outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager'),
    first.outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager'));
  assertManagerProductBinding(next.outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager'), root, 'noxinfluencer-mcp');
});

test('generated hashes cover actual final bytes and repeated builds are deterministic', t => {
  const root = fixture(t);
  build({ root });
  const first = readDirectoryFileMap(resolve(root,'skills/noxinfluencer-v2'));
  const manifest = JSON.parse(first.get('skill-build-manifest.json'));
  for (const record of manifest.output_files) assert.deepEqual(record, createFileRecord(record.path, first.get(record.path)));
  build({ root });
  assert.deepEqual(readDirectoryFileMap(resolve(root,'skills/noxinfluencer-v2')), first);
  build({ root, check: true });
});

test('check mode reports drift without modifying files', t => {
  const root = fixture(t);
  build({ root });
  const path = resolve(root,'skills/noxinfluencer-v2/SKILL.md');
  writeFileSync(path, 'drift');
  assert.throws(() => build({ root, check: true }), /drift/);
  assert.equal(readFileSync(path).toString(), 'drift');
});

test('invalid snapshot and a broken relative link fail before any output mutation', t => {
  const root = fixture(t);
  build({ root });
  const snapshot = resolve(root,'v2/source/noxinfluencer/snapshots/mcp-tools.json');
  const original = readFileSync(snapshot);
  writeFileSync(snapshot, '{}');
  const output = resolve(root,'skills/noxinfluencer-v2');
  const first = readDirectoryFileMap(output);
  assert.throws(() => build({ root }));
  assert.deepEqual(readDirectoryFileMap(output), first);
  writeFileSync(snapshot, original);
  const entry = resolve(root,'v2/source/noxinfluencer/universal.md');
  writeFileSync(entry, readFileSync(entry)+'\n[Missing](references/not-shipped.md)\n');
  assert.throws(() => build({ root }), /Missing Skill resource/);
  assert.deepEqual(readDirectoryFileMap(output), first);
});

test('atomic failure restores every output target', t => {
  const root = fixture(t);
  build({ root });
  const before = readDirectoryFileMap(resolve(root,'plugins/noxinfluencer'));
  let attempts = 0;
  assert.throws(() => build({ root, operations: { rename(from, to) {
    if (from.includes('.incoming-') && ++attempts === 2) throw new Error('Injected commit failure');
    renameSync(from,to);
  } } }), /Injected/);
  assert.deepEqual(readDirectoryFileMap(resolve(root,'plugins/noxinfluencer')), before);
});

test('source junctions and internal-only input are rejected before generation', t => {
  const root = fixture(t);
  const path = resolve(root,'v2/source/noxinfluencer/shared/references/creator.md');
  writeFileSync(path,'https://192.168.1.2/internal');
  assert.throws(() => build({ root }), /Non-public/);
  const old = resolve(root,'v2/source/noxinfluencer/shared');
  renameSync(old, old+'-original');
  symlinkSync(old+'-original',old, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => build({ root }), /link|junction/i);
});

test('public content guard rejects credentials, internal modules and concrete local paths', () => {
  for (const value of ['api_key='+'x'.repeat(24), 'codex_controller', 'https://172.16.1.2/foo', 'C:\\Users\\someone\\secret.txt']) {
    assert.throws(() => assertPublicFile('case.md',Buffer.from(value)));
  }
});

test('standalone packaging has no source/evals/CLI adapter in the MCP package', async t => {
  const root = fixture(t);
  const originalEntries = readDirectoryFileMap(resolve(root, 'plugins/noxinfluencer'));
  build({ root });
  assert.equal(existsSync(resolve(root, 'plugins/noxinfluencer/.grok-plugin/plugin.json')), true);
  const ignoredRoot = resolve(root, 'plugins/noxinfluencer/.codex-local/history');
  mkdirSync(ignoredRoot, { recursive: true });
  for (let i = 0; i < 270; i++) writeFileSync(resolve(ignoredRoot, `ignored-${i}.txt`), 'Local-only historical file');
  const first = await packageV2({ root });
  const entries = readZipEntries(resolve(root,'v2/dist/noxinfluencer-mcp-plugin.zip'));
  assert.equal([...entries.keys()].some(path => path.startsWith('.grok-plugin/')), false);
  assert.deepEqual(entries, originalEntries, 'The ZIP must retain the shared delivery files and bytes');
  assert.deepEqual(entries.get('.workbuddy-plugin/plugin.json'), entries.get('.plugin/plugin.json'));
  assert.equal(JSON.parse(entries.get('.mcp.json')).mcpServers.noxinfluencer.type, 'http');
  const toolListPath = 'skills/noxinfluencer-mcp/references/tool-list.md';
  assert.deepEqual(entries.get(toolListPath), readFileSync(resolve(root, 'plugins/noxinfluencer', toolListPath)));
  assert.equal(entries.has('resources/mcp-tools.json'), false);
  assert.equal(entries.has('skills/noxinfluencer-mcp/SKILL.md'), true);
  assert.equal(entries.has('skills/influencer-marketing-manager/SKILL.md'), true);
  const pluginSkill = 'skills/noxinfluencer-mcp/';
  assert.match(entries.get(pluginSkill + 'SKILL.md').toString(), /## Campaign presentation[\s\S]*references\/handoffs\.md/);
  assert.deepEqual(entries.get(pluginSkill + 'references/handoffs.md'),
    readFileSync(resolve(root, 'v2/source/noxinfluencer/adapters/mcp/handoffs.md')));
  assert.equal(entries.has('skills/noxinfluencer-mcp/skill-build-manifest.json'), false);
  assert.equal(existsSync(resolve(root, 'plugins/noxinfluencer/skills/noxinfluencer-mcp/skill-build-manifest.json')), false);
  const provenance = JSON.parse(readFileSync(resolve(root, 'v2/dist/noxinfluencer-mcp.skill-build-manifest.json')));
  for (const record of provenance.output_files) {
    assert.deepEqual(record, createFileRecord(record.path, entries.get(`skills/noxinfluencer-mcp/${record.path}`)));
  }
  assert.equal([...entries.keys()].some(path => /(?:^|\/)(?:source|evals)(?:\/|$)|runtime-cli|nox-cli\.mjs|upstream\.md/.test(path)), false);
  assert.equal([...entries.keys()].some(path => /(?:^|\/)(?:node_modules|\.codex-local|dist)(?:\/|$)/.test(path)), false);
  const installed = resolve(root,'standalone-client/plugin');
  for (const [path,bytes] of entries) {
    const destination=resolve(installed,path);
    mkdirSync(dirname(destination),{recursive:true});
    writeFileSync(destination,bytes);
  }
  const manifest=JSON.parse(readFileSync(resolve(installed,'.codex-plugin/plugin.json')));
  assert.equal(existsSync(resolve(installed,manifest.skills,'noxinfluencer-mcp/SKILL.md')),true);
  assertManagerProductBinding(readDirectoryFileMap(resolve(installed,'skills/influencer-marketing-manager')), root, 'noxinfluencer-mcp');
  const before = readFileSync(resolve(root,'v2/dist/noxinfluencer-mcp-plugin.zip'));
  const second = await packageV2({ root });
  assert.deepEqual(first,second);
  assert.deepEqual(before,readFileSync(resolve(root,'v2/dist/noxinfluencer-mcp-plugin.zip')));
  const standalone = readZipEntries(resolve(root,'v2/dist/noxinfluencer-v2.zip'));
  assert.equal(standalone.has('skills/noxinfluencer-v2/skill-build-manifest.json'), true);
  assert.doesNotMatch(standalone.get('skills/noxinfluencer-v2/SKILL.md').toString(), /## Campaign presentation|`cua_repl`/);
  assert.deepEqual(standalone.get('skills/noxinfluencer-v2/references/handoffs.md'),
    readFileSync(resolve(root, 'v2/source/noxinfluencer/adapters/mcp/handoffs.md')));
  const managerPrefix = 'skills/influencer-marketing-manager/';
  const standaloneManager = new Map([...standalone].filter(([path]) => path.startsWith(managerPrefix))
    .map(([path, bytes]) => [path.slice(managerPrefix.length), bytes]));
  assert.deepEqual(standaloneManager, readDirectoryFileMap(resolve(root, 'skills/influencer-marketing-manager')));
  assert.match(standaloneManager.get('SKILL.md').toString(), /Otherwise use the `noxinfluencer-v2` product Skill/);
});

test('snapshot refresh validates before source mutation and leaves generated artifacts for explicit rebuild', t => {
  const root=fixture(t);
  build({root});
  const path=resolve(root,'v2/source/noxinfluencer/snapshots/mcp-tools.json');
  const data=JSON.parse(readFileSync(path));
  const sourceBefore=readDirectoryFileMap(resolve(root,'v2/source/noxinfluencer'));
  const outputBefore=readDirectoryFileMap(resolve(root,'plugins/noxinfluencer'));
  const input=resolve(root,'snapshot-input.json');
  writeFileSync(input,JSON.stringify({...data,items:[]}));
  assert.throws(() => updateSnapshot({root,id:'mcp-tools',input}));
  assert.deepEqual(readDirectoryFileMap(resolve(root,'v2/source/noxinfluencer')),sourceBefore);
  data.source='Reviewed public tool schema export';
  writeFileSync(input,JSON.stringify(data));
  updateSnapshot({root,id:'mcp-tools',input});
  assert.notDeepEqual(readDirectoryFileMap(resolve(root,'v2/source/noxinfluencer')),sourceBefore);
  assert.deepEqual(readDirectoryFileMap(resolve(root,'plugins/noxinfluencer')),outputBefore);
  build({root});
  build({root,check:true});
});

test('build preserves legacy product, connector, root README and the shared Manager source', t => {
  const root=fixture(t);
  const sentinels=['README.md','skills/noxinfluencer/SKILL.md','connectors/noxinfluencer-cli/cli.json'];
  for (const path of sentinels) {
    const destination=resolve(root,path);
    mkdirSync(dirname(destination),{recursive:true});
    writeFileSync(destination,'legacy sentinel '+path);
  }
  const manager=readDirectoryFileMap(resolve(root,'skills/influencer-marketing-manager'));
  build({root});
  for (const path of sentinels) assert.equal(readFileSync(resolve(root,path)).toString(),'legacy sentinel '+path);
  assert.deepEqual(readDirectoryFileMap(resolve(root,'skills/influencer-marketing-manager')),manager);
});
