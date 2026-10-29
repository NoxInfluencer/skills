import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, repositoryRoot } from '../v2/scripts/build.mjs';

export const sharedSkillNames = ['influencer-marketing-manager'];

/** 复用唯一 V2 构建并同步共用 Manager，不单独维护插件业务副本。 */
export function syncSharedSkills({ root = resolve(repositoryRoot, 'plugins/noxinfluencer'), check = false } = {}) {
  const result = build({ root: resolve(root, '../..'), check });
  return { inSync: true, skills: result.skills.map(item => ({ name: item.path.split('/').at(-1),
    fileCount: item.files, changed: [], removed: [], excluded: [] })) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) throw new Error('Usage: npm run skills-plugin [-- --check]');
    console.log(JSON.stringify(syncSharedSkills({ check: args.includes('--check') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
