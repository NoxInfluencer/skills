# Products and Campaign Placement

Use these capabilities when a user discusses a promoted product in a Brief or conversation, asks to find or create a product, or wants it added to a marketing plan. Choose the capabilities needed for the request; there is no mandatory search-create-add sequence.

## Independent capabilities

- Product-center search finds reusable records by keyword, source type, tags and bounded pages. Detail reads resolve a returned `product_collect_id`. A keyword miss is not proof that the whole catalog lacks the product.
- Product-center creation stores a reusable product. A custom product can be created from a name and known facts without a URL or marketplace ID. A supplied marketplace identity or link can also identify a product. Creation alone does not place it in a Campaign.
- Campaign product addition accepts either a returned product-center identity or inline product information. Inline information creates only a Campaign product, not a product-center record. It is useful when the customer only wants this plan completed.
- Campaign detail reads expose draft and applied product lists. These are different states, not two copies of the same successful outcome.

Use an already identified product directly when its identity is reliable. Search when it helps identify or compare products. Create a reusable record when that is the intended outcome. Ask about material ambiguity, not about routine tool order. Mentioning a product in reference material does not itself authorize unrelated writes.

## Meaning and boundaries

`product_collect_id` identifies a product-center record; `external_product_id` identifies a marketplace product; the plan's `productId` belongs to its own product entry. Pass the center ID to the addition tool instead of copying it into the plan ID. The tool owns mapping, plan permissions, bounded append and duplicate handling.

Keep product-center identities as opaque strings, including UUIDs. Use exact currency codes from the active schema and decimal-string prices; currency labels and silently rounded prices are not valid replacements. The Campaign also validates imported center data against its current product contract, so a center record being readable does not prove it can be applied unchanged.

Product-center `product_type` describes the source (`custom`, `tiktok`, `amazon`, `other`). Campaign `product_kind` describes its form (`physical`, `virtual-brand`, `web-app`, `mobile-app`, `desktop-app`, `browser-extension`). Do not infer one from the other or invent an app subtype for a legacy virtual brand. Omit unknown prices, currency, images, delivery facts and product form; do not fabricate them to satisfy a schema.

Choose `mode: draft` to save a proposed addition without making it active. Choose `mode: apply` when the user wants this product active in the plan: only the submitted product is applied, preserving other pending settings and products. This does not send invitations or enable automation. Do not substitute whole-plan settings application for product-only application.

An existing matching center identity or exact nonempty product link is reused without overwriting the plan's edited product. Identical inline content is also deduplicated. Different variants or ambiguous names need evidence; names alone are not stable identities. A plan can contain at most ten products. Failed and unknown writes are not success; retain the same idempotency key and verify state rather than create another attempt.

Report the actual result: center record created, added to draft, product applied, or already present. Do not call an unchanged draft entry newly applied. Reference URLs are metadata; URL extraction and local image upload are separate capabilities and must not be assumed available from creation support.
