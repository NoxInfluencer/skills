import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import yazl from 'yazl';
import { build, repositoryRoot, assertPublicFile } from './build.mjs';
import { readDirectoryFileMap, readCanonicalTextFile, assertNoSymbolicLinkComponents } from './lib/canonical-files.mjs';

/** 有界打包独立插件和通用 Skill，不安装客户端或发布渠道。 */
export async function packageV2({ root = repositoryRoot, outputDirectory = resolve(root, 'v2/dist') } = {}) {
  build({ root, check: true });
  assertNoSymbolicLinkComponents(root, outputDirectory);
  const pluginRoot = resolve(root, 'plugins/noxinfluencer');
  assertNoSymbolicLinkComponents(root, pluginRoot);
  const configPath = resolve(pluginRoot, '.mcp.json');
  assertNoSymbolicLinkComponents(root, configPath);
  const pluginEntries = new Map([['.mcp.json', Buffer.from(readCanonicalTextFile(configPath))]]);
  // Select deliverable roots before traversal: ignored backups/dependencies are not package inputs.
  for (const directory of ['.codex-plugin', '.plugin', 'assets', 'skills']) {
    const path = resolve(pluginRoot, directory);
    assertNoSymbolicLinkComponents(root, path);
    for (const [name, bytes] of readDirectoryFileMap(path)) pluginEntries.set(`${directory}/${name}`, bytes);
  }
  if (pluginEntries.size > 256) throw new Error('Plugin delivery file count exceeds 256.');
  const general = readDirectoryFileMap(resolve(root, 'v2/skills/noxinfluencer-v2'));
  const manager = readDirectoryFileMap(resolve(root, 'skills/influencer-marketing-manager'));
  const generalEntries = new Map([...general].map(([path, bytes]) => [`skills/noxinfluencer-v2/${path}`, bytes]));
  for (const [path, bytes] of manager) generalEntries.set(`skills/influencer-marketing-manager/${path}`, bytes);
  mkdirSync(outputDirectory, { recursive: true });
  const artifacts = [];
  for (const [name, entries] of [['noxinfluencer-v2', generalEntries], ['noxinfluencer-mcp-plugin', pluginEntries]]) {
    for (const [path, bytes] of entries) if (!/\.(png|svg)$/i.test(path)) assertPublicFile(path, bytes);
    const archivePath = resolve(outputDirectory, `${name}.zip`);
    assertNoSymbolicLinkComponents(root, archivePath);
    const zip = new yazl.ZipFile();
    const digest = createHash('sha256');
    for (const [path, bytes] of [...entries].sort(([a],[b]) => a < b ? -1 : 1)) {
      digest.update(path).update('\0').update(bytes);
      zip.addBuffer(bytes, path, { mtime: new Date('1980-01-01T00:00:00Z'), mode: 0o100644 });
    }
    await new Promise((accept, reject) => {
      const destination = createWriteStream(archivePath);
      destination.on('close', accept).on('error', reject);
      zip.outputStream.on('error', reject).pipe(destination);
      zip.end();
    });
    const result = { archive: `${name}.zip`, files: entries.size, payload_sha256: digest.digest('hex') };
    writeFileSync(`${archivePath}.json`, JSON.stringify(result, null, 2)+'\n');
    artifacts.push(result);
  }
  return artifacts;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error('v2:package accepts no arguments');
    console.log(JSON.stringify(await packageV2(), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
