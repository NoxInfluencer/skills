# Marketing Ops Workflows

Use this reference for NoxInfluencer campaign, collection, CRM, email, message, and export operations. Keep command parameters runtime-discovered with `noxinfluencer schema <cmd>`.

## Domain Routing

| User intent | Start with |
|-------------|------------|
| Find or inspect campaigns | `campaign list`, `campaign get`, `campaign dashboard`, `campaign dropdown` |
| Create or change campaign skeleton data | `campaign init`, `campaign create`, `campaign update`, `campaign delete` |
| Find or inspect collections | `collection list`, `collection get`, `collection items`, `collection resources` |
| Add creators from search/profile results to collections | `collection add-creators` |
| Import owned creator links into one collection | `collection import-file` |
| Find creators similar to a source creator | `creator lookalikes` |
| Batch move/copy/delete/label collection members | `collection batch-* validate`, then `preview`, then `apply` |
| Refresh collection base/email data or unlock audience | `collection refresh* validate`, then `preview`, then `apply` |
| Add one whole collection and platform slice to CRM | `collection add-to-crm validate`, then `preview`, then `apply` |
| Query or update NoxInfluencer CRM channels | `crm list`, `crm get`, `crm update`, `crm groups ...` |
| Manage CRM labels for batch tagging | `crm labels list/create/update/delete` |
| Manage product-center records and tags | `product list/get/create/update/delete`, `product tags ...` |
| Send platform email outreach to creators | `email create`, then `email recipients add/replace` with creator search/profile IDs, `email content save`, optional `email sender update`, optional `email attachments ...`, then `email send` or `email schedule` |
| Manage email tasks | `email list`, `email drafts`, `email get`, `email create`, `email update`, `email recipients ...`, `email content ...`, `email sender ...`, `email report`, `email team-summary`, `email team-breakdown` |
| Manage email recipient deduplication | `email recipients filter options`, then `email recipients filter get/update/tasks` |
| Manage email task collaborators | `email collaborators list`, then `replace/add/remove` |
| Manage email task attachments | `email attachments list/upload/delete` |
| Send or schedule an existing email task | `email send`, `email schedule`, `email cancel` |
| Manage message threads | `message list`, `message get`, `message projects`, `message labels`, `message coop ...`, `message draft ...`, `message attachments ...` |
| Send or schedule an existing message reply | `message send`, `message schedule`, `message cancel` |
| Submit product feedback or a bug report | `feedback submit`, then `feedback inbox` / `feedback get` |
| Inspect or download async exports | `export list`, `export get`, `export download` |

## Outreach Routing

- For NoxInfluencer platform email outreach, do not call `creator contacts` first. Create or select an email task, add search/profile result `creator_id` values with `email recipients add/replace`, save user-approved content with `email content save`, set sender if needed, read back task and recipients, then ask for final approval before `email send --force` or `email schedule --force`.
- Use `creator contacts` only when the user explicitly wants visible/exported contact info or outreach outside NoxInfluencer. If the user vaguely asks to "find emails and send", choose platform email by default and say exported email retrieval uses extra contact quota.
- Email attachments belong to the email task primary project. Upload approved files with `email attachments upload <task_id> --file <path>` before `email send` or `email schedule`; use `email attachments list/delete` to inspect or remove files. Email tasks support at most 1 attachment, max 10MB. Uploading or deleting an attachment cancels an existing scheduled send, so read back the task and confirm again before scheduling.
- For one email task's reply reporting, use `email report <task_id>`. For multi-task or team-level reporting, use `email team-summary`; for SaaS team member breakdown, use `email team-breakdown`. Treat `reply_count` as email tracking replies, `replied_creator_count` as replied creators, and `inbound_message_count` as inbound reply messages. Team filters use SaaS team member `uid`, not Gmail or enterprise sender mailbox accounts. Do not recompute replies by manually scanning message threads unless the user explicitly asks for raw thread inspection.
- If the user wants in-platform DM/message, `message send` and `message schedule` require an existing `thread_id`. If the user only has an email task ID, use `message list --business_kind email_task --business_id <task_id>` to resolve the thread first. Without a thread, say that starting a new message thread is not exposed by the CLI and offer the email-task path for platform creators.
- Message attachments are thread-draft attachments. Upload files with `message attachments upload <thread_id> --file <path>` before `message send` or `message schedule`; use `message attachments list/delete` to inspect or remove draft files. Do not attach files to message templates unless the CLI schema explicitly exposes that path.
- `crm add-to-email` is only for adding existing NoxInfluencer CRM channels to an existing email task. Do not treat CRM as required when the user already has creator IDs or explicit email addresses.

## Deduplication and Collaborators

- Search result deduplication is a second step after `creator search`: run `creator search-filter-options`, then call `creator search-filter --body-file` with the current page `data.items[].id` values and the selected filter patch. It filters a returned page; it does not launch a fresh search.
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
- Use `collection import-file <collection_id> --file <path>` for the user's owned creator links. The spreadsheet's first column should be the YouTube, Instagram, or TikTok creator URL; an optional second column may contain email/contact data. This import is accepted asynchronously, so poll `collection items <collection_id>` by platform to confirm resolved rows.
- Do not confuse these paths with collection copy/move. `add-creators` adds explicit creators to target collections; `import-file` imports owned creator URLs into one collection.

## Mutation Rules

- Write commands default to dry-run. Treat dry-run output as a preview, not completion.
- Use `--force` only after the user has approved the exact object and action.
- Feedback submission is also a write command, but it is free and does not consume Skill quota. Use it for product bugs, confusing behavior, data issues, suggestions, or feature requests. Attach screenshots/logs with `--file` when useful, and check `feedback inbox` for asynchronous follow-up.
- For staged workflows, always run `validate` before `preview`, and `preview` before `apply --force`.
- For `send` and `schedule`, confirm the task/thread, recipient scope, sender identity, scheduled time when relevant, and content approval before execution.
- Do not draft outreach or negotiation copy. If content is missing, ask the user for approved content or hand off to a writing task without invoking NoxInfluencer write commands.
- Do not operate external CRM, email, messaging, or spreadsheet platforms. These commands only affect NoxInfluencer-owned objects.

## JSON-First Commands

Many marketing-ops commands intentionally keep complex selectors in JSON bodies. When a schema requires `--body-file`:

1. Run `noxinfluencer schema <cmd>` to inspect required fields and usage notes.
2. Prepare the minimal JSON body needed for the user's request.
3. Prefer the CLI's validate/preview stages when available.
4. Preserve stable opaque IDs from responses (`campaign_id`, `collection_id`, `creator_id`, `thread_id`, `task_id`, `export_id`) for follow-up calls.

## Export Handling

- Export creation is async and usually returns `export_id`.
- Poll with `export get` or inspect with `export list`.
- Only run `export download <export_id> --output <path>` when the export is ready.
- Download writes binary data to the requested file path, not stdout. Report the output path and file metadata after completion.
