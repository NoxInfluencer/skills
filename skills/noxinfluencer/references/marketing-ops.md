# Marketing Ops Workflows

Use this reference for NoxInfluencer campaign, collection, CRM, email, message, and export operations. Keep command parameters runtime-discovered with `noxinfluencer schema <cmd>`.

## Domain Routing

| User intent | Start with |
|-------------|------------|
| Find or inspect campaigns | `campaign list`, `campaign get`, `campaign dashboard`, `campaign dropdown` |
| Create or change campaign skeleton data | `campaign init`, `campaign create`, `campaign update`, `campaign delete` |
| Find or inspect collections | `collection list`, `collection get`, `collection items`, `collection resources` |
| Batch move/copy/delete/label collection members | `collection batch-* validate`, then `preview`, then `apply` |
| Refresh collection base/email data or unlock audience | `collection refresh* validate`, then `preview`, then `apply` |
| Add one whole collection and platform slice to CRM | `collection add-to-crm validate`, then `preview`, then `apply` |
| Query or update NoxInfluencer CRM channels | `crm list`, `crm get`, `crm update`, `crm groups ...` |
| Send first email outreach to known creator emails | `email create`, then `email recipients add/replace`, `email content save`, optional `email sender update`, then `email send` or `email schedule` |
| Manage email tasks | `email list`, `email drafts`, `email get`, `email create`, `email update`, `email recipients ...`, `email content ...`, `email sender ...` |
| Send or schedule an existing email task | `email send`, `email schedule`, `email cancel` |
| Manage message threads | `message list`, `message get`, `message projects`, `message labels`, `message coop ...`, `message draft ...` |
| Send or schedule an existing message reply | `message send`, `message schedule`, `message cancel` |
| Inspect or download async exports | `export list`, `export get`, `export download` |

## Outreach Routing

- If the user has reliable creator email addresses from `creator contacts`, use the email-task path. Create or select an email task, add explicit recipients with `email recipients add/replace`, save user-approved content with `email content save`, set sender if needed, read back task and recipients, then ask for final approval before `email send --force` or `email schedule --force`.
- If the user wants in-platform DM/message, `message send` and `message schedule` require an existing `thread_id`. If the user only has an email task ID, use `message list --business_kind email_task --business_id <task_id>` to resolve the thread first. Without a thread, say that starting a new message thread is not exposed by the CLI and offer the email-task path if email contacts exist.
- `crm add-to-email` is only for adding existing NoxInfluencer CRM channels to an existing email task. Do not treat CRM as required when the user already has explicit email addresses.

## CRM Update Semantics

- `crm update` / `crm batch-update` may auto-create a NoxInfluencer CRM channel for valid platform `creator_id` tokens when updating cooperation status or labels. For label-only updates, the service uses the default cooperation status before applying labels.
- Owner-only or archive-only updates do not auto-create CRM channels. Treat missing-channel failures as real failures, not successful skips.
- For batch previews and applies, report `existing_count`, `will_create_count`, and `created_count` when present; do not infer success only from requested IDs.

## Mutation Rules

- Write commands default to dry-run. Treat dry-run output as a preview, not completion.
- Use `--force` only after the user has approved the exact object and action.
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
