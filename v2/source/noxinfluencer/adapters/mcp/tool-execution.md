# MCP Tool Execution

Call only tools exposed by the connected `noxinfluencer` provider. The provided snapshot is a baseline; current live schemas may extend it. Campaign2 tools use the same external provider scope as the public catalog; internal Campaign permissions remain server-enforced. Verify live availability before use. Never invent a missing tool or fall back to CLI. Missing operations do not block unrelated catalogued workflows.

Inspect the live closed input schema before every call. Never add `uid`, `parent_uid`, Key, Token, Secret, local file path, Base64 content, or arbitrary URL. Respect declared pagination and batch limits; request only needed pages and never concatenate an unbounded result set.

Use `{baseDir}/references/risk-confirmation.md` to determine whether an ordinary write, a high-risk write, or a request to execute directly needs approval. For a declared preview/execute flow, preview the impact, verify the required user approval, and pass the server-issued single-use token unchanged to execute. Preserve the idempotency key across safe retries. Never invent or reuse a ticket. Keep export and deletion targets within the approved scope.

Campaign sending and deletion use one tool with preview/execute phases. Show the actual review and wait for explicit user confirmation before sending the returned confirmation token with unchanged business arguments. Query an uncertain sending attempt by its original execution key. Read `{baseDir}/references/campaign-agent-automation-mcp.md` for fields and `{baseDir}/references/campaign-invitation-management.md` for business rules.

For a supported asynchronous operation, start once and poll only its declared status Tool with bounded intervals and a stopping condition. For report downloads, use only the returned short-lived single-use download reference and Host-supported download handling; never fetch it through shell, browser automation, arbitrary HTTP, or an Authorization header.

Treat Skill Credit exhaustion as a business restriction, not an OAuth failure. For `AuthRequired` or HTTP `401`, follow `{baseDir}/references/oauth-and-scopes.md`. On ambiguous write timeout, do not repeat without the same idempotency key or an authoritative status. Never expose stack traces, credentials, internal service details, or raw response bodies.

## MCP Result Presentation

Complete the requested MCP operations and relevant pagination and status checks. Report an accepted dispatch as queued. Use subsequent authoritative business status to report sending or delivery. Follow `{baseDir}/references/handoffs.md` for page reuse, opening, and reporting the page state alongside the business outcome. This policy governs presentation for the selected MCP workflow.
