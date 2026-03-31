# CLI Response Format

## API-backed Commands

These commands return the standard API envelope:

- `creator ...`
- `monitor ...`
- `quota`
- `pricing`

Successful responses include `success`, `data`, `summary`, and `meta`. Some current endpoints may also include a legacy compatibility field named `credits`.

Notes:

- Treat `quota` response data as the canonical Skill quota snapshot
- `pricing` returns membership plans, not per-action cost
- Some current API envelopes may still include a legacy `credits` field for compatibility; do not treat it as the primary quota model

Error responses include an `action` field with next-step guidance:

```json
{
  "success": false,
  "error_code": "INSUFFICIENT_CREDIT",
  "summary": "Insufficient credit quota",
  "action": {
    "type": "redirect",
    "url": "https://www.noxinfluencer.com/skills/usage-billing",
    "hint": "Open billing to renew or upgrade your available quota."
  }
}
```

The current server may still use legacy wording like `INSUFFICIENT_CREDIT` or `Insufficient credit quota`. Interpret that as "Skill quota is exhausted" for user communication.

## Local Commands (different format)

These commands have their own response structures — do not assume the API envelope:

| Command | Response format |
|---------|----------------|
| `doctor` | `{ "checks": [...], "ok": boolean }` |
| `auth` | `{ "success": boolean, "message": string }` |
| `schema` | Command schema JSON (no envelope) |
