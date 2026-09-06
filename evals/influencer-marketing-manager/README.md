# Influencer Marketing Manager evaluations

Use these evaluations to answer: did the user task improve, where did it fail, what should change next, and did the revision regress? Packaging checks alone do not establish task quality.

The [2026-09-06 iteration review](review-2026-09-06.md) records a rejected behavior revision, unchanged graders, original-answer findings and the rollback decision.

The later [client-decision review](review-2026-09-06-client-decisions.md) adds business judgment coverage and a [sample for user review](business-review-sample-2026-09-06.md). Its attempted Skill changes were also rolled back; the retained work is a provisional review baseline and executable cases, not a demonstrated behavior improvement.

The user's correction is recorded in the [business review criteria](business-review.md): this workflow needs a five-person comparison, separate recommendations and evidence, and no repeated next-action column. The [revised sample](business-review-sample-2026-09-06-v2.md) is an edited illustration, not a raw model answer or an eval pass. Cases 22/23 preserve both the full-batch and evidence-shortfall requirements. Attempted Skill wording changes were rolled back after the full-batch output still failed business review; see the [batch iteration review](review-2026-09-06-client-batch.md).

The subsequent [single-selection review](review-2026-09-06-single-selection.md) tests a small local table renderer against those failures. Case 22 improved in the final trial, but case 23 still promoted an unqualified creator; the Skill integration was rejected and rolled back. Its [trial sample](business-review-sample-2026-09-06-rendered.md) preserves actual model output, separate from the earlier edited illustration. The retained prototype and trace observations are not a shipped Skill improvement, user approval or a reliability estimate.

## Organization

- `evals.json` owns the 23 canonical prompts and qualitative expectations. IDs remain stable.
- `fixtures/` contains only synthetic task evidence, never expected answers or grading rules. A case's optional `files` list is relative to this directory.
- `promptfoo_cases.py` selects executable cases and adds focused assertions. Expectations stay in test metadata for review; they are not sent to the model.
- `prepare_promptfoo_fixtures.py` copies the Skills and declared files into isolated baseline/candidate workspaces. Only the Manager Skill may differ.
- `review_results.py` reports saved results by metric and separates runtime errors. It can replay updated outcome graders without another model call, and report observed shortlist-renderer output and whether its table reached the final answer unchanged.
- `workspace/` holds ignored run traces and review notes. Do not put live customer data, credentials, or commercial records in the case corpus.

Cases use `should-trigger`, `should-not-trigger`, or `boundary`. These describe the intended routing, not whether the case is executable. Cases that require live discovery, sends, scheduling, or an actual SOP workspace still need a separately authorized environment and its inputs. An empty `files` list does not supply those capabilities. Do not call all 23 cases behavior-tested after validating their JSON.

## Small executable set

| Case | What it measures | Evidence and limits |
| --- | --- | --- |
| 9 | Evidence-based creator priority | Supplied coarse data; preserve strong fits with contact pending and choose purposeful fine review. Business outcome is manually reviewed. |
| 10 | Cold-start discovery discipline | An incomplete brief; provisional method and unsupported numeric rules. Wording-sensitive smoke checks still require output review. |
| 12 | Missing-source handling and scope | The original email is deliberately absent. Ask for it without inventing a translation or loading Manager. This is not translation-quality coverage. |
| 13 | Conflicting project sources | Read a synthetic CRM, active-brief and historical-report snapshot. Successful command output must contain all three source records. Reconcile current UK intent with unchanged US system state. |
| 19 | Operator-tool guidance | Explicit invocation; tool, scenario and supported decision. No external tool execution. |
| 20 | INIU discovery/outreach setup | Supplied YouTube brief; coarse/fine evidence, fit versus contact readiness, and pre-send evidence/authority. No live creator records or outreach. |
| 21 | First invitation and preliminary client review | Fictional brief, four channels and reply snapshots; distinguish qualified human interest, contact-pending discovery, failed qualification and auto-reply. Business outcome and draft usefulness are manually reviewed. |
| 22 | Client batch comparison | User feedback asks for five options, separate judgment/evidence dimensions and no repeated next actions. Eight fictional channels supply five eligible human-interest options. Business outcome and readability are manually reviewed. |
| 23 | Client batch shortfall | Same request as 22, using the limited case 21 snapshot. Show the supported one of five and the shortfall, without padding or claiming a complete batch. Manually reviewed. |
| 19-natural | Natural positive routing | The original case 19 prompt without naming the Skill. This is reported separately from content. |

Positive content cases, including the business decision in case 13, explicitly invoke Manager. Their `skill-used` assertion verifies the test precondition; a failure means the loaded-Skill comparison is not established. Case 12 stays unprefixed and retains `not-skill-used` as a scope guard.

Natural case 19 remains a diagnostic for content-only iteration, not a hidden pass or a discarded failure. Its separate command returns a nonzero exit code on failure. A content pass does not establish reliable automatic invocation; routing must be reviewed before claiming that capability works.

## Grading and release decisions

Use the [business review criteria](business-review.md), including the user's correction of the first sample, for cases 9, 21, 22 and 23. Their `response-evidence`, `routing-evidence` and supplied `fixture-evidence` assertions establish test evidence only; they deliberately have no automated `task-outcome` grade. The report calls out the missing manual outcome even when Promptfoo shows a green row. Read the complete answer, record usable / needs material revision / unusable with one decision-relevant reason, and keep agent review separate from the user's judgment. No fixed answer template or new model judge is required.

`tools/render_shortlist.py` is a tested local prototype, not part of the shipped Skill. It takes assessed records and selected IDs through JSON stdin, then outputs one comparison table with count and known-quote checks. `test_shortlist_renderer.py` supplies example inputs and tests that mechanical contract independently of model runs. It does not qualify creators or validate reply evidence against the source. In trial runs, inspect the helper input against the snapshot, the returned selection and minima, and the final answer. `table_in_final=true` establishes table propagation only, not correct business judgment or freedom from contradictory prose. No observed helper output means the trace has not established successful execution; merely reading or naming the script is insufficient. Older baselines do not fail for lacking the new helper.

For smoke-graded cases, inspect `task-outcome`, `routing-evidence`, and (case 13) `fixture-evidence` separately. Every assertion in a selected row must pass; changing weights does not make a failing assertion non-blocking. Do not use the combined Promptfoo score as an overall business-quality measure.

Deterministic checks are smoke checks, not semantic proofs. Case 20 protects integration format, exploration directions, recent long-form/use-scene evidence, exclusions/deduplication, coarse/fine next steps, contact-pending handling, pre-send verification/authority, and obvious fabricated-execution claims. A mention alone does not establish sound reasoning. Review each canonical expectation as pass, partial, or fail with a short supporting excerpt. Also inspect the trace when a claim depends on an action.

Test the graders before tuning the Skill: preserve known-good outputs and change one relevant decision at a time. Missing authority, conflated fit/contact state, omitted evidence, and invented completion should fail; equivalent formatting should not. Mutation tests are included in the local checks.

When a grader changes, replay it on the same saved baseline/candidate outputs first. Old and new pass rates from different graders are not comparable. A repeated prompt is a stability probe, not a new independent business case; three runs can expose variation but do not prove a statistically reliable improvement or regression. Retain failures and explain uncertainty rather than tuning repeatedly until one run is green.

Separate provider aborts/timeouts from assertion failures. Neither a runtime error nor missing grades count as a task pass. Keep a compact review record:

```text
case / variant / date / model and reasoning setting
Skill revision or digest / eval contract digest / supplied evidence
task outcome / routing / source-read evidence / runtime error
failed expectation and excerpt / reviewer correction / next bounded test
```

Each new result embeds the prepared fixture identity in test metadata. Full SHA-256 values remain in the local manifest; exported metadata uses labeled 16-character prefixes because Promptfoo redacts the full values. These identify the Skill, shared Skills, prompts, graders, configuration and synthetic inputs. Model settings are retained in Promptfoo's result config. Keep the raw trace alongside the review so a conclusion can be checked later.

## Run and verify

Use the pinned project dependency with an existing compatible Node runtime (22.22.0+); do not change system Node. Install with `npm ci` if needed.

Run local checks first; these make no model or marketing-system calls:

```bash
npm run check:manager-evals
npm run eval:manager:validate
python3 scripts/sync_expert.py check
git diff --check
```

Prepare with an explicit old revision. Candidate defaults to the worktree; use `--candidate-ref` for a committed candidate. `--reuse-codex-login` links only host login and connection routing; omit it when using an API key. Preparation replaces only disposable fixtures and the isolated home: never prepare during an active eval run; saved result JSON files are retained.

```bash
npm run eval:manager:prepare -- --baseline-ref <old-ref> --reuse-codex-login
npm run eval:manager -- --no-cache \
  -o evals/influencer-marketing-manager/workspace/promptfoo/content.json
npm run eval:manager:routing -- --no-cache \
  -o evals/influencer-marketing-manager/workspace/promptfoo/routing.json
npm run eval:manager:report -- \
  evals/influencer-marketing-manager/workspace/promptfoo/content.json \
  evals/influencer-marketing-manager/workspace/promptfoo/routing.json
```

Both run commands reject stale copied Skills, inputs or graders before calling the model. Prepare again after a source change. For a narrow loop, use `--filter-pattern '^\[13\]'` and `--filter-providers manager-candidate`; repeat important cases with `--repeat 3` after local checks and one smoke run. Avoid repeatedly rerunning unaffected baselines.

The default is `gpt-5.6-terra` at medium reasoning; set `INFLUENCER_EVAL_MODEL` to pin another model for a comparison. Runs are read-only, non-interactive, serialized, and disable memory, plugins, multiple agents, web search and agent network access. Each row has a ten-minute timeout and the suite retains its twenty-minute ceiling. The row limit was raised after a source-reading run exhausted five minutes before producing an answer; timeout changes do not turn incomplete runs into passes. Split larger or repeated sets into bounded runs instead of silently losing rows to the suite deadline.

Replay current outcome graders without changing the saved results or calling a model:

```bash
npm run eval:manager:report -- --regrade \
  evals/influencer-marketing-manager/workspace/promptfoo/content.json
```

Replays change only output grading, not the historical routing or source-read evidence; they cannot test changed prompts or missing inputs. Finish a Skill revision with affected-case regression, operator review where real business judgment matters, and then structural/snapshot checks. An authorized live pilot should measure qualified-shortlist usefulness, meaningful replies or complete-term handoff—not merely send volume or a polished plan.

## References

- Primary method: [OpenAI's Agent Improvement Loop](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop) (2026-05-12) connects traces, reviewer feedback, reusable evals, prioritized changes, and reruns. Distinguish a missing rule, an existing rule not reliably followed, and an implementation or observability defect before choosing a fix. We use this loop without adding its optional HALO automation.
- Tool direction: [Moving from OpenAI Evals to Promptfoo](https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo) (2026-06-03) states that OpenAI is winding down its Evals product and recommends Promptfoo. Recreated graders still need validation; scores across grading systems are not automatically comparable.
- Foundation and implementation: [OpenAI's Skill eval guide](https://developers.openai.com/blog/eval-skills) (2026-01-22), [Promptfoo's Agent Skill comparison guide](https://www.promptfoo.dev/docs/guides/test-agent-skills/), and the [Codex SDK provider reference](https://www.promptfoo.dev/docs/providers/openai-codex-sdk/).

Add model-assisted grading only when repeated review shows that a specific semantic judgment warrants it; do not automate the entire qualitative rubric by default.
