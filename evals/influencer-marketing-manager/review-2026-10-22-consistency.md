# Consistency review corrections

Date: 2026-10-22

## Scope

Correct the Manager review findings while preserving historical answers and run
identities. The user assigned the Connector installation dependency to another
owner; this work does not change that dependency or claim its release readiness.

## Stage 1: grader and retrospective review

The case 44 smoke checker missed equivalent expressions of the buying questions.
It also accepted a mention of any one evidence layer as coverage of all three.
The revised check accepts the observed Chinese alternatives and an English
equivalent, requires the three buying-question signals, and checks direct
attribution, assisted evidence and incrementality separately. These are presence
checks, not proof that the reasoning or causal design is correct.

Mutation checks cover equivalent wording, missing buying questions, each omitted
evidence layer and a missing breakpoint explanation. No case prompt, expectation,
Skill or model response changed in this stage.

### Replay on the same saved answers

| Identity | SHA-256 |
| --- | --- |
| Original adapter at `c8c06fd` | `0548f49f61c2025eda7a3fc5adcc67c2cd358e714ca437ad29901483470129ca` |
| Revised adapter | `f225d35fb615facfaa2f7ed4fe0d3c97544316d741928d6cc6ea03aecd3ca48b` |

| Saved case 44 answer | Original checker | Revised checker |
| --- | --- | --- |
| Clean baseline from `renewal-reuse-20261021-final.json` | 6/7, missing `buying-reason` | 7/7 smoke checks |
| Release candidate from `renewal-reuse-20261021-release.json` | 6/7, missing `buying-reason` | 7/7 smoke checks |

Both checks were applied to the exact same saved answer for each variant. Full
replay evidence and source-file hashes are in the ignored
`workspace/consistency-review-20261022/grader-replay.json`. This is a grader repair,
not a new model run or evidence of improved Skill behavior. The existing case 44
business caveats about ungrounded stopping rules and comparison design remain.

### Corrected human-readable review

Re-reading the case 41 input and both answers exposed a shared scope error: the
accepted deliverable was a 60–90 second integration within a desk-setup video,
but both answers attached that duration to the whole video. The baseline's first
criterion is now partial, and the candidate's existing partial finding also
records that scope error. Its fee/payment omission and unsupported cost-free
description remain separate defects.

Case 48 now uses the same experience check for both variants. The baseline's
commute-preparation setting and candidate's natural-finish preference were not
supplied facts. They may serve as discussion wording pending creator confirmation;
neither is evidence of an actual personal experience. The approved claim limits,
brand-record attribution, CTA and disclosure remain requirements before use.

The [creative-evidence review](review-2026-10-21-creative-evidence.md) records the
dated correction. Raw outputs and original local review judgments are preserved.

### Validation

All 48 canonical cases validate; adapter equivalence and omission mutation checks,
46 Python tests, five Node tests, Promptfoo configuration validation, Expert
snapshot and whitespace checks pass. The two-answer replay above uses no model
or business-system calls. These checks do not grade business quality or establish
a working Connector installation.
