import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(pluginRoot, "..", "..");
const marketplacePath = join(
  repositoryRoot,
  ".agents",
  "plugins",
  "marketplace.json",
);
const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");

function fail(message) {
  throw new Error(message);
}

function readJson(path, label) {
  if (!existsSync(path)) fail(`${label} is missing: ${path}`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function main() {
  const manifest = readJson(manifestPath, "Plugin manifest");
  const marketplace = readJson(marketplacePath, "Repository marketplace");

  if (marketplace.name !== "noxinfluencer-codex") {
    fail(
      `Repository marketplace name must be "noxinfluencer-codex", received ${JSON.stringify(marketplace.name)}.`,
    );
  }
  if (!Array.isArray(marketplace.plugins)) {
    fail("Repository marketplace must contain a plugins array.");
  }

  const entries = marketplace.plugins.filter(
    (entry) => entry?.name === manifest.name,
  );
  if (entries.length !== 1) {
    fail(
      `Repository marketplace must contain exactly one entry for ${JSON.stringify(manifest.name)}.`,
    );
  }

  const entry = entries[0];
  const expectedSourcePath = `./plugins/${manifest.name}`;
  if (
    entry.source?.source !== "local" ||
    entry.source?.path !== expectedSourcePath
  ) {
    fail(
      `Marketplace entry must use local source ${JSON.stringify(expectedSourcePath)}.`,
    );
  }
  if (
    entry.policy?.installation !== "AVAILABLE" ||
    entry.policy?.authentication !== "ON_INSTALL"
  ) {
    fail(
      "Marketplace entry must use AVAILABLE installation and ON_INSTALL authentication policies.",
    );
  }
  if (entry.category !== "Marketing") {
    fail('Marketplace entry category must be "Marketing".');
  }

  const resolvedPluginPath = resolve(
    repositoryRoot,
    entry.source.path.slice(2),
  );
  if (resolvedPluginPath !== pluginRoot) {
    fail(
      `Marketplace source resolves to ${resolvedPluginPath}, expected ${pluginRoot}.`,
    );
  }

  console.log(
    `Repository marketplace validation passed: ${manifest.name}@${marketplace.name}`,
  );
}

try {
  main();
} catch (error) {
  console.error(`Marketplace validation failed: ${error.message}`);
  process.exitCode = 1;
}
