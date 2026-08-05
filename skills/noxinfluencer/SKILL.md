---
name: noxinfluencer
description: Runs NoxInfluencer creator and marketing-ops workflows via CLI for influencer marketing, creator marketing, UGC, social media marketing, and affiliate marketing, including creator discovery and result exports; evaluation; external contacts; known-video and future-content monitoring; spreadsheet imports/reports; campaigns, collections, CRM, product center, short links, Shopify affiliation, email/message tasks, files, brand monitoring, and exports. Use for NoxInfluencer creator research, outreach operations, campaign/CRM/email/product/affiliate workflows, monitoring, files, or account setup.
metadata: {"openclaw":{"requires":{"bins":["noxinfluencer"]},"install":[{"kind":"node","package":"@noxinfluencer/cli","bins":["noxinfluencer"]}],"homepage":"https://www.noxinfluencer.com/skills"}}
---

# NoxInfluencer

Full-workflow creator and marketing-ops skill for discovery, due diligence, platform email outreach, external contacts, known-video and future-content monitoring, spreadsheet/file workflows, operations, brand monitoring, and exports across YouTube, TikTok, and Instagram.

The user interacts through natural language. Execute CLI commands yourself and report results in plain language. Never expose raw commands to the user.

## When to Use

- User wants to find, evaluate, or contact creators / influencers / KOLs
- User wants NoxInfluencer campaign, collection, CRM, email/message, product-center, short-link, affiliate, export, or brand-monitor operations
- User needs to set up NoxInfluencer access or check quota
- User wants to monitor video campaign performance
- User hits an auth, quota, or CLI error

## What This Skill Does Not Do

- Draft outreach emails, negotiation copy, or partnership messages from scratch
- Send email/message tasks or update CRM records without explicit user approval
- Make final campaign budget allocation, media-plan, or partnership decisions
- Generate creative briefs or interpret video content beyond available platform metrics
- Operate external CRM, email, messaging, spreadsheet, or ad platforms outside NoxInfluencer
- Replace legal or commercial review of contracts, disputes, or brand-safety decisions

## Core Principles

### Agent-First

The user does not operate the CLI. You do. Run commands silently, tell the user the result. Only share URLs when the user needs to take action in a browser (sign in, register, authorize CLI login, subscribe).

### CLI Self-Description

The CLI is self-describing — use it instead of memorizing parameters:

- **Parameters**: `noxinfluencer schema <cmd>` (e.g., `schema creator.search`; quoted path form `schema 'creator search'` also works)
- **Help**: `noxinfluencer <cmd> --help`
- **Diagnostics**: `noxinfluencer doctor`
- **Cost planning**: `noxinfluencer pricing tools --charged-only` shows current server-side Skill Credit prices; `noxinfluencer quota usage --days 7` reviews recent consumption
- **Login**: direct terminals can run `noxinfluencer login`; Agents/remote terminals use `login start --json` and `login wait <login_id>` (the CLI returns the user-safe authorization URL and code)
- **Command-tree check**: `noxinfluencer schema --all` must include `creator`, `monitor`, `campaign`, `collection`, `email`, `message`, `crm`, `product`, `short-link`, `affiliation`, `brand-monitor`, `dispute`, `export`, `file`, `feedback`, `quota`, `pricing`, and `agent`
- **Exit codes**: `noxinfluencer agent exit-codes`
- **Preview**: `--dry-run` (shows request without executing)
- **Language routing**: `--lang zh` switches all URLs to `cn.noxinfluencer.com`

## Routing Cheat Sheet

Use `noxinfluencer schema <cmd>` for exact parameters. Prefer broad command families over memorizing flags:

- Creator sourcing: `creator search`, `creator search-filter*`, `creator not-interested ...`, `creator lookalikes`, `creator export*`, `creator lookalikes-export`
- Creator reads: `creator profile/audience/content/cooperation`; use `creator contacts` only for visible/exported contacts
- Monitoring: `monitor list/create/add-task/import-*/tasks/history/summary/report*`; use `monitor auto-track ...` for newly published creator content
- Operations: `campaign`, `collection`, `crm`, `email`, `message`, `product`, `short-link`, `affiliation`, `export`, `file`
- Brand monitoring: `brand-monitor ...`
- Creator dispute due diligence: `dispute records/search/mine/get/report/update/withdraw`
- Setup, quota, and pricing: `login`, `doctor`, `quota`, `quota usage`, `pricing`, `pricing tools`, `agent exit-codes`
- Feedback: `feedback submit/inbox/get`

If the user does not have a `creator_id`, the first creator read may use `--url` or `--platform --channel-id`; afterwards preserve and reuse returned `creator_id`. For marketing-ops commands, expect JSON bodies and dry-run defaults; use `schema <cmd>` and `--force` only after explicit approval.

### User Feedback

If the user wants to report a bug, confusing behavior, data issue, suggestion, or feature request, offer to submit feedback through `noxinfluencer feedback submit`. Ask for a short confirmation before sending. Attach screenshots or logs with `--file` when available. Feedback is free, does not consume Skill quota, and may receive asynchronous follow-up; check `noxinfluencer feedback inbox` or `noxinfluencer feedback get <feedback_id>` later.

### Creator Disputes

Use `feedback` for product, data, or CLI issues. Use `dispute` only for a concrete creator collaboration breach or due-diligence concern. Before a new report, run `dispute records <creator_id>` when available, require concrete screenshot evidence, and get explicit approval before report/update/withdraw. Private reports hide their description and evidence publicly, but not their type/count. This feature requires paid membership and consumes no Skill Credit; use `dispute options` or `schema dispute.report` for the current fields.

---

## 1. Getting Started

Run `noxinfluencer doctor`, then fix only what is missing:

1. No CLI or stale command tree → ask the user to install `@noxinfluencer/cli@latest`; verify with `schema --all`.
2. No API key → use Device Flow. For an Agent or remote terminal, run `noxinfluencer login start --json`, give the user `verification_uri_complete` and `user_code`, then run `noxinfluencer login wait <login_id>` after authorization. On a direct terminal, `noxinfluencer login` does this in one command. `login --browser` is only for a local loopback callback. Manual API-key handoff is fallback only; use `auth --key-stdin`, never argv/logs or expose `device_code`.
3. Configured → run `quota` and report blocking quota or entitlement issues.

### Quota and Billing

Run `quota` yourself and report the snapshot. For cost planning or optimization, use `pricing tools --charged-only` for current per-action prices and `quota usage` for historical consumption. API-backed calls may consume Skill quota and may also depend on SaaS-side capability quota or entitlement. If the response includes `action.url`, pass it to the user.

---

## 2. Discovering Creators

Turn an open-ended search into a usable shortlist.

Ask for only the missing essentials: platform, niche, region, creator size, and whether email signal matters. Search directly once the request is specific enough. Multi-platform sourcing requires separate platform searches.

Use `schema creator.search` for flags. Search a known creator name/handle with `--creator_name`; use `--keywords` for topic discovery, never both. Put user-specified unwanted topics in `exclude_keywords`, and apply the SaaS cooperation, CRM communication, contacted-scope, and collection filters in the same search. Use `creator search-filter-options` when the matching patch is unclear; standalone `search-filter` is only for an already returned page. Add `--has_email true` when platform email outreach needs creators with an email signal, but do not imply visible email was retrieved. For pagination, reuse the prior filters and `data.search_after`; prefer a JSON body.

Only run `creator not-interested add` when the user explicitly asks to mark that creator as Not interested. Treat it as an approved, reversible mutation; a weak match or noisy result alone is not approval.

Creator search and lookalike discovery charge by returned creator count, not by a fixed page request. Check `pricing tools --action creator_search` or `--action creator_lookalikes` when the user asks about cost. Default to smaller, purposeful pages for exploration; use larger pages only when the user asks for a broad shortlist or bulk follow-up.

### Lookalike Discovery

Use `creator lookalikes` when the user asks for creators similar to a source creator or URL. Treat results as recommendations, use the returned opaque `creator_id` values directly, and save them separately only after the user chooses targets.

### Selected Result Exports

Use `creator export` or `creator lookalikes-export` only after the user selects 1-100 returned `data.items[].id` values. Base mode uses standard SaaS columns; deep mode requires supported `field_keys`. Preserve lookalike `data.export_context` unchanged. Run deep `creator export-preview` first to estimate business quota without creating a task or consuming Skill Credit. Contact fields can consume contact quota. Poll approved export tasks through shared `export` commands.

### Shortlist Presentation

Present 3–5 comparable candidates first: name, platform, size, performance, geography, tags, and why they match. If results are noisy, ask for one narrowing filter. Preserve `creator_id` for follow-up actions.

---

## 3. Analyzing Creators

Help the user decide whether a creator is worth pursuing. Lead with a verdict, not a wall of numbers.

Prefer `creator_id` from prior results. Check the user's requested concern first; otherwise use profile → audience → content → cooperation. Use `--detail` only when deeper evidence is needed, and skip platform-limited dimensions unless relevant. Return verdict first, then evidence.

### Verdict Framework

Use one of four conclusions: high-priority, viable with risks, needs manual review, or not a priority. Always surface dispute/negative cooperation signals. See `{baseDir}/references/verdict-heuristics.md` for detailed heuristics.

---

## 4. Retrieving Contacts

Retrieve visible contact info only when the user explicitly wants exported contact details, external outreach, or to use email outside NoxInfluencer.

Strong rule: platform email outreach must not call `creator contacts` unless the user explicitly asks for visible/exported contact info. Use search/profile `creator_id` values in `email recipients add/replace`. If the user vaguely asks to "find emails and send", default to platform email and mention that exporting visible emails uses extra contact quota. Email sending may still consume the email service's own quota.

When contacts are explicitly needed, run `creator contacts` for the selected creator and return only the visible contact info plus quality signal. If email is missing or low-confidence, say so plainly. Do not add outreach recommendations or restate creator metrics.

---

## 5. Tracking Performance

Manage video monitoring projects and tracked content. Operational only — manages monitoring, not performance judgment.

List projects first when unclear. For known published URLs, use `monitor add-task` or the SaaS template/import path. Use summary for project-level performance, tasks for tracked videos, and history for time-series detail. Preserve stable IDs and returned `creator_id` values. Use monitor report commands for direct SaaS Excel downloads, not shared async export polling.

For ongoing creator monitoring, use `monitor auto-track`. Its Excel import validates every row before creating one rule; if it returns `failed_items`, fix the workbook and retry because no partial rule was created.

---

## 6. Marketing Ops

Operate NoxInfluencer campaign, collection, CRM, email, message, product-center, short-link, affiliation, and export workflows. Stay operational: retrieve state, prepare changes, preview impact, then apply only after approval.

### Workflow

1. Identify the target domain and read current state first when IDs are unclear.
2. For platform email outreach to creators found in NoxInfluencer, use the email-task path and add recipients by `creator_id`; do not retrieve contacts first. Standalone `email create/update` must not include `campaign_id`; manage intelligent Campaign email in SaaS until Campaign supports multiple email tasks. Discover bound senders with `email sender list [task_id]`; never ask the user to inspect browser Network for sender IDs. See the CLI schema and `{baseDir}/references/marketing-ops.md`.
3. Use `message send` or `message schedule` only for existing `thread_id` replies. If no thread exists, offer the email-task path for platform creators. For an explicit whole-conversation archive, use `message archive`; never substitute `crm archive`.
4. For JSON-first commands, run `schema <cmd>` and prepare the minimal `--body-file` object required by the CLI.
5. For staged workflows, run `validate` first, then `preview`, then `apply --force` only after user approval.
6. For direct mutations, rely on dry-run first unless the user has already approved the exact action.
7. For new creator searches, use integrated exclusions/hide rules; keep standalone `creator search-filter` for an existing page. Email-recipient deduplication remains task-scoped through its `filter` commands.
8. Use `short-link` for normal Nox short links only; use `affiliation` for Shopify affiliate campaigns, members, tracking links, discount codes, and performance reads.
9. If Shopify store authorization is missing, send the user to SaaS; do not try to authorize stores inside the Skill.
10. For creator, collection, CRM, and brand-monitor async exports, create the task, poll with `export get` or `export list`, then use `export download --output` only when ready.
11. Monitor, short-link, and affiliation Excel reports download directly to `--output`; do not poll them through shared export tasks.
12. Keep SaaS spreadsheet templates, import `failed_items`, public image URLs, and private attachments distinct. Use `file image upload` for public rich-text images and attachment commands for authorized private files.

Do not draft outreach copy. If the user asks to send or schedule an email task or message, confirm the task/thread, recipients, sender, scheduled time, and content are already approved.

See `{baseDir}/references/marketing-ops.md` for domain routing, mutation guardrails, and export handling.

---

## 7. Brand Monitoring

Use brand-monitor commands for owned/competitor brand analysis and brand asset exports. This is distinct from creator due diligence: it starts from `brand_id`, not `creator_id`.

### Workflow

1. List or get brand monitors when `brand_id` is unclear.
2. Use matrix/strategy reads for brand-level analysis: competition, cooperation, influencer portrait, defense gap, and product signals.
3. Use asset list commands for raw influencer/content/tag/product rows; these are JSON-first and usually require `--body-file`.
4. Product signal commands currently support YouTube only. Do not run them for TikTok or Instagram unless the CLI schema later shows support.
5. Use export commands for downloadable brand assets; follow up through shared `export` commands.
6. Treat `add`, `unlock-base`, `unlock-high`, and all `*-export` commands as mutations or async job creation: dry-run first, `--force` only after approval.

See `{baseDir}/references/brand-monitor.md` for command routing and platform boundaries.

---

## Error Handling

For API-backed failures (`quota`, `pricing`, `creator`, `monitor`, `campaign`, `collection`, `email`, `message`, `crm`, `product`, `short-link`, `affiliation`, `brand-monitor`, `dispute`, `export`, `file`, `feedback`), use the CLI response's `action` field when present:
- `action.url` — where the user should go
- `action.hint` — what to do

Local/helper commands (`auth`, `doctor`, `schema`, `env`, `agent exit-codes`) may not include `action`. Read their native output directly instead of assuming the API error envelope.

For unexpected failures, run `doctor` as a first diagnostic step.

## References

- `{baseDir}/references/cli-response-format.md` — response envelope differences and error action handling
- `{baseDir}/references/marketing-ops.md` — campaign, spreadsheet, file, email/message, report/export workflows and mutation guardrails
- `{baseDir}/references/brand-monitor.md` — brand monitor routing, YouTube-only product signals, export boundaries
- `{baseDir}/references/platform-support.md` — data availability by platform
- `{baseDir}/references/search-filters.md` — filter selection by user intent
- `{baseDir}/references/verdict-heuristics.md` — detailed due-diligence rules and output structure
