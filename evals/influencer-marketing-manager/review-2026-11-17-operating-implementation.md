# Operating-case implementation and verification loop

Date: 2026-11-17

## Problem and implementation scope

The preceding [needs review](review-2026-11-16-needs-and-usage.md) identifies
customer needs, cases 60–64 and eight optimization points. Its two local runs
leave a returned-ID criterion partial and cases 62–64 unexecuted. The current
request is to implement the cases and improvements with a simple, testable
design and commit/push each verified stage.

The conversation export remains needs evidence only. This implementation uses
independent synthetic facts and tool contracts, never the exported assistant
answer as its oracle. Prior raw runs, frozen contracts and judgments remain
unchanged. The original 64 case objects and first 59 cases' input/grade contracts
are preserved. The shared local simulation implementation and its interface
documentation are deliberately versioned forward for new observations.

## Small testability design

The existing runner remains the entry point. Its boundaries are:

```text
frozen request and facts -> isolated local adapter -> raw events and stored state
                                                      -> manual outcome review
                                                      -> retain or revise
```

- **Exercise mechanics:** the local adapter owns state transitions, idempotency,
  eligibility and simulated queue updates. Duplicate or empty job/creator IDs
  are rejected before any read/write operation can use an ambiguous identity.
- **Runtime identifiers:** the adapter contract requires consuming returned IDs.
  New case 65 enables unpredictable IDs, so a guessed `local-run-1` cannot
  accidentally satisfy its result queries. Replaying the original run key
  recovers the same ID and never repeats completed work.
- **Execution evidence:** the runner captures only declared JSON exercise files
  before execution and after each turn, including failures. It saves byte counts,
  digest and parsed state, or an explicit capture error. Paths cannot escape
  the workspace and each file is capped at 256 KiB. Capture does not grade the
  business answer. The state file stays in place as the exercise record.
- **Review:** later prompts, expectations and judgments stay outside model
  input. Raw commands, their results, answers and state snapshots support
  individual manual judgments. A completed model stream is not a semantic pass.

This adds no scheduler, database, agent hierarchy, automatic semantic grader or
production service. Existing read-only requests, model defaults, preloading
behavior and old automated outcome graders remain unchanged. The opt-in
`--no-tool-network` runtime flag supports local-only observations.

## Stage 1: fixtures and evidence controls

Case 65 has two turns: execute the approved local job using an assigned opaque
ID, then verify the same run after the user asks about its result. It supplies
the same independently defined business rules as case 61 and adds only the
opaque-ID setting. Review checks actual completion, one queue entry, preserved
exclusions and idempotent recovery, with the monthly business target unfinished.
It is runner-only and uses manual outcome review.

Mechanical tests exercise the adapter through its CLI: opaque result lookup,
same-key recovery, no duplicate work, no mutation on a wrong run ID, and rejection
of duplicate/empty identities. Runner tests retain changed state after a later
stream failure, reject absent working-directory context and prevent missing,
invalid, oversized or escaped state from being mistaken for captured evidence.

The stage passes validation for 65 cases, validator/adapter self-tests,
54 Python 3.12 tests, 13 Node tests, configuration and whitespace checks.
These checks establish the local test apparatus, not model decision quality.
The business Skills and Expert are unchanged at this stage.

## Frozen behavior-validation plan

Run cases 60–65 once each, nine user turns in six independent case workspaces
and model threads. The current project model/reasoning configuration remains
unchanged; tool network and web search are disabled, references are self-selected
and review criteria are not preloaded. Cases 60–63/65 explicitly invoke Manager;
case 64 checks natural selection of the bounded product capability instead.

Review each frozen expectation as supported, partial or failed using successful
command output, stored state and exact answer evidence; also judge whether the
result is usable, needs material revision or is unusable. Preserve the first
output, including failures. Allow at most one identical infrastructure recovery,
never an outcome-selected rerun. If behavior reveals a real gap, freeze the
finding before a narrow change and run its affected behavior plus a relevant
regression. Otherwise retain the business Skill rather than add general rules.

The case 61/65 checks address returned-ID use and state ownership. Cases 62–64
test the remaining hypotheses about persistent holds, operation reconciliation
and maintenance routing. These synthetic observations cannot establish a live
product contract, actual production automation or stable business performance.

## Stage 2: bind the maintenance test subject

The first six runs complete all nine turns without an invalid stream. Case 61
consumes the returned run ID before querying the result, and case 65 finishes
an opaque-ID run and checks that same completed run on the second turn without
duplicating work. These are bounded observations, not a causal reliability claim.

Case 64 exposes a test-design limitation. Its prompt prohibits network access
and installation but does not explicitly prohibit local CLI inspection or bind
the task to its invented installation. The model loads the product Skill and
reads a different host installation. It separates that installation from the
synthetic snapshot, then discusses the missing command as unblocked in the host
command tree. The task's actual installation binding is still unresolved.
That criterion is partial for the intended synthetic assessment; the observed
local read is a plausible interpretation of the prompt, not a demonstrated
causal business-Skill defect. Host paths, versions and raw output remain private.

The smallest correction is an explicitly bound test subject, not a new tool
framework or a general business rule. New case 66 supplies two independent
synthetic installation snapshots with matching versions but different command
availability. The task belongs to the installation lacking the needed command.
Only these snapshots and relevant Skill text are allowed; host inspection is
explicitly excluded. Expected results are frozen before this separate run.

Case 66 replaces case 64 in the default maintenance slice. Case 64's object,
expectations, first output and partial judgment are retained, and it remains
selectable for historical diagnosis. This does not convert the original result
into a pass. The first 65 case objects remain unchanged; automatic outcome
graders and runtime code are unchanged in this stage.

## Stage 3: measure discovery before changing business guidance

The independently frozen case 66 produces the correct environment-bound
maintenance decision and makes no host CLI call. It nevertheless explicitly
loads both the Manager and product Skills because the request concerns an
existing marketing workflow. The product answer is usable, but the routing
criterion is partial. This is distinct from case 64's subject ambiguity.

The runner now offers `--invocation natural`, retaining the original explicit
default and recording the mode. It removes only the forced Manager request,
without changing the case's routing label, facts, later prompts or expectations.
This supports a positive routing regression as well as negative maintenance
and missing-source controls; explicit invocation cannot establish discovery.

One candidate is frozen: revise only the Manager frontmatter description to
lead with business judgment and name settled runtime maintenance as product
capability work. The business body and references remain unchanged, and the
Expert copy must match. Compare case 66 with its exact pre-change request and
conditions, and run cases 62 and 12 under natural invocation as positive business
and negative writing controls. Keep the candidate only if all three preserve
their intended selection and decisions. Otherwise restore it, retain the
evaluation controls and complete evidence, and make no semantic rerun.

## Stage 4: retained correction and closure

The candidate meets the frozen retention gate. Only the Manager frontmatter
description changes: it leads with marketing business judgment and assigns
settled version, installation, schema and capability checks to their product
owner even when an existing marketing task is mentioned. The business body,
references, authority and decision rules remain byte-identical. The Expert
Skill copy is synchronized; the product Skill and Connector are unchanged.

| Observation | Source, command or stored-state result | Manual conclusion |
| --- | --- | --- |
| 60, two turns | First-turn state is unchanged. Approved apply updates the same job's two execution settings, revision and audit only; show preserves rules/progress/holds and zero runs/queue entries. | Usable local migration; seven supported expectations. |
| 61, one turn | The run response precedes result queries using its actual ID. Supplied-file snapshots retain one completed run, one approved queue entry, reservations 7/7 and partnerships 1/2. | Usable local run; six supported expectations. |
| 62, two turns before the description change | River stays held; Stone's new reply invalidates its reminder; Sky enters preparation subject to the missing initial-message approval; exclusions remain. | Usable handoff; eight supported expectations. No resubscription process or unprovided first-contact authority is validated. |
| 63, one turn | The report keeps four accepted, three dispatched, two delivered and zero observed replies distinct, retains suppression and reconciles the original operation before any retry. | Usable contract-based report; five supported expectations. |
| 64, one turn | Host inspection adds a different installation to an unbound synthetic test. The local-read scope permits that interpretation; the intended task-capability verdict remains incomplete. | Four supported and one partial expectation. Keep the original record; use bound case 66 in the default slice. |
| 65, two turns | A runtime-assigned unpredictable ID is returned before result lookup. The same completed run is read on turn two; stored state and digest remain identical, with one run/queue entry. | Usable opaque-ID operation and recovery; six supported expectations. |
| 66, pre-change | The bound-installation answer is correct and no host CLI is inspected, but both Skills are explicitly loaded for an existing marketing task. | Usable answer; four supported and one partial routing expectation. |
| 66, candidate natural invocation | Only the product Skill body and supplied snapshot are read. The target remains blocked; the comparison installation, dated registry and unknown manifest provenance do not clear it. | Five supported expectations; meets the negative routing gate. |
| 62, candidate natural invocation | Manager is selected without a forced invocation. The hold, reply invalidation, preparation scope and exclusions survive the second turn. | Eight supported expectations; meets the positive business control. |
| 12, candidate natural invocation | No Skill is loaded; the answer asks for the missing approved email and invents neither a translation nor research. | Three supported expectations; preserves the writing boundary. |

The candidate case 66 request is byte-identical to the pre-change request and
uses identical model/runtime options, facts and shared product Skill. Only the
Manager description differs. Cases 12/62 are natural-invocation regression
controls, not paired quality-improvement claims. These observations support
this narrow retained correction; they do not establish causality or stable
selection across future wording, clients or models.

There are ten recorded observations, 14 user turns and 58 manual expectation
judgments: 56 supported and two historical partials. Neither partial is erased
or counted as a current all-criteria pass. No invalid stream, infrastructure
recovery or outcome-selected rerun occurs. Complete requests, raw events,
answers, source identities, state snapshots and manual excerpts remain in the
ignored local workspace. Structured state captures contain no evidence errors.

## Eight optimization points: final disposition

| Point | Implementation and evidence | Disposition |
| --- | --- | --- |
| Source purpose | Independent case facts, frozen requests and manual review stay separate from the original needs export. | Earlier investigation error corrected; no exported answer is a model input or oracle. |
| Identity fidelity | Synthetic identities remain distinct; the local adapter rejects duplicate/empty job or creator IDs before operation. | Mechanical control implemented; earlier distorted experiments remain historical. |
| Isolation and observability | Independent case copies, bounded declared-JSON capture and failure-state evidence are in the existing runner. | Implemented and mechanically tested, including error paths. |
| Existing-task execution | 60/61 retain the original task through approval, apply, execution and authoritative state readback. | Bounded local behavior supported; no production activation claim. |
| Run identity and recovery | The interface consumes assigned IDs; 65 exercises unpredictable IDs and same-run recovery with unchanged completed state. | Implemented and observed; no duplicate work or invented business result. |
| Object-scoped control | 62 preserves a hold, reacts to a new reply and continues qualified preparation under existing authority. | Core decisions supported before and after the discovery change; no extra general rule needed. |
| State reconciliation | 63 follows independent counter definitions and the existing operation/key before retry. | Supported in the synthetic contract; real product field semantics are not inferred. |
| Maintenance routing | 66 binds the subject installation; a description-only correction avoids extra Manager loading while 62/12 preserve both routing boundaries. | Narrow correction retained with Expert sync; original 64 and pre-change 66 partials preserved. |

Final mechanical validation covers 66 canonical cases, validator/adapter
self-tests, 54 Python tests and 14 Node tests, valid configuration, valid Skill
frontmatter, an exact Expert mirror and clean diffs. The source 64 case objects,
new 65 object, old input evidence and automated outcome graders remain unchanged
apart from the separately documented local interface changes and default-slice
replacement. This is synthetic verification, not a live account, current product
contract, production deployment or commercial-outcome validation.
