# Products, Short Links, And Shopify Affiliation

## Product Center

For finding or creating products from a Brief or conversation and adding them to a Campaign, read `{baseDir}/references/campaign-products.md`. These are independently selectable capabilities, not a required sequence.

Product center stores reusable product information and assets for marketing workflows. Read the current product before updating names, descriptions, destinations, images, status, or ownership. File roles and visibility rules are defined in `{baseDir}/references/files-and-exports.md`.

Product creation and update are normal writes unless they include payment, destructive replacement, or another high-risk effect. Use stable product identity for follow-up work and avoid duplicate creation on retries.

## Normal Short Links

Normal short links provide ordinary Nox tracking for a destination. Preserve the destination, campaign association when present, status, and reporting period. Creating or disabling a link changes tracking state and requires explicit user intent.

Short-link reports are direct reports. They do not use the shared asynchronous export lifecycle.

## Shopify Affiliation

Shopify affiliation is a separate commerce workflow covering affiliate campaigns, members, tracking links, discount codes, orders, and attributed performance. Do not substitute a normal short link for an affiliate tracking link.

When store connection or entitlement is missing, surface the trusted user action supplied by the service. Do not claim that a campaign, member, tracking link, or discount code was created before store access is valid.

Member and code mutations must preserve campaign identity and the selected member set. Payment, commission, payout, and destructive operations are high risk. Performance reads should state the reporting range, currency, attribution state, and whether results are final or still processing.

Affiliation reports are direct reports. Long-running creation or report work must retain one task identity and use bounded status checks.
