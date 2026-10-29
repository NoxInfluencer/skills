# Campaign Cooperation Management

For showing verified cooperation, message or CRM work in the SaaS Campaign workspace, use the page-coordination guidance in `{baseDir}/references/campaign-agent-automation.md`.

Campaign cooperation is scoped by both `campaign_id` and the creator's platform identity. It is separate from global CRM cooperation history: use the Campaign cooperation tools when the user asks about a creator's state inside one Campaign.

## Read before writing

- Read the current Campaign cooperation list before changing a status or editing a record.
- Preserve the row's `channelId` and `platform`, and the formal record's `id` and `version` exactly. Never use a display name as identity.
- Use the runtime's Campaign cooperation list with a bounded page and the requested status filter. The workspace uses `negotiating`, not the CRM record value `pending`. The server does not support a platform filter on this workspace list; do not simulate one by filtering a page. Treat missing fields as unknown.

The workspace list returns row fields `channelId` and numeric `platform`; map `channelId` to the write argument `channel_id`. Its row-level `cooperationStatus` uses lowercase workspace values, including `negotiating`. The matching row's `cooperationRecord` holds the formal record `id`, `version`, editable commercial fields and lowercase CRM status, including `pending`. Read that formal record's status for record-save. A row without `cooperationRecord` is not an existing formal record; do not invent an ID or version for it.

Workspace row IDs may repeat across different creators; identify a row by the current Campaign, numeric platform and `channelId`. The list represents each creator's current cooperation state. Unknown stored states must not be guessed as a normal status; if a read cannot confirm the source data, stop dependent writes and report that limitation.

## Statuses

Use the exact enum for the operation being called. These values are checked against the active operation schemas:

| Surface | Legal status values |
| --- | --- |
| `cooperations_list.status` | `all`, `negotiating`, `confirmed`, `publishing`, `published`, `completed`, `cancelled` |
| `cooperations_record_save.cooperationStatus` | `pending`, `confirmed`, `publishing`, `published`, `completed`, `cancelled` |
| `cooperations_status_update.status` | `NEGOTIATING`, `CONFIRMED`, `PUBLISHING`, `PUBLISHED`, `COMPLETED`, `CANCELLED` |

The workspace's `negotiating`, a formal record's `pending`, and the status-update value `NEGOTIATING` describe the same stage through different contracts. Other workspace/record status values map to status-update by the explicit table above. Do not copy a display label, change case heuristically, or infer a later state from an email reply alone. Check the active runtime schema before a write; preserve unknown fields as unknown.

## Add a selected creator set

An explicit request to add creators to a Campaign's cooperation management authorizes manual creation for those selected creators. Resolve the current `campaign_id` from the current page/conversation and verify it with Campaign context. If no plan is identified, list plans or ask which plan; never choose account-level CRM as a substitute.

Read only the selected search results or bounded collection pages. Preserve the verified public creator profile URLs returned by those tools; do not construct a URL from an encrypted creator token. If a selected creator has no profile URL, retrieve only the missing identity with an available read capability or report that creator as unresolved.

Use the Campaign cooperation-add capability described by the selected runtime adapter. This reuses the page's manual-add workflow to enter the current Campaign negotiation list. It does not create a formal CRM cooperation record, fabricate an email reply, change an existing creator's cooperation state, or send outreach. The business service performs Campaign permission checks and duplicate detection and maintains the same manual-source/message-center relationships as the page.

There is no exposed collection-to-Campaign-cooperation bulk import operation. Read the user's selected collection members with bounded pagination, deduplicate their verified URLs, and call cooperation add once per selected creator. Campaign invitation collection-import adds invitation-pending creators, not cooperation members. Never replace the requested destination with account-level CRM collection import.

Each add uses `campaign_id` as a string, `creator_url`, and a stable distinct `idempotency_key` per creator and operation. Execute sequentially in bounded batches within the user's selected scope. Read existing cooperation pages once per batch and read back after the batch; avoid a full list or profile fetch for every creator. Stop the remaining batch on authentication, quota, rate-limit, upstream availability, or repeated identical validation errors. Report verified additions, existing members, failures, unknown outcomes and unattempted creators separately. Preserve each attempt key and read state before retrying an unknown write. A duplicate rejection is not a new successful addition.

Record-save is a separate cooperation detail operation. `mode: "full"` requires a cooperation name, version, status, type, delivery platforms and formats. `mode: "inline"` uses the Campaign partial-entry endpoint and can preserve unknown commercial terms. Both modes still require `campaignName`, `cooperationStatus`, and a version; new records use version 0, edits use the returned record ID and current positive version. The adapter converts the numeric Campaign platform to the CRM string and derives the upstream UUID from the attempt key. Do not use record-save for identity-only membership or invent commercial fields.

CRM record statuses use `pending`, `confirmed`, `publishing`, `published`, `completed`, and `cancelled`; status-only Campaign transitions use the uppercase Campaign states above. Keep these contracts separate. Only declared record fields are writable; currency, fulfillment progress and arbitrary content fields are not supported by this save endpoint. Use returned `estimatedViews`/`actualViews` and preserve explicit unknown values.

Record-save checks the actual full and inline field rules before a write. The name allows 60 UTF-16 code units after trimming, and the remark allows 200. Publish dates use real `YYYY-MM-DD` calendar dates. USD cost must fit `DECIMAL(18,2)` and the active schema's precision/scale limits; use decimal text to preserve cents. For view counts beyond the safe JSON integer range, use exact decimal strings and retain large returned counts as strings. Never round an identity, version or count through floating-point arithmetic.

Both full and inline save replace the editable record. Inline permits unknown commercial terms; it is not a patch. Before editing an existing record ID, read the matching Campaign list row's `cooperationRecord`, retain every current editable field, and change only what the user requested. The edit schema requires all commercial, date, remark and view fields because omission clears them on the server. Copy known null/empty values exactly; if a current field is missing or the read is incomplete, do not guess a replacement or write. Use status-update for a status-only change.

Automatic CRM creation uses an actual boolean and a complete creator snapshot whose platform and channel match the selected identity. It still requires the business service to verify the current creator and account scope. A readable snapshot does not grant permission or prove the creator exists. Unknown or conflicting commercial fields must be resolved rather than filled with guessed enum values.

## Writes

- Use the runtime's cooperation status-update for a status-only transition.
- Use cooperation record-save for supported record fields such as type, USD fee, delivery formats, publish dates, views and remark.
- Include the record `version` when the list returned one. If the service reports a stale version, reread the record and ask the user how to resolve conflicting edits.
- A save accepted by the service means the operation was accepted; reread the Campaign cooperation list before reporting the final state.

For a stale version, use the returned cooperation conflict reason to read the latest record. For a persistence failure, a write followed by failed readback, or an unrecognized business error, preserve the original attempt and read authoritative state; do not obtain a new attempt key and repeat the write. These outcomes do not prove that the business mutation was rejected.

Do not create a Campaign cooperation record merely because a creator replied. The business service decides when a real reply enters cooperation; manual creation requires an explicit user request.

Label list/create/update/delete manage the account's existing cooperation labels. Label assignment is Campaign-scoped and does not create a cooperation record or change its status. The `notes save` operation edits a USER plan note using `previous_plan_note` for conflict protection; use it only for an explicit user edit. AI selection reasons belong in the relevant candidate, invitation or cooperation action and must not overwrite USER notes.

Choose label IDs from the current account label list. Names are trimmed at their ASCII control/space edges and limited to 100 UTF-16 code units; an active same-name label is a conflict, including concurrent writes. Do not invent an ID or retry a duplicate with a different account. Notes use the exact stage values `CANDIDATE`, `UNSUITABLE`, `INVITATION`, and `COOPERATION`; both the new text and `previous_plan_note` allow at most 512 UTF-16 code units. Preserve the previous text exactly, including an empty string. A stale-note rejection requires reading the current note before another edit.

Read automatic-advancement settings through `auto-advance settings-get`. Apply only the intended advancement fields with `settings-apply`; this does not apply unrelated plan edits or change switches. Existing discovery, invite and advance switches are available through `automations get/switch`. The Campaign master switch still gates automatic work; changing one module does not authorize an immediate send or payment.

An advancement patch may contain only scope, instruction, confirmation points, payment method and payment schedule fields declared in the active schema. Omitted fields stay unchanged in their respective draft and applied snapshots. A submitted scope must be nonempty and use exact enum values. A submitted nonempty payment schedule must have distinct valid node types, complete integer percentages, and a total of 100. Use null or an empty schedule only when the user intends to clear it. Instructions allow at most 10,000 UTF-16 code units. The module switch uses only `discovery`, `invite`, or `advance` with an actual boolean; read back the authoritative module states after a change.
