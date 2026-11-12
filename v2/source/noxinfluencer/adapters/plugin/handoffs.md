# Plugin Handoff Presentation

Apply these rules in the installed Agent plugin. Keep OAuth in the system browser through the host's authorization controls. Keep business verification and confirmation in the MCP workflow.

## Campaign Workbench

Never use Computer Use, `cua_repl`, or direct or indirect browser automation to control, inspect, or verify the right-side Campaign workbench. The ban includes clicks, DOM inspection, screenshots, typing, scrolling, shortcuts, script or address-bar navigation, `tab.goto`, and `createBrowserTab`. It applies to first open, follow-up navigation, status checks, and recovery. The user may interact with the page manually.

1. Honor an explicit conversation-only request. Return the confirmed result in conversation and suppress automatic opening and navigation for this turn. Use the supported presentation control when available. Do not request or consume a Handoff solely for display in this turn.
2. Read the authorized workspace context if the current host or MCP declares a structured interface. Reuse a ready binding only for the same authorized account, native host chat, workspace, and authorized target scope. Never reuse another chat's workbench, including a chat for the same account. A workspace bound before this turn is valid if these checks pass. Read the current plan or tab from structured context, not the page.
3. For a target within a ready workspace's scope, let the workbench navigate from the confirmed business result and the host's real turn terminal event. No new Handoff is needed. Report confirmed business progress and any structured display state already received. The turn-triggered navigation and its render receipt are asynchronous. Do not wait for either before replying.
4. On first open, after closure, or for a target outside the current scope, use the Handoff producer declared by the live MCP contract. A business tool may return `handoff_url` itself, or declare a separate producer. A list Handoff opens the list only. For an out-of-scope plan or view, obtain a Handoff for the exact authorized target. If the contract does not advertise a matching producer, report the presentation limitation with the business result. Do not probe unrelated tools or invent a producer.
5. Pass the trusted structured MCP result with its exact valid, unused `handoff_url` to a verified native host action independent of browser automation. Validate the bound account, host chat, workspace and target through the host's trusted context and structured receipts. A receipt for action accepted, successful Handoff exchange, or a ready Companion session confirms only that stage. Confirm the result has been displayed only after receiving the corresponding page-load receipt.
6. If the host lacks the native action, report that automatic opening is unavailable and return the confirmed business result. Use an existing host-provided manual open action only with a valid Handoff that has never been offered to the host for consumption. Record manual opening separately. Use the host's designated action surface to handle the Handoff. Never copy it to chat, another tool, or a log.

### Recovery and account changes

- After a timeout or uncertain action, check only the declared structured status interface for the current authorized binding. If the workspace is ready and the target is in scope, reuse it. If another open is needed, get a fresh Handoff from a declared producer or read-only query for that exact target. If the state cannot be established, report it as unconfirmed. Never replay a possibly consumed URL, construct or open a regular business URL, or repeat a business write to obtain a link.
- After reauthorization as account B, treat a valid B Handoff and its ready receipt as a new binding. While waiting, ignore account A's state and late receipts. Use only the current authorized binding for navigation and never reopen from an old A Handoff.
- Keep action acceptance, Handoff exchange, Companion readiness, and result display distinct. Report loading, navigation paused for editing, a failed load, or a missing receipt as the actual state. Report an accepted invitation as queued until a later authoritative business status establishes delivery.

## Other Plugin Results

Outside Campaign, use a configured Handoff from the live MCP contract for the exact result when the host supports it. Verify the authorized account and destination before reusing a view or reporting it as open. Prefer the current chat's existing matching view and continue the business workflow if presentation is pending. Honor conversation-only requests.

If no Handoff is configured or advertised, present the available business result in conversation. If a configured Handoff fails, report that presentation failure with the confirmed business result. When automatic opening is unavailable, use the existing user open path for a valid unused Handoff only if no host open action has attempted to consume it. For an expired or uncertain link, obtain a fresh one through a declared producer when needed. Never replay a write for presentation.

For all Handoffs, use the exact returned URL in the allowed host or user action. Do not log, persist, prefetch, modify or replay it. Respect expiry and the single-use contract.
