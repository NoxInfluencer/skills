---
name: noxinfluencer-mcp
description: Operate NoxInfluencer creator and Campaign workflows through this plugin’s connected MCP provider. Use for product operations in this plugin; explicitly selected standalone workflows keep their own entrypoint.
---

# NoxInfluencer

Use the connected NoxInfluencer tools for creator research, collections, CRM, monitoring, intelligent marketing plans (Campaigns), products, exports, quota and pricing. The provided tool list defines the product's supported operations.

## Choose The Available Operation

Read `{baseDir}/references/tool-list.md` as a checked baseline, then use the connected provider's live catalog and schema as the execution authority. The live catalog may extend the baseline. Never invent a missing operation, require it for unrelated work, or switch to another backend.

When invoked through an installed Agent plugin (Codex, Claude, Cursor, Grok Bot, WorkBuddy, Harness or another host), all NoxInfluencer business operations use MCP. Prefer a configured Handoff to present verified results. Read `{baseDir}/references/handoffs.md` before presenting results. This policy belongs to the active plugin entrypoint; it does not change separately invoked shared Skills or CLI workflows, even when both installations exist.

For intelligent marketing-plan task lists, the current business tool is `campaign2_plan_list`. Use its live paging and filter schema, preserve selected filters, and apply the same Handoff policy as every other function. Do not assume a separate page-opening tool or historical tool name is required.

## Working Rules

- Resolve the selected Campaign, collection, CRM scope or monitoring project before writing. Campaign cooperation management and account CRM are distinct destinations.
- Read current state when identity, ownership, status or existing content is unclear. Keep opaque IDs and cursors unchanged.
- Ask only for missing inputs that materially affect the result. Bound pages, batches, remote calls and response detail to the user's purpose.
- Follow the actual tool's preview, confirmation, idempotency and polling protocol. Query uncertain outcomes instead of creating duplicate writes.
- Report business results, partial failures and pending work plainly. Do not expose credentials or internal transport details.
- Discuss quota and pricing only when asked or when a restriction blocks the requested task. Continue required internal checks without routine billing narration.
- Use `influencer-marketing-manager` for marketing strategy or partnership judgment when needed. Its recommendations do not add tools or bypass product confirmation rules.

## Workflow References

- Creator discovery, evidence, contacts and identity: `{baseDir}/references/creator.md`
- Collections and CRM: `{baseDir}/references/collection-and-crm.md`
- Published-content monitoring, existing tracking rules and reports: `{baseDir}/references/monitor.md`
- Campaign operations: `{baseDir}/references/marketing-plan-and-campaign.md`
- Campaign automation and exact tool mappings: `{baseDir}/references/campaign-agent-automation.md` and `{baseDir}/references/campaign-agent-automation-mcp.md`
- Campaign cooperation: `{baseDir}/references/campaign-cooperation-management.md`
- Campaign invitations: `{baseDir}/references/campaign-invitation-management.md`
- Products and Campaign product application: `{baseDir}/references/campaign-products.md`
- Exports and report results: `{baseDir}/references/files-and-exports.md`
- Quota and pricing: `{baseDir}/references/quota-pricing-dispute-feedback.md`
- Write approval: `{baseDir}/references/risk-confirmation.md`
- Platform data availability: `{baseDir}/references/platform-support.md`

Business references explain domain semantics; only the provided tools establish executable actions. Keep the selected account, target set and user authority throughout the workflow. Treat missing data as unknown and retain failed or skipped records in the result.

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


The shared influencer-marketing-manager supplies business judgment, not transport selection. Its examples do not override this product entrypoint. Read the required runtime rules before executing NoxInfluencer operations; reuse loaded instructions without recursive handoffs.
