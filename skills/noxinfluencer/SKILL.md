---
name: noxinfluencer
description: Discovers creators, performs due-diligence analysis, retrieves contacts, manages account/quota, and tracks video campaigns across YouTube, TikTok, and Instagram via the NoxInfluencer CLI. Use when the user needs to find, evaluate, contact, or monitor creators for influencer marketing.
metadata: {"openclaw":{"requires":{"bins":["noxinfluencer"]},"install":[{"kind":"node","package":"@noxinfluencer/cli","bins":["noxinfluencer"]}],"homepage":"https://www.noxinfluencer.com"}}
---

# NoxInfluencer

Full-workflow influencer marketing skill: account setup → creator discovery → due-diligence analysis → contact retrieval → video performance monitoring.

The user interacts through natural language. Execute CLI commands yourself and report results in plain language. Never expose raw commands to the user.

## When to Use

- User wants to find, evaluate, or contact creators / influencers / KOLs
- User needs to set up NoxInfluencer access or check quota
- User wants to monitor video campaign performance
- User hits an auth, quota, or CLI error

## What This Skill Does Not Do

- Draft outreach emails, negotiation copy, or partnership messages
- Send email, update a CRM, or operate external messaging platforms
- Make final campaign budget allocation or media-plan decisions
- Generate creative briefs or interpret video content beyond available platform metrics
- Replace legal or commercial review of contracts, disputes, or brand-safety decisions

## Core Principles

### Agent-First

The user does not operate the CLI. You do. Run commands silently, tell the user the result. Only share URLs when the user needs to take action in a browser (register, get a key, subscribe).

### CLI Self-Description

The CLI is self-describing — use it instead of memorizing parameters:

- **Parameters**: `noxinfluencer schema <cmd>` (e.g., `schema creator.search`; quoted path form `schema 'creator search'` also works)
- **Help**: `noxinfluencer <cmd> --help`
- **Diagnostics**: `noxinfluencer doctor`
- **Preview**: `--dry-run` (shows request without executing)
- **Language routing**: `--lang zh` switches all URLs to `cn.noxinfluencer.com`

## Command Quick Reference

| User intent | CLI command |
|-------------|-------------|
| Search creators | `noxinfluencer creator search` |
| Creator overview | `noxinfluencer creator profile <creator_id>` |
| Audience analysis | `noxinfluencer creator audience <creator_id>` |
| Content analysis | `noxinfluencer creator content <creator_id>` |
| Cooperation / pricing signals | `noxinfluencer creator cooperation <creator_id>` |
| Get contact info | `noxinfluencer creator contacts <creator_id>` |
| Check quota | `noxinfluencer quota` |
| Check setup health | `noxinfluencer doctor` |
| Check membership plans | `noxinfluencer pricing` |
| Inspect exact flags | `noxinfluencer schema <cmd>` |
| List monitoring projects | `noxinfluencer monitor list` |
| Create monitoring project | `noxinfluencer monitor create` |
| Add monitored video | `noxinfluencer monitor add-task` |
| List monitored videos | `noxinfluencer monitor tasks` |
| Get project summary | `noxinfluencer monitor summary` |

Add `--detail` for expanded creator analysis when the user needs deeper evidence. Add `--lang zh` for Chinese users. Use `schema <cmd>` when you need exact flags or required fields.

---

## 1. Getting Started

Run `noxinfluencer doctor` first to check the current state. Guide through only what's missing:

1. **No CLI installed** → Tell user: "Run `npm install -g @noxinfluencer/cli` in your terminal." (the one step they must do themselves)
2. **No API key** → Use `doctor` output and CLI hints to tell them they need an API key and point them to the dashboard or signup flow. Once they have a key, configure it yourself. Prefer `noxinfluencer auth --key-stdin` so the key does not appear in argv, logs, or echoed output.
3. **Everything configured** → Run `quota`, tell them the current Skill quota snapshot and any obvious blocking issues.

### Quota and Billing

Run `quota` yourself and report the current Skill quota snapshot.

Important:

- Any API-backed skill call can consume the account's remaining Skill quota
- The same call may also depend on underlying SaaS-side quota or entitlement for that capability
- A request can therefore fail because Skill quota is exhausted, or because the underlying SaaS quota / permission is unavailable

If quota is low or exhausted, the error response's `action` field includes the billing URL. Pass it to the user.

---

## 2. Discovering Creators

Turn an open-ended search into a usable shortlist.

### Clarification Strategy

Do not search immediately if the request is too broad. Ask for 2–3 critical filters at a time:

1. **Platform** — YouTube, TikTok, or Instagram?
2. **Niche / keywords** — what content area?
3. **Region** — which countries or markets?
4. **Creator size** — follower range?
5. **Contactability** — does email availability matter?

Stop asking once the request is specific enough. If the user provided most filters upfront, search directly.

### Search Execution

Use `noxinfluencer schema creator.search` to discover available filter parameters. The quoted single-argument form `noxinfluencer schema 'creator search'` is equivalent. Key decisions:

- Multi-platform requests require separate searches per platform
- Add `--has_email true` when the user's intent is commercial outreach
- Start with one search, refine if results are too noisy

See `{baseDir}/references/search-filters.md` for filter selection semantics by user intent.

### Shortlist Presentation

Present results as a visible, comparable shortlist — not a raw JSON dump.

For each candidate: nickname, platform, followers, engagement rate, average views, country, top tags.

Rules:
- 3–5 candidates first
- Make rows easy to compare at a glance
- If results are noisy, say so and ask for one more narrowing filter
- State if `--has_email true` was used, but do not imply email was already retrieved
- Include: why candidates match, filters applied, the next-step suggestion, and remaining Skill quota when the response includes it and it changes the user's next decision

---

## 3. Analyzing Creators

Help the user decide whether a creator is worth pursuing. Lead with a verdict, not a wall of numbers.

### Workflow

1. Confirm which creator to analyze (use `creator_id` from prior search or user input).
2. If user asked about a specific concern, check that dimension first.
3. If no specific concern, follow default order: profile → audience → content → cooperation (all with `--detail` flag).
4. Platform-aware skip: TikTok and Instagram often have partial cooperation/pricing data. Skip `creator cooperation --detail` unless the user explicitly asks for pricing or brand-history signals, or the primary platform is YouTube. See `{baseDir}/references/platform-support.md`.
5. For content analysis in Chinese context, add `--language zh`.
6. Return verdict first, then supporting evidence.

Use `noxinfluencer schema creator.<dimension>` (e.g., `schema creator.profile`). The quoted single-argument form (for example `schema 'creator profile'`) is equivalent.

### Verdict Framework

Always lead with one of these four conclusions:

1. **High-priority collaboration candidate** — no dispute signal, healthy audience, competitive performance, no pricing friction
2. **Viable, but with clear risks** — workable overall, 1–2 notable concerns
3. **Needs manual review before proceeding** — mixed evidence or data incomplete
4. **Not a priority collaboration candidate** — multiple weak signals

See `{baseDir}/references/verdict-heuristics.md` for detailed heuristic rules and output structure.

### Interpretation Rules

- Dispute history and negative cooperation signals are decision-critical — always surface them.
- Benchmark position is context, not the sole determinant.
- Evaluate pricing relative to performance, audience quality, and cooperation signals.
- When evidence is mixed, prefer "Needs manual review" over false confidence.
- When only one dimension was checked, present as a scoped judgment, not a full verdict.

### Escalation Rules

- One bad dimension → explain the tradeoff, don't force a hard reject.
- Multiple weak dimensions → clear cautionary verdict.
- User asks about one dimension → stay focused, but mention obvious red flags.

---

## 4. Retrieving Contacts

Retrieve contact info for a specific creator. Intentionally narrow — gets contact data, nothing more.

1. Confirm which creator (use `creator_id` from prior search or user input).
2. Run the contacts command.
3. Return only the contact info and quality signal.

### Quality Interpretation

| `email_quality` | Meaning |
|-----------------|---------|
| `1` | High-quality contact signal |
| `2` | Normal contact signal |
| `0` | Low-confidence or unverified contact signal |

If email is null, clearly say no reliable email is currently available. If email exists but quality is `0`, return it with cautionary wording and tell the user it needs manual verification.

Do not add outreach recommendations or restate creator metrics.

---

## 5. Tracking Performance

Manage video monitoring projects and tracked videos. Operational only — manages monitoring, not performance judgment.

### Workflow

1. List projects first when the target project is unclear.
2. Create a project when user wants a new one.
3. If user wants to create AND monitor in one request, create first then add task.
4. For project overview, use summary; for specific videos, use task list.

Use `noxinfluencer schema monitor.<subcommand>` for parameter details. Write operations default to dry-run — use `--force` to execute.

### Project Identification

- Prefer `project_id` over `project_name` after the first lookup.
- If project names collide, show disambiguation: project_id, name, created time, platforms, monitor count.
- Once a project is selected, keep using that `project_id` until user switches.

### Output Rules

- Project lists: name, project_id, platforms, monitor count
- Summaries: monitor count, total views/likes/comments, avg engagement, platform breakdown
- Task lists: creator name, video title, views, engagement rate, status
- Do not turn outputs into performance verdicts

### Status Codes

| Status | Meaning |
|--------|---------|
| `loading` | Initializing |
| `monitoring` | Actively collecting data |
| `completed` | Monitoring period ended |
| `video restricted` | Video unavailable |
| `invalid link` | URL could not be resolved |

---

## Workflow Routing

| User intent | Start with |
|-------------|-----------|
| Find creators, broad sourcing | § 2. Discovering Creators |
| Evaluate a specific creator | § 3. Analyzing Creators |
| Get email or contact details | § 4. Retrieving Contacts |
| Set up monitoring for a video | § 5. Tracking Performance |
| Setup, quota, billing, errors | § 1. Getting Started |

Natural progression: discover → analyze → contact → monitor. But users can enter at any point.

## Error Handling

For API-backed failures (`quota`, `pricing`, `creator`, `monitor`), use the CLI response's `action` field when present:
- `action.url` — where the user should go
- `action.hint` — what to do

Local commands (`auth`, `doctor`, `schema`) may not include `action`. Read their native output directly instead of assuming the API error envelope.

For unexpected failures, run `doctor` as a first diagnostic step.

## References

- `{baseDir}/references/cli-response-format.md` — response envelope differences and error action handling
- `{baseDir}/references/platform-support.md` — data availability by platform
- `{baseDir}/references/search-filters.md` — filter selection by user intent
- `{baseDir}/references/verdict-heuristics.md` — detailed due-diligence rules and output structure
