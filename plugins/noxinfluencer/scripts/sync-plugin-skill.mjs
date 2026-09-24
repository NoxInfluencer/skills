import {
  syncBundledSkill,
  verifyBundledSkillSync,
} from "./plugin-skill-sync.mjs";
import { validatePluginSource } from "./plugin-source-validation.mjs";

function fail(message) {
  throw new Error(message);
}

function parseArgs(args) {
  let check = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--check") {
      check = true;
      continue;
    }
    if (argument === "--source") {
      fail(
        "--source is no longer supported. The Plugin Skill is maintained only inside this Plugin.",
      );
    }
    fail(`Unsupported sync argument: ${argument}`);
  }
  return { check };
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.check
    ? verifyBundledSkillSync()
    : syncBundledSkill();

  validatePluginSource();

  console.log(
    options.check
      ? `Plugin-local Skill validation passed (${result.fileCount} files).`
      : `Plugin-local Skill runtime marker refreshed and validation passed (${result.fileCount} files): ${result.targetDirectory}`,
  );
} catch (error) {
  console.error(`Plugin Skill preparation failed: ${error.message}`);
  process.exitCode = 1;
}
