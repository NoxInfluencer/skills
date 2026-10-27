import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";
import test from "node:test";
import { inspectChatgptPackage, packageForChatgpt, pluginRoot } from "../scripts/chatgpt-package.mjs";

// Synthetic metadata and Skill stay in OS temporary directories; they never
// populate the repository's deliberately empty skills/mcp/ delivery folder.
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "nox-chatgpt-package-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const directory of [".codex-plugin", ".plugin", "assets", "skills/mcp/references", "skills/mcp/scripts"]) mkdirSync(join(root, directory), { recursive: true });
  const manifest = {
    name: "noxinfluencer", version: "0.1.0", description: "Synthetic packaging fixture.",
    author: { name: "NoxInfluencer" }, skills: "./skills/", mcpServers: "./.mcp.json",
    interface: {
      displayName: "NoxInfluencer", shortDescription: "Influencer marketing workflows",
      longDescription: "Synthetic description used only by the packaging tests.",
      developerName: "NoxInfluencer", category: "Business & Operations", capabilities: ["Read"],
      websiteURL: "https://www.noxinfluencer.com/",
      supportURL: "https://www.noxinfluencer.com/support",
      privacyPolicyURL: "https://www.noxinfluencer.com/privacy",
      termsOfServiceURL: "https://www.noxinfluencer.com/terms",
      logo: "./assets/icon.png", composerIcon: "./assets/icon.png", brandColor: "#FF5A36",
      defaultPrompt: ["Find creators for my campaign."],
    },
  };
  writeJson(root, ".codex-plugin/plugin.json", manifest);
  writeJson(root, ".mcp.json", { mcpServers: { noxinfluencer: { url: "https://production.noxinfluencer.com/mcp" } } });
  cpSync(join(pluginRoot, "assets/icon.png"), join(root, "assets/icon.png"));
  writeFileSync(join(root, "skills/mcp/SKILL.md"), "---\nname: mcp\ndescription: >-\n  Synthetic MCP workflow for packaging tests.\n---\n\nRead [guidance](references/guide.md).\n");
  writeFileSync(join(root, "skills/mcp/references/guide.md"), "Synthetic guidance.\n");
  writeFileSync(join(root, "skills/mcp/scripts/helper.mjs"), "// Synthetic packaged helper.\n");
  return root;
}

function writeJson(root, path, data) { writeFileSync(join(root, path), JSON.stringify(data, null, 2) + "\n"); }
function changeManifest(root, change) {
  const path = ".codex-plugin/plugin.json";
  const manifest = JSON.parse(readFileSync(join(root, path), "utf8"));
  change(manifest);
  writeJson(root, path, manifest);
}

// Read the ZIP central directory independently of the writer, and decompress
// members to check the actual archive rather than only the proposed file list.
function unzip(data) {
  const end = data.length - 22;
  assert.equal(data.readUInt32LE(end), 0x06054b50);
  let offset = data.readUInt32LE(end + 16);
  const count = data.readUInt16LE(end + 10);
  const files = new Map();
  for (let index = 0; index < count; index++) {
    assert.equal(data.readUInt32LE(offset), 0x02014b50);
    const method = data.readUInt16LE(offset + 10);
    const size = data.readUInt32LE(offset + 20);
    const nameLength = data.readUInt16LE(offset + 28);
    const name = data.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    const local = data.readUInt32LE(offset + 42);
    assert.equal(data.readUInt32LE(local), 0x04034b50);
    const start = local + 30 + data.readUInt16LE(local + 26) + data.readUInt16LE(local + 28);
    const bytes = data.subarray(start, start + size);
    files.set(name, method === 8 ? inflateRawSync(bytes) : bytes);
    offset += 46 + nameLength + data.readUInt16LE(offset + 30) + data.readUInt16LE(offset + 32);
  }
  return files;
}

test("ChatGPT ZIP contains only runtime components and preserves binary assets", async (t) => {
  const root = fixture(t);
  writeJson(root, ".plugin/plugin.json", { name: "unused-installer-metadata" });
  writeFileSync(join(root, "package.json"), "{}");
  writeFileSync(join(root, "README.md"), "Development documentation");
  writeFileSync(join(root, "skills/mcp/.gitkeep"), "");
  const original = readFileSync(join(root, ".codex-plugin/plugin.json"));
  const result = await packageForChatgpt({ root });
  assert.match(result.path, /noxinfluencer-chatgpt-0\.1\.0\.zip$/);
  const archive = readFileSync(result.path);
  const files = unzip(archive);
  assert.deepEqual([...files.keys()].sort(), [".codex-plugin/plugin.json", ".mcp.json", "assets/icon.png", "skills/mcp/SKILL.md", "skills/mcp/references/guide.md", "skills/mcp/scripts/helper.mjs"]);
  assert.deepEqual(files.get("assets/icon.png"), readFileSync(join(root, "assets/icon.png")));
  assert.deepEqual(files.get(".codex-plugin/plugin.json"), original);
  assert.deepEqual(readFileSync(join(root, ".codex-plugin/plugin.json")), original);
  const digest = createHash("sha256").update(archive).digest("hex");
  assert.equal(result.sha256, digest);
  assert.ok(readFileSync(result.path + ".sha256", "utf8").startsWith(digest));
  assert.equal(JSON.parse(readFileSync(result.path + ".files.json", "utf8")).length, files.size);
  assert.equal(result.reviewPending, true); // Review materials are not required to build a ZIP.
  const second = await packageForChatgpt({ root });
  assert.equal(second.sha256, digest);
  assert.equal(readdirSync(join(root, "dist")).length, 3);
});

test("missing metadata is reported together and produces no misleading ZIP", async (t) => {
  const root = fixture(t);
  changeManifest(root, (manifest) => {
    manifest.interface.shortDescription = "x".repeat(31);
    manifest.interface.category = "Marketing";
    delete manifest.interface.supportURL;
  });
  const result = inspectChatgptPackage(root);
  for (const field of ["shortDescription", "category", "supportURL"]) assert.ok(result.issues.some((issue) => issue.includes(field)));
  await assert.rejects(packageForChatgpt({ root }), /ChatGPT 打包检查未通过/);
  assert.equal(existsSync(join(root, "dist")), false);
});

test("failed validation preserves the previous ZIP and sidecars", async (t) => {
  const root = fixture(t);
  const result = await packageForChatgpt({ root });
  const before = readFileSync(result.path);
  changeManifest(root, (manifest) => { delete manifest.interface.privacyPolicyURL; });
  await assert.rejects(packageForChatgpt({ root }), /privacyPolicyURL/);
  assert.deepEqual(readFileSync(result.path), before);
  assert.equal(readdirSync(join(root, "dist")).length, 3);
});

test("production URL works without the old fixed test-address whitelist", (t) => {
  const root = fixture(t);
  assert.deepEqual(inspectChatgptPackage(root).issues, []);
});

test("known test and private MCP endpoints cannot enter a public release", (t) => {
  const root = fixture(t);
  for (const url of ["https://skilltest.noxinfluencer.com/mcp", "https://192.168.1.2/mcp", "https://localhost/mcp"]) {
    writeJson(root, ".mcp.json", { mcpServers: { noxinfluencer: { url } } });
    assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("公开生产地址")));
  }
});

test("empty and overly nested MCP Skill deliveries are rejected", (t) => {
  const root = fixture(t);
  const body = readFileSync(join(root, "skills/mcp/SKILL.md"));
  rmSync(join(root, "skills/mcp/SKILL.md"));
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("尚未完整交付")));
  mkdirSync(join(root, "skills/mcp/nested"));
  writeFileSync(join(root, "skills/mcp/nested/SKILL.md"), body);
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("不能再套分组目录")));
});

test("malformed YAML is rejected instead of treating text lines as valid YAML", (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "skills/mcp/SKILL.md"), "---\nname: [unclosed\ndescription: broken\n---\nBody\n");
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("YAML 无效")));
});

test("missing Skill references are caught against the actual package", (t) => {
  const root = fixture(t);
  rmSync(join(root, "skills/mcp/references/guide.md"));
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("Markdown 引用未包含")));
});

test("declared images must be safe paths and have matching file formats", (t) => {
  const root = fixture(t);
  changeManifest(root, (manifest) => { manifest.interface.logo = "./assets/../../outside.png"; });
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.startsWith("interface.logo:")));
  cpSync(join(root, "assets/icon.png"), join(root, "assets/icon.svg"));
  changeManifest(root, (manifest) => { manifest.interface.logo = "./assets/icon.svg"; });
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("格式不匹配")));
});

test("runtime directory junctions cannot pull files from outside the plugin", (t) => {
  const root = fixture(t);
  const outside = mkdtempSync(join(tmpdir(), "nox-external-asset-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  symlinkSync(outside, join(root, "assets/external"), process.platform === "win32" ? "junction" : "dir");
  assert.ok(inspectChatgptPackage(root).issues.some((issue) => issue.includes("符号链接或目录联接")));
});

test("credentials and lifecycle hooks are rejected in public-package metadata", (t) => {
  const root = fixture(t);
  changeManifest(root, (manifest) => {
    manifest.hooks = "./hooks/hooks.json";
    manifest.extensions = { "com.openai": { review: { test_credentials: "SYNTHETIC_TEST_VALUE" } } };
  });
  const issues = inspectChatgptPackage(root).issues;
  assert.ok(issues.some((issue) => issue.startsWith("hooks:")));
  assert.ok(issues.some((issue) => issue.includes("test_credentials")));
});

test("fixed authentication headers and Codex development versions are rejected", (t) => {
  const root = fixture(t);
  writeJson(root, ".mcp.json", { mcpServers: { noxinfluencer: { url: "https://production.noxinfluencer.com/mcp", headers: { Authorization: "SYNTHETIC_TEST_VALUE" } } } });
  changeManifest(root, (manifest) => { manifest.version = "0.1.0+codex.local-123"; });
  const issues = inspectChatgptPackage(root).issues;
  assert.ok(issues.some((issue) => issue.includes("固定认证请求头")));
  assert.ok(issues.some((issue) => issue.includes("cachebuster")));
});

test("output directory junction cannot redirect package writes", async (t) => {
  const root = fixture(t);
  const outside = mkdtempSync(join(tmpdir(), "nox-external-output-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  symlinkSync(outside, join(root, "dist"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(packageForChatgpt({ root }), /不能是符号链接/);
  assert.deepEqual(readdirSync(outside), []);
});
