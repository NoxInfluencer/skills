# CLI Response Format

All `noxinfluencer` CLI commands return a unified JSON response structure.

## Success Response

```json
{
  "success": true,
  "data": { },
  "summary": "Found 15 makeup YouTube creators in US",
  "credits": { "used": 15, "remaining": 185 },
  "meta": {
    "request_id": "uuid",
    "latency_ms": 1200,
    "data_freshness": "2026-03-10T12:00:00Z"
  }
}
```

## Error Response

```json
{
  "success": false,
  "data": null,
  "summary": "API key is invalid or does not exist",
  "error_code": "INVALID_API_KEY",
  "credits": null,
  "meta": { "request_id": "uuid", "latency_ms": 50 }
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the request succeeded |
| `data` | object/null | Endpoint-specific payload; `null` on error |
| `summary` | string | Human-readable summary of the result |
| `error_code` | string/null | Error identifier; `null` on success. See [error-codes.md](error-codes.md) |
| `credits` | object/null | Credit usage info; `null` on auth errors |
| `credits.used` | number | Credits consumed by this request |
| `credits.remaining` | number | Credits remaining in the current period |
| `meta.request_id` | string | UUID for request tracing |
| `meta.latency_ms` | number | Server-side processing time in milliseconds |
| `meta.data_freshness` | string | ISO 8601 timestamp of when the upstream data was last refreshed |

## Credit Costs

| Action | Cost |
|--------|------|
| `search_creators` | 1 credit per result returned (dynamic) |
| `get_creator_profile` | 1 |
| `get_creator_audience` | 1 |
| `get_creator_cooperation` | 1 |
| `get_creator_content` | 1 |
| `get_creator_profile_detail` | 1 |
| `get_creator_audience_detail` | 1 |
| `get_creator_content_detail` | 1 |
| `get_creator_cooperation_detail` | 1 |
| `get_creator_contacts` | 1 |

Video monitoring operations may have separate credit rules.
