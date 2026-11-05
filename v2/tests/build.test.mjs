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
    ...['.codex-plugin', '.plugin', '.mcp.json', 'assets', 'skills'].map(path => `plugins/noxinfluencer/${path}`)]) {
    mkdirSync(dirname(resolve(root, path)), { recursive: true });
    cpSync(resolve(repositoryRoot, path), resolve(root, path), { recursive: true });
  }
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function assertManagerBusinessUnchanged(pluginManager, root) {
  const shared = readDirectoryFileMap(resolve(root, 'skills/influencer-marketing-manager'));
  const policy = readFileSync(resolve(root, 'v2/source/noxinfluencer/adapters/plugin/manager-context.md'), 'utf8').trim();
  const stripped = new Map(pluginManager);
  stripped.set('SKILL.md', Buffer.from(stripped.get('SKILL.md').toString().replace('\n' + policy + '\n\n', '')));
  assert.deepEqual(stripped, shared);
}

test('one business source produces both runtimes and preserves shared Manager business bytes', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  const generic = first.outputs.get('v2/skills/noxinfluencer-v2');
  const mcp = first.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const mcpSpecific = new Set(['references/product-overview.md', 'references/files-and-exports.md', 'references/quota-pricing-dispute-feedback.md', 'references/creator.md', 'references/monitor.md', 'references/campaign-agent-automation.md', 'references/campaign-agent-automation-mcp.md', 'references/handoffs.md', 'references/oauth-and-scopes.md', 'references/runtime-mcp.md', 'references/codex-plugin-runtime.md', 'references/tool-execution.md', 'references/tool-list.md']);
  for (const [path, bytes] of generic) if (path.startsWith('references/') && mcp.has(path) && !mcpSpecific.has(path)) assert.equal(bytes.toString(), mcp.get(path).toString(), path);
  assert.equal(generic.has('scripts/nox-cli.mjs'), true);
  assert.equal(mcp.has('scripts/nox-cli.mjs'), false);
  assert.equal(generic.has('references/runtime-cli.md'), true);
  assert.equal(mcp.has('references/runtime-cli.md'), false);
  assertManagerBusinessUnchanged(first.outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager'), root);
  const path = resolve(root, 'v2/source/noxinfluencer/shared/references/creator.md');
  writeFileSync(path, readFileSync(path)+'\nUse current evidence for this creator decision.\n');
  const next = createOutputs(root);
  assert.notDeepEqual(next.outputs.get('v2/skills/noxinfluencer-v2'), generic);
  assert.notDeepEqual(next.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'), mcp);
});

test('CLI adapter changes do not change the fixed MCP artifact', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  const path = resolve(root,'v2/source/noxinfluencer/adapters/cli/files.md');
  writeFileSync(path, readFileSync(path)+'\nPreserve the chosen local destination.\n');
  const next = createOutputs(root);
  assert.notDeepEqual(first.outputs.get('v2/skills/noxinfluencer-v2'), next.outputs.get('v2/skills/noxinfluencer-v2'));
  assert.deepEqual(first.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'), next.outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp'));
});

test('plugin presentation and authorization overrides cannot change standalone outputs or sources', t => {
  const root = fixture(t);
  const first = createOutputs(root);
  const sharedManager = readDirectoryFileMap(resolve(root, 'skills/influencer-marketing-manager'));
  for (const name of ['handoffs.md', 'oauth-and-scopes.md', 'manager-context.md', 'references/campaign-agent-automation-mcp.md']) {
    const path = resolve(root, 'v2/source/noxinfluencer/adapters/plugin', name);
    writeFileSync(path, readFileSync(path) + '\nPlugin-only policy revision.\n');
  }
  const next = createOutputs(root);
  assert.deepEqual(next.outputs.get('v2/skills/noxinfluencer-v2'), first.outputs.get('v2/skills/noxinfluencer-v2'));
  assert.deepEqual(readDirectoryFileMap(resolve(root, 'skills/influencer-marketing-manager')), sharedManager);
  for (const path of ['plugins/noxinfluencer/skills/noxinfluencer-mcp', 'plugins/noxinfluencer/skills/influencer-marketing-manager']) {
    assert.notDeepEqual(next.outputs.get(path), first.outputs.get(path));
  }
});

test('generated hashes cover actual final bytes and repeated builds are deterministic', t => {
  const root = fixture(t);
  build({ root });
  const first = readDirectoryFileMap(resolve(root,'v2/skills/noxinfluencer-v2'));
  const manifest = JSON.parse(first.get('skill-build-manifest.json'));
  for (const record of manifest.output_files) assert.deepEqual(record, createFileRecord(record.path, first.get(record.path)));
  build({ root });
  assert.deepEqual(readDirectoryFileMap(resolve(root,'v2/skills/noxinfluencer-v2')), first);
  build({ root, check: true });
});

test('check mode reports drift without modifying files', t => {
  const root = fixture(t);
  build({ root });
  const path = resolve(root,'v2/skills/noxinfluencer-v2/SKILL.md');
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
  const output = resolve(root,'v2/skills/noxinfluencer-v2');
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
  build({ root });
  const ignoredRoot = resolve(root, 'plugins/noxinfluencer/.codex-local/history');
  mkdirSync(ignoredRoot, { recursive: true });
  for (let i = 0; i < 270; i++) writeFileSync(resolve(ignoredRoot, `ignored-${i}.txt`), 'Local-only historical file');
  const first = await packageV2({ root });
  const entries = readZipEntries(resolve(root,'v2/dist/noxinfluencer-mcp-plugin.zip'));
  assert.equal(entries.has('skills/noxinfluencer-mcp/SKILL.md'), true);
  assert.equal(entries.has('skills/influencer-marketing-manager/SKILL.md'), true);
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
  assertManagerBusinessUnchanged(readDirectoryFileMap(resolve(installed,'skills/influencer-marketing-manager')), root);
  const before = readFileSync(resolve(root,'v2/dist/noxinfluencer-mcp-plugin.zip'));
  const second = await packageV2({ root });
  assert.deepEqual(first,second);
  assert.deepEqual(before,readFileSync(resolve(root,'v2/dist/noxinfluencer-mcp-plugin.zip')));
  assert.equal(existsSync(resolve(root,'v2/dist/noxinfluencer-v2.zip')),true);
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
