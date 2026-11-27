# MCP Handoff Presentation

Apply these rules when the active workflow uses MCP. Keep OAuth in the host's authorization flow. Use MCP for business operations, confirmation, idempotency, and result verification.

## Business page opening

Every new NoxInfluencer business page open or navigation must go through the corresponding MCP tool and use only the actual, valid, unused `handoff_url` it returns for the current authorized account and target. If the account connection is unavailable, follow `{baseDir}/references/oauth-and-scopes.md` before attempting business reads or page opening.

Never bypass MCP by opening an ordinary business URL, constructing or guessing an address or route, searching for another page entrance, or using direct browser navigation to reach a business page. This applies in the host's embedded browser, a cloud-computer browser, and any other browser. Browser capabilities may consume an MCP-issued Handoff; they do not independently select a business page URL.

Honor a conversation-only request and skip actions solely for page display. Otherwise, when a page is needed, use this order:

1. Reuse an exact matching view only when trusted host information confirms the current conversation, authorized account and destination. Keeping that page open requires no new Handoff.
2. Use a valid Handoff already returned with the current business result for this account and target. Do not make a redundant MCP call just to obtain another link.
3. If the current result has no usable link, or a previous Handoff is expired or its consumption is uncertain, check the live MCP contract for a declared read-only entrypoint that can issue a fresh Handoff for the exact account and target. Make at most one additional read-only request for this page open. Preserve the plan, view, filters and page when they define the requested target. Do not repeat the same lookup after it already returned no usable link, replay a URL, or repeat a business write to get a link.
4. If no matching read-only entrypoint exists or it supplies no usable `handoff_url`, stop the page-opening action and return any verified business result. When the user requested page opening, say exactly: "没有相关页面可以打开。"

Pass the exact URL to a host-supported opening action. A valid URL that the host cannot open is a presentation failure. When automatic opening is unavailable, use a supported manual open option only while the Handoff is valid and unused and no consumption attempt has been made. Return the verified business result without waiting for the page to load. An accepted open request establishes that opening was requested. Report the page as open only when the host confirms it, and report a confirmed opening failure separately from the business result.

These requirements concern business pages. OAuth authorization, file downloads, and original public creator or video evidence retain their own rules.

## Campaign pages

### Reuse the exact open page

Reuse an existing view in the current conversation only when trusted host information confirms it is already open for the current authorized account and the exact target plan and view. Java publishes invitation changes and kol-next subscribes via SSE to refresh the matching open invitation page in place. For example, if plan A's Queued Sends view is already open, keep it when a new invitation is accepted. Skip reopening the page and requesting or consuming a Handoff for display.

### Open a different or closed page

When a Campaign page is needed for a first open, reopening after closure, switching plans or result views, or when an exact match cannot be confirmed, use the original, valid, unused `handoff_url` from Claw's structured MCP result with `presentation.status=ready` for the exact authorized target. For example, use the Queued Sends Handoff to move from plan A's Overview to plan A's Queued Sends. A plan list Handoff opens only the plan list. Follow the shared selection and read-only recovery order above. Use only the current account's Handoffs and page context, including after reauthorization.

Pass the URL unchanged to an opening capability supported by the host. Prefer a suitable right-side tab in the current conversation when the host supports targeting it. Use browser capabilities only to open a valid Handoff. Keep all Campaign operations and business result checks in MCP. Do not inspect or operate the page with browser tools or open an ordinary Campaign URL as a substitute.

### Report business and page status

Report an accepted invitation as queued. Report delivery only when authoritative MCP business status establishes it. Use the shared opening and reporting rules to describe the page state separately.

### Read-only Handoff examples

If the live schema declares the invitation page Handoff on `campaign2_invitations_list`, request the target `campaign_id` with `view: "pending"` and `status_group: "queued"` for its Queued Sends page. Use the resulting link only when it is ready for `campaign_invitation_queued`. For the plan list, use `campaign2_plan_list` when its live schema declares the `campaign_list` Handoff for the requested view. Keep the original page and filters. If the contract cannot open the requested filtered view, report that limitation with the verified filtered results.

## Other MCP results

Outside Campaign, follow the same selection, recovery and reporting order for any Handoff advertised by the live MCP contract. Present the available business result in conversation if the contract has no Handoff for that result. Continue the business workflow when only presentation is pending.

For all Handoffs, use the exact returned URL in the allowed host or user action. Do not log, persist, prefetch, modify or replay it. Respect expiry and the single-use contract.
