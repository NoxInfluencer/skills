# Creator Discovery And Evaluation

## Discovery Inputs

Ask only for missing criteria that materially affect sourcing: platform, niche or known creator name, market, creator size, audience fit, activity, performance floor, and whether an email signal matters. Run each platform as a separate search and combine results only after preserving platform identity.

A known name or handle is an identity search. Topic keywords are a discovery search. Do not combine both interpretations in one request. Apply user-specified exclusions and account-level hide, prior-contact, collection, cooperation, or CRM filters during the search when available instead of discarding paid results afterward.

## Search Precision And Content Evidence

Preserve requested semantic precision: `accurate` is a finite value in [0,1], so 60% is 0.6. Omitted or zero leaves precision off. It is independent of requiring every keyword to match; it neither makes a name search semantic nor proves marketing suitability. Do not invent a threshold. If the operation lacks a requested field, explain the capability gap rather than dropping the condition.

Use `channel_type_infos` only as supported by the current search schema. Empty means no account-type filter; brand and celebrity together mean OR; non-official alone means neither flag is true; brand plus non-official means brand true and celebrity not true; celebrity plus non-official means celebrity true and brand not true; all three selections mean both flags true, not all accounts. Missing flags do not verify personal ownership. Clarify ambiguous official-account intent and retain the same precision/type filters on later pages.

Average views and comments cover the latest 10 contents; 30-day and 180-day exposure estimates are distinct and cannot substitute for actual average views. Select the requested exposure period explicitly. YouTube content-shape fields apply only to YouTube. For recent content, preserve platform and requested format (Shorts, long video, live, Reels or post), sorting and bounded page size; do not silently mix formats. Audience matching fields are not a full audience distribution.

## Results, Cost, And Pagination

Search and lookalike cost follows the number of creators returned. Use small purposeful pages while refining criteria and larger pages only for an explicit broad shortlist or batch workflow. Keep all prior filters unchanged for the next page and reuse the returned cursor exactly. Stop when the cursor is empty or the final page is reached.

Creator identifiers are opaque and stable for follow-up work. Preserve `creator_id` and returned result identifiers without decoding them. Deduplicate across pages by the opaque identity, not by nickname or display URL.

Retain the complete returned records with their platform and search scope for selection and follow-up actions, using the runtime's supported result-retention mechanism. A shortened display must not replace the original records. Do not fetch the same page again solely because a summary omitted an identifier.

Present three to five comparable candidates first. Include name, platform, scale, performance, geography, useful tags, and why each candidate matches. If the page is noisy, ask for one high-value narrowing criterion rather than returning a larger weak list.

A masked nickname is a display restriction, not permission to reconstruct the name. Preserve the returned creator identity and allowed fields. Search rows are coarse evidence; do not present a final recommendation without the necessary qualification. Keep creator fit separate from contact readiness. When the brief lacks a business baseline, use the available marketing manager for qualitative exploration rather than inventing counts, weights or performance thresholds.

## TikTok Commerce Discovery

Distinguish three outcomes: creator qualification using TikTok creator-search product signals; product, shop, or live-market discovery; and connected-store Creator Marketplace discovery or private-message projects. A product, shop, or stream is not a creator candidate and must not be inserted into a Campaign creator set as one.

Discover the exact available operation and fields before using GMV filters. The pinned private catalog does not establish TikTok market-search or Creator Marketplace support. If the current capability schema does not expose the requested operation, report that limitation; do not invent a tool, silently drop a required GMV constraint, or switch execution channels to bypass it. Public client version availability alone does not prove private backend support.

The current commerce search contract returns entitled filter evidence: `last30_days_video_gmv` for `last30_days_products_gmv_min/max`, `last30_days_video_sales_count` for `last30_products_sales_count_min/max`, `products_market` and `currency`, product GPM, category and requested normal/trimmed product-video average. Currency follows sales market, not creator country. GPM is money per thousand views, not total GMV. Recent activity values are nullable signals, not raw counts; `last7_open_tiktok_shop` is the SaaS first-product-video signal at its 7-natural-day boundary, not a verified official opening date. Seller matching is request-specific, not a list of seller identities.

The corresponding returned search fields are:

| Field | Evidence scope |
| --- | --- |
| `ttseller` | TikTok Shop creator signal. |
| `products_market`, `currency` | Sales market and its monetary unit, distinct from creator location. |
| `last30_days_video_gmv`, `last30_days_video_sales_count` | Values targeted by the 30-day video GMV and sales bounds. |
| `last30_days_products_gpm` | Market-currency amount per thousand views. |
| `products_category`, `main_products_category` | IDs for the corresponding category filters. |
| `products_video_avg_views`, `products_video_view_exclude_extreme` | Actual 30-day product-video average for the requested normal or trimmed scope. |
| `last7_has_products_video`, `last7_has_products_sales_count` | Nullable recent-activity signals, without raw seven-day counts. |
| `last7_open_tiktok_shop` | First-product-video signal, not an official opening date. |
| `matches_seller_of` | Match to the seller requested in this query; null when no seller filter was requested. |

Current search does not supply live, cumulative `total_products_*`, or legacy generic `last30_days_products_gmv/sales_count` values. Basic/degraded or unknown entitlement metadata does not unlock them. Do not substitute legacy totals for the video filter: 90000 video GMV fails a minimum of 100000. A user-supplied legacy snapshot can be described within its recorded scope, without presenting it as the current contract. Keep missing currency/values unknown; never fill USD from country, compare unverified units, or sum independent snapshots.

Read protected commerce detail only when the user's task requires it and the current runtime exposes that option. Reuse the selected opaque creator identity. The detail supplies fixed 30-day video/live GMV, sales, GPM, sales market and currency, under SaaS scope 34, single-creator unlock and current profile-detail pricing. Surface permission/quota errors; do not retry an unprotected endpoint. The current live overview supports US creators; `live_supported=false` leaves live metrics unknown, while supported explicit zero remains zero. Detail and search are independently calibrated and can differ. Do not automatically expand search into paid per-creator detail reads or promise cumulative totals.
Market results may expose `total_gmv`, `last30_days_gmv`, and `currency`. Compare only the same entity type, currency and time window. Live GMV belongs to the returned stream, not a creator's 30-day total. Missing/null metrics are unavailable evidence; explicit zero is a reported value.

TikTok product/shop/live market reads consume Skill Credit by returned item. Read-only does not mean free. Discover current account pricing for `tiktok_search` through the available runtime before broad pages; do not assume a fixed price or use Creator Marketplace store quotas as the price. Keep pages purposeful, preserve filters while paging, and stop at the user's requested scope. Connected-store workflows retain their separate binding, official quota and membership requirements.

## Connected-Store Target Invitations

Use only the currently exposed store-project capability and its exact schema for Creator Marketplace target invitations. This is separate from intelligent Campaign invitations. Replace examples with the selected binding, creators, products, commission, approved message/contact and a future epoch-millisecond end time. Commission 1000 means 10%.

For free samples with manual approval, the canonical `sample_approval_exempt` is false with `has_free_sample` true. True exempts approval. Use one supported field name; do not change the approval value just to bypass a field error. Preserve the error and request identity while checking runtime support. A saved draft does not send; formal submission in IMMEDIATE mode may start sending immediately, so confirm the exact sending effect before that submission. Read back the saved approval rule and distinguish submission from completed delivery.

Existing project updates replace the full form. Read current project and creator selection, preserve all message, invitation and execution settings, and change only the approved fields. A creation example cannot replace a current snapshot. If required current settings are unavailable, stop and explain what is missing; do not invent defaults or switch execution routes.

## Lookalikes And Selected Exports

Lookalike results are recommendations, not proof of fit. Keep the source creator and returned export context intact. Create a selected-result export only after the user chooses the returned items. A deep export may require a preview because richer fields and contacts can consume additional business quota.

## Evaluation

Check the user's stated concern first. Otherwise evaluate profile, audience, content performance, cooperation evidence, dispute signals, and commercial reasonableness in that order when data is available.

Use one scoped conclusion: strong within the checked scope, workable with risks, insufficient evidence, or weak within the checked scope. Follow the conclusion with evidence covering performance, audience quality, cooperation risk, and price or response behavior. Surface disputes and negative cooperation evidence prominently. If important dimensions are missing or platform-limited, narrow the conclusion instead of inventing certainty.

## Contacts

Retrieve visible contact information only when the user explicitly requests external outreach or exported contact details. An email signal in search does not guarantee a visible address. Return only available contact values and their quality signal; state plainly when an address is absent or low confidence.

Platform email outreach should use selected creator identities and does not require visible contact retrieval. Do not consume contact quota merely because the user said "email" when the intended workflow is platform outreach.

Marking a creator as not interested is a reversible account mutation and requires explicit user intent. A weak match or noisy search result alone is not approval.
