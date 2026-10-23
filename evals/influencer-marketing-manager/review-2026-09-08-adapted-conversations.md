# 改写的评测样例：补案例，保留一处未解决的遗漏

本轮新增五条可执行 case，覆盖四类沟通决策问题；**没有修改 Skill，也不声称业务效果已提升**。当前版本守住了项目归属、还价与接受、部分约定与履约状态等关键边界。Case 29 两次都未列出使用权尚未约定，按既定预期保留为待修正项，没有用自动绿色结果掩盖它。

新增 case、固定标准、首轮基线、重点复测、原有回归和证据保存已完成。[五份首轮原文及 case 29 复测原文](business-review-sample-2026-09-08-adapted-conversations.md)未润色，均待用户业务评审。下面的判断是 Agent 预评，不是用户批准。

## 本轮改变什么

围绕四类沟通决策问题，构建 cases 26–30：

- **26｜归属识别：**同一线程混入两个品牌、两位运营，以及达人重复发送的 media kit。测试先确定谁代表谁、谈哪个项目，再解释回复；附件内容不可见就保持未知。
- **27 / 28｜时点判断：**同一谈判分别截在接受前和接受后。请求相同，后者保留前者的完整前缀，再追加接受及寄样往来。旧 CPM、另一币种的固定报价、当前还价和已接受条件不得混用。
- **29｜条件保真：**数量、植入上限、附属交付、明确不包含的内容、付款方式和寄送限制分散在长对话中，交接需要保留它们，而非只提取最新一封。
- **30｜有效续聊：**早期已表达兴趣，后来只有收件确认请求；下一封应推进未回答的费用与范围问题，不重新询问意向，也不从显示名或抄送推定正式交接。

这些是**改写的评测样例**，不代表已经发生的生产 Agent 失败。身份、品牌、日期、金额、联系人及记录 ID 均为虚构，邮箱使用 `.example`，不含地址和私有链接。附件只提供元数据。

原有 25 条 canonical case、原有输入、五个 outcome grader、Skill、Expert、模型配置默认值及运行权限不变。仅扩展 case 选择、复用读取证据断言，并增加六个本地测试，检查时间截断、前缀一致性、评审信息隔离、成功来源读取、元数据歧义及保留域名。没有新增视图、状态机、抽取框架或模型 judge。

## 固定条件与实际结果

两轮均使用 `1e397156abbab2e96fa13f4c5a6e0a6100d57e1d` 的 Manager，显式固定 `gpt-6-astra` / medium；串行、只读、隔离、不复用 Promptfoo 结果缓存，Agent 无网络和营销系统访问。首轮执行 26–30；随后执行 24、25、27、28、29。期间没有改请求、输入、Skill、grader 或业务评审标准。

| Case / 执行次数 | Agent 预评 | 依据及当前可支持的决定 |
| --- | --- | --- |
| 26 / 1 | 可直接用 | 明确“该邮件虽标为入站，实际来自 Leon，不是达人接受报价的回复”；VOLTLEAF 的三条 GBP 1,800 提案仍待反馈，Mira 继续负责，LENSNEST 的交付与使用权未混入。可据此接手正确项目。 |
| 27 / 2 | 可直接用 | 两次均将 EUR 2,800 写成待达人确认的还价，保留 USD 4,200 固定报价和此前 USD 42 CPM；复测明确不能跨币种直接相减。可继续议价，不可确认合作。 |
| 28 / 2 | 可直接用 | 两次均保留 EUR 2,800、一次 75–105 秒中插和发布后付款的明确接受；将旧报价列为历史，将当前卡点列为追踪信息及到货，未把代理邮件当作承运商回读或签收。可接手物流协调及未决条款。 |
| 29 / 2 | 需要关键修改，待用户确认其业务重要性 | 两次完整保留 EUR 320、最长 100 秒、附属交付、封面与标题排除项、单条数量、T8 产品、PayPal 无发票及发布后约五个工作日付款；7 月 29 日未被误作发布日期。但两次“仍需确认”均未列使用权尚未约定。可保留现有整理，不能称已完整满足本轮条款缺口预期。 |
| 30 / 1 | 可直接用 | 保留代理表达的兴趣；草稿聚焦 80–110 秒植入报价和包含范围，没有再次询问是否有兴趣或索要地址。Nora 署名被明确作为待确认的起草假设，没有断言正式负责人已转移。可供运营审阅后决定何时发送。 |
| 24 / 1 | 可直接用 | 覆盖五条内部关系，保留关闭与排除边界、Mina 的正式交接、自动回执与缺失记录的区别。缺少新业务授权时不重启或外发。 |
| 25 / 1 | 可直接用 | 只将 C 作为当前客户讨论方案，保留完整已知套餐和付费使用权缺口；没有把内部五条关系改造成五个候选方案。 |

逐项核对 `evals.json` 的预期：26、27、28、30 的各项均满足；29 的第 5 项部分满足——保留了已约定部分和发布日期未知，但未提及使用权未知，其余项满足。24/25 的原有预期均满足。没有按字面词组或固定表头判断业务质量；也没有将 case 29 的遗漏从评审标准中删掉。

十条执行的自动证据检查全部通过，无评测行错误或超时。它们只验证有回答、加载 Skill 和读取来源，**不是十条业务全通过**。进一步核对了完整回答与 trace：每份所给文件的完整文本均出现在成功读取输出中，最终答案与 trace 一致，命令仅读取 Skill 及声明的业务文件，没有外发或修改。

准备目录沿用现有共享 fixtures 结构，并非逐 case 的文件系统权限隔离。因此对 case 27 额外审计了命令与工具观察：两轮均只读取该 case 声明的早期文件，没有读取 case 28 或接触后六条消息。前缀/截止时间单元测试证明输入文件被正确截断；trace 审计才支持本次执行没有使用未来信息。不能仅凭命中前七个 ID 就作此判断。

## 为什么暂不修改 Skill

这轮没有观察到混项目、虚构接受、丢掉已达成条件或夸大履约的关键失败；这些问题现在有了可重跑的基线。Case 29 的遗漏被两次复现，但它还不能直接证明缺少一条通用 Skill 指令：现有 `workspace-context.md` 已要求保留与当前决定相关的未知项，并避免把前期工作变成完整合同清单；`playbook.md` 也包含使用权维度。本 case 又未提供品牌的复用或投放计划。

因此，先保留“需要关键修改”的预评和原文，请用户判断：**这种接手安排合作的摘要，是否必须主动列出未谈使用权，还是在涉及素材复用／投放决策时才需要？** 不先降低预期，也不把一个尚待确认的业务要求推广为所有交接的必填项。

如果用户认定这是关键遗漏，下一轮区分“已有规则未在当前任务中得到可靠执行”与“入口没有把必要参考带入上下文”，只改一处决策相关指导，固定这些输入复测，并回跑 cases 24/25 防止产生过长、过度阻塞的摘要。若用户认定当前阶段不需要，修订评审口径时也应重评两份已保存原文，而不是宣称模型被修好了。

这一处理遵循本轮读取的 `skill-creator` 最小指令原则，以及 [OpenAI Agent Improvement Loop](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop) 的“真实证据与反馈 → 固定 eval → 诊断问题类型 → 有界改动 → 回测”方法。保留有价值的新案例不要求同时追加 Skill 指令；没有引入其可选的 HALO 工具。

## 验证与复现

本地 43 个单元测试、canonical case 校验、adapter/grader 自测、Promptfoo 配置与快照校验、Expert 同步和原文一致性检查通过。差异空白检查仅有一个有意保留的例外：case 30 原文在 `Best,` 后使用两个空格作 Markdown 换行；单独核对其与原始输出一致，其他文件按默认规则检查。另核对原 25 条 case、五个 outcome grader 及 Skill/Expert 未变；新 fixture 不含原始身份、联系方式、生产记录 ID 或私有链接。

```bash
npm run check:manager-evals
npm run eval:manager:validate
python3 scripts/sync_expert.py check
npm run eval:manager:prepare -- --baseline-ref 1e39715 --reuse-codex-login
INFLUENCER_EVAL_MODEL=gpt-6-astra npm run eval:manager -- --no-cache --no-table \
  --filter-pattern '^\[(26|27|28|29|30)\]' --filter-providers manager-baseline \
  -o evals/influencer-marketing-manager/workspace/promptfoo/results-adapted-conversations-baseline-20260908.json
INFLUENCER_EVAL_MODEL=gpt-6-astra npm run eval:manager -- --no-cache --no-table \
  --filter-pattern '^\[(24|25|27|28|29)\]' --filter-providers manager-baseline \
  -o evals/influencer-marketing-manager/workspace/promptfoo/results-adapted-conversations-confirm-20260908.json
npm run eval:manager:report -- \
  evals/influencer-marketing-manager/workspace/promptfoo/results-adapted-conversations-baseline-20260908.json \
  evals/influencer-marketing-manager/workspace/promptfoo/results-adapted-conversations-confirm-20260908.json
```

完整结果及 trace 留在本地忽略目录 `workspace/promptfoo/`。首轮 ID 为 `eval-M2W-2026-09-08T10:18:08`；复测 ID 为 `eval-J1U-2026-09-08T10:22:47`。会话追溯信息仅保留在本地。

SHA-256：Skill `c6efe6956a36481f3b3eac34e8c2c94f649c8cc43ae716a5dbee08b8a3ba452d`；eval contract `a6143712626c5ed56618748b476577b266f39e831b4fa8f118bfddbbdfa84db2`。两次导出中的快照身份一致。

实际运行沿用本机 Node `v26.0.0`、npm `11.12.1`、Python `3.14.5` 和项目锁定的 Promptfoo `0.122.2`。环境仍提示未知模型元数据及退出时的 telemetry shutdown 超时；本次未中断回答，不据此断言其对性能没有影响。未修改系统 Node、依赖、模型权限或运行隔离。

本轮没有重跑全部 30 条案例或自然触发测试，也没有测试线上检索质量、邮件投递、真实合同履约、付款或业务 ROI。重复执行是稳定性探测，不是独立业务样本，更不是统计可靠性证明；此前失败记录和待用户评审项继续保留。
