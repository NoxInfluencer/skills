import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  bundledSkillDirectory,
  canonicalSkillSourceDirectory,
  pluginRuntimeMarkerRelativePath,
  projectRoot,
  verifyBundledSkillSync,
} from "./plugin-skill-sync.mjs";

const expectedPluginName = "noxinfluencer";
const legacyMcpResource = "https://api.noxinfluencer.com/mcp";

function fail(message) {
  throw new Error(message);
}

export function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function unquoteYamlScalar(value) {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function validateSkillManifest(skillDirectory, label) {
  const skillPath = join(skillDirectory, "SKILL.md");
  if (!existsSync(skillPath)) {
    fail(`${label} is missing SKILL.md: ${skillDirectory}`);
  }

  const content = readFileSync(skillPath, "utf8")
    .replace(/^\uFEFF/, "")
    .replaceAll("\r\n", "\n");
  const lines = content.split("\n");
  if (lines[0] !== "---") {
    fail(`${label} SKILL.md must begin with YAML frontmatter.`);
  }

  const closingDelimiter = lines.indexOf("---", 1);
  if (closingDelimiter < 2) {
    fail(`${label} SKILL.md is missing its closing frontmatter delimiter.`);
  }

  const frontmatter = lines.slice(1, closingDelimiter);
  const readField = (name) => {
    const prefix = `${name}:`;
    const line = frontmatter.find((candidate) => candidate.startsWith(prefix));
    return line ? unquoteYamlScalar(line.slice(prefix.length)) : "";
  };

  const name = readField("name");
  const description = readField("description");
  if (name !== expectedPluginName) {
    fail(
      `${label} Skill name must remain '${expectedPluginName}', received '${name || "<missing>"}'.`,
    );
  }
  if (!description) {
    fail(`${label} Skill must declare a non-empty description.`);
  }
  if (content.includes("[TODO:")) {
    fail(`${label} SKILL.md must not contain TODO placeholders.`);
  }
}

export function validatePluginManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    fail("plugin.json must contain a JSON object.");
  }
  if (manifest.name !== expectedPluginName) {
    fail(
      `plugin.json name must remain '${expectedPluginName}', received '${manifest.name ?? "<missing>"}'.`,
    );
  }
  if (typeof manifest.version !== "string" || !manifest.version.trim()) {
    fail("plugin.json must contain a non-empty version.");
  }
  if (manifest.skills !== "./skills/") {
    fail('plugin.json must declare "skills": "./skills/".');
  }
  if (manifest.mcpServers !== "./.mcp.json") {
    fail('plugin.json must declare "mcpServers": "./.mcp.json".');
  }
}

export function validateMcpConfig(config) {
  const provider = config?.mcpServers?.noxinfluencer;
  if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
    fail('.mcp.json must declare mcpServers.noxinfluencer.');
  }

  const url = String(provider.url ?? "").trim();
  const oauthResource = String(provider.oauth_resource ?? "").trim();
  if (!url || !oauthResource) {
    fail("NoxInfluencer MCP url and oauth_resource must both be configured.");
  }
  if (url !== oauthResource) {
    fail("NoxInfluencer MCP url and oauth_resource must be exactly equal.");
  }
  if (url === legacyMcpResource) {
    fail(`Legacy MCP Resource is not allowed in the Codex Plugin package: ${url}`);
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    fail(`NoxInfluencer MCP Resource is not a valid absolute URL: ${error.message}`);
  }
  if (parsed.protocol !== "https:") {
    fail("NoxInfluencer MCP Resource must use HTTPS.");
  }
  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    url.endsWith("/")
  ) {
    fail(
      "NoxInfluencer MCP Resource must not contain userinfo, query, fragment, or a trailing slash.",
    );
  }

  const headers = provider.http_headers;
  if (headers && typeof headers === "object") {
    const hasLegacySurfaceHeader = Object.keys(headers).some(
      (name) => name.toLowerCase() === "x-nox-mcp-surface",
    );
    if (hasLegacySurfaceHeader) {
      fail(
        "x-nox-mcp-surface is not allowed; the Codex Plugin uses an independent MCP Resource path.",
      );
    }
  }
}

export function validatePluginSource({
  sourceDirectory = canonicalSkillSourceDirectory,
} = {}) {
  const manifest = readJson(
    join(projectRoot, ".codex-plugin", "plugin.json"),
    "plugin.json",
  );
  const mcpConfig = readJson(join(projectRoot, ".mcp.json"), ".mcp.json");

  validatePluginManifest(manifest);
  validateMcpConfig(mcpConfig);
  validateSkillManifest(sourceDirectory, "Canonical");
  validateSkillManifest(bundledSkillDirectory, "Bundled");
  verifyBundledSkillSync({ sourceDirectory });

  const runtimeMarker = join(
    bundledSkillDirectory,
    ...pluginRuntimeMarkerRelativePath.split("/"),
  );
  if (!existsSync(runtimeMarker)) {
    fail("Bundled Skill is missing references/codex-plugin-runtime.md.");
  }

  return { manifest, mcpConfig };
}
