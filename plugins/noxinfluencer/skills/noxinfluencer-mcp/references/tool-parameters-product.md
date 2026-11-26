# MCP tools for product

## `create_product`

Create a collected product.

- `brand` (string or null, optional, default null).
- `currency` (string or null, optional, default null).
- `custom_tag_ids` (array of string or null, optional, default null).
- `description` (string or null, optional, default null).
- `external_product_id` (string or null, optional, default null).
- `first_category_id` (string or null, optional, default null).
- `idempotency_key` (string, required).
- `link` (string or null, optional, default null). Product reference URL; creation stores metadata, not an arbitrary URL extraction request.
- `name` (string or null, optional, default null).
- `price_max` (number or string or null, optional, default null).
- `price_min` (number or string or null, optional, default null).
- `product_type` (string or integer or null, optional, default null).
- `remark` (string or null, optional, default null).
- `second_category_id` (string or null, optional, default null).
- `third_category_id` (string or null, optional, default null).
- `thumbnail_url` (string or null, optional, default null).

## `get_product`

Get collected product detail.

- `product_collect_id` (string, required).

## `list_products`

List collected products.

- `custom_tag_ids` (array of string or null, optional, default null).
- `keyword` (string or null, optional, default null).
- `max_created_at` (string or null, optional, default null).
- `min_created_at` (string or null, optional, default null).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).
- `product_type` (string or integer or null, optional, default null).

## `update_product`

Update a collected product.

- `brand` (string or null, optional, default null).
- `currency` (string or null, optional, default null).
- `custom_tag_ids` (array of string or null, optional, default null).
- `description` (string or null, optional, default null).
- `first_category_id` (string or null, optional, default null).
- `idempotency_key` (string, required).
- `name` (string or null, optional, default null).
- `price_max` (number or string or null, optional, default null).
- `price_min` (number or string or null, optional, default null).
- `product_collect_id` (string, required).
- `remark` (string or null, optional, default null).
- `second_category_id` (string or null, optional, default null).
- `third_category_id` (string or null, optional, default null).
- `thumbnail_url` (string or null, optional, default null).
