# Search Filter Semantics

For the full parameter list and syntax, run `noxinfluencer schema creator.search`. The single-argument command-path form `noxinfluencer schema 'creator search'` is equivalent.

This reference covers **when to use which filters** — the decision logic, not the syntax.

## Filter Priority by User Intent

| User intent | Key filters to apply | Why |
|-------------|---------------------|-----|
| Niche sourcing | `--keywords`, `--platform` | Narrow to relevant content creators |
| Regional targeting | `--country`, `--follower_countries` | Match campaign geography |
| Budget-constrained | `--follower_min`, `--follower_max` | Size correlates with cost |
| Outreach-ready | `--has_email true` | Only creators with known email (does NOT retrieve the email — use the contact retrieval workflow after a creator is selected) |
| Audience fit | `--follower_ages`, `--follower_female_pct_min`, `--follower_language` | Match audience demographics |
| Active creators | `--published_within_days` | Exclude dormant channels |
| Performance floor | `--engagement_rate_min`, `--avg_view_min` | Filter out low-engagement creators |

## Search Result Fields

Each result includes: `id` (encrypted token), `nickname`, `tags`, `followers`, `country`, `total_videos`, `view_per_followers`, `engagement_rate`, `avg_views`, `language`.

The `id` is an encrypted token — use it directly as the positional `<creator_id>` argument in subsequent commands. Do not try to decode it.
