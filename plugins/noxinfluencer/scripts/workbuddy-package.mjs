import { createHash, randomUUID } from "node:crypto";
import { createWriteStream, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";
import { imageSize } from "image-size";
import { parseDocument } from "yaml";
import semver from "semver";
import yazl from "yazl";
import { isDevelopmentEndpoint } from "./submission-rules.mjs";

export const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hash = (data) => createHash("sha256").update(data).digest("hex");
const jsonBytes = (value) => Buffer.from(JSON.stringify(value, null, 2) + "\n");
const utf8 = new TextDecoder("utf-8", { fatal: true });
const ignorable = new Set([".gitkeep", ".DS_Store", "Thumbs.db"]);
const unsafe = /^(?:\.git|node_modules|dist|build|coverage|logs|\.env(?:\..*)?|id_rsa|id_ed25519)$|\.(?:pem|key|p12|pfx|log)$/i;
// Local packaging safeguards, not claimed to be WorkBuddy platform limits.
const maxFiles = 5000, maxFileBytes = 100 * 1024 * 1024, maxTotalBytes = 512 * 1024 * 1024;
const validVersion = (value) => typeof value === "string" && /^\d/.test(value) && !/\s|\+codex[.]/i.test(value) && Boolean(semver.valid(value));

export function inspectWorkbuddyPackage({ root = pluginRoot, development = false } = {}) {
  root = resolve(root);
  const issues = [], warnings = [], files = new Map(), seen = new Set();
  let totalBytes = 0, visited = 0;
  const issue = (path, message) => issues.push(`${path}: ${message}`);
  const text = (value, field) => {
    if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f]/u.test(value)) issue(field, "必须为非空单行文本。");
  };
  function read(name, optional = false) {
    try {
      const parts = name.split("/");
      if (parts.length > 20 || parts.some((part) => !part || part === "." || part === ".." || unsafe.test(part))
        || /[\\:\u0000-\u001f\u007f]/u.test(name)) throw new Error("路径不安全或包含开发文件／凭据文件");
      let current = root;
      if (lstatSync(current).isSymbolicLink()) throw new Error("插件根目录不能是符号链接");
      for (const part of parts) {
        current = join(current, part);
        if (lstatSync(current).isSymbolicLink()) throw new Error("不能读取符号链接或目录联接");
      }
      const stat = lstatSync(current);
      if (!stat.isFile() || stat.size > maxFileBytes) throw new Error("必须是小于等于 100 MiB 的普通文件");
      return readFileSync(current);
    } catch (error) {
      if (!optional || error.code !== "ENOENT") issue(name, error.code === "ENOENT" ? "缺少文件" : error.message);
    }
  }
  function json(name) {
    const data = read(name);
    if (!data) return {};
    try {
      const value = JSON.parse(utf8.decode(data));
      if (!object(value)) throw new Error("根节点必须是对象");
      return value;
    } catch (error) { issue(name, `JSON 无效：${error.message}`); return {}; }
  }
  function add(name, data) {
    const key = name.normalize("NFC").toLowerCase();
    if (seen.has(key)) return issue(name, "存在大小写或 Unicode 规范化后重复的路径");
    seen.add(key);
    if (++visited > maxFiles || totalBytes + data.length > maxTotalBytes) return issue(name, "超过本地打包文件数量或总大小限制");
    totalBytes += data.length;
    files.set(name, data);
  }
  function walk(name, depth = 0) {
    if (depth > 18 || visited > maxFiles) return issue(name, "目录过深或文件过多");
    try {
      const stat = lstatSync(join(root, name));
      if (stat.isSymbolicLink()) return issue(name, "不能打包符号链接或目录联接");
      if (unsafe.test(name.split("/").at(-1))) return issue(name, "不能打包开发目录或凭据文件");
      if (stat.isDirectory()) {
        for (const child of readdirSync(join(root, name)).sort()) if (!ignorable.has(child)) walk(`${name}/${child}`, depth + 1);
      } else {
        const data = read(name);
        if (data) add(name, data);
      }
    } catch (error) { issue(name, error.code === "ENOENT" ? "缺少目录" : error.message); }
  }

  const common = json(".plugin/plugin.json");
  if (common.name !== "noxinfluencer") issue(".plugin/plugin.json:name", "插件名称必须为 noxinfluencer");
  if (!validVersion(common.version)) issue(".plugin/plugin.json:version", "必须使用正式语义化版本，不能使用本地 cachebuster");
  text(common.author?.name, ".plugin/plugin.json:author.name");
  const metadata = json("workbuddy/connector-meta.json");
  const allowed = new Set(["name", "name_zh", "name_en", "description", "description_zh", "description_en", "source", "type", "examples_zh", "examples_en", "minWorkbuddyVersion"]);
  for (const key of Object.keys(metadata)) if (!allowed.has(key)) issue(`connector-meta.json:${key}`, "当前 OAuth 连接器不支持此字段；version 从通用 Manifest 生成");
  for (const key of ["name", "name_en", "description", "description_zh", "description_en"]) text(metadata[key], `connector-meta.json:${key}`);
  if (metadata.name_zh !== undefined) text(metadata.name_zh, "connector-meta.json:name_zh");
  if (metadata.source !== "noxinfluencer") issue("connector-meta.json:source", "本插件使用 noxinfluencer；提交时仍需确认全局唯一性");
  if (metadata.type !== "mcp") issue("connector-meta.json:type", "必须为 mcp");
  for (const lang of ["zh", "en"]) {
    const list = metadata[`examples_${lang}`];
    if (!Array.isArray(list) || list.length < 2 || list.length > 5) issue(`examples_${lang}`, "本项目使用官方建议的 2～5 条示例");
    else {
      list.forEach((value, index) => text(value, `examples_${lang}[${index}]`));
      if (new Set(list).size !== list.length) issue(`examples_${lang}`, "示例不能重复");
    }
  }
  if (!validVersion(metadata.minWorkbuddyVersion) || semver.lt(metadata.minWorkbuddyVersion, "4.24.0")) issue("minWorkbuddyVersion", "中英文示例字段要求至少 4.24.0");
  add("connector-meta.json", jsonBytes({ ...metadata, version: common.version }));

  const originalMcp = json(".mcp.json");
  const servers = object(originalMcp.mcpServers) ? Object.entries(originalMcp.mcpServers) : [];
  if (Object.keys(originalMcp).some((key) => key !== "mcpServers") || servers.length !== 1 || servers[0]?.[0] !== "noxinfluencer") issue(".mcp.json", "只允许一个名为 noxinfluencer 的 MCP Server");
  const server = object(servers[0]?.[1]) ? servers[0][1] : {};
  if (Object.keys(server).some((key) => !["type", "url", "oauth_resource"].includes(key))) issue(".mcp.json", "当前适配仅支持远程 OAuth，不接受凭据、固定请求头或本地启动命令");
  if (server.type !== undefined && !["http", "streamable-http", "streamableHttp"].includes(server.type)) issue(".mcp.json:type", "必须使用远程 Streamable HTTP MCP");
  try {
    const url = new URL(server.url);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || server.url.trim() !== server.url) throw new Error();
    if (isDevelopmentEndpoint(url.hostname)) {
      const message = ".mcp.json:url: 当前是测试／示例／本地地址，正式提交需要公网生产 MCP 地址。";
      (development ? warnings : issues).push(message);
    }
  } catch { issue(".mcp.json:url", "必须是有效 HTTPS 地址，不含凭据、查询或片段"); }
  if (server.oauth_resource !== undefined && server.oauth_resource !== server.url) issue(".mcp.json:oauth_resource", "必须与 url 一致");
  // OAuth is discovered by WorkBuddy. Never copy OpenAI-specific auth fields.
  add("mcp.json", jsonBytes({ mcpServers: { noxinfluencer: { type: "streamableHttp", url: server.url, timeout: 30000 } } }));
  const icon = read("assets/icon.png");
  if (icon) {
    try {
      const size = imageSize(icon);
      if (size.type !== "png" || size.width !== size.height || !size.width) throw new Error("必须为正方形 PNG");
    } catch (error) { issue("assets/icon.png", `图标无效：${error.message}`); }
    add("icon.png", icon);
  }

  const overlays = json("workbuddy/skill-metadata.json");
  const overlayFields = ["display_name", "display_name_en", "description_zh", "description_en"];
  for (const [directory, overlay] of Object.entries(overlays)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(directory) || !object(overlay)) {
      issue(`workbuddy/skill-metadata.json:${directory}`, "必须按合法 Skill 目录名配置字段对象"); continue;
    }
    for (const [key, value] of Object.entries(overlay)) {
      if (!overlayFields.includes(key)) issue(`workbuddy/skill-metadata.json:${directory}.${key}`, "不支持此平台补充字段");
      else text(value, `workbuddy/skill-metadata.json:${directory}.${key}`);
    }
  }
  walk("skills");
  const mcpPending = !files.has("skills/mcp/SKILL.md");
  if (mcpPending) {
    const message = "skills/mcp/SKILL.md: MCP Skill 尚未交付；本项目正式包要求包含完整 Skill。";
    (development ? warnings : issues).push(message);
  }
  const directories = new Set([...files.keys()].filter((name) => name.startsWith("skills/")).map((name) => name.split("/")[1]));
  for (const directory of directories) if (!files.has(`skills/${directory}/SKILL.md`)) issue(`skills/${directory}`, "目录缺少直接放置的 SKILL.md，不能再套一层目录");
  for (const [name, data] of files) {
    if (!name.startsWith("skills/") || name.split("/").at(-1).toLowerCase() !== "skill.md") continue;
    if (!/^skills\/[^/.][^/]*\/SKILL\.md$/.test(name)) { issue(name, "必须直接放在 skills/<目录>/SKILL.md"); continue; }
    try {
      const content = utf8.decode(data).replace(/^\uFEFF/, "");
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!match) throw new Error("缺少 YAML frontmatter");
      const document = parseDocument(match[1], { uniqueKeys: true });
      if (document.errors.length) throw new Error(document.errors.map((error) => error.message).join("; "));
      let fields = document.toJS({ maxAliasCount: 50 });
      if (!object(fields)) throw new Error("frontmatter 必须为对象");
      const overlay = overlays[name.split("/")[1]] ?? {};
      if (!object(overlay) || Object.keys(overlay).some((key) => !overlayFields.includes(key))) throw new Error("Skill 平台补充配置包含不支持的字段");
      for (const [key, value] of Object.entries({ ...overlay, version: common.version, author: common.author?.name })) {
        if (!Object.hasOwn(fields, key)) document.set(key, value);
      }
      fields = document.toJS({ maxAliasCount: 50 });
      for (const key of ["description", "description_zh", "description_en", "author"]) {
        if (typeof fields[key] !== "string" || !fields[key].trim()) throw new Error(`缺少有效 ${key}；中英文说明可在 workbuddy/skill-metadata.json 按目录补充`);
      }
      if (fields.name !== undefined && (typeof fields.name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name))) throw new Error("Skill name 无效");
      if (!validVersion(fields.version)) throw new Error("Skill version 必须是语义化版本");
      const body = content.slice(match[0].length);
      if (!body.trim()) throw new Error("Skill 正文不能为空");
      // Only the output buffer receives additional platform metadata. Body is verbatim.
      files.set(name, Buffer.from(`---\n${document.toString()}---\n${body}`));
    } catch (error) { issue(name, `Skill 无效：${error.message}`); }
  }
  for (const [name, data] of files) {
    if (!name.startsWith("skills/") || !/\.md$/i.test(name)) continue;
    let content;
    try { content = utf8.decode(data); } catch { issue(name, "必须使用 UTF-8"); continue; }
    for (const match of content.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g)) {
      const raw = match[1] ?? match[2];
      if (raw.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(raw)) continue;
      try {
        const target = decodeURIComponent(raw.split(/[?#]/)[0]);
        if (!target) continue;
        const path = posix.normalize(posix.join(posix.dirname(name), target));
        if (target.startsWith("/") || target.includes("\\") || path.startsWith("../") || (!files.has(path) && ![...files.keys()].some((key) => key.startsWith(`${path.replace(/\/$/, "")}/`)))) issue(name, `Markdown 引用未包含在包内：${raw}`);
      } catch { issue(name, `无效引用：${raw}`); }
    }
  }
  if (development) warnings.unshift("开发包仅用于本地联调，不能作为正式上架包上传。");
  return { root, development, metadata: { ...metadata, version: common.version }, entries: [...files].map(([name, data]) => ({ name, data })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0), issues, warnings };
}

export async function packageForWorkbuddy(options = {}) {
  const plan = inspectWorkbuddyPackage(options);
  if (plan.issues.length) throw new Error(`WorkBuddy 打包检查未通过（${plan.issues.length} 项）：\n${plan.issues.map((issue) => `- ${issue}`).join("\n")}`);
  const output = join(plan.root, "dist");
  if (existsSync(output) && (lstatSync(output).isSymbolicLink() || !lstatSync(output).isDirectory())) throw new Error("dist 必须是普通目录，不能是符号链接或目录联接");
  mkdirSync(output, { recursive: true });
  const filename = `noxinfluencer-workbuddy-${plan.metadata.version}${plan.development ? "-dev" : ""}.zip`;
  const target = join(output, filename), temporary = join(output, `.workbuddy-${randomUUID()}.zip`);
  try {
    await new Promise((done, reject) => {
      const zip = new yazl.ZipFile();
      const stream = createWriteStream(temporary, { flags: "wx" });
      stream.on("close", done);
      stream.on("error", reject);
      zip.outputStream.on("error", reject);
      zip.outputStream.pipe(stream);
      for (const entry of plan.entries) zip.addBuffer(entry.data, entry.name, { mtime: new Date("1980-01-01T00:00:00Z"), mode: 0o100644 });
      zip.end();
    });
    const sha256 = hash(readFileSync(temporary));
    renameSync(temporary, target);
    const inventory = plan.entries.map(({ name, data }) => ({ path: name, bytes: data.length, sha256: hash(data) }));
    for (const [suffix, data] of [[".sha256", `${sha256}  ${filename}\n`], [".files.json", JSON.stringify(inventory, null, 2) + "\n"]]) {
      const pending = join(output, `.workbuddy-${randomUUID()}.tmp`);
      try { writeFileSync(pending, data, { flag: "wx" }); renameSync(pending, target + suffix); }
      finally { rmSync(pending, { force: true }); }
    }
    return { path: target, sha256, fileCount: plan.entries.length, warnings: plan.warnings };
  } finally { rmSync(temporary, { force: true }); }
}
