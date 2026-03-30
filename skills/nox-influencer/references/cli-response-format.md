# CLI Response Format

## API Commands (creator, monitor, quota)

Commands that hit the API server return this envelope:

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

Error responses include an `action` field with next-step guidance:

```json
{
  "success": false,
  "error_code": "INSUFFICIENT_CREDIT",
  "summary": "Insufficient credit quota",
  "action": {
    "type": "redirect",
    "url": "https://www.noxinfluencer.com/skills/usage-billing",
    "hint": "Subscribe or recharge to continue"
  }
}
```

## Local Commands (different format)

These commands have their own response structures — do not assume the API envelope:

| Command | Response format |
|---------|----------------|
| `doctor` | `{ "checks": [...], "ok": boolean }` |
| `auth` | `{ "success": boolean, "message": string }` |
| `schema` | Command schema JSON (no envelope) |

## Credit Costs

| Command | Cost |
|---------|------|
| `creator search` | 1 credit per result returned (dynamic) |
| `creator profile/audience/cooperation/content <id>` | 1 each |
| `creator *  <id> --detail` | 1 each |
| `creator contacts <id>` | 1 |

Video monitoring operations may have separate credit rules.
