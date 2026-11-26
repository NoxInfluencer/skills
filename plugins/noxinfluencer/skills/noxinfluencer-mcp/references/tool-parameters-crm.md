# MCP tools for crm

## `apply_crm_add_to_email`

Apply CRM add-to-email.

- `idempotency_key` (string, required).
- `selector` (see live schema, required).
- `task_id` (string, required).

## `apply_crm_batch_update`

Apply CRM batch update.

- `archived` (boolean or null, optional, default null).
- `confirmation_token` (string, required).
- `coop_status` (integer or null, optional, default null).
- `idempotency_key` (string, required).
- `labels` (see live schema or null, optional, default null).
- `owner_user_uid` (string or null, optional, default null).
- `selector` (see live schema, required).

## `archive_crm_channel`

Archive one CRM channel.

- `creator_id` (string, required).
- `idempotency_key` (string, required).

## `create_crm_export`

Create async CRM export task.

- `end_at` (string or null, optional, default null).
- `idempotency_key` (string, required).
- `selector` (see live schema, required).
- `start_at` (string or null, optional, default null).
- `web_url` (string or null, optional, default null).

## `create_crm_group`

Create CRM group.

- `filter` (see live schema or null, optional, default null).
- `idempotency_key` (string, required).
- `name` (string, required).
- `visible_member_uids` (array of string, optional).

## `create_crm_label`

Create CRM label.

- `idempotency_key` (string, required).
- `name` (string, required).

## `delete_crm_group`

Delete CRM group.

- `confirmation_token` (string, optional).
- `group_id` (string, optional).
- `idempotency_key` (string, optional).
- `phase` (string, optional).

## `delete_crm_label`

Delete CRM label.

- `confirmation_token` (string, optional).
- `idempotency_key` (string, optional).
- `label_id` (integer, optional).
- `phase` (string, optional).

## `get_crm_channel`

Get CRM channel detail.

- `creator_id` (string, required).

## `get_crm_group`

Get CRM group detail.

- `group_id` (string, required).

## `get_crm_import_template`

Download the SaaS CRM channel import template.

- `language` (string, optional).

## `list_crm_channels`

Query CRM channels.

- `filter` (see live schema or null, optional, default null).
- `group_id` (string or null, optional, default null).
- `keyword` (string or null, optional, default null).
- `keyword_type` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `list_crm_groups`

List CRM groups.

- `keyword` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `list_crm_labels`

List CRM labels.

- `keyword` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `prepare_crm_import_report_download`

Download failed or repeated CRM import rows as SaaS Excel.

- `items` (array of see live schema, required).
- `report_type` (string, required).

## `preview_crm_add_to_email`

Preview CRM add-to-email target set.

- `selector` (see live schema, required).
- `task_id` (string, required).

## `preview_crm_batch_update`

Preview CRM batch update target set.

- `archived` (boolean or null, optional, default null).
- `coop_status` (integer or null, optional, default null).
- `labels` (see live schema or null, optional, default null).
- `owner_user_uid` (string or null, optional, default null).
- `selector` (see live schema, required).

## `restore_crm_channel`

Restore one archived CRM channel.

- `creator_id` (string, required).
- `idempotency_key` (string, required).

## `update_crm_channel`

Update one CRM channel.

- `coop_status` (integer or null, optional, default null).
- `creator_id` (string, required).
- `email` (string or null, optional, default null).
- `idempotency_key` (string, required).
- `owner_user_uid` (string or null, optional, default null).
- `remark_name` (string or null, optional, default null).
- `url` (string or null, optional, default null).

## `update_crm_group`

Update CRM group.

- `filter` (see live schema or null, optional, default null).
- `group_id` (string, required).
- `idempotency_key` (string, required).
- `name` (string, required).
- `visible_member_uids` (array of string, optional).

## `update_crm_label`

Update CRM label.

- `idempotency_key` (string, required).
- `label_id` (integer, required).
- `name` (string, required).

## `validate_crm_add_to_email`

Validate CRM add-to-email request.

- `selector` (see live schema, required).
- `task_id` (string, required).

## `validate_crm_batch_update`

Validate CRM batch update request.

- `archived` (boolean or null, optional, default null).
- `coop_status` (integer or null, optional, default null).
- `labels` (see live schema or null, optional, default null).
- `owner_user_uid` (string or null, optional, default null).
- `selector` (see live schema, required).
