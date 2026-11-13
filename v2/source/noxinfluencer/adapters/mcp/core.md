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
- Discuss remaining Skill Credit, execution permissions and specific operation costs only when asked or blocked. Read the quota reference for these cases. Do not offer membership plans, trial claims, upgrades, recharges or purchase links. Continue required internal checks without routine billing narration.
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
