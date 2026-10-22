import { validatePluginSource } from "./plugin-source-validation.mjs";

try {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--release")) throw new Error("Only --release is supported.");
  const { manifest, skills } = validatePluginSource({ release: args.includes("--release") });
  console.log(`Plugin validation passed: ${manifest.name}@${manifest.version}`);
  console.log(skills.pending ? "MCP Skill pending: skills/mcp/ is intentionally empty." : `MCP Skill ready (${skills.fileCount} files).`);
} catch (error) {
  console.error(`Plugin validation failed: ${error.message}`);
  process.exitCode = 1;
}
