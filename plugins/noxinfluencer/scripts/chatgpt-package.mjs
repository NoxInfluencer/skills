import { createHash, randomUUID } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, createWriteStream } from "node:fs";
import { dirname, extname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";
import { imageSize } from "image-size";
import { parseDocument } from "yaml";
import semver from "semver";
import yazl from "yazl";
import { categories, isDevelopmentEndpoint, limits } from "./submission-rules.mjs";

export const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const utf8 = new TextDecoder("utf-8", { fatal: true });
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const length = (value) => [...value].length;
const ignorable = new Set([".gitkeep", ".DS_Store", "Thumbs.db"]);
const forbidden = /^(?:\.git|node_modules|dist|build|coverage|logs|\.env(?:\..*)?|id_rsa|id_ed25519)$|\.(?:pem|key|p12|pfx|log)$/i;

export function inspectChatgptPackage(root = pluginRoot) {
  root = resolve(root);
  const issues = [];
  const entries = [];
  const names = new Set();
  let totalBytes = 0;
  const issue = (field, message) => issues.push(`${field}: ${message}`);

  function text(value, field, max, { singleLine = false } = {}) {
    if (typeof value !== "string" || !value.trim()) return issue(field, "必须填写非空文本。");
    if (length(value) > max) issue(field, `最多 ${max} 字符，当前 ${length(value)} 字符。`);
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b\u2028\u2029\ufeff]/u.test(value)
      || (singleLine && /[\r\n\t]/u.test(value))) issue(field, "包含不支持的控制字符、隐藏字符或换行。");
  }

  function https(value, field, { production = false, max = 1024 } = {}) {
    text(value, field, max, { singleLine: true });
    if (typeof value !== "string" || !value.trim()) return;
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || value.trim() !== value) throw new Error();
      if (production && isDevelopmentEndpoint(url.hostname)) issue(field, "必须使用公开生产地址，不能使用测试、示例或本地地址。");
      return url;
    } catch {
      issue(field, "必须是有效的 HTTPS URL，且不能包含账号密码。");
    }
  }

  function collect(name) {
    if (entries.length >= limits.files) return issue(name, "ZIP 文件数量超过 5000。");
    const segments = name.split("/");
    if (segments.length > 20 || segments.some((part) => !part || part === "." || part === ".." || forbidden.test(part))
      || /[\\:\u0000-\u001f\u007f]/u.test(name) || name.trim() !== name) return issue(name, "路径不安全、过深或包含开发文件／密钥文件。");
    let current = root;
    try {
      for (const part of segments) {
        current = join(current, part);
        if (lstatSync(current).isSymbolicLink()) return issue(name, "不能打包符号链接或目录联接。");
      }
      const stat = lstatSync(current);
      if (stat.isDirectory()) {
        for (const child of readdirSync(current).sort()) {
          if (!ignorable.has(child)) collect(`${name}/${child}`);
        }
        return;
      }
      if (!stat.isFile()) return issue(name, "必须是普通文件。");
      const normalized = name.normalize("NFC").toLowerCase();
      if (names.has(normalized)) return issue(name, "存在大小写或 Unicode 规范化后重复的路径。");
      names.add(normalized);
      if (stat.size > limits.fileBytes || totalBytes + stat.size > limits.totalBytes) return issue(name, "文件超过 100 MiB 或解压总大小超过 512 MiB。");
      const data = readFileSync(current);
      totalBytes += data.length;
      entries.push({ name, data });
    } catch (error) {
      issue(name, `无法读取文件：${error.code ?? error.message}`);
    }
  }

  // Only these runtime components enter the public-directory ZIP.
  for (const name of [".codex-plugin/plugin.json", ".mcp.json", "skills", "assets"]) collect(name);
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const files = new Map(entries.map((entry) => [entry.name, entry.data]));
  const decode = (name) => {
    try { return utf8.decode(files.get(name)); }
    catch { issue(name, "必须是有效 UTF-8 文本。"); return ""; }
  };
  const json = (name) => {
    if (!files.has(name)) return {};
    try {
      const value = JSON.parse(decode(name));
      if (!object(value)) throw new Error("根节点必须是对象");
      return value;
    } catch (error) { issue(name, `JSON 无效：${error.message}`); return {}; }
  };
  const manifest = json(".codex-plugin/plugin.json");
  const mcp = json(".mcp.json");

  text(manifest.name, "name", 64, { singleLine: true });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name ?? "")) issue("name", "使用小写字母、数字和单个连字符。");
  if (manifest.name !== "noxinfluencer") issue("name", "本项目插件标识必须为 noxinfluencer。");
  text(manifest.version, "version", 64, { singleLine: true });
  if (!semver.valid(manifest.version) || !/^\d/.test(manifest.version ?? "") || /\s/u.test(manifest.version ?? "")) issue("version", "必须是有效的语义化版本号，不带 v 前缀或空白。");
  if (/\+codex[.]/i.test(manifest.version ?? "")) issue("version", "正式包不能使用本地 Codex cachebuster 版本。");
  text(manifest.description, "description", 1024);
  text(manifest.author?.name, "author.name", 120, { singleLine: true });
  if (manifest.author?.email !== undefined) text(manifest.author.email, "author.email", 320, { singleLine: true });
  for (const field of ["repository", "license"]) if (manifest[field] !== undefined) text(manifest[field], field, Infinity, { singleLine: true });
  if (manifest.keywords !== undefined) {
    if (!Array.isArray(manifest.keywords)) issue("keywords", "必须是关键词字符串数组。");
    else manifest.keywords.forEach((value, index) => text(value, `keywords[${index}]`, Infinity, { singleLine: true }));
  }
  for (const [field, value] of [["homepage", manifest.homepage], ["author.url", manifest.author?.url]]) {
    if (value !== undefined) https(value, field, { max: 2048 });
  }
  if (manifest.skills !== "./skills/") issue("skills", '必须配置为 "./skills/"。');
  if (manifest.mcpServers !== "./.mcp.json") issue("mcpServers", '必须配置为 "./.mcp.json"。');
  for (const field of ["apps", "hooks", "requires_local_executor"]) {
    if (manifest[field]) issue(field, "本远程 MCP 公开提交包不能依赖 app 引用、生命周期钩子或本地执行环境。");
  }
  const extension = manifest.extensions?.["com.openai"];
  if (extension?.hooks || extension?.apps || extension?.requires_local_executor) issue("extensions.com.openai", "不能包含 app 引用、生命周期钩子或本地执行要求。");

  const iface = manifest.interface ?? {};
  for (const [field, max] of [["displayName", 30], ["shortDescription", 30], ["developerName", 80]]) {
    text(iface[field], `interface.${field}`, max, { singleLine: true });
  }
  text(iface.longDescription, "interface.longDescription", 4000);
  if (!categories.includes(iface.category)) issue("interface.category", `必须选择官方分类，例如 Business & Operations；当前为 ${JSON.stringify(iface.category)}。`);
  if (!Array.isArray(iface.capabilities) || iface.capabilities.length > 20) issue("interface.capabilities", "必须是最多 20 项的数组，可以为空数组。");
  else iface.capabilities.forEach((value, index) => text(value, `interface.capabilities[${index}]`, 120, { singleLine: true }));
  for (const field of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) https(iface[field], `interface.${field}`, { production: true });

  const prompts = typeof iface.defaultPrompt === "string" ? [iface.defaultPrompt] : iface.defaultPrompt;
  if (prompts !== undefined) {
    if (!Array.isArray(prompts) || prompts.length > 3) issue("interface.defaultPrompt", "最多提供 3 条示例提问。");
    else {
      const used = new Set();
      prompts.forEach((prompt, index) => {
        const field = `interface.defaultPrompt[${index}]`;
        text(prompt, field, 128, { singleLine: true });
        if (typeof prompt !== "string") return;
        if (/(?:^|\s)@\S+/u.test(prompt)) issue(field, "不能包含插件 @提及。");
        const key = prompt.normalize("NFKC").replace(/\s+/g, " ").trim();
        if (used.has(key)) issue(field, "示例提问重复。");
        used.add(key);
      });
    }
  }

  function asset(value, field, { square = true } = {}) {
    if (typeof value !== "string" || !value.startsWith("./assets/") || value.includes("\\") || value.split("/").some((part) => part === ".." || !part) || value.trim() !== value) {
      issue(field, "必须引用 ./assets/ 下的包内文件。"); return;
    }
    const data = files.get(value.slice(2));
    if (!data) return issue(field, `引用文件不存在或未打包：${value}`);
    if (data.length > limits.imageBytes) issue(field, "图片不能超过 5 MiB。");
    try {
      const dimensions = imageSize(data);
      const ext = extname(value).slice(1).toLowerCase().replace("jpeg", "jpg");
      if (!["png", "jpg", "webp", "svg"].includes(ext) || dimensions.type !== ext) issue(field, "图片扩展名与格式不匹配，支持 PNG、JPEG、WebP、SVG。");
      if (square && (dimensions.width !== dimensions.height || dimensions.width < 48)) issue(field, "图标必须为至少 48×48 的正方形。");
      if (dimensions.type !== "svg" && (dimensions.width > 4096 || dimensions.height > 4096)) issue(field, "位图不能超过 4096×4096。");
    } catch (error) { issue(field, `无法解析图片尺寸：${error.message}`); }
  }
  for (const field of ["logo", "composerIcon"]) asset(iface[field], `interface.${field}`);
  for (const field of ["logoDark", "composerIconDark"]) if (iface[field] !== undefined) asset(iface[field], `interface.${field}`);
  if (iface.screenshots !== undefined) {
    if (!Array.isArray(iface.screenshots)) issue("interface.screenshots", "必须是包内图片路径数组。");
    else iface.screenshots.forEach((value, index) => asset(value, `interface.screenshots[${index}]`, { square: false }));
  }

  function luminance(color) {
    const rgb = color.match(/[a-f\d]{2}/gi).map((part) => parseInt(part, 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  for (const [field, background] of [["brandColor", "#FFFFFF"], ["brandColorDark", "#212121"]]) {
    if (iface[field] === undefined) continue;
    if (!/^#[a-f\d]{6}$/i.test(iface[field])) issue(`interface.${field}`, "必须是 #RRGGBB 颜色。");
    else {
      const a = luminance(iface[field]), b = luminance(background);
      if ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) < 2) issue(`interface.${field}`, `与 ${background} 的对比度必须至少 2:1。`);
    }
  }

  const servers = object(mcp.mcpServers) ? Object.entries(mcp.mcpServers) : [];
  if (servers.length !== 1 || servers[0]?.[0] !== "noxinfluencer") issue(".mcp.json", "本插件必须配置一个名为 noxinfluencer 的远程 MCP 服务。");
  for (const [name, server] of servers) {
    if (!object(server)) { issue(`MCP ${name}`, "配置必须为对象。"); continue; }
    const url = https(server.url, `MCP ${name}.url`, { production: true, max: 2048 });
    if (url?.search || url?.hash || (typeof server.url === "string" && server.url.endsWith("/"))) issue(`MCP ${name}.url`, "本项目 MCP Resource 地址不使用查询、片段或尾部斜杠。");
    if (server.command || server.args || (server.type !== undefined && server.type !== "http" && server.type !== "streamable-http")) issue(`MCP ${name}`, "只支持远程 HTTP MCP，不能包含本地启动命令。");
    if (server.oauth_resource !== undefined && server.oauth_resource !== server.url) issue(`MCP ${name}.oauth_resource`, "当前插件的 OAuth Resource 必须与 MCP URL 一致。");
    if ([server.headers, server.http_headers].some((headers) => headers && Object.keys(headers).length)) issue(`MCP ${name}`, "公开提交不能包含固定认证请求头。");
    const auth = server.extensions?.["com.openai"]?.auth;
    if (auth && !["none", "oauth", "mixed"].includes(auth.type)) issue(`MCP ${name}.auth`, "提交后台支持 none、oauth 或 mixed 认证。");
  }
  function findCredentials(value, trail) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (/^(?:clientSecret|client_secret|test_credentials|reviewer_instructions|access_token|refresh_token|bearer_token)$/i.test(key)) issue(`${trail}.${key}`, "凭据及审核登录说明必须单独填写到官方后台，不能放进 ZIP。");
      findCredentials(child, `${trail}.${key}`);
    }
  }
  findCredentials(manifest, "plugin.json");
  findCredentials(mcp, ".mcp.json");

  const skillNames = new Set();
  const skillManifests = entries.filter(({ name }) => name.startsWith("skills/") && name.split("/").at(-1).toLowerCase() === "skill.md");
  if (!files.has("skills/mcp/SKILL.md")) issue("skills/mcp/SKILL.md", "MCP Skill 尚未完整交付；SKILL.md 必须直接位于 mcp/ 下。");
  for (const { name } of skillManifests) {
    const parts = name.split("/");
    if (parts.length !== 3 || parts[1].startsWith(".") || parts[2] !== "SKILL.md") {
      issue(name, "每个 Skill 必须使用 skills/<目录>/SKILL.md，不能再套分组目录。"); continue;
    }
    const content = decode(name).replace(/^\uFEFF/, "");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) { issue(name, "必须有完整的 YAML frontmatter。"); continue; }
    try {
      const document = parseDocument(match[1], { uniqueKeys: true });
      if (document.errors.length) throw new Error(document.errors.map((error) => error.message).join("; "));
      const data = document.toJS({ maxAliasCount: 50 });
      if (!object(data)) throw new Error("frontmatter 必须为 YAML 对象");
      text(data.name, `${name}:name`, 64, { singleLine: true });
      text(data.description, `${name}:description`, 1024);
      if (typeof data.name === "string") {
        if (skillNames.has(data.name)) issue(name, "Skill 名称不能重复。");
        skillNames.add(data.name);
        if (length(`${manifest.name}:${data.name}`) > 64) issue(name, "插件名:Skill名 合计不能超过 64 字符。");
      }
      if (!content.slice(match[0].length).trim()) issue(name, "Skill 正文不能为空。");
    } catch (error) { issue(name, `YAML 无效：${error.message}`); }
  }
  for (const directory of new Set(entries.filter(({ name }) => name.startsWith("skills/")).map(({ name }) => name.split("/")[1]))) {
    if (!files.has(`skills/${directory}/SKILL.md`)) issue(`skills/${directory}`, "目录内缺少 SKILL.md。");
  }
  if (extension?.onboardingSkill !== undefined && (typeof extension.onboardingSkill !== "string"
    || !/^\.\/skills\/[^/]+\/SKILL\.md$/.test(extension.onboardingSkill)
    || !files.has(extension.onboardingSkill.slice(2)))) issue("extensions.com.openai.onboardingSkill", "必须引用包内 ./skills/<目录>/SKILL.md。");
  // Resolve ordinary Markdown file links against the actual archive, including
  // references/ and scripts/. External web links stay external.
  for (const { name } of entries.filter(({ name }) => /\.md$/i.test(name) && name.startsWith("skills/"))) {
    const content = decode(name);
    for (const match of content.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g)) {
      const raw = match[1] ?? match[2];
      if (raw.startsWith("#") || /^[a-z][a-z\d+.-]*:/i.test(raw)) continue;
      try {
        const target = decodeURIComponent(raw.split(/[?#]/)[0]);
        if (!target) continue;
        const resolved = posix.normalize(posix.join(posix.dirname(name), target));
        if (target.startsWith("/") || target.includes("\\") || resolved.startsWith("../") || (!files.has(resolved) && !entries.some((entry) => entry.name.startsWith(`${resolved.replace(/\/$/, "")}/`)))) issue(name, `Markdown 引用未包含在包内：${raw}`);
      } catch { issue(name, `Markdown 引用路径无效：${raw}`); }
    }
  }
  const review = extension?.review;
  const reviewPending = review?.test_cases?.positive?.length !== 5 || review?.test_cases?.negative?.length !== 3 || !review?.demo_recording_url;
  return { root, manifest, entries, issues, reviewPending };
}

export async function packageForChatgpt({ root = pluginRoot } = {}) {
  const plan = inspectChatgptPackage(root);
  if (plan.issues.length) throw Object.assign(new Error(`ChatGPT 打包检查未通过（${plan.issues.length} 项）：\n${plan.issues.map((message) => `- ${message}`).join("\n")}`), { issues: plan.issues });
  const output = join(plan.root, "dist");
  if (existsSync(output) && (lstatSync(output).isSymbolicLink() || !lstatSync(output).isDirectory())) throw new Error("dist 必须是插件目录内的普通目录，不能是符号链接。");
  mkdirSync(output, { recursive: true });
  const filename = `${plan.manifest.name}-chatgpt-${plan.manifest.version}.zip`;
  const target = join(output, filename);
  const temporary = join(output, `.chatgpt-${randomUUID()}.zip`);
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
    const zipData = readFileSync(temporary);
    if (zipData.length > limits.zipBytes) throw new Error("ZIP 超过官方 100 MB 限制。");
    // Replacing a symlink, rather than opening its destination, never follows it.
    renameSync(temporary, target);
    const sha256 = hash(zipData);
    const inventory = plan.entries.map(({ name, data }) => ({ path: name, bytes: data.length, sha256: hash(data) }));
    for (const [suffix, content] of [[".sha256", `${sha256}  ${filename}\n`], [".files.json", `${JSON.stringify(inventory, null, 2)}\n`]]) {
      const pending = join(output, `.chatgpt-${randomUUID()}.tmp`);
      try { writeFileSync(pending, content, { flag: "wx" }); renameSync(pending, `${target}${suffix}`); }
      finally { rmSync(pending, { force: true }); }
    }
    return { path: target, sha256, fileCount: plan.entries.length, reviewPending: plan.reviewPending };
  } finally { rmSync(temporary, { force: true }); }
}
