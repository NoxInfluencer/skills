import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOutputs, repositoryRoot, assertPublicFile } from '../v2/scripts/build.mjs';
import {
  assertNoSymbolicLinkComponents, readBoundedRegularFile, readDirectoryFileMap,
  replaceTargetsAtomically,
} from '../v2/scripts/lib/canonical-files.mjs';

export const grokPluginPath = 'grok/noxinfluencer';
export const grokMarketplacePath = '.grok-plugin/marketplace.json';
const marketplaceName = 'noxinfluencer-grok-plugins';
const pluginSourcePath = 'plugins/noxinfluencer';
const skillNames = ['noxinfluencer-mcp', 'influencer-marketing-manager'];
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

/** Reuse maintained business outputs without writing to any other host's plugin. */
export function createGrokOutputs(root = repositoryRoot) {
  const generated = createOutputs(root);
  const manifest = JSON.parse(generated.files.get(`${pluginSourcePath}/.plugin/plugin.json`));
  const pluginFiles = new Map([
    ['plugin.json', json(manifest)],
    ['.mcp.json', generated.files.get(`${pluginSourcePath}/.mcp.json`)],
  ]);
  for (const name of skillNames) {
    const skillFiles = generated.outputs.get(`${pluginSourcePath}/skills/${name}`);
    if (!(skillFiles instanceof Map)) throw new Error(`Missing generated Grok Skill: ${name}`);
    for (const [path, bytes] of skillFiles) pluginFiles.set(`skills/${name}/${path}`, bytes);
  }
  for (const [path, bytes] of pluginFiles) assertPublicFile(path, bytes);
  const marketplace = json({
    name: marketplaceName,
    description: 'NoxInfluencer plugins for Grok Build.',
    owner: manifest.author,
    plugins: [{
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      source: `./${grokPluginPath}`,
    }],
  });
  assertPublicFile(grokMarketplacePath, marketplace);
  return { pluginFiles, marketplace };
}

/** Build/check only the dedicated Grok directory and marketplace index. */
export function buildGrokPlugin({ root = repositoryRoot, check = false, operations = {} } = {}) {
  root = resolve(root);
  const { pluginFiles, marketplace } = createGrokOutputs(root);
  const pluginRoot = resolve(root, grokPluginPath);
  const marketplaceFile = resolve(root, grokMarketplacePath);
  if (check) {
    assertNoSymbolicLinkComponents(root, pluginRoot);
    assertNoSymbolicLinkComponents(root, marketplaceFile);
    if (!existsSync(pluginRoot)) throw new Error(`Generated drift: ${grokPluginPath}`);
    const actual = readDirectoryFileMap(pluginRoot);
    if (actual.size !== pluginFiles.size || [...pluginFiles].some(([path, bytes]) => !actual.get(path)?.equals(bytes))) {
      throw new Error(`Generated drift: ${grokPluginPath}`);
    }
    if (!existsSync(marketplaceFile) || !readBoundedRegularFile(marketplaceFile).equals(marketplace)) {
      throw new Error(`Configuration drift: ${grokMarketplacePath}`);
    }
  } else {
    replaceTargetsAtomically([
      { kind: 'directory', targetPath: pluginRoot, files: pluginFiles },
      { kind: 'file', targetPath: marketplaceFile, contents: marketplace },
    ], { ...operations, trustedRoot: root });
  }
  return { checked: check, plugin: grokPluginPath, marketplace: marketplaceName,
    files: pluginFiles.size, skills: skillNames.length,
    mcpServers: Object.keys(JSON.parse(pluginFiles.get('.mcp.json')).mcpServers) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || args.some(arg => arg !== '--check')) {
      throw new Error('Usage: node scripts/grok-plugin.mjs [--check]');
    }
    console.log(JSON.stringify(buildGrokPlugin({ check: args.includes('--check') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
