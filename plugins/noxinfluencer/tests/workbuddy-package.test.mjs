import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { parseDocument } from "yaml";
import { inspectWorkbuddyPackage, packageForWorkbuddy, pluginRoot } from "../scripts/workbuddy-package.mjs";

function fixture(t, { delivered = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "nox-workbuddy-package-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const dir of [".plugin", "workbuddy", "assets", "skills/mcp"]) mkdirSync(join(root, dir), { recursive: true });
  for (const path of [".plugin/plugin.json", "workbuddy/connector-meta.json", "workbuddy/skill-metadata.json", "assets/icon.png"]) cpSync(join(pluginRoot, path), join(root, path));
  writeJson(root, ".mcp.json", { mcpServers: { noxinfluencer: { type: "http", url: "https://production.noxinfluencer.com/mcp", oauth_resource: "https://production.noxinfluencer.com/mcp" } } });
  writeFileSync(join(root, "skills/mcp/.gitkeep"), "");
  if (delivered) {
    mkdirSync(join(root, "skills/mcp/references"));
    mkdirSync(join(root, "skills/mcp/scripts"));
    writeFileSync(join(root, "skills/mcp/SKILL.md"), "---\r\nname: noxinfluencer\r\ndescription: >-\r\n  Synthetic test workflow.\r\nuser-invocable: false\r\n---\r\n\r\nUse [guide](references/guide.md).\r\n");
    writeFileSync(join(root, "skills/mcp/references/guide.md"), "Synthetic guidance\n");
    writeFileSync(join(root, "skills/mcp/scripts/helper.mjs"), "// Synthetic helper\n");
  }
  return root;
}
function writeJson(root, path, data) { writeFileSync(join(root, path), JSON.stringify(data, null, 2) + "\n"); }
function edit(root, path, change) {
  const data = JSON.parse(readFileSync(join(root, path), "utf8"));
  change(data);
  writeJson(root, path, data);
}
// Independent ZIP reader checks the archive's actual names and decompressed bytes.
function unzip(data) {
  const end = data.length - 22;
  assert.equal(data.readUInt32LE(end), 0x06054b50);
  let offset = data.readUInt32LE(end + 16);
  const files = new Map();
  for (let index = 0; index < data.readUInt16LE(end + 10); index++) {
    assert.equal(data.readUInt32LE(offset), 0x02014b50);
    const method = data.readUInt16LE(offset + 10), size = data.readUInt32LE(offset + 20);
    const nameLength = data.readUInt16LE(offset + 28), local = data.readUInt32LE(offset + 42);
    const name = data.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    assert.equal(data.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + data.readUInt16LE(local + 26) + data.readUInt16LE(local + 28);
    const bytes = data.subarray(start, start + size);
    files.set(name, method === 8 ? inflateRawSync(bytes) : bytes);
    offset += 46 + nameLength + data.readUInt16LE(offset + 30) + data.readUInt16LE(offset + 32);
  }
  return files;
}
function frontmatter(data) {
  const match = data.toString("utf8").match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match);
  return parseDocument(match[1]).toJS();
}

test("WorkBuddy release ZIP transforms host configuration, preserves Skill source and includes dependencies", async (t) => {
  const root = fixture(t);
  const original = readFileSync(join(root, "skills/mcp/SKILL.md"));
  writeFileSync(join(root, "README.md"), "Must not enter runtime ZIP");
  const result = await packageForWorkbuddy({ root });
  assert.match(result.path, /noxinfluencer-workbuddy-0\.1\.0\.zip$/);
  const archive = readFileSync(result.path), files = unzip(archive);
  assert.deepEqual([...files.keys()], ["connector-meta.json", "icon.png", "mcp.json", "skills/mcp/SKILL.md", "skills/mcp/references/guide.md", "skills/mcp/scripts/helper.mjs"]);
  assert.deepEqual(JSON.parse(files.get("mcp.json")), { mcpServers: { noxinfluencer: { type: "streamableHttp", url: "https://production.noxinfluencer.com/mcp", timeout: 30000 } } });
  const meta = JSON.parse(files.get("connector-meta.json"));
  assert.equal(meta.version, "0.1.0");
  assert.equal(meta.auth_mode, undefined);
  assert.equal(meta.minWorkbuddyVersion, "4.24.0");
  const fields = frontmatter(files.get("skills/mcp/SKILL.md"));
  assert.equal(fields.name, "noxinfluencer");
  assert.equal(fields.version, "0.1.0");
  assert.equal(fields.author, "NoxInfluencer");
  assert.equal(fields["user-invocable"], false);
  assert.ok(fields.description_zh && fields.description_en);
  const body = original.toString().match(/^---\r\n[\s\S]*?\r\n---\r\n/)[0].length;
  assert.ok(files.get("skills/mcp/SKILL.md").toString().endsWith(original.toString().slice(body)));
  assert.deepEqual(readFileSync(join(root, "skills/mcp/SKILL.md")), original);
  assert.deepEqual(files.get("icon.png"), readFileSync(join(root, "assets/icon.png")));
  assert.equal(result.sha256, createHash("sha256").update(archive).digest("hex"));
  assert.equal((await packageForWorkbuddy({ root })).sha256, result.sha256);
  const inventory = JSON.parse(readFileSync(result.path + ".files.json"));
  for (const entry of inventory) assert.equal(entry.sha256, createHash("sha256").update(files.get(entry.path)).digest("hex"));
  assert.equal(readdirSync(join(root, "dist")).length, 3);
});

test("development ZIP explicitly permits pending delivery and test endpoint, formal ZIP rejects both", async (t) => {
  const root = fixture(t, { delivered: false });
  writeJson(root, ".mcp.json", { mcpServers: { noxinfluencer: { type: "http", url: "https://skilltest.noxinfluencer.com/mcp" } } });
  const release = inspectWorkbuddyPackage({ root });
  assert.equal(release.issues.length, 2);
  await assert.rejects(packageForWorkbuddy({ root }), /正式提交需要公网生产/);
  assert.equal(existsSync(join(root, "dist")), false);
  const result = await packageForWorkbuddy({ root, development: true });
  assert.match(result.path, /-dev\.zip$/);
  assert.equal(result.warnings.length, 3);
  assert.deepEqual([...unzip(readFileSync(result.path)).keys()], ["connector-meta.json", "icon.png", "mcp.json"]);
});

test("partial, malformed and nested Skill deliveries fail even for development", (t) => {
  const root = fixture(t, { delivered: false });
  writeFileSync(join(root, "skills/mcp/guide.md"), "Partial delivery");
  assert.ok(inspectWorkbuddyPackage({ root, development: true }).issues.some((issue) => issue.includes("缺少直接放置")));
  writeFileSync(join(root, "skills/mcp/SKILL.md"), "---\nname: [broken\n---\nBody\n");
  assert.ok(inspectWorkbuddyPackage({ root, development: true }).issues.some((issue) => issue.includes("Skill 无效")));
  mkdirSync(join(root, "skills/mcp/nested"));
  writeFileSync(join(root, "skills/mcp/nested/SKILL.md"), "---\nname: test\n---\nBody\n");
  assert.ok(inspectWorkbuddyPackage({ root, development: true }).issues.some((issue) => issue.includes("必须直接放在")));
});

test("additional Skills need explicit bilingual metadata, existing delivered metadata is retained", (t) => {
  const root = fixture(t);
  mkdirSync(join(root, "skills/extra"));
  writeFileSync(join(root, "skills/extra/SKILL.md"), "---\nname: extra\ndescription: Another workflow\n---\nInstructions\n");
  assert.ok(inspectWorkbuddyPackage({ root }).issues.some((issue) => issue.includes("description_zh")));
  writeFileSync(join(root, "skills/extra/SKILL.md"), "---\nname: extra\ndescription: Another workflow\ndescription_zh: 独立说明\ndescription_en: Extra workflow\nversion: 2.0.0\nauthor: Delivered author\n---\nInstructions\n");
  const plan = inspectWorkbuddyPackage({ root });
  assert.deepEqual(plan.issues, []);
  const fields = frontmatter(plan.entries.find((entry) => entry.name === "skills/extra/SKILL.md").data);
  assert.equal(fields.version, "2.0.0");
  assert.equal(fields.author, "Delivered author");
});

test("release failure preserves earlier ZIP and reports metadata errors together", async (t) => {
  const root = fixture(t), result = await packageForWorkbuddy({ root });
  const before = readFileSync(result.path);
  edit(root, "workbuddy/connector-meta.json", (meta) => { delete meta.name_en; meta.minWorkbuddyVersion = "4.22.0"; meta.examples_en = []; });
  const plan = inspectWorkbuddyPackage({ root });
  for (const field of ["name_en", "minWorkbuddyVersion", "examples_en"]) assert.ok(plan.issues.some((issue) => issue.includes(field)));
  await assert.rejects(packageForWorkbuddy({ root }), /打包检查未通过/);
  assert.deepEqual(readFileSync(result.path), before);
});

test("MCP credentials, unsupported auth modes, mismatched resources and malformed servers fail", (t) => {
  const root = fixture(t);
  for (const change of [
    (mcp) => { mcp.mcpServers.noxinfluencer.headers = { Authorization: "Bearer synthetic-test" }; },
    (mcp) => { mcp.mcpServers.noxinfluencer.oauth_resource = "https://other.noxinfluencer.com/mcp"; },
    (mcp) => { mcp.mcpServers.extra = {}; },
    (mcp) => { mcp.mcpServers.noxinfluencer.type = "stdio"; },
    (mcp) => { mcp.mcpServers.noxinfluencer.url = "https://host.noxinfluencer.com/mcp?token=synthetic"; },
  ]) {
    const base = { mcpServers: { noxinfluencer: { type: "http", url: "https://production.noxinfluencer.com/mcp" } } };
    change(base); writeJson(root, ".mcp.json", base);
    assert.ok(inspectWorkbuddyPackage({ root, development: true }).issues.length > 0);
  }
  edit(root, "workbuddy/connector-meta.json", (meta) => { meta.auth_mode = "token"; });
  assert.ok(inspectWorkbuddyPackage({ root }).issues.some((issue) => issue.includes("auth_mode")));
});

test("broken references, unsafe filenames and loose Skill files fail", (t) => {
  const root = fixture(t);
  rmSync(join(root, "skills/mcp/references/guide.md"));
  writeFileSync(join(root, "skills/mcp/.env"), "SYNTHETIC=example");
  const plan = inspectWorkbuddyPackage({ root });
  assert.ok(plan.issues.some((issue) => issue.includes("Markdown 引用未包含")));
  assert.ok(plan.issues.some((issue) => issue.includes("凭据文件")));
  // A generated icon.png and an unsafe top-level Skill layout cannot collide silently.
  writeFileSync(join(root, "skills/README.md"), "Invalid layout");
  assert.ok(inspectWorkbuddyPackage({ root }).issues.some((issue) => issue.includes("缺少直接放置")));
});

test("platform overlays are validated even before MCP Skill delivery", (t) => {
  const root = fixture(t, { delivered: false });
  edit(root, "workbuddy/skill-metadata.json", (data) => { data.mcp.description_en = ""; data.mcp.command = "unexpected"; });
  const plan = inspectWorkbuddyPackage({ root, development: true });
  assert.ok(plan.issues.some((issue) => issue.includes("description_en")));
  assert.ok(plan.issues.some((issue) => issue.includes("command")));
});

test("junctions and symlink output directories are rejected without touching external files", async (t) => {
  const root = fixture(t), outside = mkdtempSync(join(tmpdir(), "nox-workbuddy-outside-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(join(outside, "keep.txt"), "Keep intact");
  const type = process.platform === "win32" ? "junction" : "dir";
  symlinkSync(outside, join(root, "skills/mcp/external"), type);
  assert.ok(inspectWorkbuddyPackage({ root }).issues.some((issue) => issue.includes("目录联接")));
  rmSync(join(root, "skills/mcp/external"), { recursive: true });
  symlinkSync(outside, join(root, "dist"), type);
  await assert.rejects(packageForWorkbuddy({ root }), /dist 必须是普通目录/);
  assert.deepEqual(readdirSync(outside), ["keep.txt"]);
  assert.equal(readFileSync(join(outside, "keep.txt"), "utf8"), "Keep intact");
});

test("actual CLI resolves its own source outside cwd and rejects unknown arguments", (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "nox-workbuddy-cli-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const script = join(pluginRoot, "scripts/package-workbuddy.mjs");
  const check = spawnSync(process.execPath, [script, "--check", "--dev"], { cwd, encoding: "utf8" });
  assert.equal(check.status, 0, check.stdout + check.stderr);
  const invalid = spawnSync(process.execPath, [script, "--force"], { cwd, encoding: "utf8" });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /只支持/);
});
