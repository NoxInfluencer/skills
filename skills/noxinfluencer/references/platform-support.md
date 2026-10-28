# Platform Support

NoxInfluencer skills support three platforms. Each has some data availability differences.

## Supported Platforms

| Platform | `--platform` value | Creator ID prefix byte |
|----------|-------------------|----------------------|
| YouTube | `youtube` | `0x01` |
| TikTok | `tiktok` | `0x02` |
| Instagram | `instagram` | `0x03` |

## Data Availability by Platform

| Data Dimension | YouTube | TikTok | Instagram |
|----------------|---------|--------|-----------|
| Search | Full | Full | Full |
| Profile overview | Full | Full | Full |
| NoxScore | Full | Full | Full |
| Audience demographics | Full | Full | Partial |
| Audience authenticity | Full | Full | Limited |
| Content tags | Full | Full | Full |
| Recent content | Full | Full | Full (posts, reels, pics) |
| Cooperation detail | Full | Partial | Partial |
| Brand partnerships | Full | Partial | Limited |
| Pricing data | Full | Partial | Limited |
| Contact/email | Available | Available | Available |
| Video monitoring | Full | Full | Full |
| Brand monitor product signals | YouTube only | Not supported | Not supported |

## Content Type Splits

Different platforms have different content types that affect performance metrics:

- **YouTube**: `normal` (long-form) vs. `shorts`
- **TikTok**: All content treated as short-form
- **Instagram**: `posts`, `reels`, `pics` — metrics may be split by type

## Platform-Specific Notes

### Profile Performance Samples

`creator profile --detail` currently uses the latest 10 contents. It returns the SaaS overview metrics when available:

| Field | Interpretation |
| --- | --- |
| `avg_views`, `median_views` | Mean and median of the creator's playback sample. |
| `wave` | Sample standard deviation divided by mean views. For example, `0.3781` displays as 37.81%; a larger value means greater variation across contents. Null is unavailable, not zero. |
| `avg_views_change_ratio` | Change ratio supplied by SaaS; `-0.2783` means a 27.83% decrease. |
| `avg_views_level`, `wave_level` | SaaS metric ratings; interpret with the corresponding metric, not as creator-fit conclusions. |
| `avg_views_benchmark`, `wave_benchmark` | Peer reference ranges, medians, means, and ranking ratios. These describe peers, not the creator's own content sample. |

YouTube detail splits the same sample into long videos and Shorts. Use `normal_count` and `shorts_count` to explain `avg_views_normal/shorts` and `wave_normal/shorts`: a sample with 7 long videos and 3 Shorts is not an independent latest-10 sample for each format. Search fields with the same names come from the search index and may differ in sample or freshness. Do not replace a search filter value with a profile-detail value.

Instagram detail first takes the latest 10 mixed contents, then computes playback mean, median, and fluctuation from the Reels with available playback data. Image posts do not supply Reels playback evidence. Report `posts_count`, `reels_count`, and `pics_count`; one Reel among nine image posts means the playback mean describes that one Reel. Do not describe it as the mean of 10 Reels or divide the Reel views by all 10 posts. The `wave` value may be null when the playback sample is too small.

Medians and fluctuation are detail outputs; current creator search has no dedicated median/fluctuation filters. Use only the range/type controls exposed by the relevant command's runtime schema.

### Availability and Identity

- **Null fields**: Some fields may return `null` on certain platforms. This is expected behavior, not a data error. Skills should explain that the value may be unavailable for that platform rather than treating it as a failure.
- **Creator identity fields**: All creator read responses include `creator_id`, `creator_name`, `channel_handle`, `channel_url`, and `social_media`. `channel_url` and `social_media` are enhancement data and may still be empty on some creators or platforms.
- **Audience data**: Instagram audience data may be less granular than YouTube or TikTok.
- **Cooperation data**: Pricing and communication metrics are most complete on YouTube. TikTok and Instagram may have partial or no pricing data.
- **Creator IDs**: Creator search returns the encrypted token as `data.items[].id`; creator read responses return it as `data.creator_id`. Both are stable opaque identifiers generated from the platform and platform-side channel ID, not database record IDs. The same creator always produces the same token. Reuse it directly without decryption or reconstruction.
- **Direct selectors**: The first creator read call may use `--url` or `--platform --channel-id`. Once a response returns `data.creator_id`, switch to that token for follow-up calls.
- **Monitor task identity**: `monitor add-task` and `monitor tasks` may also expose `creator_id`, `creator_name`, `channel_handle`, and `channel_url`. Treat these as best-effort task metadata; nullable fields are not a hard failure.
- **Brand monitor product signals**: Product publication, category, SOV, TAE, PP, promotion matrix, and promotion distinction commands currently support YouTube only. For TikTok or Instagram brand questions, use non-product brand monitor reads or asset lists when schema permits.
