# Intelligent Marketing Plans And Campaigns

## Intelligent Marketing Plans

An intelligent marketing plan (Campaign) is a task-oriented workspace that can carry preparation, creator selection, recipient state, outreach content, execution status, and reporting. Begin with the plan list or plan detail when the target task is unclear. Keep task identity, ownership, status, and pagination metadata for later actions.

Read operations should return useful plan summaries without opening a page. Open a page only when the user asks to continue visually or explicitly approves a supported page handoff. A missing business capability alone does not authorize browser operation or changing the execution route.

## Campaign State

Read the current campaign before changing creators, recipients, sender, subject, body, schedule, or reporting settings. Treat a campaign and a standalone email task as different owners of outreach state. Do not attach a standalone task to a campaign by inventing a relationship.

Recipient operations must preserve the selected creator set, exclusions, deduplication result, and invalid-item details. Content operations must distinguish reusable content, current draft, rendered preview, and the exact content approved for sending.

## Plan Field Values

Read the active command or tool schema before constructing a plan patch. For target markets, read `data.campaign.inputOptions.targetMarkets` from Campaign context. When its status is `ok`, identify the user's requested countries by the returned labels and copy their exact `items[].value` codes. If the catalog is unavailable, report that dependency instead of guessing codes or treating an empty list as the supported set. `inputOptions` is read-only metadata; never copy it into `settings`.

Use `inputOptions.creatorLanguages` and `inputOptions.creatorCategories` the same way: copy exact values from the available catalog. A translated language name, category label, navigation node or group is not a selectable value. Catalogs have independent availability states. Do not replace an unavailable or rejected selection with an empty list; clearing a target changes the user's campaign scope.

Use decimal strings for monetary values. Respect the live schema and storage precision for budgets and product prices; do not round or truncate the user's amount to pass validation. Quantities and range bounds use JSON integers, or canonical integer text only where the schema permits it. Strings such as `01`, `1.0`, and `1e3` are not canonical integer text. Preserve the currency and amount as separate facts; changing a currency does not convert a price.

Use actual uploaded file references and metadata. Briefs retain at most three attachments. File sizes are nonnegative whole bytes, not rounded estimates. Preserve plan product identities returned by reads or writes; a product-center identity is a different field. Save incomplete proposals as drafts, and apply only the settings or product scope actually requested by the user.

Plan creation, draft saves, application and product additions return a compact receipt containing the plan identity, exact string versions and timestamps. Product additions also return the selected `productId` and whether anything changed. Read the plan again when full settings are needed. A receipt confirms the specific write; a saved draft does not mean it has been applied, and adding one applied product does not publish unrelated draft edits.

Compatibility fields such as quote method, optimization goal and negotiation switches must follow the active schema's exact numeric values. Preserve returned values only where valid; these fields do not configure the new automatic-advance policy. Use the dedicated automatic-advance capability for that policy.

Automatic-discovery configuration saves replace the complete configuration. Preserve fields that should remain. Its readable response contains both serialized and parsed configuration, so delivery size is checked before saving; reduce an oversized proposed configuration instead of retrying with a new attempt identity. Omitting or clearing configuration saves an empty object, while omitting the enabled field preserves its current switch.

## Execution And Reporting

For invitation management, read `{baseDir}/references/campaign-invitation-management.md`. It defines permitted copy drafting, page operations, and the mandatory reviewed second confirmation for start, resend and retry.

Validation checks whether the current state is executable. Preview explains the intended change or send scope. Execution applies the already approved state. If recipients, sender, content, schedule, or key parameters change after approval, create a new preview and request confirmation again.

Bulk send, payment, irreversible removal, and destructive campaign changes are high risk. See `{baseDir}/references/risk-confirmation.md` before execution.

Long-running campaign preparation, enrichment, send, or report work must retain one task identity. Poll with bounded intervals, expose progress and partial failures, and never create a replacement task merely because the first task is still pending.

## Campaign Agent Discovery Workflow

When the user enables Campaign automatic discovery, continue without waiting for confirmation unless the user explicitly asks for advice only or asks to review before execution. Use the same Campaign conversation so later messages can refine the campaign and continue from the conversation and current Campaign lists.

The workflow has three stages:

1. Discover: read the applied campaign context, turn the user's requirements into bounded platform search conditions, search creators, inspect creator details and recent content when useful, and summarize the conditions, results and evidence in the current Campaign conversation.
2. Initial selection: judge creators from discovery results using the user's initial-selection instruction first, then the applied campaign requirements, then the default Agent judgment. Suitable creators become campaign candidates; unsuitable creators are marked not interested.
3. Curation: judge current campaign candidates using the user's curation instruction first, then the applied campaign requirements, then the default Agent judgment. Curated creators move directly to invitation pending without a confirmation step.

The default judgment considers campaign objective, product and content fit, target audience, market and language, platform fit, recent content quality, execution feasibility, and brand safety. Do not decide from a single metric. If evidence is incomplete, inspect more evidence and then make the best campaign-fit decision; do not create an implicit human review queue.

Write a concise plan note for every selection decision. Keep it to one or two sentences containing the decision and its main reason. Put detailed evidence and the full process in the task messages, not in the plan note.

Each batch contains at most 100 targets. Use the returned creator identity, or an exact raw channel identity with its numeric platform. Raw channel identities are limited to 128 UTF-16 code units after removing leading and trailing ASCII control characters and spaces; plan notes use the same trimming rule with a 512-unit limit. An emoji normally counts as two UTF-16 units. Keep the entire batch valid; one invalid target rejects the batch. A candidate `source` is optional provenance text limited to 32 UTF-16 units, rather than a closed list of guessed enum values.

Invitation actions use the same bounded channel identity. When both an opaque creator identity and raw channel/platform are supplied, they must identify the same creator. Sending accepts at most 100 targets; resend and retry each require exactly one. A cancellation chooses exactly one scope: a creator, a task, an explicit batch of at most 1,000 creators, or all matching creators with a confirmed count. Filters and the confirmed count belong only to the all-matching scope. Waiting cancellation is strict; queued cancellation may skip creators who are already sending, sent, or no longer eligible. Read the returned cancelled and skipped counts before reporting the result. Follower bounds above the safe JSON integer range use canonical decimal text and must fit a nonnegative signed 64-bit integer. Never turn an unknown send outcome into a new sending attempt.

Only use the Campaign business actions exposed by the active runtime. Never access campaign tables directly, invent a second deduplication rule, or manipulate the page DOM. The server remains authoritative for permissions, idempotency, status transitions, and facts.

## Search Conditions For Human Paging

When the user wants filters prepared in a Campaign search page and will page through results themselves, use the search-condition save capability with `search_type: 1` (ordinary search). Types `2` and `3` are AI matching and AI expansion. Read the current condition first and preserve unrelated filters. Saving a snapshot does not run discovery or send invitations.

`condition` is a JSON-serialized object, never a natural-language search prompt. The ordinary page snapshot contains `platform`, `operator`, `accurate`, `wordsList`, `searchFilter`, and `hideChannelFilter`. Keyword entries use the page structure, such as `{"value":"instant noodle","target":"5"}`. Use the active runtime's input schema and available request examples, plus the live search-filter options, to construct requested filters. Read back the saved snapshot and use the supported workspace handoff when requested.

For ordinary-page writes, `wordsList` is an array of objects with string `value`. Keyword `target` accepts `1` (all), `2` (name), `3` (introduction), or `5` (tag), as the schema's numeric or exact string values; omission uses the existing tag default. `searchFilter` and `hideChannelFilter` must be objects. Use `or` or `and` for new requests. Do not reuse this page-shaped object as the internal discovery-search execution snapshot.

Platform values are numeric: `1` YouTube, `3` X, `6` Instagram, `10` TikTok. If both outer `platform` and `condition.platform` are supplied, they must agree. A `channelIdRange` needs a platform and contains at most 100 nonblank channel IDs.

The active schema describes platform-specific page filters and the separate flat discovery-search criteria. Do not turn display labels into filter values or silently omit a requested filter when validation fails. Keep returned cursor strings unchanged; parsing and reserializing large cursor IDs through floating-point numbers can change the next page.

Copy enumeration values and JSON types exactly from the active input schema or authoritative options response. Display labels, guessed IDs, translated names, numeric strings and differently cased values are not substitutes. If an option is unavailable or ambiguous, read the relevant options instead of inventing a value. On a validation error, correct only the identified field from the schema or options; do not cycle through guessed shapes.

## Automatic Discovery Settings

Read the current settings before changing configuration. Saving `config` replaces the configuration object; omitted or null `config` clears it to `{}`. Preserve fields the user wants to keep. An omitted or null `enabled` preserves the current switch; use the switch capability for a switch-only change.

Use `candidate` or `invite` for `afterCurationAction`, and JSON booleans for `initialSelectionEnabled` and `curationEnabled`. Instruction fields contain text or null. Follow the active schema for limits and exact types, including when submitting a JSON-serialized configuration object. Historical unknown values may be returned for correction; they do not authorize writing those values back unchanged.
