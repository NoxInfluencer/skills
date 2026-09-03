# Influencer Marketing Playbook

Use this playbook as adaptive decision guidance. Start at the user's current lifecycle stage, define the result that matters now, choose evidence in proportion to the decision, and let observed outcomes refine the next move.

## Contents

- [1. Frame the work](#1-frame-the-work)
- [2. Discover creators in two passes](#2-discover-creators-in-two-passes)
- [3. Build a useful shortlist](#3-build-a-useful-shortlist)
- [4. Create and manage outreach](#4-create-and-manage-outreach)
- [5. Turn replies into decisions](#5-turn-replies-into-decisions)
- [6. Negotiate the complete cooperation](#6-negotiate-the-complete-cooperation)
- [7. Fulfill and publish](#7-fulfill-and-publish)
- [8. Measure and learn](#8-measure-and-learn)
- [9. Maintain a verifiable record](#9-maintain-a-verifiable-record)

## 1. Frame the work

Translate the request into a working business hypothesis:

> For **[target audience]**, **[creator type]** in **[real content scene]** can encourage **[target behavior]** because **[evidence or insight]**.

Capture:

- primary and secondary outcomes;
- audience, market, language, product, timing, and resources;
- must-haves, preferences, and assumptions;
- current lifecycle stage and relationship state;
- authority for research, preparation, outreach, spending, and commercial commitments;
- the observable signal that counts as progress in this stage.

Ask only questions that change the next action. Use a stated assumption and a small reversible test when the missing information affects exploration; bring a material choice to the user when it affects spend, rights, reputation, or an external promise.

For an underspecified brief, use a small qualitative sample and evidence checklist. Let the first observations shape any later batch size, lane allocation, score, or threshold; do not invent those numbers before the objective and use scene are clear.

## 2. Discover creators in two passes

The coarse pass protects coverage and efficiency; the fine pass protects decision quality. Keep their inputs, cost, and outputs distinct.

### 2.1 Pass A — coarse screen

Turn the hypothesis into structured dimensions:

- platform and format;
- market, country, language, and audience location;
- topic, category, and concrete use scene;
- recency and basic activity;
- rough reach or performance range;
- contact or cooperation signals when available.

Use the available creator-intelligence capability at runtime for current syntax, fields, quotas, and identifiers. Run a few complementary queries when one narrow query could hide adjacent supply, and keep each query's purpose visible.

Use structured results to form a broad candidate queue. Apply active project must-haves and use the experienced baseline to fill gaps left by project rules. Check platform, market/language, apparent scene, basic activity, rough format mix, and obvious identity or duplicate signals—the fields the source can actually support.

Deduplicate by a stable creator or channel ID. Retain the source URL, query, source system, and observation time. When the target count is unknown, use enough candidates to compare the leading hypotheses and let observed supply set the size.

Record query-level supply as separate counts when the source exposes them: **total potential results**, **returned rows**, **filtered or hidden rows**, and **deduplicated usable candidates**. Preserve each count's source definition and derive combined values only when the source documents their relationship. Use the usable queue to decide how much to review or where to expand; total size describes potential coverage, not a recommendation list.

Each coarse candidate card contains:

```text
creator/channel identity and stable ID
source query, source system, and observed time
structured metrics and recency signals
apparent primary lane and format mix
contact-readiness signal
coarse-screen decision
unknowns that require fine selection
```

Coarse results form the research queue; recommendations come after fine review. A candidate earns deeper review by satisfying structured must-haves and offering a plausible route to the business objective.

### 2.2 Pass B — fine selection

Spend detail and browser-review effort on a smaller, purposeful subset:

- high-potential candidates;
- important missing-information or boundary cases;
- candidates whose structured metrics conflict with the content signal;
- supply that is strategically important to the market or scene.

Use creator detail data and, when available, browser inspection of the channel, About page, recent videos, titles, thumbnails, descriptions, comments, and visible cooperation context. This evidence tests whether the partnership will feel natural to the audience, not merely whether a row passes a filter.

Review **3–5 representative recent pieces**, normally within **90 days** and with preference for continued activity within **60 days**. Separate long-form, Shorts, live replays, and other formats. Record a comparable recent view range or median, explain breakouts, and compare commercial and non-commercial content when useful.

Use machine output to triage rather than conclude: reconcile average views with the median or typical range, format mix, recency, and trend. Composite scores, percentiles, semantic tags, reply likelihood, cooperation or dispute fields, and contact flags are supporting signals. Establish optional-field semantics first; treat a missing or default-looking zero as unknown until the source documents it as "none." Conflicting signals earn detail or browser review of the underlying content.

Answer the decision questions:

1. Does the creator repeatedly operate in a scene where the product can be used truthfully?
2. Do audience, market, and language fit the target behavior?
3. Can the creator explain or demonstrate the value in a natural format?
4. Is recent, format-specific performance representative and consistent enough for this objective?
5. Do authenticity, brand-safety, prior cooperation, and production signals support a workable relationship?
6. What concrete cooperation idea makes the selection credible?

Record supporting links, observation time, interpretation, confidence, and the largest unresolved risk. If detail or browser evidence is unavailable, keep the decision provisional and name the smallest follow-up that would raise confidence.

Apply a simple scene test to the primary lane: tech should show repeated testing, explanation, or real use; outdoor should show a real activity and visible function; shopping or gifting should show purchase or selection intent; student should show a credible campus or study context. Use one primary lane and treat other labels as supporting context.

Call a candidate fine-qualified when recent representative content, scene and audience fit, comparable performance, identity or safety context, and a concrete cooperation angle are covered. Until then, mark the decision provisional.

### 2.3 Fit and contact readiness

Return two related judgments:

| Dimension | Result examples | Meaning |
| --- | --- | --- |
| Creator fit | confirmed, provisional, weak | likelihood of advancing the current objective |
| Contact readiness | ready, contact pending, identity unverified | ability to take the next communication action |

Use public, verifiable business contacts and record how ownership was confirmed. Treat a contact flag such as `has_email=true` as a lead; send readiness starts after retrieving the actual address, verifying its ownership and business purpose, and checking identity and send history. Keep a qualified creator with contact pending in the portfolio. If an alternate address appears after a bounce, repeat identity, consent, deduplication, and send-history checks before retrying.

### 2.4 Decide when to search again

Use fine-selection findings to diagnose the supply problem:

- repeated content-fit failures → revise the query or creator hypothesis;
- strong metrics but unnatural scenes → change the content angle or lane definition;
- strong fits without contact routes → run a bounded contact-research batch;
- broadly weak recent performance → revisit the threshold, market, format, or objective with the user;
- high duplicate rate → improve identity matching and source coverage before adding volume.

If the project supplies a cumulative mix, use its current gaps to steer the next query, market, or lane; let evidence determine batch size rather than forcing a per-batch quota. A validated creator can seed a lookalike search through its scene, audience, and format, while every new result receives an independent fine review. Scale only when a bounded sample shows that the hypothesis and qualification evidence are working. A smaller, well-supported shortlist is a valid stage result.

## 3. Build a useful shortlist

Give each shortlisted creator a role in the portfolio—proven category voice, adjacent audience, dependable producer, conversion-oriented specialist, or controlled experiment—and explain how the role serves the objective.

Each entry should include:

- identity, platform, market, language, and primary lane;
- concrete cooperation scene;
- recent representative evidence and freshness;
- fit decision and confidence;
- contact readiness and next qualification action;
- principal risk, trade-off, and alternative.

Use follower scale for reach planning. Use recent comparable content, audience relevance, scene credibility, complete cost, and execution likelihood for priority. If the requested number cannot be supported at the required quality, report the gap and propose the next hypothesis.

## 4. Create and manage outreach

### 4.1 Write a credible first contact

The first contact seeks a clear reply. Include:

1. a truthful, specific reason the creator was selected;
2. the product and the creator's real content scene;
3. a value exchange meaningful to both parties;
4. a proposed collaboration format at the right level of detail;
5. one low-friction question or next step;
6. a clear sender identity and response route.

Let the primary lane choose the story. Keep price, rights, exclusivity, and delivery promises within the approved brief.
Anchor each message to one concrete, recent scene rather than a generic list of possible uses. Preserve the lane or message variant in the record so later reply quality can be compared.

### 4.2 Prepare and send

For a qualified creator without a ready contact, check the channel's public contact area, linked website or media kit, then clearly associated public profiles. Verify ownership and preserve a contact-pending record when the fit evidence remains useful. Read back the actual address and rendered To/Cc recipients before sending; a flag, typed value, or successful request alone does not establish sendability or delivery.

Before an external send, verify the approved message version, recipient identity, sender, subject, body, links or attachments, copied recipients, and applicable consent or suppression state. After sending, read back the task or message and record the actual result.

### 4.3 Follow up under an approved cadence

Choose timing from the launch window, channel norms, creator value, and prior interaction. A practical starting point is a first follow-up after **3–5 business days**, a second after another **5–7 business days**, and a short close-the-loop note. Once an exact rule is approved, continue matching routine follow-ups for eligible creators. A reply, opt-out, bounce, or material change moves the creator to response handling. For a substantive human reply, prepare the next response and obtain confirmation before sending unless an exact approved rule covers that reply class.

## 5. Turn replies into decisions

Treat an inbound message as new business evidence:

For recurring monitoring, read task-level aggregate counters first and compare them with the last successful baseline. Keep **unique replying creators**, **inbound message count**, **bounces**, and **qualified human intent** as separate measures; a new task's first successful check establishes its baseline. Read message bodies only after an aggregate count increases, then deduplicate on a stable message ID.

1. Detect new messages and deduplicate on a stable message ID.
2. Preserve the complete original text and message time.
3. Classify the response: interested, conditional, information-seeking, price/terms requested, later timing, declined, automatic, bounced, or another useful state.
4. Summarize intent and extract the terms that change the next decision.
5. Re-check creator fit, recent content, data credibility, and risk before client submission or negotiation.
6. Choose the next action and authority; ask for confirmation when it changes a material promise.

Extract at least:

- platform, format, deliverables, quantity, placement, and duration;
- fee, currency, tax, expenses, incentives, deposit, and payment timing;
- usage, ownership, paid media, whitelisting, territory, and duration;
- category exclusivity and duration;
- product, schedule, revisions, approval, cancellation, make-good, shipping, and reporting;
- the user's or client's unresolved decision.

An interested reply is a productive conversation result. Re-check fit and evidence before client submission; a reply does not itself establish qualification, submission eligibility, or confirmed cooperation. A confirmed cooperation requires a complete, approved package.

## 6. Negotiate the complete cooperation

Evaluate the whole package:

```text
complete cost = base fee + rights + exclusivity + tax + logistics + production support + payment cost
estimated CPV (when views are relevant) = complete cost / expected effective views
```

Include an explicit contingency for uncertain costs or delivery risks; use any percentage only when the active project or a tested assumption supports it.

Before replying, define the desired package, acceptable limits, best alternative, unresolved facts, and why each concession creates value. Trade scope, format, rights, exclusivity, timing, revisions, bundle size, or payment structure deliberately so a price movement has a corresponding change in value or risk.

Use current comparable evidence for market guidance. When it is absent, state the uncertainty and reason from expected contribution, recent performance, alternatives, complete cost, and downside. Use CPV only when views are a relevant objective; for traffic, sales, or another objective, compare the economics of that outcome. For a material commitment, present the package and total economics, evidence and confidence, target and limits, trade-offs, remaining risks, a practical alternative, and the exact decision the user must make. Hold the counter or acceptance until that package is confirmed.

## 7. Fulfill and publish

Turn approved terms into an observable checklist with owners, inputs, product or access, milestones, review points, publication window, disclosure, tracking, payment conditions, and completion evidence.

Give accurate product facts and mandatory requirements while preserving the authentic voice that justified selection. Before publication, verify agreed content, links, disclosure, tracking, rights, timing, and approval. After publication, confirm the public asset, capture its identifier and timestamp, and monitor agreed windows.

When delivery changes, assess its effect on the objective, economics, rights, and schedule; update the plan and obtain the authority required for a changed commitment.

## 8. Measure and learn

Choose metrics from the primary objective:

- awareness: effective reach, views, CPV, search or lift signals;
- education: watch time, retention, qualified comments, landing-page visits;
- traffic: clicks, CTR, qualified sessions;
- sales: orders, revenue, CVR, CPA, ROAS, and attribution window;
- content asset: usable files, rights duration, reuse value;
- relationship: response quality, on-time delivery, repeatability, and cost trend.

Set the observation window and denominator before comparing a batch. Use the highest available benchmark in this order: **same-project, same-type history → the creator's recent same-format content → a dated industry reference**. Define minimum acceptable, target, and stretch outcomes when a decision needs a threshold. For response rates, record the sent denominator, human-reply definition, and window; a single batch is a learning signal, not an industry benchmark.

Separate delivery, audience response, traffic/conversion, commercial outcome, and longer-term learning. Label attribution confidence and data limitations. Compare results with the original hypothesis, identify supported and contradicted assumptions, and choose the next support, reuse, renegotiation, pause, or test decision.

## 9. Maintain a verifiable record

Use the record contract in [workspace-context.md](workspace-context.md). At every stage, make the evidence, decision, authority, next action, and observed state reproducible; keep live dynamic state in its owning system and date any snapshot used as historical evidence.
