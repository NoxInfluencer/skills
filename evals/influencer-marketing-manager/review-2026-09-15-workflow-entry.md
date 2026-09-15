# Manager workflow entry review — 2026-09-15

Retain the workflow-entry revision with the limitations below. The entry and automation probes support the intended direction; this is not an all-business-outcomes pass. The strategy benchmark-evidence issue in case 15 remains unresolved and requires review before figures are used in a client strategy.

## Change and evidence boundary

The Manager now primarily helps users build and improve automated influencer-marketing workflows. It first establishes the current task and reuses existing methods. Industry consultation, strategy, an SOP document, an automation proposal, and implementation have different useful completion points. A bare getting-started request does not establish a creator-search brief.

The change keeps the existing discovery, negotiation, source-role and execution guidance. Lifecycle guidance is conditional on the task. The WorkBuddy Expert description, initial prompt, agent instructions and generated Skill copy use the same positioning. The Expert remains a draft; this review does not establish marketplace installation behavior.

## Evaluation design

- New canonical cases 31–34 use synthetic requests and materials. Cases 31/32 each have two real sequential model turns. The other cases are independent requests, not later turns in a shared conversation.
- Model: `gpt-5.6-terra`, medium reasoning, existing Codex SDK runtime. Memory, plugins, apps, multiple agents, agent network access and web search are disabled; the filesystem sandbox is read-only.
- Each case/variant has a fresh thread and temporary working directory containing only copied Skills and declared case inputs. The runtime login is isolated; no marketing credentials are supplied as fixture data.
- Later user messages and all review expectations remain outside the current model context. Raw events and answers are saved after each event. Interrupted or empty turns cannot count as completed evidence.
- The first attempt exposed cross-case input contamination in the shared fixture directory. That attempt and its initial candidate are excluded from release evidence. The runner was corrected and tested; comparison resumed with per-case directories. The rejected attempt is retained locally, not silently discarded.
- Review below is an agent assessment of complete answers and successful source reads, separate from user acceptance. No model judge or outcome grader was changed. Existing graders for cases 12, 19 and 20 were replayed on the regression answers and all passed.

## Observations

| Case | Observation | Assessment |
| --- | --- | --- |
| 31, open entry → existing SOP | The isolated baseline prescribed a creator pilot and ran product diagnostics before knowing the user's intent. The revised entry first invited a task choice; after the user described an experienced team, it proposed a follow-up queue using the existing process. | Useful improvement. Two revised openings stayed out of immediate search/setup, although their optional examples still leaned toward campaign work. This does not prove reliable wording across runtimes. |
| 32, SOP → automation proposal | Both versions used the supplied sheet/mail workflow. The revised SOP distinguished discussion proposals and preserved human sends. The first revised pilot omitted explicit duplicate checking; the final targeted run included one actionable task per creator and no duplicate tasks on repeated imports. It kept manual file input distinct from a future scheduled service. | Usable for SOP discussion and pilot design. No generator or scheduler was implemented by this read-only probe. |
| 33, industry consultation | Both versions explained fee, usage rights and exclusivity as a comparable cooperation package without demanding a project brief or account setup. Neither imposed a universal fee percentage. | Usable method guidance. Cross-platform examples should be made specific to the user's platform when applied. |
| 34, duplicate-task diagnosis | Both versions traced the failure to successful task creation followed by a lost checkpoint. The final revision explicitly reconciled existing queued tasks after a reply and checked replay, repeated input, and stop conditions. | Usable diagnosis and verification proposal. It is not a deployed fix. |
| 9, creator priority | The revised Manager kept B as contact-pending, advanced B/C for deeper review, treated D as a boundary case, and held A for its format/recency mismatch. It did not claim to have inspected unavailable channels. | Existing coarse/fine judgment retained. |
| 12, translation boundary | Asked for the absent approved email. No Skill or business tool was read. | Scope boundary retained; original smoke check passed. |
| 15, strategy and industry evidence | Baseline and revised answers built subscription acquisition/retention strategies and qualified their planning allocations. Both also stated historical industry spend figures that were neither supplied nor retrieved in the trace. Added evidence wording did not reliably correct this in the final targeted run. | **Partial, unresolved.** Strategy direction is usable for discussion, but numeric reference evidence needs correction before delivery. This is also present in the baseline; no improvement is claimed for this dimension. |
| 17, unavailable implementation | Identified missing sender, CRM write access, runtime and actual export; reported failed product connectivity and did not claim a working automation. | Correct capability-gap handling. This fixture cannot prove implementation success because those capabilities are absent. |
| 19, supporting tools | Kept the four requested tool suggestions tied to decisions without claiming tool execution. | Original smoke check passed; no live auxiliary tool test. |
| 20, supplied brief | Preserved YouTube integration format, scene hypotheses, recent long-form review, contact-pending candidates and pre-send checks. | Original smoke check passed; targeted manual review found the requested business distinctions preserved. |

## Selected response evidence

Verbatim excerpts from the synthetic probes follow. These are observed answers, not desired response templates.

Baseline case 31, first paragraph:

> 从一个“小而完整”的试跑开始：选定一个产品和目标市场，先找一小批与真实使用场景匹配的创作者，人工确认其中几位是否值得联系。不要一开始就建大规模名单或发邀约。

Revised case 31, first isolated comparison, complete first answer:

> 先从你最想推进的一件事开始。你可以选一个方向告诉我：
>
> - 找适合合作的红人
> - 规划一次推广活动
> - 建立筛选、建联、跟进的 SOP
> - 优化现有合作效果或回复率
> - 自动化重复工作
>
> 也可以直接说你的产品、目标市场和当前卡点，我会把它拆成第一轮可执行的动作。

Final case 31, second-turn verification statement:

> 验收：随机抽取 20 位红人，最新状态和待办判断与人工结果一致；重复运行不产生重复待办

Final case 32, second-turn stop/duplicate checks:

> 已有人工回复、拒绝、已停跟的达人是否被排除出继续跟进。
>
> 每位达人当天是否最多出现一条可执行待办。
>
> 同一达人不得因重复导入而重复生成待办。

Final case 34, reconciliation:

> 检测到人工回复或拒绝时，不创建新任务，并关闭该创作者已有的待办跟进任务。

> 连续运行两次相同输入，检查任务系统中每个幂等键恰有一条开放或历史任务。

The suggested sample sizes and trial durations are model proposals, not calibrated business benchmarks or published acceptance thresholds.

## Reproduction and limits

Validation completed: 34 canonical definitions; 45 Python tests and 5 Node tests; unchanged Promptfoo config validation; official Skill structural validation; Expert synchronization, validation and packaging; Connector checks; diff and public-content review. NoxInfluencer's separate 46-case definition validator also passed. These are structural and pipeline checks, not 80 marketing behavior passes.

The five accepted isolated result files contain 19 completed conversations and 25 turns across baseline, revised and targeted reruns. Completion counts are not pass counts: case 15 is partial, and the first revised case 32 needed the documented verification correction. Final Manager digest: `84bc7c449bc4694618c2aa6e3c11d6aadce91772c3f0f5d37a9179493c9dd6eb`. Comparison contract digest after input isolation: `eba5b4dffc6d699c5538221dd2bf358b48702b623e852ff200ff5db97221a693`. The unrelated NoxInfluencer Skill was identical between variants.

Prepare against baseline `bf21ccc3b41a31c1bee48ef4bf818338d9f14044`, then use the [conversation commands](README.md#conversation-probes). Runtime details, complete raw answers, tool observations and full fingerprints remain in the ignored `workspace/promptfoo/` directory. Public evidence contains no local account paths, session identifiers or customer material.

Completed isolated run files are `entry-isolated-focus-20260915.json`, `workflow-isolated-comparison-20260915.json`, `workflow-regression-20260915.json`, `strategy-baseline-20260915.json`, and the targeted `workflow-final-20260915.json`. Earlier `entry-baseline-20260915.json` and interrupted `entry-candidate-20260915.json` are excluded because they predate the isolation repair.

This is a bounded content and conversation review. It does not establish natural positive Skill discovery, full coverage of all 34 case definitions, a live marketing automation, or marketing ROI. Prior findings in unrelated case families remain open under their existing reviews.
