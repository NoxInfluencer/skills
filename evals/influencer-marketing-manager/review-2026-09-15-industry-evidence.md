# Industry evidence review — 2026-09-15

Retain the two new evaluation cases and restore the Manager instructions to the baseline. Two shorter source-reading revisions still produced an unsupported industry figure in case 15. Neither is a demonstrated repair. The previously reported IAB citation problem remains open; changing the unsupported figure to a different publisher does not resolve it.

## Contract and changes tested

Baseline: `3af74638affe767b0f16761dd2a275aa7227e8ab`. The original 34 cases are unchanged. [Case 35](evals.json) repeats case 15's exact strategy request with a [fictional UK pet-care report](fixtures/inputs/case35-pet-report.md). Case 36 supplies a [fictional US app report](fixtures/inputs/case36-app-report.md) and asks for a budget decision using the user's own unit economics. The new cases were committed before the behavior comparison in `d96a9d7`.

Review checks the supporting source reads, observed versus forecast figures, denominator and cost scope, applicability and usefulness of the strategy. Avoiding every number is not a pass when useful figures are supplied. Calculations using project assumptions must remain distinct from facts observed in a report.

Both candidate revisions were shorter than the original guidance:

- Candidate 1 replaced the abstract benchmark warning with a short sequence: select relevant figures, read the passage, cite its scope, then apply it. It removed the fixed IAB report example and consolidated the reference guidance.
- Candidate 2 moved evidence gathering before strategy drafting and paired each figure with its supporting excerpt in the existing working record. It retained the first candidate's reference consolidation.

Neither candidate added a script, new runtime, external research service or automatic semantic grader. Both were rejected and their patches remain in the ignored workspace. The two hand-edited source files are restored to the baseline.

## Runtime and evidence

The existing conversation runner used `gpt-5.6-terra`, medium reasoning, read-only filesystem, disabled web search and restricted network access. Each case and variant received a fresh workspace with only its copied Skills and declared input files. Expectations remained outside the model request. The same prompts, reports, runtime and graders were used across revisions; only the Manager Skill varied.

Source fingerprints:

| Version | Manager directory SHA-256 |
| --- | --- |
| Baseline | `a600803b83474b90060e8c3df4d9a5f7c0ba51791fe80095c79005b1d9507404` |
| Candidate 1 | `6beba22170ac09dc9f4b18e898cd8454860cde9c60ddf89e04acbdbb8347f904` |
| Candidate 2 | `8738187de71e1e958941545c4c6287b54afea066353108bc130adc5dde580790` |

The common evaluation contract digest was `f5084040869d12d1783c9d0f473a854072f64e0e29c5bafe590e7bfa75230b11`. The other Skill was identical across variants. A targeted check of the failing run confirmed that the model received the network restriction and successfully read the revised Manager instructions. Missing instructions were not the observed cause.

## Observations

| Case | Baseline | Candidate 1 | Candidate 2 |
| --- | --- | --- | --- |
| 15, no supplied report | This run omitted the historical IAB spend figures. It still described what an unread report supported, so it does not demonstrate complete source discipline. | Quoted a PFMA household pet-ownership estimate without reading its source. **Fails the evidence requirement.** | Quoted the same type of unsupported estimate, with a URL. **Fails the evidence requirement.** |
| 35, supplied pet-care report | Read the full report; used observed 2.2% conversion and 42/60 eligible subscriptions retained, separated the 3.1% scenario and retained missing-cost limits. Useful reasoning, but the answer omitted the publisher and publication date and is partial against the full attribution requirement. | Stream error followed by an answer and completion event; the existing runner conservatively records a runtime error. The answer also needs review for weak attribution and using the forecast as a planning target. Excluded from clean executions. | Aborted after stream failures; only a progress message, no completed answer. Excluded. |
| 36, app economics | Correctly calculated 6.0% observed conversion and USD 60 in creator fees per first payer, and separated the 8.0% scenario. It then called a calculation using the user's USD 18 margin the historical sample's contribution. That margin was absent from the report, so this is a counterfactual, not an observed loss. **Needs revision.** | Interrupted after repeated stream reconnections in the already rejected candidate; partial evidence retained. Excluded. | Aborted after stream failures without a completed answer. Excluded. |

Candidate 1, case 15:

> PFMA’s 2024 UK pet-population reporting is a useful demand-sizing reference: roughly six in ten UK households report owning a pet, with dogs and cats the largest groups.

Candidate 2, case 15:

> PFMA, *Pet Population 2024*: estimates that 60% of UK households own a pet. Use it to justify a broad addressable market, not as evidence for a specific creator audience.

No PFMA report text was supplied or retrieved in either trace. This review has not established whether the figures or claimed source are correct; it establishes missing support. Candidate 2 also excluded affiliate commission from the user's creator budget, another assumption that needs business review before use.

There were nine SDK conversation attempts: five completed without recorded runtime errors and four with runtime errors or interruption. Those counts are not business pass counts. The first candidate's case 35 retained a final answer after reconnection; keeping its existing runtime-error classification avoids changing acceptance rules to obtain a better result.

## Independent bookmark-only probe

Three fresh native subagents separately received the baseline, candidate 1 or candidate 2, plus this identical user request:

> 我们是英国宠物订阅品牌，半年红人预算 4 万英镑，目前没有历史合作数据。同事留了这条行业报告书签。请结合它给我一个简短的首轮策略建议，说明有什么行业数字值得参考，以及我们应该怎么验证效果。

The only raw input was a note containing the IAB 2025 report title and URL, stating that no text or tables were saved. Each agent received only its current Skill and that note, with no network permission, prior conclusions or expected answer. All three reported the missing report text, avoided unsupported figures and delivered a bounded strategy and measurement plan.

This is a useful explicit source-gap check, not evidence that either candidate improved reliability. Native agents inherited their runtime settings without a model override; these results are separate from the SDK comparison. Only native final answers are retained here, not a complete child tool-event trace. Separate directories and resource instructions are not an OS sandbox.

## Retained work and handling

The retained improvement is reproducible coverage: no report versus a supplied report for the same request, plus transfer to another market and funnel. Use the [conversation commands](README.md#conversation-probes) to repeat cases 15, 35 and 36. Their complete answers and tool events require business review; they have no automatic outcome grade.

For an actual report-based task, provide or retrieve the relevant source passage before using its figures, then review how its scope affects the decision. The supplied-report tests show why both support and interpretation matter. This is the intended operating method, not a claim that the current Skill enforces it reliably.

Raw evidence is in ignored `workspace/promptfoo/industry-evidence-comparison-20260915.json` and `workspace/promptfoo/industry-evidence-grounded-20260915.json`. Candidate patches and review notes are under `workspace/industry-evidence-20260915/`; the bookmark input and three complete native answers are under `workspace/source-lead-20260915/`. Errors and rejected versions remain available for inspection. Public fixtures contain fictional data, with no customer material or personal runtime paths.

Distribution checks also found that the earlier logistics change in `3af7463` had not reached the generated Expert and Connector copies. Those copies were synchronized from their existing source files; no logistics rule was redesigned in this review.

The industry-evidence repair is not complete. Further work should address source acquisition and evidence review in the actual execution environment, rather than continuing to append prompt warnings or claiming success from a different unsupported number.
