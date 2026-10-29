import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  opendirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, parse, posix, relative, resolve, sep } from "node:path";

const maxSourceFileBytes = 4 * 1024 * 1024;
const maxCanonicalFileCount = 256;
const maxCanonicalAggregateBytes = 8 * 1024 * 1024;
const maxCanonicalDirectoryEntries = 512;
const maxCanonicalDirectoryDepth = 16;

function fail(message) {
  throw new Error(message);
}

export function comparePortablePaths(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

export function toPortablePath(path, root) {
  return relative(root, path).split(sep).join(posix.sep);
}

export function assertSafeRelativePath(relativePath, label = "File path") {
  if (
    typeof relativePath !== "string" ||
    !relativePath ||
    relativePath.includes("\0") ||
    relativePath.includes("\\") ||
    isAbsolute(relativePath)
  ) {
    fail(`${label} must be a portable relative path.`);
  }
  const segments = relativePath.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    fail(`${label} contains an unsafe path segment.`);
  }
}

/**
 * 读取有界普通文件的原始字节，生成产物校验使用该入口以识别任意字节漂移。
 */
export function readBoundedRegularFile(path, label = "File") {
  let stat;
  try {
    stat = lstatSync(path);
  } catch {
    fail(`${label} does not exist.`);
  }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxSourceFileBytes) {
    fail(`${label} must be a bounded regular file without symbolic links.`);
  }
  return readFileSync(path);
}

/**
 * 读取显式 source 文件并归一化为 UTF-8、NFC、LF、无 BOM 的稳定字节。
 */
export function readCanonicalTextFile(path, label = "Source file") {
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(
      readBoundedRegularFile(path, label),
    );
  } catch {
    fail(`${label} must be valid UTF-8.`);
  }
  const normalized = text
    .replace(/^\uFEFF/u, "")
    .replace(/\r\n?/gu, "\n")
    .normalize("NFC")
    .split("\n")
    .map((line) => line.replace(/[\t ]+$/gu, ""))
    .join("\n")
    .replace(/\n*$/u, "\n");
  return Buffer.from(normalized, "utf8");
}

/**
 * 递归列出有界目录中的普通文件；遍历阶段即限制 entry、文件数和字节数，避免先收集后校验。
 */
export function listRegularFiles(
  directory,
  {
    optional = false,
    maxFiles = maxCanonicalFileCount,
    maxAggregateBytes = maxCanonicalAggregateBytes,
    maxFileBytes = maxSourceFileBytes,
    maxEntries = maxCanonicalDirectoryEntries,
  } = {},
) {
  if (!existsSync(directory)) {
    if (optional) return [];
    fail(`Source directory does not exist: ${directory}`);
  }
  const root = resolve(directory);
  const files = [];
  const budget = { aggregateBytes: 0, entries: 0, files: 0 };

  /**
   * 按目录流式读取并在排序前限制 entry 数，防止异常生成树制造无界数组。
   */
  const readBoundedEntries = (path) => {
    const entries = [];
    const directoryHandle = opendirSync(path);
    try {
      for (let entry = directoryHandle.readSync(); entry; entry = directoryHandle.readSync()) {
        budget.entries += 1;
        if (budget.entries > maxEntries) {
          fail(`Canonical directory entry count exceeds ${maxEntries}.`);
        }
        entries.push(entry);
      }
    } finally {
      directoryHandle.closeSync();
    }
    return entries.sort((left, right) => comparePortablePaths(left.name, right.name));
  };

  const visit = (path, depth = 0) => {
    const stat = lstatSync(path);
    const relativePath = toPortablePath(path, root) || ".";
    if (stat.isSymbolicLink()) {
      fail(`Symbolic links are not allowed in canonical source: ${relativePath}`);
    }
    if (stat.isFile()) {
      budget.files += 1;
      budget.aggregateBytes += stat.size;
      if (budget.files > maxFiles) {
        fail(`Canonical source file count exceeds ${maxFiles}.`);
      }
      if (stat.size > maxFileBytes) {
        fail(`Canonical source file exceeds the ${maxFileBytes}-byte limit: ${relativePath}`);
      }
      if (budget.aggregateBytes > maxAggregateBytes) {
        fail(`Canonical source aggregate bytes exceed ${maxAggregateBytes}.`);
      }
      files.push(path);
      return;
    }
    if (!stat.isDirectory()) {
      fail(`Unsupported canonical source entry: ${relativePath}`);
    }
    if (depth > maxCanonicalDirectoryDepth) {
      fail(`Canonical source directory depth exceeds ${maxCanonicalDirectoryDepth}.`);
    }
    for (const entry of readBoundedEntries(path)) {
      visit(join(path, entry.name), depth + 1);
    }
  };
  visit(root);
  return files.sort((left, right) =>
    comparePortablePaths(toPortablePath(left, root), toPortablePath(right, root)));
}

export function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

export function createFileRecord(path, contents) {
  return { path, bytes: contents.byteLength, sha256: sha256(contents) };
}

function resolvePhysicalPath(path) {
  let existing = resolve(path);
  const missingSegments = [];
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) fail("Unable to resolve a physical path ancestor.");
    missingSegments.unshift(basename(existing));
    existing = parent;
  }
  return resolve(realpathSync.native(existing), ...missingSegments);
}

export function assertDisjointDirectories(sourceDirectory, targetDirectory) {
  const source = resolvePhysicalPath(sourceDirectory);
  const target = resolvePhysicalPath(targetDirectory);
  const targetFromSource = relative(source, target);
  const sourceFromTarget = relative(target, source);
  const isInside = (candidate) => candidate === "" || (!candidate.startsWith("..") && !isAbsolute(candidate));
  if (isInside(targetFromSource) || isInside(sourceFromTarget)) {
    fail("Canonical source and generated target must be disjoint directories.");
  }
  if (target === parse(target).root) fail("Generated target cannot be a filesystem root.");
}

/**
 * 校验 canonical root 到目标路径的每一级目录，拒绝父目录 junction/symlink 越界读取。
 */
export function assertNoSymbolicLinkComponents(
  rootDirectory,
  targetPath,
  { includeRoot = true, label = "Canonical source path" } = {},
) {
  const root = resolve(rootDirectory);
  const target = resolve(targetPath);
  const relativePath = relative(root, target);
  if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
    fail("Canonical source path escapes its root directory.");
  }
  const segments = relativePath ? relativePath.split(sep) : [];
  let current = root;
  for (const segment of includeRoot ? ["", ...segments] : segments) {
    if (segment) current = join(current, segment);
    if (!existsSync(current)) return;
    if (lstatSync(current).isSymbolicLink()) {
      fail(`${label} must not contain symbolic links or junctions.`);
    }
  }
}

function assertIndependentTargets(targets, trustedRoot) {
  if (!Array.isArray(targets) || targets.length === 0 || targets.length > 8) {
    fail("Atomic replacement requires between one and eight targets.");
  }
  if (typeof trustedRoot !== "string" || !existsSync(trustedRoot)) {
    fail("Atomic replacement requires an existing trusted root.");
  }
  const lexicalTrustedRoot = resolve(trustedRoot);
  const physicalTrustedRoot = realpathSync.native(lexicalTrustedRoot);
  const resolved = targets.map((target) => {
    const lexicalTarget = resolve(target.targetPath);
    const lexicalFromTrustedRoot = relative(lexicalTrustedRoot, lexicalTarget);
    if (
      !lexicalFromTrustedRoot ||
      lexicalFromTrustedRoot.startsWith("..") ||
      isAbsolute(lexicalFromTrustedRoot)
    ) {
      fail("Atomic target path must be a strict descendant of the trusted root.");
    }
    // 可信根先解析一次，允许其上方的系统路径别名；根以下仍逐级拒绝链接和 junction。
    assertNoSymbolicLinkComponents(lexicalTrustedRoot, lexicalTarget, {
      includeRoot: false,
      label: "Atomic target path",
    });
    const physicalTarget = resolvePhysicalPath(lexicalTarget);
    const physicalFromTrustedRoot = relative(physicalTrustedRoot, physicalTarget);
    if (
      !physicalFromTrustedRoot ||
      physicalFromTrustedRoot.startsWith("..") ||
      isAbsolute(physicalFromTrustedRoot)
    ) {
      fail("Atomic target path escapes the physical trusted root.");
    }
    return physicalTarget;
  });
  for (const [index, target] of resolved.entries()) {
    if (target === parse(target).root) fail("Refusing to replace a filesystem root.");
    for (let otherIndex = 0; otherIndex < index; otherIndex += 1) {
      const other = resolved[otherIndex];
      const targetFromOther = relative(other, target);
      const otherFromTarget = relative(target, other);
      const nested = (value) => value === "" || (!value.startsWith("..") && !isAbsolute(value));
      if (nested(targetFromOther) || nested(otherFromTarget)) {
        fail("Atomic replacement targets must be distinct and non-nested.");
      }
    }
  }
}

function stageReplacement(state) {
  mkdirSync(state.parent, { recursive: true });
  if (state.kind === "file") {
    if (!Buffer.isBuffer(state.contents)) fail("Atomic file replacement requires Buffer contents.");
    writeFileSync(state.incoming, state.contents);
    return;
  }
  if (state.kind !== "directory" || !(state.files instanceof Map)) {
    fail("Atomic directory replacement requires a file Map.");
  }
  mkdirSync(state.incoming, { recursive: true });
  for (const [relativePath, contents] of [...state.files.entries()]
    .sort(([left], [right]) => comparePortablePaths(left, right))) {
    assertSafeRelativePath(relativePath, "Generated output path");
    const destination = join(state.incoming, ...relativePath.split("/"));
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
  }
}

/**
 * 将目录和单文件作为一个批次提交；任一目标失败时逆序恢复全部旧目标。
 */
export function replaceTargetsAtomically(
  targets,
  { rename = renameSync, remove = rmSync, trustedRoot } = {},
) {
  assertIndependentTargets(targets, trustedRoot);
  const operationId = `${process.pid}-${Date.now()}`;
  const states = targets.map((entry, index) => {
    const target = resolve(entry.targetPath);
    const parent = dirname(target);
    const name = basename(target);
    return {
      ...entry,
      target,
      parent,
      incoming: join(parent, `.${name}.incoming-${operationId}-${index}`),
      backup: join(parent, `.${name}.backup-${operationId}-${index}`),
      backedUp: false,
      committed: false,
    };
  });

  try {
    // 全部 staging 成功后才移动任何旧目标。
    for (const state of states) stageReplacement(state);
    for (const state of states) {
      if (existsSync(state.target)) {
        rename(state.target, state.backup);
        state.backedUp = true;
      }
    }
    for (const state of states) {
      rename(state.incoming, state.target);
      state.committed = true;
    }
  } catch (error) {
    const rollbackErrors = [];

    // 先移除本批次已提交的新目标，再恢复全部旧目标。
    for (const state of [...states].reverse()) {
      if (!state.committed || !existsSync(state.target)) continue;
      try {
        remove(state.target, { force: true, recursive: true });
        state.committed = false;
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    for (const state of [...states].reverse()) {
      if (!state.backedUp || existsSync(state.target)) continue;
      try {
        rename(state.backup, state.target);
        state.backedUp = false;
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        "Atomic replacement transaction and rollback failed; old-target backups were preserved.",
      );
    }
    throw error;
  } finally {
    // incoming 只包含本批次新数据，可安全清理；backup 永不在 finally 中删除。
    for (const state of states) {
      if (existsSync(state.incoming)) remove(state.incoming, { force: true, recursive: true });
    }
  }

  const cleanupErrors = [];
  for (const state of states) {
    if (!state.backedUp || !existsSync(state.backup)) continue;
    try {
      remove(state.backup, { force: true, recursive: true });
      state.backedUp = false;
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      cleanupErrors,
      "Atomic replacement committed, but old-target backup cleanup failed; backups were preserved.",
    );
  }
}

export function replaceDirectoryAtomically(targetDirectory, files, operations = {}) {
  replaceTargetsAtomically(
    [{ targetPath: targetDirectory, kind: "directory", files }],
    operations,
  );
}

export function readDirectoryFileMap(directory) {
  const root = resolve(directory);
  const files = new Map();
  let aggregateBytes = 0;
  for (const path of listRegularFiles(root)) {
    const relativePath = toPortablePath(path, root);
    assertSafeRelativePath(relativePath, "Generated output path");
    const contents = readBoundedRegularFile(path, `Generated output ${relativePath}`);
    aggregateBytes += contents.byteLength;
    if (aggregateBytes > maxCanonicalAggregateBytes) {
      fail(`Generated output aggregate bytes exceed ${maxCanonicalAggregateBytes}.`);
    }
    files.set(relativePath, contents);
  }
  return files;
}
