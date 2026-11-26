# MCP tools for marketing-plan

## `campaign2_auto_advance_settings_apply`

Apply only submitted automatic advancement fields; does not apply unrelated plan drafts or change any switch.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `settings` (object, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_auto_advance_settings_get`

Read the auto-advance settings for the selected intelligent marketing plan.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_auto_discovery_settings_delete`

Delete automatic discovery settings. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_auto_discovery_settings_get`

Read automatic discovery settings. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.

## `campaign2_auto_discovery_settings_save`

Save automatic-discovery settings as {enabled,config}; the selected campaign_id determines scope. Saving does not start discovery.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `settings` (object, required). Configuration replacement: omitted/null config clears to {}; omit/null enabled preserves the current switch. Use switch for switch-only changes. Read current settings and preserve wanted configuration.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_auto_discovery_switch`

Enable or disable automatic discovery. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `enabled` (boolean, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_automations_get`

Read which automation settings are active for the selected intelligent marketing plan.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_automations_switch`

Set one existing module switch. The campaign master switch still gates automatic work; this does not immediately send mail.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `enabled` (boolean, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `module` (string, required).

## `campaign2_candidates_add`

Add creators returned by creator_search to a Campaign candidate list. Pass the encrypted search/profile creator_id in each target; the server converts it to the raw platform channel ID before calling Campaign2. Do not pass creator_id as channel_id.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `source` (string, optional).
- `targets` (array of see live schema, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_candidates_list`

Read the current Campaign candidates list with pagination, platform counts, profile status and plan notes. For YouTube, Instagram and TikTok pass returned creator_id directly to Campaign write targets. X (platform 3) has creator_id=null and raw channel_id; creator-token tools do not support X.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `platform` (integer, optional). 1 YouTube, 3 X, 6 Instagram, 10 TikTok. Omit for all platforms.
- `source` (string, optional).
- `creator_id` (string, optional). Encrypted creator ID for exact identity filtering; never a relation_id.
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).
- `channel_id` (string, optional).
- `filters` (object, optional). Server-side table filters: OR within a field, AND between fields; applied before pagination.

## `campaign2_candidates_remove`

Remove creators from Campaign candidates. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `targets` (array of see live schema, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_context`

Read the authorized Campaign detail and discovery settings. data.campaign.inputOptions.targetMarkets contains current country wire values and status; copy items[].value when status=ok. Unavailable options are not an empty allowed set. inputOptions is read-only and must not be submitted as settings.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_cooperations_add`

Add one creator by verified public profile URL to the Campaign negotiation list using the page's manual-add workflow. Does not create a formal CRM cooperation record or send outreach. Read back the cooperation list; do not overwrite existing cooperation states.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `creator_url` (string, required). Verified HTTP(S) public profile URL on the declared profile hosts, with a nonempty path and no credentials, port or whitespace; never invent a URL from an encrypted creator token.
- `website` (string, optional, default "en"). Language site for the existing manual-add system message.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `plan_note` (string, optional). Concise AI reason for this cooperation-stage action. Replaces AI notes only; user-written notes are preserved.

## `campaign2_cooperations_label_assign`

Assign cooperation labels to the selected Campaign cooperation records.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema, required).
- `label_id` (string, required). Campaign ID, kept as a string.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_cooperations_label_create`

Create a cooperation label for a Campaign.

- `label_name` (string, required). Name is Java-trimmed before validation and writing; at most 100 UTF-16 code units, and not blank. CLI/claw apply the same normalization.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_cooperations_label_delete`

Delete the selected Campaign cooperation label.

- `label_id` (string, required). Campaign ID, kept as a string.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_cooperations_label_update`

Update the selected Campaign cooperation label.

- `label_id` (string, required). Campaign ID, kept as a string.
- `label_name` (string, required). Name is Java-trimmed before validation and writing; at most 100 UTF-16 code units, and not blank. CLI/claw apply the same normalization.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_cooperations_labels_list`

List cooperation labels for the selected Campaign.

- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `campaign2_cooperations_list`

Read the cooperation workspace with its actual status and counts. Platform filtering is not supported by this server endpoint.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `status` (string, optional, default "all").
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `campaign2_cooperations_record_save`

Save shared CRM cooperation details: mode full requires complete commercial fields; mode inline uses the Campaign partial-entry endpoint. New records use version 0, edits use the returned id/version. The adapter converts platform identity and derives a stable UUIDv4 requestId.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `channel_id` (string, required).
- `platform` (integer, required).
- `id` (string, optional).
- `version` (integer, required).
- `cooperationStatus` (string, required).
- `cooperationType` (string or null, optional).
- `cooperationCostUsd` (number or string or null, optional). Nullable exact USD amount fitting DECIMAL(18,2), maximum 9999999999999999.99; at most 18 significant digits and scale at most 2. Use decimal text to preserve cents.
- `cooperationSocialPlatforms` (array or null, optional).
- `cooperationFormats` (array or null, optional).
- `plannedPublishAt` (string or null, optional).
- `actualPublishAt` (string or null, optional).
- `remark` (string or null, optional).
- `autoCreateCrmCreator` (boolean or null, optional).
- `crmCreatorSnapshot` (object or null, optional).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `campaignName` (string, required).
- `estimatedViews` (integer or string or null, optional). Exact nonnegative signed-Long count; use decimal text beyond the safe JSON integer range.
- `actualViews` (integer or string or null, optional). Exact nonnegative signed-Long count; use decimal text beyond the safe JSON integer range.
- `mode` (string, optional, default "full"). full requires a complete CRM record; inline uses Campaign partial-entry rules without inventing unknown terms.

## `campaign2_cooperations_status_update`

Update one Campaign creator cooperation status. Use the current cooperation record and version when available.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `channel_id` (string, required).
- `platform` (integer, required).
- `status` (string, required).
- `version` (integer or null, optional).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `plan_note` (string or null, optional). Concise AI reason for this cooperation-stage action. Replaces AI notes only; user-written notes are preserved.

## `campaign2_discovery_search`

Search creators for Campaign discovery. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `task_id` (string, required). Positive Long correlation task ID. Does not authorize access to source-task results.
- `platform` (integer, required).
- `source_type` (integer, optional, default 1).
- `source_task_id` (string, optional). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `search_condition_snapshot` (object, required). Flat creator-search criteria, not the ordinary-page wrapper. Omit unset fields; null values are rejected. searchWords/excludeWords are complete keyword/target string pairs; targets must be 1, 2, 3, or 5. Reuse search_after exactly; do not put paging/execution fields inside this object.
- `execution_protocol_version` (integer, optional, default 1).
- `search_after` (string, optional).
- `page_size` (integer, optional).

## `campaign2_discovery_snapshot_get`

Read one historical Campaign discovery search condition and bounded creator result page.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `snapshot_id` (string, required). Positive signed-64-bit snapshot ID as a string.

## `campaign2_discovery_snapshot_save`

Save an immutable completed discovery page with resolved creator identities. Does not run a search or add candidates. Reuse request_id only for the same page payload; normal Campaign discovery uses conversation/list history instead of extra snapshots.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `request_id` (string, required). Stable request identity for this immutable page; a changed payload requires a different request_id.
- `platform` (integer, required).
- `condition` (object, required). Actual structured search conditions; embedded platform must equal the page platform.
- `page_num` (integer, required).
- `page_size` (integer, required).
- `creators` (array of object, required). Actual page order, no repeated identity; size must not exceed page_size. Empty results may be saved.
- `source_run_id` (string or null, optional). Canonical lowercase Run UUID for traceability; never an arbitrary label.
- `applied_version` (integer or string or null, optional). Applied settings version used for this page; use an exact decimal string above the safe JSON integer boundary.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_discovery_snapshots_list`

List bounded historical Campaign discovery search summaries by cursor.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `before_id` (string, optional). Positive signed-64-bit snapshot ID as a string.
- `limit` (integer, optional, default 20).

## `campaign2_invitation_pending_add`

Move creators returned by creator_search directly to invitation pending. Pass encrypted creator_id values; the server converts them to raw platform channel IDs.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `targets` (array of see live schema, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_invitations_automation_get`

Read invitation automation settings for the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_invitations_automation_switch`

Change the invitation automation switch for the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `enabled` (boolean, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_invitations_detail`

Read actual invitation history and frozen plaintext for one creator. Use optional dispatch_task_id from a previous detail response to pin the same task or legacy message bounds; omit for latest history. Does not prepare, apply, send or unlock contacts.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema, required).
- `dispatch_task_id` (string or null, optional). Optional dispatchTaskId copied exactly from detail response. A positive Long task ID or legacy:<receiverId>:<messageId>; omit to read latest history.

## `campaign2_invitations_import_collection`

Import creators from a collection into the selected Campaign's invitation workflow.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `group_id` (string, required).
- `platform` (integer, required).
- `select_all` (boolean, optional, default false). True imports the collection across all four supported platforms in bounded batches; use no targets. False requires explicit targets from the selected platform.
- `targets` (array of see live schema, optional).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_invitations_list`

Read the current invitation list. pending allows waiting or queued; sent allows unreplied, readUnreply, replied or bounce. Failures, bounces and uncertain delivery results are in sent/bounce. Do not use pending/failed. Uses scoped Campaign permissions and preserves actual unknown, empty and zero values.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `view` (string, optional, default "pending").
- `status_group` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).
- `min_sub` (integer or string or null, optional).
- `max_sub` (integer or string or null, optional).
- `regions` (array of string, optional).

## `campaign2_invitations_metrics`

Read invitation metrics for the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_invitations_preflight`

Check the exact 1–100 selected pending creators without creating a task, unlocking email or charging sending quota. This is the authoritative contact and configuration diagnosis.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `targets` (array of see live schema, required).

## `campaign2_invitations_readiness`

Check invitation readiness for the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_invitations_recipient_preview`

Preview the selected invitation recipients.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema, required).

## `campaign2_invitations_regions`

Read the current invitation region options. pending allows waiting or queued; sent allows unreplied, readUnreply, replied or bounce. Failures, bounces and uncertain delivery results are in sent/bounce. Do not use pending/failed. Uses scoped Campaign permissions and preserves actual unknown, empty and zero values.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `view` (string, optional, default "pending").
- `status_group` (string or null, optional, default null).

## `campaign2_invitations_send`

Preview actual recipients, sender, effective content and schedule, then wait for explicit second user confirmation before execute. Start: 1–100 creators; resend/retry: one. Unknown results must be queried, never automatically resent.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `action` (string, required).
- `targets` (array of see live schema, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `phase` (string, required).
- `confirmation_token` (string, optional).
- `confirmed` (boolean, optional).

## `campaign2_invitations_send_result`

Read the original sending attempt by its idempotency key. Accepted does not mean sent or delivered.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `execution_key` (string, required).

## `campaign2_invitations_sender_options`

Read sender accounts for this Campaign through its unique invitation project and creator-owned account directory. Returns all available Gmail, enterprise, Outlook and Nox business identities. auth_info_id and primary_project_id are exact decimal strings. Copy invitation_sender for available accounts into settings.sender; account_settings_read_only describes account management, not Campaign send permission. This is read-only and does not confirm sender selection, quota or sending.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_invitations_sequence`

Read the invitation sequence for the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_invitations_settings_apply`

Apply invitation settings to the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema or null, optional, default null).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_invitations_settings_get`

Read invitation settings for the selected Campaign.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema or null, optional, default null).

## `campaign2_invitations_settings_reset`

Discard unapplied invitation edits in the plan or one creator scope. Preserves applied settings and sent history.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema or null, optional).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_invitations_settings_save`

Save an invitation draft with readable content. Sender uses type (1 Gmail, 2 enterprise, 3 Nox, 4 Outlook) and authInfoIds from sender-options; aliases are normalized. Does not apply settings or send email. In target scope, provide a non-empty rounds array from settings-get and preserve its structure. Legacy contents-only settings are for global scope. For a frozen legacyContents journey, preserve all round timing fields and edit copy only.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema or null, optional, default null).
- `settings` (object, required). Read settings-get first and preserve unchanged fields. Drafts may be incomplete. Use sender.type and sender.authInfoIds from sender-options; Nox type 3 preserves selected business sender IDs. Only content and timing are editable in a target scope. In target scope, provide a non-empty rounds array from settings-get and preserve its structure. Legacy contents-only settings are for global scope. For a frozen legacyContents journey, preserve all round timing fields and edit copy only.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_invitations_state`

Change invitation state. Bulk cancel waiting or queued invitations in ONE request with targets (1-1000 creators), or all_matching plus expected_count and optional min_sub/max_sub/regions filters. For queued cancellation set status_group=queued: creators already sent, sending, uncertain, replied or otherwise changed are skipped; other cancellable creators continue. Report data.cancelledCount and data.skippedCount, including zero cancellations. Waiting is the default strict scope. Never loop single-creator cancellation for a batch. Choose exactly one scope: target, task_id, targets, all_matching. Batch scopes only support action=cancel; status_group is only valid with targets or all_matching. All-matching queued counts may shrink but must not grow beyond expected_count.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `action` (string, required).
- `target` (see live schema or null, optional, default null).
- `task_id` (string or null, optional, default null).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `targets` (array of see live schema, optional, default []).
- `all_matching` (boolean, optional, default false).
- `expected_count` (integer or null, optional, default null).
- `min_sub` (integer or string or null, optional).
- `max_sub` (integer or string or null, optional).
- `regions` (array of string, optional, default []).
- `status_group` (string or null, optional, default null). Batch cancellation only. queued skips completed or changed creators; waiting (default) uses strict cancellation.

## `campaign2_invitations_task`

Read the selected Campaign invitation task.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `task_id` (string, required).

## `campaign2_not_interested_list`

Read the current Campaign not-interested list with pagination, platform counts, profile status and plan notes. For YouTube, Instagram and TikTok pass returned creator_id directly to Campaign write targets. X (platform 3) has creator_id=null and raw channel_id; creator-token tools do not support X.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `platform` (integer, optional). 1 YouTube, 3 X, 6 Instagram, 10 TikTok. Omit for all platforms.
- `source` (string, optional).
- `creator_id` (string, optional). Encrypted creator ID for exact identity filtering; never a relation_id.
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).
- `channel_id` (string, optional).
- `filters` (object, optional). Server-side table filters: OR within a field, AND between fields; applied before pagination.

## `campaign2_not_interested_mark`

Mark creators returned by creator_search as not interested. Pass encrypted creator_id values; the server converts them to raw platform channel IDs.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `targets` (array of see live schema, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_not_interested_restore`

Restore creators from not-interested. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `relation_ids` (array of string, required).
- `select_all` (boolean, optional). The server only supports restoring explicit relation_ids; all-selection is not supported.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_notes_save`

Edit a plan note only when the user requests it; preserves concurrent-edit protection. AI selection reasons belong in candidate/invitation/cooperation actions, not this USER-note endpoint.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `target` (see live schema, required).
- `stage` (string, required).
- `plan_note` (string, required).
- `previous_plan_note` (string, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_plan_create`

Create a Campaign2 draft using an allocated ID. Does not apply settings or send invitations. Uses the existing Campaign create/update Skill Credit price (default 1); quota is checked before mutation.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `settings` (object, required). Editable Campaign plan fields; preserve unknown returned extensions and explicit null clears. Do not include id/campaignId/creatorUid/memberUidList/status/version control fields. Save and apply are separate.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_plan_delete`

Preview then confirm soft deletion of a Campaign. Obtain explicit user confirmation before execute.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `phase` (string, required).
- `confirmation_token` (string, optional).
- `confirmed` (boolean, optional).

## `campaign2_plan_get`

Read details for the selected intelligent marketing plan.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_plan_init`

Allocate a new Campaign ID; does not create or apply a plan.

- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_plan_list`

List and filter intelligent marketing plans for the authorized account.

- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 10).
- `keyword` (string, optional).
- `start_time` (integer, optional).
- `end_time` (integer, optional).
- `invite_status` (integer, optional). Invitation status wire code: 1 to invite, 2 inviting, 3 paused, 4 finished, 5 queued, 6 limited. Omit for all statuses.

## `campaign2_plan_members`

List members of the selected intelligent marketing plan.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `member_uids` (array or null, required). Complete desired formal member list; [] or null removes optional members while preserving the creator. Exact account identities, not display names. Duplicate identities are deduplicated by the server.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_plan_metrics`

Read metrics for the selected intelligent marketing plan.

- `campaign_id` (string, required). Campaign ID, kept as a string.

## `campaign2_plan_overview`

Read the overview of the selected intelligent marketing plan.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `timezone` (string, optional, default "Asia/Shanghai"). The server overview uses this fixed business timezone. Omit to use the same default.

## `campaign2_plan_settings_apply`

Apply the saved plan draft. Does not apply invitation settings or send email. Uses the existing Campaign create/update Skill Credit price (default 1); quota is checked before mutation.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_plan_settings_save`

Save a plan draft patch. Omitted fields are preserved; explicit null clears. Applied settings remain unchanged.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `settings` (object, required). Editable Campaign plan fields; preserve unknown returned extensions and explicit null clears. Do not include id/campaignId/creatorUid/memberUidList/status/version control fields. Save and apply are separate.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_plan_status`

Set the existing Campaign master automation status; manual operations and history remain available.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `active` (boolean, required).
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.

## `campaign2_products_add`

Add one existing product-center record or inline product to a Campaign. mode=draft saves only; mode=apply applies only this product and preserves unrelated draft edits. Existing matching products are preserved. No fixed search/create sequence is required.

- `campaign_id` (string, required). Campaign ID, kept as a string.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
- `product_collect_id` (string, optional).
- `product` (object, optional).
- `mode` (string, required).
- `product_kind` (string, optional).
- `service_type` (integer, optional).

## `campaign2_search_condition_get`

Read saved Campaign search condition. Uses current Campaign context and server permissions.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `search_type` (integer, optional). 1 ordinary search (manual paging), 2 AI matching, 3 AI expansion. Read defaults to 1; saving requires an explicit value.

## `campaign2_search_condition_save`

Save a JSON-object search condition snapshot. search_type is required: 1 ordinary search for manual paging, 2 AI matching, 3 AI expansion. This saves filters only; it does not start search or invitation sending.

- `campaign_id` (string, required). Positive signed 64-bit Campaign ID as a string, at most 9223372036854775807.
- `condition` (string, required). JSON-serialized object, never prose. For the ordinary search page (search_type=1), preserve platform, operator, accurate, wordsList, searchFilter and hideChannelFilter from condition-get/page schema. Saving does not execute a search. Embedded platform must be 1/3/6/10 and match the outer platform. channelIdRange is at most 100 nonblank strings and requires either outer or embedded platform.
- `search_type` (integer, required). 1 ordinary search (manual paging), 2 AI matching, 3 AI expansion. Read defaults to 1; saving requires an explicit value.
- `platform` (integer, optional). 1 YouTube, 3 X, 6 Instagram, 10 TikTok; must match condition.platform when both are supplied.
- `idempotency_key` (string, required). Stable key for one operation; reuse after unknown outcomes.
