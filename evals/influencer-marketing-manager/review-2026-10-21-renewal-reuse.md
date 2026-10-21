# Creator renewal and content reuse review

Date: 2026-10-21

## Change and decision boundary

The existing growth method covered goals, buying reasons, content jobs,
breakpoints, attribution, rights and budget decisions. It lacked an explicit
renewal decision and left the verification of content reuse value broad.

The revision adds two short passages to `references/operating-design.md`, a
measurement-section link in `references/playbook.md`, and a short reading route
in `SKILL.md`. The route also asks proposed next checks to identify the evidence
source, a proposed owner and a review point, using a condition when a date is
unknown. The Expert's bundled Skill is synchronized. Execution permissions are
unchanged.

- Renewal asks what the next cooperation adds to the primary goal. A purchase
  decision may need continued-use evidence, an unresolved answer or a new scene.
  An awareness decision may benefit from additional qualified reach or useful
  repeat exposure. These are options with project-specific checks, not a fixed
  content sequence or renewal count.
- Asset verification separates accepted, usable delivery from evidence that a
  chosen reuse improved a result. Product pages, organic social, ads and
  tutorials/presales have different possible checks. Only the intended use needs
  a proportionate check; downstream uplift is not a condition of accepting the
  original delivery.

Public changes contain generic methods and fictional evaluation scenarios.
Source documents, screenshots, identities and full extraction notes remain local
and ignored by Git.

## Correction to the historical case 44 evidence

The saved `case44-network.json` failed the `rights` smoke check.
`case44-network-rerun.json` passed after the request explicitly added website and
paid-ad reuse and asked for authorization fields. Both runs used the same
Manager digest prefix, `4c1fc4d37054e591`, and the same outcome checker. Their
evaluation-contract digest prefixes differ: `b83e65489a60176e` and
`8eba99c8970fa168`.

This was a changed-prompt run, not evidence that a Skill revision repaired the
same task. It supports only that the prompted response included the checked
rights content in that execution. The first prompt did not establish reuse as a
required task, so its missing-rights result alone does not establish a business
failure. Neither run proves proactive discovery, natural routing or stability.

Case 44's existing prompt, expectations and checker are retained for the current
comparison. Its evidence-layer regex accepts any one of attribution, assisted
evidence or incrementality; that cannot prove correct separation. Its original
smoke result must be accompanied by a reading of the complete answer.

## Discovery run and narrow correction

The first run, `workspace/promptfoo/renewal-reuse-20261021.json`, recorded all six
answers using candidate digest prefix `63f369b5db8564b5e`. Case 45's candidate
read only `SKILL.md`, missing the new reference passage. It preserved the two
primary goals but omitted an evidence owner and review timing; it also suggested
adding sales tracking to the awareness job without establishing a need. Case
46 retained the usable-delivery distinction but left the rights start/expiry
check incomplete.

This justified adding an explicit renewal/reuse reading route and naming the
evidence owner in the renewal passage. Prompts, expectations and graders were
not changed. The source was edited before the first runner's final freshness
check; that guard correctly rejected the run as stale. Its answers are retained
as diagnostic evidence, not a completed release comparison. The final run uses
freshly frozen copies and repeats both variants with the same contract.

Replaying the original case 44 smoke checker on the first two answers returned
`missing: buying-reason` for both, despite relevant three-question explanations.
The candidate said, for example, "用户为何现在需要、为何选你、能否顺利使用".
This exposes a wording-sensitive check, not proof that the business distinction
was absent. The checker is preserved and any replay failure remains visible;
manual review does not turn a failed smoke result into an automated pass.

The next clean comparison, `workspace/promptfoo/renewal-reuse-20261021-final.json`,
completed all six executions and passed the final freshness check. Candidate
digest prefix `add5c5eafd7922499` read the new reference successfully in all three
cases. It retained the core renewal/reuse distinctions, including the awareness
goal, but still omitted who should collect evidence and when to revisit the
short renewal recommendation. The entrypoint was clarified to make a proposed
follow-up check actionable, without adding a new workflow or fixed template.
The release candidate is then checked on the same three requests. The clean
baseline answers are reused with their original prompt, shared-Skill, runtime
and contract identity; no grader or expectation is relaxed.

## Fixed comparison contract

Cases 45 and 46 add fictional, single-turn decisions. Their expectations remain
outside the model's input. They use the existing manual-review mechanism; no
new keyword outcome grader or model judge is introduced.

| Case | Decision to inspect |
| --- | --- |
| 44 | Retained growth-method regression: primary job, buying reason, content/destination continuity, breakpoints, three evidence layers, rights and budget authority. |
| 45 | Purchase-decision renewal with unresolved usage questions versus awareness renewal considering similar content; preserve their different goals and proposed-versus-observed evidence. |
| 46 | Accepted files and limited rights versus unproven reuse benefit; select a bounded product-page check and defer unchosen channels. |

The existing conversation runner gives each case and variant a separate
temporary workspace with its copied Skills and only declared inputs. It sends
only the current request and source paths to the model, saves raw events, and
keeps expectations outside the execution directory. Both variants receive the
same prompts, evidence, runtime settings and review criteria. Only Manager
content varies.

| Identity | Value |
| --- | --- |
| Baseline commit | `edab9519694c0adafa42c80c1098683a72827488` |
| Baseline Manager SHA-256 | `4c1fc4d37054e5919c0243f951618bb87ca7989433af715171b0891a66dad32c` |
| Candidate Manager SHA-256 | `ad660ab3c106b12c995209783a6581c48272849f7b30f759cb8bb97d47cfb8e8` |
| Shared Nox Skill SHA-256, both variants | `96d5d7e51ec49f60874dfd2f556497fec9cd775be7e169b7551997e4215e7d37` |
| Evaluation contract SHA-256 | `991b5e677d89521c8a15ecea8461afed3cfdfb31a8e54046c05cf7a7657bb957` |
| Runtime | Configured `gpt-5.6-terra`, medium reasoning; linked login, isolated home, no web search; exact options retained in the local result. |
| Baseline result, ignored | `workspace/promptfoo/renewal-reuse-20261021-final.json` |
| Candidate result, ignored | `workspace/promptfoo/renewal-reuse-20261021-release.json` |

Reproduce from the repository root with the pinned dependencies and an existing
Codex login:

```bash
npm run eval:manager:prepare -- --baseline-ref edab951 --reuse-codex-login
npm run eval:manager:conversations -- --cases 44,45,46 \
  --variants baseline,candidate \
  --output evals/influencer-marketing-manager/workspace/promptfoo/renewal-reuse-<new-run>.json
```

The runner refuses to overwrite a previous observation. Use a new ignored output
path and retain failures. Execution completion is not a business outcome grade.

## Validation

- All 46 canonical cases validate; adapter self-checks pass.
- 46 Python tests and five Node tests pass, including isolation, no rubric
  leakage, preserved raw events and incomplete-turn handling.
- Skill quick validation, Promptfoo configuration validation, Expert snapshot
  check and whitespace check pass.
- The clean six-execution comparison finished at `2026-10-21T08:37:22Z`. The
  three release-candidate executions finished at `2026-10-21T08:43:20Z`. Both
  runners exited successfully and passed their post-run freshness checks.
- Baseline identity, shared Skills, declared inputs, evaluation contract and
  runtime are identical across the retained comparison files. Each paired
  request is identical. All three release traces successfully read the new
  renewal and reuse passages; observed commands only read Skill references.
- Full answers and criterion-by-criterion agent review are retained locally in
  `workspace/promptfoo/renewal-reuse-20261021-answers.md` and
  `workspace/promptfoo/renewal-reuse-20261021-business-review.json`.

## Observed task outcomes

These are parent-agent judgments against the unchanged qualitative expectations,
not automated outcome scores or user acceptance.

| Case | Clean baseline | Release candidate |
| --- | --- | --- |
| 44 | Core framework present. Criterion 6 is partial: an ungrounded minimum of two comparable collaborations appears in the scale rule. Original smoke replay fails `buying-reason`. | Core framework present. Criteria 5/6 are partial: the example schedules a city comparison without checking cost/comparability and stops after two corrections without grounding that stopping rule. Original smoke replay fails `buying-reason`. |
| 45 | Goal-specific renewal choices hold, but criterion 4 is partial: no responsible evidence owner or explicit review point. | All five criteria supported in this observation. Purchase questions drive the next contribution; awareness keeps its goal; proposed owners and review conditions are stated without approving spend. |
| 46 | Core delivery/reuse distinction holds. Criteria 2/4 are partial: evidence ownership/source, review timing and complete rights evidence/start-expiry handoff are insufficiently assigned. | Core delivery/reuse distinction holds. Criteria 2/4 remain partial: no evidence owner or observation window/review condition, and the compact handoff omits rights evidence and the unresolved authorization start/expiry check. |

Selected release-answer evidence:

> A: "由内容负责人核对真实持续使用时长、续航测试条件与结果、兼容设备清单及不兼容边界"

> B: "由投放/数据负责人在下一轮前核对与上次的受众重合率、累计频次、该地区的增量覆盖及实际触达成本"

> Reuse: 现有事实只支持“已验收、可在授权范围内复用”。
>
> A/B 测试是某一后续用途的效果验证，不影响原始交付已验收的状态。

The original case 44 checker is replayed on both retained answers without
modification. Both return `pass=false`, score `6/7`, `missing: buying-reason`.
Their three-question explanations use equivalent wording, so this is not a
supported absence finding. It remains an automated failure, alongside the
separate substantive caveats above. No Promptfoo all-pass claim is made.

Retain the scoped method integration, explicit reading route and repeatable
probes. Case 45 supports a usable renewal recommendation in this execution.
Case 46 does not establish a complete reuse handoff, and case 44 does not
establish an unqualified growth-method pass. More generic instructions or a new
workflow are not justified by these advisory samples. A later handoff review
should explicitly verify the evidence owner, review point and contract-based
start/expiry before treating the reuse record as complete.

One retained observation per case and variant is not a reliability estimate or
proof of a general improvement. Explicit Skill invocation does not test natural
routing. No marketing action, production system, customer outcome or causal
lift was validated.
