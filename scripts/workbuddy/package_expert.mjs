import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { resolve, relative, isAbsolute, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument, stringify } from 'yaml';
import yazl from 'yazl';
import { markdownSection, workBuddyOAuthReference } from './markdown.mjs';
import { repositoryRoot, assertPublicFile } from '../../v2/scripts/build.mjs';
import { bindManagerProductSkill } from '../../v2/scripts/lib/manager-skill.mjs';
import {
  assertNoSymbolicLinkComponents, assertSafeRelativePath, comparePortablePaths,
  readBoundedRegularFile, readCanonicalTextFile, readDirectoryFileMap, replaceTargetsAtomically,
} from '../../v2/scripts/lib/canonical-files.mjs';

export const pluginPath = 'plugins/noxinfluencer';
export const productSkillName = 'noxinfluencer-plugin';
export const managerSkillName = 'influencer-marketing-manager-plugin';
const connectorSource = 'noxinfluencer-mcp';
// WorkBuddy uses this name to identify the existing Expert asset during updates.
export const expertName = 'influencer-marketing-manager';
export const expertVersion = '0.1.3';
const agentName = expertName;
const manifestPath = '.codebuddy-plugin/plugin.json';
const skillNames = [productSkillName, managerSkillName];
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || nodeMajor === 22 && nodeMinor < 22) {
  throw new Error('WorkBuddy Expert packaging requires Node.js 22.22 or newer.');
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function input(root, path, binary = false, inputs) {
  assertSafeRelativePath(path);
  requireValue(path.startsWith(`${pluginPath}/`), `Expert content must come from ${pluginPath}: ${path}`);
  const target = resolve(root, path);
  assertNoSymbolicLinkComponents(root, target);
  inputs?.add(path);
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

/** WorkBuddy presentation is generated here; business guidance stays in the two plugin Skills. */
function createManifest(plugin, display, version) {
  requireValue(plugin.name === 'noxinfluencer', 'Unexpected plugin identity');
  requireValue(plugin.author?.name?.trim() && plugin.author?.email?.trim(), 'The plugin manifest requires author name/email for Expert packaging');
  const quickPrompts = [
    { zh: '打开我的智能营销计划列表，梳理合作进展', en: 'Open my intelligent marketing plan list and summarize partnership progress' },
    { zh: '帮我寻找并筛选适合推广这款产品的红人', en: 'Find and shortlist creators suited to promoting this product' },
    { zh: '根据我的产品和目标市场，制定红人营销策略', en: 'Develop an influencer marketing strategy for my product and target market' },
  ];
  return {
    name: expertName, version, description: plugin.description, author: plugin.author,
    agents: [`./agents/${agentName}.md`], skills: skillNames.map(name => `./skills/${name}`),
    dependencies: { connectors: [connectorSource] }, expertType: 'agent', agentName,
    displayName: { en: `${display.displayName ?? plugin.author.name} Marketing Expert`, zh: 'Nox 聚星·红人营销专家' },
    profession: { en: 'Influencer Marketing Expert', zh: '红人营销专家' },
    displayDescription: {
      en: display.longDescription ?? plugin.description,
      zh: '结合Nox聚星红人数据，提供营销策略、红人筛选与合作分析，协助推进邀约、跟进和营销计划管理。',
    },
    avatar: 'avatars/expert.png', categoryId: '05-MarketingGrowth',
    defaultInitPrompt: quickPrompts[0], plugin: expertName,
    tags: [{ en: 'Marketing Strategy', zh: '营销策略' }, { en: 'Creator Discovery', zh: '红人筛选' }, { en: 'Partnership Management', zh: '合作管理' }],
    quickPrompts, keywords: plugin.keywords, homepage: plugin.homepage, license: 'SEE LICENSE',
  };
}

function createAgent(template, manifest, descriptions) {
  const fields = { name: agentName, description: manifest.description, displayName: manifest.displayName,
    profession: manifest.profession, maxTurns: 100, skills: skillNames };
  const values = { displayName: manifest.displayName.zh, managerSkillName, productSkillName, connectorSource,
    managerDescription: descriptions.manager, productDescription: descriptions.product };
  const body = template.toString('utf8').replace(/\{\{(\w+)\}\}/g, (_, name) => {
    requireValue(Object.hasOwn(values, name), `Unknown Expert Agent template field: ${name}`);
    return values[name];
  });
  return Buffer.from(`---\n${stringify(fields)}---\n\n${body}`);
}

function createReadme(bytes, manifest) {
  const text = bytes.toString('utf8');
  return Buffer.from(`# ${manifest.displayName.zh}\n\n` +
    `Expert: \`${manifest.name}\`, version \`${manifest.version}\`. This distribution is assembled from the NoxInfluencer plugin.\n\n` +
    `Included Skills: \`${managerSkillName}\` and \`${productSkillName}\`. See the [connection and authorization guide](skills/${productSkillName}/references/oauth-and-scopes.md) for connector source \`${connectorSource}\`.\n\n` +
    ['## What You Can Do', '## Connect Your NoxInfluencer Account', '## Example Requests', '## License']
      .map(heading => markdownSection(text, heading)).join('\n\n') + '\n');
}

function createOAuthReference(bytes) {
  const intro = `Use the WorkBuddy connection declared as a dependency by this Expert with source \`${connectorSource}\`.`;
  return adaptMarkdown(Buffer.from(workBuddyOAuthReference(bytes.toString('utf8'), intro)));
}

/** Adapt instructions in memory; shared/V2/plugin source identities are unchanged. */
function adaptMarkdown(bytes) {
  const text = bytes.toString('utf8')
    .replace(/^## Skill resource paths\r?\n[\s\S]*?(?=^## )/m, '')
    .replaceAll('{baseDir}/references/', '@references/')
    .replace(/`(references\/[\w./-]+\.md)`/g, '`@$1`')
    .replace(/\binfluencer-marketing-manager\b(?!-plugin)/g, managerSkillName)
    .replace('The installed Agent plugin uses MCP for all NoxInfluencer operations.',
      'When using this WorkBuddy Expert, all NoxInfluencer business operations use the connected NoxInfluencer MCP connector.')
    .replace('Call only tools exposed by the connected `noxinfluencer` provider.',
      'In this WorkBuddy Expert, call only live tools exposed by the connected NoxInfluencer MCP connector (source: `noxinfluencer-mcp`).');
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
  const authGuide = `../skills/${productSkillName}/references/oauth-and-scopes.md`;
  requireValue([...agent.body.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)].some(match => match[1] === authGuide),
    'Agent must link directly to the bundled connection and authorization guide');
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
    requireValue(path === manifestPath || path === 'README.md' || path === 'LICENSE' || path === manifest.avatar || path === `agents/${agentName}.md`
      || skillNames.some(name => path.startsWith(`skills/${name}/`)), `Unexpected Expert resource: ${path}`);
    requireValue(Buffer.isBuffer(bytes), `Invalid Expert resource: ${path}`);
    if (path === manifest.avatar) continue;
    assertPublicFile(path, bytes);
    if (!path.endsWith('.md')) continue;
    const text = bytes.toString('utf8');
    requireValue(!/\{baseDir\}|codex mcp login|start-codex-oauth|codex-plugin-runtime|noxinfluencer\.codex\.user|\bcua_repl\b/.test(text), `Inapplicable host instructions: ${path}`);
    if (path.startsWith(`skills/${managerSkillName}/`)) {
      requireValue(!/`(?:noxinfluencer|noxinfluencer-mcp|influencer-marketing-manager)`|Skill's CLI|CLI Connector/.test(text), `Stale Manager execution route: ${path}`);
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

/** Read the actual plugin directory only; generate WorkBuddy structure in memory. */
export function createExpertEntries({ root = repositoryRoot, version } = {}) {
  root = resolve(root);
  const inputs = new Set();
  const read = (path, binary = false) => input(root, `${pluginPath}/${path}`, binary, inputs);
  const plugin = JSON.parse(read('.plugin/plugin.json'));
  const display = JSON.parse(read('.codex-plugin/plugin.json')).interface ?? {};
  const mcp = JSON.parse(read('.mcp.json')).mcpServers?.[plugin.name];
  requireValue(mcp && new URL(mcp.url).protocol === 'https:', 'Plugin requires a public HTTPS MCP service');
  requireValue(version === undefined || typeof version === 'string' && semver.test(version), 'Expert version must be semantic versioning');
  const packagedManifest = createManifest(plugin, display, version ?? expertVersion);
  const entries = new Map();
  entries.set(manifestPath, json(packagedManifest));
  entries.set('avatars/expert.png', read('assets/logo.png', true));
  entries.set('README.md', createReadme(read('README.md'), packagedManifest));
  entries.set('LICENSE', read('LICENSE'));
  const descriptions = {};
  const sourceSkills = [
    ['plugins/noxinfluencer/skills/noxinfluencer-mcp', 'noxinfluencer-mcp', productSkillName],
    ['plugins/noxinfluencer/skills/influencer-marketing-manager', 'influencer-marketing-manager', managerSkillName],
  ];
  for (const [sourcePath, sourceName, outputName] of sourceSkills) {
    const absolute = resolve(root, sourcePath);
    assertNoSymbolicLinkComponents(root, absolute);
    const files = readDirectoryFileMap(absolute);
    const sourceSkill = frontmatter(files.get('SKILL.md'), sourceName);
    requireValue(sourceSkill.fields.name === sourceName, `Unexpected plugin Skill identity: ${sourcePath}`);
    const isProduct = outputName === productSkillName;
    descriptions[isProduct ? 'product' : 'manager'] = sourceSkill.fields.description;
    const packagedFiles = isProduct ? files : bindManagerProductSkill(files, 'noxinfluencer-mcp', productSkillName);
    for (const [path, bytes] of packagedFiles) {
      inputs.add(`${sourcePath}/${path}`);
      if (path === 'scripts/start-codex-oauth.ps1') continue;
      if (isProduct && /^references\/tool-parameters-[a-z0-9-]+\.md$/.test(path)) continue;
      requireValue(path === 'SKILL.md' || path.endsWith('.md') && path.startsWith('references/'), `Review new Expert Skill resource: ${path}`);
      let content = path === 'SKILL.md' ? renameSkill(bytes, sourceName, outputName) : bytes;
      if (isProduct && path === 'references/tool-list.md') {
        content = Buffer.from(bytes.toString('utf8')
          .replace(/^See `\{baseDir\}\/references\/tool-parameters-[a-z0-9-]+\.md` for tool purposes and parameters\.\r?\n\r?\n/gm, ''));
      }
      const outputPath = `skills/${outputName}/${path}`;
      entries.set(outputPath, path === 'references/oauth-and-scopes.md' && isProduct
        ? createOAuthReference(bytes) : adaptMarkdown(content));
    }
  }
  entries.set(`agents/${agentName}.md`, createAgent(read('.workbuddy-plugin/expert-agent.md.tmpl'), packagedManifest, descriptions));
  const manifest = validateExpertEntries(entries);
  return { entries, manifest, inputs: [...inputs].sort(comparePortablePaths) };
}

export async function packageExpert({ root = repositoryRoot, output, version } = {}) {
  root = resolve(root);
  const { entries, manifest } = createExpertEntries({ root, version });
  const path = resolve(root, output ?? `dist/noxinfluencer-workbuddy-expert-${manifest.version}.zip`);
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
  return { path, name: manifest.name, version: manifest.version, files: entries.size, sha256: createHash('sha256').update(contents).digest('hex') };
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0]?.startsWith('--') || !args.length ? 'package' : args.shift();
  let output;
  let version;
  let check = action === 'check';
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--output' && args[index + 1]) output = args[++index];
    else if (args[index] === '--version' && args[index + 1]) version = args[++index];
    else throw new Error('Usage: node scripts/workbuddy/package_expert.mjs [package|check] [--check] [--version x.y.z] [--output dist/name.zip]');
  }
  requireValue(['package', 'check'].includes(action), 'Unknown Expert action');
  requireValue(!output || action === 'package' && !check, '--output requires package mode');
  if (check) {
    const { entries, manifest } = createExpertEntries({ version });
    console.log(`WorkBuddy Expert checks passed (${manifest.name}, version ${manifest.version}, ${entries.size} files, 2 plugin Skills, connector: ${connectorSource})`);
  } else console.log(JSON.stringify(await packageExpert({ output, version }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
