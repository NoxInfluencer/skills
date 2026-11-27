# NoxInfluencer

Use the connected NoxInfluencer tools for creator research, collections, CRM, monitoring, intelligent marketing plans (Campaigns), products, exports, quota and pricing. The provided tool list defines the product's supported operations.

## Choose The Available Operation

When the task requires NoxInfluencer account access and the provider is not ready in the current session, first read `{baseDir}/references/oauth-and-scopes.md`. Start with the common host setup and use the confirmed host's guide when it is needed. Loading this Skill and connecting its MCP provider are separate steps.

Read `{baseDir}/references/tool-list.md` as a checked baseline, then use the connected provider's live catalog and schema as the execution authority. The live catalog may extend the baseline. Never invent a missing operation, require it for unrelated work, or switch to another backend.

The installed Agent plugin uses MCP for all NoxInfluencer operations. Follow the shared MCP runtime below for business execution and `{baseDir}/references/handoffs.md` for presentation.

For intelligent marketing-plan task lists, the current business tool is `campaign2_plan_list`. Use its live paging and filter schema, preserve selected filters, and apply the same Handoff policy as every other function. Do not assume a separate page-opening tool or historical tool name is required.

## Business page opening

Open NoxInfluencer business pages only through the corresponding MCP tool's actual, valid `handoff_url`. Do not bypass MCP with an ordinary URL, a constructed or guessed route, a search, or direct browser navigation. Follow `{baseDir}/references/handoffs.md` to reuse an exact view, use the business result's Handoff, or check the declared read-only route for the same target. If that process yields no usable link for a requested page, say "没有相关页面可以打开。" and stop opening the page while returning any verified business result. OAuth, downloads, and original public creator evidence keep their separate rules.

## Working Rules

- Resolve the selected Campaign, collection, CRM scope or monitoring project before writing. Campaign cooperation management and account CRM are distinct destinations.
- Read current state when identity, ownership, status or existing content is unclear. Keep opaque IDs and cursors unchanged.
- Ask only for missing inputs that materially affect the result. Bound pages, batches, remote calls and response detail to the user's purpose.
- Apply `{baseDir}/references/risk-confirmation.md` to ordinary writes, high-risk confirmation, and requests to execute directly. Follow the actual tool's preview, confirmation, idempotency and polling protocol. Query uncertain outcomes instead of creating duplicate writes.
- Report business results, partial failures and pending work plainly. Do not expose credentials or internal transport details.
- Discuss remaining Skill Credit, execution permissions and specific operation costs when asked, when material to a required approval, or when they block the task. Read the quota reference for these cases. Do not offer membership plans, trial claims, upgrades, recharges or purchase links. Continue internal checks without routine billing narration.
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
- Exports and report results: `{baseDir}/references/files-and-exports-mcp.md`
- Quota and pricing: `{baseDir}/references/quota-pricing-dispute-feedback-mcp.md`
- Write approval: `{baseDir}/references/risk-confirmation.md`
- Platform data availability: `{baseDir}/references/platform-support.md`

Business references explain domain semantics; only the provided tools establish executable actions. Keep the selected account, target set and user authority throughout the workflow. Treat missing data as unknown and retain failed or skipped records in the result.
