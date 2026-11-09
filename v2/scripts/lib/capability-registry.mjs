export const requiredWorkflowIds = Object.freeze([
  "account-auth",
  "creator-discovery",
  "creator-analysis",
  "creator-contact",
  "dispute-feedback",
  "monitor",
  "marketing-plan",
  "collection",
  "crm",
  "email",
  "message",
  "product",
  "short-link",
  "affiliation",
  "brand-monitor",
  "files-exports",
  "quota-pricing",
]);

const operationalKeys = Object.freeze([
  "pagination",
  "batching",
  "remote_calls",
  "rate_limit",
  "quota",
  "long_task",
  "response_size",
]);
const writeRisks = new Set(["normal_write", "high_risk_write"]);
const backendSnapshotIds = new Set([
  "browser-handoff",
  "deployment",
  "file-transfer",
  "mcp-resources",
  "mcp-scopes",
  "mcp-tools",
]);
const workflowReferences = Object.freeze({
  "account-auth": "references/product-overview.md",
  "creator-discovery": "references/creator.md",
  "creator-analysis": "references/creator.md",
  "creator-contact": "references/creator.md",
  "dispute-feedback": "references/quota-pricing-dispute-feedback.md",
  monitor: "references/monitor.md",
  "marketing-plan": "references/marketing-plan-and-campaign.md",
  collection: "references/collection-and-crm.md",
  crm: "references/collection-and-crm.md",
  email: "references/outreach-and-messaging.md",
  message: "references/outreach-and-messaging.md",
  product: "references/product-short-link-affiliation.md",
  "short-link": "references/product-short-link-affiliation.md",
  affiliation: "references/product-short-link-affiliation.md",
  "brand-monitor": "references/brand-monitor.md",
  "files-exports": "references/files-and-exports.md",
  "quota-pricing": "references/quota-pricing-dispute-feedback.md",
});

function fail(message) {
  throw new Error(message);
}

function snapshotsAsMap(snapshots) {
  return snapshots instanceof Map ? snapshots : new Map(Object.entries(snapshots));
}

function buildSnapshotIndexes(snapshots) {
  const byId = snapshotsAsMap(snapshots);
  const items = (id) => byId.get(id)?.items ?? [];
  return {
    byId,
    cliCommands: new Map(items("cli-schema").map((item) => [item.command, item])),
    tools: new Map(items("mcp-tools").map((item) => [item.name, item])),
    resources: new Map(items("mcp-resources").map((item) => {
      const selectorKey = ["id", "name", "uri", "uri_template"].find((key) => item[key]);
      return [item[selectorKey], { item, selectorKey }];
    })),
    hostControl: new Map(items("host-control").map((item) => [item.id, item])),
    hostBrowser: new Map(items("host-browser").map((item) => [item.id, item])),
    browserHandoff: items("browser-handoff"),
    scopes: new Map(items("mcp-scopes").map((item) => [item.scope, item])),
    fileTransfer: new Map(items("file-transfer").map((item) => [item.id, item])),
  };
}

function validateOperational(record) {
  for (const key of operationalKeys) {
    if (typeof record.operational?.[key] !== "string" || !record.operational[key]) {
      fail(`${record.id} ${record.runtime} requires operational.${key}.`);
    }
  }
}

function validatePrimitiveSnapshot(record, primitive, indexes) {
  let item;
  if (primitive.type === "cli_command") {
    if (record.runtime !== "cli") fail(`${record.id} uses cli_command outside CLI.`);
    item = indexes.cliCommands.get(primitive.name);
    if (!item) fail(`${primitive.name} is not present in the CLI schema snapshot.`);
    if (primitive.schema_ref !== `snapshots/cli-schema.json#command=${primitive.name}`) {
      fail(`${primitive.name} has an invalid CLI schema_ref.`);
    }
    if (primitive.scope.length !== 0) fail(`${primitive.name} CLI scope must be empty.`);
    const expectedConfirmation = item.mutation ? "explicit_user" : "none";
    if (primitive.confirmation !== expectedConfirmation) {
      fail(`${primitive.name} confirmation does not match the CLI mutation contract.`);
    }
    if (item.mutation && primitive.idempotency === "read_only") {
      fail(`${primitive.name} write primitive cannot be read_only.`);
    }
    if (!item.mutation && primitive.idempotency !== "read_only") {
      fail(`${primitive.name} read primitive must be read_only.`);
    }
    return;
  }

  if (record.runtime !== "mcp") fail(`${record.id} uses MCP primitives outside MCP.`);
  if (primitive.type === "tool") {
    item = indexes.tools.get(primitive.name);
    if (!item) fail(`${primitive.name} is not a deployed Tool in the MCP snapshot.`);
    if (primitive.schema_ref !== `snapshots/mcp-tools.json#name=${primitive.name}`) {
      fail(`${primitive.name} has an invalid MCP Tool schema_ref.`);
    }
    if (primitive.scope.length !== 1 || primitive.scope[0] !== item.scope) {
      fail(`${primitive.name} scope does not match the MCP snapshot.`);
    }
    if (indexes.scopes.get(item.scope)?.status !== "supported") {
      fail(`${primitive.name} scope is not supported by the scope snapshot.`);
    }
    const reviewedRead = record.risk === "high_risk_write" && item.risk === "read"
      && primitive.role === "preview" && primitive.confirmation === "none" && primitive.idempotency === "read_only"
      && record.bindings.some(binding => binding.type === "review_reference" && binding.producer.primitive_id === primitive.id);
    if (item.risk !== record.risk && !reviewedRead) fail(`${primitive.name} risk does not match its snapshot.`);
    return;
  }
  if (primitive.type === "resource") {
    const resource = indexes.resources.get(primitive.name);
    if (!resource) fail(`${primitive.name} is not a deployed MCP Resource.`);
    item = resource.item;
    if (
      primitive.schema_ref
      !== `snapshots/mcp-resources.json#${resource.selectorKey}=${primitive.name}`
    ) {
      fail(`${primitive.name} has an invalid MCP Resource schema_ref.`);
    }
    if (item.status !== "supported") {
      fail(`${primitive.name} MCP Resource is not supported.`);
    }
    if (primitive.scope.length !== 1 || primitive.scope[0] !== item.scope) {
      fail(`${primitive.name} MCP Resource scope does not match its snapshot.`);
    }
    if (indexes.scopes.get(item.scope)?.status !== "supported") {
      fail(`${primitive.name} MCP Resource scope is not supported.`);
    }
    if (item.risk !== record.risk) {
      fail(`${primitive.name} MCP Resource risk does not match its snapshot.`);
    }
    return;
  }
  if (primitive.type === "host_control") {
    item = indexes.hostControl.get(primitive.name);
  } else if (primitive.type === "browser_handoff") {
    item = indexes.hostBrowser.get(primitive.name);
  } else if (primitive.type === "user_handoff") {
    item = indexes.browserHandoff.find(({ consumers = [] }) => consumers.includes("user-handoff"));
  }
  if (!item) fail(`${primitive.name} is not present in its Host/Handoff snapshot.`);
  if (item.status && item.status !== "supported") {
    fail(`${primitive.name} Host/Handoff capability is not supported.`);
  }
}

function validateGraph(record, primitives) {
  const colors = new Map();
  const visit = (id) => {
    const color = colors.get(id);
    if (color === "gray") fail(`${record.id} ${record.runtime} primitive graph contains a cycle.`);
    if (color === "black") return;
    colors.set(id, "gray");
    for (const predecessor of primitives.get(id).after) visit(predecessor);
    colors.set(id, "black");
  };
  for (const id of primitives.keys()) visit(id);
}

function isPredecessor(primitives, predecessorId, consumerId, visited = new Set()) {
  if (visited.has(consumerId)) return false;
  visited.add(consumerId);
  const consumer = primitives.get(consumerId);
  if (consumer.after.includes(predecessorId)) return true;
  return consumer.after.some((id) => isPredecessor(primitives, predecessorId, id, visited));
}

/**
 * 读取 Tool JSON Schema 中被 required 声明的属性，供票据合同做字段级校验。
 */
function requiredSchemaProperty(schema, propertyName) {
  if (
    schema?.type !== "object"
    || !Array.isArray(schema.required)
    || !schema.required.includes(propertyName)
  ) return null;
  return schema.properties?.[propertyName] ?? null;
}

/**
 * 校验确认票据的 Tool snapshot 证据，确保注册表字段不是脱离真实 schema 的空声明。
 */
function validateConfirmationSnapshot(record, binding, producer, consumer, indexes) {
  const producerTool = indexes.tools.get(producer.name);
  const consumerTool = indexes.tools.get(consumer.name);
  const contract = producerTool?.confirmation_contract;
  if (
    !producerTool
    || !consumerTool
    || contract?.exact_user_confirmation !== true
    || contract.subject_binding !== "oauth"
    || contract.single_use !== true
    || !Number.isInteger(contract.ttl_max_seconds)
    || contract.ttl_max_seconds < 1
  ) {
    fail(`${record.id} confirmation snapshot lacks an exact user-confirmation contract.`);
  }

  // confirm 输入必须精确绑定对象、动作和规范化参数摘要。
  const taskProperty = requiredSchemaProperty(producerTool.input_schema, contract.task_input);
  const actionProperty = requiredSchemaProperty(producerTool.input_schema, contract.action_input);
  const digestProperty = requiredSchemaProperty(
    producerTool.input_schema,
    contract.parameter_digest_input,
  );
  const actionValues = actionProperty?.const
    ? [actionProperty.const]
    : actionProperty?.enum;
  if (
    producerTool.input_schema?.additionalProperties !== false
    || taskProperty?.type !== "string"
    || (taskProperty.minLength ?? 0) < 1
    || !Array.isArray(actionValues)
    || actionValues.length === 0
    || actionValues.some((value) => typeof value !== "string" || !value)
    || digestProperty?.type !== "string"
    || digestProperty.pattern !== "^[0-9a-f]{64}$"
  ) {
    fail(`${record.id} confirmation snapshot does not bind exact object, action, and parameter digest.`);
  }

  // confirm 输出与 execute/upload 输入必须由同名必填字符串票据连接。
  const ticketOutput = requiredSchemaProperty(producerTool.output_schema, contract.ticket_output);
  const ticketInput = requiredSchemaProperty(consumerTool.input_schema, binding.consumer.input);
  if (
    contract.ticket_output !== binding.producer.output
    || binding.consumer.input !== contract.ticket_output
    || ticketOutput?.type !== "string"
    || (ticketOutput.minLength ?? 0) < 1
    || ticketInput?.type !== "string"
    || (ticketInput.minLength ?? 0) < 1
    || binding.ttl_seconds !== contract.ttl_max_seconds
    || binding.single_use !== contract.single_use
  ) {
    fail(`${record.id} confirmation ticket schema, TTL, or single-use contract does not match.`);
  }
}

function validateBinding(record, binding, primitives, indexes) {
  const producer = binding.producer?.primitive_id
    ? primitives.get(binding.producer.primitive_id)
    : null;
  const consumer = binding.consumer?.primitive_id
    ? primitives.get(binding.consumer.primitive_id)
    : null;
  if (!producer) fail(`${record.id} binding ${binding.id} has a missing producer.`);
  if (!consumer) fail(`${record.id} binding ${binding.id} has a missing consumer.`);
  if (!isPredecessor(primitives, producer.id, consumer.id)) {
    fail(`${record.id} binding ${binding.id} producer must precede its consumer.`);
  }
  for (const key of ["subject", "task", "parameter_digest"]) {
    if (!["required", "not_applicable"].includes(binding.context_binding?.[key])) {
      fail(`${record.id} binding ${binding.id} requires context_binding.${key}.`);
    }
  }

  // 预览引用在人工确认前签发；执行端仍须显式 confirmed=true，不能冒充宿主已确认票据。
  if (binding.type === "review_reference") {
    const preview = indexes.tools.get(producer.name);
    const execute = indexes.tools.get(consumer.name);
    const contract = preview?.review_reference_contract;
    // 同一工具分 phase 预览和执行，执行分支必须要求服务端令牌及显式确认。
    if (binding.consumer.input === "confirmation_token") {
      const schema = execute?.input_schema;
      const executionRule = schema?.allOf?.find(rule => rule.if?.properties?.phase?.const === "execute");
      if (producer.name !== consumer.name || producer.role !== "preview" || producer.confirmation !== "none"
        || consumer.role !== "execute" || consumer.confirmation !== "server_ticket"
        || binding.producer.output !== "data.confirmation_token"
        || contract?.phase_input !== "phase" || contract?.token_output !== binding.producer.output
        || contract?.human_confirmation_owner !== "host" || contract?.single_attempt !== true
        || contract?.subject_binding !== "authenticated_user" || contract?.revalidate_snapshot !== true
        || contract?.ttl_max_seconds !== binding.ttl_seconds || binding.ttl_seconds > 300 || !binding.ttl_seconds
        || !binding.single_use || binding.sensitivity !== "secret"
        || Object.values(binding.context_binding).some(value => value !== "required")
        || !schema?.required?.includes("campaign_id") || !schema.required.includes("phase") || !schema.required.includes("idempotency_key")
        || schema.properties?.confirmation_token?.type !== "string" || schema.properties?.confirmed?.const !== true
        || schema.properties?.phase?.enum?.join(",") !== "preview,execute"
        || !executionRule?.then?.required?.includes("confirmation_token") || !executionRule.then.required.includes("confirmed")
        || schema.additionalProperties !== false) {
        fail(`${record.id} review reference must bind phased preview to explicitly confirmed execution.`);
      }
      return;
    }
    const input = requiredSchemaProperty(execute?.input_schema, binding.consumer.input);
    const confirmed = requiredSchemaProperty(execute?.input_schema, "confirmed");
    const output = preview?.output_schema?.properties?.[binding.producer.output];
    if (producer.role !== "preview" || producer.confirmation !== "none"
      || consumer.role !== "execute" || consumer.confirmation !== "server_ticket"
      || binding.producer.output !== "confirmation_id" || binding.consumer.input !== "confirmation_id"
      || contract?.human_confirmation_owner !== "host" || contract?.single_attempt !== true
      || contract?.subject_binding !== "authenticated_user" || contract?.revalidate_snapshot !== true
      || contract?.ttl_max_seconds !== binding.ttl_seconds || !binding.single_use
      || binding.sensitivity !== "secret"
      || Object.values(binding.context_binding).some(value => value !== "required")
      || input?.type !== "string" || input.pattern !== "^[a-f0-9]{64}$"
      || output?.type !== "string" || output.pattern !== input.pattern
      || confirmed?.const !== true || execute.input_schema.additionalProperties !== false) {
      fail(`${record.id} review reference must bind a single-attempt preview to explicitly confirmed execution.`);
    }
    return;
  }

  if (binding.type === "browser_handoff_url") {
    const contract = indexes.browserHandoff.find(({ producer: name }) => name === producer.name);
    if (!contract || binding.producer.output !== contract.output) {
      fail(`${record.id} browser handoff binding does not match its producer output.`);
    }
    if (!["browser_handoff", "user_handoff"].includes(consumer.type)) {
      fail(`${record.id} browser handoff binding has an incompatible consumer.`);
    }
    if (binding.ttl_seconds !== contract.ttl_max_seconds || binding.single_use !== contract.single_use) {
      fail(`${record.id} browser handoff TTL or single-use contract does not match its snapshot.`);
    }
    if (binding.sensitivity !== "user_action_url") {
      fail(`${record.id} browser handoff binding must be a user_action_url.`);
    }
    return;
  }
  if (binding.type === "confirmation_ticket") {
    if (
      producer.role !== "confirm"
      || producer.confirmation !== "explicit_user"
      || !["execute", "upload"].includes(consumer.role)
      || consumer.confirmation !== "server_ticket"
      || binding.producer.output !== "confirmation_ticket"
      || binding.consumer.input !== "confirmation_ticket"
    ) {
      fail(`${record.id} confirmation_ticket binding has incompatible endpoints.`);
    }
    if (
      binding.context_binding.subject !== "required"
      || binding.context_binding.task !== "required"
      || binding.context_binding.parameter_digest !== "required"
      || !binding.single_use
      || binding.sensitivity !== "secret"
    ) {
      fail(`${record.id} confirmation_ticket binding requires exact context and single-use secret handling.`);
    }
    validateConfirmationSnapshot(record, binding, producer, consumer, indexes);
    return;
  }
  fail(`${record.id} binding ${binding.id} uses an unsupported binding type.`);
}

/**
 * 校验 MCP 写原语的确认与幂等合同，防止仅声明 server_ticket 却未绑定真实确认票据。
 */
function validateWriteSafety(record, primitives) {
  if (record.runtime !== "mcp" || record.status !== "supported" || !writeRisks.has(record.risk)) return;

  // 每个执行原语先校验自身确认和幂等属性。
  for (const primitive of primitives.values()) {
    if (primitive.type !== "tool" || !["execute", "upload"].includes(primitive.role)) continue;
    if (primitive.confirmation === "none" || primitive.idempotency === "read_only") {
      fail(`${record.id} write Tool requires confirmation and write idempotency.`);
    }
    if (record.risk === "high_risk_write" && primitive.confirmation !== "server_ticket") {
      fail(`${record.id} high-risk execute Tool requires a server ticket.`);
    }

    // server_ticket 必须由同一图中的 confirmation_ticket binding 精确消费。
    if (primitive.confirmation === "server_ticket") {
      const matchingBindings = record.bindings.filter((binding) => (
        ["confirmation_ticket", "review_reference"].includes(binding.type)
        && binding.consumer?.primitive_id === primitive.id
        && ["confirmation_ticket", "confirmation_id", "confirmation_token"].includes(binding.consumer?.input)
      ));
      if (matchingBindings.length !== 1) {
        fail(`${record.id} ${primitive.id} requires exactly one confirmation_ticket binding.`);
      }
    }
  }
}

function validateSingleUseBindings(record, primitives) {
  const consumersByProducer = new Map();
  for (const binding of record.bindings) {
    if (!binding.single_use) continue;
    const key = `${binding.producer.primitive_id}:${binding.producer.output}`;
    const group = consumersByProducer.get(key) ?? [];
    group.push(binding);
    consumersByProducer.set(key, group);
  }
  for (const group of consumersByProducer.values()) {
    if (group.length < 2) continue;
    const consumers = group.map((binding) => primitives.get(binding.consumer.primitive_id));
    const conditions = consumers.map((primitive) => primitive?.condition?.host_browser).sort();
    const types = new Set(consumers.map((primitive) => primitive?.type));
    if (
      group.some(({ type }) => type !== "browser_handoff_url")
      || conditions.join(",") !== "available,unavailable"
      || !types.has("browser_handoff")
      || !types.has("user_handoff")
    ) {
      fail(`${record.id} single-use binding has non-exclusive consumers.`);
    }
  }
}

/**
 * 校验完整双运行时能力矩阵，并返回已索引记录供权限投影复用。
 */
export function validateCapabilityRegistry({ versions, registry, snapshots }) {
  const indexes = buildSnapshotIndexes(snapshots);
  const records = new Map();
  const workflowIds = new Set();

  // 先做记录级证据和 primitive 索引校验，避免后续图遍历重复扫描快照。
  for (const record of registry.workflows) {
    const key = `${record.id}:${record.capability}:${record.runtime}`;
    if (records.has(key)) fail(`Duplicate capability record: ${key}.`);
    records.set(key, record);
    workflowIds.add(record.id);
    validateOperational(record);
    if (record.reference !== workflowReferences[record.id]) {
      fail(`${key} reference does not match its shared business domain.`);
    }
    for (const snapshotId of record.snapshot_refs) {
      if (!indexes.byId.has(snapshotId)) fail(`${key} references missing snapshot ${snapshotId}.`);
    }
    if (record.status === "supported") {
      if (!record.backend_version) fail(`${key} supported record requires backend_version.`);
      if (record.kind === "business" && record.primitives.length === 0) {
        fail(`${key} supported business record requires primitives.`);
      }
      const expectedBackendVersion = record.runtime === "cli"
        ? indexes.byId.get("cli-schema")?.version
        : versions.backend_version;
      if (record.backend_version !== expectedBackendVersion) {
        fail(`${key} backend_version does not match its authoritative snapshot.`);
      }
      if (record.runtime === "mcp") {
        for (const snapshotId of record.snapshot_refs) {
          if (!backendSnapshotIds.has(snapshotId)) continue;
          if (indexes.byId.get(snapshotId)?.backend_version !== versions.backend_version) {
            fail(`${key} snapshot ${snapshotId} backend_version does not match the deployed backend.`);
          }
        }
      }
    } else if (!record.not_applicable_reason) {
      fail(`${key} ${record.status} record requires not_applicable_reason.`);
    }
    if (record.upload_dependency) {
      const dependency = indexes.fileTransfer.get(record.upload_dependency.id);
      if (!dependency || dependency.status !== record.upload_dependency.status) {
        fail(`${key} upload_dependency does not match the file-transfer snapshot.`);
      }
      if (!record.snapshot_refs.includes("file-transfer")) {
        fail(`${key} upload_dependency requires the file-transfer snapshot.`);
      }
    }

    const primitives = new Map();
    for (const primitive of record.primitives) {
      if (primitives.has(primitive.id)) fail(`${key} contains duplicate primitive ${primitive.id}.`);
      primitives.set(primitive.id, primitive);
    }
    for (const primitive of primitives.values()) {
      for (const predecessor of primitive.after) {
        if (!primitives.has(predecessor)) fail(`${key} has missing predecessor ${predecessor}.`);
      }
      const snapshotMatch = primitive.schema_ref.match(/^snapshots\/([a-z0-9-]+)\.json#/u);
      if (!snapshotMatch || !record.snapshot_refs.includes(snapshotMatch[1])) {
        fail(`${key} primitive ${primitive.id} schema_ref is not covered by snapshot_refs.`);
      }
      if (record.status === "supported") validatePrimitiveSnapshot(record, primitive, indexes);
    }
    validateGraph(record, primitives);
    for (const binding of record.bindings) validateBinding(record, binding, primitives, indexes);
    validateSingleUseBindings(record, primitives);
    validateWriteSafety(record, primitives);
  }

  // 最后统一检查固定 domain 集，以及每个 capability 的 CLI/MCP 成对覆盖。
  for (const id of requiredWorkflowIds) {
    if (![...records.values()].some((record) => record.id === id)) {
      fail(`${id} is missing capability records.`);
    }
  }
  const runtimesByCapability = new Map();
  for (const record of records.values()) {
    const capabilityKey = `${record.id}:${record.capability}`;
    const runtimes = runtimesByCapability.get(capabilityKey) ?? new Set();
    runtimes.add(record.runtime);
    runtimesByCapability.set(capabilityKey, runtimes);
  }
  for (const [capabilityKey, runtimes] of runtimesByCapability) {
    for (const runtime of ["cli", "mcp"]) {
      if (!runtimes.has(runtime)) fail(`${capabilityKey} is missing ${runtime} capability record.`);
    }
  }
  for (const id of workflowIds) {
    if (!requiredWorkflowIds.includes(id)) fail(`Unknown capability workflow: ${id}.`);
  }
  return { records, workflowIds, indexes };
}
