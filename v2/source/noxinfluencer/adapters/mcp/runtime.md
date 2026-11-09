## Codex Plugin MCP Runtime Boundary

Use the connected NoxInfluencer MCP provider for every NoxInfluencer operation. Never fall back to NoxInfluencer CLI business commands after an authorization, connectivity or missing-tool error. Use Host-owned OAuth for account connection.

Read only the MCP references needed for the current workflow:

- OAuth identity, scope, bootstrap, and failure branches: `{baseDir}/references/oauth-and-scopes.md`
- Current Tools, schema-bound invocation, writes, polling, and errors: `{baseDir}/references/tool-execution.md`
- Catalogued tools and plan-list queries: `{baseDir}/references/tool-list.md` in the fixed MCP plugin; otherwise inspect the live provider catalog.
- File and report results: `{baseDir}/references/resources-and-files.md`

For user-provided local attachments, follow the common attachment rules in `{baseDir}/references/campaign-agent-automation.md` using the Host's available reading tools. This permits local user-file reading only; remote file transfer and business operations retain the boundaries above.
