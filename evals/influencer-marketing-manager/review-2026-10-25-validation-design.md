# Controlled reference-context and repetition review

Date: 2026-10-25

The retained optimization is the evaluation runner and its focused tests. The
controlled recheck does not justify retaining the B1 paragraph; Manager and
Expert match the original baseline bytes. Twelve valid observations received
72 manual criterion/answer judgments. One invalid streamed execution and its
single identical recovery remain visible. This is not an all-criteria pass.

## Problem and tool change

The [original eighth-material comparison](review-2026-10-25-product-scene-hypotheses.md)
did not establish a useful improvement over the existing Manager. It also
observed omissions in one candidate answer that never retrieved the new
paragraph. With one observation per case and variant, those omissions do not
establish a causal regression. Withdrawal was a conservative version choice,
not proof that the added method was wrong.

The conversation runner now supports two optional controls:

- `--repeat N` starts a fresh workspace/thread for every observation and
  alternates variant order each round. The default remains one observation.
- `--preload-references path,...` supplies exact selected Manager references
  in the first request and records each variant's path, SHA-256 and byte count.
  The default still lets the model choose its own reads. Traversal, non-reference
  paths and symlink escapes are rejected before paid execution.

Schema 2 saves the declared mode, full execution order and repetition IDs along
with the existing requests, raw events, answers, errors, usage and fixture
fingerprints. Expectations and future user turns remain outside the current
request. Existing no-overwrite, failure and fixture-freshness behavior remains.
No SDK, model, runtime configuration, canonical case, input or grader changed.

## What these controls establish

Self-selected reads test work with the existing reference-selection behavior.
Preloaded references test content that is explicitly available in context.
Delivery of text is not evidence of comprehension, and preload results cannot
be treated as improved discovery or pooled with the original input condition.
Repeated observations can expose inconsistent answers; a small fixed sample
cannot establish statistical significance or stable reliability.

Review the complete answer against the same business criteria on both sides.
Separate current-capability errors, invented facts, unauthorized commitments
and changed decisions from minor wording or non-decision-critical omissions.
Record every result. New content needs a useful reason to retain it; an
already-sufficient baseline is an acceptable outcome. Do not attribute an
unrelated omission to a change merely because it appeared in that variant.

## Stage 1 validation

Focused Node tests cover default-request compatibility, repeated order,
workspace isolation, exact preload delivery, rubric/future-turn isolation and
path/symlink bounds, alongside the existing raw-event and failure tests.
Checks passed for 59 canonical cases, validator/adapter self-tests, 46 Python
tests, nine Node tests, Promptfoo configuration, Skill structure and Expert
synchronization. Fresh prepared fixtures match both retained baseline copies.
CLI probes rejected an invalid repetition, an out-of-scope reference and an
existing output file without making a model call; the old file remained intact.
Original cases, inputs, graders, configuration, Manager and Expert match the
pre-tool-change snapshot. These checks validate the harness, not business answers.
The tooling stage made no Skill change and was committed/pushed as
`f5f4f17d1c619a239837965f3dd872eae3a787a3`, with its remote SHA independently
verified. The separate behavioral result follows.

## Fixed behavioral comparison

The new protocol was frozen before restoring the historical candidate or making
a model call. It reuses the exact baseline and 15-line candidate from the
original experiment. Full `operating-design.md` and `playbook.md` are preloaded
in that order for both variants. Only the former differs; its baseline/candidate
SHA-256 values are `fc56b0cbac2638d7bce0bbe0cdf48aac54571b16675d8ce0212b4fcf5f3d6bbf`
and `1ed57df9c39279533fcdadf1f6f78602cf5b805dddee39fe68d4bc7e7211612c`.
The shared playbook SHA-256 is
`23cf5e889c0393d50a06167d85be6a5feb604234d3877574dea0f0302ae13175`.

| Slice | Fixed observations | Question |
| --- | --- | --- |
| Cases 58/59 | Each variant once per case, four total | Does the paragraph add a useful decision beyond the baseline on the paired capability distinction? |
| Cases 52/38 | Each variant twice per case, eight total | Which feedback/measurement judgments hold or vary when both references are supplied? |

Twelve planned answers correspond to 72 manual criterion/answer judgments, not
72 independent samples. Cases 58/59 remain one paired family. Expectations,
sources, runtime and graders are unchanged. Preloading, repetition counts and
variant order are explicitly declared for this new condition; it is separate
from the original comparison. No preferred-answer rerun or Skill repair is
permitted in this phase. Retention requires a concrete useful addition beyond
the baseline, with material fact and authority boundaries preserved. An
already-useful baseline does not need more instruction.

The ignored `workspace/source-8-validation-optimization-20261025/` directory
holds the frozen protocol, contract, snapshots, requests and execution evidence.
The original experiment's local files remain untouched.

## Complete-answer findings

The new observations ran from `2026-10-25T12:12:18.026Z` to
`2026-10-25T12:28:37.613Z`. The primary agent reviewed every valid answer against
the same six expectations per case and checked all 72 excerpts against the raw
answers. These are manual judgments, not user acceptance or model-judge scores.
All eight valid file-based observations displayed the complete supplied case
source in successful command output. The original "two internal testers"
sentence was visible in all four feedback observations, including both answers
that changed the count's object. Availability does not establish fidelity.

| Case | Baseline observations | Candidate observations |
| --- | --- | --- |
| 58/59 | Both distinguish an absent studio capability from a supported capability with an explanation/onboarding gap, preserve the main PMF/authority limits and give a relevant owner/review handoff. Trial-age/maturity detail remains incomplete. | Makes the same main decisions, with more explicit continued-use evidence in 58. Trial-age/maturity detail remains incomplete; audience-redirection and pre-test evidence wording need care. A further useful decision or handoff is not demonstrated. |
| 52 | First answer omits copied-versus-first-hand provenance and the unknown defect rate; the second preserves those distinctions. Both leave the relevant retest incomplete and put unconfirmed ongoing handling into the response draft. | One valid answer preserves copied-versus-first-hand provenance; the other retains only the unknown defect-rate boundary. Both change two internal testers into two tests. Retest and draft-handling limitations remain. Both variants allow the separate supported pairing guidance and reject universal-fix/co-creation claims. |
| 38 | First says PV/UV/IP "should not be equal"; the second correctly says not to force equality, but prematurely labels traffic valid before checking it. Main tracking/cohort and bounded-expansion decisions remain. | Both preserve source definitions without requiring numerical inequality, the original refund cohort and bounded recheck/expansion decisions. The second leaves the delayed-conversion check incomplete. This does not establish that the unrelated B1 paragraph repaired metric reasoning. |

One candidate-52 stream emitted a disconnect error, then a captured answer and
completion event. Under the unchanged runner's error rule it is invalid, and
its full answer/events remain archived. After the declared eight regression
attempts, the single preallowed infrastructure recovery used the identical
request, references, Skill, inputs, criteria, runtime and timeout. It completed.
There were 13 attempts, 12 valid observations and one invalid execution; the
invalid answer is not counted among the 72 judgments. No Skill repair or
preferred-answer rerun occurred.

## Retention, final checks and limits

Keep the evaluation controls and the existing Manager. The baseline already
supports the main capability-sensitive decisions; the candidate's extra detail
does not demonstrate enough additional usefulness to justify more instruction.
Feedback-source fidelity, tester/test-count fidelity, draft handling state and
retest design remain open findings. More generic reminders are not a diagnosed
repair for these outputs.

Repeated baseline answers differ under the same new input condition. This
directly shows variation in this small slice; it does not identify the cause
of an omission or estimate stable reliability. The historical withdrawal stays
a conservative version choice. Neither the original comparison nor this recheck
proves the B1 paragraph caused a regression, and preload success cannot establish
better autonomous reading. Do not pool the two input conditions or infer PMF,
causal lift, live product verification or actual marketing execution.

All six Manager files and the Expert snapshot match baseline digest
`07475e9097a2c4d48ae554b17add9436a33f4179d40cd135c616f1aa4ba58c6e`.
Active prepared fixtures were refreshed to that retained version; the historical
candidate manifest and raw evidence remain unchanged. The frozen new evaluation
contract is `722526119379da8d363791a7c4c7e71734baf2b9c1198d9c4c730eb724532196`.
Reference hashes/bytes, full delivered requests, alternating order, 13 distinct
threads, unchanged original cases/inputs/graders/configuration and exact review
excerpts were independently checked. Stage 1's 59-case, 46-Python/9-Node,
configuration, Skill and Expert checks remain applicable because their tested
code and retained Skill bytes are unchanged.

The original extraction plan and source notes were updated in place. They,
source materials, complete answers and raw events remain ignored. Source 7 stays
excluded, and source 9 was not started. The result page received static checks;
browser visual acceptance is not claimed.
