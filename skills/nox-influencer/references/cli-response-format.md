# CLI Response Format

## API-backed Commands

These commands return the standard API envelope:

- `creator ...`
- `monitor ...`
- `quota`
- `pricing`

Successful responses include `success`, `data`, `summary`, optional `credits`, and `meta`.

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
