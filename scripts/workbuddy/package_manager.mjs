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
const metadataPath = 'scripts/workbuddy/manager/skill-metadata.json';
const iconSourcePath = 'scripts/workbuddy/manager/icon.png';
const iconArchivePath = 'dist/noxinfluencer-marketing-manager-workbuddy-icon.png';
const defaultArchive = 'dist/noxinfluencer-marketing-manager-workbuddy.zip';

/** External Skill collaboration is conditional; it is not a bundled file dependency. */
function adaptOptionalCollaboration(path, text) {
  if (path === 'SKILL.md') {
    const pattern = /(^## Capability collaboration\n\n)([^\n]+)(\n\n)/m;
    const original = text.match(pattern);
    requireValue(original?.[2].includes('`noxinfluencer` Skill'), 'Review the shared Manager collaboration section before adapting it');
    const collaboration = [
      'This strategy Skill can independently complete marketing strategy, creator-selection criteria, partnership planning, SOP design and analysis of user-provided materials. These tasks do not require another installed Skill or a connected NoxInfluencer account.',
      'Optional external collaboration: `noxinfluencer` is the identifier of a separately distributed Skill, not a file or required resource in this package. Only when the requested task needs live NoxInfluencer data or account operations, and the current WorkBuddy environment confirms that external Skill is already installed and available, load it by its installed identifier. When it supplied the task, return to that same entrypoint for execution. Preserve its supported runtime, account identity, target scope, authorization, preview, confirmation, recovery and result-verification rules.',
      'If that external Skill is not installed or available, continue the strategy work and analysis that the supplied materials support. Explain the specific live-data or execution gap only when it affects the requested result; offer to work from a user-provided export or explain how the user can separately install or enable the required capability. Do not load a nonexistent Skill, automatically install it, invent account results, or present the external capability as included in this package.',
      'The external product capability owns tool selection and any supported NoxInfluencer page handoff. Missing capabilities or errors do not authorize switching runtimes or accounts, or operating NoxInfluencer SaaS directly. Browser inspection of original public creator, channel or video pages remains valid for content evidence. Sign-in, authorization and billing remain user-completed steps under the selected product capability.',
    ].join('\n\n');
    return text.replace(pattern, (_match, heading, _paragraph, spacing) => heading + collaboration + spacing);
  }
  if (path === 'references/operational-tool-prompts.md') {
    const pattern = /^For samples tracked in NoxInfluencer,[^\n]+/m;
    requireValue(pattern.test(text), 'Review the shared native tracking guidance before adapting it');
    return text.replace(pattern,
      'For samples tracked in NoxInfluencer, use native tracking evidence only when the optional external product Skill described in SKILL.md is already installed and available for the current task. Otherwise, analyze tracking information supplied by the user or explain which additional capability is needed. External tracking tools can supplement unavailable or incomplete native evidence. Let the available product capability resolve current support and pricing through its selected runtime; registration and saved tracking reads can have different costs.');
  }
  return text;
}

/** Validate the single-Skill archive and every local resource after adaptation. */
export function validateManagerEntries(entries) {
  return validateStandaloneEntries(entries, { skillName, displayName });
}

/** Keep the shared source intact; add WorkBuddy metadata and optional collaboration rules. */
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
      ? Buffer.from(adaptOptionalCollaboration(path, content.toString('utf8').replace(/\r\n?/g, '\n'))
        .replaceAll('{baseDir}/references/', '@references/'))
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
