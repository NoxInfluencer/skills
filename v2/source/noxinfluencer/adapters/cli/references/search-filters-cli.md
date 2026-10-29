# Search Filter Semantics

Use the current installed schema; public CLI version notes do not establish private backend support. Missing requested filters or protected detail are capability gaps, not permission to switch execution routes. Shared interpretation rules also live in `{baseDir}/references/creator.md`.

For the full parameter list and syntax, run `node "{baseDir}/scripts/nox-cli.mjs" schema creator.search`. The single-argument command-path form `node "{baseDir}/scripts/nox-cli.mjs" schema 'creator search'` is equivalent.

This reference covers **when to use which filters** — the decision logic, not the syntax.

For a new search, apply topic exclusions and SaaS hide/deduplication directly through `creator search`. Use standalone `creator search-filter` only when a page has already been returned.

## Filter Priority by User Intent

| User intent | Key filters to apply | Why |
|-------------|---------------------|-----|
| Known creator name or handle | `--creator_name`, `--platform` | Match creator identity instead of treating the name as a topic keyword |
| Niche sourcing | `--keywords`, `--platform` | Narrow to relevant content creators |
| Every topic must match | `--keywords`, `--keyword_match all` | Require all supplied topic keywords instead of the default any-keyword union |
| Semantic precision | `--accurate 0..1` | Tune topic semantic matching precision; 0 leaves precision off and 1 is strict |
| Official account type | `--channel_type_infos` | Filter brand, celebrity, and non-official accounts using SaaS combinations |
| Regional targeting | `--country`, `--follower_countries` | Match campaign geography |
| Budget-constrained | `--follower_min`, `--follower_max` | Size correlates with cost |
| Platform email outreach | `--has_email true` | Only creators with known email signal; platform email can add search `data.items[].id` values as recipient `creator_id` without retrieving visible email |
| Audience fit | `--follower_ages`, `--follower_female_pct_min`, `--follower_language` | Match audience demographics |
| Active creators | `--published_within_days` | Exclude dormant channels |
| Performance floor | `--engagement_rate_min`, `--avg_view_min` | Filter out low-engagement creators |
| Comment activity floor | `--avg_comments_min/max` | Filter by average comments across the latest 10 contents |
| Exposure window | `--est_exposure_min/max`, `--est_exposure_period 30d|180d` | Compare estimated exposure within an explicit SaaS time window |
| YouTube content shape | `--video_type`, `--primary_video_length_type`, `--open_shorts` | Separate Shorts, long videos, live content, primary format, and Shorts availability |
| TikTok Shop creator GMV | `--platform tiktok`, `--last30_days_products_gmv_min/max` | Filter creators by last-30-day video-attributed product GMV |

## Returned Evidence And Explicit Detail

Read `{baseDir}/references/creator.md` for the shared meanings of precision, account-type combinations, actual versus estimated metrics, entitled commerce fields, market currency, recent-shop signals, unsupported/null values and protected detail. Those business rules apply to both runtime builds.

CLI search identities come from `data.items[].id`; preserve them as positional creator IDs. Current search exposes `last30_days_video_gmv`, `last30_days_video_sales_count`, `products_market` and `currency` when entitled, rather than legacy generic product totals. Check exact field support with `schema creator.search`. Public precision/account-type controls require CLI 0.5.11+; private backend support must still be confirmed.

For explicit commerce detail, inspect `node "{baseDir}/scripts/nox-cli.mjs" schema creator.profile` for `--detail` and `--include-shop` (public CLI 0.5.12+), then use the existing creator identity:

```bash
node "{baseDir}/scripts/nox-cli.mjs" creator profile <creator_id> --detail --include-shop --json
```

Read `data.shop` and the current profile-detail price; do not use raw search endpoints or automatically add per-creator reads to a normal search. In a runtime without the option, report the missing capability and preserve the user's requested scope.

For market entities use the separately supported `node "{baseDir}/scripts/nox-cli.mjs" tiktok search product|shop|live` operations; see `{baseDir}/references/marketing-ops-cli.md` for bodies, pricing and market pagination.

For recent content, `creator content` defaults to 10 items. Discover `--page_num`, `--page_size`, `--sort_field`, and platform-supported `--video_type`; returned items may include `content_id`, `content_url`, and `content_type`.

Example of supplied precision and account scope (the user supplied 60%, represented as 0.6):

```bash
node "{baseDir}/scripts/nox-cli.mjs" creator search --platform youtube --keywords '[beauty]' --accurate 0.6 --channel_type_infos '[no_official]'
```

Search responses also include page metadata under `data`: `page_num`, `page_size`, `total_page`, `total_size`, and `search_after`.

The `nickname` in search and lookalike results is a display value; do not treat it as the creator's full identity. The `id` is an encrypted token — use it directly as the positional `<creator_id>` argument in subsequent commands. Do not try to decode or reconstruct it. Use the controlled creator read path when fuller identity details are needed.

## Page Size and Cost

- `creator search` and `creator lookalikes` share returned-result pricing; use `pricing tools --action creator_search` or `--action creator_lookalikes` for the current server-side unit price.
- The default page size is 20 and the maximum page size is 100.
- Charge impact follows the number of returned items, not the requested `page_size`. Prefer targeted pages while refining filters; use larger pages only when the user asks for broad sourcing or bulk follow-up.

## Search Result Deduplication

- Use `exclude_keywords` for unwanted topic/tag matches; do not emulate exclusions by dropping rows after billing.
- Run `creator search-filter-options` to inspect SaaS hide choices. Apply its `search_body_patch` in the same `creator search` request whenever possible.
- Use its standalone `body_patch` with `creator search-filter` only for already returned `data.items[].id` values.
- Use `creator not-interested add` only after explicit approval to mark selected creators as Not interested. `list` audits those marks, and `remove` cancels them so the creators can appear in future searches again.

## Pagination Rules

- For a next-page request, keep the previous search filters exactly the same and send both the next `page_num` and the previous response's `data.search_after`.
- Prefer `--body-file -` for next-page requests and pass one JSON body containing the preserved filters, `page_num`, `page_size`, and `search_after`. This avoids shell globbing/quoting problems with cursor arrays.
- If using flags instead of `--body-file`, shell-quote every bracketed array argument, especially `--search_after`, for example `--search_after '[1.0,"UC0000000000000000000001"]'`. This is a placeholder illustrating quoting; pass the previous response's actual cursor at runtime.
- Current CLI and server validation require `page_num > 1` when `search_after` is present, so do not try cursor-only paging.
- If `data.search_after` is missing or empty, or the current page is already the last page, tell the user there are no more results.
