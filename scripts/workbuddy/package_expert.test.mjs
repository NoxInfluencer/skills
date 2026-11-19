import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { createExpertEntries, packageExpert, validateExpertEntries } from './package_expert.mjs';
import { readZipEntries } from '../../v2/tests/helpers/zip-reader.mjs';

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const expertPath = 'experts/influencer-marketing-manager';
const manifestPath = '.codebuddy-plugin/plugin.json';
const agentPath = 'agents/influencer-marketing-manager.md';
const productName = 'noxinfluencer-plugin';
const managerName = 'influencer-marketing-manager-plugin';
const templatePaths = [manifestPath, agentPath, 'avatars/expert.png', 'README.md'];
const fixturePaths = [
  'v2/source',
  'skills/influencer-marketing-manager',
  'plugins/noxinfluencer/.codex-plugin/plugin.json',
  'plugins/noxinfluencer/.plugin/plugin.json',
  ...templatePaths.map(path => `${expertPath}/${path}`),
  'scripts/workbuddy/mcp/connector-meta.json',
  'scripts/workbuddy/mcp/oauth-and-scopes.md',
];

function sourceSnapshot(root) {
  const files = new Map();
  const walk = path => {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = join(path, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.set(relative(root, target).split(sep).join('/'), readFileSync(target));
    }
  };
  for (const path of ['v2/source', 'skills/influencer-marketing-manager']) walk(resolve(root, path));
  for (const path of fixturePaths.filter(path => !['v2/source', 'skills/influencer-marketing-manager'].includes(path))) {
    files.set(path, readFileSync(resolve(root, path)));
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

test('Expert assembly preserves maintained sources and WorkBuddy templates', () => {
  assert.deepEqual(sourcesAfter, sourcesBefore);
  assert.deepEqual(assembled.manifest.dependencies.connectors, ['noxinfluencer-mcp']);
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
  const firstPath = resolve(root, 'dist/expert-first-test.zip');
  const secondPath = resolve(root, 'dist/expert-second-test.zip');
  const first = await packageExpert({ root, output: firstPath });
  const second = await packageExpert({ root, output: secondPath });
  assert.equal(first.path, firstPath);
  assert.equal(second.path, secondPath);
  const firstBytes = readFileSync(firstPath);
  assert.deepEqual(readFileSync(secondPath), firstBytes);
  assert.equal(first.sha256, createHash('sha256').update(firstBytes).digest('hex'));
  assert.equal(second.sha256, first.sha256);

  const entries = readZipEntries(firstPath);
  validateExpertEntries(entries);
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
  }
  assert.deepEqual(sourceSnapshot(root), originalSources);
});
