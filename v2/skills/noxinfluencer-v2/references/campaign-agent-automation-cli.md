# Campaign Agent Automation CLI Adapter

Read the live schema with `node "{baseDir}/scripts/nox-cli.mjs" schema "campaign <group> <operation>"`. Every Campaign business command uses `--body-file <file-or-dash>`; put `campaign_id` in that JSON as a string, not a positional argument. Read-only operations also require a body file. An empty object is valid only where the schema permits it.

## Context, discovery and curation

For products, discover `product list`, `product get`, `product create` and `product update` with `schema`. Creation accepts known custom-product facts such as `{"name":"Analytics App","product_type":"custom","description":"Brief facts"}` without a fabricated link. Writes use `--force` and a stable `--idempotency-key`.

Use `campaign products add --body-file <path> --force` with `{"campaign_id":"42","product_collect_id":"returned-id","mode":"apply","idempotency_key":"stable-add-1"}` to import a center record. Alternatively supply `"product":{"name":"Analytics App","product_kind":"web-app","description":"Brief facts"}` instead of `product_collect_id` for a plan-only product. `mode` is required: `draft` saves only, `apply` applies only this product. Read the result's `changed`, `mode`, `product` and `settings`; use `campaign plan get` for subsequent verification. Do not perform a whole-plan `settings-apply` to finish a product-only request.

- Begin with `campaign context get` for the current Campaign, or `campaign plan list` when no plan is selected. Use applied settings for discovery; saving a draft does not apply it.
- Use `campaign plan init`, `create`, `get`, `settings-save`, `settings-apply`, `status`, `members`, `copy` and `overview` according to the live schema. Use the returned initialized ID for creation. Upload product images with `product image upload`.
- Read candidates with `campaign candidates list` and exclusions with `campaign not-interested list`. Example body: `{"campaign_id":"42","page_num":1,"page_size":20}`. Add platform/source/creator filters in the JSON only when supported. Read `data.items`, platform counts and page totals; preserve `creator_id`, `profile_status` and `plan_note`.
- Use `creator search` for interactive discovery evidence. Use `campaign discovery search` only when the authoritative context provides its required `task_id`; never invent one. Use `campaign discovery condition-get` and `condition-save` when maintaining the current search condition. Keep each search round's conditions, result summary and evidence in the Campaign conversation. Do not call `campaign discovery snapshot-save` or create a separate result snapshot; candidate writes and navigation do not depend on one. Do not rerun a search to recreate a historical page.
- Keep each search page's complete task-local JSON according to `command-execution.md`. Select candidates and copy their full returned creator tokens from that file; a shortened display must not cause another search. Local response retention is not a Campaign discovery snapshot write.
- Use `campaign candidates add/remove`, `campaign not-interested mark/restore` and `campaign invitation pending-add` for business transitions. Targets use verified creator tokens; do not rename tokens to raw channel IDs. The server enforces deduplication and protected states.
- Use `campaign auto-discovery settings-get/settings-save/settings-delete/switch` for existing automatic discovery settings. Do not add an Agent scheduler.

All writes require a stable JSON `idempotency_key` of 8–128 characters. Preserve it for the same attempt. The global `--idempotency-key` header does not supply this required body field. Writes default to local dry-run; use `--force` for authorized execution. Normal curation already authorized by the user does not require a new confirmation for each creator. Stop on authentication, quota and rate-limit errors.

## Cooperation and invitations

Read the shared cooperation and invitation references first. Use `campaign cooperations list/status-update/record-save`; preserve the returned raw `channel_id`, platform and version and read back after a write. Use schema-defined `campaign invitations` operations for list, metrics, sender options, settings, sequence, recipient preview, imports, task state and automation. A pending creator is not a sent invitation.

The current Campaign contract also includes `campaign invitations preflight/detail/readiness/regions/settings-reset`, `campaign auto-advance settings-get/settings-apply`, `campaign automations get/switch`, `campaign plan metrics`, `campaign notes save`, and cooperation `labels-list/label-create/label-update/label-delete/label-assign`. Read each live schema before constructing its JSON. Use `campaign invitations preflight` with the exact selected targets before a start preview. Copy `data.items[].invitation_sender` from sender-options into the draft's `settings.sender`; it uses `type` and `authInfoIds`, not the ordinary email task's `send_auth_type`. Do not erase Nox sender IDs.

Candidate/exclusion lists support declared `filters`, including `minSub`, `maxSub`, `regions`, `language`, and the numeric table selectors. Raw X identity filters require `channel_id` and `platform:3`; never fabricate a creator token. Invitation lists accept `min_sub`, `max_sub` and `regions`. Apply filters through the server, not to one downloaded page. Automatic discovery settings use `settings:{enabled,config}`. Full record-save uses `mode:"full"`; `mode:"inline"` is the Campaign partial-entry contract. Preserve `campaignName`, `version`, record status and identity in either mode. Restore supports explicit `relation_ids`; `select_all:true` is unsupported.

For an explicit request to add selected creators to the Campaign negotiation list, use `campaign cooperations add --body-file <path> --force` once per verified profile URL. Example body: `{"campaign_id":"42","creator_url":"https://www.youtube.com/channel/<verified-channel-id>","idempotency_key":"<stable per-creator attempt key>"}`. Read the live schema and the shared selected-set workflow first. The default without `--force` is local dry-run. Do not substitute `record-save`, `collection add-to-crm`, or `campaign invitations import-collection`. Read back the cooperation list before reporting additions.

When valid read operations return the same service rejection, stop trying alternative business bodies or other write destinations. Preserve the request ID and any `upstream_http_status` / `upstream_error_num` for diagnosis. A local dry-run cannot prove the upstream is reachable. Do not treat an upstream routing/authentication/deployment error as evidence that the user supplied the wrong creator or Campaign ID.

## Reviewed sending and deletion

Use `campaign invitations send` for both phases. Example preview body: `{"campaign_id":"42","action":"start","targets":[{"creator_id":"<verified token>"}],"idempotency_key":"<stable attempt key>","phase":"preview"}`. Preview calls the server without `--force`; `--dry-run` only shows a local request and cannot produce a review or token.

Show `data.review` and blockers; proceed only when `data.can_execute` is true and the user separately confirms the actual review. Preserve all reviewed business arguments and the attempt key; change only `phase` to `execute` and add `confirmation_token` from the preview plus `confirmed:true`. Execute with `--force`. Never substitute targets or copy. Tokens expire within five minutes; use the returned expiry and obtain a fresh review after expiration or changed facts.

After a timeout or unknown outcome, use `campaign invitations send-result` with `{"campaign_id":"42","execution_key":"<original attempt key>"}`. Keep `data.state` and any nested original result distinct; accepted is not sent or delivered. Do not generate a new key or resend an uncertain attempt.

`campaign plan delete` uses the same preview/execute confirmation protocol with the Campaign ID and stable attempt key. Deletion eligibility is decided by the server. Never invent a successful delete after an error.

## Showing completed work in the Campaign workspace

When working in an interactive SaaS Campaign conversation with the CLI, successful supported writes emit bounded workspace receipts. Preserve CLI stderr when redirecting business JSON to a file; do not fabricate or echo receipt markers. Ordinary reads, dry-runs, failures and explicit zero-change results do not request navigation. The platform waits for the final answer and a successful Run, then selects one destination. It never treats a navigation receipt as permission to send mail.

For an explicit request to view a page, or after verified work in message/CRM tools that has no automatic Campaign receipt, use `node "{baseDir}/scripts/nox-cli.mjs" campaign workspace-view <campaign_id> --destination <view>` once near the end of the turn. This is a read-only view request, not evidence that a business mutation succeeded. Read authoritative results before describing completed work; never use a view request to conceal a failed operation. Do not call it for incidental reads or background automation. Use `--help` to verify availability on the runtime; if unavailable, explain where the user can view the result without claiming that the page was changed.

| Result to show | Destination |
| --- | --- |
| Campaign summary / plan settings | `overview` / `plan_settings` |
| Search / candidates / unsuitable | `discovery` / `candidates` / `unsuitable` |
| Automatic discovery settings | `discovery_settings` |
| Pending / accepted dispatch | `invitation_pending` / `invitation_queued` |
| Sent, unread and unreplied / read but unreplied / replied / failed | `invitation_sent` / `invitation_read` / `invitation_replied` / `invitation_failed` |
| Plan or personal invitation copy | `invitation_settings` |
| Cooperation list / creator cooperation records | `cooperations` / `cooperation_record` |
| Conversation / automatic advancement settings / creator CRM | `messages` / `advance_settings` / `crm` |

For a specific creator, use `--channel-id` and `--platform` only with raw Campaign identities returned by verified tools. The platform numbers are 1 YouTube, 3 Twitter, 6 Instagram and 10 TikTok. Do not rename encrypted `creator_id` values into channel IDs or perform a per-creator profile lookup solely to navigate. If raw identity is unavailable, show the corresponding list instead of inventing it. `cooperation_record` and `crm` require a creator identity; they open that creator's cooperation/CRM drawer.

After discovery, show the actual destination list after a confirmed business write. Read-only searches remain in the conversation; opening `discovery` shows the search workspace, not a saved historical result page. After curation, prefer Invitation Pending when creators advanced there; secondary unsuitable results remain available as links. Restoring unsuitable creators goes to Candidates. Accepted dispatch goes to the queue, never to Sent; Failed belongs to Invited / Bounced in the current UI. A send preview opens read-only invitation settings; the exact proposed recipients, content and confirmation remain in the conversation and still require the existing second-confirmation workflow.

Automatic navigation is suppressed if the user moved away, is editing, has an open dialog, or is in another tab. History and other sessions retain manual result links. Do not promise that navigation happened merely because a receipt was emitted. This page-coordination channel applies to the SaaS CLI runtime; external MCP clients do not share the user's browser navigation channel.

### Bulk cancellation

Use `node "{baseDir}/scripts/nox-cli.mjs" campaign invitations state --body-file cancel.json --force` once. This command takes `campaign_id` inside JSON, not as a positional argument. Without `--force`, it only previews the request.

```json
{"campaign_id":"<returned Campaign ID>","action":"cancel","status_group":"queued","targets":[{"creator_id":"<first returned token>"},{"creator_id":"<second returned token>"}],"idempotency_key":"cancel-selection-001"}
```

For an authorized all-matching selection, replace `targets` with `all_matching: true`, `expected_count`, and the exact supported filters described in the shared reference. Keep `status_group: "queued"` for the queued list; omit it or use `waiting` for strict waiting cancellation. Report `data.cancelledCount` and `data.skippedCount` separately. When everything was skipped, the CLI emits no changed-workspace receipt. Do not issue repeated single-creator commands. If the installed schema lacks these fields, report the CLI/server deployment gap instead of falling back to a loop.

## Unread reminder after automatic advancement

For every Campaign creator-reply automation run, follow the final check in `campaign-agent-automation.md`. Retain the exact opaque `thread_id` returned by message tools; do not construct one from a channel or Campaign ID.

When this run has not actually sent a message, use `node "{baseDir}/scripts/nox-cli.mjs" message projects <thread_id> --json` to reread the matching task's `last_message_direction` and `unread_count`. If it is inbound and still read, execute:

```bash
node "{baseDir}/scripts/nox-cli.mjs" message mark-unread <thread_id> --force --idempotency-key <stable-run-and-thread-key> --json
```

The enabled automatic-advancement task authorizes this scoped unread reminder; no additional customer confirmation is needed for marking unread. This authorization does not change send or schedule permissions. Reuse the same key for retries of this reminder, but use a new key for a later run. The command checks current state again and returns `changed`, `unread_count`, and `reason` (`marked_unread`, `already_unread`, or `latest_message_not_inbound`). A skipped result is not a new unread mark.

Finish all content reads before marking unread. Afterward, never call `message get` just to verify: it clears unread again. If verification is needed, use `message projects` (with `--status assignment` for an assigned thread). If the installed CLI lacks `message mark-unread` or the server rejects it, report the deployment/capability gap; do not fall back to direct HTTP or claim success.
