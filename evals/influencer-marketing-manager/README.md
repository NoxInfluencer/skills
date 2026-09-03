# Influencer Marketing Manager Evaluations

These assets make the Skill reviewable by separating structural confidence, Agent behavior, and real marketing quality.

## What the Cases Observe

The cases focus on decisions that should be visible in an Agent response or action trace:

- business-manager and operational-capability selection;
- goal-specific strategy, portfolio, budget, measurement, and dated industry evidence;
- proportional questions and useful working assumptions;
- goal-specific creator judgment and interpreted discovery results;
- a two-pass discovery flow that separates broad structured screening from richer fine selection;
- evidence calibration across search supply, format-specific performance, machine fields, and contact readiness;
- outreach and negotiation ownership;
- autonomous execution under approved operating authority and clear user decisions for important commitments;
- practical SOP development, automation implementation, and concrete capability-gap requests;
- project-level learning and operations-owner review before general Skill promotion;
- adjustment when real results contradict the plan;
- stage-appropriate working context, including lightweight and Campaign-backed work; and
- accurate reporting of execution, stage, and overall results.

Expectations are semantic. Grade the business decisions, actions, and observed state changes represented in the response or trace. Each case also declares a trigger class:

- `should-trigger` — load the Manager for business judgment or an evolving creator relationship;
- `should-not-trigger` — route a bounded tool or writing operation to the capability that owns it;
- `boundary` — load only the relevant Manager context and resolve the overlap explicitly.

## Observable manager contract

Every meaningful case should make the following signals visible, either in the response or in the action trace:

- the current stage result and the business question it serves;
- evidence, source/freshness, and the distinction between fact and interpretation;
- the decision or working hypothesis and its confidence;
- the next action and the signal that would show progress;
- the authority used, requested, or still needed;
- the observed system or relationship state after an action.

For strategy work, check that the trace connects audience, creator role, real content scene, value proposition, target behavior, portfolio, complete cost, and measurement. External benchmarks should include enough source, date, scope, and metric context to judge applicability; missing reference data should lead to a first-party baseline rather than an invented number.
Any portfolio or budget ranges offered before project calibration should be labeled as planning assumptions and tied to a bounded learning test.

For creator discovery, review the passes separately. The coarse pass should show broad structured retrieval, query-level total/returned/filtered/usable supply, project-appropriate filters, identity deduplication, and a queue for deeper review. The fine pass should show richer creator or channel evidence, recent representative content, format-aware fit reasoning, and a distinct contact-readiness result based on an actual verified contact route. A final recommendation without this evidence trail is incomplete even when the selected names look plausible.

For outreach monitoring and measurement, check that the trace separates unique creators from message counts and bounces, establishes a dated baseline and observation window, and identifies the benchmark source and denominator used for comparison.

For SOP and automation work, check that the Agent inspects the actual workflow, defines the minimum operating contract, implements the available end-to-end path, and verifies a bounded result. If an essential capability is missing, it should identify the exact account, permission, connection, API, input, or runtime required and ask the user to provide it. A design-only response must not be graded as delivered automation.

For knowledge improvement, project methods may be updated from authorized project evidence. A general Skill or shared baseline requires the applicability and evidence to be reviewed by the responsible influencer-marketing operations owner.

Score each expectation as pass, partial, or fail with a short evidence note. Keep the rubric qualitative until enough real cases exist to justify an aggregate score; the first loop is for exposing bad decisions and missing evidence, not for creating false precision.

## Staged Validation Loop

1. **Structure:** validate the Skill frontmatter and eval JSON. This establishes packaging and evaluation-document confidence.
2. **Behavior:** run the same realistic prompts in baseline and Skill-enabled conditions, retain action/response transcripts in the ignored `workspace/` directory, and review each observable expectation.
3. **Operator trial:** use a small number of real, appropriately authorized internal tasks. Record where an experienced operator would change the strategy, next action, SOP, automation behavior, decision rights, or adjustment.
4. **Narrow revision:** improve the smallest positive instruction or example supported by the failure, then rerun the affected cases. Consider a focused hard restriction after repeated real failures show that positive guidance and context are insufficient.

Run behavior comparisons with the local Codex CLI. Keep the prompt and available artifacts identical between variants, use an isolated read-only ephemeral fixture, and do not connect the test to a live marketing system. From the repository root:

```bash
repo_root="$(pwd)"
fixture_dir="$(mktemp -d)"
codex exec --disable memories --sandbox read-only --ephemeral -C "$fixture_dir" \
  "Use the skill at $repo_root/skills/influencer-marketing-manager to handle the case."
```

Save the response and any action trace in the ignored `workspace/` directory, then review the observable contract above rather than matching exact wording.

The discovery pilot should compare coarse-pool yield, fine-review evidence coverage, contact-readiness accuracy, and qualified-shortlist usefulness. The outreach pilot should compare meaningful replies and qualified conversations rather than send volume alone. The negotiation and fulfillment pilots should compare complete-term capture and verified state transitions. These are directional operating signals; keep the sample small and revise the method when an experienced operator can point to a concrete failure.

## Minimal trace record

Store one compact record per case and variant in the ignored `workspace/` directory:

```text
case_id / variant / date
trigger class
prompt and available context
stage result
actions and tools used
evidence with source and freshness
decision and uncertainty
next action and authority
observed result or blocker
reviewer verdict and correction
```

This record supports baseline-versus-Skill comparison without copying live Campaign state into the eval corpus.

## Stable Checks

Run from the repository root:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" skills/influencer-marketing-manager
python -m json.tool evals/influencer-marketing-manager/evals.json
python evals/influencer-marketing-manager/validate_evals.py
python evals/influencer-marketing-manager/validate_evals.py --self-test
```

Behavior transcripts and reviewer notes belong under `evals/influencer-marketing-manager/workspace/`, which is intentionally ignored.
