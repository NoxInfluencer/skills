import { resolve } from "node:path";
import {
  canonicalSkillSourceDirectory,
  syncBundledSkill,
  verifyBundledSkillSync,
} from "./plugin-skill-sync.mjs";
import { validatePluginSource } from "./plugin-source-validation.mjs";

function fail(message) {
  throw new Error(message);
}

function parseArgs(args) {
  let check = false;
  let sourceDirectory = canonicalSkillSourceDirectory;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--check") {
      check = true;
      continue;
    }
    if (argument === "--source") {
      const value = args[index + 1];
      if (!value) fail("--source requires a directory path.");
      sourceDirectory = resolve(value);
      index += 1;
      continue;
    }
    fail(`Unsupported sync argument: ${argument}`);
  }
  return { check, sourceDirectory };
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = options.check
    ? verifyBundledSkillSync({ sourceDirectory: options.sourceDirectory })
    : syncBundledSkill({ sourceDirectory: options.sourceDirectory });

  validatePluginSource({ sourceDirectory: options.sourceDirectory });

  console.log(
    options.check
      ? `Plugin source validation passed; bundled Skill is in sync (${result.fileCount} files).`
      : `Plugin source validation passed; bundled Skill synchronized (${result.fileCount} files): ${result.targetDirectory}`,
  );
} catch (error) {
  console.error(`Skill synchronization failed: ${error.message}`);
  process.exitCode = 1;
}
