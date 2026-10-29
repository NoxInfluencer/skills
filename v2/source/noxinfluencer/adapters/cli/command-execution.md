# Standalone CLI Command Execution

Use the installed CLI schema as the runtime authority for exact command paths, arguments, enums, limits, mutation status, and examples. The versioned build snapshot validates this Skill's known command identifiers, but the live `node "{baseDir}/scripts/nox-cli.mjs" schema <cmd>` result controls the current invocation.

## Preflight And Discovery

1. Run `node "{baseDir}/scripts/nox-cli.mjs" doctor` when setup or failure cause is unclear, and fix only the reported missing requirement.
2. Run `node "{baseDir}/scripts/nox-cli.mjs" schema --all` after installation changes or when the command tree may be stale.
3. Run `node "{baseDir}/scripts/nox-cli.mjs" quota` before a charged workflow when quota state is unknown. Use `node "{baseDir}/scripts/nox-cli.mjs" pricing tools --charged-only` for current charged-action prices and `node "{baseDir}/scripts/nox-cli.mjs" quota usage --days 7` for recent consumption.
4. Before an unfamiliar operation, read `node "{baseDir}/scripts/nox-cli.mjs" schema <cmd>` and use the exact declared command, argument, and option names. Never infer a command from a page route or display label.

## JSON-First Inputs

CLI output is JSON by default. Complex filters and mutations are JSON-first: when schema reports `supports_body_file: true`, send the minimal declared object through `--body-file <path>` or `--body-file -` for standard input. Keep cursors and opaque identifiers byte-for-byte unchanged, and never guess an undocumented field.

Known workflow anchors include `creator search`, `monitor add-task`, `campaign plan list`, `collection add-creators`, `email send`, `message send`, `crm batch-update`, `product create`, `affiliation stores list`, `brand-monitor search`, `dispute report`, `export download`, `feedback submit`, and `file image upload`. Read each exact schema before use; the anchors do not replace command discovery.

## Search Result Reuse

Save the complete JSON response from each creator search or lookalike page in a distinct file under the current task's workspace before producing a compact summary. Retain its platform, exact query body and cursor, and Campaign or conversation association. Use a new filename for a different task or page, and preserve stderr so failures and workspace receipts remain observable.

For example, after choosing a task-local `$result_file` and checking the live schema:

```bash
node "{baseDir}/scripts/nox-cli.mjs" creator search --platform youtube --body-file search.json > "$result_file"
```

Check the CLI exit status and the saved response's `success` and `data` before using its items. Parse the saved JSON to summarize and select creators, then build candidate or other follow-up payloads from the selected original items in that same file. Keep opaque identifiers unchanged; shortened IDs, display names and rendered tables are not write identities. A compact display is safe only while the complete records remain available locally.

Do not pipe the only copy through `head` or discard fields before saving it. Do not repeat a paid search merely to retrieve a full ID, change presentation, recount items or construct a write payload. A different query, a requested fresh search or the next page is a new retrieval; keep the user's intended scope and pagination limits. If the saved result is missing or invalid, treat it as unavailable evidence rather than reconstructing identities or claiming an old page was recovered. Search evidence does not replace a required current-state or permission check before a write.

## Writes, Approval, And Idempotency

- A write without `--force` remains a dry-run or server preview when the command supports that contract. Do not report a dry-run as completion.
- For a staged workflow, run `validate`, then `preview`, show the exact effective objects, business payment impact, destructive effect, and partial-failure policy, and use `apply --force` only after the required approval. Follow the main Skill's reporting rule for routine Skill Credit details.
- For a direct write, use `--dry-run` when supported and pass `--force` only after the user has approved that exact object and action. Re-read state before high-risk sends, schedules, deletes, charged unlocks, or broad batch writes.
- Non-GET writes use an `Idempotency-Key`. Preserve the generated retry identity for status recovery; use `--idempotency-key` only when an automation caller already owns a stable key.
- After an ambiguous write timeout, do not repeat the mutation until an idempotent retry or status read proves it is safe.

## Responses And Errors

API-backed success responses use the standard envelope fields `success`, `data`, `summary`, and `meta`; a legacy `credits` field is compatibility data rather than the primary quota model. Preserve returned identifiers, pagination, task state, `failed_items`, and server-provided action guidance.

Use a service-provided action URL unchanged. If a quota response has no action and the user is communicating in Chinese, use the trusted Chinese Skills dashboard fallback at `https://cn.noxinfluencer.com/skills/dashboard`; for other languages use `https://www.noxinfluencer.com/skills/dashboard`. Do not rewrite, localize, or append parameters to a returned action URL.

Local commands such as `doctor`, `auth`, `env`, and `schema` use their native output instead of the API envelope. Use `node "{baseDir}/scripts/nox-cli.mjs" agent exit-codes` to distinguish retryable rate or dependency failures from validation and authentication failures. Never expose raw credentials, stack traces, or internal request details.

## Execution Route And Capability Gaps

Use the CLI or its connected CLI Connector for NoxInfluencer business operations. Check current schema/help before declaring an operation unavailable. Authentication, permission, quota, network failure and missing capability have different recovery paths. None authorizes switching to SaaS browser automation. Explicitly requested SaaS operations use an external browser; never use an embedded browser that can displace the user's session. Login, authorization and billing remain user-completed steps. A returned action URL is recovery guidance, not approval to operate the page.

For sample tracking, inspect runtime schema for native logistics before execution. The pinned private capability catalog does not currently declare logistics support; do not assume public documentation makes it available. When supported, saved tracking reads differ from charged registration/updates, partial imports require failed-row recovery, and Loading or empty events do not prove delivery. Tracking does not purchase labels or dispatch parcels.
