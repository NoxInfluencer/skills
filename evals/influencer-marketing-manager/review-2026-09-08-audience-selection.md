# 同材料、不同受众：补覆盖，保留现有 Skill

结论：新增 case 25 及配套测试，**不修改 Skill**。当前版本在这组三次执行中能按读者选择信息，未发现需要新增通用指令的关键问题。这里验证的是信息选择，不是看板、状态机或维护流程。业务判断仍是 Agent 预评，[首轮两份模型原文](business-review-sample-2026-09-08-audience-selection.md)待用户按“可直接用／需要关键修改／不可用”确认。

## 为什么补这个案例

现有客户比较与运营交接案例使用不同输入，不能单独观察受众变化的影响。本轮让 case 25 复用 case 24 的完整材料，只改变请求：运营需要知道五条关系的进展、卡点和负责人；客户需要判断哪些在途合作方案值得继续谈、已知条件是什么、还需确认什么。

这是已有关系的方案审议，不是再次拓展五位候选。材料中仅 C 是可讨论的在途方案；A 无真人回复，B 已关闭，D 已排除，E 资料不足。此前五人比较及缺口说明要求仍由 cases 22/23 保留。输入里的内部交接背景不覆盖最新请求，也不因更换读者而解除资格和重启授权规则。

本轮仅新增一个 canonical case、复用读取断言、增加一个单元测试，并更新业务评审说明。原 24 个 case、合成输入、五个 outcome grader、Skill 和 Expert 均未改动。新 case 没有自动业务评分；预期答案与评审规则只在测试元数据中，不进入模型请求。

## 固定条件与结果

Skill 为 `5c3f4b003047eb4057395aaac177252d752af933`，模型固定 `gpt-6-astra` / medium。两次运行均关闭结果缓存、串行、隔离、只读，无网络或营销系统访问；共执行 case 24 一次、case 25 两次。业务标准在首轮运行前确定，复测没有改提示词、输入、Skill 或评分。材料是截至 **2026-09-06 09:00 UTC** 的合成快照，不是 9 月 8 日的实时状态。

| Case / 次数 | Agent 预评 | 决策相关证据与限制 |
| --- | --- | --- |
| 24 / 1 | 可直接用作内部交接 | 覆盖五条关系，C 归 Mina；区分 A 自动回执、B 关闭后的新报价、D 长视频资格缺口、E 未知状态。保留 C 套餐及授权边界。仍有较密的表格和重复决策提醒，是否需要压缩待用户评审。 |
| 25 / 1 | 可直接用作继续洽谈的决策摘要 | 开头明确“仅 Pocket Studio C”，将判断、资格与回复依据、已知条件、需客户确认的问题区分呈现。保留 USD 1,400、一次 60–90 秒 YouTube 植入、10 月、一次脚本修改、不含付费使用权，以及付款与具体发布日期未定。不复述五条内部交接事项。 |
| 25 / 复测 1 | 可直接用作继续洽谈的决策摘要 | 改用维度表格但保留同一套事实和边界；明确“现有材料不足以判断价格性价比”，另问 10 月是否适合项目安排。未把缩短答案、固定表头或问题数量作为通过依据。 |

三份回答的自动证据检查均通过，评测行没有运行错误或超时；这些绿色结果只证明有回答、加载了 Skill、成功读取了来源，不是业务通过率。进一步核对完整回答和 trace：所给文件全部内容均出现在成功读取输出中；最终回答与原始 trace 一致；轨迹只有读取，没有外发、记录修改或视图维护。

## 验证与保留边界

本地 37 个单元测试、canonical case 与 adapter/grader 自测、Promptfoo 配置和快照检查、Expert 同步、原文一致性、Markdown 文件链接与空白检查通过。另核对原 24 个 case 内容、五个 outcome grader 以及 Skill、Expert 和输入文件均未改变。

这不是旧版与新版的效果比较：本轮 Skill 始终相同，只增加受众选择覆盖。两次相同请求只是稳定性探测，不是两个独立业务案例，也不能证明长期可靠性。没有重跑全部模型案例，不声称验证了全部自然触发、真实拓展、邀约或履约；此前失败及待用户评审项继续保留。

下一次优先收集用户对客户原文的一个关键判断：是否缺少影响决定的信息，或有必须删去的无关内容。出现实质问题后再做一处有界修改，用固定输入和同一口径复测；现阶段不追加指令、展示工具或模型 judge。

## 复现与证据

```bash
npm run eval:manager:prepare -- --baseline-ref 5c3f4b0 --reuse-codex-login
INFLUENCER_EVAL_MODEL=gpt-6-astra npm run eval:manager -- --no-cache --no-table \
  --filter-pattern '^\[(24|25)\]' --filter-providers manager-baseline \
  -o evals/influencer-marketing-manager/workspace/promptfoo/results-audience-selection-baseline-20260908.json
INFLUENCER_EVAL_MODEL=gpt-6-astra npm run eval:manager -- --no-cache --no-table \
  --filter-pattern '^\[25\]' --filter-providers manager-baseline \
  -o evals/influencer-marketing-manager/workspace/promptfoo/results-audience-selection-confirm-20260908.json
```

完整结果和 trace 留在本地忽略目录 `workspace/promptfoo/`，首轮两份回答以未润色原文入库：

- 首轮：`eval-RLo-2026-09-08T08:46:05`；覆盖 cases 24/25。
- 复测：`eval-Smg-2026-09-08T08:50:04`；复测 case 25。
- SHA-256：Skill `c6efe6956a36481f3b3eac34e8c2c94f649c8cc43ae716a5dbee08b8a3ba452d`；eval contract `49a444dc8eaface2c126974b89dca452c0601dfa8ff371c925e59f19606af694`。

运行环境仍报告模型元数据缺失并采用 fallback metadata，以及退出时的 telemetry shutdown 警告；本次未中断回答，不能据此断言对性能无影响。没有为这些提示更换模型、SDK、系统 Node 或运行权限。

本轮核对了 [OpenAI Agent Improvement Loop](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)：先区分缺少要求、已有要求执行不稳和实现／可观测性问题，再决定是否修改。`skill-creator` 的最小指令原则用于保留现有 Skill，避免将单个案例变成新的通用清单。
