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

Null or absent platform-limited fields are not automatically errors. State that the dimension is unavailable or partial and narrow the conclusion. Do not convert missing pricing, audience, cooperation, or contact evidence into a zero value.

Creator and brand identities are opaque. Preserve returned identities across follow-up work without decoding platform prefix data. Direct URLs or channel identifiers may help locate an initial creator, but subsequent work should use the returned stable identity.

Monitoring task identity fields are best-effort metadata. A missing display name, handle, or channel URL does not invalidate an otherwise valid tracked task.
