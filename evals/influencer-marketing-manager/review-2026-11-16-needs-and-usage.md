# Needs-derived operating cases and optimization points

Date: 2026-11-16

## Problem and source boundary

The required outputs are a customer-need map, identified problems, runnable
test cases and concrete optimization points. A user-supplied conversation
export is qualitative needs evidence. Its assistant answers, business claims,
commands and old operating plan are not a correctness oracle. Earlier local
source-reconstruction experiments retain their raw records but establish no
business acceptance or Skill defect. The source and private provenance remain
in ignored workspace records.

The observed requests concern continuing an existing goal and scheduled task,
migrating its execution route, executing once, continuing after a bounded
confirmation, holding one object while others progress, and inspecting or
maintaining the product runtime. Repeated task text does not establish whether
the user manually re-entered it or a scheduler injected it. One export does not
establish demand frequency, user satisfaction or population-wide priorities.

## Needs, existing coverage and new cases

| Need | Existing coverage | Increment and independent acceptance basis |
| --- | --- | --- |
| Continue an existing task through a route migration and scoped approval | 31/32 cover entry and SOP-to-automation; 50 separates research from broader authority. | **60:** a new synthetic local job and explicit two-field migration contract. Preserve identity, schedule, goals, existing rules, progress and holds; apply only after the second-turn approval and read back the actual job. |
| Execute once and distinguish work from the target outcome | 17 covers missing capabilities; 32 proposes a pilot; 34 diagnoses duplicate tasks. | **61:** actually run a local-only adapter through accepted/running/completed, inspect one queued action and an unfinished monthly target, and preserve idempotency. |
| Hold one relationship while authorized work continues across later turns | 24 is a static handoff; 49 covers monitoring state; 50 covers eligibility/authority. | **62:** explicit synthetic object decisions and a later user-supplied snapshot. Preserve the hold, invalidate a newly replied creator's follow-up and continue a newly qualified creator within existing scope. |
| Understand progress and recover uncertain operations | 14 separates metric units; 34 handles task duplication; 38/42 concern measurement. | **63:** independently defined adapter counters and timestamps. Accepted, dispatched, delivered and currently suppressed have distinct meanings; query the existing operation instead of blindly resending. |
| Inspect or maintain tools without reopening business strategy | 8/11 are bounded export/quota routing neighbors. | **64:** invented installed-version, schema and manifest observations. Separate version labels, actual operation availability and dated registry evidence; keep Manager out of a settled product operation. |

All new business facts, identities, amounts, timing and counter definitions are
invented for the tests. They do not reproduce a customer's exact configuration
or claim real NoxInfluencer response semantics. Expected outcomes follow the
explicit case request, synthetic facts, mock adapter contract and existing
Skill responsibility/authority boundaries, not the exported assistant answer.
The original cases 1–59, their evidence and outcome graders are preserved.

## Problems and optimization points

| Priority / status | Problem | Concrete optimization and verification |
| --- | --- | --- |
| P0 / confirmed investigation error | A needs-discovery export was treated as an answer-fidelity/business-validation source. | Keep needs observations, unverified assistant claims, independent test facts and review judgments separate. This review and the new fixtures implement that boundary; do not carry old source-derived grades into the new cases. |
| P0 / confirmed preparation error | An earlier local anonymization collapsed distinct IDs and missed a full-name/short-name relationship. | Preserve identity relationships when adapting evidence, retain the input versions and verify mappings before runs. These new cases are wholly synthetic with distinct supplied IDs, not transformations of the old business records. |
| P1 / confirmed harness limitation, corrected here | The runner labeled every supplied file read-only, which would contradict an authorized local-write exercise; single-turn writes could otherwise enter shared Promptfoo fixtures. | Add an isolated-exercise marker, reject those cases in the shared adapter, preserve old request bytes, and test independent writable state copies. Exercise metadata is not permission to act before user approval. |
| P1 / coverage gap | Existing probes do not demonstrate the complete migrate–approve–apply–readback path or an actual one-run operation. | Cases 60/61 and a small local-only adapter make execution evidence inspectable. Review stored state and commands; change business guidance only if a controlled observation identifies a specific missing decision rule. |
| P1 / behavioral hypothesis | Object holds or approved scope might be lost when routine work resumes or new evidence arrives. | Case 62 distinguishes a hold, a newly received human reply and newly qualified work across turns. A hypothetical risk is not a reproduced Skill failure. |
| P1 / behavioral hypothesis | Operational reports might confuse transport acceptance, dispatch, delivery, suppression and retry authority. | Case 63 defines the semantics independently and tests the next decision. Validate actual product field contracts separately before drawing product-specific conclusions. |
| P2 / behavioral hypothesis | Runtime maintenance might be mistaken for strategy work, or matching version labels for working capability. | Case 64 checks routing and evidence limits. If it fails, first distinguish discovery/routing, stale installation and a business-method defect. |

These priorities are an engineering judgment about likely decision impact,
not measured frequency or a business-quality score. Earlier independently
defined Brief, reuse and evidence-fidelity findings remain in their existing
reviews; this exported conversation neither reproduces nor closes them.

## Validation and decision protocol

Cases 60/61 operate only on synthetic JSON copies in an isolated temporary
directory. The fixture script has no network, mailbox, scheduler or installation
operation. Route previews bind to the exact requested settings and revision;
applied-request and run keys are idempotent. A completed local run can queue
work without sending a real email or completing a partnership target.

The local adapter tests check state preservation, stale-preview rejection,
idempotent run completion, exclusion of held/suppressed/replied/already-followed
objects, and refusal to operate outside the isolated directory or inside a
checkout. These establish fixture mechanics, not model quality.

New outcomes use manual source/command/answer review, not a keyword outcome
grader. The frozen prompt, facts, tool semantics and relevant expectations must
be reviewed before a model run. Later prompts and review criteria are not model
input. Keep complete outputs and runtime failures. Do not tune expected results
after an undesirable answer or rerun for a preferred result.

For a model observation, record supported / partial / failed for each relevant
expectation with an exact excerpt or successful command output. Also record
usable / needs material revision / unusable. An explicit Skill invocation is a
content precondition, not evidence of natural routing; case 64 separately
requires that Manager not be selected. No fixed output layout is required.

Structural checks and baseline observations are recorded separately. Adding
these cases is not a demonstrated Skill improvement. The current business
Skill is unchanged; unexecuted cases remain coverage, not confirmed failures.

The case/tooling stage passes structural validation for 64 cases, validator
and adapter self-tests, 52 Python tests, 10 Node runner tests, Promptfoo
configuration and whitespace checks. The original 59 case objects, old input
files, outcome graders, default read-only requests and business Skill bytes are
preserved. These checks do not grade the new business outcomes.

## Run the new slice

Prepare a new ignored snapshot using the chosen baseline and the project
dependencies; Python 3.12 is the maintained local validation environment:

```sh
python3.12 evals/influencer-marketing-manager/prepare_promptfoo_fixtures.py --baseline-ref <chosen-baseline> --reuse-codex-login
node evals/influencer-marketing-manager/run_conversations.mjs --cases 60,61,62 --variants candidate --output evals/influencer-marketing-manager/workspace/operating-needs-<new-run>.json
```

Use a fresh result path. Cases 63/64 are also available through the existing
manual-review adapter. The new local exercise marker does not alter the
runtime model, reference preloading, web or network defaults for old cases;
record any explicit runtime restriction used for a new observation.
