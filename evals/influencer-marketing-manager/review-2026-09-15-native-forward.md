# Manager native subagent probes — 2026-09-15

Three native subagents completed three conversations and six user turns. The opening, task changes and bounded industry advice were usable, and a generated local follow-up tool passed independent execution checks. Retain the current Skill; this run exposed no new defect that supports an instruction change. This is a limited observation, not a reliability estimate or an all-cases pass.

This review extends the [workflow-entry review](review-2026-09-15-workflow-entry.md) with native subagents and a writable local pilot. The Skill under test is revision `eecf579107b19f628216bc906913bda86469a3cf`. The probes use synthetic requests and inputs; they do not test an installed marketplace package or live marketing systems.

## Method and evidence boundary

Three native Codex subagents receive fresh conversations (`fork_turns: none`), the explicit Skill path and only their current user request. Each has a separate temporary directory containing a copy of the current Manager Skill. Only the pilot receives input files and permission to write and execute in its own output directory. Later user turns are delivered after the preceding answer; no expected answer, suspected defect, prior review or grading criteria is supplied.

The subagents inherit the parent's runtime settings without an explicit model override. This differs from the earlier SDK runs using `gpt-5.6-terra` at medium reasoning, so these results are additional observations, not a comparable baseline/candidate score. Directory separation and resource instructions limit the task scope; they are not an OS sandbox or proof of unavailable external tools.

The parent preserves the complete user-facing answers and independently checks the generated pilot artifact. The native delegation interface does not export a complete child tool-event trace here. Consequently, the record establishes answers and independently observed artifact behavior, not a complete audit of every child tool call. Local paths and runtime metadata remain in the ignored `workspace/native-forward-20260915/` directory.

These are held-out probes alongside the 34 canonical definitions. They do not alter existing prompts or graders, and are not automatically executed by the read-only SDK runner. Use a writable local directory for the pilot.

## Probe A: open entry → existing weekly review → SOP only

Send these user turns sequentially to one fresh agent:

1. 我刚装好这个，怎么开始用？
2. 我们已经做了两年，有现成 SOP。我想自动整理每周合作复盘，现在主要是三个同事各自贴数据，周五还得我重新对齐；选人、谈价和发邮件都先维持原样。你建议从哪一步开始？
3. 先不做工具，帮我写一小段 SOP 给三个人试一周。当前约定是按合作编号去重、周五中午截止；一个人在表格里记了“已发”，另一个人把“已排期”也算进发布数，所以我总要改。每个人都能维护自己的原始记录，最后我审核。

The opening was:

> 直接用自然语言告诉我你想做什么、卡在哪里就可以。比如：
>
> - “想了解网红营销一般怎么做。”
> - “我们已有一套流程，想整理成 SOP，再自动化一些重复工作。”
> - “正在跟几个达人谈合作，帮我判断下一步怎么推进。”
>
> 不用先准备完整资料。你现在最想解决什么问题？

The second answer proposed replaying one historical week against the user's finished review, preserving the team's process and extracting identity, cutoff, metric and source rules. It requested only the corresponding source samples, reviewed result and current tool. It did not restart creator discovery or claim an automation was running.

The third answer delivered the requested short SOP and a conflict example. It counted actual publication before the cutoff, retained content links and publication time as evidence, excluded merely scheduled content, and left unresolved conflicts for the responsible operators and final reviewer. No implementation was made a prerequisite for the document.

Assessment: usable for the supplied three-turn task. One conversation supports this observation; it does not establish reliable opening behavior across users or runtimes.

## Probe B: industry teaching → unsupported budget expansion

Send these user turns sequentially to a different fresh agent:

1. 我们不是要马上做 campaign。我在给新同事讲海外红人合作，想解释寄样、付费、佣金三种方式怎么选、团队平时怎么协作。先帮我搭个简洁的讲解框架；如果有行业常见转化率，也想知道大概多少。
2. 老板还问，今年海外红人市场是不是增长很快，我们要不要把预算翻倍？手头只有去年合作了 30 位、今年 60 位，销售额没追踪。帮我写两三句话回复他。

The first answer compared gifting, paid and commission arrangements, explained combinations and team responsibilities, and distinguished voluntary gifts from agreed content delivery. It defined different conversion denominators instead of supplying a universal benchmark:

> 这次没有可核验的行业统计来源，因此不报未经核实的“行业平均值”。

The answer used 1,000 visits and 20 orders as an explicitly hypothetical calculation, with 2% explicitly not representing an industry level.

The complete second answer was:

> 今年海外红人市场是否增长很快，还需要最新行业数据支持；我们合作红人数从 30 位增至 60 位，只能说明自身合作数量翻倍。由于尚未追踪销售额，目前缺少支持预算直接翻倍的效果依据。建议先补齐合作总成本和销售归因，用一轮小幅增量投入验证效果，再决定预算增加多少。

Assessment: usable bounded advice with appropriate evidence limits. This different prompt and runtime do **not** close the unresolved industry-statistics finding in canonical case 15.

## Probe C: implement a local daily follow-up queue

Copy only [the four synthetic input files](fixtures/inputs/local-followup-pilot/) to an isolated `inputs/` directory, alongside the copied Skill and an empty writable `output/` directory. Give a third fresh agent this request:

> 我们已经有跟进规则，每天翻导出表做待办太费时间。inputs 里有现行做法、合作表、收件记录和现有待办，都是模拟数据。请按里面的规则做个能手动跑的小工具，输出给运营用的待办表，实际跑通并检查结果。邮件仍然我们自己发，不用部署。

The fixture supplies actual decision rules, including the five-day interval, maximum two follow-ups, relationship identity, automatic versus human replies, manual sends and preservation of queue history. These are user-supplied rules, not hidden expected answers.

The agent produced a Python standard-library tool, an operator CSV, a historical queue, per-partnership decisions, usage instructions and its own verification script. It reported seven groups of checks. That self-report is separate from the parent's checks below.

The parent copied the generated script into a separate verification directory, checked its final hash against the child artifact, and invoked its actual CLI with explicit input/output directories. Expected actions were derived from the supplied rules and input rows. Verification inspected CSV contents and state transitions, not the wording of the agent's answer or the presence of a success message.

| Parent invocation | Independently observed result |
| --- | --- |
| Initial snapshot, September 15 | Partnerships 1, 7 and 8 have open tasks. Existing task 1 and its creation date are retained. Existing task 2 becomes ineligible after a human reply. There are four total history rows. |
| Identical replay | Queue and operator CSV are byte-identical; zero new tasks. The duplicate partnership 7 input creates no duplicate, while partnerships 1 and 8 for the same creator remain distinct. |
| Add a September 15 human reply for partnership 7 | Its existing task becomes ineligible. Only partnerships 1 and 8 remain open; all four history rows remain. The original automatic reply had correctly allowed follow-up. |
| Replay after that reply | Queue is byte-identical; no replacement task is created. |
| Operator records partnership 1's first follow-up sent on September 15; run September 16 | Its old task becomes ineligible and no new task is due. Only partnership 8 remains open. The tool does not itself change the source's sent date or counter. |
| Run September 20 | Partnership 1 gets its second follow-up with a new task ID; its first task remains in history. Partnership 4 is now due and partnership 8 retains its existing task. There are six history rows and three open tasks. |
| Repeat September 20 | Queue is byte-identical; no duplicate work. |
| Supply conflicting rows for one partnership | The CLI exits nonzero and preserves both the previous queue and operator CSV byte-for-byte. This is the expected failure, not a successful input run. |
| Correct the conflict and retry | The CLI succeeds without changing the verified queue or creating duplicates. |

All nine invocations met their respective expectations. Source files remained unchanged during successful CLI invocations; scenario changes were made explicitly by the parent between runs. The child's original four supplied inputs were also verified unchanged. The final script SHA-256 was `f4d7ae932534d09ad77328a4a92320f14b27a7067f9be486e6e41af1efcc0317`.

Assessment: a working manual pilot using synthetic exports, extending the earlier proposal-only coverage. The generated artifact remains evaluation evidence in the ignored workspace; it is not a maintained script shipped with the Skill. It does not establish a scheduler, mailbox integration, production durability or real outreach. No general-purpose automation framework was added.

## Retained work and remaining limits

This change adds the four synthetic pilot inputs, the exact conversation requests and this review. The Manager instructions, generated distribution copies, 34 canonical cases, runtime and graders remain unchanged. Complete answers, the generated artifact, independent verification driver and per-invocation results are retained locally under `workspace/native-forward-20260915/`.

Repository checks passed: 34 case definitions, 45 Python tests, five Node tests, Promptfoo configuration validation, Expert and Connector synchronization checks, diff validation and review of new public content. These are pipeline checks, not additional marketing-behavior passes.

The known unsupported industry-statistics finding in case 15 remains open. Positive natural Skill discovery, installed Expert behavior, live systems and unattended operation remain unverified. The new evidence supports keeping the current direction without adding more rules after this bounded run.
