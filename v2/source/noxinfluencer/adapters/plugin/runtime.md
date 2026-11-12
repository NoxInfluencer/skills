## Agent Plugin Installation Context

These rules apply only when the active invocation is through an installed Agent plugin, including Codex, Claude, Cursor, Grok Bot, WorkBuddy and Harness. Host names, an installed CLI executable, or the presence of a shared Skill do not select this mode by themselves. Separately invoked standalone Skills and CLI retain their own routing and presentation rules.

For every NoxInfluencer business operation in plugin mode, use the connected MCP provider. Do not install or fall back to a business CLI after authorization, connectivity, missing-tool or Handoff failures. Shared Manager examples do not override this entrypoint. Business confirmation, permissions, account binding and idempotency still apply.

For every paginated MCP read, explicitly set the page-size field supported by the live schema. When the user has not specified a size and there is no existing page size to preserve, use 10 or the tool's documented default if it is higher, within the tool's allowed range. For example, a new `campaign2_plan_list` query defaults to `page_num: 1` and `page_size: 10`. Do not request a smaller page just to preview the list or obtain a Handoff. Honor an explicit smaller request when the schema allows it. When continuing a list, keep the filters and page size and use the next page number or returned cursor as declared.

## Campaign Workbench

For Campaign tasks through this plugin, never use Computer Use, `cua_repl`, or any direct or indirect browser automation to control, probe, or verify the right-side Campaign workbench. This includes mouse or coordinate actions, DOM reads and clicks, screenshots, form input, scrolling, shortcuts, address-bar input, script navigation, `tab.goto`, and `createBrowserTab`. The rule applies to first open, navigation, status checks, and recovery. The user may operate the page manually. Host-owned OAuth still runs in the system browser.

For first open, reopen after closing, or a target outside the current authorized scope, follow `{baseDir}/references/handoffs.md`. Use only a verified native host action that consumes a trusted structured MCP Handoff independently of browser automation. Read structured status to confirm the account, host chat, workspace, and authorized target. If the host cannot open it this way, return the confirmed business result and state that automatic opening is unavailable. Do not open a Campaign page with an ordinary business URL.

Reuse an already bound workspace for the same authorized account and host chat, including one bound before this turn. For a target inside its authorized scope, let the workbench navigate from the server-confirmed result and the host's actual turn terminal event. Read the current plan or tab only through a declared, authorized workspace context interface. Honor explicit conversation-only requests by suppressing automatic open and navigation for the turn.

Before replying, verify the MCP business outcome and report any structured opening or display state already available. An accepted invitation is queued until authoritative delivery status says otherwise. The turn-triggered navigation and render receipt complete in the background. Do not wait for either to send the current turn's reply. Acknowledge display only after a structured page-load receipt. Keep the existing confirmation, idempotency, and status-check rules for Campaign writes.

Read only the relevant references:

- Presentation, authorized Handoff, and structured status: `{baseDir}/references/handoffs.md`
- Installed host capabilities and lifecycle: `{baseDir}/references/codex-plugin-runtime.md`
- Host-owned authorization and resuming the original request: `{baseDir}/references/oauth-and-scopes.md`
- Business tool execution and confirmation: `{baseDir}/references/tool-execution.md`
- Checked tool baseline; live schemas remain authoritative: `{baseDir}/references/tool-list.md`
- Files and downloads: `{baseDir}/references/resources-and-files.md`

For user attachments follow `{baseDir}/references/campaign-agent-automation.md`. Local attachment reading does not authorize direct backend access or a CLI fallback.
