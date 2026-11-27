# MCP Host Runtime

Use these host capabilities when the active entrypoint uses MCP.

- Execute every NoxInfluencer business operation through the connected MCP provider, using actual live names and schemas. A baseline snapshot is not an exhaustive live capability list.
- Apply `{baseDir}/references/handoffs.md` to progress and results. Use the capabilities verified for the running host.
- Use `{baseDir}/references/oauth-and-scopes.md` before a required account operation when the connection is not ready, and to resume the original request after the host completes OAuth. Never substitute a CLI backend, invent a tool or refresh command, or treat successful login as still pending.
- Shared business confirmation, idempotency and account boundaries remain in force.
