import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { workBuddyOAuthReference } from './markdown.mjs';
import { repositoryRoot, validateSkill } from '../../v2/scripts/build.mjs';
import { assertNoSymbolicLinkComponents, readDirectoryFileMap } from '../../v2/scripts/lib/canonical-files.mjs';
import {
  frontmatter, readSkillIcon, readSkillMetadata, requireValue, validateStandaloneEntries, writeStandaloneArchive,
} from './standalone_skill.mjs';

export const skillName = 'noxinfluencer-v2';
export const displayName = 'Nox聚星红人营销';
const sourcePath = `skills/${skillName}`;
const metadataPath = 'scripts/workbuddy/product/skill-metadata.json';
const iconSourcePath = 'plugins/noxinfluencer/assets/logo.png';
const defaultArchive = `dist/${skillName}-workbuddy.zip`;
const iconOutput = `dist/${skillName}-workbuddy-icon.png`;
const cliContracts = ['cli-package.json', 'campaign-runtime-contract.json'];
const excluded = new Set(['skill-build-manifest.json', 'scripts/start-codex-oauth.ps1']);

function adaptMarkdown(path, text) {
  switch (path) {
    case 'SKILL.md': {
      const heading = '## Runtime Selection\n\n';
      requireValue(text.includes(heading), 'V2 Skill is missing its runtime selection section');
      return text.replace(heading, heading +
        'In WorkBuddy, `${CODEBUDDY_SKILL_DIR}` identifies the installed directory of this Skill. Use its absolute path for packaged scripts. If a reference displays the placeholder literally, resolve the path from the active Skill entrypoint before executing the command.\n\n');
    }
    case 'references/oauth-and-scopes.md':
      return workBuddyOAuthReference(text);
    case 'references/tool-execution.md':
      return text.replace('the connected `noxinfluencer` provider', 'the authorized official NoxInfluencer MCP connection');
    default:
      return text;
  }
}

function relocateCliContracts(bytes) {
  const text = bytes.toString('utf8');
  const original = "const skill = resolve(fileURLToPath(new URL('..', import.meta.url)));";
  requireValue(text.includes(original), 'Review the V2 CLI contract paths before packaging for WorkBuddy');
  return Buffer.from(text.replace(original, 'const skill = dirname(fileURLToPath(import.meta.url));'));
}

export function createProductEntries({ root = repositoryRoot } = {}) {
  root = resolve(root);
  const sourceRoot = resolve(root, sourcePath);
  assertNoSymbolicLinkComponents(root, sourceRoot);
  const metadata = readSkillMetadata(root, metadataPath);
  const files = readDirectoryFileMap(sourceRoot);
  validateSkill(files);
  const { document, fields, body } = frontmatter(files.get('SKILL.md'), 'V2 SKILL.md');
  requireValue(fields.name === skillName, `V2 product Skill name must be ${skillName}`);
  for (const path of ['references/runtime-mcp.md', 'references/oauth-and-scopes.md',
    'references/runtime-cli.md', 'references/auth.md', 'scripts/nox-cli.mjs', ...cliContracts]) {
    requireValue(files.has(path), `Missing V2 runtime resource: ${path}`);
  }
  for (const [key, value] of Object.entries(metadata)) document.set(key, value);

  const entries = new Map();
  for (const [path, bytes] of files) {
    if (excluded.has(path)) continue;
    const target = cliContracts.includes(path) ? `scripts/${path}` : path;
    let content = path === 'SKILL.md' ? Buffer.from(`---\n${document.toString()}---\n${body}`) : bytes;
    if (path === 'scripts/nox-cli.mjs') content = relocateCliContracts(content);
    if (path.endsWith('.md')) {
      content = Buffer.from(adaptMarkdown(path, content.toString('utf8').replace(/\r\n?/g, '\n'))
        .replace(/^## Skill resource paths\n[\s\S]*?(?=^## )/m, '')
        .replaceAll('{baseDir}/references/', '@references/')
        .replaceAll('{baseDir}/', '${CODEBUDDY_SKILL_DIR}/'));
    }
    requireValue(!entries.has(`${skillName}/${target}`), `Duplicate WorkBuddy Skill resource: ${target}`);
    entries.set(`${skillName}/${target}`, content);
  }
  validateStandaloneEntries(entries, { skillName, displayName });
  return { entries, metadata, icon: readSkillIcon(root, iconSourcePath) };
}

export async function packageProduct({ root = repositoryRoot, output } = {}) {
  root = resolve(root);
  const { entries, icon } = createProductEntries({ root });
  return writeStandaloneArchive({ root, output: output ?? defaultArchive, iconOutput, entries, icon });
}

async function main() {
  const args = process.argv.slice(2);
  let check = false;
  let output;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--check') check = true;
    else if (args[index] === '--output' && args[index + 1]) output = args[++index];
    else throw new Error('Usage: node scripts/workbuddy/package_product.mjs [--check] [--output dist/name.zip]');
  }
  requireValue(!check || !output, '--output is only available when packaging');
  if (check) {
    const { entries, metadata } = createProductEntries();
    console.log(`WorkBuddy Skill checks passed (${metadata.name}, ${entries.size} files, version ${metadata.version})`);
  } else console.log(JSON.stringify(await packageProduct({ output }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
