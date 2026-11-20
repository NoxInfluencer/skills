# Plugin MCP Authorization And Task Continuation

## Scope And Identity

This is the installed Agent plugin adapter, not standalone CLI setup. Use the current host's supported MCP connection controls. Codex, Claude, Cursor, Grok Bot, WorkBuddy, Harness and other hosts need their own supported authorization mechanisms; a Codex command is not a cross-host API. Identity comes from the authorized connection; never ask for or handle account keys, tokens, cookies or raw callback material.

Select the authorization route from trusted information about the running host. A shared plugin directory, an installed executable, or a bundled script does not identify the host. WorkBuddy uses the WorkBuddy route below; only a confirmed Codex host may use the Codex route. If the host is uncertain, use its native connection controls and do not launch a host-specific command.

## One Attempt, Then Resume

1. Retain the original request, selected objects, filters, page and business/presentation progress. When the required live MCP tool is ready, call it directly; there is no custom credential tool.
2. An explicit connection state requiring authorization, `AuthRequired` or HTTP `401` permits one host-owned authorization attempt. A single missing tool, a Handoff gap, `403`, insufficient scope, quota or transport failures do not trigger OAuth. The additional first-connection condition in the Codex route applies only to Codex.
3. Use the current host's native MCP authorization action and the matching route below. Keep generated authorization and callback URLs within the host's authorization flow. Never build an authorization URL or run NoxInfluencer CLI login/business commands.
4. Await the actual host login outcome, including an ongoing command's completion. A successful exit and explicit login-success result mean authorization succeeded. Never describe that state as "waiting for browser authorization" or ask the user to authorize again. Cancellation or failure stops automatic retries.
5. After success, use a connection/catalog refresh capability only if the host actually exposes and documents it. Recheck the current live catalog and connection readiness; do not assume launching a separate login process refreshed the active task, invent a refresh command, or call a tool that is not loaded.
6. If ready, resume the retained original operation immediately and apply `references/handoffs.md`. Continue from confirmed progress: do not repeat completed writes, job creation or consumed Handoffs. Use original idempotency/status protocols for uncertain outcomes.
7. If the host cannot refresh this task, report "authorization succeeded; the current task has not loaded the MCP tools". Use a supported reconnect/reload control if available; otherwise explain that a new task is required to load the connection and retain a concise summary of the pending request. This is a host continuation limitation, not a failed authorization or proof that the service lacks the tool. Do not promise automatic continuation without host support.

## WorkBuddy Authorization

Use the NoxInfluencer MCP connection supplied by this installed plugin in WorkBuddy. WorkBuddy owns its OAuth request, browser callback and stored credentials. Keep the current connection and account; the product Skill's name does not select another connector or installation.

Use WorkBuddy's native authorization action when available. Otherwise, direct the user to this plugin's NoxInfluencer MCP connection in WorkBuddy and choose **连接 (Connect)** or the authorization action displayed there. WorkBuddy prepares the browser flow and the user completes authorization in the browser. Await WorkBuddy's confirmed result, then resume through the shared continuation steps above.

In WorkBuddy, do not execute the Codex section below, launch a Codex login command or bundled authorization script, or install another agent to complete authorization. The presence of those resources in the shared plugin does not make them WorkBuddy capabilities. Do not invent a WorkBuddy shell command to authorize or refresh tools; use controls actually provided by WorkBuddy.

## Other Hosts

Use the running host's supported native MCP connection and authorization controls. If no automatic authorization action is available, direct the user to that host's connection settings. Do not substitute the Codex route merely because its executable or script is present.

## Codex Authorization Only

Read and execute this section only when trusted host context confirms that the running host is Codex. WorkBuddy and other hosts must skip it.

In Codex, provider-wide zero loaded tools with no known transport failure also permits the existing first-connection bootstrap. For Codex command execution, use an independently executable `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user`, or the bundled Windows resolver when needed. Apply the Windows routing below before launching. Keep generated authorization and callback URLs out of shell tool output while preserving the login process and its exit status.

### Codex On Windows

On a local Windows desktop, check `$env:CODEX_SANDBOX_NETWORK_DISABLED` in the command environment before the first command-based OAuth attempt. If it is `1`, the command cannot fetch OAuth metadata inside that sandbox. Run the bundled `{baseDir}/scripts/start-codex-oauth.ps1` with Codex's one-command sandbox approval. In `exec_command`, set `sandbox_permissions` to `require_escalated` and explain that this command needs desktop network access to open NoxInfluencer authorization in the default browser. Keep approval scoped to this invocation. Use normal execution when network access is available. If command approval is unavailable or denied, use the host's connection controls.

Open OAuth in the system default external browser. If automatic opening fails after the host prepares the login, present the host-provided external-browser authorization action for that same pending login when available. Ordinary chat links can open inside Codex, so use the host's external-browser action and keep its authorization URL in the host. Generating a URL alone does not confirm browser opening.

## Failure Boundaries

- A ready/refreshed catalog missing one business operation is a capability gap, not a login signal. Continue independent supported work.
- `403`/insufficient scope is an access restriction. A configured Handoff failure is a presentation failure. Neither permits a login loop or CLI fallback.
- If the host flow cannot start or the user cancels, stop automatic attempts. If there is no prepared authorization action, direct the user to the host's connection settings. Use standard user privileges and the installed executable.
- Keep authorization success, MCP readiness, business completion and page opening as separate states. Do not expose an authorization code, token, `state`, verifier or callback parameters in output.
