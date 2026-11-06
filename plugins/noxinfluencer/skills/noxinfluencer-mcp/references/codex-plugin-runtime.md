# Agent Plugin Runtime

This adapter applies only to the active installed Agent plugin entrypoint. It covers Codex, Claude, Cursor, Grok Bot, WorkBuddy, Harness and other hosts; separately invoked standalone Skills and CLI keep their own rules.

- Execute every NoxInfluencer business operation through the connected MCP provider, using actual live names and schemas. A baseline snapshot is not an exhaustive live capability list.
- Apply `{baseDir}/references/handoffs.md` to every result. Prefer configured Handoff presentation without requiring an explicit browser request; otherwise present available results in conversation. Report configured presentation failures explicitly.
- Use `{baseDir}/references/oauth-and-scopes.md` to resume the original request after host-owned authorization. Never substitute a CLI backend, invent a tool/refresh command, or treat successful login as still pending.
- For business Handoff, use each host's supported browser API. Codex prefers its right-side in-app browser for that purpose. Use the system default external browser for OAuth as described in `{baseDir}/references/oauth-and-scopes.md`.
- Shared business confirmation, idempotency and account boundaries remain in force.
