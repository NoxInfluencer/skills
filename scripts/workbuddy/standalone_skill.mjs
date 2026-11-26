import { createHash } from 'node:crypto';
import { isAbsolute, posix, relative, resolve } from 'node:path';
import { parseDocument } from 'yaml';
import yazl from 'yazl';
import { assertPublicFile } from '../../v2/scripts/build.mjs';
import {
  assertNoSymbolicLinkComponents, assertSafeRelativePath, comparePortablePaths,
  readBoundedRegularFile, readCanonicalTextFile, replaceTargetsAtomically,
} from '../../v2/scripts/lib/canonical-files.mjs';

const metadataFields = ['name', 'display_name', 'display_name_en', 'description_zh', 'description_en',
  'version', 'author', 'examples_zh', 'examples_en'];
const requiredText = ['name', 'display_name', 'display_name_en', 'description', 'description_zh', 'description_en', 'version', 'author'];
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || nodeMajor === 22 && nodeMinor < 22) {
  throw new Error('WorkBuddy Skill packaging requires Node.js 22.22 or newer.');
}

export function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

export function frontmatter(bytes, label) {
  requireValue(Buffer.isBuffer(bytes), `Missing ${label}`);
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  requireValue(match, `${label} requires YAML frontmatter`);
  const document = parseDocument(match[1], { uniqueKeys: true });
  requireValue(!document.errors.length, `${label} has invalid YAML`);
  const fields = document.toJS({ maxAliasCount: 50 });
  requireValue(fields && typeof fields === 'object' && !Array.isArray(fields), `${label} requires a frontmatter object`);
  return { document, fields, body: text.slice(match[0].length) };
}

export function readSkillMetadata(root, metadataPath) {
  const path = resolve(root, metadataPath);
  assertNoSymbolicLinkComponents(root, path);
  const bytes = readCanonicalTextFile(path);
  assertPublicFile(metadataPath, bytes);
  const metadata = JSON.parse(bytes);
  requireValue(metadata && typeof metadata === 'object' && !Array.isArray(metadata), 'WorkBuddy metadata requires an object');
  requireValue(Object.keys(metadata).every(key => metadataFields.includes(key)), 'Unsupported WorkBuddy metadata field');
  for (const key of metadataFields.filter(key => !key.startsWith('examples_'))) {
    requireValue(typeof metadata[key] === 'string' && metadata[key].trim(), `WorkBuddy metadata requires ${key}`);
  }
  return metadata;
}

export function readSkillIcon(root, iconSourcePath) {
  const path = resolve(root, iconSourcePath);
  assertNoSymbolicLinkComponents(root, path);
  const icon = readBoundedRegularFile(path, 'WorkBuddy Skill icon');
  requireValue(icon.length >= 24 && icon.length <= 500 * 1024
    && icon.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && icon.readUInt32BE(16) === 512 && icon.readUInt32BE(20) === 512,
  'WorkBuddy Skill icon must be a 512x512 PNG of at most 500KB');
  return icon;
}

export function validateStandaloneEntries(entries, { skillName, displayName }) {
  requireValue(entries instanceof Map && entries.size > 0 && entries.size <= 256, 'WorkBuddy Skill requires a bounded file map');
  const { fields, body } = frontmatter(entries.get(`${skillName}/SKILL.md`), 'WorkBuddy SKILL.md');
  for (const key of requiredText) {
    requireValue(typeof fields[key] === 'string' && fields[key].trim(), `WorkBuddy SKILL.md requires ${key}`);
  }
  requireValue(fields.name === skillName, `WorkBuddy Skill name must be ${skillName}`);
  requireValue(fields.display_name === displayName, `WorkBuddy display_name must be ${displayName}`);
  requireValue(semver.test(fields.version), 'WorkBuddy Skill version must be semantic versioning');
  requireValue(body.trim(), 'WorkBuddy Skill instructions must not be empty');
  for (const key of ['examples_zh', 'examples_en']) {
    if (fields[key] === undefined) continue;
    requireValue(Array.isArray(fields[key]) && fields[key].length > 0
      && fields[key].every(example => typeof example === 'string' && example.trim()), `${key} requires nonempty examples`);
  }
  for (const [path, bytes] of entries) {
    assertSafeRelativePath(path, 'WorkBuddy ZIP entry');
    requireValue(path.startsWith(`${skillName}/`), `Unexpected Skill root: ${path}`);
    const withinSkill = path.slice(skillName.length + 1);
    requireValue(withinSkill === 'SKILL.md' || /^(?:references|scripts|templates)\//.test(withinSkill), `Unexpected Skill resource: ${path}`);
    requireValue(Buffer.isBuffer(bytes), `Invalid Skill resource: ${path}`);
    assertPublicFile(path, bytes);
    if (!path.endsWith('.md')) continue;
    const text = bytes.toString('utf8');
    requireValue(!text.includes('{baseDir}'), `Unadapted WorkBuddy resource: ${path}`);
    const targets = [];
    for (const match of text.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g)) {
      const target = (match[1] ?? match[2]).split('#')[0];
      if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
      requireValue(!target.startsWith('/') && !target.includes('\\'), `Invalid Skill reference: ${path} -> ${target}`);
      targets.push(posix.normalize(posix.join(posix.dirname(withinSkill), target)));
    }
    for (const match of text.matchAll(/@(references\/[\w./-]+\.md)\b/g)) targets.push(match[1]);
    for (const match of text.matchAll(/\$\{CODEBUDDY_SKILL_DIR\}\/([\w./-]+)/g)) targets.push(match[1]);
    for (const target of targets) {
      assertSafeRelativePath(target, 'Skill resource reference');
      requireValue(entries.has(`${skillName}/${target}`), `Missing WorkBuddy Skill resource: ${path} -> ${target}`);
    }
  }
  return fields;
}

export async function writeStandaloneArchive({ root, output, iconOutput, entries, icon }) {
  const path = resolve(root, output);
  const inDist = relative(resolve(root, 'dist'), path);
  requireValue(inDist && !inDist.startsWith('..') && !isAbsolute(inDist) && path.endsWith('.zip'), 'Skill ZIP output must be inside the repository dist directory');
  const zip = new yazl.ZipFile();
  for (const name of [...entries.keys()].sort(comparePortablePaths)) {
    zip.addBuffer(entries.get(name), name, { mtime: new Date('1980-01-01T00:00:00Z'), mode: 0o100644 });
  }
  zip.end();
  const chunks = [];
  for await (const chunk of zip.outputStream) chunks.push(chunk);
  const contents = Buffer.concat(chunks);
  const iconPath = resolve(root, iconOutput);
  replaceTargetsAtomically([
    { kind: 'file', targetPath: path, contents },
    { kind: 'file', targetPath: iconPath, contents: icon },
  ], { trustedRoot: root });
  return { path, iconPath, files: entries.size, sha256: createHash('sha256').update(contents).digest('hex') };
}
