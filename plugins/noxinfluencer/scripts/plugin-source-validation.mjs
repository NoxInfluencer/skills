import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { categories, isDevelopmentEndpoint } from "./submission-rules.mjs";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
  const name = scalar("name");
  requireValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name ?? ""), `${skillPath} must declare a valid name.`);
  let description = scalar("description");
  if (/^[>|][+-]?$/.test(description ?? "")) {
    description = frontmatter.match(/^description:[ \t]*[>|][+-]?[ \t]*\n((?:[ \t]+[^\n]*(?:\n|$))+)/m)?.[1].trim();
  }
  requireValue(description, `${skillPath} must declare a non-empty description.`);
  requireValue(content.slice(match[0].length).trim(), `${skillPath} must contain instructions.`);
  requireValue(!content.includes("[TODO:"), `${skillPath} contains a TODO placeholder.`);
  return name;
}

export function validateSkills(root, { release = false } = {}) {
  const skillsRoot = join(root, "skills");
  const primarySkillRoot = join(skillsRoot, "mcp");
  requireValue(existsSync(primarySkillRoot), "Missing skills/mcp/ delivery directory.");
  const files = listRuntimeFiles(skillsRoot).filter((file) => !file.endsWith(`${sep}.gitkeep`));
  const primarySkillFiles = files.filter((file) => file.startsWith(`${primarySkillRoot}${sep}`));
  const skillPath = join(primarySkillRoot, "SKILL.md");
  if (!existsSync(skillPath)) {
    requireValue(primarySkillFiles.length === 0, "skills/mcp/ contains files but no SKILL.md; delivery is incomplete.");
    requireValue(!release, "MCP Skill delivery is pending: add skills/mcp/SKILL.md before release.");
  }
  // Reserved shared business directories may be empty until their content is
  // delivered. Any actual payload still requires its own complete Skill.
  const reservedSharedSkills = new Set(["noxinfluencer", "influencer-marketing-manager"]);
  const skillNames = new Set();
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(skillsRoot, entry.name);
    const path = join(directory, "SKILL.md");
    if (entry.name === "mcp" && !existsSync(path)) continue;
    if (reservedSharedSkills.has(entry.name) && !existsSync(path) && !files.some((file) => file.startsWith(`${directory}${sep}`))) continue;
    requireValue(existsSync(path), `${path} is required; Skill delivery is incomplete.`);
    const name = validateSkill(path);
    requireValue(!skillNames.has(name), `Duplicate Skill name: ${name}`);
    skillNames.add(name);
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
  requireValue(categories.includes(iface.category) || (!release && iface.category === "Marketing"), "Codex category must be an official category, such as Business & Operations.");
  requireValue(Array.isArray(iface.capabilities), "Codex capabilities must be an array (which may be empty).");
  listRuntimeFiles(join(root, "assets"));
  for (const field of ["logo", "composerIcon"]) {
    if (iface[field]) validateAsset(root, iface[field]);
    else requireValue(!release, `Formal release requires interface.${field} and the approved brand asset.`);
  }
  const mcpConfig = readJson(join(root, ".mcp.json"));
  const provider = mcpConfig?.mcpServers?.noxinfluencer;
  requireValue(provider && (provider.type === undefined || ["http", "streamable-http"].includes(provider.type)), 'MCP provider must use remote HTTP.');
  requireValue(provider.oauth_resource === undefined || provider.url === provider.oauth_resource, "MCP url and oauth_resource must be equal.");
  const url = new URL(provider.url);
  requireValue(url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash && !provider.url.endsWith("/"), "MCP requires a clean HTTPS resource URL without a trailing slash.");
  requireValue(!release || !isDevelopmentEndpoint(url.hostname), "Formal release requires the confirmed production MCP endpoint; this configuration still uses a test or local endpoint.");
  const skills = validateSkills(root, { release });
  return { common, manifest, mcpConfig, skills };
}
