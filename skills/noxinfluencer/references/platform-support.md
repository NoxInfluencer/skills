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

## Content Type Splits

Different platforms have different content types that affect performance metrics:

- **YouTube**: `normal` (long-form) vs. `shorts`
- **TikTok**: All content treated as short-form
- **Instagram**: `posts`, `reels`, `pics` — metrics may be split by type

## Platform-Specific Notes

- **Null fields**: Some fields may return `null` on certain platforms. This is expected behavior, not a data error. Skills should explain that the value may be unavailable for that platform rather than treating it as a failure.
- **Profile links**: `creator profile` and `creator profile --detail` may include `channel_url` and `social_media`. Missing links should be treated as unavailable enhancement data, not a hard failure.
- **Audience data**: Instagram audience data may be less granular than YouTube or TikTok.
- **Cooperation data**: Pricing and communication metrics are most complete on YouTube. TikTok and Instagram may have partial or no pricing data.
- **Creator IDs**: All creator IDs in search results and creator read responses are encrypted tokens. The same creator always produces the same token. Use the token directly as the positional `<creator_id>` argument in subsequent commands without decryption.
- **Direct selectors**: The first creator read call may use `--url` or `--platform --channel-id`. Once a response returns `data.creator_id`, switch to that token for follow-up calls.
