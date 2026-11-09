import { createHash } from "node:crypto";
import {
  lstatSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import { parseDocument } from "yaml";

const maxMetadataBytes = 1024 * 1024;
const maxSnapshotBytes = 4 * 1024 * 1024;
const maxSnapshotAggregateBytes = 8 * 1024 * 1024;
const libraryDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(libraryDirectory, "..", "..");
const defaultSourceRoot = resolve(projectRoot, "source", "noxinfluencer");

function fail(message) {
  throw new Error(message);
}

/**
 * 在约定根目录内解析合同路径，拒绝绝对路径、目录逃逸和符号链接。
 */
function resolveContainedPath(root, relativePath, label) {
  if (typeof relativePath !== "string" || !relativePath || isAbsolute(relativePath)) {
    fail(`${label} must be a relative path.`);
  }
  const normalizedRoot = resolve(root);
  const target = resolve(normalizedRoot, ...relativePath.split("/"));
  const relation = relative(normalizedRoot, target);
  if (!relation || relation.startsWith("..") || isAbsolute(relation)) {
    fail(`${label} escapes the contract root.`);
  }
  let physicalRoot;
  let physicalTarget;
  let stat;
  try {
    physicalRoot = realpathSync(normalizedRoot);
    stat = lstatSync(target);
    physicalTarget = realpathSync(target);
  } catch {
    fail(`${label} cannot be resolved.`);
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    fail(`${label} must reference a regular file.`);
  }
  const physicalRelation = relative(physicalRoot, physicalTarget);
  if (
    !physicalRelation ||
    physicalRelation.startsWith("..") ||
    isAbsolute(physicalRelation)
  ) {
    fail(`${label} escapes the contract root.`);
  }
  return { target: physicalTarget, size: stat.size };
}

/**
 * 读取有界 UTF-8 合同文件，并保留原始字节供摘要验证。
 */
function readBoundedUtf8(path, label, maxBytes) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > maxBytes) {
    fail(`${label} is not a bounded regular file.`);
  }
  const bytes = readFileSync(path);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`${label} is not valid UTF-8.`);
  }
  return { bytes, text: text.replace(/^\uFEFF/u, "") };
}

/**
 * 解析 YAML 对象，并把重复键和语法错误收敛为不含正文的稳定错误。
 */
function readYaml(path, label) {
  const { text } = readBoundedUtf8(path, label, maxMetadataBytes);
  const document = parseDocument(text, { prettyErrors: false, uniqueKeys: true });
  if (document.errors.length) {
    fail(`${label} is not valid YAML: ${document.errors[0].message}`);
  }
  const value = document.toJS({ maxAliasCount: 0 });
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must contain an object.`);
  }
  return value;
}

/**
 * 读取 JSON 对象，不在错误中回显合同正文。
 */
function readJson(path, label, maxBytes = maxMetadataBytes) {
  const { bytes, text } = readBoundedUtf8(path, label, maxBytes);
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      fail(`${label} must contain an object.`);
    }
    return { bytes, value };
  } catch (error) {
    if (error.message === `${label} must contain an object.`) throw error;
    fail(`${label} is not valid JSON.`);
  }
}

function formatSchemaErrors(errors = []) {
  return errors
    .map((error) => `${error.instancePath || "/"} ${error.message}`)
    .join("; ");
}

/**
 * 编译固定 JSON Schema，并返回带稳定标签的校验函数。
 */
function compileSchema(ajv, schemaRoot, filename, label) {
  const path = join(schemaRoot, filename);
  const { value } = readJson(path, `${label} schema`);
  const validate = ajv.compile(value);
  return (payload) => {
    if (!validate(payload)) {
      fail(`${label} failed schema validation: ${formatSchemaErrors(validate.errors)}`);
    }
  };
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * 校验 registry 的 domain/capability 运行时成对覆盖、N/A 理由和 primitive 内部引用。
 */
function validateRegistrySemantics(registry) {
  const recordsByWorkflow = new Map();
  const runtimeKeys = new Set();

  // 先拒绝重复 runtime，并按 workflow 聚合。
  for (const record of registry.workflows) {
    const workflowKey = `${record.id}:${record.capability}`;
    const runtimeKey = `${workflowKey}:${record.runtime}`;
    if (runtimeKeys.has(runtimeKey)) {
      fail(`Duplicate workflow runtime record: ${workflowKey} ${record.runtime}.`);
    }
    runtimeKeys.add(runtimeKey);
    const records = recordsByWorkflow.get(workflowKey) ?? [];
    records.push(record);
    recordsByWorkflow.set(workflowKey, records);

    if (
      ["deferred", "unavailable"].includes(record.status) &&
      !record.not_applicable_reason
    ) {
      fail(`${record.id} ${record.runtime} requires not_applicable_reason.`);
    }
    if (record.status === "supported" && record.primitives.length === 0) {
      fail(`${record.id} ${record.runtime} requires at least one primitive.`);
    }

    const primitiveIds = new Set(record.primitives.map((primitive) => primitive.id));
    if (primitiveIds.size !== record.primitives.length) {
      fail(`${record.id} ${record.runtime} contains duplicate primitive IDs.`);
    }
    for (const primitive of record.primitives) {
      for (const predecessor of primitive.after ?? []) {
        if (!primitiveIds.has(predecessor)) {
          fail(`${record.id} ${record.runtime} references missing primitive ${predecessor}.`);
        }
      }
      for (const binding of primitive.bindings ?? []) {
        if (!primitiveIds.has(binding.from)) {
          fail(`${record.id} ${record.runtime} binding references missing primitive ${binding.from}.`);
        }
      }
    }
  }

  // 每个 workflow 必须显式记录两个 runtime，禁止静默缺口。
  for (const [workflowKey, records] of recordsByWorkflow) {
    const runtimes = new Set(records.map((record) => record.runtime));
    for (const runtime of ["cli", "mcp"]) {
      if (!runtimes.has(runtime)) {
        fail(`${workflowKey} is missing runtime record: ${runtime}.`);
      }
    }
  }
}

/**
 * 加载版本、能力注册表和全部快照，并完成跨文件一致性校验。
 */
export function loadContracts({
  sourceRoot = defaultSourceRoot,
  schemaRoot = join(sourceRoot, "schemas"),
} = {}) {
  const resolvedSourceRoot = resolve(sourceRoot);
  const resolvedSchemaRoot = resolve(schemaRoot);
  const ajv = new Ajv2020({
    allErrors: true,
    allowUnionTypes: true,
    strict: true,
  });

  // 加载固定 Schema 与两份权威 YAML。
  const validateVersions = compileSchema(
    ajv,
    resolvedSchemaRoot,
    "versions.schema.json",
    "versions.yaml",
  );
  const validateRegistry = compileSchema(
    ajv,
    resolvedSchemaRoot,
    "capability-registry.schema.json",
    "registry.yaml",
  );
  const validateSnapshot = compileSchema(
    ajv,
    resolvedSchemaRoot,
    "snapshot.schema.json",
    "snapshot",
  );
  const versions = readYaml(join(resolvedSourceRoot, "versions.yaml"), "versions.yaml");
  const registry = readYaml(
    join(resolvedSourceRoot, "capabilities", "registry.yaml"),
    "registry.yaml",
  );
  validateVersions(versions);
  validateRegistry(registry);

  // 校验能力注册表与权威版本的一致性。
  if (registry.registry_version !== versions.capability_registry_version) {
    fail("Registry version does not match versions.yaml.");
  }
  validateRegistrySemantics(registry);

  // 固定 Plugin manifest Schema 的路径和摘要，避免投影校验依赖开发机环境。
  const manifestSchemaPath = resolveContainedPath(
    resolvedSourceRoot,
    versions.plugin_manifest_schema.path,
    "Plugin manifest schema",
  );
  const manifestSchemaFile = readJson(
    manifestSchemaPath.target,
    "Plugin manifest schema",
    maxMetadataBytes,
  );
  if (sha256(manifestSchemaFile.bytes) !== versions.plugin_manifest_schema.sha256) {
    fail("Plugin manifest schema SHA-256 mismatch.");
  }

  // 先解析全部路径并累计文件大小，避免超量清单在失败前进入进程内存。
  const snapshots = new Map();
  const snapshotFiles = [];
  let aggregateSnapshotBytes = 0;
  for (const entry of versions.snapshots) {
    if (snapshotFiles.some(({ entry: knownEntry }) => knownEntry.id === entry.id)) {
      fail(`Duplicate snapshot ID: ${entry.id}.`);
    }
    const { target, size } = resolveContainedPath(
      resolvedSourceRoot,
      entry.path,
      `Snapshot ${entry.id}`,
    );
    if (size > maxSnapshotBytes) {
      fail(`Snapshot ${entry.id} exceeds the size limit.`);
    }
    aggregateSnapshotBytes += size;
    if (aggregateSnapshotBytes > maxSnapshotAggregateBytes) {
      fail("Snapshot aggregate bytes exceed the total snapshot limit.");
    }
    snapshotFiles.push({ entry, target });
  }

  // 总量门禁通过后再读取、解析和校验每个快照。
  for (const { entry, target } of snapshotFiles) {
    const { bytes, value } = readJson(target, `Snapshot ${entry.id}`, maxSnapshotBytes);
    if (sha256(bytes) !== entry.sha256) {
      fail(`Snapshot ${entry.id} SHA-256 mismatch.`);
    }
    validateSnapshot(value);
    if (value.id !== entry.id) {
      fail(`Snapshot ${entry.id} contains a different ID.`);
    }
    snapshots.set(entry.id, value);
  }

  return {
    versions,
    registry,
    snapshots,
    pluginManifestSchema: manifestSchemaFile.value,
  };
}
