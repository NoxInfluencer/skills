# Brand Monitoring

Brand monitoring starts from `brand_id` and analyzes owned or competitor brands. It is distinct from creator due diligence, which starts from creator identity.

## Discovery And Selection

Use exact-name search for a known brand, ranking for category or market discovery, and the account list for monitored, unlocked, or sample brands. After selection, preserve the opaque brand identity and read current brand state before a mutation.

## Analysis

Rate and share selectors (`channel_interactive_rate`, `interactive_rate`, `engagement_rate`, `related_content_rate`, `share_of_voice`, `profile_purity` and their min/max bounds) use decimal ratios: 5% is `0.05`. Returned rates, distribution `percent` values and cooperation/prospect proportions use the same decimal scale. `traffic_efficiency_index` and `interaction_quality_index` are relative indices: 1 is the baseline and 1.1 is 1.1 times baseline, not 1.1%. Video-count growth is a decimal growth ratio and may be negative; a zero previous count produces the upstream sentinel 1, not a measured doubling.

Brand-level analysis can cover competition, cooperation, influencer portrait, defense gaps, and product signals. Asset lists provide underlying influencer, content, tag, or product rows. Present the business conclusion first, then the bounded evidence used to support it.

Product publication, category, share-of-voice, exposure, promotion matrix, and promotion distinction signals currently support YouTube only. For TikTok or Instagram questions, use supported non-product brand views and clearly state the product-signal limitation.

## Mutations And Exports

Adding, unlocking, or changing monitored brands is a write. Show the selected brand, entitlement or cost impact, resulting visibility, and whether the action is reversible before approval. Never broaden an unlock from one brand or tier to another.

Brand asset exports are asynchronous shared exports. Create one task for the selected asset scope, retain its identity, poll with bounded intervals, and retrieve the result only when ready. Preserve row-level or entitlement failures.
