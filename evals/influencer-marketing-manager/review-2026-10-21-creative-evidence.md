# Creative evidence and message adaptation review

Date: 2026-10-21

## Change and scope

The existing Brief and review method required supported talking points, useful
demonstrations and truthful creator experience. It did not explicitly connect
the scope of a claim to what its demonstration establishes, or explain what
must survive adaptation from brand wording to the audience's language.

Two short passages are integrated into `references/playbook.md`:

- Brief preparation turns the approved message into an audience-understandable
  explanation while preserving product facts, supported outcomes, material
  audience/use conditions, intended action and disclosure. The creator retains
  room to adapt wording and narrative.
- Content review checks what a demonstration or other evidence can support.
  Initial color payoff does not establish wear duration; a whole-look change
  does not isolate one product. Comparison conditions are checked when they
  affect the conclusion, with individual experience kept within its scope.

The existing consolidated-feedback and targeted-correction rules handle the
next action. No new module, fixed filming protocol, opening-time threshold,
country-level consumer rule or execution authority is introduced. A conditional
entrypoint sentence makes the Brief/review reading route explicit for a dispute
over product claims or audience wording. Settled rewriting remains outside the
Manager's scope. The Expert's bundled Skill is synchronized.

Public evaluation inputs are fictional. Original source material, identities,
screenshots, case figures and full extraction notes remain local and ignored.

## Fixed behavioral comparison

Cases 47/48 add qualitative decision probes using the existing manual-review
mechanism. Case 47 includes both a usable, qualified initial-use demonstration
and a problematic whole-look transformation, so blanket rejection is not enough.
Case 48 requires usable consumer language while retaining the supported result
and material conditions. Existing case 41 provides a two-turn Brief-to-draft
regression covering truthful criticism, product checks and changed scope.

| Case | Decisions reviewed |
| --- | --- |
| 47 | Retain supported initial-use evidence; correct the makeover's unsupported claim with a proportionate pickup or narrower expression; preserve review scope. |
| 48 | Adapt the indoor six-hour observation without universal, all-day or hot-commute promises; preserve CTA/disclosure and avoid unsupported country-level assumptions. |
| 41, two turns | Prepare the agreed Brief, then correct the health claim and discount, investigate a slipping clamp and separate extra deliverables from the existing correction round. |

All original 46 prompts, expectations and follow-ups remain unchanged. Existing
outcome graders also remain unchanged. The new cases have no keyword outcome
grade or model judge. Expectations remain outside the model's request and
declared evidence files.

Both variants use the same requests, synthetic evidence, shared Skill, runtime
and review criteria. Each case/variant has a fresh temporary directory with
only its declared evidence. Case 41 retains one thread across its two turns;
later input is not supplied to the opener. Raw events, responses and fixture
identity are saved outside Git.

| Identity | Value |
| --- | --- |
| Baseline commit | `caf505480074b0bef5dcd7fa4b974d7ded413993` |
| Baseline Manager SHA-256 | `ad660ab3c106b12c995209783a6581c48272849f7b30f759cb8bb97d47cfb8e8` |
| Final candidate Manager SHA-256 | `164590627c5505ea1c2dc615ecda0a279432c2a2d1a3abad123035477396dac2` |
| Shared Nox Skill SHA-256, both variants | `96d5d7e51ec49f60874dfd2f556497fec9cd775be7e169b7551997e4215e7d37` |
| Evaluation contract SHA-256 | `b6d62ac1e520f8d2bfde0850d5994f6575feae75ed2bc2b15e01c56554b8083c` |
| Runtime | Configured `gpt-5.6-terra`, medium reasoning; linked login, isolated home, web search disabled. Exact options are saved with the result. |
| Baseline and initial candidate, ignored | `workspace/promptfoo/creative-evidence-20261021.json` |
| Expression clarification, ignored | `workspace/promptfoo/creative-evidence-20261021-release.json` |
| Final reading-route candidate, ignored | `workspace/promptfoo/creative-evidence-20261021-routed.json` |

Reproduce from the repository root with the pinned dependencies and an existing
Codex login:

```bash
npm run eval:manager:prepare -- --baseline-ref caf5054 --reuse-codex-login
npm run eval:manager:conversations -- --cases 47,48,41 \
  --variants baseline,candidate \
  --output evals/influencer-marketing-manager/workspace/promptfoo/creative-evidence-<new-run>.json
```

Use a new output filename; the runner preserves previous observations. A zero
runner exit code establishes complete response evidence and freshness, not a
business-quality pass. Business findings require reading the actual answers
against each turn's fixed expectations.

## Diagnostic observations and narrow corrections

The initial six-conversation comparison completed with candidate digest prefix
`044c0ffeadec4d0f`. Every candidate read the added passages. Case 47 preserved the
supported initial-use demonstration and corrected the unsupported makeover
claim. Case 48 preserved the evidence limits, but its requested expression
sample was written as feedback to the creator rather than a complete audience
explanation. Case 41's opening Brief omitted the GBP 800 fee and payment after
publication; that completeness finding was retained.

The new adaptation sentence was reworded from agreeing what must stay accurate
to actively producing an audience-understandable explanation. This changed no
case, expectation, grader or shared Skill. The next candidate, digest prefix
`15c583cbd157694d`, completed three conversations. Case 48 produced audience-facing
wording, but did not read the playbook at all. It therefore does not establish
that the new passage caused the different wording. The source of its six-hour
observation also remained implicit, which could blur product-team evidence and
the creator's actual initial-use experience.

That trace justified making the existing Brief/review reading route explicit
for a dispute over product claims or audience wording. The final candidate is
checked on the same cases with the same frozen contract. Earlier observations,
including incomplete Briefs and ambiguous wording, remain in the record; a
later complete answer does not erase them. No universal output template, new
workflow or additional marketing rule is added to chase a green result.

## Validation and observed outcomes

- All 48 canonical cases validate. Adapter self-checks, 46 Python tests and
  five Node tests pass, including input isolation and keeping review criteria
  outside model requests.
- Skill quick validation, Promptfoo configuration validation, Expert snapshot
  check and whitespace checks pass.
- The first comparison finished at `2026-10-21T14:07:14Z`, the expression
  clarification at `2026-10-21T14:12:23Z`, and the final candidate at
  `2026-10-21T14:18:56Z`. Each runner completed its post-run freshness check.
- Retained baseline identity, shared Skills, requests, declared inputs and
  evaluation contract match across the three result files. Only Manager content
  changed. All three final candidate conversations successfully read both new
  playbook passages; the preceding case 48 non-read remains a separate finding.
- Observed command executions read Skills and synthetic inputs. No marketing
  message, publication, business-record change or completed product test was
  performed or established by the probes.
- Complete answers and turn-level parent-agent judgments remain local in
  `workspace/promptfoo/creative-evidence-20261021-answers.md` and
  `workspace/promptfoo/creative-evidence-20261021-business-review.json`.

These are qualitative agent judgments against the fixed expectations, not
automated outcome scores or user acceptance.

| Case | Baseline observation | Final candidate observation |
| --- | --- | --- |
| 47 | All five criteria supported: qualified A remains usable; B's caption is unsupported; a targeted pickup and pre-publication check are proposed. | All five criteria supported. Keeps A, scopes B's claim, preserves disclosure/link and separates full reshoot from the agreed correction round. |
| 48 | Core evidence limits and audience-facing wording hold; the example explicitly attributes the indoor six-hour observation to brand information. The sample's personal commute-preparation setting requires creator confirmation before use. | Core claim limits, audience-facing explanation and brand-record attribution hold. The sample's preference for a natural finish requires creator confirmation before use. Both are discussion drafts, not evidence that those personal experiences occurred. |
| 41, opening | Retains GBP 800 and payment after publication, with a clamp check before filming. Criterion 1 is partial: it attaches the 60–90 second duration to the whole desk-setup video rather than the integration. | Criterion 1 remains partial: fee and payment milestone are omitted, and the 60–90 second duration is attached to the whole video rather than the integration. It also calls the two pre-filming checks cost-free without supplied cost evidence. Disclosure and excluded-rights boundaries hold. |
| 41, draft review | Timestamped corrections and truthful criticism hold; criterion 2 is partial because the product-team investigation owner is implicit. | Timestamped claim/discount corrections, truthful criticism and extra-scope boundaries hold. Criterion 2 remains partial: it asks to record/notify the product team, but does not clearly establish installation/compatibility/defect investigation and its release checkpoint. |

Review correction, 2026-10-22: the original review called the baseline Brief
complete and flagged only the candidate's personal preference in case 48. Reading
both raw answers again exposed the shared duration error and the baseline's
unverified commute-preparation setting. The table now applies the same scope and
experience checks to both variants. A discussion draft may propose wording that
the creator must confirm; it is not a verified testimonial. Raw answers and the
original dated local judgments remain unchanged. These corrections are not a
new model run or evidence of a Skill improvement.

Selected final-answer evidence:

> A: 保留现有口播、赞助标识和链接。不得使用 B 的 caption。

> B: 全妆、换光线和造型，无法单独证明 C1 的遮瑕效果。

> 品牌记录显示，在其说明的室内使用条件下，六小时观察时妆容仍然可见。

> 初始上妆展示不被表述成持妆证明。

For practical use, remove or confirm each sample's unverified personal experience;
keep the brand-record attribution. That is a reviewer correction, not a claim
that the raw answer already passed every criterion. An illustrative corrected
passage is: "Here is the initial finish in this demonstration. The brand's
documented indoor observation showed makeup still visible at six hours. See the
linked shade and usage information." The approved sponsorship label must remain.
This edited illustration is not a new model output or evaluation pass.

## Retention decision and limits

Retain the two scoped method passages and the conditional reading route. The
probes show the key evidence distinctions in these observations, while exposing
copy verification and full-Brief completeness limits. The relevant existing
rules already require truthful experience, confirmed terms and a product check;
these samples do not justify another universal checklist or output template.

The baseline already handled much of the task. The final case 48 reads the new
reference and gives a more usable expression than the initial candidate, but
one observation cannot establish stable improvement or attribute every wording
change to the Skill. Earlier failures and non-reads remain visible. There are
three distinct business cases, with diagnostic repeats across revisions, not
twelve independent business tasks or an all-pass suite.

Explicit invocation does not establish natural routing reliability. No live
creator action, platform algorithm effect, real product efficacy, market-wide
preference or commercial lift was validated. Before external use, review the
specific facts, personal experience, commercial terms and release checkpoint
against their authoritative sources.
