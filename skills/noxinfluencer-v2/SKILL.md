---
name: noxinfluencer-v2
description: Operate NoxInfluencer V2 creator and Campaign workflows, including setup and access recovery. Use the available supported CLI or MCP connection selected for this V2 workflow; preserve explicitly selected legacy workflows.
---

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
5. Bound lists, pagination, batch sizes, remote calls, and response detail to the user's purpose. Group independent reads with known inputs when the runtime supports it. Use bounded batches within the requested scope and credit budget. Wait for a result when it determines the next target, permission, cursor or choice of evidence. Reuse successful rows after a partial failure.
6. For long-running work, create or start once, retain the returned task identity, poll with bounded intervals, and report progress without duplicate creation.
7. Preview the exact effect of a write whenever the capability supports preview. Require the user's approval at the level defined in the risk reference.
8. After execution, report what changed, what did not change, partial failures, remaining actions, and any quota or entitlement restriction.
9. For a creator-reply automation run, follow the selected runtime's final check when it supports reading the latest message and restoring that conversation's unread reminder. See `{baseDir}/references/campaign-agent-automation.md` for the business rule.

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

## Runtime Selection

This is the V2 product entrypoint. Use the sibling installed `influencer-marketing-manager` for marketing judgment when relevant. That shared Manager does not select a transport or version. Before business execution, return to the currently selected product entrypoint; examples naming the legacy Skill do not change the active V2 workflow. Reuse already loaded rules without recursive handoffs.

Read `{baseDir}/references/setup.md` when installation, connection, or runtime selection is needed. Do not ask a nontechnical customer to choose CLI versus MCP. Select from observed client capabilities, authorized account context, available operations and setup effort. Respect an explicitly selected product or transport. A shell, installed package, provider name or successful authorization alone does not establish business capability.

1. Honor the explicitly selected runtime or retain the runtime and account already selected for the current workflow. If MCP is selected and the connection is not ready, follow `{baseDir}/references/oauth-and-scopes.md`. If CLI is selected and needs setup, follow `{baseDir}/references/auth.md`. Continue through the selected runtime's recovery, including when the other runtime is ready.
2. For a new workflow with no selected runtime, prefer an already connected official NoxInfluencer provider when its live tools support the requested task for the intended account. Otherwise use the isolated V2 CLI if it is installed, authorized for that account, and its live schema covers the task.
3. If neither is ready for the new workflow, follow `{baseDir}/references/setup.md` to choose one available setup path. Prefer MCP when the host can establish the official connection and there is evidence the provider supports the required operation. Choose CLI when its supported installation and operation are the available path. Keep login and approval in the client's normal controls. Continue independent preparation while execution is blocked.

After selecting MCP, read `{baseDir}/references/runtime-mcp.md`. After selecting CLI, read `{baseDir}/references/runtime-cli.md`. The selected runtime determines all tool calls and presentation for the workflow.

In CLI mode, never open or operate NoxInfluencer SaaS pages through an embedded browser, external browser automation, computer use, or a shell browser launcher. Give the user the relevant link for any required manual step, including an explicit request to open a page. Follow the CLI runtime's user-handoff rules. This CLI boundary does not change MCP host-managed authorization or supported page handoffs.

Read only the selected runtime's execution references and the business references needed for the task. Keep that runtime and account for reads, previews, writes, polling and recovery. An authentication, permission, quota, missing-tool or network error does not authorize an automatic backend switch. Before intentionally changing runtimes, resolve outstanding writes and confirm matching identity and target scope. Never resend an uncertain write through the other runtime.

For authorized current-turn attachments use the client's actual file-reading tools and the shared attachment rules. No embedded Agent, sandbox module or private service is required to interpret this Skill.


The shared influencer-marketing-manager supplies business judgment, not transport selection. Its examples do not override this product entrypoint. Read the required runtime rules before executing NoxInfluencer operations; reuse loaded instructions without recursive handoffs.
