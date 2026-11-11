# Plugin Handoff Presentation

## Scope

Apply this policy to every NoxInfluencer function invoked through an installed Agent plugin. Shared business Skills and standalone CLI invocations retain their selected entrypoint's behavior. Handoff is the default presentation of a configured result, not an alternative business backend and not OAuth login. Business writes still require their existing confirmation and idempotency protocol.

## Decide From The Current Contract

1. Resolve the requested function, account, objects, filters, pagination and intended result. You may open a relevant intermediate view to show confirmed progress, then continue the business work and required status checks. Report the observed state of queued or running jobs. Verify the actual outcome, including partial results and failures, before reporting it as final. A page-only request may use a declared navigation capability directly.
2. Inspect the live tool contract for a Handoff that matches the view to present. A business tool may return `handoff_url` itself, or its contract may identify a separate supported producer. Inspect declared `data`, `metadata` or `_meta` locations only as defined by that contract. When opening or updating the view requires a fresh link, use a declared producer or a supported read-only query that returns a Handoff for that view. Do not repeat a write to get a link or invent a field, schema, tool, URL or target mapping.
3. Configured Handoff: before the final response, confirm that the requested view is open and shows the latest verified result. Reuse an already current view. Otherwise open or update it through the host's supported browser. Preserve the selected object, result, filters and page. Verify the destination before reporting that the view opened. Honor explicit conversation-only requests.
4. No Handoff configured: present the available business result in conversation, including relevant pagination, evidence or completion status. If the service supplies neither a configuration declaration nor a URL, use conversation for this response and describe its presentation availability as unknown/not advertised, not as proof that the server has no configuration. Do not probe every business tool to discover navigation.
5. Configured but failed, missing or invalid URL: report the presentation failure and retain successful business results. Do not silently classify this as unconfigured, repeat a write, reopen OAuth without an authentication challenge, or claim the page was opened. Conversation data may accompany the failure report.

Historical snapshots are maintenance evidence, not a live feature switch. Their deferred status or old producer names cannot override a compatible current service contract. Conversely, documentation alone cannot enable a missing service capability.

## Consume The URL Once

- Use the exact trusted server-returned `handoff_url`; never construct it or attach account IDs, cookies or OAuth credentials. A download URL, thumbnail or ordinary business link is not automatically a Handoff.
- In Codex, use the visible in-app browser on the right. Before opening a new tab, check for the current chat's existing NoxInfluencer tab on the verified same-account session. Prefer the active matching tab. When the host supports navigation in that tab, navigate it to the fresh Handoff URL and use the host's existing-tab controls to show and activate that same tab. A URL-only open can create a new tab. Leave unrelated tabs alone.
- Create a new tab only when there is no suitable tab or the host cannot reuse it. Use a visible tab and bring it to the front through the host's supported controls. A queued open, a background tab, and an intermediate Handoff page do not confirm that the business page opened.
- In other hosts use their supported embedded browser, without assuming every host has a right panel or the same API. Follow host browser instructions and supported APIs.
- If no supported embedded browser is available, present the unchanged, still-valid, unused action link with the verified result and say that automatic opening was unavailable. If navigation fails or the outcome is uncertain, report its status. A link that may already have been consumed must not be passed to the user.
- The host browser and user-link branches are mutually exclusive consumers. Respect server expiry and single-use constraints; do not log, persist, prefetch, preflight-open or reuse the action URL. Do not send it to a business tool. If the link expires or is consumed and the user still wants the view, obtain a fresh link through the supported path in step 2.
- After consumption, reuse a verified same-account business page when appropriate; do not navigate back to its one-time URL. Verify the destination or report any user interaction still required. Never click a page's login/consent step on the user's behalf.

## Outcome

Keep business success, authorization state and presentation state separate. Report page opening only after a browser action confirms it; report loading, expiry, access denial or required user action accurately. User instructions requesting conversation output take priority.
