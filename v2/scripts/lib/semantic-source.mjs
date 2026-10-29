import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { parseDocument, stringify } from "yaml";

import {
  assertDisjointDirectories,
  assertNoSymbolicLinkComponents,
  assertSafeRelativePath,
  comparePortablePaths,
  createFileRecord,
  listRegularFiles,
  readBoundedRegularFile,
  readCanonicalTextFile,
  readDirectoryFileMap,
  replaceTargetsAtomically,
  toPortablePath,
} from "./canonical-files.mjs";

const allowedRuntimes = new Set(["cli", "mcp"]);
const reservedOutputPaths = new Set(["skill.md", "skill-build-manifest.json"]);
const maxCanonicalSourceFiles = 256;
const maxCanonicalSourceBytes = 8 * 1024 * 1024;
const maxMainSkillBytes = 24 * 1024;
const maxReferenceBytes = 32 * 1024;
const maxRuntimeMarkdownBytes = 192 * 1024;
const duplicateParagraphMinCodePoints = 120;
const maxDuplicateMarkdownRatio = 0.05;
const requiredSharedReferences = Object.freeze([
  "brand-monitor.md",
  "collection-and-crm.md",
  "creator.md",
  "files-and-exports.md",
  "marketing-plan-and-campaign.md",
  "monitor.md",
  "outreach-and-messaging.md",
  "platform-support.md",
  "product-overview.md",
  "product-short-link-affiliation.md",
  "quota-pricing-dispute-feedback.md",
  "risk-confirmation.md",
]);
const forbiddenSharedRuntimePatterns = Object.freeze([
  /\b(?:CLI|MCP|OAuth|Device Flow|API[- ]?key|Codex Host|PKCE|Bearer Token)\b/iu,
  /`(?:noxinfluencer|codex|powershell)\b/iu,
  /`?--[a-z][a-z0-9-]*/iu,
  /\bschema\s+<cmd>/iu,
  /\b(?:list|open|create|update|delete|send|execute|confirm|preview|import|export|download|upload)_[a-z0-9_]+\b/u,
]);

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeMarkdownLine(line) {
  return line.replace(/[\t ]+/gu, " ").replace(/[\t ]+$/gu, "");
}

function normalizeMarkdownText(markdown) {
  return String(markdown)
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n?/gu, "\n")
    .normalize("NFC")
    .split("\n")
    .map(normalizeMarkdownLine)
    .join("\n")
    .replace(/\n*$/u, "\n");
}

/**
 * 按统一编码、空行和代码块规则把 Markdown 拆成可比较段落，供重复率门禁稳定复用。
 */
export function normalizeMarkdownParagraphs(markdown) {
  const lines = normalizeMarkdownText(markdown).split("\n");
  const paragraphs = [];
  let current = [];
  let fenceMarker = null;
  let index = 0;

  const flush = () => {
    const paragraph = current.join("\n").replace(/\n+$/u, "");
    if (paragraph) paragraphs.push(paragraph);
    current = [];
  };

  // frontmatter 作为独立段落，正文从 closing delimiter 后继续处理。
  if (lines[0] === "---") {
    const closing = lines.indexOf("---", 1);
    if (closing > 0) {
      paragraphs.push(lines.slice(0, closing + 1).join("\n"));
      index = closing + 1;
    }
  }

  for (; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^\s*(```|~~~)/u)?.[1] ?? null;
    if (fenceMarker) {
      current.push(line);
      if (fence === fenceMarker) {
        flush();
        fenceMarker = null;
      }
      continue;
    }
    if (fence) {
      flush();
      fenceMarker = fence;
      current.push(line);
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    current.push(line);
  }
  flush();
  return paragraphs;
}

/**
 * 计算同一运行时 Markdown 中长段落的精确重复字节占比，不做模糊匹配。
 */
export function measureMarkdownDuplicateRatio(
  files,
  {
    allowlist = new Set(),
    minCodePoints = duplicateParagraphMinCodePoints,
  } = {},
) {
  const counts = new Map();
  let totalBytes = 0;
  for (const [path, contents] of files) {
    if (path !== "SKILL.md" && !path.endsWith(".md")) continue;
    const text = Buffer.isBuffer(contents) ? contents.toString("utf8") : String(contents);
    totalBytes += Buffer.byteLength(normalizeMarkdownText(text), "utf8");
    for (const paragraph of normalizeMarkdownParagraphs(text)) {
      const bytes = Buffer.byteLength(paragraph, "utf8");
      if ([...paragraph].length < minCodePoints) continue;
      const digest = createFileRecord("paragraph", Buffer.from(paragraph, "utf8")).sha256;
      if (allowlist.has(digest)) continue;
      const record = counts.get(paragraph) ?? { bytes, count: 0 };
      record.count += 1;
      counts.set(paragraph, record);
    }
  }
  const duplicateBytes = [...counts.values()].reduce(
    (total, record) => total + Math.max(0, record.count - 1) * record.bytes,
    0,
  );
  return {
    duplicateBytes,
    totalBytes,
    ratio: totalBytes === 0 ? 0 : duplicateBytes / totalBytes,
  };
}

function readRegisteredMcpToolNames(sourceDirectory) {
  const snapshotPath = join(sourceDirectory, "snapshots", "mcp-tools.json");
  if (!existsSync(snapshotPath)) return [];
  const snapshot = JSON.parse(readCanonicalTextFile(snapshotPath, "MCP Tool snapshot").toString("utf8"));
  return Array.isArray(snapshot.items)
    ? snapshot.items.map((item) => item?.name).filter((name) => typeof name === "string")
    : [];
}

/**
 * 校验共享层只承载可达的业务语义，不泄漏任一运行时的命令、认证或 Tool 合同。
 */
export function validateSharedSemanticSource(sourceDirectory) {
  const source = resolve(sourceDirectory);
  const sharedRoot = join(source, "shared");
  const corePath = join(sharedRoot, "core.md");
  const referencesRoot = join(sharedRoot, "references");
  assertNoSymbolicLinkComponents(source, sharedRoot);
  const sharedFiles = new Map([
    ["core.md", readCanonicalTextFile(corePath, "Shared core")],
  ]);
  for (const path of listRegularFiles(referencesRoot)) {
    const relativePath = toPortablePath(path, referencesRoot);
    if (!relativePath.endsWith(".md")) fail(`Shared reference must be Markdown: ${relativePath}`);
    sharedFiles.set(relativePath, readCanonicalTextFile(path, `Shared reference ${relativePath}`));
  }

  // 先固定 12 个共享域文件，再从 core 沿显式 reference 链接验证可达性。
  for (const requiredPath of requiredSharedReferences) {
    if (!sharedFiles.has(requiredPath)) fail(`Required shared reference is missing: ${requiredPath}`);
  }
  const reachable = new Set(["core.md"]);
  const pending = ["core.md"];
  while (pending.length > 0) {
    const currentPath = pending.shift();
    const text = sharedFiles.get(currentPath).toString("utf8");
    for (const match of text.matchAll(/\{baseDir\}\/references\/([a-z0-9-]+\.md)/gu)) {
      const referencedPath = match[1];
      if (!sharedFiles.has(referencedPath)) {
        fail(`Shared reference link does not exist: ${referencedPath}`);
      }
      if (!reachable.has(referencedPath)) {
        reachable.add(referencedPath);
        pending.push(referencedPath);
      }
    }
  }
  for (const requiredPath of requiredSharedReferences) {
    if (!reachable.has(requiredPath)) fail(`Required shared reference is not reachable: ${requiredPath}`);
  }

  // 运行时专属术语和当前已登记 Tool 名均不得进入共享业务语义。
  const registeredTools = readRegisteredMcpToolNames(source);
  for (const [path, contents] of sharedFiles) {
    const text = contents.toString("utf8");
    if (forbiddenSharedRuntimePatterns.some((pattern) => pattern.test(text))) {
      fail(`Shared semantic file contains forbidden runtime guidance: ${path}`);
    }
    if (registeredTools.some((tool) => text.includes(`\`${tool}\``))) {
      fail(`Shared semantic file contains a registered MCP Tool name: ${path}`);
    }
  }
  const duplication = measureMarkdownDuplicateRatio(sharedFiles);
  if (duplication.ratio > maxDuplicateMarkdownRatio) {
    fail(`Shared Markdown duplicate ratio exceeds 5%: ${duplication.ratio.toFixed(4)}`);
  }
  return { files: sharedFiles, reachable, duplication };
}

export function validateAssembledMarkdown(files) {
  let totalBytes = 0;
  for (const [path, contents] of files) {
    if (path !== "SKILL.md" && !path.endsWith(".md")) continue;
    totalBytes += contents.byteLength;
    if (path === "SKILL.md" && contents.byteLength > maxMainSkillBytes) {
      fail(`Generated SKILL.md exceeds ${maxMainSkillBytes} bytes.`);
    }
    if (path.startsWith("references/") && contents.byteLength > maxReferenceBytes) {
      fail(`Generated reference exceeds ${maxReferenceBytes} bytes: ${path}`);
    }
  }
  if (totalBytes > maxRuntimeMarkdownBytes) {
    fail(`Generated runtime Markdown exceeds ${maxRuntimeMarkdownBytes} bytes.`);
  }
  const duplication = measureMarkdownDuplicateRatio(files);
  if (duplication.ratio > maxDuplicateMarkdownRatio) {
    fail(`Generated Markdown duplicate ratio exceeds 5%: ${duplication.ratio.toFixed(4)}`);
  }
}
