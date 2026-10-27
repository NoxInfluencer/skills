import { execFileSync } from "node:child_process";
import { lstatSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPrefix = "plugins/noxinfluencer/";
const legacyPaths = new Set([
  ".claude-plugin/marketplace.json",
  "plugins/nox-influencer/.claude-plugin/plugin.json",
  "plugins/nox-influencer/skills/noxinfluencer",
]);

export function checkRepositoryBoundary({ repositoryRoot = resolve(pluginRoot, "../.."), baseRef = "main" } = {}) {
  const git = (...args) => execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
  const baseCommit = git("rev-parse", "--verify", `${baseRef}^{commit}`).trim();
  const failures = [];
  const changes = git("diff", "--no-ext-diff", "--no-renames", "--name-status", "-z", baseCommit, "--").split("\0");
  const deletedLegacy = [];
  for (let index = 0; index < changes.length - 1; index += 2) {
    const [status, path] = [changes[index], changes[index + 1]];
    if (path.startsWith(pluginPrefix)) continue;
    if (status === "D" && legacyPaths.has(path)) deletedLegacy.push(path);
    else failures.push(`${status} ${path}`);
  }
  for (const path of git("ls-files", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean)) {
    if (!path.startsWith(pluginPrefix)) failures.push(`untracked ${path}`);
  }
  for (const path of legacyPaths) {
    try {
      lstatSync(join(repositoryRoot, path));
      failures.push(`legacy plugin entry still exists: ${path}`);
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
  }
  const mainFiles = git("ls-tree", "-r", "--name-only", "-z", baseCommit).split("\0").filter(Boolean);
  const checkedFiles = mainFiles.filter((path) => !path.startsWith(pluginPrefix) && !legacyPaths.has(path)).length;
  return { baseCommit, checkedFiles, deletedLegacy, failures };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== "--base")) throw new Error("Usage: node scripts/check-repository-boundary.mjs [--base main]");
    const report = checkRepositoryBoundary({ baseRef: args[1] ?? "main" });
    if (report.failures.length) throw new Error(`Outside-plugin drift:\n${report.failures.join("\n")}`);
    console.log(`Repository boundary passed against ${report.baseCommit}: ${report.checkedFiles} outside-plugin files unchanged; ${report.deletedLegacy.length} authorized legacy deletions.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
