# MCP tools for creator-analysis

## `creator_audience`

Read audience demographics and authenticity metrics for a creator.

- `creator_id` (string, optional).
- `url` (string, optional).
- `platform` (string, optional).
- `channel_id` (string, optional).
- `detail` (boolean, optional, default false).

## `creator_content`

Read recent content and topic signals for a creator.

- `creator_id` (string, optional).
- `url` (string, optional).
- `platform` (string, optional).
- `channel_id` (string, optional).
- `detail` (boolean, optional, default false).
- `language` (string, optional, default "en").

## `creator_cooperation`

Read brand cooperation and sponsorship performance metrics for a creator.

- `creator_id` (string, optional).
- `url` (string, optional).
- `platform` (string, optional).
- `channel_id` (string, optional).
- `detail` (boolean, optional, default false).

## `creator_profile`

Read profile metrics for a creator returned by search, or by direct platform selector. creator_id is an opaque creator ID returned by creator_search; channel_id is the raw platform ID used by Campaign2 and other legacy business APIs. Never substitute creator_id for channel_id.

- `creator_id` (string, optional). Opaque creator ID returned by creator_search.
- `url` (string, optional). Absolute creator channel URL for direct lookup.
- `platform` (string, optional).
- `channel_id` (string, optional). Raw platform channel id. Must be paired with platform.
- `detail` (boolean, optional, default false). When true, returns the detailed creator profile view.
