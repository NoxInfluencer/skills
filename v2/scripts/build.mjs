import { existsSync, readFileSync } from 'node:fs';
import { resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { loadContracts } from './lib/contract-loader.mjs';
import { validateCapabilityRegistry } from './lib/capability-registry.mjs';
import { validateSharedSemanticSource, validateAssembledMarkdown } from './lib/semantic-source.mjs';
import { renderMcpToolReferences } from './lib/mcp-tool-references.mjs';
import { readDirectoryFileMap, readCanonicalTextFile, assertNoSymbolicLinkComponents,
  assertSafeRelativePath, createFileRecord, replaceTargetsAtomically } from './lib/canonical-files.mjs';

export const repositoryRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sourcePath = 'v2/source/noxinfluencer';
const mcpBuildManifestPath = 'v2/dist/noxinfluencer-mcp.skill-build-manifest.json';
const productSkills = [
  {
    mode: 'universal',
    outputPath: 'skills/noxinfluencer-v2',
    corePath: 'shared/core.md',
    runtimePath: 'universal.md',
    adapters: ['cli', 'mcp'],
    description: 'Operate NoxInfluencer V2 creator and Campaign workflows, including setup and access recovery. Use the available supported CLI or MCP connection selected for this V2 workflow; preserve explicitly selected legacy workflows.',
  },
  {
    mode: 'cli',
    outputPath: 'skills/noxinfluencer-cli',
    corePath: 'shared/core.md',
    runtimePath: 'cli.md',
    adapters: ['cli'],
    description: 'Operate NoxInfluencer V2 creator and Campaign workflows through the isolated NoxInfluencer CLI, including installation, authorization, and access recovery.',
  },
  {
    mode: 'mcp',
    outputPath: 'plugins/noxinfluencer/skills/noxinfluencer-mcp',
    corePath: 'adapters/mcp/core.md',
    runtimePath: 'adapters/plugin/runtime.md',
    adapters: ['mcp', 'plugin'],
    description: 'Operate NoxInfluencer creator and Campaign workflows through this plugin’s connected MCP provider. Use for product operations in this plugin; explicitly selected standalone workflows keep their own entrypoint.',
  },
];
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const mcpExcludedReferences = new Set(['brand-monitor.md', 'outreach-and-messaging.md', 'product-short-link-affiliation.md']);
const mcpExcludedSections = new Map([
  ['creator.md', new Set(['Connected-Store Target Invitations'])],
  ['monitor.md', new Set(['Future Content'])],
  ['campaign-agent-automation.md', new Set(['Campaign workspace smart actions', 'Showing completed work in the Campaign workspace', 'Finishing a creator-reply automation run'])],
]);
const mcpReferencePresentationOverrides = new Map([
  ['campaign-invitation-management.md', [
    ['For showing completed work in the SaaS Campaign workspace after the final answer, use the page-coordination guidance in `{baseDir}/references/campaign-agent-automation.md`.',
      'For Campaign invitation presentation, follow `{baseDir}/references/handoffs.md`.'],
    [' Use the workspace navigation guidance for the page link.', ''],
  ]],
  ['marketing-plan-and-campaign.md', [
    ['Read operations should return useful plan summaries without opening a page. Open a page only when the user asks to continue visually or explicitly approves a supported page handoff.',
      'Return useful plan summaries. For Campaign presentation, follow `{baseDir}/references/handoffs.md`.'],
  ]],
]);

/** 检查公开输入和产物，拒绝密钥、本机路径、内网地址及内嵌宿主依赖。 */
export function assertPublicFile(path, bytes) {
  assertSafeRelativePath(path);
  if (/(?:^|\/)(?:\.env(?:\.[^/]*)?|id_rsa)(?:$|\/)|\.(?:pem|key|p12|pfx|log)$/i.test(path)) throw new Error(`Non-public filename: ${path}`);
  const text = bytes.toString('utf8');
  if (/codex_controller|phase3_isolated|publishable|-----BEGIN [A-Z ]*PRIVATE KEY-----/u.test(text)
    || /(?:api[_-]?key|client[_-]?secret|access[_-]?token)\s*[:=]\s*["']?[a-z0-9._~+/=-]{16,}/iu.test(text)
    || /authorization:\s*bearer\s+[a-z0-9._~+/=-]{16,}/iu.test(text)
    || /(?:^|[\s"'`(=])[a-z]:[\\/](?![<%$])[^\s"'`<>|?*]+/iu.test(text)
    || /(?:^|[\s"'`(=])\/(?:Users|home|root|opt|etc|var|tmp)\/(?![<%$])[^\s"'`<>]+/u.test(text)
    || /https?:\/\/(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(?=[:/\s]|$)/iu.test(text)) {
    throw new Error(`Non-public content: ${path}`);
  }
}

/** 验证最终包内部链接及内容，确保搬走插件后不依赖仓库外部文件。 */
export function validateSkill(files) {
  validateAssembledMarkdown(files);
  for (const [path, bytes] of files) {
    assertPublicFile(path, bytes);
    if (!path.endsWith('.md')) continue;
    const text = bytes.toString();
    const links = [...text.matchAll(/\{baseDir\}\/([a-zA-Z0-9_./-]+)/g)].map(match => match[1]);
    for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^(?:https?:|\{baseDir\})/.test(link)) continue;
      links.push(posix.normalize(posix.join(posix.dirname(path), link)));
    }
    for (const link of links) if (!files.has(link)) throw new Error(`Missing Skill resource: ${path} -> ${link}`);
  }
}

/** 用同一业务源组装通用、固定 CLI 和固定 MCP 入口。 */
export function createOutputs(root = repositoryRoot) {
  const source = resolve(root, sourcePath);
  assertNoSymbolicLinkComponents(root, source);
  const sourceFiles = readDirectoryFileMap(source);
  for (const [path, bytes] of sourceFiles) assertPublicFile(path, bytes);
  validateSharedSemanticSource(source);
  const contracts = loadContracts({ sourceRoot: source });
  const report = validateCapabilityRegistry(contracts);
  const outputs = new Map();
  let mcpBuildManifest;
  const read = path => sourceFiles.get(path) ?? (() => { throw new Error(`Missing source: ${path}`); })();
  const cliVersion = contracts.snapshots.get('cli-schema').version;
  for (const { mode, outputPath, corePath, runtimePath, adapters, description } of productSkills) {
    const files = new Map();
    const used = new Set([corePath, runtimePath]);
    const add = (target, bytes, original) => {
      if (files.has(target)) throw new Error(`Output collision: ${target}`);
      files.set(target, bytes); if (original) used.add(original);
    };
    for (const [path, bytes] of sourceFiles) {
      if (path.startsWith('shared/references/')) {
        const name = path.slice('shared/references/'.length);
        if (mode === 'mcp' && (mcpExcludedReferences.has(name) || sourceFiles.has(`adapters/mcp/references/${name}`) || sourceFiles.has(`adapters/plugin/references/${name}`))) continue;
        const excluded = mode === 'mcp' && mcpExcludedSections.get(name);
        let content = excluded ? Buffer.from(bytes.toString().split(/(?=^## )/m)
          .filter(section => !excluded.has(section.match(/^## (.+)\r?$/m)?.[1])).join('').trimEnd() + '\n') : bytes;
        if (mode === 'mcp' && mcpReferencePresentationOverrides.has(name)) {
          let markdown = content.toString();
          for (const [original, replacement] of mcpReferencePresentationOverrides.get(name)) {
            if (!markdown.includes(original)) throw new Error(`Missing shared presentation text: ${path}`);
            markdown = markdown.replace(original, replacement);
          }
          content = Buffer.from(markdown);
        }
        add(path.replace('shared/', ''), content, path);
      }
    }
    for (const runtime of adapters) {
      const prefix = `adapters/${runtime}/`;
      for (const [path, bytes] of sourceFiles) {
        if (!path.startsWith(prefix)) continue;
        const name = path.slice(prefix.length);
        if (name === 'frontmatter.yaml' || name === 'core.md') continue;
        if (runtime === 'plugin' && name === 'manager-context.md') continue;
        // Plugin policy overrides only the installed-plugin output, never the universal Skill.
        if (mode === 'mcp' && runtime === 'mcp' && sourceFiles.has(`adapters/plugin/${name}`)) continue;
        // Runtime-specific replacements belong only to the fixed MCP entrypoint.
        if (mode === 'universal' && name.startsWith('references/') && sourceFiles.has(`shared/${name}`)) continue;
        let target;
        if (name === 'runtime.md') target = `references/runtime-${runtime === 'plugin' ? 'mcp' : runtime}.md`;
        else if (name.startsWith('assets/')) target = name.slice(7);
        else if (name.startsWith('scripts/') || name.startsWith('references/')) target = name;
        else if (name.endsWith('.md')) target = `references/${name}`;
        else continue;
        add(target, bytes, path);
      }
    }
    if (adapters.includes('mcp')) {
      const tools = contracts.snapshots.get('mcp-tools').items;
      for (const [path, content] of renderMcpToolReferences(tools, { plugin: mode === 'mcp' })) {
        add(path, content, 'snapshots/mcp-tools.json');
      }
    }
    if (mode === 'universal') add('references/setup.md', read('setup.md'), 'setup.md');
    if (adapters.includes('cli')) {
      add('cli-package.json', json({ name: '@noxinfluencer/cli', version: cliVersion, bin: 'dist/main.js' }), 'snapshots/cli-schema.json');
    }
    const name = posix.basename(outputPath);
    const body = read(runtimePath).toString();
    const managerBoundary = '\n\nThe shared influencer-marketing-manager supplies business judgment, not transport selection. Its examples do not override this product entrypoint. Read the required runtime rules before executing NoxInfluencer operations; reuse loaded instructions without recursive handoffs.\n';
    add('SKILL.md', Buffer.from(`---\nname: ${name}\ndescription: ${description}\n---\n\n${read(corePath)}\n${body}${managerBoundary}`));
    validateSkill(files);
    const buildManifest = json({ schema_version: 1, runtime: mode,
      source_files: [...used].sort().map(path => createFileRecord(path, read(path))),
      output_files: [...files].map(([path, bytes]) => createFileRecord(path, bytes)) });
    if (mode === 'mcp') mcpBuildManifest = buildManifest;
    else add('skill-build-manifest.json', buildManifest);
    outputs.set(outputPath, files);
  }
  // Keep shared Manager business text unchanged; inject installation context only in the plugin.
  const managerRoot = resolve(root, 'skills/influencer-marketing-manager');
  assertNoSymbolicLinkComponents(root, managerRoot);
  const manager = readDirectoryFileMap(managerRoot);
  validateSkill(manager);
  const document = parseDocument(manager.get('SKILL.md').toString().split('---')[1]);
  if (document.toJS().name !== 'influencer-marketing-manager') throw new Error('Manager identity drift');
  const managerPolicy = read('adapters/plugin/manager-context.md').toString().trim();
  manager.set('SKILL.md', Buffer.from(manager.get('SKILL.md').toString().replace(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)/, `$1\n${managerPolicy}\n\n`)));
  validateSkill(manager);
  outputs.set('plugins/noxinfluencer/skills/influencer-marketing-manager', manager);
  const manifestPath = 'plugins/noxinfluencer/.codex-plugin/plugin.json';
  const manifest = JSON.parse(readCanonicalTextFile(resolve(root, manifestPath)));
  manifest.version = contracts.versions.plugin_version;
  manifest.interface.capabilities = ['Read', ...([...report.records.values()].some(record =>
    record.runtime === 'mcp' && record.status === 'supported' && ['normal_write','high_risk_write'].includes(record.risk)) ? ['Write'] : [])];
  const deployment = contracts.versions.deployment;
  const channelManifestPath = 'plugins/noxinfluencer/.plugin/plugin.json';
  const channelManifest = JSON.parse(readCanonicalTextFile(resolve(root, channelManifestPath)));
  channelManifest.version = contracts.versions.plugin_version;
  const grokManifestPath = 'plugins/noxinfluencer/.grok-plugin/plugin.json';
  const workbuddyManifestPath = 'plugins/noxinfluencer/.workbuddy-plugin/plugin.json';
  return { outputs, mcpBuildManifest, files: new Map([[manifestPath, json(manifest)], [channelManifestPath, json(channelManifest)],
    [grokManifestPath, json(channelManifest)], [workbuddyManifestPath, json(channelManifest)], ['plugins/noxinfluencer/.mcp.json', json({ mcpServers: {
    [deployment.provider]: { type: 'http', url: deployment.url, oauth_resource: deployment.oauth_resource },
  } })]]) };
}

/** 检查模式只比较；生成模式原子更新运行文件、配置和本机构建记录。 */
export function build({ root = repositoryRoot, check = false, operations = {} } = {}) {
  const result = createOutputs(root);
  const provenancePath = resolve(root, mcpBuildManifestPath);
  if (check) {
    for (const [path, expected] of result.outputs) {
      const actual = readDirectoryFileMap(resolve(root, path));
      if (actual.size !== expected.size || [...expected].some(([key, value]) => !actual.get(key)?.equals(value))) throw new Error(`Generated drift: ${path}`);
    }
    for (const [path, bytes] of result.files) if (!readFileSync(resolve(root, path)).equals(bytes)) throw new Error(`Configuration drift: ${path}`);
    // A clean checkout has no ignored provenance file.
    assertNoSymbolicLinkComponents(root, provenancePath);
    if (existsSync(provenancePath) && !readFileSync(provenancePath).equals(result.mcpBuildManifest)) {
      throw new Error(`Build provenance drift: ${mcpBuildManifestPath}`);
    }
  } else {
    const targets = [...result.outputs].map(([path, files]) => ({ kind: 'directory', targetPath: resolve(root, path), files }));
    for (const [path, contents] of result.files) targets.push({ kind: 'file', targetPath: resolve(root, path), contents });
    targets.push({ kind: 'file', targetPath: provenancePath, contents: result.mcpBuildManifest });
    replaceTargetsAtomically(targets, { trustedRoot: root, ...operations });
  }
  return { checked: check, skills: [...result.outputs].map(([path, files]) => ({ path, files: files.size })) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.slice(2).some(arg => arg !== '--check') || process.argv.length > 3) throw new Error('Usage: node v2/scripts/build.mjs [--check]');
    console.log(JSON.stringify(build({ check: process.argv.includes('--check') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
