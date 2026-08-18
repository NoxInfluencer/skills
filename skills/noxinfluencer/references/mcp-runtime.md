# NoxInfluencer MCP Runtime

Use this reference only after `{baseDir}/references/runtime-routing.md` selects MCP.

## Execution Rules

- Call only NoxInfluencer tools exposed by the connected `noxinfluencer` MCP provider.
- Inspect the runtime Tool description and input schema before the first call to a capability. The runtime schema is authoritative for exact names, fields, enums, and limits.
- Reuse the Skill's business sequencing and safety rules. Translate CLI command names into MCP capabilities; never invoke the CLI in MCP mode.
- Do not send `uid`, `user_id`, `parent_uid`, `tenant_id`, OAuth tokens, cookies, resources, service secrets, or arbitrary redirect URLs unless a future trusted Tool schema explicitly introduces a non-identity field with the same spelling. User identity must come from OAuth on the server.
- Do not call kol-next BFF endpoints or Java APIs directly. The remote MCP Server owns that integration.
- Do not invent a Tool or parameter when a capability is absent. Report the current MCP limitation without switching backends.

## Initial Codex Plugin Capabilities

The first plugin slice exposes exactly two business Tools. Use the exact names and contracts below. If either Tool is absent, report that the current MCP rollout is incomplete; do not guess a replacement Tool or fall back to CLI.

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

## OAuth and Authorization

- Start with the requested business Tool. There is no custom `get_oauth`, login, or token Tool.
- On an OAuth challenge or `401`, let the Codex MCP Client run the authorization flow and retry according to the host behavior.
- Never ask the user to paste a password, access token, refresh token, API key, or handoff code into the conversation.
- Treat `403` or insufficient scope as an authorization boundary. Explain the missing permission or account restriction; do not repeatedly trigger OAuth and do not fall back to CLI.

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
