import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { build as buildOriginalPlugin, createOutputs, repositoryRoot } from '../v2/scripts/build.mjs';
import { readDirectoryFileMap } from '../v2/scripts/lib/canonical-files.mjs';
import { packageV2 } from '../v2/scripts/package.mjs';
import { readZipEntries } from '../v2/tests/helpers/zip-reader.mjs';
import { buildGrokPlugin, createGrokOutputs, grokMarketplacePath, grokPluginPath } from './grok-plugin.mjs';

const originalPluginPath = 'plugins/noxinfluencer';
const originalMarketplacePaths = ['.agents/plugins', '.claude-plugin'];
const maintainedPaths = ['v2/source', 'skills/influencer-marketing-manager'];
const skillNames = ['noxinfluencer-mcp', 'influencer-marketing-manager'];

function copyFixturePath(root, path) {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(repositoryRoot, path), target, { recursive: true });
}

/** A clean source checkout does not contain either channel's generated Skills. */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'nox-grok-plugin-test-'));
  t.after(() => {
    const contained = relative(resolve(tmpdir()), resolve(root));
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    assert.ok(basename(root).startsWith('nox-grok-plugin-test-'));
    rmSync(root, { recursive: true, force: true });
  });
  for (const path of [
    ...maintainedPaths,
    `${originalPluginPath}/.codex-plugin/plugin.json`,
    `${originalPluginPath}/.plugin/plugin.json`,
    '.agents/plugins/marketplace.json',
    '.claude-plugin/marketplace.json',
  ]) copyFixturePath(root, path);
  return root;
}

function snapshot(root, paths) {
  const files = new Map();
  for (const prefix of paths) {
    const directory = resolve(root, prefix);
    if (!existsSync(directory)) continue;
    for (const [path, bytes] of readDirectoryFileMap(directory)) files.set(`${prefix}/${path}`, bytes);
  }
  return files;
}

function protectedSnapshot(root) {
  return snapshot(root, [...maintainedPaths, originalPluginPath, ...originalMarketplacePaths]);
}

function marketplaceSource(entry) {
  return typeof entry.source === 'string' ? entry.source : entry.source?.path;
}

test('Grok assembly uses maintained sources without requiring generated plugin files', t => {
  const root = fixture(t);
  const before = protectedSnapshot(root);
  assert.equal(existsSync(resolve(root, originalPluginPath, 'skills')), false);
  assert.equal(existsSync(resolve(root, originalPluginPath, '.mcp.json')), false);
  const { pluginFiles, marketplace } = createGrokOutputs(root);

  assert.ok(pluginFiles instanceof Map);
  assert.ok(Buffer.isBuffer(marketplace));
  const canonical = createOutputs(root);
  for (const skillName of skillNames) {
    const expected = canonical.outputs.get(`${originalPluginPath}/skills/${skillName}`);
    assert.ok(expected instanceof Map);
    const actual = new Map([...pluginFiles]
      .filter(([path]) => path.startsWith(`skills/${skillName}/`))
      .map(([path, bytes]) => [path.slice(`skills/${skillName}/`.length), bytes]));
    assert.deepEqual(actual, expected, `${skillName} must retain the maintained business content`);
  }
  assert.deepEqual(protectedSnapshot(root), before);
  assert.equal(existsSync(resolve(root, grokPluginPath)), false);
  assert.equal(existsSync(resolve(root, grokMarketplacePath)), false);
});

test('Grok marketplace points at a plugin root containing the manifest, Skills and MCP configuration', t => {
  const root = fixture(t);
  buildGrokPlugin({ root });
  const marketplace = JSON.parse(readFileSync(resolve(root, grokMarketplacePath)));
  const entry = marketplace.plugins.find(plugin => plugin.name === 'noxinfluencer');
  assert.ok(entry, 'Grok marketplace must advertise the NoxInfluencer plugin');
  const source = marketplaceSource(entry);
  assert.equal(typeof source, 'string');
  const installedRoot = resolve(root, source);
  assert.equal(installedRoot, resolve(root, grokPluginPath));
  assert.notEqual(installedRoot, resolve(root, originalPluginPath));

  const manifest = JSON.parse(readFileSync(resolve(installedRoot, 'plugin.json')));
  assert.equal(manifest.name, 'noxinfluencer');
  const canonicalManifest = JSON.parse(createOutputs(root).files.get(`${originalPluginPath}/.plugin/plugin.json`));
  assert.equal(manifest.version, canonicalManifest.version);
  for (const skillName of skillNames) {
    const skill = readFileSync(resolve(installedRoot, 'skills', skillName, 'SKILL.md'), 'utf8');
    assert.match(skill, new RegExp(`^name: ${skillName}\\r?$`, 'm'));
  }
  const mcp = JSON.parse(readFileSync(resolve(installedRoot, '.mcp.json')));
  const canonicalMcp = JSON.parse(createOutputs(root).files.get(`${originalPluginPath}/.mcp.json`));
  assert.deepEqual(mcp, canonicalMcp);
  const files = readDirectoryFileMap(installedRoot);
  assert.equal([...files.keys()].some(path => /^(?:\.plugin|\.codex-plugin)\//.test(path)), false);
});

test('repeated Grok builds are deterministic and leave original channels and sources unchanged', t => {
  const root = fixture(t);
  const before = protectedSnapshot(root);
  buildGrokPlugin({ root });
  const firstPlugin = readDirectoryFileMap(resolve(root, grokPluginPath));
  const firstMarketplace = readFileSync(resolve(root, grokMarketplacePath));
  buildGrokPlugin({ root });
  buildGrokPlugin({ root, check: true });
  assert.deepEqual(readDirectoryFileMap(resolve(root, grokPluginPath)), firstPlugin);
  assert.deepEqual(readFileSync(resolve(root, grokMarketplacePath)), firstMarketplace);
  assert.deepEqual(protectedSnapshot(root), before);
});

test('Grok check detects delivery drift without repairing or changing files', t => {
  const root = fixture(t);
  buildGrokPlugin({ root });
  const path = resolve(root, grokPluginPath, 'plugin.json');
  writeFileSync(path, 'deliberately changed Grok manifest\n');
  const before = snapshot(root, [grokPluginPath, '.grok-plugin', ...maintainedPaths,
    originalPluginPath, ...originalMarketplacePaths]);
  assert.throws(() => buildGrokPlugin({ root, check: true }), /drift|changed|mismatch/i);
  assert.deepEqual(snapshot(root, [grokPluginPath, '.grok-plugin', ...maintainedPaths,
    originalPluginPath, ...originalMarketplacePaths]), before);
});

test('Grok generation preserves the existing Codex and Claude delivery and ZIP contents', async t => {
  const root = fixture(t);
  copyFixturePath(root, `${originalPluginPath}/assets`);
  copyFixturePath(root, `${originalPluginPath}/.plugin/marketplace.json`);
  buildOriginalPlugin({ root });
  const originalFiles = protectedSnapshot(root);
  const beforeArtifacts = await packageV2({ root });
  const archivePath = resolve(root, 'v2/dist/noxinfluencer-mcp-plugin.zip');
  const beforeArchive = readFileSync(archivePath);
  const beforeEntries = readZipEntries(archivePath);

  buildGrokPlugin({ root });
  buildGrokPlugin({ root, check: true });
  assert.deepEqual(protectedSnapshot(root), originalFiles);
  buildOriginalPlugin({ root, check: true });
  const afterArtifacts = await packageV2({ root });
  assert.deepEqual(afterArtifacts, beforeArtifacts);
  assert.deepEqual(readZipEntries(archivePath), beforeEntries);
  assert.deepEqual(readFileSync(archivePath), beforeArchive);
  assert.deepEqual(protectedSnapshot(root), originalFiles);
});
