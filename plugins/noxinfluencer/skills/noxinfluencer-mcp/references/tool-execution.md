# MCP Tool Execution

In an installed Agent plugin, call only tools exposed by the connected `noxinfluencer` provider. The provided snapshot is a baseline; current live schemas may extend it. Campaign2 tools use the same external provider scope as the public catalog; internal Campaign permissions remain server-enforced. Verify live availability before use. Never invent a missing tool or fall back to CLI. Missing operations do not block unrelated catalogued workflows.

Inspect the live closed input schema before every call. Never add `uid`, `parent_uid`, Key, Token, Secret, local file path, Base64 content, or arbitrary URL. Respect declared pagination and batch limits; request only needed pages and never concatenate an unbounded result set.

For ordinary writes, obtain explicit user approval and preserve the declared idempotency key across safe retries. For a declared preview/execute flow, preview current impact, obtain exact user confirmation, and pass the server-issued single-use confirmation token unchanged to execute. Never invent or reuse a ticket. Treat the two Creator exports and `delete_monitor_label` as actions requiring focused integration validation; do not silently broaden targets.

Campaign sending and deletion use one tool with preview/execute phases. Show the actual review and wait for explicit user confirmation before sending the returned confirmation token with unchanged business arguments. Query an uncertain sending attempt by its original execution key. Read `{baseDir}/references/campaign-agent-automation-mcp.md` for fields and `{baseDir}/references/campaign-invitation-management.md` for business rules.

For a supported asynchronous operation, start once and poll only its declared status Tool with bounded intervals and a stopping condition. For report downloads, use only the returned short-lived single-use download reference and Host-supported download handling; never fetch it through shell, browser automation, arbitrary HTTP, or an Authorization header.

Treat Skill Credit exhaustion as a business restriction, not an OAuth failure. Invalid/deleted credentials permit the one Host OAuth attempt. On ambiguous write timeout, do not repeat without the same idempotency key or an authoritative status. Never expose stack traces, credentials, internal service details, or raw response bodies.

## Plugin Result Presentation

Apply `{baseDir}/references/handoffs.md` immediately after each MCP response, including responses from a declared Handoff producer. If the response contains a valid `handoff_url` for the requested view, handle the Handoff before any further MCP call, pagination, polling, analysis or summary. An accepted operation can return a usable progress view while the job is still running. Open that view when it matches the request, then resume the required status checks. Follow the original approval and idempotency protocol for writes. Shared business references and Manager examples do not choose the plugin transport or override its presentation policy.
