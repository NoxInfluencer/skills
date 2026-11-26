# Browser And User Handoffs

Campaign and page Handoff are currently deferred. Do not call a Handoff producer, open an action URL, or represent page opening as supported until both the live Tool catalog and Handoff snapshot declare a compatible supported contract. Normal business Tools never use a kol-next Handoff/BFF.

Browser Handoff turns the already authorized MCP identity into a short-lived Companion Web Session. It is not OAuth login, a file download, or a substitute business result.

The supported flow is `open_marketing_plan_tasks -> handoff_url -> host browser | user handoff`:

1. Call `open_marketing_plan_tasks` only after the user explicitly asks to open the task list.
2. Keep the action bound to the current OAuth subject and the business task `open_marketing_plan_tasks`. The Tool has an empty input object, so its parameter digest is N/A; no caller-supplied account or filter value may be added.
3. Accept only its declared `handoff_url`, `expires_in`, and `target` output. The contract TTL is at most 300 seconds and the URL is single-use.
4. When the supported Host browser capability is available, open that trusted returned URL unchanged.
5. Otherwise take the User Handoff branch: display the unchanged short-lived action URL to the user. Do not construct, shorten, wrap, or redirect it.

Never attach OAuth, a Bearer Token, Cookie, UID, or account parameter to a handoff. Never log, cache, preflight-open, reuse, or place the URL into another Tool call. User Handoff does not automatically download anything and does not assume the browser adds an authorization header. If the URL expires or is consumed, call the producer again only when the user still wants the page opened.

Reject and stop on any context mismatch: a different OAuth subject, business task, non-empty input, or parameter digest cannot consume or reuse the returned action. Call the producer again under the intended context instead of rewriting the URL.

The Host browser and User Handoff branches are mutually exclusive consumers of the same returned action. A handoff failure does not invalidate an otherwise successful business read.
