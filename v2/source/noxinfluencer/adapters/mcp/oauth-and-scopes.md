# MCP Authorization And Task Continuation

## Scope And Identity

Follow this guide when the active workflow uses MCP, whether the user installed the Agent plugin or selected MCP through the standalone Skill. Use the current host's supported connection controls and reuse a verified NoxInfluencer connection for the intended account. Keep account keys, tokens, cookies and callback parameters inside the host's authorization flow.

Select a host-specific route only from trusted information about the running host. A shared plugin directory, an installed executable, or a bundled script does not identify the host.

## Common Host Connection Setup

Check the named connection, the intended account when specified, and the live tool needed next. If ready for that account, execute the original operation. If the account differs or cannot be verified, use the account check in “One Attempt, Then Resume”. If a ready connection lacks a specific operation, report the gap and continue independent work. If readiness is unclear, inspect status with the host's actual connector controls. An empty generic tool search or installed-plugin list alone does not establish whether the connector is installed.

1. Keep the original task and confirmed progress as described in “One Attempt, Then Resume”. Use the current host's exposed native actions for the exact required connection. Install if confirmed missing, enable if disabled, and reuse any valid authorization. Use the connection declared by the plugin or Expert when present. For standalone direct setup without a declared or existing connection, use provider `noxinfluencer` at `https://skill.noxinfluencer.com/mcp` through supported host controls.
2. Check the host result after installation or enabling. Reuse an existing pending flow. If authorization is required, expired, or returns `AuthRequired` or HTTP `401`, invoke the host's native authorization or reconnect action once for this request. Let the host open its authorization page or card for the user to complete sign-in and consent there. Keep credentials inside this flow.
3. When authorization succeeds but tools are still absent, follow the readiness checks in “One Attempt, Then Resume”. Do not start authorization again. Use the confirmed host's section when a required setup action is unavailable or the host returns skipped, cancelled or failed. Do not repeat the failed action. If the host is unknown, use only its visible connection controls.

## One Attempt, Then Resume

1. Before connecting, retain the original request, intended account if known, selected plans or lists, filters, pagination, confirmed results and writes, and the first unfinished operation. When the required live MCP tool is ready, call it directly; there is no custom credential tool.
2. An explicit connection state requiring authorization, `AuthRequired` or HTTP `401` permits one host-owned authorization attempt. A single missing tool on a ready connection, a Handoff gap, `403`, insufficient scope, quota or transport failures do not trigger OAuth.
3. Keep generated authorization and callback URLs within the host's authorization flow. Never build an authorization URL or run NoxInfluencer CLI login/business commands.
4. Await the actual host login outcome. Distinguish pending, skipped, cancelled, failed and authorized. For a skipped, cancelled or failed attempt, stop automatic retries. In the current conversation, state what happened, explain which pending operation is affected, include any user-readable reason the host returned, and offer the supported recovery control. Keep the original task context. After confirmed authorization, proceed to readiness checks without asking for authorization again.
5. After success, verify through trusted host or provider information that the active connection matches the intended account when one was selected. If the account does not match or cannot be verified, pause the affected account operation and tell the user what to check on the connection. Verify that the tool needed for the next operation is loaded in the current session. Use a connection or catalog refresh only if the host exposes it, and do not assume launching a separate login process refreshed the active task.
6. If ready, resume the retained original operation immediately and apply `{baseDir}/references/handoffs.md`. If the host already resumed it, use the resulting progress. Continue at the first unfinished step with the retained selections, filters and pagination. Do not repeat completed writes, job creation or consumed Handoffs. Reconcile uncertain writes through the original status or idempotency protocol before retrying.
7. If authorization succeeded but the current session has not loaded the connection and its tools, report both states. Use a supported reload or reconnect control when available. If the host requires a new session, retain a concise summary of the original request, confirmed progress and next unfinished step so the user can continue from there.

## WorkBuddy Authorization

Use this section when WorkBuddy's common host actions do not establish a ready connection. WorkBuddy owns its OAuth request, browser callback and stored credentials. Keep the current connection and account.

For the WorkBuddy marketplace connector, match source `noxinfluencer-mcp` or the exact name **Nox 聚星红人营销 MCP**. Check its status through WorkBuddy's connector controls when the common lookup did not establish which connector to use. If WorkBuddy already returned skipped, cancelled or failed, go directly to the recovery controls below. Otherwise use an applicable WorkBuddy action that has not already been attempted for the same state.

1. **Not installed.** Invoke WorkBuddy's native install action for the exact connector if exposed, using its actual identifier and schema. If the action accepts a natural-language request, use “安装 Nox 聚星红人营销 MCP”. Wait for the install outcome and continue setup with that connector.
2. **Installed but disabled.** Use WorkBuddy's native enable action for that connection in the active conversation when available. Reuse its existing authorization.
3. **Not authorized or authorization expired.** Invoke WorkBuddy's native authorization action or reconnect action for that connector. If installing or enabling already produced a pending connection card, use that card. WorkBuddy opens the authorization flow and the user completes login and consent there. Await WorkBuddy's confirmed result, then follow “One Attempt, Then Resume”.

After a WorkBuddy `skipped` result, report the skipped step if WorkBuddy identifies it. Use “本次授权未完成” for skipped or cancelled authorization, “授权失败” for a confirmed authorization error, or “本次连接未完成” if the stage is unclear. If WorkBuddy still shows the connector card, direct the user to **连接 (Connect)** or **重新连接 (Reconnect)** on that card.

If no matching card or needed native action is available, direct the user to **专家·技能·连接器 → 连接器** and search **Nox 聚星红人营销 MCP**. Use the displayed add, connect or reconnect action for the connector's state. For a connector disabled in this conversation, use **+ → 连接器** to enable it here.

Use only WorkBuddy's actual controls for setup and recovery. Keep authorization inside WorkBuddy, without invoking another host's login commands, scripts or agent.

## Other Hosts

Use the running host's supported native MCP connection and authorization controls. If no automatic authorization action is available, direct the user to that host's connection settings. Do not substitute the Codex route merely because its executable or script is present.

## Codex Authorization Only

Read and execute this section only when trusted host context confirms that the running host is Codex. WorkBuddy and other hosts must skip it.

If the common setup cannot start authorization in Codex, this fallback applies to `AuthRequired`, HTTP `401`, or provider-wide zero loaded tools on first connection with no known transport failure. Reuse any pending authorization and respect a skipped, cancelled or failed attempt. For Codex command execution, use an independently executable `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user`, or the bundled Windows resolver when needed. Apply the Windows routing below before launching. Keep generated authorization and callback URLs out of shell tool output while preserving the login process and its exit status. Await the ongoing command's completion. A successful exit and explicit login-success result mean authorization succeeded.

### Codex On Windows

On a local Windows desktop, check `$env:CODEX_SANDBOX_NETWORK_DISABLED` in the command environment before the first command-based OAuth attempt. If it is `1`, the command cannot fetch OAuth metadata inside that sandbox. Run the bundled `{baseDir}/scripts/start-codex-oauth.ps1` with Codex's one-command sandbox approval. In `exec_command`, set `sandbox_permissions` to `require_escalated` and explain that this command needs desktop network access to open NoxInfluencer authorization in the default browser. Keep approval scoped to this invocation. Use normal execution when network access is available. If command approval is unavailable or denied, use the host's connection controls.

Open OAuth in the system default external browser. If automatic opening fails after the host prepares the login, present the host-provided external-browser authorization action for that same pending login when available. Ordinary chat links can open inside Codex, so use the host's external-browser action and keep its authorization URL in the host. Generating a URL alone does not confirm browser opening.

## Failure Boundaries

- A ready/refreshed catalog missing one business operation is a capability gap, not a login signal. Continue independent supported work.
- `403`/insufficient scope is an access restriction. A configured Handoff failure is a presentation failure. Neither permits a login loop or CLI fallback.
- If the host cannot start authorization, report the failure in the current conversation and direct the user to the host's supported connection settings.
- Keep authorization success, MCP readiness, business completion and page opening as separate states. Do not expose an authorization code, token, `state`, verifier or callback parameters in output.
