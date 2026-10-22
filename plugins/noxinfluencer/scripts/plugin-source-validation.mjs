import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const testMcpResource = "https://skilltest.noxinfluencer.com/mcp";

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

export function readJson(path, label = path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

// Scan delivered content as well as placeholder directories. Never follow links
// into another Skill tree or the developer's machine.
export function listRuntimeFiles(path, root = path) {
  const stat = lstatSync(path);
  const name = relative(root, path).split(sep).join("/");
  requireValue(!stat.isSymbolicLink(), `Symbolic links are not allowed: ${name || path}`);
  if (stat.isDirectory()) {
    requireValue(!/^(node_modules|dist|build|coverage|logs|evals|\.git|\.evals)$/i.test(path.split(sep).at(-1)), `Development directory is not allowed: ${name}`);
    return readdirSync(path).sort().flatMap((entry) => listRuntimeFiles(join(path, entry), root));
  }
  requireValue(stat.isFile(), `Unsupported filesystem entry: ${name}`);
  requireValue(!/^(\.env(?:\..*)?|id_rsa)$|\.(pem|key|p12|pfx|log)$/i.test(path.split(sep).at(-1)), `Potential secret or log file is not allowed: ${name}`);
  return [path];
}

function validateSkill(skillPath) {
  const content = readFileSync(skillPath, "utf8").replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const match = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  const frontmatter = match?.[1];
  requireValue(frontmatter, `${skillPath} must begin with YAML frontmatter.`);
  const scalar = (field) => frontmatter.match(new RegExp(`^${field}:[ \\t]*([^\\n]*)$`, "m"))?.[1].trim().replace(/^(['"])(.*)\1$/, "$2");
  requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scalar("name") ?? ""), `${skillPath} must declare a valid name.`);
  let description = scalar("description");
  if (/^[>|][+-]?$/.test(description ?? "")) {
    description = frontmatter.match(/^description:[ \t]*[>|][+-]?[ \t]*\n((?:[ \t]+[^\n]*(?:\n|$))+)/m)?.[1].trim();
  }
  requireValue(description, `${skillPath} must declare a non-empty description.`);
  requireValue(content.slice(match[0].length).trim(), `${skillPath} must contain instructions.`);
  requireValue(!content.includes("[TODO:"), `${skillPath} contains a TODO placeholder.`);
}

export function validateSkills(root, { release = false } = {}) {
  const skillsRoot = join(root, "skills");
  const mcpRoot = join(skillsRoot, "mcp");
  requireValue(existsSync(mcpRoot), "Missing skills/mcp/ delivery directory.");
  const files = listRuntimeFiles(skillsRoot).filter((file) => !file.endsWith(`${sep}.gitkeep`));
  const mcpFiles = files.filter((file) => file.startsWith(`${mcpRoot}${sep}`));
  const skillPath = join(mcpRoot, "SKILL.md");
  if (!existsSync(skillPath)) {
    requireValue(mcpFiles.length === 0, "skills/mcp/ contains files but no SKILL.md; delivery is incomplete.");
    requireValue(!release, "MCP Skill delivery is pending: add skills/mcp/SKILL.md before release.");
  }
  // Every direct child is an independently loadable Skill. No host-specific
  // runtime marker is generated or injected into the MCP team's content.
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(skillsRoot, entry.name, "SKILL.md");
    if (entry.name === "mcp" && !existsSync(path)) continue;
    validateSkill(path);
  }
  return { pending: !existsSync(skillPath), fileCount: files.length };
}

function validateAsset(root, assetPath) {
  requireValue(typeof assetPath === "string" && assetPath.startsWith("./") && !assetPath.includes("\\") && !assetPath.split("/").includes(".."), "Asset paths must be ./-prefixed paths inside the plugin.");
  const resolvedPath = resolve(root, assetPath);
  const rel = relative(realpathSync(root), realpathSync(resolvedPath));
  requireValue(rel && !rel.startsWith(`..${sep}`) && !isAbsolute(rel), "Asset path escapes the plugin.");
  const stat = lstatSync(resolvedPath);
  requireValue(stat.isFile() && stat.size > 0 && stat.size <= 5 * 1024 * 1024, `Asset must be a non-empty image at most 5 MiB: ${assetPath}`);
  requireValue(/\.(svg|png|jpe?g|webp)$/i.test(assetPath), `Unsupported image format: ${assetPath}`);
}

export function validatePluginSource({ root = projectRoot, release = false } = {}) {
  const common = readJson(join(root, ".plugin", "plugin.json"));
  const manifest = readJson(join(root, ".codex-plugin", "plugin.json"));
  for (const [label, entry] of [["Common", common], ["Codex", manifest]]) {
    requireValue(entry?.name === "noxinfluencer", `${label} plugin name must be noxinfluencer.`);
    requireValue(typeof entry.version === "string" && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(entry.version), `${label} manifest requires a semantic version.`);
    requireValue(typeof entry.description === "string" && entry.description.trim(), `${label} description is required.`);
  }
  for (const key of Object.keys(common)) {
    requireValue(isDeepStrictEqual(common[key], manifest[key]), `Common and Codex manifest fields differ: ${key}`);
  }
  requireValue(manifest.skills === "./skills/", 'Codex skills must be "./skills/".');
  requireValue(manifest.mcpServers === "./.mcp.json", 'Codex mcpServers must be "./.mcp.json".');
  const iface = manifest.interface;
  for (const field of ["displayName", "shortDescription", "longDescription", "developerName", "category"]) {
    requireValue(typeof iface?.[field] === "string" && iface[field].trim(), `Codex interface.${field} is required.`);
  }
  requireValue(iface.category === "Marketing", "Codex category must be Marketing.");
  requireValue(Array.isArray(iface.capabilities) && iface.capabilities.length > 0, "Codex capabilities are required.");
  listRuntimeFiles(join(root, "assets"));
  for (const field of ["logo", "composerIcon"]) {
    if (iface[field]) validateAsset(root, iface[field]);
    else requireValue(!release, `Formal release requires interface.${field} and the approved brand asset.`);
  }
  const mcpConfig = readJson(join(root, ".mcp.json"));
  const provider = mcpConfig?.mcpServers?.noxinfluencer;
  requireValue(provider?.type === "http", 'MCP provider type must be "http".');
  requireValue(provider.url === provider.oauth_resource, "MCP url and oauth_resource must be equal.");
  const url = new URL(provider.url);
  requireValue(url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash && !provider.url.endsWith("/"), "MCP requires a clean HTTPS resource URL without a trailing slash.");
  requireValue(provider.url === testMcpResource, `This test configuration must use ${testMcpResource}. Update validation deliberately when selecting the production endpoint.`);
  requireValue(!release || provider.url !== testMcpResource, "Formal release requires the confirmed production MCP endpoint; this configuration still uses skilltest.");
  const skills = validateSkills(root, { release });
  return { common, manifest, mcpConfig, skills };
}
