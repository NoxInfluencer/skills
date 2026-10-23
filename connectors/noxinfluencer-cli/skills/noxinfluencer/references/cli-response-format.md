# CLI Response Format

## API-backed Commands

API-backed business commands normally return a JSON envelope. File downloads and local helpers have different outputs; follow the individual command schema.

Successful responses include `success`, `data`, `summary`, and `meta`. Some current endpoints may also include a legacy compatibility field named `credits`.

Notes:

- Treat `quota` response data as the canonical Skill quota snapshot
- `pricing` returns membership plans; `pricing tools` returns current server-side per-action Skill Credit prices
- `quota usage` returns historical calls, credits, trend, and recent activity for cost analysis
- Some current API envelopes may still include a legacy `credits` field for compatibility; do not treat it as the primary quota model
- Mutation commands default to dry-run; `--force` executes the write after user approval
- Non-GET writes automatically use `Idempotency-Key`; `--idempotency-key` can override it for automation
- JSON-first commands declare `supports_body_file: true`; check schema for whether the body is required and which fields are documented. A missing field description does not by itself prove the operation is unsupported
- `export download` writes binary data to `--output`, not stdout

Error responses may include an `action` field with recovery guidance. Interpret it under the Skill's Execution Route; a URL does not authorize browser automation:

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
| `env` | `{ "success": true, "data": { "environment": string, "server_url": string } }` |
| `schema` | Command schema JSON (no envelope) |
| `agent exit-codes` | Stable CLI exit-code catalog |

## Agent Diagnostics

- Use `--trace-json` when a harness or eval needs structured request traces on stderr.
- Check the installed version and `schema --all`, then the exact operation's schema/help. Version output alone is insufficient if a local/global install has stale compiled files. Missing commands may require an upgrade; missing permissions or failed requests require their own recovery. If a current package still lacks the operation, report the specific capability gap and pause only dependent work.
- Use `noxinfluencer agent exit-codes` to distinguish retryable failures such as rate limits or temporary upstream failures from invalid requests and auth problems.
- For non-JSON failures, report the HTTP or transport evidence without inventing an `action` or a specific auth/quota cause. Configured local credentials do not prove API access.
- Use `doctor` as the first diagnostic step when the failure cause is unclear.
