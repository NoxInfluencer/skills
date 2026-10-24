# Partner and incentive integration review

Date: 2026-10-24

## Problem and retained change

A partner's label or payment model does not determine the work it can do.
Similarly, a low upfront payment, high reported EPC or estimated fee credit
cannot establish a viable cooperation. The fifth material's approved methods
are integrated at the existing decision points:

- Operating design separates partner identity, actual work and payment model.
  A creator can explain compatibility for a content fee plus commission; a
  deal publisher can carry a valid promotion. Their roles can overlap.
- Playbook 6 sizes incentives against the contribution remaining after known
  costs. Platform/tool costs join the complete-cost expression. Revenue already
  net of discounts/refunds is not reduced twice. Tier terms distinguish the
  eligible base and an all-sales rate from a rate on only the excess.
- The same section separates estimated, confirmed and actually applied fee
  credits. Eligibility, qualifying basis and timing determine the conditional
  scenario; the uncredited economics remain visible. A future offset is not
  cash in hand.
- Playbook 7.1 gives a brief preparation example for each job: supported facts
  and demonstrations for an explainer; product, market, offer, stock, time zone,
  stacking limits and destination/tracking for a promotion. Gaps use the
  existing owner and launch check.
- Playbook 8 qualifies EPC by whose earnings it represents, clicks per unit,
  window and refund state. Different partners' rates are not automatically an
  incentive experiment. Tracked orders, commission eligibility, approved
  amounts due and actual settlement remain separate.

The entrypoint adds one route to the existing channel interface. The Expert
copy is synchronized. Recruitment, communication, scheduling and business
records reuse their existing methods. No separate affiliate module, partner
grading scheme, fixed rate, universal channel mix or execution permission is
added. Original identities, screenshots, promotional material and source
statistics remain local; both new fixtures are wholly synthetic.

## Fixed comparison

Before editing the Skill, the local protocol fixed cases 54/55 and existing
cases 38/44, their expectations, retention conditions and failure policy. The
original 53 cases, including their prompts, follow-ups and expectations, remain
unchanged. Existing outcome graders and the conversation runner are unchanged.
Cases 54/55 use response evidence and manual business review, not a new
keyword outcome score or model judge.

| Case | Fixed business question |
| --- | --- |
| 54 | Preserve complete planning costs, resolve both tier interpretations, distinguish uncertain future fee offsets and retain the finance/marketing/project-owner decision boundary. |
| 55 | Choose by actual work, preserve hybrid cooperation and incomparable EPC, then hand off the known offer/routing/tracking blockers to the supplied owners and November 4 review. |
| 38 | Diagnose an apparent performance anomaly from definitions, attribution and purchase-path evidence; retain order/refund cohorts and a bounded expansion decision. |
| 44 | Make the growth method concrete, distinguish attribution/assistance/incrementality and preserve project-specific scale/stop and content-rights decisions. |

The candidate must retain the useful roles, full supplied economics and launch
gates without inventing causal lift, default rates, commercial commitments or
authority. Material new decision regressions require rejection or rollback.
Failed evidence is retained; a preferred answer does not justify a rerun.
An invalid infrastructure run permits one identical recovery with the original
error preserved. No recovery or further candidate revision was used here.

Each case/variant uses a fresh temporary directory, isolated home and only its
declared inputs. Requests, fixtures, expectations and runtime match; only
Manager content differs. Expectations are not sent to the model. The Skill is
explicitly invoked, so this does not test natural routing.

## Reproduction and identities

Use the pinned dependencies and an existing Codex login from the repository root:

```bash
npm run eval:manager:prepare -- --baseline-ref 5b82595 --reuse-codex-login
npm run eval:manager:conversations -- --cases 54,55,38,44 \
  --variants baseline,candidate \
  --output evals/influencer-marketing-manager/workspace/source-5-<new-run>.json
```

Use a new output filename. The runner refuses to overwrite observations and
checks snapshot freshness before and after execution. Its successful exit
establishes completed response evidence, not business sufficiency.

| Identity | Value |
| --- | --- |
| Baseline commit | `5b825958d0aadb3af44209a5bfebaa67b686b7d3` |
| Baseline Manager SHA-256 | `68b262b04c0b62688669d98852a01fadbddd545148e72b1416b0fe23eacdbfed` |
| Candidate Manager SHA-256 | `07475e9097a2c4d48ae554b17add9436a33f4179d40cd135c616f1aa4ba58c6e` |
| Shared Nox Skill SHA-256, both variants | `96d5d7e51ec49f60874dfd2f556497fec9cd775be7e169b7551997e4215e7d37` |
| Frozen evaluation contract SHA-256 | `2034cf954d6d0b8088890445a05adcf4a7cf17c3db138c84056bb34c784b6785` |
| Runtime | Configured `gpt-5.6-terra`, medium reasoning; sequential execution, existing 600000 ms timeout, isolated home, linked login, web search/memory/plugins/apps/multiple agents disabled. |
| Raw comparison, ignored | `workspace/source-5-integration-20261024/comparison.json` |
| Answers and manual review, ignored | `workspace/source-5-integration-20261024/answers.md` and `business-review.json` |
| Command-output read evidence, ignored | `workspace/source-5-integration-20261024/read-evidence.json` |

The comparison ran from `2026-10-24T13:53:26Z` to `2026-10-24T14:05:11Z`.
All eight executions and eight user turns completed, one observation per
case/variant. Post-run snapshot freshness passed. Case 54's candidate
successfully read the incentive/credit passages; case 55's candidate read the
role, readiness and EPC passages. Both read their supplied input. Successful
reads were checked against actual command output, separately from answer
quality. No marketing send, publication, purchase, payment or business-record
update was observed or established.

## Actual answer review

The following are parent-agent judgments against the same fixed expectations,
not automated outcome scores or user acceptance. All 48 criterion/answer
judgments and verified matching excerpts remain in the ignored local review.

| Case | Baseline observation | Candidate observation |
| --- | --- | --- |
| 54 | Correctly retains $8,000 revenue, $5,200 variable cost and $700 other known cost. The 12%, marginal-tier and all-sales-tier cases leave $1,140/$1,020/$660. Excludes the uncertain fee offset. Criterion 4 is partial: the no-upfront-risk claim is not explicitly challenged. | The same final arithmetic is correct, and both tier bases remain unresolved pending clarification. Criterion 3 is partial: current conditional credit handling is correct, but saying even a later confirmed credit can never offset this cooperation is too absolute. Criterion 4 is partial: the answer rejects no risk but calls all $700 fixed/upfront costs without supplied payment timing. Approval remains withheld. |
| 55 | Keeps A's $450-plus-8% proposal and B's conditional deal role, rejects EPC ranking and the claimed completed A/B, and blocks launch pending code, UK routing and readback. Criterion 4 is partial: the handoff omits Europe/London and does not explicitly retain the D4-only condition in its offer row. | Preserves job/payment flexibility, EPC subjects/units and different windows/refund states. Carries UK D4, dates/time zone, non-stacking, stock, US redirect, unvalidated code and missing readback into the named owners and November 4 decision. All six criteria are supported in this observation. Both variants already handle the main comparison and permission boundaries. |
| 38 | Separates measures, checks definitions and routes, keeps refunds with original orders and pauses expansion pending a bounded review. All six criteria are supported in this observation. | Retains the same pause, source checks, purchase-path diagnosis and cohort treatment. Criteria 1/6 are partial: “上涨只证明上游有效” verifies too much before checks, and “三者本来不应相等” wrongly rules out coincidentally equal PV/UV/IP. These are newly observed wording defects; the actual spend/validation gate remains intact. |
| 44 | Gives a concrete main job, destination and rights handoff. Criteria 5/6 are partial: the city-difference example overstates incrementality and the example introduces an unagreed two-batch stop trigger without complete budget authority. | Gives concrete jobs and path checks, a credible counterfactual distinction, rights fields and project-specific sample/cost/authority requirements. Criterion 5 remains partial: it omits the explicit decision-value/time-cost choice for incrementality. This is not proof that historical case-44 limitations have been repaired. |

Both case-54 answers translate net commissionable sales revenue imprecisely as
“有效净佣金收入.” Their separate revenue/cost/commission calculations make the
intended meaning clear, but an actual financial handoff should use an
unambiguous sales-revenue label. The candidate's $2,800 intermediate contribution
also precedes the separately listed $700 known costs; $2,100 is the remainder
before commission after those costs. Neither amount is realized company profit.

Both case-55 answers retain different historical windows without repeating
their exact 30-day/7-day lengths. Neither treats arithmetic unit normalization
as comparability. No answer establishes a completed controlled experiment,
confirmed credit or commercial incrementality.

Local structural checks pass for 55 cases, validator/adapter self-tests,
46 Python tests and five Node tests. Promptfoo configuration, Skill quick
validation, Expert synchronization, frozen snapshots, original-case/fixture
preservation, links, whitespace and public boundaries are also checked. Skill
validation uses a disposable `uv run --with pyyaml` environment; project
dependencies and model/runtime settings were not changed.

## Retention decision and limits

Retain the approved minimal integration. The critical current decisions have
response support: complete supplied economics, unresolved tier terms,
conditional current credit, useful partner work, incomparable EPC and the
offer/routing/tracking launch gate. The observed wording defects do not produce
a new unauthorized commitment, launch or expansion decision in this comparison.
There is no clean all-criteria regression pass. In particular, case 38's new
wording defects must remain visible rather than being labeled baseline issues.

Payment timing and future credit application still need actual terms and
finance allocation to the eligible cost/period; do not adopt the candidate's
absolute future-offset prohibition as a general rule. Metric validity must be
checked, and PV/UV/IP need neither match nor differ. Incremental design still
needs an explicit decision-value tradeoff in the relevant project. These are
bounded limitations, not reasons to keep adding generic rules or repeat the
comparison for preferred answers.

One observation per case/variant cannot establish stable improvement, full
marketing capability, natural routing reliability, live tracking, settlement
accuracy or business lift. The baseline already handles much of the task.
Historical Brief, reuse-handoff and industry-evidence limitations remain open;
this integration does not claim to repair them. The sixth material has not
been started.
