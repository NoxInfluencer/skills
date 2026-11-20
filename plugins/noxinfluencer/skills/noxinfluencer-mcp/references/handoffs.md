# Plugin Handoff Presentation

Apply these rules in the installed Agent plugin. Keep OAuth in the system browser through the host's authorization controls. Use MCP for business operations, confirmation, idempotency, and result verification.

## Grok Handoff browser routing

Apply this section only when trusted runtime context identifies the active host as Grok Bot or Grok Build. It governs business Handoffs, not OAuth authorization. Codex, Claude, WorkBuddy and other hosts retain their existing routing rules.

Before consuming a Handoff, check the current conversation's exposed cloud-computer browser capabilities. The destination is the browser running on the current Bot's cloud computer (云电脑的浏览器); the user can view it through the Bot's computer preview. Without an explicit user request for an external browser, open it only through a verified navigation capability for that cloud-computer browser in this conversation. Use the host's actual browser or computer tool for that cloud browser. An installed MCP server or Grok Build executable does not establish that such a browser capability is available.

Unless the user explicitly requests external opening for that Handoff, do not pass it to the system URL opener or launch an external browser through shell commands such as `Start-Process`, `start`, `open`, `xdg-open`, `webbrowser.open`, or `ShellExecute`. Do not delegate opening to another CLI, host, or local Grok Build session. A relayed task summary is not proof of the current conversation's browser capability or of the original structured Handoff result. The general preference for a right-side tab and manual fallback below do not authorize automatic external opening in Grok.

If no verified cloud-computer browser capability is exposed, or its open action fails, report the presentation limitation with the verified MCP business result. Do not silently fall back to the system browser, install a browser tool, invent a browser action, or claim that the page opened. Honor the existing single-use and uncertain-consumption recovery rules. An external browser may be used only when the user explicitly requests external opening for that Handoff; a request to open or display a Campaign page alone is not that request.

## Campaign pages

Honor an explicit conversation-only request for the current turn. Return the business result in conversation and skip Handoff requests made solely for display, page opening, and manual open links.

### Reuse the exact open page

Reuse the current conversation's right-side page only when trusted host information confirms it is already open for the current authorized account and the exact target plan and view. Java publishes invitation changes and kol-next subscribes via SSE to refresh the matching open invitation page in place. For example, if plan A's Queued Sends view is already open, keep it when a new invitation is accepted. Skip reopening the page and requesting or consuming a Handoff for display.

### Open a different or closed page

When a Campaign page is needed for a first open, reopening after closure, switching plans or result views, or when an exact match cannot be confirmed, use the original, valid, unused `handoff_url` from Claw's structured MCP result with `presentation.status=ready` for the exact authorized target. For example, use the Queued Sends Handoff to move from plan A's Overview to plan A's Queued Sends. A plan list Handoff opens only the plan list. Use the Handoff supplied with the business result or a read-only producer declared for that target by the live MCP contract. Use only the current account's Handoffs and page context, including after reauthorization.

Pass the URL unchanged to an opening capability supported by the host. Prefer a suitable right-side tab in the current conversation when the host supports targeting it. Use browser capabilities only to open a valid Handoff. Keep all Campaign operations and business result checks in MCP. Do not inspect or operate the page with browser tools or open an ordinary Campaign URL as a substitute.

### Report business and page status

Report the verified MCP business outcome even when opening fails, is unavailable, or cannot be confirmed. Report an accepted invitation as queued and report delivery only when authoritative MCP business status establishes it. Reply without waiting for the page to load. Describe the page state using what the host actually confirms. An accepted open request supports reporting that opening was requested. Report the page as open only if host information establishes that state.

When the host cannot open the page automatically, return the business result and use a supported manual open option if a valid Handoff is available and no consumption attempt has been made for that URL. Providing a manual option does not establish that the page opened.

### Recover an expired or uncertain link

If a Handoff has expired or its consumption status is uncertain, use only a declared read-only MCP entrypoint that returns a fresh Handoff for the exact target. Never replay the URL or repeat a business write to obtain a link. If the live contract has no matching read-only entrypoint or it cannot supply a valid link, report the presentation limitation with the business result.

For example, if the live schema declares the invitation page Handoff on `campaign2_invitations_list`, request the target `campaign_id` with `view: "pending"` and `status_group: "queued"` for its Queued Sends page. Use the resulting link only when it is ready for `campaign_invitation_queued`. For the plan list, use `campaign2_plan_list` when its live schema declares the `campaign_list` Handoff.

## Other plugin results

Outside Campaign, use a configured Handoff from the live MCP contract for the exact result when the host supports it. Verify the authorized account and destination before reusing a view or reporting it as open. Prefer the current chat's existing matching view and continue the business workflow if presentation is pending. Honor conversation-only requests.

If no Handoff is configured or advertised, present the available business result in conversation. If a configured Handoff fails, report that presentation failure with the confirmed business result. When automatic opening is unavailable, use the existing user open path for a valid unused Handoff only if no host open action has attempted to consume it. Follow the same read-only recovery rule for an expired or uncertain link.

For all Handoffs, use the exact returned URL in the allowed host or user action. Do not log, persist, prefetch, modify or replay it. Respect expiry and the single-use contract.
