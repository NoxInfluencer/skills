import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const configuredSkillSource = process.env.NOX_PLUGIN_SKILL_SOURCE?.trim();
export const canonicalSkillSourceDirectory = configuredSkillSource
  ? resolve(projectRoot, configuredSkillSource)
  : resolve(projectRoot, "..", "..", "skills", "noxinfluencer");
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
- The Skill may run \`codex mcp login noxinfluencer --oauth-client-registration DCR --scopes noxinfluencer.codex.user\` once per user request, only to ask the Codex Host to bootstrap MCP OAuth.
- That Host command is not the NoxInfluencer CLI backend and is not a business-command fallback. Let the Codex Host handle DCR, PKCE, state, the loopback callback, browser authorization, and Token storage.
- Never execute \`noxinfluencer login\`, any NoxInfluencer CLI business command, Device Flow, or API-key setup in this packaged runtime.
- Never fall back to the NoxInfluencer CLI when OAuth, MCP connection, or Tool availability fails. Never request, construct, print, or store OAuth credentials or authorization URLs in the Skill.
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
    fail(`Development-only content cannot be bundled: ${relativePath}`);
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
    fail(`Symbolic links are not allowed in the bundled Skill: ${relativePath}`);
  }
  if (stat.isFile()) {
    assertSafeRelativePath(relativePath);
    return [path];
  }
  if (!stat.isDirectory()) {
    fail(`Unsupported Skill filesystem entry: ${relativePath}`);
  }

  return readdirSync(path, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => listFiles(join(path, entry.name), root));
}

function buildExpectedFiles(sourceDirectory) {
  const source = resolve(sourceDirectory);
  const skillManifest = join(source, "SKILL.md");
  if (!existsSync(skillManifest)) {
    fail(`Canonical Skill is missing SKILL.md: ${source}`);
  }

  const expected = new Map();
  for (const path of listFiles(source)) {
    const relativePath = toPortablePath(path, source);
    if (relativePath === ".gitkeep") continue;
    if (relativePath === pluginRuntimeMarkerRelativePath) {
      fail(
        `Canonical Skill must not contain the Plugin runtime marker: ${relativePath}`,
      );
    }
    expected.set(relativePath, readFileSync(path));
  }
  expected.set(
    pluginRuntimeMarkerRelativePath,
    Buffer.from(pluginRuntimeMarker, "utf8"),
  );
  return expected;
}

function readActualFiles(targetDirectory) {
  const target = resolve(targetDirectory);
  const actual = new Map();
  for (const path of listFiles(target)) {
    const relativePath = toPortablePath(path, target);
    if (relativePath === ".gitkeep") continue;
    actual.set(relativePath, readFileSync(path));
  }
  return actual;
}

function diffFileMaps(expected, actual) {
  const missing = [...expected.keys()].filter((path) => !actual.has(path));
  const extra = [...actual.keys()].filter((path) => !expected.has(path));
  const changed = [...expected.keys()].filter(
    (path) => actual.has(path) && !expected.get(path).equals(actual.get(path)),
  );
  return { missing, extra, changed };
}

function formatDrift({ missing, extra, changed }) {
  const details = [];
  if (missing.length) details.push(`missing: ${missing.join(", ")}`);
  if (extra.length) details.push(`extra: ${extra.join(", ")}`);
  if (changed.length) details.push(`changed: ${changed.join(", ")}`);
  return details.join("; ");
}

export function verifyBundledSkillSync({
  sourceDirectory = canonicalSkillSourceDirectory,
  targetDirectory = bundledSkillDirectory,
} = {}) {
  const expected = buildExpectedFiles(sourceDirectory);
  const actual = readActualFiles(targetDirectory);
  const drift = diffFileMaps(expected, actual);
  if (drift.missing.length || drift.extra.length || drift.changed.length) {
    fail(
      `Bundled Skill is out of sync (${formatDrift(drift)}). Run npm run plugin:sync-skill.`,
    );
  }
  return { fileCount: expected.size };
}

function assertSafeTarget(targetDirectory) {
  const resolvedTarget = resolve(targetDirectory);
  const expectedTarget = resolve(bundledSkillDirectory);
  if (resolvedTarget !== expectedTarget) {
    fail(`Refusing to replace an unexpected bundled Skill target: ${resolvedTarget}`);
  }
}

export function syncBundledSkill({
  sourceDirectory = canonicalSkillSourceDirectory,
  targetDirectory = bundledSkillDirectory,
} = {}) {
  assertSafeTarget(targetDirectory);
  const expected = buildExpectedFiles(sourceDirectory);
  const target = resolve(targetDirectory);
  const targetParent = dirname(target);
  const operationId = `${process.pid}-${Date.now()}`;
  const incoming = join(targetParent, `.noxinfluencer.incoming-${operationId}`);
  const backup = join(targetParent, `.noxinfluencer.backup-${operationId}`);

  mkdirSync(targetParent, { recursive: true });
  try {
    for (const [relativePath, contents] of expected) {
      const destination = join(incoming, ...relativePath.split("/"));
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, contents);
    }
    verifyBundledSkillSync({
      sourceDirectory,
      targetDirectory: incoming,
    });

    if (existsSync(target)) renameSync(target, backup);
    renameSync(incoming, target);
    if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    if (!existsSync(target) && existsSync(backup)) renameSync(backup, target);
    throw error;
  } finally {
    if (existsSync(incoming)) rmSync(incoming, { recursive: true, force: true });
    if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  }

  return { fileCount: expected.size, targetDirectory: target };
}
