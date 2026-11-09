# Plugin Handoff-First Presentation

## Scope

Apply this policy to every NoxInfluencer function invoked through an installed Agent plugin. Shared business Skills and standalone CLI invocations retain their selected entrypoint's behavior. Handoff is the default presentation of a configured result, not an alternative business backend and not OAuth login. Business writes still require their existing confirmation and idempotency protocol.

## Decide From The Current Contract

1. Resolve the requested function, account, objects, filters, pagination and intended result. Use MCP for the necessary business work. A page-only read may use a declared navigation capability directly; do not repeat queries or mutations solely to open a page.
2. Inspect the current tool contract, supported presentation configuration and actual response for that function. A business tool may return `handoff_url` itself, or its contract may identify a separate supported producer. Inspect declared `data`, `metadata` or `_meta` locations only as defined by that contract. Do not require a fixed producer name or invent a field, schema, tool, URL or target mapping.
3. Configured Handoff: obtain the declared server-issued URL and open it through the host's supported browser capability. Apply this to every configured workflow without requiring an explicit browser request. Preserve the selected object, result, filters and page according to the live schema; an unrelated home page does not count as the result view.
4. No Handoff configured: present the available business result in conversation, including relevant pagination, evidence or completion status. If the service supplies neither a configuration declaration nor a URL, use conversation for this response and describe its presentation availability as unknown/not advertised, not as proof that the server has no configuration. Do not probe every business tool to discover navigation.
5. Configured but failed, missing or invalid URL: report the presentation failure and retain successful business results. Do not silently classify this as unconfigured, repeat a write, reopen OAuth without an authentication challenge, or claim the page was opened. Conversation data may accompany the failure report.

Historical snapshots are maintenance evidence, not a live feature switch. Their deferred status or old producer names cannot override a compatible current service contract. Conversely, documentation alone cannot enable a missing service capability.

## Consume The URL Once

- Use the exact trusted server-returned `handoff_url`; never construct it or attach account IDs, cookies or OAuth credentials. A download URL, thumbnail or ordinary business link is not automatically a Handoff.
- In Codex, use the visible in-app browser on the right. Before opening a new tab, check for the current chat's existing NoxInfluencer tab on the verified same-account session. Prefer the active matching tab. When the host supports navigation in that tab, navigate it to the fresh Handoff URL and use the host's existing-tab controls to show and activate that same tab. A URL-only open can create a new tab. Leave unrelated tabs alone.
- Create a new tab only when there is no suitable tab or the host cannot reuse it. Use a visible tab and bring it to the front through the host's supported controls. A queued open, a background tab, and an intermediate Handoff page do not confirm that the business page opened.
- In other hosts use their supported embedded browser, without assuming every host has a right panel or the same API. Follow host browser instructions and supported APIs.
- If no supported embedded browser is available, present the unchanged valid action link for the user to open and say that automatic opening was unavailable. Do not substitute an external browser silently or report automatic opening success.
- The host browser and user-link branches are mutually exclusive consumers. Respect server expiry and single-use constraints; do not log, persist, prefetch, preflight-open or reuse the action URL. Do not send it to a business tool. Reissue an expired/consumed action only through the declared producer when the user still wants that view.
- After consumption, reuse a verified same-account business page when appropriate; do not navigate back to its one-time URL. Verify the destination or report any user interaction still required. Never click a page's login/consent step on the user's behalf.

## Outcome

Keep business success, authorization state and presentation state separate. Report page opening only after a browser action confirms it; report loading, expiry, access denial or required user action accurately. User instructions requesting conversation output take priority.
