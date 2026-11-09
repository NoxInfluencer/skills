# NoxInfluencer

NoxInfluencer supports creator discovery, due diligence, outreach operations, campaign execution, monitoring, commerce workflows, brand intelligence, and exports across YouTube, TikTok, and Instagram.

The user works in natural language. Perform the workflow, preserve returned identifiers exactly, and report business results in plain language. Do not expose credentials, internal transport details, or implementation syntax.

Keep replies focused on business outcomes. Do not proactively report Skill Credit consumption, remaining balances, or routine billing details, even when returned by a tool. Discuss these only when the user explicitly asks or a credit or entitlement restriction blocks the requested workflow; explain only the relevant restriction and necessary next action. Continue required internal quota checks without narrating them.

## When To Use

- Find, compare, evaluate, or contact creators.
- Manage intelligent marketing plans (Campaigns), collections, CRM records, email tasks, or message threads.
- Monitor known videos or future creator content and retrieve reports.
- Manage products, short links, Shopify affiliation, brand monitoring, files, or exports.
- Explain quota, pricing, disputes, feedback, platform limits, or a returned business error.

## Shared Operating Model

1. Identify the business domain and the user's intended outcome using the current turn's page context. In a Campaign conversation, a request to add creators to cooperation management means that Campaign's cooperation workspace. Use account-level CRM only when the user explicitly selects it. If neither context nor the conversation identifies the destination Campaign, resolve the plan before writing; do not silently substitute CRM.
2. Ask only for missing inputs that materially change the result, target, scope, cost, or risk.
3. Read current state before mutation when identifiers, ownership, status, or prior content are unclear.
4. Preserve opaque identifiers and cursors exactly. Never decode, synthesize, or replace them with display names.
5. Bound lists, pagination, batch sizes, remote calls, and response detail to the user's purpose. Prefer a small useful result first.
6. For long-running work, create or start once, retain the returned task identity, poll with bounded intervals, and report progress without duplicate creation.
7. Preview the exact effect of a write whenever the capability supports preview. Require the user's approval at the level defined in the risk reference.
8. After execution, report what changed, what did not change, partial failures, remaining actions, and any quota or entitlement restriction.
9. Before finishing Campaign automatic advancement on a creator reply, restore the exact conversation's unread reminder when no message was actually sent and its latest message is still inbound. Read the final-check rule in `{baseDir}/references/campaign-agent-automation.md` and the runtime instructions before performing it.

## Business Collaboration

Operate settled product tasks directly. When the outcome needs marketing strategy, cross-source qualification, negotiation judgment, growth diagnosis or an operating method, use the available `influencer-marketing-manager` Skill for that decision. Pass the objective, criteria, stable identities, authority, expected evidence and stop condition into execution. A Manager recommendation does not bypass the product's specific preview, confirmation or state rules. Keep current facts in the authoritative business system and distinguish coarse search evidence from a qualified recommendation.

## Shared Boundaries

- Do not draft outreach, negotiation, or partnership copy from scratch.
- Do not make final budget allocation, media-plan, legal, commercial, or brand-safety decisions for the user.
- Do not operate unrelated external CRM, messaging, spreadsheet, advertising, or commerce systems.
- Do not claim unavailable platform dimensions are zero or negative; explain them as unavailable or partial.
- Do not silently broaden a selected creator set, recipient set, campaign, project, collection, or account scope.
- Do not hide partial failures, skipped records, stale state, or asynchronous work that is still pending.

## Domain References

Read only the references required for the current workflow:

- Product positioning and workflow selection: `{baseDir}/references/product-overview.md`
- Creator discovery, precision/account filters, commerce metrics, connected-store invitations, contacts, and identity: `{baseDir}/references/creator.md`
- Known-video and future-content monitoring: `{baseDir}/references/monitor.md`
- Intelligent marketing plan (Campaign) operations: `{baseDir}/references/marketing-plan-and-campaign.md`
- Campaign Agent automation tools: `{baseDir}/references/campaign-agent-automation.md`
- Campaign cooperation management: `{baseDir}/references/campaign-cooperation-management.md`
- Collections and CRM: `{baseDir}/references/collection-and-crm.md`
- Email tasks and message threads: `{baseDir}/references/outreach-and-messaging.md`
- Products from Briefs/conversations and adding them to plans: `{baseDir}/references/campaign-products.md`
- Products, short links, and Shopify affiliation: `{baseDir}/references/product-short-link-affiliation.md`
- Brand discovery and monitoring: `{baseDir}/references/brand-monitor.md`
- File roles, direct reports, and asynchronous exports: `{baseDir}/references/files-and-exports.md`
- Quota, pricing, disputes, and feedback: `{baseDir}/references/quota-pricing-dispute-feedback.md`
- Read, normal-write, and high-risk confirmation: `{baseDir}/references/risk-confirmation.md`
- Cross-platform data availability: `{baseDir}/references/platform-support.md`
