import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument, stringify } from 'yaml';
import { createOutputs, repositoryRoot, assertPublicFile } from './build.mjs';
import { readDirectoryFileMap, readCanonicalTextFile, replaceTargetsAtomically, createFileRecord, assertNoSymbolicLinkComponents } from './lib/canonical-files.mjs';

/** 在临时公开工程中验证完整双端合同，成功后原子更新摘要和 snapshot，不调用线上业务。 */
export function updateSnapshot({ root = repositoryRoot, id, input }) {
  if (!['cli-schema','mcp-tools','mcp-scopes','mcp-resources','deployment','file-transfer','browser-handoff','host-browser','host-control'].includes(id)) throw new Error('Unsupported snapshot id');
  const data = readCanonicalTextFile(resolve(input));
  assertPublicFile(`${id}.json`,data);
  const snapshot = JSON.parse(data);
  if (snapshot.id !== id || !Array.isArray(snapshot.items)) throw new Error('Snapshot identity or items mismatch');
  const source = resolve(root,'v2/source/noxinfluencer');
  assertNoSymbolicLinkComponents(root,source);
  const files = readDirectoryFileMap(source);
  const document = parseDocument(files.get('versions.yaml').toString(),{uniqueKeys:true});
  if (document.errors.length) throw new Error('Invalid versions YAML');
  const versions = document.toJS({maxAliasCount:0});
  const entry = versions.snapshots.find(item => item.id === id);
  if (!entry) throw new Error('Snapshot is not registered');
  if (entry.path !== `snapshots/${id}.json`) throw new Error('Snapshot path must match its registered identity');
  const encoded = Buffer.from(JSON.stringify(snapshot,null,2)+'\n');
  entry.sha256 = createFileRecord(entry.path,encoded).sha256;
  const updates = new Map([[entry.path,encoded],['versions.yaml',Buffer.from(stringify(versions))]]);
  // CLI 输出的每个现有 Campaign 操作都必须继续存在，参数合同随真实 schema 一起更新。
  if (id === 'cli-schema') {
    const assetPath='adapters/cli/assets/campaign-runtime-contract.json';
    const contract=JSON.parse(files.get(assetPath));
    contract.commands=contract.commands.map(previous => {
      const found=snapshot.items.find(item => item.command===previous.command);
      if (!found) throw new Error(`Missing Campaign command: ${previous.command}`);
      return Object.fromEntries(Object.keys(previous).filter(key => found[key]!==undefined).map(key => [key,found[key]]));
    });
    updates.set(assetPath,Buffer.from(JSON.stringify(contract,null,2)+'\n'));
  }
  const staging=mkdtempSync(resolve(tmpdir(),'nox-v2-contract-'));
  try {
    for (const [prefix,tree] of [
      ['v2/source/noxinfluencer',new Map([...files,...updates])],
      ['skills/influencer-marketing-manager',readDirectoryFileMap(resolve(root,'skills/influencer-marketing-manager'))],
      ['plugins/noxinfluencer/.codex-plugin',new Map([['plugin.json',readCanonicalTextFile(resolve(root,'plugins/noxinfluencer/.codex-plugin/plugin.json'))]])],
      ['plugins/noxinfluencer/.plugin',new Map([['plugin.json',readCanonicalTextFile(resolve(root,'plugins/noxinfluencer/.plugin/plugin.json'))]])],
    ]) {
      for (const [path,bytes] of tree) {
        const destination=resolve(staging,prefix,path);
        mkdirSync(dirname(destination),{recursive:true}); writeFileSync(destination,bytes);
      }
    }
    createOutputs(staging);
    replaceTargetsAtomically([...updates].map(([path,contents]) => ({kind:'file',targetPath:resolve(source,path),contents})),{trustedRoot:source});
  } finally {
    if (!relative(resolve(tmpdir()),staging).startsWith('nox-v2-contract-') || !staging.startsWith(resolve(tmpdir())+sep)) throw new Error('Unsafe temporary cleanup target');
    rmSync(staging,{recursive:true,force:true});
  }
  return { id, updated: [...updates.keys()] };
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length!==4) throw new Error('Usage: node v2/scripts/update-snapshot.mjs <snapshot-id> <snapshot-json>');
    console.log(JSON.stringify(updateSnapshot({id:process.argv[2],input:process.argv[3]}),null,2));
  } catch(error) { console.error(error.message); process.exitCode=1; }
}
