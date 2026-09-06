# Business review — initial working criteria

Status: working criteria updated from user review, 2026-09-06. The requesting user is the first business reviewer. No recent operator rework was reported; the cases are synthetic probes, not invented customer incidents.

## Purpose and source boundary

Judge whether the result supports the user's next marketing decision with less critical correction. Do not judge wording similarity, a fixed report layout, or whether every possible contract field appears.

This starting point uses common sense and the user-designated `kol_operation` reference at commit `6ef6a3434d7b65db80c75b6b6ede23a985c9ca88`:

- `INIU/influencer-marketing/creator-evaluation.md`: recent comparable content, real scenes, and fit separate from contact readiness.
- `INIU/influencer-marketing/outreach-and-negotiation.md`: a first invitation seeks a clear reply; human interest and preliminary handoff are not confirmed cooperation.
- `INIU/influencer-marketing/templates.md`, section 7: evidence, reply intent, qualification review, risk, and the client's next decision.
- `INIU/influencer-marketing/project-iniu-youtube.md`: project-specific rules outrank historical snapshots; a reply does not waive qualification.

The source is read-only project guidance, not evidence of current system state or validated general effectiveness. Do not transfer its weighted scorecard, commercial terms, exclusion names, contact details, or project-only authority into the general Skill. All case fixtures use invented data.

## User feedback on the first sample

The user judged the [first case 21 sample](business-review-sample-2026-09-06.md) as **needs material revision**: one creator gives the client too little to compare; a batch of five is suitable for this workflow; repeated per-creator next actions add little; recommendations and evidence should be separate, readable decision dimensions.

Five is this user's working batch target, not a universal Skill default. The original snapshot only supports one qualified creator with human interest. This is an input/coverage shortfall, not permission to promote an unqualified creator or an auto-reply. Case 22 supplies a full batch; case 23 explicitly tests a five-person request against the limited case 21 snapshot. The original case 21 and its answer remain unchanged.

The prior Agent-only usable rating did not capture the user's comparison needs. Preserve that historical rating and this user correction separately; the old sample is not an approved client deliverable. Apply the revised comparison criteria to both baseline and candidate in this round. The user has not yet approved the revised sample.

## What is useful enough?

| Task | Initial judgment criteria |
| --- | --- |
| Creator selection | Identifies promising and unsuitable candidates from recent same-format evidence and the real product scene; preserves strong fits with contact pending; states the evidence still needed. |
| First invitation | Gives a truthful, specific selection reason, natural product connection, proposed format and one clear next question; does not invent a budget, product promise, contact route or completed send. |
| Preliminary client review | Provides the agreed batch for comparison, with recommendations separate from source-backed content evidence, human intent, known terms and important unknowns. Summarizes common conditions or actions once; only creator-specific differences belong in each row. Does not require a complete contract before an exploratory decision or present interest as agreement. |
| Operator follow-up summary | Covers the requested relationships, including stopped records when in scope. Distinguishes dated evidence from current-state interpretation, names material blockers and known owners, and separates proposed actions from decisions requiring approval. Missing evidence stays unknown. |

These are decision criteria, not fixed column names or a mandatory form. Adapt detail to the user's request and evidence. A missing fact blocks progress only when it materially affects the current decision or authority; required commercial terms still need confirmation before commitment. If the evidence supports fewer eligible creators than requested, show the supported subset, state the shortfall and keep the batch incomplete. Do not invent candidates, waive qualification or claim additional discovery merely to fill it.

## Information selection and expression

The user's latest clarification is to learn which information operators care about, not to build or maintain their dashboard. Evaluate answer content and business usefulness; no new view, artifact schema, persistent update workflow or continuous-monitoring test is required.

Apply these checks to both baseline and candidate before judging the overall result:

- **Relevance:** includes what affects this reader's current decision; does not require a full contract or fulfillment checklist for preliminary review.
- **Fidelity:** preserves known values, associated deliverables, sources and material unknowns; reports a specific qualification failure without expanding it into an unsupported broader claim.
- **Separation:** factual evidence, assessment and unresolved questions are easy to distinguish. A fixed set of headings or columns is not required.
- **Comparison and economy:** uses consistent relevant dimensions across creators, retains decision-relevant differences and summarizes shared conditions once. Brevity must not hide known terms, risks or required decisions.

Cases 22/23 cover client comparison and a qualification shortfall; case 24 covers operational progress, commercial conditions, responsibility and decision boundaries. Judge actual information, not whether the model mentions these dimensions. Keep stage-specific execution-detail coverage limited to the supplied evidence; these cases do not prove fulfillment performance.

## Operator follow-up evidence

The operator view answers a different question from a client shortlist: what needs attention across the relationships already being followed? Appearing in this view does not establish client-submission eligibility. Relationship-specific blockers and actions are useful here even when a client comparison has one shared next step.

The same reference project's `campaign-operations.md` and `project-iniu-youtube.md` distinguish dated changes, the authoritative CRM, ownership and stop conditions. Its `.codex/iniu-youtube-state.json` stores dashboard configuration and historical follow-up events, not the full page schema. The available snapshot contains 73 follow-up entries, 46 with `followup_type`; these record actions, not current cooperation states. The original HTML is unavailable. Do not infer its columns or convert its seven project display groups into a universal Skill state machine.

Case 24 uses an invented export with fictional people and terms to test these distinctions:

- A sent follow-up or automatic acknowledgement is not a human reply or a quote.
- A newer offer is evidence to surface alongside the CRM state, not approval to reopen a closed or excluded relationship.
- An operator handoff changes responsibility, not whether cooperation or commercial terms have been approved.
- Missing CRM or message data does not prove no reply, closure or an assigned owner; identify the smallest lookup without blocking supported work.
- Proposed actions need the applicable authority. Do not turn a summary into a claim of live readback, sending, record changes or commercial acceptance.

Assess source, observation time and coverage where they affect the decision. This is a synthetic interpretation test, not validation of a real dashboard integration.

## Review form

Read the original answer and, when an action is claimed, its trace. For each case, use:

```text
Case / variant / run:
Judgment: usable / needs material revision / unusable
Most important reason and supporting excerpt:
Which next decision can or cannot be made:
User correction, if any:
```

- **Usable:** supports the current decision; no material invented fact, omitted qualification issue or authority error. Cosmetic edits do not make it a failure.
- **Needs material revision:** useful work remains, but a decision-relevant omission, ambiguity or excess blocks direct use.
- **Unusable:** wrong recommendation, fabricated evidence/commitment, or a material scope or authority violation makes the result unsafe or misleading to use.

Agent review is preliminary; never label it as user approval. If the user changes a criterion, apply it to both saved baseline and candidate outputs and keep the original review for traceability. Do not invent complaints or assume missing feedback means success.

## Coverage and automation

- Cases 9, 21, 22, 23 and 24 require this review. Their automated checks only establish response availability, Skill loading, and supplied source-read evidence. Green Promptfoo rows do not grade their business outcome or readability.
- Other executable cases retain their existing smoke checks. Known wording errors and missed requirements still need explicit manual correction; see the [rejected revision review](review-2026-09-06.md).
- Keep current graders unchanged during the Skill comparison. There is no new model judge, scoring platform, or universal performance benchmark.
- A synthetic case can test interpretation and draft quality, not real discovery, message delivery, customer acceptance, reply rates or marketing ROI.
