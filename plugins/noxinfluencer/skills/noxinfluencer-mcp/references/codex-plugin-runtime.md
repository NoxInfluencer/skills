# Agent Plugin Runtime

This adapter applies only to the active installed Agent plugin entrypoint. It covers Codex, Claude, Cursor, Grok Bot, WorkBuddy, Harness and other hosts; separately invoked standalone Skills and CLI keep their own rules.

- Execute every NoxInfluencer business operation through the connected MCP provider, using actual live names and schemas. A baseline snapshot is not an exhaustive live capability list.
- Apply `{baseDir}/references/handoffs.md` to progress and results. Use only the capabilities verified for the running host and installation channel.
- Use `{baseDir}/references/oauth-and-scopes.md` to resume the original request after the host completes OAuth in the system browser. Never substitute a CLI backend, invent a tool or refresh command, or treat successful login as still pending.
- Shared business confirmation, idempotency and account boundaries remain in force.

## Campaign Workbench Capabilities

- Opening requires a verified native host action that accepts a trusted structured MCP Handoff independently of Computer Use and browser automation. Check only declared structured status for action acceptance, Handoff exchange, and Companion readiness. Verify the binding to the current account, host chat, workspace and target before using it. If the action is unavailable, report that automatic opening is unavailable alongside the confirmed business result.
- The installed Skill prohibits all direct and indirect Computer Use or browser automation for the right-side Campaign workbench. Claim host enforcement only when the installed channel provides a verified pre-dispatch interception point that can reject those calls before execution and record the rejection. Scope the rejection to this external plugin's Campaign workflow. Generic browser APIs and post-tool callbacks do not provide that interception.
- Use host-owned context or authenticated lifecycle reporting for the source, native chat ID, native turn ID, and actual completion, failure or cancellation. Never supply those values as model-generated tool arguments or infer them from conversation text. A tool result, `PostToolUse` event, or final message does not establish turn terminal status. When the running host provides no trusted lifecycle interface, report that terminal-triggered navigation is unavailable or unverified, as applicable.
- Obtain the current plan, tab, workspace binding and presentation state only through declared authorized structured interfaces. Reply with verified business progress and any opening state already available. Report display success only after a matching page-load receipt arrives, without making it a prerequisite for the reply that ends the turn.
