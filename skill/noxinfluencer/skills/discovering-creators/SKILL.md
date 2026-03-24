---
name: discovering-creators
description: Searches for creators and influencers matching specified criteria and produces a shortlist of candidates for comparison. Use when the user needs to find suitable creators before deeper analysis or outreach.
---

# Discovering Creators

Use this skill to turn an open-ended creator search into a usable shortlist. The goal is not to run search immediately. The goal is to narrow the request enough that the final result is a visible candidate list worth reviewing.

## When to Use

Use this skill when the user:

- wants to find creators, influencers, or KOLs
- has a broad sourcing request and needs candidate discovery
- wants a shortlist before deciding who to analyze
- asks for overview-level creator, audience, cooperation, or content data during the sourcing phase

Do not use this skill for deep risk review or final cooperation judgment. Hand off to `analyzing-creator` when the user wants a decision on whether a creator is reliable or worth pursuing.

## Workflow

1. Check whether the request is underspecified.
2. If it is underspecified, ask for the 2-3 most decision-critical filters first.
3. Prefer clarifying platform, niche, geography, creator size, and contact requirements before searching.
4. Run `creator search` only when the request is specific enough to produce a meaningful shortlist.
5. Keep the discovery pass shortlist-oriented. Do not drift into deep due diligence during sourcing.
6. If the user wants more detail on a candidate, use the relevant overview command or suggest moving to `analyzing-creator`.

## Clarification Rules

Do not search immediately if the request is too broad.

When clarification is needed:

- ask short, direct questions
- ask for 2-3 critical filters at a time instead of building a long questionnaire
- prioritize platform, niche, region, creator size, and whether contactability matters
- stop asking once the search is specific enough to produce a useful shortlist

Reasonable filter priorities:

- platform
- niche or keywords
- region or country
- creator size or follower band
- whether contact info is required
- audience preference or budget sensitivity if the user already sounds commercially focused

## Command Mapping

### Primary search command

```bash
noxinfluencer creator search --platform <platform> --keywords [keyword1,keyword2]
```

Add filters only when the user asked for them or they are necessary to avoid a noisy result set. See [search-filters.md](references/search-filters.md) for the full list of available filter parameters.

### Overview follow-up commands

Use these only when the user is still in discovery mode and wants a little more context on a shortlist candidate. Note: `creator_id` is a positional argument, not a flag.

```bash
noxinfluencer creator profile <creator_id>
noxinfluencer creator audience <creator_id>
noxinfluencer creator cooperation <creator_id>
noxinfluencer creator content <creator_id>
```

## Output Rules

The default output should be a shortlist, not a raw dump.

For each candidate, prioritize a balanced view:

- nickname
- platform
- followers
- engagement rate
- average views
- country
- top tags or niche signal
- whether contactability was explicitly filtered in the search request

The response should also include:

- why these candidates match the request
- what filters were applied
- credits used and remaining
- a clear next-step suggestion: refine the shortlist, analyze a candidate, or move to outreach later

When presenting a shortlist:

- show a visible list of candidates, not a raw JSON paraphrase
- keep the shortlist focused, usually 3-5 candidates first
- make each row easy to compare at a glance
- state if the search was filtered with `--has_email true`, but do not imply that a verified email was already retrieved
- do not expand into full due-diligence commentary for every candidate
- if the result set is noisy or too broad, say so and ask for one more narrowing filter instead of pretending the shortlist is strong

If the user asked for many results, do not expand all items equally. Present a visible shortlist first, then mention that more results are available.

If the user asks for a little more context on one shortlisted creator, use at most 1-2 overview follow-up commands before recommending `analyzing-creator` for deeper review.

## Handoff Rules

Use `analyzing-creator` next when:

- the user wants to know whether one specific creator is reliable
- the user asks about disputes, pricing reasonableness, audience quality, or deep due diligence
- the user starts comparing shortlist candidates on trust, risk, or cooperation quality rather than discovery fit

Use `retrieving-contacts` next when:

- the user already chose a creator and wants contact information
- the user explicitly asks for email or contact details

Do not jump to `retrieving-contacts` just because the search used `--has_email true`. That flag only indicates a search preference, not a verified retrieved contact.

## Decision Guidance

This skill should optimize for shortlist quality, not search speed.

- A narrower shortlist is better than a broad noisy result set.
- If the user is clearly sourcing for outreach, contactability matters.
- If the user is clearly sourcing for fit, niche and audience signals matter more.
- If the user is clearly sourcing for scale, size and average performance matter more.

## Errors and Fallbacks

- If authentication fails, direct the user to configure the API key with `noxinfluencer auth --key <key>`.
- If quota is exhausted, state that the search cannot continue without more credits.
- If the user does not have a `creator_id` for a follow-up command, search first and use an encrypted ID from the shortlist.

## References

- [CLI Response Format](../../references/cli-response-format.md) — unified JSON response structure and credit costs
- [Error Codes](../../references/error-codes.md) — error code table and handling guidelines
- [Platform Support](../../references/platform-support.md) — YouTube, TikTok, Instagram data availability differences
