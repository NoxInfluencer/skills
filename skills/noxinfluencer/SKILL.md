---
name: noxinfluencer
description: Runs NoxInfluencer creator and marketing-ops workflows via CLI, including creator discovery for influencer marketing, creator marketing, UGC, social media marketing, and affiliate marketing; creator evaluation, contact retrieval for external use, video tracking, campaigns, collections, CRM channels, product center, email/message tasks, brand monitoring, and exports. Use when the user needs NoxInfluencer creator discovery, creator evaluation, outreach operations, campaign/collection/CRM/email/product operations, brand monitoring, or account setup.
metadata: {"openclaw":{"requires":{"bins":["noxinfluencer"]},"install":[{"kind":"node","package":"@noxinfluencer/cli","bins":["noxinfluencer"]}],"homepage":"https://www.noxinfluencer.com/skills"}}
---

# NoxInfluencer

Full-workflow creator and marketing-ops skill for influencer discovery, due diligence, platform email outreach, external contact retrieval, campaign video monitoring, campaign/collection operations, CRM/email/message/product-center operations, brand monitoring, and exports across YouTube, TikTok, and Instagram.

The user interacts through natural language. Execute CLI commands yourself and report results in plain language. Never expose raw commands to the user.

## When to Use

- User wants to find, evaluate, or contact creators / influencers / KOLs
- User wants NoxInfluencer campaign, collection, CRM, email/message, product-center, export, or brand-monitor operations
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
- **Browser login**: `noxinfluencer login` opens NoxInfluencer, reuses the SaaS login session, and saves/reuses a non-expiring API key locally
- **Command-tree check**: `noxinfluencer schema --all` must include `campaign`, `collection`, `email`, `message`, `crm`, `product`, `brand-monitor`, `export`, and `agent`
- **Exit codes**: `noxinfluencer agent exit-codes`
- **Preview**: `--dry-run` (shows request without executing)
- **Language routing**: `--lang zh` switches all URLs to `cn.noxinfluencer.com`

## Routing Cheat Sheet

Use `noxinfluencer schema <cmd>` for exact parameters. Prefer broad command families over memorizing flags:

- Creator sourcing: `creator search`, `creator search-filter*`, `creator lookalikes`
- Creator reads: `creator profile/audience/content/cooperation`; use `creator contacts` only for visible/exported contacts
- Monitoring: `monitor list/create/add-task/tasks/history/summary`
- Operations: `campaign`, `collection`, `crm`, `email`, `message`, `product`, `export`
- Brand monitoring: `brand-monitor ...`
- Setup and diagnostics: `login`, `doctor`, `quota`, `pricing`, `agent exit-codes`
- Feedback: `feedback submit/inbox/get`

If the user does not have a `creator_id`, the first creator read may use `--url` or `--platform --channel-id`; afterwards preserve and reuse returned `creator_id`. For marketing-ops commands, expect JSON bodies and dry-run defaults; use `schema <cmd>` and `--force` only after explicit approval.

### User Feedback

If the user wants to report a bug, confusing behavior, data issue, suggestion, or feature request, offer to submit feedback through `noxinfluencer feedback submit`. Ask for a short confirmation before sending. Attach screenshots or logs with `--file` when available. Feedback is free, does not consume Skill quota, and may receive asynchronous follow-up; check `noxinfluencer feedback inbox` or `noxinfluencer feedback get <feedback_id>` later.

---

## 1. Getting Started

Run `noxinfluencer doctor`, then fix only what is missing:

1. No CLI or stale command tree → ask the user to install `@noxinfluencer/cli@latest`; verify with `schema --all`.
2. No API key → prefer `noxinfluencer login`. Manual API-key handoff is fallback only; use `auth --key-stdin`, never argv/logs.
3. Configured → run `quota` and report blocking quota or entitlement issues.

### Quota and Billing

Run `quota` yourself and report the snapshot. API-backed calls may consume Skill quota and may also depend on SaaS-side capability quota or entitlement. If the response includes `action.url`, pass it to the user.

---

## 2. Discovering Creators

Turn an open-ended search into a usable shortlist.

Ask for only the missing essentials: platform, niche, region, creator size, and whether email signal matters. Search directly once the request is specific enough. Multi-platform sourcing requires separate platform searches.

Use `schema creator.search` for flags. Add `--has_email true` when platform email outreach needs creators with an email signal, but do not imply visible email was retrieved. For pagination, reuse the prior filters and `data.search_after`; prefer a JSON body.

### Lookalike Discovery

Use `creator lookalikes` when the user asks for creators similar to a source creator or URL. Treat results as recommendations; save them separately only after the user chooses targets.

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

Manage video monitoring projects and tracked videos. Operational only — manages monitoring, not performance judgment.

List projects first when unclear. Create a project before adding videos. Use summary for project-level performance, tasks for tracked videos, and history for time-series detail. Prefer stable IDs after lookup and preserve returned `creator_id` for later creator reads. Monitoring manages data collection; do not turn it into a creator verdict.

---

## 6. Marketing Ops

Operate NoxInfluencer campaign, collection, CRM, email, message, product-center, and export workflows. Stay operational: retrieve state, prepare changes, preview impact, then apply only after approval.

### Workflow

1. Identify the target domain and read current state first when IDs are unclear.
2. For platform email outreach to creators found in NoxInfluencer, use the email-task path and add recipients by `creator_id`; do not retrieve contacts first. See the CLI schema and `{baseDir}/references/marketing-ops.md`.
3. Use `message send` or `message schedule` only for existing `thread_id` replies. If no thread exists, offer the email-task path for platform creators.
4. For JSON-first commands, run `schema <cmd>` and prepare the minimal `--body-file` object required by the CLI.
5. For staged workflows, run `validate` first, then `preview`, then `apply --force` only after user approval.
6. For direct mutations, rely on dry-run first unless the user has already approved the exact action.
7. For search-result or email-recipient deduplication, use the matching `... options` command first, then apply only the returned schema/body patch that matches the user's intent.
8. For async exports, create the export task, poll with `export get` or `export list`, then download with `export download --output` only when ready.

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

For API-backed failures (`quota`, `pricing`, `creator`, `monitor`, `campaign`, `collection`, `email`, `message`, `crm`, `brand-monitor`, `export`), use the CLI response's `action` field when present:
- `action.url` — where the user should go
- `action.hint` — what to do

Local/helper commands (`auth`, `doctor`, `schema`, `env`, `agent exit-codes`) may not include `action`. Read their native output directly instead of assuming the API error envelope.

For unexpected failures, run `doctor` as a first diagnostic step.

## References

- `{baseDir}/references/cli-response-format.md` — response envelope differences and error action handling
- `{baseDir}/references/marketing-ops.md` — campaign, collection, CRM, email/message, export workflows and mutation guardrails
- `{baseDir}/references/brand-monitor.md` — brand monitor routing, YouTube-only product signals, export boundaries
- `{baseDir}/references/platform-support.md` — data availability by platform
- `{baseDir}/references/search-filters.md` — filter selection by user intent
- `{baseDir}/references/verdict-heuristics.md` — detailed due-diligence rules and output structure
