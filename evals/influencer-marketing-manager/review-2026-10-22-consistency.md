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

## Stage 2: monitoring and authority boundaries

The playbook separates observed reply counts from inspected-message progress.
Takeover checks the authorized pending work; an explicit future-only starting
point excludes older work. Unchanged counts can skip repeated body reads when
the covered messages have been inspected, but do not discard unfinished reads.
Processed progress advances after successful inspection and its decision record,
with current-state readback before a dependent action.

The automation reference distinguishes reversible research within project
constraints from changes to eligibility rules used for automatic selection or
external actions. The playbook also keeps quantities and durations attached to
their deliverables, and marks unconfirmed personal wording for creator review.
These changes refine the existing workflow; they add no monitoring runtime,
fixed output template or new external authority. The Expert copy is synchronized.

Case 14's old aggregate-only expectation is corrected. Existing case 41's scope
criterion and case 48's draft-experience criterion are clarified without changing
their prompts or evidence. Cases 49/50 add synthetic monitoring and authority
probes with manual business review, using the existing runner and isolation.
The new criteria do not go to the model.

### Fixed comparison contract

Both variants use the same current prompts, expectations, supplied inputs,
graders, shared Skill and runtime. Only Manager content differs. Each case and
variant starts in an independent temporary workspace. Case 41 retains its thread
between its two user turns; the later draft is absent from the opening input.

| Identity | Value |
| --- | --- |
| Baseline commit | `5407175fe841179932da32988cdb04acbc83d7ea` |
| Baseline Manager SHA-256 | `164590627c5505ea1c2dc615ecda0a279432c2a2d1a3abad123035477396dac2` |
| Initial candidate Manager SHA-256 | `bc84fe5a37621b8b02d7e0a97eaa5d02c86a882b5d61c17d536a7a2d0641cc1b` |
| Shared Nox Skill SHA-256 | `96d5d7e51ec49f60874dfd2f556497fec9cd775be7e169b7551997e4215e7d37` |
| Evaluation contract SHA-256 | `76d2928932ce04acc11b1ba9ec81ace9636918462da71083d9ac498c9436028b` |
| Configured runtime | `gpt-5.6-terra`, medium reasoning; isolated home; memory, plugins, apps, multi-agent and web search disabled |
| Raw result, ignored | `workspace/promptfoo/consistency-20261022.json` |

Reproduce with a fresh result filename:

```bash
npm run eval:manager:prepare -- --baseline-ref 5407175 --reuse-codex-login
npm run eval:manager:conversations -- --cases 49,50,41,48 \
  --variants baseline,candidate \
  --output evals/influencer-marketing-manager/workspace/promptfoo/consistency-<new-run>.json
```

### First comparison observations

The eight executions completed at `2026-10-22T02:21:23Z` and passed the runner's
post-run freshness check. They cover four distinct cases and ten user turns.
Actual answers and successful command output were inspected, not only exit codes.

| Case | Baseline observation | Initial candidate observation |
| --- | --- | --- |
| 49 | Handles pending A, failed B, completed C and future-only D appropriately. Reads the entrypoint and supplied records, without reading the monitoring reference. | Handles all four states, explicitly preserves B-14 until B-15 inspection and its decision record succeed. Successfully reads the revised monitoring passage. |
| 50 | Allows independent research and holds market/eligibility expansion. Also asks for approval to move new-keyword results into the existing flow. | Allows bounded research and handoff when existing eligibility is met; distinguishes that from changing the automated query configuration or widening market/eligibility. Reads the automation reference. |
| 41, opening | Criterion 1 partial: GBP 800 omitted and the integration-duration attachment remains ambiguous. | Criterion 1 partial: GBP 800 omitted and 60–90 seconds attached to the host video. Also assigns a two-day response window to concept confirmation without that agreement. |
| 41, review | Concrete claim/discount corrections, product-team investigation before release, truthful experience and extra-scope boundaries hold. | Those core checks hold, but criterion 4 is partial: the answer asks to receive the creator's revised draft within the brand's two-day review window. That window governs the brand's response. |
| 48 | Evidence limits hold, but criterion 2 is partial: the example is chiefly operator feedback containing a replacement clause, rather than a complete audience-facing expression. | All five criteria supported in this observation. The audience-facing example leaves personal experience for creator confirmation, explicitly attributes six-hour indoor evidence to the brand, and keeps CTA/disclosure. |

Case 49 does not establish a baseline failure: ordinary reasoning handled the
records without consulting the conflicting old reference. Its result supports
the revised method's usability, not a measured improvement. Case 50 is also a
single advisory observation, not an operating autonomy or reliability test.

The candidate read the initial generic duration guidance in case 41 but still
misattached terms. A diagnostic revision tied each term to its object and owner,
illustrating segment duration and the brand's review response window. Only case
41 was rerun; no prompt, expectation, grader, shared Skill or runtime setting
changed. The diagnostic did not resolve the error and was discarded.

### Discarded Brief clarification and retention decision

The case 41-only diagnostic completed at `2026-10-22T02:24:13Z` with Manager digest
`ef9e731b82455e6405c460a7a32ed068936ab11397d60eb7b0de19cb4a139ec4`
and the same evaluation contract. The runner completed its freshness check. The
answer still attached 60–90 seconds to the host video, omitted both GBP 800 and
post-publication payment, and applied the two-day review window to concept
confirmation. Its second turn did not clearly require the product-team
installation/compatibility/defect investigation before release. The clearer
revision-return timing did not resolve those material omissions.

That expansion was reverted. The retained Manager digest is the initial candidate
`bc84fe5a37621b8b02d7e0a97eaa5d02c86a882b5d61c17d536a7a2d0641cc1b`,
whose four-case comparison is recorded above. No additional model run is needed
to restore the exact already-tested bytes. The diagnostic remains in ignored
`workspace/promptfoo/consistency-20261022-brief.json`; it is not release evidence
for the retained version.

Complete raw answers and turn-level agent judgments, including the discarded
diagnostic, are in ignored `workspace/promptfoo/consistency-20261022-answers.md`
and `workspace/promptfoo/consistency-20261022-business-review.json`. Nine case
executions and twelve user turns cover four distinct cases, not nine independent
business examples. These are agent judgments, not user acceptance or a reliability
estimate.

Retain the monitoring boundary, research/automatic-rule distinction, compact
delivery-term reminder and explicit confirmation of proposed personal wording.
Cases 49/50 support usable advisory decisions in these observations, and case 48
supports the draft-experience distinction. Case 41 remains a partial business
result; a complete Brief still needs a person to check the exact deliverable,
fee/payment and review responsibilities against the agreement. More generic
instructions or a new output platform are not justified by this sample.

All 50 case definitions validate; adapter self-checks, 46 Python tests, five Node
tests, Skill quick validation, Promptfoo configuration, Expert synchronization,
Markdown link targets and whitespace checks pass. The retained fixture identity
is checked again before commit. Observed model commands read Skills and synthetic
inputs; no marketing sends, scheduler deployment or business-record mutations
were performed. This does not validate a live monitor or the separately owned
Connector installation dependency.
