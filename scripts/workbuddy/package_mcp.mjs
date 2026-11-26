import { createHash } from 'node:crypto';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { parseDocument } from 'yaml';
import yazl from 'yazl';
import { assertPublicFile, repositoryRoot, validateSkill } from '../../v2/scripts/build.mjs';
import {
  assertNoSymbolicLinkComponents, assertSafeRelativePath, comparePortablePaths, readBoundedRegularFile,
  readCanonicalTextFile, readDirectoryFileMap, replaceTargetsAtomically,
} from '../../v2/scripts/lib/canonical-files.mjs';
import { renderToolReferences } from './mcp_tool_references.mjs';

const skillName = 'noxinfluencer-mcp';
const connectorSource = 'noxinfluencer-mcp';
const upstreamMcpServerName = 'noxinfluencer';
const pluginPath = 'plugins/noxinfluencer';
const skillPath = `${pluginPath}/skills/${skillName}`;
const runtimePath = 'references/workbuddy-runtime.md';
export const mcpVersion = '1.0.4';
const defaultArchive = 'dist/noxinfluencer-workbuddy-mcp.zip';
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const [nodeMajor, nodeMinor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22 || nodeMajor === 22 && nodeMinor < 22) {
  throw new Error('WorkBuddy MCP packaging requires Node.js 22.22 or newer.');
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function input(root, relativePath, inputs, binary = false) {
  assertSafeRelativePath(relativePath);
  requireValue(relativePath.startsWith(`${pluginPath}/`), `MCP content must come from ${pluginPath}: ${relativePath}`);
  const path = resolve(root, relativePath);
  assertNoSymbolicLinkComponents(root, path);
  inputs.add(relativePath);
  return binary ? readBoundedRegularFile(path) : readCanonicalTextFile(path);
}

/** Only WorkBuddy listing/configuration belongs here; Skill content comes from the plugin. */
function createMetadata(server, version) {
  return {
    name: 'Nox 聚星红人营销 MCP', name_zh: 'Nox 聚星红人营销 MCP', name_en: 'NoxInfluencer MCP',
    description: '在 WorkBuddy 中查找和分析红人，查看红人分组、内容监测项目和智能营销计划。',
    description_zh: '在 WorkBuddy 中查找和分析红人，查看红人分组、内容监测项目和智能营销计划。',
    description_en: 'Find and analyze creators, and view creator collections, monitoring projects, and campaigns.',
    source: connectorSource, type: 'mcp', version, auth_mode: 'server-side',
    server_auth: { auth_type: 'mcp_oauth', data: { mcp_oauth: {
      server_url: server.url, scopes: 'noxinfluencer.agent.user',
    } } },
    examples_zh: ['查看我的智能营销计划任务', '列出我保存的红人分组', '查找近期发布过露营内容的美国 YouTube 红人'],
    examples_en: ['Show my intelligent marketing plan tasks.', 'List my saved creator collections.',
      'Find US YouTube creators who recently posted content about camping.'],
    minWorkbuddyVersion: '4.24.0',
  };
}

function markdownSection(text, heading) {
  const start = text.indexOf(`\n${heading}\n`);
  requireValue(start >= 0, `Missing plugin documentation section: ${heading}`);
  const rest = text.slice(start + 1);
  const end = rest.indexOf('\n## ', heading.length);
  return (end < 0 ? rest : rest.slice(0, end)).trim();
}

/** Select the plugin's WorkBuddy route and shared recovery rules; omit other hosts' login routes. */
function createOAuthReference(bytes) {
  const text = bytes.toString('utf8');
  const workbuddy = markdownSection(text, '## WorkBuddy Authorization')
    .replaceAll('this installed plugin', 'this connector')
    .replaceAll("this plugin's NoxInfluencer MCP connection", 'this NoxInfluencer MCP connector')
    .replace('through the shared continuation steps above', 'through the shared continuation steps below')
    .replace(/^In WorkBuddy, do not execute the Codex section below[^\n]+/m,
      'Use the actual connection and reconnect controls provided by WorkBuddy for this connector.');
  const continuation = markdownSection(text, '## One Attempt, Then Resume')
    .replace(' The additional first-connection condition in the Codex route applies only to Codex.', '')
    .replace('and the matching route below', 'for this connector');
  return adaptMarkdown(Buffer.from('# WorkBuddy MCP Authorization And Task Continuation\n\n' +
    `Use the WorkBuddy MCP connector with source \`${connectorSource}\` and scope \`noxinfluencer.agent.user\`. Keep account identity and authorization inside WorkBuddy.\n\n` +
    [workbuddy, continuation, markdownSection(text, '## Failure Boundaries')].join('\n\n') + '\n'));
}

function readTools(bytes, sourceToolList) {
  const catalog = JSON.parse(bytes);
  requireValue(catalog.schema_version === 1 && Array.isArray(catalog.tools)
    && catalog.tools.length > 0 && catalog.tools.length <= 2048, 'Invalid plugin MCP tool catalog');
  const names = new Set();
  const ajv = new Ajv({ strict: false });
  for (const tool of catalog.tools) {
    requireValue(tool && typeof tool.name === 'string' && /^[a-z][a-z0-9_]*$/.test(tool.name)
      && !names.has(tool.name), `Invalid or duplicate MCP tool name: ${tool?.name}`);
    names.add(tool.name);
    requireValue(typeof tool.description === 'string' && tool.description.trim(), `Missing MCP tool description: ${tool.name}`);
    requireValue(typeof tool.workflow === 'string' && /^[a-z0-9-]+$/.test(tool.workflow), `Invalid MCP workflow: ${tool.name}`);
    requireValue(tool.input_schema?.type === 'object' && ajv.validateSchema(tool.input_schema), `Invalid MCP input schema: ${tool.name}`);
  }
  const listed = [...sourceToolList.toString('utf8').matchAll(/^- `([a-z][a-z0-9_]*)`\s*$/gm)].map(match => match[1]);
  requireValue(listed.length === names.size && new Set(listed).size === names.size && listed.every(name => names.has(name)),
    'Plugin MCP tool catalog does not match the Skill tool-list; update both plugin resources together');
  return catalog.tools;
}

function adaptMarkdown(bytes) {
  return Buffer.from(bytes.toString('utf8')
    .replace(/^## Skill resource paths\r?\n[\s\S]*?(?=^## )/m, '')
    .replace(/^description: Operate NoxInfluencer creator and Campaign workflows[^\n]+/m,
      'description: Use the NoxInfluencer WorkBuddy connector for creator research, collections, CRM, monitoring, and intelligent marketing plans.')
    .replaceAll('{baseDir}/references/', '@references/')
    .replace(/`(references\/[\w./-]+\.md)`/g, '`@$1`')
    .replaceAll('@references/codex-plugin-runtime.md', `@${runtimePath}`)
    .replace(/^When invoked through an installed Agent plugin .*? all NoxInfluencer business operations use MCP\./m,
      'When using the NoxInfluencer WorkBuddy connector, all NoxInfluencer business operations use MCP.')
    .replace(/^These rules apply only when the active invocation is through an installed Agent plugin[^\n]+/m,
      'These rules apply when using the NoxInfluencer WorkBuddy connector.')
    .replace(/^This adapter applies only to the active installed Agent plugin entrypoint\.[^\n]+/m,
      'This adapter applies when using the NoxInfluencer WorkBuddy connector.')
    .replace('In an installed Agent plugin, call only tools exposed by the connected `noxinfluencer` provider.',
      'In WorkBuddy, call only live tools exposed by this NoxInfluencer MCP connector (source: `noxinfluencer-mcp`).')
    .replace(/^- Use `influencer-marketing-manager`[^\n]+\n/m, '')
    .replaceAll(' Shared Manager examples do not override this entrypoint.', '')
    .replaceAll(' Shared business references and Manager examples follow this plugin policy in the installed plugin.', '')
    .replace(/^The shared influencer-marketing-manager supplies business judgment[^\n]+\n/m,
      'Read the required runtime rules before executing NoxInfluencer operations. Reuse loaded instructions without recursive handoffs.\n')
    .trimEnd() + '\n');
}

/** Read physical plugin files only; WorkBuddy structure and adapters are generated in memory. */
export function createMcpEntries({ root = repositoryRoot, version = mcpVersion } = {}) {
  root = resolve(root);
  requireValue(typeof version === 'string' && semver.test(version), 'MCP version must be semantic versioning');
  const inputs = new Set();
  const read = (path, binary = false) => input(root, `${pluginPath}/${path}`, inputs, binary);
  const absoluteSkill = resolve(root, skillPath);
  assertNoSymbolicLinkComponents(root, absoluteSkill);
  const source = readDirectoryFileMap(absoluteSkill);

  const skill = new Map();
  for (const [path, bytes] of source) {
    inputs.add(`${skillPath}/${path}`);
    if (path === 'scripts/start-codex-oauth.ps1') continue;
    if (path !== 'SKILL.md' && !/^references\/[^/]+\.md$/.test(path)) {
      throw new Error(`Review new WorkBuddy Skill resource: ${path}`);
    }
    const target = path === 'references/codex-plugin-runtime.md' ? runtimePath : path;
    skill.set(target, adaptMarkdown(bytes));
  }
  requireValue(source.has('references/oauth-and-scopes.md') && source.has('references/tool-list.md'), 'Missing plugin OAuth/tool-list resource');
  skill.set('references/oauth-and-scopes.md', createOAuthReference(source.get('references/oauth-and-scopes.md')));
  const tools = readTools(read('resources/mcp-tools.json'), source.get('references/tool-list.md'));
  for (const [path, bytes] of renderToolReferences(tools)) skill.set(path, bytes);

  requireValue(skill.has('SKILL.md'), 'Missing plugin SKILL.md');
  const frontmatter = parseDocument(skill.get('SKILL.md').toString().split(/^---\s*$/m)[1]);
  if (frontmatter.errors.length || frontmatter.get('name') !== skillName || !frontmatter.get('description')) {
    throw new Error(`WorkBuddy SKILL.md requires name: ${skillName} and a description`);
  }
  validateSkill(skill);
  for (const [path, bytes] of skill) {
    const markdown = bytes.toString('utf8');
    if (/\{baseDir\}|codex mcp login|start-codex-oauth|noxinfluencer\.codex\.user|influencer-marketing-manager|\bManager examples\b/i.test(markdown)) {
      throw new Error(`Inapplicable WorkBuddy guidance in ${path}`);
    }
    for (const [, target] of markdown.matchAll(/@(references\/[\w./-]+\.md)\b/g)) {
      if (!skill.has(target)) throw new Error(`Missing WorkBuddy Skill resource: ${path} -> ${target}`);
    }
  }

  const { mcpServers } = JSON.parse(read('.mcp.json'));
  const server = mcpServers?.[upstreamMcpServerName];
  requireValue(server && ['http', 'streamableHttp'].includes(server.type) && typeof server.url === 'string'
    && new URL(server.url).protocol === 'https:', 'Plugin requires an HTTPS MCP server');
  const meta = createMetadata(server, version);
  for (const field of ['name', 'name_en', 'description', 'description_zh', 'description_en', 'source', 'version']) {
    if (typeof meta[field] !== 'string' || !meta[field].trim()) throw new Error(`Missing Connector metadata: ${field}`);
  }
  for (const field of ['examples_zh', 'examples_en']) {
    if (!Array.isArray(meta[field]) || !meta[field].length || meta[field].some(example => typeof example !== 'string' || !example.trim())) {
      throw new Error(`Connector metadata requires examples in ${field}`);
    }
  }
  if (meta.source !== connectorSource) {
    throw new Error(`WorkBuddy MCP connector source must be ${connectorSource}`);
  }
  const auth = meta.server_auth;
  const oauth = auth?.data?.mcp_oauth;
  if (meta.type !== 'mcp' || !server || new URL(server.url).protocol !== 'https:'
    || meta.auth_mode !== 'server-side' || auth?.auth_type !== 'mcp_oauth'
    || oauth?.server_url !== server.url || oauth?.scopes !== 'noxinfluencer.agent.user') {
    throw new Error('WorkBuddy connector requires server-side mcp_oauth with the configured HTTPS MCP URL and Agent scope');
  }
  if (['client_id', 'client_secret', 'redirect_uri'].some(field => field in oauth)) {
    throw new Error('WorkBuddy manages OAuth client registration fields; omit them from the package');
  }
  const config = { mcpServers: { [meta.source]: { type: 'streamableHttp', url: server.url, timeout: 30000 } } };
  const entries = new Map([
    ['connector-meta.json', json(meta)],
    ['mcp.json', json(config)],
    ['icon.png', read('assets/icon.png', true)],
    ...[...skill].map(([path, bytes]) => [`skills/${skillName}/${path}`, bytes]),
  ]);
  for (const [path, bytes] of entries) assertPublicFile(path, bytes);
  return { entries, toolCount: tools.length, meta, inputs: [...inputs].sort(comparePortablePaths) };
}

export async function packageMcp({ root = repositoryRoot, version = mcpVersion, outputPath } = {}) {
  root = resolve(root);
  const { entries, toolCount, meta } = createMcpEntries({ root, version });
  const output = resolve(root, outputPath ?? defaultArchive);
  const inDist = relative(resolve(root, 'dist'), output);
  requireValue(inDist && !inDist.startsWith('..') && !isAbsolute(inDist) && output.endsWith('.zip'),
    'MCP ZIP output must be inside the repository dist directory');
  const zip = new yazl.ZipFile();
  for (const path of [...entries.keys()].sort(comparePortablePaths)) {
    zip.addBuffer(entries.get(path), path, { mtime: new Date('1980-01-01T00:00:00Z'), mode: 0o100644 });
  }
  zip.end();
  const chunks = [];
  for await (const chunk of zip.outputStream) chunks.push(chunk);
  const contents = Buffer.concat(chunks);
  replaceTargetsAtomically([{ kind: 'file', targetPath: output, contents }], { trustedRoot: root });
  return { path: output, version: meta.version, files: entries.size, tools: toolCount,
    sha256: createHash('sha256').update(contents).digest('hex') };
}

async function main() {
  const args = process.argv.slice(2);
  let check = false;
  let outputPath;
  let version;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--version' && args[index + 1]) version = args[++index];
    else if (args[index] === '--output' && args[index + 1]) outputPath = args[++index];
    else throw new Error('Usage: node scripts/workbuddy/package_mcp.mjs [--check] [--version x.y.z] [--output dist/name.zip]');
  }
  requireValue(!check || !outputPath, '--output requires package mode');
  if (check) {
    const { entries, toolCount, meta } = createMcpEntries({ version });
    console.log(`WorkBuddy MCP checks passed (version ${meta.version}, ${entries.size} files, ${toolCount} tools documented)`);
  } else console.log(JSON.stringify(await packageMcp({ version, outputPath }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
