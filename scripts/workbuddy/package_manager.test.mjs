import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { createManagerEntries, packageManager, validateManagerEntries } from './package_manager.mjs';
import { readZipEntries } from '../../v2/tests/helpers/zip-reader.mjs';

const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sourcePath = 'skills/influencer-marketing-manager';
const metadataPath = 'scripts/workbuddy/manager/skill-metadata.json';
const iconSourcePath = 'scripts/workbuddy/manager/icon.png';
const skillName = 'noxinfluencer-marketing-manager';
const entrypoint = `${skillName}/SKILL.md`;
const defaultArchive = `dist/${skillName}-workbuddy.zip`;
const defaultIcon = `dist/${skillName}-workbuddy-icon.png`;

function assertPngIcon(bytes) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length >= 24 && bytes.length <= 500 * 1024);
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(bytes.readUInt32BE(16), 512);
  assert.equal(bytes.readUInt32BE(20), 512);
}

function readSourceFiles(root) {
  const files = new Map();
  const source = resolve(root, sourcePath);
  const walk = path => {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = join(path, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.set(relative(source, target).split(sep).join('/'), readFileSync(target));
    }
  };
  walk(source);
  return files;
}

function frontmatter(bytes) {
  const text = bytes.toString().replace(/\r\n?/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  assert.ok(match, 'Packaged SKILL.md must have YAML frontmatter');
  const document = parseDocument(match[1]);
  assert.deepEqual(document.errors, []);
  return { document, fields: document.toJS(), body: text.slice(match[0].length) };
}

function editFrontmatter(entries, edit) {
  const { document, body } = frontmatter(entries.get(entrypoint));
  edit(document);
  entries.set(entrypoint, Buffer.from(`---\n${document.toString()}---\n${body}`));
}

function adaptedText(bytes) {
  return bytes.toString().replace(/\r\n?/g, '\n').replaceAll('{baseDir}/references/', '@references/');
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'nox-workbuddy-manager-test-'));
  t.after(() => {
    const contained = relative(resolve(tmpdir()), resolve(root));
    assert.ok(contained && !contained.startsWith('..') && !isAbsolute(contained));
    assert.ok(basename(root).startsWith('nox-workbuddy-manager-test-'));
    rmSync(root, { recursive: true, force: true });
  });
  for (const path of [sourcePath, metadataPath, iconSourcePath]) {
    const target = resolve(root, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repositoryRoot, path), target, { recursive: true });
  }
  return root;
}

let assembled;
let sourceBefore;
let sourceAfter;
let metadataBefore;
let metadataAfter;
let iconBefore;
let iconAfter;
before(() => {
  sourceBefore = readSourceFiles(repositoryRoot);
  metadataBefore = readFileSync(resolve(repositoryRoot, metadataPath));
  iconBefore = readFileSync(resolve(repositoryRoot, iconSourcePath));
  assembled = createManagerEntries();
  sourceAfter = readSourceFiles(repositoryRoot);
  metadataAfter = readFileSync(resolve(repositoryRoot, metadataPath));
  iconAfter = readFileSync(resolve(repositoryRoot, iconSourcePath));
  validateManagerEntries(assembled.entries);
});

test('standalone WorkBuddy packages the shared Manager guidance with metadata and adapted resource paths', () => {
  assert.deepEqual(sourceAfter, sourceBefore);
  assert.deepEqual(metadataAfter, metadataBefore);
  assert.deepEqual(iconAfter, iconBefore);
  assert.deepEqual(assembled.icon, iconBefore);
  assertPngIcon(assembled.icon);
  assert.equal(frontmatter(sourceAfter.get('SKILL.md')).fields.name, 'influencer-marketing-manager');
  assert.equal(frontmatter(assembled.entries.get(entrypoint)).fields.description,
    frontmatter(sourceBefore.get('SKILL.md')).fields.description);
  assert.equal(frontmatter(assembled.entries.get(entrypoint)).body,
    adaptedText(Buffer.from(frontmatter(sourceBefore.get('SKILL.md')).body)));
  assert.equal(assembled.entries.size, sourceBefore.size);
  for (const [path, bytes] of sourceBefore) {
    if (path === 'SKILL.md') continue;
    const actual = assembled.entries.get(`${skillName}/${path}`)?.toString().replace(/\r\n?/g, '\n');
    assert.equal(actual, adaptedText(bytes), path);
  }
});

test('standalone WorkBuddy Skill carries its bilingual public identity and exactly three examples per language', () => {
  const configured = JSON.parse(metadataBefore);
  const { fields } = frontmatter(assembled.entries.get(entrypoint));
  assert.equal(fields.name, skillName);
  assert.equal(fields.display_name, 'Nox聚星红人营销策略');
  for (const key of ['display_name', 'display_name_en', 'description_zh', 'description_en', 'author', 'version']) {
    assert.deepEqual(fields[key], configured[key], `Missing or changed WorkBuddy metadata: ${key}`);
  }
  assert.ok(typeof fields.description === 'string' && fields.description.trim());
  for (const key of ['examples_zh', 'examples_en']) {
    assert.equal(fields[key].length, 3, key);
    assert.deepEqual(fields[key], configured[key], key);
    assert.ok(fields[key].every(value => typeof value === 'string' && value.trim()));
  }
  assert.equal(assembled.metadata.name, skillName);
});

test('standalone Manager rejects an incorrect packaged Skill name', () => {
  const entries = new Map(assembled.entries);
  editFrontmatter(entries, document => { document.set('name', 'influencer-marketing-manager'); });
  assert.throws(() => validateManagerEntries(entries));
});

test('standalone Manager rejects missing required presentation, author and version metadata', () => {
  for (const field of ['display_name', 'display_name_en', 'description_zh', 'description_en', 'author', 'version']) {
    const entries = new Map(assembled.entries);
    editFrontmatter(entries, document => { document.delete(field); });
    assert.throws(() => validateManagerEntries(entries), `Accepted missing ${field}`);
  }
});

test('standalone Manager rejects a missing linked business reference', () => {
  const entries = new Map(assembled.entries);
  assert.equal(entries.delete(`${skillName}/references/playbook.md`), true);
  assert.throws(() => validateManagerEntries(entries));
});

test('standalone Manager refuses assembly when its WorkBuddy metadata source is absent', t => {
  const root = fixture(t);
  unlinkSync(resolve(root, metadataPath));
  assert.throws(() => createManagerEntries({ root }));
});

test('missing brand icon rejects packaging before writing a ZIP or exported icon', async t => {
  const root = fixture(t);
  unlinkSync(resolve(root, iconSourcePath));
  assert.throws(() => createManagerEntries({ root }));
  await assert.rejects(packageManager({ root }));
  assert.equal(existsSync(resolve(root, defaultArchive)), false);
  assert.equal(existsSync(resolve(root, defaultIcon)), false);
});

test('corrupt brand icon rejects packaging before writing a ZIP or exported icon', async t => {
  const root = fixture(t);
  const path = resolve(root, iconSourcePath);
  const corrupt = Buffer.from(readFileSync(path));
  corrupt[0] = 0;
  writeFileSync(path, corrupt);
  assert.throws(() => createManagerEntries({ root }));
  await assert.rejects(packageManager({ root }));
  assert.equal(existsSync(resolve(root, defaultArchive)), false);
  assert.equal(existsSync(resolve(root, defaultIcon)), false);
});

test('WorkBuddy adapts a valid Skill-root reference without rewriting normal Markdown links', t => {
  const root = fixture(t);
  const path = resolve(root, sourcePath, 'SKILL.md');
  const source = readFileSync(path).toString() + '\nFor details, read `{baseDir}/references/playbook.md`.\n';
  writeFileSync(path, source);
  const { entries } = createManagerEntries({ root });
  const body = frontmatter(entries.get(entrypoint)).body;
  assert.equal(body, adaptedText(Buffer.from(frontmatter(Buffer.from(source)).body)));
  assert.match(body, /@references\/playbook\.md/);
  assert.match(body, /\]\(references\/playbook\.md#/);
  assert.equal(readFileSync(path).toString(), source);
});

test('standalone Skill package has one Skill root and no Expert or connector binding', () => {
  assert.deepEqual(new Set([...assembled.entries.keys()].map(path => path.split('/')[0])), new Set([skillName]));
  const { fields } = frontmatter(assembled.entries.get(entrypoint));
  for (const field of ['dependencies', 'mcpServers', 'tools', 'agents', 'skills', 'expertType', 'cli', 'avatar', 'icon']) {
    assert.equal(Object.hasOwn(fields, field), false, `Unexpected standalone binding: ${field}`);
  }
  for (const [path, bytes] of assembled.entries) {
    assert.ok(path === entrypoint || path.startsWith(`${skillName}/references/`), `Unexpected standalone resource: ${path}`);
    assert.doesNotMatch(bytes.toString(), /\{baseDir\}|noxinfluencer-plugin|influencer-marketing-manager-plugin|noxinfluencer-mcp/);
  }
});

test('the published Manager retains external product references without shipping or declaring a second Skill', () => {
  const { fields, body } = frontmatter(assembled.entries.get(entrypoint));
  assert.match(body, /Otherwise use the `noxinfluencer` product Skill when available/);
  assert.match(body, /If the product Skill or its authorized connection is unavailable, keep the account task pending/);
  assert.equal(Object.hasOwn(fields, 'dependencies'), false);
  assert.equal(Object.hasOwn(fields, 'skills'), false);
  assert.equal(assembled.entries.size, 6);
  assert.ok([...assembled.entries.keys()].every(path => path.startsWith(`${skillName}/`)));
});

test('actual standalone ZIPs are repeatable, self-contained and preserve the maintained sources', async t => {
  const root = fixture(t);
  const originalSource = readSourceFiles(root);
  const originalMetadata = readFileSync(resolve(root, metadataPath));
  const originalIcon = readFileSync(resolve(root, iconSourcePath));
  const first = await packageManager({ root });
  const secondPath = resolve(root, 'dist/manager-repeat-test.zip');
  const second = await packageManager({ root, output: secondPath });
  assert.equal(first.path, resolve(root, defaultArchive));
  assert.equal(second.path, secondPath);
  assert.equal(first.iconPath, resolve(root, defaultIcon));
  assert.equal(second.iconPath, first.iconPath);
  const exportedIcon = readFileSync(first.iconPath);
  assert.deepEqual(exportedIcon, originalIcon);
  assertPngIcon(exportedIcon);
  const archive = readFileSync(first.path);
  assert.deepEqual(readFileSync(second.path), archive);
  assert.equal(first.sha256, createHash('sha256').update(archive).digest('hex'));
  assert.equal(second.sha256, first.sha256);

  const entries = readZipEntries(first.path);
  assert.equal(entries.size, 6);
  validateManagerEntries(entries);
  assert.deepEqual(entries, assembled.entries);
  assert.equal(first.files, entries.size);
  assert.equal(second.files, entries.size);
  assert.ok(entries.has(`${skillName}/references/playbook.md`));
  assert.ok(entries.has(`${skillName}/references/operating-design.md`));
  assert.deepEqual(readSourceFiles(root), originalSource);
  assert.deepEqual(readFileSync(resolve(root, metadataPath)), originalMetadata);
  assert.deepEqual(readFileSync(resolve(root, iconSourcePath)), originalIcon);
});
