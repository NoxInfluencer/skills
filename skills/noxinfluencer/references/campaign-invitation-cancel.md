# Intelligent Campaign Invitation Cancellation

Use this workflow when the user asks to cancel queued invitations in the current intelligent marketing plan. Keep the Campaign ID supplied by the current page or conversation. Do not create, copy, select or modify another plan to satisfy this request. If the current Campaign ID is unavailable, ask for it before changing anything.

## Capability and scope

- Follow the Skill's selected execution backend. In CLI mode, inspect `noxinfluencer schema 'campaign invitations state'`. In MCP mode, use the runtime-exposed `campaign2_invitations_state` Tool with the same input fields; an unavailable Tool does not permit a CLI fallback.
- Read the current Campaign's queued invitation list to identify the requested creators and filters. Preserve returned `creator_id` values. Do not guess IDs or retrieve visible contact details to cancel invitations.
- Use `action: "cancel"` and `status_group: "queued"`. Submit the whole approved selection in **one batch request**, never a loop of single-creator cancellation calls.
- Choose exactly one batch selector: `targets` containing 1–1,000 creators, or `all_matching: true` with `expected_count` from the matching queued list and the same filters. Do not combine selectors, add a single `target`, or pass `task_id` to this batch operation.
- `status_group` is only valid for batch cancellation. Omitting it preserves the strict waiting-list behavior; use `queued` explicitly for the queued list.
- An explicit cancellation request already authorizes its stated scope. Do not ask for the same approval again. In CLI mode, use `--body-file` and `--force` for the approved mutation; dry-run only validates the request shape and does not cancel anything.

Example body for a selection (replace placeholders with actual current-plan values):

```json
{
  "campaign_id": "CURRENT_CAMPAIGN_ID",
  "action": "cancel",
  "status_group": "queued",
  "targets": [{"creator_id": "RETURNED_CREATOR_ID"}],
  "idempotency_key": "UNIQUE_KEY_FOR_THIS_APPROVED_OPERATION"
}
```

For all matching rows, replace `targets` with `all_matching: true`, `expected_count` and any applicable list filters accepted by the current schema. The maximum is 1,000 creators. Do not automatically chunk, broaden the selection or cancel a whole email task when the selected scope exceeds that limit.

## Concurrent sending and results

- Sending continues while cancellation is requested. The backend cancels eligible queued work and skips creators already sent, sending, uncertain, replied, or otherwise no longer cancellable. A successful response with zero cancellations is valid.
- Report the returned `cancelledCount` and `skippedCount` separately. Do not report the requested count as the cancelled count or claim that a sent message has been recalled. Earlier successful sends remain in history; eligible future queued rounds can still be cancelled.
- For `all_matching`, a shrinking queue is allowed. If the queue grows beyond the approved `expected_count`, the backend rejects the request; refresh the list and obtain the changed scope rather than silently cancelling extra creators.
- Preserve the original `idempotency_key` when checking or retrying an uncertain outcome. A lock/state conflict is not a successful cancellation: refresh current state and report the actual error before considering a retry. Never retry skipped creators by switching to the strict waiting scope or a single-cancel operation.
- When all rows are skipped, report that nothing was cancelled and refresh the queued list. Do not describe skipped rows as changed or sent successfully without delivery evidence.
