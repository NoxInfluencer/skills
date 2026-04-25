# Brand Monitor Workflows

Use brand-monitor commands for brand-level market intelligence and asset exports. This workflow starts from `brand_id`; do not substitute `creator_id`.

## Routing

| User intent | Command family |
|-------------|----------------|
| List available brand monitors | `brand-monitor list` |
| Inspect one monitored brand | `brand-monitor get <brand_id>` |
| Compare brand competition | `brand-monitor competition-matrix <brand_id>` |
| Analyze cooperation strategy | `brand-monitor cooperate-matrix <brand_id>` |
| Summarize influencer portrait | `brand-monitor influencer-portrait <brand_id>` |
| Find defense gaps | `brand-monitor defense-gap <brand_id>` |
| Read product trend/category signals | `brand-monitor product-pub-trend`, `product-category` |
| Read product strategy signals | `brand-monitor product-sov-analysis`, `product-tae-analysis`, `product-pp-analysis`, `product-promotion-matrix`, `product-promotion-distinction` |
| Query brand asset rows | `brand-monitor influencer-list`, `content-list`, `tag-list`, `product-list` |
| Create brand asset exports | `brand-monitor influencer-export`, `content-export`, `tag-export`, `product-export` |
| Add or unlock a monitored brand | `brand-monitor add`, `unlock-base`, `unlock-high` |

## Platform Boundaries

- Core brand monitor reads support YouTube, TikTok, and Instagram where the CLI schema permits.
- Product signal commands currently support `youtube` only. Do not call product signal commands for TikTok or Instagram unless a future schema explicitly shows support.
- Asset list commands are JSON-first. Use `--body-file` and inspect schema usage notes before building selectors.

## Output Rules

- Brand overview: report brand name, `brand_id`, access/data level, quota state, and obvious blockers.
- Matrices and strategy reads: summarize top rows and the decision implication; do not dump every normalized field.
- Asset lists: present comparable rows and include pagination state when present.
- Product signals: state that the result is YouTube-only if the user asked for cross-platform analysis.
- Exports: preserve `export_id` and route follow-up status/download through shared `export` commands.

## Mutation Rules

- `add`, `unlock-base`, `unlock-high`, and all `*-export` commands are mutations or async job creation.
- Dry-run first unless the user already approved the exact brand and action.
- Use `--force` only after approval.
- For unlock operations, explain that quota/entitlement may be consumed before executing.
