import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { resolve, relative, isAbsolute, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import yazl from 'yazl';
import { createOutputs, repositoryRoot, assertPublicFile } from '../../v2/scripts/build.mjs';
import {
  assertNoSymbolicLinkComponents, assertSafeRelativePath, comparePortablePaths,
  readBoundedRegularFile, readCanonicalTextFile, replaceTargetsAtomically,
} from '../../v2/scripts/lib/canonical-files.mjs';

export const expertPath = 'experts/influencer-marketing-manager';
export const productSkillName = 'noxinfluencer-plugin';
export const managerSkillName = 'influencer-marketing-manager-plugin';
const connectorSource = 'noxinfluencer-mcp';
const agentName = 'influencer-marketing-manager';
const manifestPath = '.codebuddy-plugin/plugin.json';
const skillNames = [productSkillName, managerSkillName];
const defaultArchive = 'dist/noxinfluencer-workbuddy-expert.zip';
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || nodeMajor === 22 && nodeMinor < 22) {
  throw new Error('WorkBuddy Expert packaging requires Node.js 22.22 or newer.');
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function input(root, path, binary = false) {
  assertSafeRelativePath(path);
  const target = resolve(root, path);
  assertNoSymbolicLinkComponents(root, target);
  return binary ? readBoundedRegularFile(target) : readCanonicalTextFile(target);
}

function frontmatter(bytes, label) {
  requireValue(Buffer.isBuffer(bytes), `Missing ${label}`);
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  requireValue(match, `${label} requires YAML frontmatter`);
  const document = parseDocument(match[1], { uniqueKeys: true });
  requireValue(!document.errors.length, `${label} has invalid YAML`);
  const fields = document.toJS({ maxAliasCount: 50 });
  requireValue(fields && typeof fields === 'object' && !Array.isArray(fields), `${label} requires an object`);
  return { document, fields, body: text.slice(match[0].length) };
}

function renameSkill(bytes, expectedName, outputName) {
  const { document, fields, body } = frontmatter(bytes, expectedName);
  requireValue(fields.name === expectedName, `Expected source Skill name: ${expectedName}`);
  document.set('name', outputName);
  return Buffer.from(`---\n${document.toString()}---\n${body}`);
}

/** Adapt instructions in memory; shared/V2/plugin source identities are unchanged. */
function adaptMarkdown(bytes, { manager = false } = {}) {
  let text = bytes.toString('utf8')
    .replace(/^## Skill resource paths\r?\n[\s\S]*?(?=^## )/m, '')
    .replaceAll('{baseDir}/references/', '@references/')
    .replace(/`(references\/[\w./-]+\.md)`/g, '`@$1`')
    .replaceAll('codex-plugin-runtime.md', 'workbuddy-runtime.md')
    .replace(/\binfluencer-marketing-manager\b(?!-plugin)/g, managerSkillName)
    .replace(/`noxinfluencer-mcp` product Skill/g, `\`${productSkillName}\` product Skill`)
    .replace(/^When invoked through an installed Agent plugin .*? all NoxInfluencer business operations use MCP\./m,
      'When using this WorkBuddy Expert, all NoxInfluencer business operations use the connected NoxInfluencer MCP connector.')
    .replace(/^When this Skill is invoked through an installed Agent plugin \([^\n]+?\), /m,
      'When using this WorkBuddy Expert, ')
    .replace(/^These rules apply only when the active invocation is through an installed Agent plugin[^\n]+/m,
      'These rules apply to this WorkBuddy Expert and its connected NoxInfluencer MCP connector.')
    .replace(/^This adapter applies only to the active installed Agent plugin entrypoint\.[^\n]+/m,
      'This adapter applies to this WorkBuddy Expert and its connected NoxInfluencer MCP connector.')
    .replace('Apply these rules in the installed Agent plugin.', 'Apply these rules in this WorkBuddy Expert.')
    .replace('In an installed Agent plugin, call only tools exposed by the connected `noxinfluencer` provider.',
      'In this WorkBuddy Expert, call only live tools exposed by the connected NoxInfluencer MCP connector (source: `noxinfluencer-mcp`).')
    .replace(/Reuse the current conversation's right-side page[^\n]+/,
      'Reuse an existing view only when trusted WorkBuddy context confirms the same authorized account, exact target plan and view. Otherwise follow the supported Handoff flow below.')
    .replace('Prefer a suitable right-side tab in the current conversation when the host supports targeting it.',
      'Use only an opening capability confirmed available in WorkBuddy; do not assume a particular panel or browser tool.');
  if (manager) text = text.replaceAll('`noxinfluencer`', `\`${productSkillName}\``)
    .replace(/For Campaign presentation,[^\n]*sibling product Skill\./,
      `For Campaign presentation, follow the [product Handoff rules](../${productSkillName}/references/handoffs.md).`);
  return Buffer.from(text.trimEnd() + '\n');
}

function localized(value, label) {
  requireValue(value && ['zh', 'en'].every(lang => typeof value[lang] === 'string' && value[lang].trim()), `${label} requires zh/en text`);
}

function sameMembers(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length && new Set(actual).size === expected.length
    && expected.every(value => actual.includes(value));
}

/** Validate the assembled package, including references between the two Skills. */
export function validateExpertEntries(entries) {
  requireValue(entries instanceof Map && entries.size <= 256, 'Expert requires a bounded file map');
  const readJson = path => {
    requireValue(entries.has(path), `Missing Expert resource: ${path}`);
    return JSON.parse(entries.get(path));
  };
  const manifest = readJson(manifestPath);
  requireValue(manifest.name === agentName && manifest.plugin === manifest.name, 'Expert name/plugin must match its stable identity');
  requireValue(semver.test(manifest.version), 'Expert version must be semantic versioning');
  requireValue(typeof manifest.description === 'string' && manifest.description.trim(), 'Expert requires a description');
  requireValue(manifest.author?.name?.trim() && manifest.author?.email?.trim(), 'Expert requires author name/email');
  requireValue(manifest.expertType === 'agent' && manifest.agentName === agentName, 'Expert must select the bundled Agent');
  requireValue(isDeepStrictEqual(manifest.dependencies, { connectors: [connectorSource] }), `Expert connector dependency must be source: ${connectorSource}`);
  requireValue(sameMembers(manifest.agents, [`./agents/${agentName}.md`]), 'Expert agents must reference the bundled Agent');
  requireValue(sameMembers(manifest.skills, skillNames.map(name => `./skills/${name}`)), 'Expert must declare both plugin Skills');
  requireValue(manifest.categoryId === '05-MarketingGrowth', 'Expert requires the MarketingGrowth category');
  for (const field of ['displayName', 'profession', 'displayDescription', 'defaultInitPrompt']) localized(manifest[field], field);
  requireValue([...manifest.displayDescription.zh].length >= 40 && [...manifest.displayDescription.zh].length <= 50, 'Expert Chinese description must be 40-50 characters');
  for (const field of ['tags', 'quickPrompts']) {
    requireValue(Array.isArray(manifest[field]) && manifest[field].length === 3, `${field} must contain three entries`);
    manifest[field].forEach((value, index) => localized(value, `${field}[${index}]`));
  }
  requireValue(isDeepStrictEqual(manifest.defaultInitPrompt, manifest.quickPrompts[0]), 'Default prompt must equal the first quickPrompt');
  const agent = frontmatter(entries.get(`agents/${agentName}.md`), 'Agent');
  requireValue(agent.fields.name === agentName && agent.body.trim(), 'Agent name/body must match the selected Agent');
  requireValue(typeof agent.fields.description === 'string' && agent.fields.description.trim(), 'Agent requires a description');
  requireValue(!Object.hasOwn(agent.fields, 'tools'), 'Agent tools are assigned by WorkBuddy');
  requireValue(sameMembers(agent.fields.skills, skillNames), 'Agent must preload the two bundled Skills');
  requireValue(agent.fields.maxTurns === undefined || Number.isInteger(agent.fields.maxTurns) && agent.fields.maxTurns > 0, 'Invalid Agent maxTurns');
  for (const field of ['displayName', 'profession']) {
    localized(agent.fields[field], `Agent ${field}`);
    requireValue(isDeepStrictEqual(agent.fields[field], manifest[field]), `Agent ${field} must match the manifest`);
  }
  assertSafeRelativePath(manifest.avatar, 'Avatar');
  requireValue(manifest.avatar === 'avatars/expert.png', 'Expert avatar must use its bundled path');
  const avatar = entries.get(manifest.avatar);
  requireValue(avatar?.length >= 24 && avatar.length <= 500 * 1024 && avatar.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && avatar.readUInt32BE(16) === 512 && avatar.readUInt32BE(20) === 512, 'Expert avatar must be a 512x512 PNG of at most 500KB');
  for (const name of skillNames) {
    const skill = frontmatter(entries.get(`skills/${name}/SKILL.md`), name);
    requireValue(skill.fields.name === name && skill.fields.description?.trim() && skill.body.trim(), `Wrong or incomplete Skill name: ${name}`);
  }
  requireValue(entries.has('README.md'), 'Expert requires README.md');
  for (const [path, bytes] of entries) {
    assertSafeRelativePath(path);
    requireValue(path === manifestPath || path === 'README.md' || path === manifest.avatar || path === `agents/${agentName}.md`
      || skillNames.some(name => path.startsWith(`skills/${name}/`)), `Unexpected Expert resource: ${path}`);
    requireValue(Buffer.isBuffer(bytes), `Invalid Expert resource: ${path}`);
    if (path === manifest.avatar) continue;
    assertPublicFile(path, bytes);
    if (!path.endsWith('.md')) continue;
    const text = bytes.toString('utf8');
    requireValue(!/\{baseDir\}|codex mcp login|start-codex-oauth|codex-plugin-runtime|noxinfluencer\.codex\.user|\bcua_repl\b/.test(text), `Inapplicable host instructions: ${path}`);
    if (path.startsWith(`skills/${managerSkillName}/`)) {
      requireValue(!/`noxinfluencer`|`influencer-marketing-manager`|Skill's CLI|CLI Connector/.test(text), `Stale Manager execution route: ${path}`);
    }
    const isSkill = path.startsWith('skills/');
    const skillRoot = isSkill ? path.split('/').slice(0, 2).join('/') : null;
    const targets = [];
    for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^(?:[a-z][a-z\d+.-]*:)/i.test(target)) continue;
      targets.push(posix.normalize(posix.join(posix.dirname(path), target)));
    }
    for (const match of text.matchAll(/@(references\/[\w./-]+\.md)\b/g)) {
      requireValue(skillRoot, `Reference outside a Skill: ${path}`);
      targets.push(`${skillRoot}/${match[1]}`);
    }
    for (const target of targets) {
      assertSafeRelativePath(target, 'Expert reference');
      requireValue(!isSkill || skillNames.some(name => target.startsWith(`skills/${name}/`)), `Skill reference escapes bundled Skills: ${path} -> ${target}`);
      requireValue(entries.has(target), `Missing Expert resource: ${path} -> ${target}`);
    }
  }
  return manifest;
}

/** Assemble from canonical sources rather than copying a possibly stale snapshot. */
export function createExpertEntries({ root = repositoryRoot } = {}) {
  root = resolve(root);
  const meta = JSON.parse(input(root, 'scripts/workbuddy/mcp/connector-meta.json'));
  requireValue(meta.type === 'mcp' && meta.source === connectorSource, `MCP connector source must be ${connectorSource}`);
  const generated = createOutputs(root);
  const entries = new Map();
  for (const path of [manifestPath, `agents/${agentName}.md`, 'README.md', 'avatars/expert.png']) {
    entries.set(path, input(root, `${expertPath}/${path}`, path.endsWith('.png')));
  }
  const sourceSkills = [
    ['plugins/noxinfluencer/skills/noxinfluencer-mcp', 'noxinfluencer-mcp', productSkillName],
    ['plugins/noxinfluencer/skills/influencer-marketing-manager', 'influencer-marketing-manager', managerSkillName],
  ];
  for (const [sourcePath, sourceName, outputName] of sourceSkills) {
    const files = generated.outputs.get(sourcePath);
    requireValue(files instanceof Map, `Missing generated Skill: ${sourcePath}`);
    for (const [path, bytes] of files) {
      if (path === 'scripts/start-codex-oauth.ps1') continue;
      requireValue(path === 'SKILL.md' || path.endsWith('.md') && path.startsWith('references/'), `Review new Expert Skill resource: ${path}`);
      const target = path.replace('codex-plugin-runtime.md', 'workbuddy-runtime.md');
      const content = path === 'SKILL.md' ? renameSkill(bytes, sourceName, outputName) : bytes;
      entries.set(`skills/${outputName}/${target}`, adaptMarkdown(content, { manager: outputName === managerSkillName }));
    }
  }
  entries.set(`skills/${productSkillName}/references/oauth-and-scopes.md`, input(root, 'scripts/workbuddy/mcp/oauth-and-scopes.md'));
  for (const [name, other] of [[productSkillName, managerSkillName], [managerSkillName, productSkillName]]) {
    const path = `skills/${name}/SKILL.md`;
    const content = entries.get(path).toString();
    entries.set(path, Buffer.from(content + `\nFor this Expert, load the same-package [${other}](../${other}/SKILL.md) when its role is needed. Keep the selected MCP account and execution context throughout the workflow.\n`));
  }
  const manifest = validateExpertEntries(entries);
  return { entries, manifest };
}

/** Explicitly refresh the reviewable local snapshots; packaging does not require sync. */
export function syncExpert({ root = repositoryRoot } = {}) {
  const { entries } = createExpertEntries({ root });
  const files = new Map([...entries].filter(([path]) => path.startsWith('skills/')).map(([path, bytes]) => [path.slice(7), bytes]));
  const targetPath = resolve(root, expertPath, 'skills');
  replaceTargetsAtomically([{ kind: 'directory', targetPath, files }], { trustedRoot: root });
  return { path: targetPath, files: files.size };
}

export async function packageExpert({ root = repositoryRoot, output } = {}) {
  root = resolve(root);
  const { entries } = createExpertEntries({ root });
  const path = resolve(root, output ?? defaultArchive);
  const inDist = relative(resolve(root, 'dist'), path);
  requireValue(inDist && !inDist.startsWith('..') && !isAbsolute(inDist) && path.endsWith('.zip'), 'Expert ZIP output must be inside the repository dist directory');
  const zip = new yazl.ZipFile();
  for (const name of [...entries.keys()].sort(comparePortablePaths)) {
    zip.addBuffer(entries.get(name), name, { mtime: new Date('1980-01-01T00:00:00Z'), mode: 0o100644 });
  }
  zip.end();
  const chunks = [];
  for await (const chunk of zip.outputStream) chunks.push(chunk);
  const contents = Buffer.concat(chunks);
  replaceTargetsAtomically([{ kind: 'file', targetPath: path, contents }], { trustedRoot: root });
  return { path, files: entries.size, sha256: createHash('sha256').update(contents).digest('hex') };
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0]?.startsWith('--') || !args.length ? 'package' : args.shift();
  let output;
  let check = action === 'check';
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--output' && args[index + 1]) output = args[++index];
    else throw new Error('Usage: node scripts/workbuddy/package_expert.mjs [package|check|sync] [--check] [--output dist/name.zip]');
  }
  requireValue(['package', 'check', 'sync'].includes(action), 'Unknown Expert action');
  requireValue(!output || action === 'package' && !check, '--output requires package mode');
  if (check) {
    const { entries } = createExpertEntries();
    console.log(`WorkBuddy Expert checks passed (${entries.size} files, 2 plugin Skills, connector: ${connectorSource})`);
  } else if (action === 'sync') console.log(JSON.stringify(syncExpert(), null, 2));
  else console.log(JSON.stringify(await packageExpert({ output }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
