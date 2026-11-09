# Marketing Ops Workflows

Use this reference for NoxInfluencer campaign, collection, CRM, email, message, product, short-link, affiliation, creator dispute, file, report, and export operations. Keep command parameters runtime-discovered with `node "{baseDir}/scripts/nox-cli.mjs" schema <cmd>`.

## Domain Routing

| User intent | Start with |
|-------------|------------|
| Find or inspect campaigns | `campaign plan list`, `campaign plan get`, `campaign plan overview` |
| Create or change campaign skeleton data | `campaign plan init`, `campaign plan create`, `campaign plan settings-save/settings-apply`, `campaign plan delete` |
| Add creators to cooperation management in a Campaign, including a selected set from search or a collection | `campaign context get`, `campaign cooperations list`, then one `campaign cooperations add` per selected creator; read the cooperation reference first |
| Inspect or update Campaign cooperation records or statuses | `campaign cooperations list`, `campaign cooperations record-save`, `campaign cooperations status-update` |
| Find or inspect collections | `collection list`, `collection get`, `collection items`, `collection resources` |
| Add creators from search/profile results to collections | `collection add-creators` |
| Import owned creator links into one collection | `collection import-template`, then `collection import-file` |
| Find creators similar to a source creator | `creator lookalikes` |
| Export selected creator search/lookalike results | deep `creator export-preview`, then `creator export` / `creator lookalikes-export` |
| Batch move/copy/delete/label collection members | `collection batch-* validate`, then `preview`, then `apply` |
| Refresh collection base/email data or unlock audience | `collection refresh* validate`, then `preview`, then `apply` |
| Explicitly add one whole collection and platform slice to account-level CRM | `collection add-to-crm validate`, then `preview`, then `apply`; this does not add Campaign cooperation records |
| Query, import, or update NoxInfluencer CRM channels | `crm list/get/update`, `crm import-template/import-file/import-report`, `crm groups ...` |
| Manage CRM labels for batch tagging | `crm labels list/create/update/delete` |
| Manage product-center records, images, and tags | `product list/get/create/update/delete`, `product image upload`, `product tags ...` |
| Manage Shopify affiliate campaigns and members | `affiliation stores list`, then `affiliation campaigns ...` / `affiliation members ...`; use member template/import and campaign export for files |
| Send standalone platform email outreach to creators | `email create`, then `email recipients add/replace` with creator search/profile IDs, `email content save`, `email sender list [task_id]` before optional `email sender update`, optional `email attachments ...`, then `email send` or `email schedule` |
| Manage email tasks | `email list`, `email drafts`, `email get`, `email create`, `email update`, `email recipients ...`, `email content ...`, `email sender ...`, `email report`, `email team-summary`, `email team-breakdown` |
| Import email recipients | `email recipients import-template`, then `email recipients import-file` |
| Manage email recipient deduplication | `email recipients filter options`, then `email recipients filter get/update/tasks` |
| Manage email task collaborators | `email collaborators list`, then `replace/add/remove` |
| Manage email task attachments | `email attachments list/upload/download/delete` |
| Send or schedule an existing email task | `email send`, `email schedule`, `email cancel` |
| Manage message threads and files | `message list/get/projects/archive`, `message draft ...`, `message attachments ...`, `message templates attachments ...` |
| Upload a public rich-text image | `file image upload`, then embed returned `file_url` in approved `html_body` |
| Download direct Excel reports | `monitor report*`, `short-link export-*`, `affiliation campaigns export` |
| Send or schedule an existing message reply | `message send`, `message schedule`, `message cancel` |
| Submit product feedback or a bug report | `feedback submit`, then `feedback inbox` / `feedback get` |
| Check or report a concrete creator collaboration dispute | `dispute records <creator_id>` first, then `dispute report` only with evidence and approval |
| Inspect or download shared async exports | `export list`, `export get`, `export download` for creator, collection, CRM, and brand-monitor tasks |

## Outreach Routing

For ambiguous "cooperation management" in a Campaign page or conversation, use that Campaign's cooperation workflow. If the destination plan is missing or conflicts with the current context, clarify it before writing. Do not route to CRM because Campaign calls fail. See `{baseDir}/references/campaign-cooperation-management.md` for selected-set creation and readback.

- For standalone NoxInfluencer platform email outreach, do not call `creator contacts` first. Create or select an email task without `campaign_id`, add search/profile result `creator_id` values with `email recipients add/replace`, save user-approved content with `email content save`, set sender if needed, read back task and recipients, then ask for final approval before `email send --force` or `email schedule --force`. For intelligent Campaign invitations, use the dedicated Campaign invitation workflow and its reviewed sending protocol.
- Use `creator contacts` only when the user explicitly wants visible/exported contact info or outreach outside NoxInfluencer. If the user vaguely asks to "find emails and send", choose platform email by default and say exported email retrieval uses extra contact quota.
- Email attachments belong to the email task primary project. Upload approved files with `email attachments upload <task_id> --file <path>` before send or schedule; use `email attachments list/download/delete` to inspect, retrieve, or remove files. Email tasks support at most 1 attachment, max 10MB. Uploading or deleting an attachment cancels an existing scheduled send, so read back the task and confirm again before scheduling.
- If approved recipients come from Excel, download `email recipients import-template` and use `email recipients import-file <task_id>`. Do not invent spreadsheet columns.
- Email recipient import is only available before the task enters its active send flow.
- For one email task's reply reporting, use `email report <task_id>`. For multi-task or team-level reporting, use `email team-summary`; for SaaS team member breakdown, use `email team-breakdown`. Treat `reply_count` as email tracking replies, `replied_creator_count` as replied creators, and `inbound_message_count` as inbound reply messages. Team filters use SaaS team member `uid`, not Gmail or enterprise sender mailbox accounts. Do not recompute replies by manually scanning message threads unless the user explicitly asks for raw thread inspection.
- If the user wants in-platform DM/message, `message send` and `message schedule` require an existing `thread_id`. If the user only has an email task ID, use `message list --business_kind email_task --business_id <task_id>` to resolve the thread first. Without a thread, say that starting a new message thread is not exposed by the CLI and offer the email-task path for platform creators.
- For message-center filtering by task creator or team member, first run `message creator-filters`, then use returned `user_uid` values with `message list --creator_uids` or `message project-filters --creator_uids`.
- For message-center pending work, trust `needs_reply` / `last_message_direction`; `deal` is not the same as `unread`. If one opened task is already replied but SaaS still shows pending, inspect siblings with `message projects <thread_id>`. Use `message archive` only when the user explicitly wants the creator's entire conversation archived; it includes sibling task threads and is separate from `crm archive`. If only one task needs no reply, do not send an empty reply or archive the conversation; task-level mark-handled is not exposed yet.
- Message draft/history attachments and message-template attachments are separate. Use `message attachments list/upload/download/delete` for thread files and `message templates attachments list/upload/download/delete` for reusable template files. Never reuse IDs across the two paths. One template supports at most 2 private attachments, max 10MB each.
- Use `file image upload` for public inline images in approved email/message `html_body`. The returned `file_url` is public and is not a private email, message, or template attachment.
- `crm add-to-email` is only for adding existing NoxInfluencer CRM channels to an existing email task. Do not treat CRM as required when the user already has creator IDs or explicit email addresses.

## Affiliate Marketing

- Use `affiliation` for Shopify affiliate stores, campaigns, members, tracking links, discount codes, and performance reads. This is separate from normal `short-link`.
- Start with `affiliation stores list`. If no store is authorized or access is denied, ask the user to authorize/manage the store in SaaS; do not attempt store authorization in the Skill.
- Add NoxInfluencer creators to affiliate campaigns with search/profile `creator_id`, or use `platform + channel_id` / `custom_id` when the CLI schema calls for it.
- For owned creator links, download `affiliation members import-template` and submit `.xls` or `.xlsx` with `affiliation members import-file <campaign_id>`; max file size is 10MB.
- Executing affiliation member import writes members immediately and reads back the pending-member count; it is not validation-only.
- `affiliation campaigns export` downloads campaign-performance Excel directly to `--output`; it is not a shared async export task.

## TikTok Shop And Market Search

First check `node "{baseDir}/scripts/nox-cli.mjs" schema --all` and the exact operation schema. These operations are not established by the pinned private catalog; use them only when the current runtime exposes them. Do not upgrade the CLI automatically or substitute Creator Marketplace for unavailable market search. Read `{baseDir}/references/creator.md` for creator-versus-market metric and capability boundaries.

When the installed CLI and backend expose these operations (public CLI 0.5.8+), start with `tiktok-shop bindings list`. Reuse the returned `binding_id` for `creator-search categories/advanced-filters/search`; preserve `next_page_token` for pagination. Use `projects list/get/recipients/statistics` for project state and current schema for draft, execution, and update contracts. Store binding, official quotas, and membership still apply.

For target invitations, read the shared connected-store invitation rules in `{baseDir}/references/creator.md`, then inspect `schema tiktok-shop.projects.draft` / `.formal` and command `--help`. Public CLI 0.5.12 adds a complete `body_example`; older versions may expose only command options. Fill the current schema with the approved scope, not example identities.

Use `projects draft --force` for an approved draft and `projects formal --force` only at the approved submission boundary. Read back `projects get <project_id>` and `data.target_invitation_free_sample_rule`. The canonical body field is `target_invitation.free_sample_rule.sample_approval_exempt`; the updated server also accepts `is_sample_approval_exempt`. Use one supported name, following the shared rule for its value.

For updates, fetch current `projects get` and creator selection, then submit the complete `private_message`, `target_invitation`, `execution_config`, project/store/name and creator source/selection fields required by the runtime. The shared full-form preservation and missing-state stop rules apply.

Use `tiktok search product`, `tiktok search shop`, or `tiktok search live` for the public SaaS TTS indexes. Pass a JSON body with `--body-file` for GMV, sales, category, view, and engagement filters; read `total_gmv`, `last30_days_gmv`, and `currency` from the returned rows. This market search consumes Skill Credit by returned item; check `pricing tools --action tiktok_search` before broad pages. It is read-only and separate from the connected-store Creator Marketplace workflow above; read-only does not mean free.

Use snake_case fields in the body. Common fields are `keywords` (array), `country` (one country code), `page_num`, and `page_size` (1-100); preserve the same filters when paging. GMV bounds differ by result type:

| Search type | GMV filter fields |
|---|---|
| `product` | `min/max_total_video_gmv`, `min/max_total_live_gmv`, `min/max_last30_days_video_gmv`, `min/max_last30_days_live_gmv` |
| `shop` | `min/max_total_gmv`, `min/max_last30_days_gmv` |
| `live` | `min/max_total_gmv` |

Each `min/max_...` pair means separate `min_...` and `max_...` fields. For example, a shop query body can be `{"keywords":["beauty"],"country":"US","min_last30_days_gmv":1000,"page_num":1,"page_size":5}`. Compare GMV only within the same currency and time window. Live search reports GMV for the returned stream; do not describe it as a 30-day creator total. Missing/null values are unavailable evidence; an explicit zero is a returned data value.


## Deduplication and Collaborators

- For a new creator search, apply `exclude_keywords` and the selected `search-filter-options` patch in the search itself. Use standalone `creator search-filter` only for an existing page. Mark or unmark a creator as Not interested only with explicit approval through `creator not-interested add/remove`.
- Email recipient deduplication is task-scoped: use `email recipients filter options` to find SaaS-aligned choices, `email recipients filter get <task_id>` to inspect saved state/counts, and `email recipients filter update <task_id> --body-file` to change it.
- Email collaborators use SaaS team `user_uid`. If the user does not know the ID, run `email collaborators list` without `task_id` first; with a `task_id`, it reads that task's current collaborator permissions. Use `add` or `remove` for incremental changes; use `replace` only when the user intends to reset the whole collaborator set.

## CRM Update Semantics

- `crm update` / `crm batch-update` may auto-create a NoxInfluencer CRM channel for valid platform `creator_id` tokens when updating cooperation status or labels. For label-only updates, the service uses the default cooperation status before applying labels.
- Use `crm labels create` when the user needs a new CRM tag ID. Use the returned `label_id` in `crm batch-update` with `labels.operation=add` or `remove`.
- Owner-only or archive-only updates do not auto-create CRM channels. Treat missing-channel failures as real failures, not successful skips.
- For batch previews and applies, report `existing_count`, `will_create_count`, and `created_count` when present; do not infer success only from requested IDs.

## Collection Add and Import

- Use `creator lookalikes` when the user asks for similar creators based on a source creator or URL. It is read-only and requires `target_platform`; save returned creator IDs with `collection add-creators` only after the user chooses targets.
- Use `collection add-creators` when the user wants to save creators returned by `creator search` or creator read commands into one or more collections. The JSON body uses `collection_ids`, `platform`, and `creator_ids`. Use `channel_ids` only when the user already has raw same-platform channel IDs. It is an add-only path, not forced collection-to-collection copy.
- Download `collection import-template` before using `collection import-file <collection_id> --file <path>` for the user's owned creator links. The spreadsheet's first column should be the YouTube, Instagram, or TikTok creator URL; an optional second column may contain email/contact data. This import is accepted asynchronously, so poll `collection items <collection_id>` by platform to confirm resolved rows.
- Do not confuse these paths with collection copy/move. `add-creators` adds explicit creators to target collections; `import-file` imports owned creator URLs into one collection.

## Runtime References

Use `{baseDir}/references/command-execution.md` for schema discovery, JSON-first inputs, response envelopes, mutation approval, and retries. Use `{baseDir}/references/files.md` for templates, spreadsheet limits, file roles, direct reports, and asynchronous export downloads.
