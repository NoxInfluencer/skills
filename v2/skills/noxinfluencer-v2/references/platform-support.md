# Platform Support

NoxInfluencer supports YouTube, TikTok, and Instagram. Data depth differs by platform and by creator.

| Data dimension | YouTube | TikTok | Instagram |
| --- | --- | --- | --- |
| Creator search and profile | Full | Full | Full |
| Audience demographics | Full | Full | Partial |
| Audience authenticity | Full | Full | Limited |
| Content and tags | Full | Full | Full |
| Cooperation evidence | Full | Partial | Partial |
| Brand partnerships | Full | Partial | Limited |
| Pricing evidence | Full | Partial | Limited |
| Visible contacts when available | Supported | Supported | Supported |
| Video monitoring | Full | Full | Full |
| Brand product signals | YouTube only | Not supported | Not supported |

YouTube distinguishes long-form content and Shorts. TikTok content is primarily short-form. Instagram may separate posts, Reels, and pictures. Compare performance within an appropriate platform and content type.

## Profile Performance Samples

Detailed creator profiles currently use the latest 10 contents and return SaaS overview metrics when available. Follow the counts in the actual result when fewer contents are available.

| Field | Interpretation |
| --- | --- |
| `avg_views`, `median_views` | Mean and median of the creator's playback sample. |
| `wave` | Sample standard deviation divided by mean views. `0.3781` is 37.81% fluctuation, not a share of videos. Null is unavailable, not zero. |
| `avg_views_change_ratio` | SaaS change ratio; `-0.2783` means a 27.83% decrease. |
| `avg_views_level`, `wave_level` | SaaS ratings for their respective metrics, not overall creator-fit conclusions. |
| `avg_views_benchmark`, `wave_benchmark` | Peer reference ranges, medians, means and ranking ratios, distinct from the creator's own sample. |

YouTube splits the same detail sample into long videos and Shorts. Use `normal_count` and `shorts_count` when interpreting `avg_views_normal/shorts` and `wave_normal/shorts`. Seven long videos and three Shorts in a ten-content sample are not independent latest-ten samples for each format. Search fields with the same names are index snapshots and can differ in sample or freshness.

Instagram takes the latest 10 mixed contents, then computes playback mean, median and fluctuation from Reels with available playback data. Image posts do not supply Reels playback evidence. Report `posts_count`, `reels_count` and `pics_count` when available. One Reel among nine image posts means the playback average describes that Reel; do not call it a ten-Reel average or divide its views by all ten posts. Fluctuation can be null when the playback sample is too small.

Medians and fluctuation are detail outputs, not dedicated creator-search filters. Use only controls exposed by the current runtime schema; preserve missing evidence without automatically adding paid detail reads. Search threshold interpretation is in `{baseDir}/references/creator.md`.

## Availability And Identity

Null or absent platform-limited fields are not automatically errors. State that the dimension is unavailable or partial and narrow the conclusion. Do not convert missing pricing, audience, cooperation, or contact evidence into a zero value.

Creator and brand identities are opaque. Preserve returned identities across follow-up work without decoding platform prefix data. Direct URLs or channel identifiers may help locate an initial creator, but subsequent work should use the returned stable identity.

Monitoring task identity fields are best-effort metadata. A missing display name, handle, or channel URL does not invalidate an otherwise valid tracked task.
