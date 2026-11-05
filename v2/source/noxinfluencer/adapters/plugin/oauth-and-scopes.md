# Plugin MCP Authorization And Task Continuation

## Scope And Identity

This is the installed Agent plugin adapter, not standalone CLI setup. Use the current host's supported MCP connection controls. Codex, Claude, Cursor, Grok Bot, WorkBuddy, Harness and other hosts need their own supported authorization mechanisms; a Codex command is not a cross-host API. Identity comes from the authorized connection; never ask for or handle account keys, tokens, cookies or raw callback material.

## One Attempt, Then Resume

1. Retain the original request, selected objects, filters, page and business/presentation progress. When the required live MCP tool is ready, call it directly; there is no custom credential tool.
2. An explicit `AuthRequired`/HTTP `401` permits one host-owned authorization attempt. In Codex, provider-wide zero loaded tools with no known transport failure also permits the existing first-connection bootstrap. A single missing tool, a Handoff gap, `403`, insufficient scope, quota or transport failures do not trigger OAuth.
3. In Codex only, use an independently executable `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user`, or on Windows the packaged `scripts/start-codex-oauth.ps1` resolver when needed. Other hosts use their own supported MCP connection UI/control. Never build an authorization URL or run NoxInfluencer CLI login/business commands.
4. Await the actual host login outcome, including an ongoing command's completion. A successful exit and explicit login-success result mean authorization succeeded. Never describe that state as "waiting for browser authorization" or ask the user to authorize again. Cancellation or failure stops automatic retries.
5. After success, use a connection/catalog refresh capability only if the host actually exposes and documents it. Recheck the current live catalog and connection readiness; do not assume launching a separate login process refreshed the active task, invent a refresh command, or call a tool that is not loaded.
6. If ready, resume the retained original operation immediately and apply `references/handoffs.md`. Continue from confirmed progress: do not repeat completed writes, job creation or consumed Handoffs. Use original idempotency/status protocols for uncertain outcomes.
7. If the host cannot refresh this task, report "authorization succeeded; the current task has not loaded the MCP tools". Use a supported reconnect/reload control if available; otherwise explain that a new task is required to load the connection and retain a concise summary of the pending request. This is a host continuation limitation, not a failed authorization or proof that the service lacks the tool. Do not promise automatic continuation without host support.

## Failure Boundaries

- A ready/refreshed catalog missing one business operation is a capability gap, not a login signal. Continue independent supported work.
- `403`/insufficient scope is an access restriction. A configured Handoff failure is a presentation failure. Neither permits a login loop or CLI fallback.
- If the host flow cannot start or the user cancels, stop automatic attempts and direct the user to that host's connection settings. Do not elevate, copy executables, or request credentials.
- Keep authorization success, MCP readiness, business completion and page opening as separate states. Do not expose an authorization code, token, `state`, verifier or callback parameters in output.
