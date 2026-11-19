# Agent Plugin Runtime

This adapter applies to this WorkBuddy Expert and its connected NoxInfluencer MCP connector.

- Execute every NoxInfluencer business operation through the connected MCP provider, using actual live names and schemas. A baseline snapshot is not an exhaustive live capability list.
- Apply `@references/handoffs.md` to progress and results. Use only the capabilities verified for the running host and installation channel.
- Use `@references/oauth-and-scopes.md` to resume the original request after the host completes OAuth in the system browser. Never substitute a CLI backend, invent a tool or refresh command, or treat successful login as still pending.
- Shared business confirmation, idempotency and account boundaries remain in force.
