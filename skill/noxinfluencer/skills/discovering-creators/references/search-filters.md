# Search Filters Reference

Complete list of filter parameters for the `search_creators` command.

## Usage

```bash
noxinfluencer search_creators --platform <platform> --keywords [keyword1,keyword2] [filters...]
```

## Required

| Parameter | Values | Description |
|-----------|--------|-------------|
| `--platform` | `youtube`, `tiktok`, `instagram` | Target platform |

## Optional Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `--keywords` | array | Niche or topic keywords, comma-separated |
| `--country` | array | Creator country codes, e.g. `[US,DE]` |
| `--follower_min` | number | Minimum follower count |
| `--follower_max` | number | Maximum follower count |
| `--has_email` | boolean | Only return creators with known email |
| `--language` | array | Creator content language codes |
| `--gender` | string | Creator gender filter |
| `--engagement_rate_min` | number | Minimum engagement rate |
| `--engagement_rate_max` | number | Maximum engagement rate |
| `--avg_view_min` | number | Minimum average views |
| `--avg_view_max` | number | Maximum average views |
| `--est_exposure_min` | number | Minimum estimated exposure |
| `--est_exposure_max` | number | Maximum estimated exposure |
| `--view_per_followers_min` | number | Minimum views-per-follower ratio |
| `--view_per_followers_max` | number | Maximum views-per-follower ratio |
| `--published_within_days` | number | Only creators who published within N days |
| `--follower_countries` | array | Audience country distribution filter |
| `--follower_ages` | array | Audience age distribution filter |
| `--follower_female_pct_min` | number | Minimum female audience percentage |
| `--follower_language` | array | Audience language distribution filter |

## Pagination

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--page_size` | number | 20 | Results per page |
| `--page_num` | number | 1 | Page number |
| `--search_after` | string | — | Deep pagination cursor from previous results |

## Search Result Fields

Each result includes:

| Field | Description |
|-------|-------------|
| `id` | Encrypted creator ID (use for all subsequent commands) |
| `nickname` | Creator display name |
| `tags` | Content tags |
| `followers` | Follower count |
| `country` | Creator country |
| `total_videos` | Total video count |
| `view_per_followers` | Views-per-follower ratio |
| `engagement_rate` | Engagement rate |
| `avg_views` | Average view count |
| `language` | Content language |

## Notes

- The `id` returned is an encrypted token. Use it directly in all subsequent `--creator_id` parameters.
- `--has_email true` filters for creators with known email, but does not retrieve the email. Use `retrieving-contacts` to get actual contact details.
- Array parameters use bracket notation: `--country [US,DE,JP]`.
- Credit cost for search is dynamic: 1 credit per result returned.
