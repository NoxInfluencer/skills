import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const bundledSkillDirectory = join(
  projectRoot,
  "skills",
  "noxinfluencer",
);
export const pluginRuntimeMarkerRelativePath =
  "references/codex-plugin-runtime.md";
export const pluginRuntimeMarker = `# Codex Plugin Runtime

This file is generated only in the NoxInfluencer Codex Plugin package. Its presence is the authoritative execution-backend marker for the bundled Skill.

- Use the connected MCP provider named \`noxinfluencer\` for every NoxInfluencer operation.
- Reuse the shared business workflows and guardrails from the Skill.
- When OAuth is required, actively start the Codex Host OAuth flow exactly once per user request. On Windows desktop or Codex CLI-hosted conversations, use the bundled \`scripts/start-codex-oauth.ps1\` helper; on macOS/Linux, use an independently executable \`codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user\`. The registration value is case-sensitive and must remain lowercase.
- The Windows helper may invoke the Plugin App Server control CLI already installed under the current \`CODEX_HOME\`. It must never invoke a \`WindowsApps\` alias, copy or elevate an executable, construct an authorization URL, or read OAuth credentials.
- Let the Codex Host handle DCR, PKCE, state, the loopback callback, external-browser authorization, and Token storage. Fall back to NoxInfluencer Connect/Re-authorize in Codex settings only when the one automatic attempt cannot start or the user cancels it.
- Never execute \`noxinfluencer login\`, any local NoxInfluencer CLI business command, Device Flow, or API-key setup in this packaged runtime.
- Never fall back to a local CLI when OAuth, MCP connection, or Tool availability fails. Never request, construct, print, or store OAuth credentials or authorization URLs in the Skill.
`;

const forbiddenSegments = new Set([
  ".git",
  ".evals",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "evals",
  "logs",
]);

function fail(message) {
  throw new Error(message);
}

function toPortablePath(path, root) {
  return relative(root, path).split(sep).join(posix.sep);
}

function assertSafeRelativePath(relativePath) {
  const segments = relativePath.split("/");
  const baseName = segments.at(-1)?.toLowerCase() ?? "";

  if (segments.some((segment) => forbiddenSegments.has(segment.toLowerCase()))) {
    fail(`Development-only content cannot be packaged: ${relativePath}`);
  }
  if (
    baseName === ".env" ||
    baseName.startsWith(".env.") ||
    baseName === "id_rsa" ||
    baseName.endsWith(".log") ||
    baseName.endsWith(".pem") ||
    baseName.endsWith(".key") ||
    baseName.endsWith(".p12") ||
    baseName.endsWith(".pfx")
  ) {
    fail(`Potential secret file cannot be bundled: ${relativePath}`);
  }
}

function listFiles(path, root = path) {
  if (!existsSync(path)) return [];

  const stat = lstatSync(path);
  const relativePath = toPortablePath(path, root);
  if (stat.isSymbolicLink()) {
    fail(`Symbolic links are not allowed in the Plugin Skill: ${relativePath}`);
  }
  if (stat.isFile()) {
    assertSafeRelativePath(relativePath);
    return [path];
  }
  if (!stat.isDirectory()) {
    fail(`Unsupported Plugin Skill filesystem entry: ${relativePath}`);
  }

  return readdirSync(path, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => listFiles(join(path, entry.name), root));
}

function readActualFiles(targetDirectory) {
  const target = resolve(targetDirectory);
  if (!existsSync(target)) {
    fail(`Plugin Skill directory is missing: ${target}`);
  }

  const actual = new Map();
  for (const path of listFiles(target)) {
    const relativePath = toPortablePath(path, target);
    if (relativePath === ".gitkeep") continue;
    actual.set(relativePath, readFileSync(path));
  }
  return actual;
}

function assertSafeTarget(targetDirectory) {
  const resolvedTarget = resolve(targetDirectory);
  const expectedTarget = resolve(bundledSkillDirectory);
  if (resolvedTarget !== expectedTarget) {
    fail(`Refusing to modify an unexpected Plugin Skill target: ${resolvedTarget}`);
  }
}

export function verifyBundledSkillSync({
  targetDirectory = bundledSkillDirectory,
} = {}) {
  const actual = readActualFiles(targetDirectory);
  if (!actual.has("SKILL.md")) {
    fail(`Plugin Skill is missing SKILL.md: ${resolve(targetDirectory)}`);
  }

  const marker = actual.get(pluginRuntimeMarkerRelativePath);
  if (!marker) {
    fail(
      `Plugin Skill is missing ${pluginRuntimeMarkerRelativePath}. Run npm run plugin:sync-skill.`,
    );
  }
  if (!marker.equals(Buffer.from(pluginRuntimeMarker, "utf8"))) {
    fail(
      `${pluginRuntimeMarkerRelativePath} is not the generated Plugin runtime marker. Run npm run plugin:sync-skill.`,
    );
  }

  return { fileCount: actual.size };
}

/**
 * Keep the Plugin-owned runtime marker deterministic.
 *
 * The Plugin Skill directory is its own source tree. This operation never
 * reads from, compares with, or writes to the standalone Skill directory.
 */
export function syncBundledSkill({
  targetDirectory = bundledSkillDirectory,
} = {}) {
  assertSafeTarget(targetDirectory);
  const target = resolve(targetDirectory);
  const skillManifest = join(target, "SKILL.md");
  if (!existsSync(skillManifest)) {
    fail(`Plugin Skill is missing SKILL.md: ${target}`);
  }
  // Scan before writing so a symlinked directory cannot redirect the marker
  // write outside the Plugin-owned Skill tree.
  readActualFiles(target);

  const markerPath = join(
    target,
    ...pluginRuntimeMarkerRelativePath.split("/"),
  );
  if (existsSync(markerPath) && lstatSync(markerPath).isSymbolicLink()) {
    fail(
      `Symbolic links are not allowed in the Plugin Skill: ${pluginRuntimeMarkerRelativePath}`,
    );
  }
  mkdirSync(dirname(markerPath), { recursive: true });
  const expectedMarker = Buffer.from(pluginRuntimeMarker, "utf8");
  if (!existsSync(markerPath) || !readFileSync(markerPath).equals(expectedMarker)) {
    writeFileSync(markerPath, expectedMarker);
  }

  const result = verifyBundledSkillSync({ targetDirectory: target });
  return { ...result, targetDirectory: target };
}
