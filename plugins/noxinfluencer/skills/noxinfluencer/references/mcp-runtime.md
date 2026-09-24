# NoxInfluencer MCP Runtime

Use this reference only after `{baseDir}/references/runtime-routing.md` selects MCP.

## Execution Rules

- Call only NoxInfluencer tools exposed by the connected `noxinfluencer` MCP provider.
- Inspect the runtime Tool description and input schema before the first call to a capability. The runtime schema is authoritative for exact names, fields, enums, and limits.
- Reuse the Skill's business sequencing and safety rules. Translate business capabilities into MCP Tool calls; never invoke a local NoxInfluencer CLI. The shell-side Codex Host auth action defined below is allowed; it is not a business backend.
- Do not send `uid`, `user_id`, `parent_uid`, `tenant_id`, OAuth tokens, cookies, resources, service secrets, or arbitrary redirect URLs unless a future trusted Tool schema explicitly introduces a non-identity field with the same spelling. User identity must come from OAuth on the server.
- Do not call kol-next BFF endpoints or Java APIs directly. The remote MCP Server owns that integration.
- Do not invent a Tool or parameter when a capability is absent. When the explicitly invoked Plugin has loaded no `noxinfluencer` Tools at all and no transport failure is known, treat that provider-wide absence as a first-connection bootstrap signal. A single missing Tool while any other `noxinfluencer` Tool is loaded, or an explicit connection refusal, timeout, or server error, must not start OAuth. An explicit `AuthRequired` result or HTTP `401` may also start the one-attempt OAuth bootstrap; never switch backends.

## Initial Codex Plugin Capabilities

The Campaign slice exposes exactly two business Tools. Use the exact names and contracts below. If either required Tool is absent while another `noxinfluencer` Tool is loaded, or remains absent from an otherwise successfully initialized and refreshed Tool catalog, report an incomplete rollout. If the entire provider has loaded zero Tools, follow the first-connection bootstrap below. Do not guess a replacement Tool or fall back to CLI.

### List intelligent marketing-plan tasks

Preferred Tool: `list_marketing_plan_tasks`

Use it when the user asks to view, list, refresh, paginate, or inspect their intelligent marketing-plan tasks.

- Its input is an object with only two optional fields: `pageNum` and `pageSize`. Do not send any additional field.
- `pageNum` is an integer from 1 through 100000 and defaults to 1.
- `pageSize` is an integer from 1 through 100 and defaults to 10.
- Omit an unspecified pagination field and let the Tool apply its default. For “next page” or “continue”, reuse the prior `pageSize` and increment the returned `pageNum` without exceeding the schema limits.
- Never supply a user identity.
- The current Tool has no status, keyword, time-range, sort, or other filter. If the user asks for running, failed, recent, or another filtered subset, state that the current plugin rollout only supports paginated listing. Do not invent a filter and do not present client-side filtering of one page as a complete result.
- Read the result from the root fields `errorNum`, `retDataList`, `pageNum`, `pageSize`, `totalSize`, and `totalPage`. Treat Campaign Item fields inside `retDataList` as runtime-defined until the server publishes a closed item schema; do not invent missing item fields.
- Present a concise task summary plus pagination information. Preserve only stable task or campaign identifiers actually returned for follow-up actions.

### Open the marketing-plan task page

Preferred Tool: `open_marketing_plan_tasks`

Use it only when the user explicitly asks to open, enter, or view the task list in a browser.

- Call the Tool with the exact empty input object `{}`. Do not send `target` or any other field; the server fixes `target=campaign_list` internally.
- Do not call it for an ordinary list request.
- Do not accept or construct a destination URL, UID, or handoff code.
- Read only the declared root fields `handoff_url`, `expires_in`, and `target` from the result.
- Treat `handoff_url` as short-lived and single-use. Do not cache, reuse, log, or place it into another Tool call.
- Open the returned URL with the host's browser capability when available. Otherwise give the user the returned action URL without exposing internal credentials.
- If the URL expires or has already been used, call the Tool again only when the user still wants to open the page.

All other NoxInfluencer business capabilities are unavailable in the initial Codex Plugin MCP rollout. Keep the workflow on MCP, report the limitation, and do not invoke the standalone CLI. A future rollout may add Tools, but only a runtime Tool actually exposed by the connected `noxinfluencer` provider can expand this capability set.

## OAuth Bootstrap and Authorization

Use this state flow only in Plugin mode and only when the user's request needs a NoxInfluencer MCP Tool:

1. Start with the requested business Tool when it is loaded. There is no custom `get_oauth`, login, or Token Tool.
2. Mark the bootstrap as attempted for this user request and actively start the Host OAuth flow exactly once in either of these cases: the explicitly invoked Plugin has loaded no `noxinfluencer` Tools at all and no explicit transport/server failure is known; or the MCP connection or Tool call explicitly returns `AuthRequired` or HTTP `401`.
   - Windows desktop or Codex CLI-hosted conversation: run `powershell -NoProfile -ExecutionPolicy Bypass -File "{baseDir}/scripts/start-codex-oauth.ps1"`. The helper prefers the executable Plugin App Server control CLI under the current `CODEX_HOME`, then falls back to a non-`WindowsApps` `codex` command.
   - macOS/Linux conversation: run `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user` only when `codex` is independently executable. Pass the case-sensitive registration value exactly as lowercase `dcr`.
3. Let the Codex Host perform DCR, PKCE, state handling, loopback callback, external-browser authorization, and Token storage. Never construct or open an `/authorize` URL yourself.
4. When Host authorization succeeds, recheck the connected provider's Tool catalog. If the required Tool is available, immediately retry the user's original business operation.
5. If this Codex task does not dynamically refresh MCP Tools, tell the user authorization succeeded but they must create a new Codex task and resend the original request.
6. When the connection initializes and the Tool catalog refreshes successfully but the required Tool is absent, report that the current MCP rollout does not expose the capability. Do not reopen OAuth.

A single missing business Tool while any `noxinfluencer` Tool is loaded and explicit transport failures never enter this OAuth flow. Provider-wide zero-Tool bootstrap, `AuthRequired`, and `401` share one attempt limit for the same user request. Never loop, recursively retry login, or reopen the browser after one bootstrap attempt.

### OAuth Failure Branches

- User cancels authorization: stop all auth retries and direct the user to NoxInfluencer Connect/Re-authorize in Codex settings.
- OAuth helper or Host login cannot start: do not repeat the automatic attempt, elevate, copy an executable, or construct another OAuth flow. Direct the user to Connect/Re-authorize in Codex settings and include only the helper's non-secret failure summary.
- `403` or `insufficient_scope`: treat it as a permission, Scope, account-entitlement, or account-access problem. Explain the boundary and do not trigger or repeat login.
- Login succeeds but the Tool catalog does not refresh in the current task: ask the user to create a new Codex task and resend the request; do not call login again.
- Login succeeds and a refreshed catalog still lacks the required Tool: report an incomplete MCP rollout; do not call login again and do not fall back to CLI.
- MCP initialization fails, the server is unreachable, or the request times out without an explicit `401`/`AuthRequired`: report the connectivity or availability failure and do not start OAuth.

Never output, log, request, copy, or persist an Access Token, Refresh Token, Authorization Code, `state`, `code_verifier`, Cookie, or callback parameter. A password, API key, or Browser Handoff code is not an OAuth-bootstrap substitute.

### Command Boundary

- Allowed in Plugin mode: the packaged Windows OAuth helper or an independently executable `codex mcp login noxinfluencer ...`, exactly once per user request.
- The Windows helper may invoke `{CODEX_HOME}/plugins/.plugin-appserver/codex.exe` because it is a Codex Host control CLI already installed by the desktop app. It must not invoke a `WindowsApps` alias, copy an executable, construct an authorization URL, or read OAuth credentials.
- Fallback when automatic startup is unavailable: NoxInfluencer Connect/Re-authorize in Codex settings.
- Forbidden: `noxinfluencer login`, all local NoxInfluencer CLI business commands, Device Flow, API-key setup, and CLI business fallback.

## Errors and Retries

- Validation error: correct only the rejected business arguments and retry when safe.
- Quota or entitlement error: explain the business restriction and surface a server-provided action URL when present. Do not call it an OAuth failure.
- Not found or forbidden: stop using that object ID and ask the user to select an accessible object when appropriate.
- Read timeout or temporary dependency error: retry conservatively according to server guidance.
- Write timeout: do not repeat a mutation unless the Tool contract provides idempotency or a status lookup that proves the original action was not accepted.
- Internal error: report the server trace or request ID when returned; never expose an internal stack or transport secret.

## Browser Handoff Boundary

Browser Handoff converts the already authorized MCP identity into a short-lived Companion Web Session. It is not a marketing-plan business query and it is not OAuth login.

- Request a handoff only through an exposed page-opening Tool.
- Let the server map a fixed business view to the actual route.
- Never construct a NoxInfluencer page URL or append identity parameters yourself.
- Never interpret a normal business URL as a handoff URL.
- A handoff failure does not invalidate an otherwise successful business result.
