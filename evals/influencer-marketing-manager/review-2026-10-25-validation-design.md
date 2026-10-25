# Controlled reference-context and repetition review

Date: 2026-10-25

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
Behavioral results and the retention decision will be recorded after the
separate fixed-protocol comparison. This tooling stage makes no Skill change.
