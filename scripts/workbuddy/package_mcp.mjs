import { resolve } from 'node:path';
import { parseDocument } from 'yaml';
import yazl from 'yazl';
import { assertPublicFile, createOutputs, repositoryRoot, validateSkill } from '../../v2/scripts/build.mjs';
import {
  assertNoSymbolicLinkComponents, comparePortablePaths, readBoundedRegularFile,
  readCanonicalTextFile, readDirectoryFileMap, replaceTargetsAtomically,
} from '../../v2/scripts/lib/canonical-files.mjs';
import { renderToolReferences } from './mcp/tool-reference.mjs';

const skillName = 'noxinfluencer-mcp';
const connectorSource = 'noxinfluencer-mcp';
const upstreamMcpServerName = 'noxinfluencer';
const pluginPath = 'plugins/noxinfluencer';
const skillPath = `${pluginPath}/skills/${skillName}`;
const runtimePath = 'references/workbuddy-runtime.md';
const mcpInputs = 'scripts/workbuddy/mcp';
const output = resolve(repositoryRoot, 'dist/noxinfluencer-workbuddy-mcp.zip');
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

function input(relativePath, read = readCanonicalTextFile) {
  const path = resolve(repositoryRoot, relativePath);
  assertNoSymbolicLinkComponents(repositoryRoot, path);
  return read(path);
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
    .replace(/^- Use `influencer-marketing-manager`[^\n]+\n/m, '')
    .replaceAll(' Shared Manager examples do not override this entrypoint.', '')
    .replaceAll(' Shared business references and Manager examples follow this plugin policy in the installed plugin.', '')
    .replace(/^The shared influencer-marketing-manager supplies business judgment[^\n]+\n/m,
      'Read the required runtime rules before executing NoxInfluencer operations. Reuse loaded instructions without recursive handoffs.\n')
    .trimEnd() + '\n');
}

function connectorEntries() {
  const generated = createOutputs();
  const expected = generated.outputs.get(skillPath);
  const absoluteSkill = resolve(repositoryRoot, skillPath);
  assertNoSymbolicLinkComponents(repositoryRoot, absoluteSkill);
  const source = readDirectoryFileMap(absoluteSkill);
  if (source.size !== expected.size || [...expected].some(([path, bytes]) => !source.get(path)?.equals(bytes))) {
    throw new Error(`Generated drift: ${skillPath}. Run npm run v2:build and review its changes.`);
  }

  const skill = new Map();
  for (const [path, bytes] of source) {
    if (path === 'scripts/start-codex-oauth.ps1') continue;
    if (path !== 'SKILL.md' && !/^references\/[^/]+\.md$/.test(path)) {
      throw new Error(`Review new WorkBuddy Skill resource: ${path}`);
    }
    const target = path === 'references/codex-plugin-runtime.md' ? runtimePath : path;
    skill.set(target, adaptMarkdown(bytes));
  }
  skill.set('references/oauth-and-scopes.md', input(`${mcpInputs}/oauth-and-scopes.md`));
  const { items: tools } = JSON.parse(input('v2/source/noxinfluencer/snapshots/mcp-tools.json'));
  const purposes = JSON.parse(input(`${mcpInputs}/tool-purposes.json`));
  for (const [path, bytes] of renderToolReferences(tools, purposes)) skill.set(path, bytes);

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

  const meta = JSON.parse(input(`${mcpInputs}/connector-meta.json`));
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
  const { mcpServers } = JSON.parse(generated.files.get(`${pluginPath}/.mcp.json`));
  const server = mcpServers[upstreamMcpServerName];
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
    ['icon.png', input(`${pluginPath}/assets/icon.png`, readBoundedRegularFile)],
    ...[...skill].map(([path, bytes]) => [`skills/${skillName}/${path}`, bytes]),
  ]);
  for (const [path, bytes] of entries) assertPublicFile(path, bytes);
  return { entries, toolCount: tools.length };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
    throw new Error('Usage: node scripts/workbuddy/package_mcp.mjs [--check]');
  }
  const { entries, toolCount } = connectorEntries();
  if (args.length) {
    console.log(`WorkBuddy MCP checks passed (${entries.size} files, ${toolCount} tools documented)`);
    return;
  }

  const zip = new yazl.ZipFile();
  for (const path of [...entries.keys()].sort(comparePortablePaths)) {
    zip.addBuffer(entries.get(path), path, { mtime: new Date('1980-01-01T00:00:00Z'), mode: 0o100644 });
  }
  zip.end();
  const chunks = [];
  for await (const chunk of zip.outputStream) chunks.push(chunk);
  replaceTargetsAtomically([{ kind: 'file', targetPath: output, contents: Buffer.concat(chunks) }], { trustedRoot: repositoryRoot });
  console.log(`Packaged ${output} (${entries.size} files, ${toolCount} tools documented)`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
