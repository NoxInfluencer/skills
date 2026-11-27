import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repositoryRoot, validateSkill } from '../../v2/scripts/build.mjs';
import { assertNoSymbolicLinkComponents, readDirectoryFileMap } from '../../v2/scripts/lib/canonical-files.mjs';
import {
  frontmatter, readSkillIcon, readSkillMetadata, requireValue, validateStandaloneEntries, writeStandaloneArchive,
} from './standalone_skill.mjs';

export const skillName = 'noxinfluencer-marketing-manager';
export const displayName = 'Nox聚星红人营销策略';
const sourcePath = 'skills/influencer-marketing-manager';
const sourceName = 'influencer-marketing-manager';
const productSkillName = 'noxinfluencer';
const metadataPath = 'scripts/workbuddy/manager/skill-metadata.json';
const iconSourcePath = 'scripts/workbuddy/manager/icon.png';
const iconArchivePath = 'dist/noxinfluencer-marketing-manager-workbuddy-icon.png';
const defaultArchive = 'dist/noxinfluencer-marketing-manager-workbuddy.zip';

/** Validate the single-Skill archive and every local resource after adaptation. */
export function validateManagerEntries(entries) {
  const fields = validateStandaloneEntries(entries, { skillName, displayName });
  const { body } = frontmatter(entries.get(`${skillName}/SKILL.md`), 'WorkBuddy Manager SKILL.md');
  requireValue(body.includes(`Otherwise use the \`${productSkillName}\` product Skill when available`),
    `WorkBuddy Manager must default to the ${productSkillName} product Skill`);
  return fields;
}

/** Add WorkBuddy metadata and adapt resource references. */
export function createManagerEntries({ root = repositoryRoot } = {}) {
  root = resolve(root);
  const sourceRoot = resolve(root, sourcePath);
  assertNoSymbolicLinkComponents(root, sourceRoot);
  const metadata = readSkillMetadata(root, metadataPath);
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
      ? Buffer.from(content.toString('utf8').replace(/\r\n?/g, '\n')
        .replaceAll('{baseDir}/references/', '@references/')
        .replaceAll('`noxinfluencer-v2`', `\`${productSkillName}\``))
      : content;
    entries.set(`${skillName}/${path}`, adapted);
  }
  validateManagerEntries(entries);
  return { entries, metadata, icon: readSkillIcon(root, iconSourcePath) };
}

export async function packageManager({ root = repositoryRoot, output } = {}) {
  root = resolve(root);
  const { entries, icon } = createManagerEntries({ root });
  return writeStandaloneArchive({ root, output: output ?? defaultArchive, iconOutput: iconArchivePath, entries, icon });
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
