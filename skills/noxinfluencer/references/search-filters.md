# Search Filter Semantics

For the full parameter list and syntax, run `noxinfluencer schema creator.search`. The single-argument command-path form `noxinfluencer schema 'creator search'` is equivalent.

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

## Search Result Fields

Each result includes the encrypted `id`, masked `nickname`, `tags`, `followers`, `country`, `total_videos`, `view_per_followers`, `engagement_rate`, and `language`. `avg_views` is the actual latest-10-content average; `estimated_exposure_30d` and `estimated_exposure_180d` are separate estimates, not substitutes for that average. `avg_comments`, `is_brand`, `is_celebrity`, and `has_email` provide corresponding filter evidence when available. `has_email` is a signal, not an address. Audience filters return only their requested matching values/female percentage, not a full audience distribution.

TikTok commerce search exposes only existing filter values within the account's search entitlement:

| Field | Meaning |
| --- | --- |
| `ttseller` | TikTok Shop creator flag. |
| `products_market`, `currency` | SaaS sales market and its currency; distinct from creator `country`. Missing currency stays unknown. |
| `last30_days_video_gmv` | 30-day video GMV targeted by `last30_days_products_gmv_min/max`. |
| `last30_days_video_sales_count` | 30-day video sales targeted by `last30_products_sales_count_min/max`. |
| `last30_days_products_gpm` | Product GPM filter value, in market currency per thousand views; not a GMV total. |
| `products_category`, `main_products_category` | Category IDs used by the corresponding filters. |
| `products_video_avg_views`, `products_video_view_exclude_extreme` | Actual 30-day product-video average for the chosen normal/trimmed filter scope. |
| `last7_has_products_video`, `last7_has_products_sales_count` | Nullable activity signals, without raw 7-day counts. |
| `last7_open_tiktok_shop` | Same recent-shop signal as SaaS: first product-video publication reaches its 7-natural-day boundary. Not a verified official shop opening date. |
| `matches_seller_of` | Match for the seller specified in this request; null without that filter. No associated seller ID list. |

Search does not return `last30_days_live_gmv/sales_count`, `total_products_*`, or legacy `last30_days_products_gmv/sales_count`. Basic/degraded or unknown search permission metadata does not unlock commerce values. Report a capability/entitlement gap if required evidence is missing; do not use an unprotected raw endpoint or substitute a different metric. If analyzing a user-supplied legacy snapshot, describe its recorded scope without presenting those legacy fields as the current search contract.

GMV bounds use each market's local currency. Do not infer USD from creator country, rank money across unverified units, add snapshots into a total, or use a legacy product snapshot to satisfy a video GMV threshold. A video GMV of 90000 does not meet a video GMV minimum of 100000, regardless of a larger historical product snapshot. Null is unavailable evidence; a returned 0 is zero.

For an explicitly requested creator commerce detail, check `schema creator.profile` for `--include-shop` (CLI 0.5.12+), then use:

```bash
noxinfluencer creator profile <creator_id> --detail --include-shop --json
```

Read `data.shop`: fixed 30-day video/live GMV, sales and GPM, sales market and currency. This reuses SaaS scope 34, single-creator unlock and the current profile-detail price; permission/quota failures must be surfaced. The current SaaS live overview supports US creators; `live_supported=false` leaves live values null, not zero. Detail is independently ranged/calibrated and can differ from search snapshots. No cumulative or legacy generic-product snapshot is supplied. Search never auto-requests this detail; do not expand a search into paid per-creator reads without the user's task requiring them.

For market-level product, shop, or live GMV, use `noxinfluencer tiktok search product|shop|live`; those separate indexes expose `total_gmv`, `last30_days_gmv`, and `currency` when SaaS supplies them.

For recent content, `creator content` defaults to 10 items and supports `--page_num`, `--page_size`, `--sort_field`, and platform-supported `--video_type`. Keep requested formats explicit when comparing samples. Each item may include `content_id`, `content_url`, and `content_type` when supplied.

`creator_name` and `keywords` are mutually exclusive. Name search uses the same result pricing and pagination as topic search.

## Precision and Official Account Filters

`accurate` accepts a finite numeric value in `[0,1]`: SaaS 60% is `0.6`, not `60`. Omitted or 0 turns it off; higher values request stricter topic semantic matching. This is independent of `keyword_match all` (every topic must match), does not make name search semantic, and does not guarantee marketing suitability. Preserve the user's requested value; do not invent a fixed threshold when none was given.

`channel_type_infos` preserves the SaaS official-account rules on all three platforms:

| Array value | Upstream account-type condition |
|-------------|---------------------------------|
| Omitted or `[]` | No account-type filter |
| `[is_brand]` | Brand flag is true |
| `[is_celebrity]` | Celebrity flag is true |
| `[is_brand,is_celebrity]` | Brand OR celebrity flag is true |
| `[no_official]` | Neither brand nor celebrity flag is true |
| `[is_brand,no_official]` | Brand is true AND celebrity is not true |
| `[is_celebrity,no_official]` | Celebrity is true AND brand is not true |
| `[is_brand,is_celebrity,no_official]` | Both brand AND celebrity flags are true |

“Not true” can include missing flags; do not treat it as verified personal ownership. All three selections do **not** mean all accounts. Ask which type the user means if “official account” alone is ambiguous. Reuse the same filters and precision when paging.

Example combining a supplied precision with non-official discovery:

```bash
noxinfluencer creator search --platform youtube --keywords '[beauty]' --accurate 0.6 --channel_type_infos '[no_official]'
```

These controls require CLI 0.5.11 or later. Check the installed `schema creator.search` before using these flags. If it lacks them, report that this CLI build needs an update; do not omit the user's condition or assume the SaaS deployed behavior has been verified from local code alone.

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
