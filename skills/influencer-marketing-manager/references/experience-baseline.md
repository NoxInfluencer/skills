# Experienced Operations Baseline

Use this reference as a practical prior when a project has no mature operating method. It reflects patterns from an experienced influencer-marketing operations team. The user's objective and active project rules refine or replace it; label any unvalidated choice as provisional.

## Apply the baseline

For method choices, use this precedence:

```text
user objective and constraints
→ active project rules and approved brief
→ this experienced baseline
→ general industry practice
```

When an important input is missing, choose a small reversible test, state the assumption, and define the observation that will confirm or revise it. Keep batch size and lane mix adaptive to the objective, platform, market, and observed supply; treat this baseline as a prior rather than a fixed quota or rubric.

When the objective, platform, or product-use scene is still unknown, begin with a small qualitative sample and checklist. Defer numeric batch sizes, lane percentages, weights, and thresholds until the missing inputs or a bounded sample and operator review support them.

Use [workspace-context.md](workspace-context.md) for current-state source roles and conflicts.

## Evidence calibration

Use machine output to decide what to inspect, then ground the decision in current, comparable evidence.

- Record a query's **total**, **returned**, **filtered/hidden**, and **deduplicated usable** counts separately, using the source's definitions. Treat them as separate dimensions and derive combined values only when the source documents their relationship. Plan review and expansion from the usable queue; treat the other counts as coverage diagnostics.
- Platform averages, tags, percentiles, composite or cooperation scores, reply likelihood, and contact/dispute flags are supporting clues. Establish optional-field semantics first; treat a missing or default-looking zero as unknown until the source documents it as "none." Reconcile the field with recent same-format content, a median or typical range, trend, and the real scene.
- Calibration examples from one reviewed snapshot (not thresholds): a ten-item profile averaged about **867K** views but had a **24K** median because nine items were Shorts and its only long-form item averaged about **1.2K**; another averaged about **45K** with an **8K** median. Headline averages therefore need format-specific review.
- When a historical note gives a send count and an informal "effective reply" count without fixed definitions, preserve it as a qualitative observation. Set the sent denominator, human-reply and qualification definitions, and observation window before calculating a rate.
- A contact flag is a discovery signal. Send readiness requires a verified route that can receive the intended message (an actual address for email), confirmed ownership and business purpose, and a fresh identity/send-history check. Display names or result-row positions cannot prove creator-level deduplication.
- Use the highest available benchmark in this order: same-project, same-type history → the creator's recent same-format content → a dated industry reference. External reports (for example, the [IAB 2025 Creator Economy Ad Spend & Strategy Report](https://www.iab.com/insights/2025-creator-economy-ad-spend-strategy-report/)) help frame funnel and measurement hypotheses; they do not set rates, thresholds, or response benchmarks.

## Discovery defaults

- Follow the playbook's two-pass method. As provisional values, review **3–5 representative recent pieces**, normally within **90 days** and with preference for continued activity within **60 days**; separate formats and use comparable medians or typical ranges.
- Check the real scene, audience, market, language, authenticity, safety, and prior cooperation; assign one primary lane for the cooperation story.
- Use follower count and platform averages for planning. Let goal-specific fit, recent evidence, and execution likelihood set priority.
- Keep fit and contact readiness separate, preserve strong fits while contact research continues, and check identity deduplication before expanding supply.
- If the project provides a cumulative mix, use its current gaps to steer the next query or market; let quality determine batch size rather than forcing a per-batch quota.
- Use a validated creator as a lookalike-search hypothesis by extracting its scene, audience, and format. Review every new result independently.

One earlier team case used fewer than roughly **1,000 views** on recent comparable long-form videos to lower priority for that campaign. Treat it as a calibration example only; establish any threshold with a small, current sample and the stated objective.

## Example creator lanes

Use these lanes to form an initial hypothesis; the active project may rename, merge, or replace them. They are exploration vocabulary, not a preset allocation.

| Lane | Natural content connection | Evidence to inspect | Outreach angle |
| --- | --- | --- | --- |
| **Tech / 3C** | Device ecosystems, reviews, setup, charging, measurable use | Recent product tests, explanations, long-form consistency, technical accuracy | New device cycle, real workflow, parameters, portability, or desk setup |
| **Outdoor** | Hiking, camping, road trips, fishing, photography, off-grid use | Actual activity and gear use, environment, trip format, audience relevance | Reliable power or utility in a real activity and a concrete scenario |
| **Student / campus** | Dorm, campus, library, commuting, study devices | Authentic student context, audience age/region, practical routines | Everyday study or commuting problem with a simple product use case |
| **Seasonal gifting** | Gift guides, holiday or sale lists, unboxing, purchase recommendations | Selection or purchase reasoning, timing, conversion intent | A useful gift choice, reason to buy, and seasonal deadline |
| **Shopping** | Shop-with-me, store visits, hauls, deals, purchase trade-offs | Recent shopping-led content, store context, natural product placement | A current shopping decision, store find, deal, or portable-use moment |

Travel, photography, device ecosystems, desk setup, and similar terms can be secondary scene labels. Use the lane that best describes the creator's recent main narrative so the cooperation story follows the actual context.

Use a simple scene test: tech needs repeated testing, explanation, or real use; outdoor needs a real activity with visible function; shopping or gifting needs recurring purchase or selection intent; student needs a credible campus or study context. Treat the label as provisional until recent content supports it.

## Outreach and lifecycle defaults

- For a qualified creator without a ready contact, check the channel's public contact area, linked website or media kit, then clearly associated public profiles. Verify ownership and record the source.
- Personalize the first contact to the creator's primary lane and **one concrete recent scene**; use the playbook's message checklist and leave detailed price, rights, exclusivity, and delivery promises for the approved commercial conversation.
- A practical starting cadence is a follow-up after **3–5 business days**, another after **5–7 business days**, and a short close-the-loop note. Verify the send and read back the actual state afterward.
- Treat a substantive human reply as new evidence: summarize it, re-check fit and terms, and apply the confirmation rule in the playbook before sending a changed response.
- Use the playbook to compare complete packages, turn approved terms into a checklist, and measure the chosen objective.

## Transferable patterns

1. **Aggregate data hides format mix.** Split formats and use recent representative medians.
2. **Fit and readiness differ.** Preserve a strong fit while contact research continues.
3. **A reply changes qualification.** Re-read the message and re-check terms before a commercial decision.
4. **The lane changes the proposition.** Tie the product scene and question to the creator's actual narrative.
5. **Weak response is a learning signal.** Test the most plausible cause on a bounded batch before scaling volume.
