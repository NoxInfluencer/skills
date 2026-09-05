# 首版业务样例：首邀与客户初审

这是首次评审前的归档样例，不是固定模板或标准答案。用户后续判断为需要修改：应提供约 5 位供比较、拆开判断与证据、去掉重复的逐人“下一步”。反馈已记入 [business-review.md](business-review.md)，下面的历史回答未改写。

- 输入为[完全虚构的 case 21](fixtures/inputs/case21-opportunities.json)，品牌、达人、报价和项目门槛均为合成数据。
- 以下保留 `12eeaa9` 基线 Skill 的首轮测试回答，仅清理行尾空格；不是对候选改动有效性的证明，也没有真实邀约或客户反馈。
- 运行：`results-client-review-comparison-20260906.json`，`manager-baseline / case 21`；原始 trace 保存在本地忽略目录 `workspace/promptfoo/`。
- 判断口径见 [business-review.md](business-review.md)。你可以直接回答：**可直接用 / 需要关键修改 / 不可用**，再指出最重要的一处原因；我会据此调整，避免先设复杂标准。

## 测试回答原文

## 当前建议：只将 Desk Lab A 交客户决定是否继续讨论

依据：2026-09-06 合成快照（BRIEF-21）；以下播放量中位数仅取各频道提供的近期长视频，不代表效果预测。2,500 次门槛仅适用于本虚构项目。

| 机会 | 判断与证据 | 下一步 |
|---|---|---|
| **Desk Lab A** | **值得交客户讨论。** 三条近期长视频中位数 **4,100**，真实充电、旅行与通勤场景符合 P1；美国英语受众、身份及通信方匹配。9 月 5 日真人回复明确表示兴趣，提出 **10 月旅行科技视频、一次 60–90 秒植入、USD 1,400**，并索要 brief。 | 请客户决定：**是否值得按这个内容方向和报价起点继续了解？** 若同意，团队准备 brief 和后续沟通草稿，核实档期及报价范围。使用权、付款等尚未讨论；此决定不接受报价、不锁定合作。 |
| **Trail Kit B** | **内容合格，继续补联系证据。** 三条近期长视频中位数 **3,900**，手机、头灯及露营充电场景契合；美国英语受众及身份检查无重大问题。尚未联系、无重复记录，但**没有已核验的公开商务联系渠道**。 | 团队后续取得并核验商务联系渠道；本次仅准备首邀草稿。尚无真人意向，不列入客户当前的机会决策名单。 |
| **Shorts Lab C** | **停止本项目当前推进。** 虽有真人兴趣及 **USD 600** 报价，但近期高播放来自 Shorts；唯一提供的长视频为 5 月 1 日、**1,100** 次，既非近 90 天，也未达到长视频门槛。 | 不因低报价或 Shorts 流量放宽资格。仅在补充符合要求的近期长视频证据后重审。 |
| **Daily Tech D** | **内容合格，等待真人意向。** 三条近期长视频中位数 **5,800**，设备实测、美国英语受众及身份检查符合要求。但消息头明确为 `auto-replied`，正文也说明只是自动收件确认。 | 不计为真人回复、不交客户作意向机会选择。已发首邀，不再准备重复首邀；后续收到真人回复再判断。快照没有约定跟进指令，本次不自行安排发送。 |

**客户现在只需回答：是否继续了解 A？** 现有证据支持讨论内容匹配，但不足以判断 USD 1,400 是否经济合理；预算、完整费用及商业条款均未获批准。若暂不考虑 A，可保留 B 为待核验联系渠道的备选，而不是将其视为已有意向机会。

## Trail Kit B 首邀草稿（英文，未发送）

**Subject:** DemoCharge P1 — exploring a camping-video integration

Hi Trail Kit B,

Your September 1 video showing phone and headlamp charging on a two-night camping trip stood out to us. That practical setting looks relevant to DemoCharge P1, a compact power bank for everyday devices and camping.

We’re exploring a potential integration in a YouTube long-form video for a US, English-speaking audience. Would you be open to discussing whether P1 could fit an upcoming camping or gear-testing video? If so, could you share your preferred approach, indicative fee, and availability?

This is an exploratory inquiry; any collaboration scope and terms would be subject to mutual agreement and brand approval.

Best,
[Sender name]
[Role / team]

发送前仍需核验收件渠道、发件身份及取得发送授权；草稿不承诺免费产品、寄送、预算或使用权。本次仅使用所给材料，未访问外部系统、发送消息或修改记录。
