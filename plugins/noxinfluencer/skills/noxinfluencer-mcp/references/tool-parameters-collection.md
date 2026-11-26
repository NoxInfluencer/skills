# MCP tools for collection

## `add_collection_creators`

Add creators to collections.

- `channel_ids` (array of string or null, optional, default null).
- `collection_ids` (array of string, required).
- `creator_ids` (array of string or null, optional, default null).
- `idempotency_key` (string, required).
- `platform` (string, required).

## `apply_collection_add_to_crm`

Apply add one whole collection + platform slice to CRM.

- `collection_id` (string, required).
- `idempotency_key` (string, required).
- `platform` (string, required).

## `apply_collection_batch_copy`

Apply batch copy from one source collection.

- `idempotency_key` (string, required).
- `selector` (see live schema, required).
- `target_collection_ids` (array of string, required).

## `apply_collection_batch_delete`

Apply batch delete within one source collection.

- `confirmation_token` (string, required).
- `idempotency_key` (string, required).
- `selector` (see live schema, required).

## `apply_collection_batch_label`

Apply batch label within one source collection.

- `idempotency_key` (string, required).
- `label_ids` (array of integer, required).
- `operation` (string, required).
- `selector` (see live schema, required).

## `apply_collection_batch_move`

Apply batch move within one source collection.

- `confirmation_token` (string, required).
- `idempotency_key` (string, required).
- `selector` (see live schema, required).
- `target_collection_id` (string, required).

## `apply_collection_refresh`

Apply refresh collection base data.

- `idempotency_key` (string, required).
- `selector` (see live schema, required).

## `apply_collection_refresh_email`

Apply refresh collection email data.

- `idempotency_key` (string, required).
- `selector` (see live schema, required).

## `apply_collection_unlock_audience`

Apply unlock audience analysis for one source collection.

- `confirmation_token` (string, required).
- `idempotency_key` (string, required).
- `selector` (see live schema, required).

## `create_collection`

Create a collection.

- `description` (string or null, optional, default null).
- `idempotency_key` (string, required).
- `members_uid` (array of string or null, optional, default null).
- `name` (string, required).
- `scope` (string, optional, default "private").

## `create_collection_export`

Create an async collection export task.

- `collection_id` (string, required).
- `cooperation_status` (array of integer or null, optional, default null).
- `count` (integer, required).
- `email_contact_status` (array of integer or null, optional, default null).
- `email_only` (boolean or null, optional, default null).
- `exclude_not_in` (boolean or null, optional, default null).
- `field_keys` (array of string or null, optional, default null).
- `follower_max` (integer or null, optional, default null).
- `follower_min` (integer or null, optional, default null).
- `idempotency_key` (string, required).
- `keyword` (string or null, optional, default null).
- `label_ids` (array of integer or null, optional, default null).
- `language` (string or null, optional, default "en").
- `mode` (string, optional, default "full").
- `nox_categories` (array of integer or null, optional, default null).
- `offer_status` (array of integer or null, optional, default null).
- `platform` (string, required).
- `regions` (array of string or null, optional, default null).
- `remark_label_ids` (array of integer or null, optional, default null).
- `reply_likelihood` (array of integer or null, optional, default null).
- `web_url` (string or null, optional, default null).

## `delete_collection`

Delete a collection.

- `collection_id` (string, optional).
- `confirmation_token` (string, optional).
- `idempotency_key` (string, optional).
- `phase` (string, optional).

## `get_collection`

Get collection detail.

- `collection_id` (string, required).

## `get_collection_import_template`

Download the SaaS owned-creator import template.

- `language` (string, optional).

## `list_collection_items`

Query collection items.

- `collection_id` (string, required).
- `cooperation_status` (array of integer or null, optional, default null).
- `email_contact_status` (array of integer or null, optional, default null).
- `email_only` (boolean or null, optional, default null).
- `exclude_not_in` (boolean or null, optional, default null).
- `follower_max` (integer or null, optional, default null).
- `follower_min` (integer or null, optional, default null).
- `keyword` (string or null, optional, default null).
- `label_ids` (array of integer or null, optional, default null).
- `nox_categories` (array of integer or null, optional, default null).
- `offer_status` (array of integer or null, optional, default null).
- `order` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 10).
- `platform` (string, required).
- `regions` (array of string or null, optional, default null).
- `remark_label_ids` (array of integer or null, optional, default null).
- `reply_likelihood` (array of integer or null, optional, default null).
- `sort_by` (string or null, optional, default null).

## `list_collection_resources`

Query collection resources.

- `collection_ids` (array of string or null, optional, default null).
- `cooperation_status` (array of integer or null, optional, default null).
- `email_contact_status` (array of integer or null, optional, default null).
- `email_only` (boolean or null, optional, default null).
- `exclude_not_in` (boolean or null, optional, default null).
- `follower_max` (integer or null, optional, default null).
- `follower_min` (integer or null, optional, default null).
- `keyword` (string or null, optional, default null).
- `label_ids` (array of integer or null, optional, default null).
- `nox_categories` (array of integer or null, optional, default null).
- `offer_status` (array of integer or null, optional, default null).
- `order` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 10).
- `platform` (string, required).
- `regions` (array of string or null, optional, default null).
- `remark_label_ids` (array of integer or null, optional, default null).
- `reply_likelihood` (array of integer or null, optional, default null).
- `sort_by` (string or null, optional, default null).

## `list_collections`

List collections.

- `keyword` (string, optional).
- `ownership` (string, optional, default "all").
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).
- `sort` (string, optional, default "newest").

## `preview_collection_add_to_crm`

Preview add one whole collection + platform slice to CRM.

- `collection_id` (string, required).
- `platform` (string, required).

## `preview_collection_batch_copy`

Preview batch copy from one source collection.

- `selector` (see live schema, required).
- `target_collection_ids` (array of string, required).

## `preview_collection_batch_delete`

Preview batch delete within one source collection.

- `selector` (see live schema, required).

## `preview_collection_batch_label`

Preview batch label within one source collection.

- `label_ids` (array of integer, required).
- `operation` (string, required).
- `selector` (see live schema, required).

## `preview_collection_batch_move`

Preview batch move within one source collection.

- `selector` (see live schema, required).
- `target_collection_id` (string, required).

## `preview_collection_refresh`

Preview refresh collection base data.

- `selector` (see live schema, required).

## `preview_collection_refresh_email`

Preview refresh collection email data.

- `selector` (see live schema, required).

## `preview_collection_unlock_audience`

Preview unlock audience analysis for one source collection.

- `selector` (see live schema, required).

## `update_collection`

Update a collection.

- `collection_id` (string, required).
- `description` (string or null, optional, default null).
- `idempotency_key` (string, required).
- `members_uid` (array of string or null, optional, default null).
- `name` (string or null, optional, default null).
- `scope` (string or null, optional, default null).

## `validate_collection_add_to_crm`

Validate add one whole collection + platform slice to CRM.

- `collection_id` (string, required).
- `platform` (string, required).

## `validate_collection_batch_copy`

Validate batch copy from one source collection.

- `selector` (see live schema, required).
- `target_collection_ids` (array of string, required).

## `validate_collection_batch_delete`

Validate batch delete within one source collection.

- `selector` (see live schema, required).

## `validate_collection_batch_label`

Validate batch label within one source collection.

- `label_ids` (array of integer, required).
- `operation` (string, required).
- `selector` (see live schema, required).

## `validate_collection_batch_move`

Validate batch move within one source collection.

- `selector` (see live schema, required).
- `target_collection_id` (string, required).

## `validate_collection_refresh`

Validate refresh collection base data.

- `selector` (see live schema, required).

## `validate_collection_refresh_email`

Validate refresh collection email data.

- `selector` (see live schema, required).

## `validate_collection_unlock_audience`

Validate unlock audience analysis for one source collection.

- `selector` (see live schema, required).
