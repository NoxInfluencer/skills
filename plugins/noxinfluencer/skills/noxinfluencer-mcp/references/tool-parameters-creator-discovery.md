# MCP tools for creator-discovery

## `add_not_interested_creators`

Mark up to 100 same-platform creator IDs as Not interested.

- `creator_ids` (array of string, required).
- `idempotency_key` (string, required).

## `create_creator_export`

Create a base or deep asynchronous export for 1-100 selected creator search results after user approval; deep contact fields can consume business quota.

- `idempotency_key` (string, required).
- `platform` (string, required).
- `mode` (string, required).
- `creator_ids` (array of string, required).
- `field_keys` (array of string, optional).
- `language` (string, optional).

## `create_creator_lookalikes_export`

Create a base or deep asynchronous export for 1-100 selected similar-creator results after user approval; deep contact fields can consume business quota.

- `idempotency_key` (string, required).
- `platform` (string, required).
- `mode` (string, required).
- `creator_ids` (array of string, required).
- `field_keys` (array of string, optional).
- `language` (string, optional).
- `source_creator_id` (string, required).
- `country` (array of string, optional).
- `creator_languages` (array of string, optional).
- `follower_min` (integer, optional).
- `follower_max` (integer, optional).
- `avg_view_min` (integer, optional).
- `avg_view_max` (integer, optional).
- `sort_field` (string, optional).

## `creator_search`

Search YouTube, TikTok, or Instagram creators by topic keywords or one creator name/handle, with optional exclusions and SaaS hide filters. Results contain entitled filter values and SaaS list fields; TikTok live overviews require explicit creator_profile detail=true, include_shop=true. Search never fetches details or returns cumulative/product GMV snapshots or contact addresses. The returned item.id is an opaque creator ID for creator_profile and must never be copied into Campaign2 targets[].channelId; Campaign2 requires the raw platform channel_id. YouTube avg_views stays overall; average-view bounds use avg_views_shorts for video_type=1, avg_views_normal for video_type=2, and avg_views otherwise. These are search-index snapshots, not profile-detail samples; missing classified values stay null.

- `platform` (string, required). Creator platform.
- `keywords` (array of string, optional). Topic keywords. Use this or creator_name, not both.
- `exclude_keywords` (array of string, optional). Topic/tag keywords to exclude from the search.
- `creator_name` (string, optional). Creator display name or handle. Use this or keywords, not both.
- `keyword_match` (string, optional, default "any"). Whether any keyword or every keyword must match. Applies to keywords only.
- `country` (array of string, optional). Creator country codes.
- `follower_min` (integer, optional).
- `follower_max` (integer, optional).
- `has_email` (boolean, optional).
- `language` (array of string, optional).
- `gender` (string, optional).
- `engagement_rate_min` (number, optional). Decimal ratio: 0.05 = 5%, not 5. Ratios can exceed 1 (100%); values are not automatically rescaled.
- `engagement_rate_max` (number, optional). Decimal ratio: 0.05 = 5%, not 5. Ratios can exceed 1 (100%); values are not automatically rescaled.
- `est_exposure_min` (integer, optional).
- `est_exposure_max` (integer, optional).
- `view_per_followers_min` (number, optional). Decimal ratio: 0.05 = 5%, not 5. Ratios can exceed 1 (100%); values are not automatically rescaled.
- `view_per_followers_max` (number, optional). Decimal ratio: 0.05 = 5%, not 5. Ratios can exceed 1 (100%); values are not automatically rescaled.
- `avg_view_min` (integer, optional).
- `avg_view_max` (integer, optional).
- `published_within_days` (integer, optional).
- `follower_countries` (array of string, optional).
- `follower_ages` (array of string, optional).
- `follower_female_pct_min` (integer, optional). Percentage points: 60 = 60%, not 0.6. Null or missing output means unavailable.
- `follower_language` (array of string, optional).
- `page_size` (integer, optional, default 20).
- `page_num` (integer, optional, default 1).
- `search_after` (array of see live schema, optional).
- `hide_filter` (object, optional).

## `filter_creator_search_results`

Evaluate up to 100 returned creator IDs against SaaS hide and deduplication rules.

- `creator_ids` (array of string, required).
- `cooperated` (boolean, optional).
- `cooperating` (boolean, optional).
- `contacting` (boolean, optional).
- `contacted_scope` (string, optional).
- `collection_ids` (array of string, optional).

## `find_similar_creators`

Find a bounded page of creators similar to one source creator on a selected target platform.

- `source_creator_id` (string, optional).
- `url` (string, optional).
- `source_platform` (string, optional).
- `source_channel_id` (string, optional).
- `target_platform` (string, required).
- `country` (array of string, optional).
- `language` (array of string, optional).
- `follower_min` (integer, optional).
- `follower_max` (integer, optional).
- `avg_view_min` (integer, optional).
- `avg_view_max` (integer, optional).
- `sort_field` (string, optional).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `list_creator_search_filter_options`

List stable SaaS hide and deduplication choices for creator search.

No input parameters.

## `list_not_interested_creators`

List creators marked as Not interested for the authorized account.

- `platform` (string, optional).
- `keyword` (string, optional).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `preview_creator_export`

Estimate deep creator export, email, and WhatsApp business quota without creating an export task.

- `kind` (string, required).
- `platform` (string, required).
- `creator_ids` (array of string, required).
- `source_creator_id` (string, optional).
- `field_keys` (array of string, required).

## `remove_not_interested_creators`

Remove the Not interested mark from up to 100 same-platform creator IDs.

- `creator_ids` (array of string, required).
- `idempotency_key` (string, required).
