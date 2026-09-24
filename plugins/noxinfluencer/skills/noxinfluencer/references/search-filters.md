# Search Filter Semantics

Use the connected provider's creator-search Tool description and input schema as the authoritative parameter reference.

This reference covers **when to use which filters** — the decision logic, not the syntax.

For a new search, apply topic exclusions and SaaS hide/deduplication directly through `creator search`. Use standalone `creator search-filter` only when a page has already been returned.

## Filter Priority by User Intent

| User intent | Key filters to apply | Why |
|-------------|---------------------|-----|
| Known creator name or handle | creator-name and platform inputs | Match creator identity instead of treating the name as a topic keyword |
| Niche sourcing | keyword and platform inputs | Narrow to relevant content creators |
| Every topic must match | keyword-match input | Require all supplied topic keywords instead of the default any-keyword union |
| Regional targeting | country and follower-country inputs | Match campaign geography |
| Budget-constrained | follower-range inputs | Size correlates with cost |
| Platform email outreach | email-signal input | Only creators with known email signal; platform email can still add results by `creator_id` without retrieving visible email |
| Audience fit | audience-demographic inputs | Match audience demographics |
| Active creators | published-within input | Exclude dormant channels |
| Performance floor | engagement and average-view inputs | Filter out low-engagement creators |

## Search Result Fields

Each result item includes: `id` (encrypted token), `nickname`, `tags`, `followers`, `country`, `total_videos`, `view_per_followers`, `engagement_rate`, `avg_views`, `language`.

`creator_name` and `keywords` are mutually exclusive. Name search uses the same result pricing and pagination as topic search.

Search responses also include page metadata under `data`: `page_num`, `page_size`, `total_page`, `total_size`, and `search_after`.

The `id` is an encrypted token — preserve and pass it directly as `creator_id` in subsequent Tool calls. Do not try to decode it.

## Page Size and Cost

- Creator search and lookalike discovery share returned-result pricing; use a provider pricing Tool when the user asks for the current server-side unit price.
- The default page size is 20 and the maximum page size is 100.
- Charge impact follows the number of returned items, not the requested `page_size`. Prefer targeted pages while refining filters; use larger pages only when the user asks for broad sourcing or bulk follow-up.

## Search Result Deduplication

- Use `exclude_keywords` for unwanted topic/tag matches; do not emulate exclusions by dropping rows after billing.
- Use the provider's search-filter-options capability to inspect SaaS hide choices. Apply its returned `search_body_patch` in the same search request whenever possible.
- Use its standalone `body_patch` with `creator search-filter` only for already returned `data.items[].id` values.
- Use `creator not-interested add` only after explicit approval to mark selected creators as Not interested. `list` audits those marks, and `remove` cancels them so the creators can appear in future searches again.

## Pagination Rules

- For a next-page request, keep the previous search filters exactly the same and send both the next `page_num` and the previous response's `data.search_after`.
- For next-page requests, pass one structured Tool input containing the preserved filters, `page_num`, `page_size`, and `search_after`. This avoids losing cursor arrays or changing the search scope.
- Current server validation requires `page_num > 1` when `search_after` is present, so do not try cursor-only paging.
- If `data.search_after` is missing or empty, or the current page is already the last page, tell the user there are no more results.
