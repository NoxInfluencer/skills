---
name: noxinfluencer-mcp
description: Operate NoxInfluencer creator and Campaign workflows through this plugin’s connected MCP provider. Use for product operations in this plugin; explicitly selected standalone workflows keep their own entrypoint.
---

# NoxInfluencer

Use the connected NoxInfluencer tools for creator research, collections, CRM, monitoring, intelligent marketing plans (Campaigns), products, exports, quota and pricing. The provided tool list defines the product's supported operations.

## Choose The Available Operation

Read `{baseDir}/references/tool-list.md` as a checked baseline, then use the connected provider's live catalog and schema as the execution authority. The live catalog may extend the baseline. Never invent a missing operation, require it for unrelated work, or switch to another backend.

When invoked through an installed Agent plugin (Codex, Claude, Cursor, Grok Bot, WorkBuddy, Harness or another host), all NoxInfluencer business operations use MCP and all workflows use Handoff-first presentation. Read `{baseDir}/references/handoffs.md` before presenting results. This policy belongs to the active plugin entrypoint; it does not change separately invoked shared Skills or CLI workflows, even when both installations exist.

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

Every plugin workflow uses Handoff-first presentation, including search, analysis, lists, details, reports and mutation results. Check for a declared Handoff after each MCP response. When the response returns a valid `handoff_url` for the requested view, open it through the host browser as the next action, then resume the remaining work. If the host has no supported browser, present the still-valid, unused link immediately. This timing applies even when shared business guidance describes a different default. Honor explicit conversation-only requests and report presentation failures separately from business results.

Read only the relevant references:

- Presentation decision, live contract discovery and browser handling: `{baseDir}/references/handoffs.md`
- Host-owned authorization and resuming the original request: `{baseDir}/references/oauth-and-scopes.md`
- Business tool execution and confirmation: `{baseDir}/references/tool-execution.md`
- Checked tool baseline; live schemas remain authoritative: `{baseDir}/references/tool-list.md`
- Files and downloads: `{baseDir}/references/resources-and-files.md`

For user attachments follow `{baseDir}/references/campaign-agent-automation.md`. Local attachment reading does not authorize direct backend access or a CLI fallback.


The shared influencer-marketing-manager supplies business judgment, not transport selection. Its examples do not override this product entrypoint. Read the required runtime rules before executing NoxInfluencer operations; reuse loaded instructions without recursive handoffs.
