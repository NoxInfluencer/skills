import { createHash } from 'node:crypto';
import { isAbsolute, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import yazl from 'yazl';
import { assertPublicFile, repositoryRoot, validateSkill } from '../../v2/scripts/build.mjs';
import {
  assertNoSymbolicLinkComponents, assertSafeRelativePath, comparePortablePaths,
  readBoundedRegularFile, readCanonicalTextFile, readDirectoryFileMap, replaceTargetsAtomically,
} from '../../v2/scripts/lib/canonical-files.mjs';

export const skillName = 'noxinfluencer-marketing-manager';
export const displayName = 'Nox聚星红人营销策略';
const sourcePath = 'skills/influencer-marketing-manager';
const sourceName = 'influencer-marketing-manager';
const metadataPath = 'scripts/workbuddy/manager/skill-metadata.json';
const iconSourcePath = 'scripts/workbuddy/manager/icon.png';
const iconArchivePath = 'dist/noxinfluencer-marketing-manager-workbuddy-icon.png';
const defaultArchive = 'dist/noxinfluencer-marketing-manager-workbuddy.zip';
const metadataFields = ['name', 'display_name', 'display_name_en', 'description_zh', 'description_en',
  'version', 'author', 'examples_zh', 'examples_en'];
const requiredText = ['name', 'display_name', 'display_name_en', 'description', 'description_zh', 'description_en', 'version', 'author'];
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || nodeMajor === 22 && nodeMinor < 22) {
  throw new Error('WorkBuddy Skill packaging requires Node.js 22.22 or newer.');
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function frontmatter(bytes, label) {
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

/** The Skill submission form accepts its avatar as a separate upload. */
function readManagerIcon(root) {
  const path = resolve(root, iconSourcePath);
  assertNoSymbolicLinkComponents(root, path);
  const icon = readBoundedRegularFile(path, 'WorkBuddy Skill icon');
  requireValue(icon.length >= 24 && icon.length <= 500 * 1024
    && icon.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && icon.readUInt32BE(16) === 512 && icon.readUInt32BE(20) === 512,
  'WorkBuddy Skill icon must be a 512x512 PNG of at most 500KB');
  return icon;
}

/** External Skill collaboration is conditional; it is not a bundled file dependency. */
function adaptOptionalCollaboration(path, text) {
  if (path === 'SKILL.md') {
    const pattern = /(^## Capability collaboration\n\n)([^\n]+)(\n\n)/m;
    const original = text.match(pattern);
    requireValue(original?.[2].includes('`noxinfluencer` Skill'), 'Review the shared Manager collaboration section before adapting it');
    const collaboration = [
      'This strategy Skill can independently complete marketing strategy, creator-selection criteria, partnership planning, SOP design and analysis of user-provided materials. These tasks do not require another installed Skill or a connected NoxInfluencer account.',
      'Optional external collaboration: `noxinfluencer` is the identifier of a separately distributed Skill, not a file or required resource in this package. Only when the requested task needs live NoxInfluencer data or account operations, and the current WorkBuddy environment confirms that external Skill is already installed and available, load it by its installed identifier. When it supplied the task, return to that same entrypoint for execution. Preserve its supported runtime, account identity, target scope, authorization, preview, confirmation, recovery and result-verification rules.',
      'If that external Skill is not installed or available, continue the strategy work and analysis that the supplied materials support. Explain the specific live-data or execution gap only when it affects the requested result; offer to work from a user-provided export or explain how the user can separately install or enable the required capability. Do not load a nonexistent Skill, automatically install it, invent account results, or present the external capability as included in this package.',
      'The external product capability owns tool selection and any supported NoxInfluencer page handoff. Missing capabilities or errors do not authorize switching runtimes or accounts, or operating NoxInfluencer SaaS directly. Browser inspection of original public creator, channel or video pages remains valid for content evidence. Sign-in, authorization and billing remain user-completed steps under the selected product capability.',
    ].join('\n\n');
    return text.replace(pattern, (_match, heading, _paragraph, spacing) => heading + collaboration + spacing);
  }
  if (path === 'references/operational-tool-prompts.md') {
    const pattern = /^For samples tracked in NoxInfluencer,[^\n]+/m;
    requireValue(pattern.test(text), 'Review the shared native tracking guidance before adapting it');
    return text.replace(pattern,
      'For samples tracked in NoxInfluencer, use native tracking evidence only when the optional external product Skill described in SKILL.md is already installed and available for the current task. Otherwise, analyze tracking information supplied by the user or explain which additional capability is needed. External tracking tools can supplement unavailable or incomplete native evidence. Let the available product capability resolve current support and pricing through its selected runtime; registration and saved tracking reads can have different costs.');
  }
  return text;
}

/** Validate the single-Skill archive and every local resource after adaptation. */
export function validateManagerEntries(entries) {
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
    for (const target of targets) {
      assertSafeRelativePath(target, 'Skill resource reference');
      requireValue(entries.has(`${skillName}/${target}`), `Missing WorkBuddy Skill resource: ${path} -> ${target}`);
    }
  }
  return fields;
}

/** Keep the shared source intact; add WorkBuddy metadata and optional collaboration rules. */
export function createManagerEntries({ root = repositoryRoot } = {}) {
  root = resolve(root);
  const sourceRoot = resolve(root, sourcePath);
  const metadataFile = resolve(root, metadataPath);
  assertNoSymbolicLinkComponents(root, sourceRoot);
  assertNoSymbolicLinkComponents(root, metadataFile);
  const metadataBytes = readCanonicalTextFile(metadataFile);
  assertPublicFile(metadataPath, metadataBytes);
  const metadata = JSON.parse(metadataBytes);
  requireValue(metadata && typeof metadata === 'object' && !Array.isArray(metadata), 'WorkBuddy metadata requires an object');
  requireValue(Object.keys(metadata).every(key => metadataFields.includes(key)), 'Unsupported WorkBuddy metadata field');
  for (const key of metadataFields.filter(key => !key.startsWith('examples_'))) {
    requireValue(typeof metadata[key] === 'string' && metadata[key].trim(), `WorkBuddy metadata requires ${key}`);
  }
  const files = readDirectoryFileMap(sourceRoot);
  validateSkill(files);
  const { document, fields, body } = frontmatter(files.get('SKILL.md'), 'Shared Manager SKILL.md');
  requireValue(fields.name === sourceName, `Shared Manager name must remain ${sourceName}`);
  requireValue(typeof fields.description === 'string' && fields.description.trim(), 'Shared Manager requires its routing description');
  for (const [key, value] of Object.entries(metadata)) document.set(key, value);
  const entries = new Map();
  for (const [path, bytes] of files) {
    const content = path === 'SKILL.md' ? Buffer.from(`---\n${document.toString()}---\n${body}`) : bytes;
    const adapted = path.endsWith('.md')
      ? Buffer.from(adaptOptionalCollaboration(path, content.toString('utf8').replace(/\r\n?/g, '\n'))
        .replaceAll('{baseDir}/references/', '@references/'))
      : content;
    entries.set(`${skillName}/${path}`, adapted);
  }
  validateManagerEntries(entries);
  return { entries, metadata, icon: readManagerIcon(root) };
}

export async function packageManager({ root = repositoryRoot, output } = {}) {
  root = resolve(root);
  const { entries, icon } = createManagerEntries({ root });
  const path = resolve(root, output ?? defaultArchive);
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
  const iconPath = resolve(root, iconArchivePath);
  replaceTargetsAtomically([
    { kind: 'file', targetPath: path, contents },
    { kind: 'file', targetPath: iconPath, contents: icon },
  ], { trustedRoot: root });
  return { path, iconPath, files: entries.size, sha256: createHash('sha256').update(contents).digest('hex') };
}

async function main() {
  const args = process.argv.slice(2);
  let check = false;
  let output;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--output' && args[index + 1]) output = args[++index];
    else throw new Error('Usage: node scripts/workbuddy/package_manager.mjs [--check] [--output dist/name.zip]');
  }
  requireValue(!check || !output, '--output is only available when packaging');
  if (check) {
    const { entries, metadata } = createManagerEntries();
    console.log(`WorkBuddy Skill checks passed (${metadata.name}, ${entries.size} files, version ${metadata.version})`);
  } else console.log(JSON.stringify(await packageManager({ output }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
