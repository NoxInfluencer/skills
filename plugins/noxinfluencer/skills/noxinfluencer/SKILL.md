---
name: noxinfluencer
description: Runs NoxInfluencer creator and marketing-operations workflows through the connected NoxInfluencer MCP provider inside the Codex Plugin. Covers creator discovery and exports; evaluation; contacts; monitoring; spreadsheet workflows; campaigns, collections, CRM, product center, short links, Shopify affiliation, email/message tasks, files, brand monitoring, and exports. Use only for NoxInfluencer capabilities exposed by the connected MCP provider.
---

# NoxInfluencer

Full-workflow creator and marketing-ops skill for discovery, due diligence, platform email outreach, external contacts, known-video and future-content monitoring, spreadsheet/file workflows, operations, brand monitoring, and exports across YouTube, TikTok, and Instagram.

The user interacts through natural language. Call the connected MCP Tools yourself, preserve the workflow's safety rules, and report results in plain language. Never expose raw commands, credentials, or internal transport details to the user.

## MCP Runtime Contract

- Use only the connected `noxinfluencer` MCP provider for every NoxInfluencer operation.
- Read `{baseDir}/references/mcp-runtime.md` before the first business operation and use the provider's live Tool descriptions and input schemas as authoritative.
- Follow the one-attempt Codex Host OAuth bootstrap when the explicitly invoked Plugin has loaded no `noxinfluencer` Tools at all and no transport failure is known, or when the MCP connection or Tool call explicitly returns `AuthRequired` or HTTP `401`. Do not bootstrap merely because one business Tool is absent while any `noxinfluencer` Tool is already loaded. Never switch to a CLI backend.
- After successful authorization and a refreshed Tool catalog, report a capability as unavailable when the provider still does not expose it. Do not invent a Tool or silently use another backend.
- Keep all workflow sequencing, approval, mutation, quota, and reporting rules unchanged while translating business capabilities into MCP Tool calls.

## When to Use

- User wants to find, evaluate, or contact creators / influencers / KOLs
- User wants NoxInfluencer campaign, collection, CRM, email/message, product-center, short-link, affiliate, export, or brand-monitor operations
- User needs to set up NoxInfluencer access or check quota
- User wants to monitor video campaign performance
- User hits an auth, quota, or MCP Tool error

## What This Skill Does Not Do

- Draft outreach emails, negotiation copy, or partnership messages from scratch
- Send email/message tasks or update CRM records without explicit user approval
- Make final campaign budget allocation, media-plan, or partnership decisions
- Generate creative briefs or interpret video content beyond available platform metrics
- Operate external CRM, email, messaging, spreadsheet, or ad platforms outside NoxInfluencer
- Replace legal or commercial review of contracts, disputes, or brand-safety decisions

## Core Principles

### Agent-First

The user does not operate the MCP transport. Call the selected Tool yourself, tell the user the business result, and only share URLs when the user needs to take action in a browser.

## Capability Routing

Use the connected provider's Tool names and input schemas for creator search, creator reads, monitoring, campaigns, collections, CRM, email, messaging, products, short links, affiliation, exports, files, brand monitoring, disputes, feedback, quota, and pricing. Preserve stable identifiers, pagination state, dry-run/preview semantics, and explicit approval requirements. If a requested capability is not present in the live Tool catalog, report that limitation instead of guessing a replacement.

If the user does not have a `creator_id`, use the provider's supported URL, platform/channel, or search inputs to establish one; afterwards preserve and reuse the returned identifier. For structured Tool inputs, send only the fields required by the live schema and apply write/preview/force semantics as the Tool defines them.

### User Feedback

If the user wants to report a bug, confusing behavior, data issue, suggestion, or feature request, use a feedback Tool only when the connected provider exposes one. Ask for a short confirmation before sending and preserve any returned follow-up identifier.

### Creator Disputes

Use feedback for product or data issues, and disputes only for a concrete creator collaboration breach or due-diligence concern. Before a new report, use the provider's dispute-record Tool when available, require concrete screenshot evidence, and get explicit approval before report/update/withdraw. Private reports hide their description and evidence publicly, but not their type/count. This feature requires paid membership and consumes no Skill Credit.

---

## 1. Getting Started

Start with the requested MCP business Tool when it is available. If the explicitly invoked Plugin has loaded no `noxinfluencer` Tools at all and no transport failure is known, or the connection returns `AuthRequired`/`401`, mark authorization as attempted for this user request and actively start the Codex Host OAuth flow exactly once:

- Windows: run `powershell -NoProfile -ExecutionPolicy Bypass -File "{baseDir}/scripts/start-codex-oauth.ps1"`.
- macOS/Linux: run `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user` when `codex` is independently executable. The registration value is case-sensitive.

The packaged helper and `codex mcp login` invoke Codex Host MCP OAuth. The Host owns DCR, PKCE, state, loopback callback, external-browser launch, and Token storage. Never construct an `/authorize` URL or handle OAuth credentials in the Skill. The provider-wide zero-Tool condition is a first-connection bootstrap signal; a single missing business Tool while another `noxinfluencer` Tool is loaded is not. If the one automatic attempt cannot start, direct the user to NoxInfluencer **Connect/Re-authorize** in Codex settings without trying to reproduce OAuth yourself. After authorization, recheck the MCP Tool catalog and retry the original business operation when the Tool is available. If the current task cannot refresh its Tool catalog, tell the user to create a new Codex task and resend the original request. Failed initialization with an explicit connection refusal, timeout, or server error is not an OAuth signal; report it directly. Report an incomplete rollout when a successfully initialized and refreshed catalog still lacks the required Tool. Follow `{baseDir}/references/mcp-runtime.md` for cancellation, `403`, command failure, and retry rules.

### Quota and Billing

When the connected provider exposes quota or pricing Tools, retrieve the current snapshot and report blocking quota or entitlement issues. API-backed calls may consume Skill quota and may also depend on SaaS-side capability quota or entitlement. Surface a server-provided action URL when present.

---

## 2. Discovering Creators

Turn an open-ended search into a usable shortlist.

Ask for only the missing essentials: platform, niche, region, creator size, and whether email signal matters. Search directly once the request is specific enough. Multi-platform sourcing requires separate platform searches.

Use the live creator-search Tool schema for exact inputs. Search a known creator name/handle with the provider's name field; use keyword inputs for topic discovery, never both. Put user-specified unwanted topics in `exclude_keywords`, and apply the SaaS cooperation, CRM communication, contacted-scope, and collection filters in the same search. Use the provider's search-filter options when the matching patch is unclear; apply returned pagination state without dropping the original filters. Add the provider's email-signal filter when platform email outreach needs creators with an email signal, but do not imply visible email was retrieved.

Only call the creator Not-interested mutation when the user explicitly asks to mark that creator as Not interested. Treat it as an approved, reversible mutation; a weak match or noisy result alone is not approval.

Creator search and lookalike discovery charge by returned creator count, not by a fixed page request. When the provider exposes pricing, check the current unit price when the user asks about cost. Default to smaller, purposeful pages for exploration; use larger pages only when the user asks for a broad shortlist or bulk follow-up.

### Lookalike Discovery

Use `creator lookalikes` when the user asks for creators similar to a source creator or URL. Treat results as recommendations, use the returned opaque `creator_id` values directly, and save them separately only after the user chooses targets.

### Selected Result Exports

Use the provider's creator export or lookalike-export Tool only after the user selects 1-100 returned `data.items[].id` values. Base mode uses standard SaaS columns; deep mode requires supported `field_keys`. Preserve lookalike `data.export_context` unchanged. Run the provider's export preview first to estimate business quota without creating a task or consuming Skill Credit. Contact fields can consume contact quota. Poll approved export tasks through the provider's export status/download Tools.

### Shortlist Presentation

Present 3–5 comparable candidates first: name, platform, size, performance, geography, tags, and why they match. If results are noisy, ask for one narrowing filter. Preserve `creator_id` for follow-up actions.

---

## 3. Analyzing Creators

Help the user decide whether a creator is worth pursuing. Lead with a verdict, not a wall of numbers.

Prefer `creator_id` from prior results. Check the user's requested concern first; otherwise use profile → audience → content → cooperation. Use the provider's detail/depth input only when deeper evidence is needed, and skip platform-limited dimensions unless relevant. Return verdict first, then evidence.

### Verdict Framework

Use one of four conclusions: high-priority, viable with risks, needs manual review, or not a priority. Always surface dispute/negative cooperation signals. See `{baseDir}/references/verdict-heuristics.md` for detailed heuristics.

---

## 4. Retrieving Contacts

Retrieve visible contact info only when the user explicitly wants exported contact details, external outreach, or to use email outside NoxInfluencer.

Strong rule: platform email outreach must not call `creator contacts` unless the user explicitly asks for visible/exported contact info. Use search/profile `creator_id` values in `email recipients add/replace`. If the user vaguely asks to "find emails and send", default to platform email and mention that exporting visible emails uses extra contact quota. Email sending may still consume the email service's own quota.

When contacts are explicitly needed, call the provider's creator-contacts Tool for the selected creator and return only the visible contact info plus quality signal. If email is missing or low-confidence, say so plainly. Do not add outreach recommendations or restate creator metrics.

---

## 5. Tracking Performance

Manage video monitoring projects and tracked content. Operational only — manages monitoring, not performance judgment.

List projects first when unclear. For known published URLs, use the provider's monitor task or SaaS template/import capability. Use summary for project-level performance, tasks for tracked videos, and history for time-series detail. Preserve stable IDs and returned `creator_id` values. Use monitor report Tools for direct SaaS Excel downloads, not shared async export polling.

For ongoing creator monitoring, use `monitor auto-track`. Its Excel import validates every row before creating one rule; if it returns `failed_items`, fix the workbook and retry because no partial rule was created.

---

## 6. Marketing Ops

Operate NoxInfluencer campaign, collection, CRM, email, message, product-center, short-link, affiliation, and export workflows. Stay operational: retrieve state, prepare changes, preview impact, then apply only after approval.

### Workflow

1. Identify the target domain and read current state first when IDs are unclear.
2. For platform email outreach to creators found in NoxInfluencer, use the email-task capability and add recipients by `creator_id`; do not retrieve contacts first. Standalone email create/update must not include `campaign_id`; manage intelligent Campaign email in SaaS until Campaign supports multiple email tasks. Discover bound senders with the provider's sender-list Tool; never ask the user to inspect browser Network for sender IDs. See `{baseDir}/references/marketing-ops.md`.
3. Use message-send or message-schedule only for existing `thread_id` replies. If no thread exists, offer the email-task path for platform creators. For an explicit whole-conversation archive, use the provider's message-archive Tool; never substitute CRM archive.
4. For structured Tool inputs, inspect the live input schema and send the minimal object required by the provider.
5. For staged workflows, call validate first, then preview, then apply only after user approval.
6. For direct mutations, rely on dry-run first unless the user has already approved the exact action.
7. For new creator searches, use integrated exclusions/hide rules; use a standalone search-filter capability only for an existing page. Email-recipient deduplication remains task-scoped through the provider's filter capabilities.
8. Use `short-link` for normal Nox short links only; use `affiliation` for Shopify affiliate campaigns, members, tracking links, discount codes, and performance reads.
9. If Shopify store authorization is missing, send the user to SaaS; do not try to authorize stores inside the Skill.
10. For creator, collection, CRM, and brand-monitor async exports, create the task, poll with the provider's export status capability, then download only when ready.
11. Monitor, short-link, and affiliation Excel reports use their direct report-download capability; do not poll them through shared export tasks.
12. Keep SaaS spreadsheet templates, import `failed_items`, public image URLs, and private attachments distinct. Use the provider's typed file/image and attachment capabilities according to their live schemas.

Do not draft outreach copy. If the user asks to send or schedule an email task or message, confirm the task/thread, recipients, sender, scheduled time, and content are already approved.

See `{baseDir}/references/marketing-ops.md` for domain routing, mutation guardrails, and export handling.

---

## 7. Brand Monitoring

Use the provider's brand-monitor capabilities for owned/competitor brand analysis and brand asset exports. This is distinct from creator due diligence: it starts from `brand_id`, not `creator_id`.

### Workflow

1. When `brand_id` is unclear, use `search` for a known brand name, `rank` for category/market discovery, and `list` only for this account's monitored, unlocked, or sample brands; use `get` after selecting an ID.
2. Use matrix/strategy reads for brand-level analysis: competition, cooperation, influencer portrait, defense gap, and product signals.
3. Use asset-list Tools for raw influencer/content/tag/product rows; inspect their live schemas before building selectors.
4. Product signal capabilities currently support YouTube only. Do not call them for TikTok or Instagram unless the provider explicitly exposes support.
5. Use the provider's export capabilities for downloadable brand assets; follow up through shared export status/download Tools.
6. Treat add, unlock, and export capabilities as mutations or async job creation: preview first, apply only after approval.

See `{baseDir}/references/brand-monitor.md` for Tool routing and platform boundaries.

---

## Error Handling

Follow `{baseDir}/references/mcp-runtime.md`; never switch backends for an MCP authentication, authorization, business, or dependency error.

For provider failures in quota, pricing, creator, monitor, campaign, collection, email, message, CRM, product, short-link, affiliation, brand-monitor, dispute, export, file, or feedback capabilities, surface the provider's structured error and any server-provided action URL or hint:
- `action.url` — where the user should go
- `action.hint` — what to do

Do not assume every Tool uses the same response envelope; follow the live Tool description and preserve opaque error codes and identifiers.

For unexpected failures, inspect the provider's Tool error and connection state first. Do not run a local CLI diagnostic.

## References

- `{baseDir}/references/runtime-routing.md` — mandatory MCP-only routing and no-fallback rules
- `{baseDir}/references/mcp-runtime.md` — MCP Tool execution, OAuth, error handling, and Browser Handoff
- `{baseDir}/references/marketing-ops.md` — campaign, spreadsheet, file, email/message, report/export workflows and mutation guardrails
- `{baseDir}/references/brand-monitor.md` — brand monitor routing, YouTube-only product signals, export boundaries
- `{baseDir}/references/platform-support.md` — data availability by platform
- `{baseDir}/references/search-filters.md` — filter selection by user intent
- `{baseDir}/references/verdict-heuristics.md` — detailed due-diligence rules and output structure
