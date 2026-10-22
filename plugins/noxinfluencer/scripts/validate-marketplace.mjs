import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projectRoot, readJson } from "./plugin-source-validation.mjs";

export function validateMarketplaces(repositoryRoot = resolve(projectRoot, "../.."), pluginRoot = projectRoot) {
  const generic = readJson(join(repositoryRoot, ".plugin/marketplace.json"));
  if (generic.name !== "noxinfluencer-plugins" || generic.plugins?.length !== 1) {
    throw new Error("Generic marketplace must be noxinfluencer-plugins with exactly one plugin.");
  }
  const entry = generic.plugins[0];
  if (entry.name !== "noxinfluencer" || entry.source !== "./plugins/noxinfluencer" || generic.metadata?.pluginRoot) {
    throw new Error("Generic marketplace must resolve ./plugins/noxinfluencer directly from the repository root.");
  }
  if (resolve(repositoryRoot, entry.source) !== resolve(pluginRoot)) throw new Error("Generic marketplace points at a different plugin.");
  // plugins checks this file before .plugin/marketplace.json.
  if (existsSync(join(repositoryRoot, "marketplace.json"))) throw new Error("Root marketplace.json shadows the new .plugin/marketplace.json.");
  const native = readJson(join(repositoryRoot, ".agents/plugins/marketplace.json"));
  const matches = native.plugins?.filter((plugin) => plugin.name === entry.name) ?? [];
  const source = matches[0];
  if (native.name !== "noxinfluencer-codex" || matches.length !== 1 || source.source?.source !== "local" || source.source?.path !== entry.source || source.category !== "Marketing" || source.policy?.installation !== "AVAILABLE" || source.policy?.authentication !== "ON_INSTALL") {
    throw new Error("Existing Codex marketplace must keep its local NoxInfluencer entry and install/auth policies.");
  }
  return generic;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) try {
  const marketplace = validateMarketplaces();
  console.log(`Marketplace validation passed: ${marketplace.plugins[0].source} (${marketplace.name})`);
} catch (error) {
  console.error(`Marketplace validation failed: ${error.message}`);
  process.exitCode = 1;
}
