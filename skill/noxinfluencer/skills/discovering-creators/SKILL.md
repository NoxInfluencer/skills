---
name: discovering-creators
description: Searches for creators and influencers matching specified criteria and produces a shortlist of candidates for comparison. Use when the user needs to find suitable creators before deeper analysis or outreach.
---

# Discovering Creators

Turn an open-ended creator search into a usable shortlist. The goal is not to run search immediately — it's to narrow the request enough that the result is worth reviewing.

## When to Use

- User wants to find creators, influencers, or KOLs
- User has a broad sourcing request and needs candidate discovery
- User wants a shortlist before deciding who to analyze

Do not use for deep risk review or cooperation judgment. Hand off to `analyzing-creator` when the user wants a decision on reliability or fit.

## Clarification Strategy

Do not search immediately if the request is too broad. Ask for 2-3 critical filters at a time:

1. **Platform** — YouTube, TikTok, or Instagram?
2. **Niche / keywords** — what content area?
3. **Region** — which countries or markets?
4. **Creator size** — follower range?
5. **Contactability** — does email availability matter?

Stop asking once the request is specific enough to produce a useful shortlist. If the user provided most of these upfront, search directly.

## Search Execution

Use `noxinfluencer schema creator.search` to discover available filter parameters. Key decisions:

- Multi-platform requests (e.g., "YouTube and IG") require separate searches per platform
- Add `--has_email true` when the user's intent is commercial outreach
- Start with one search, refine if results are too noisy or too broad

See [search-filters.md](references/search-filters.md) for filter selection semantics by user intent.

## Shortlist Presentation

Present results as a visible, comparable shortlist — not a raw JSON dump.

For each candidate, show: nickname, platform, followers, engagement rate, average views, country, top tags.

Rules:
- Keep shortlist focused: 3-5 candidates first
- Make rows easy to compare at a glance
- If results are noisy, say so and ask for one more narrowing filter
- State if `--has_email true` was used, but do not imply email was already retrieved
- Do not expand into full due-diligence commentary per candidate
- Include: why candidates match, filters applied, credits used, next-step suggestion

## Handoff Rules

→ `analyzing-creator`: user wants to know if a specific creator is reliable, asks about disputes/pricing/audience quality
→ `retrieving-contacts`: user already chose a creator and wants email/contact details

Do not jump to contacts just because `--has_email true` was used in search — that's a filter preference, not a retrieved contact.

## Error Handling

If an operation fails, the CLI response's `action` field contains the next step (URL and hint). Use it directly — do not infer error handling from memory.

## References

- [Search Filter Semantics](references/search-filters.md) — when to use which filters
- [Platform Support](../../references/platform-support.md) — data availability differences by platform
- [CLI Response Format](../../references/cli-response-format.md) — response structure and credit costs
