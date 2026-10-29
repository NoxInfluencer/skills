## Codex Plugin MCP Runtime Boundary

This generated Plugin Skill uses the connected NoxInfluencer MCP provider for every NoxInfluencer operation. Never execute NoxInfluencer CLI business commands or fall back to the CLI when OAuth, MCP connectivity, or Tool availability fails. Use only Host-owned OAuth, file transfer, download, and browser handoff mechanisms defined by the Plugin runtime references.

Read only the MCP references needed for the current workflow:

- OAuth identity, scope, bootstrap, and failure branches: `{baseDir}/references/oauth-and-scopes.md`
- Current Tools, schema-bound invocation, writes, polling, and errors: `{baseDir}/references/tool-execution.md`
- Current Resources plus deferred upload/download contracts: `{baseDir}/references/resources-and-files.md`
- Browser and User Handoff branches: `{baseDir}/references/handoffs.md`

For user-provided local attachments, follow the common attachment rules in `{baseDir}/references/campaign-agent-automation.md` using the Host's available reading tools. This permits local user-file reading only; remote file transfer and business operations retain the boundaries above.
