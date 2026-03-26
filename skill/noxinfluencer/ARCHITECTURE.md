# Skill + CLI Architecture: Division of Responsibility

> 本文档定义 NoxInfluencer Agent Skill 与 CLI 之间的职责划分原则。
> 随着实践迭代持续更新。最后更新：2026-03-26。

---

## 核心类比

**CLI 是厨房**（刀具、食材、灶台）——它提供能力，能自我描述每把刀的用途。
**Skill 是菜谱**（流程、判断、经验）——它告诉厨师何时用哪把刀、为什么这样搭配。

Agent 是厨师，同时拥有厨房和菜谱。好的架构是：**菜谱不重复刀具说明书上已经写清楚的内容**。

---

## 第一原则：不重复 CLI 能自述的信息

CLI 已经具备强大的自描述能力：

| CLI 能力 | 命令 | 提供的信息 |
|---------|------|-----------|
| 参数 schema | `noxinfluencer schema <cmd>` | 所有参数名、类型、是否必填、默认值 |
| 命令帮助 | `noxinfluencer <cmd> --help` | 命令说明、参数列表、用法示例 |
| 健康诊断 | `noxinfluencer doctor` | 配置、认证、连通性、环境状态 |
| 请求预览 | `--dry-run` | 完整请求内容但不执行 |
| 结构化追踪 | `--trace-json` | 请求/响应详情输出到 stderr |
| 错误说明 | API 响应 `summary` 字段 | 人类可读的错误原因 |
| 消耗反馈 | API 响应 `credits` 字段 | 本次消耗 + 剩余额度 |

**原则**：凡是 CLI 运行时可以获取的信息，Skill 不维护静态副本。Agent 应该先查后用，而不是依赖 Skill 里写死的参数表。

**反面案例**：在 Skill reference 中维护一份搜索参数表（20+ 个字段）——CLI 更新参数后 Skill 忘记同步，导致 Agent 使用过时信息。

---

## 第二原则：Skill 保留"缓存级"知识

Skill 应该包含的信息满足以下**全部三个条件**：

### 1. 稳定性：不随 CLI 版本变化

如果 CLI 升级可能改变这个信息，它就不应该写在 Skill 里。

| 稳定 → 放 Skill | 不稳定 → 不放 Skill |
|----------------|-------------------|
| YouTube/TikTok/IG 数据可用性差异 | 搜索命令的参数列表 |
| 判定框架（4 级 verdict） | 命令语法和 flag 名称 |
| 业务 URL（注册页、billing 页） | 错误码及其含义 |
| 工作流串联顺序 | CLI 输出格式 |

### 2. 高频性：大多数交互都需要

如果只有极少数场景用到，让 Agent 按需从 CLI 获取即可。

| 高频 → 放 Skill | 低频 → 不放 Skill |
|----------------|-------------------|
| 达人搜索的澄清策略 | 特殊参数的边界行为 |
| 短名单呈现规则 | 分页游标的使用方式 |
| 平台间数据差异 | 某个平台特有的 bug workaround |

### 3. 效率性：减少 CLI 调用轮次

如果 Agent 需要调 3 次 CLI 才能拼出这个信息，提前写在 Skill 里就是合理的缓存。

| 高效 → 放 Skill | 低效收益 → 不放 Skill |
|----------------|---------------------|
| "YouTube audience 数据比 IG 更完整" → 避免 Agent 对 IG 发起无效的 detail 查询 | 每个 API 端点的 credit 成本（API 响应自带） |
| "先搜 YouTube 再搜 IG" 的优先级建议 | `monitor_days` 只允许 30/60/180（CLI/API 可校验） |
| "cooperation_detail 在 TikTok 上数据有限" → 避免浪费 credit | 搜索结果的字段列表（Agent 执行一次就知道） |

---

## 第三原则：Skill 的核心价值是决策逻辑

Skill 不是 CLI 的文档翻译，而是**业务判断力的载体**。

### Skill 应该回答的问题

| 问题类型 | 示例 |
|---------|------|
| **何时做** | 用户需求模糊时，先澄清还是直接搜？ |
| **做多少** | 一次搜完 YouTube + IG，还是分步来？ |
| **怎么判断** | 什么样的达人算"High-priority collaboration candidate"？ |
| **何时停** | 什么时候该从 discovering 交接到 analyzing？ |
| **怎么说** | 给用户看短名单表格，不是 JSON dump |
| **怎么引导** | 额度不够 → 给 billing URL，不说"联系客服" |

### Skill 不应该回答的问题

| 问题类型 | 应该由谁回答 |
|---------|------------|
| 这个命令有哪些参数？ | CLI `schema` / `--help` |
| 这个错误码是什么意思？ | CLI 响应 `summary` 字段 |
| 当前额度还剩多少？ | CLI `quota` 命令 |
| 配置有没有问题？ | CLI `doctor` 命令 |

---

## 第四原则：错误处理向 CLI 下沉

传统做法：Skill 维护一份错误码→处理方式的映射表。
更好的做法：**CLI 的错误响应自带处理建议**。

### 当前状态

```json
{"error_code": "INSUFFICIENT_CREDIT", "summary": "Insufficient credit quota"}
```

Agent 需要 Skill 告诉它"额度不够应该引导用户到 billing 页"。

### 目标状态（CLI 优化方向）

```json
{
  "error_code": "INSUFFICIENT_CREDIT",
  "summary": "Insufficient credit quota",
  "action": {
    "type": "redirect",
    "url": "https://www.noxinfluencer.com/skills/usage-billing",
    "message": "Subscribe or recharge to continue"
  }
}
```

Agent 直接从 CLI 响应获取下一步操作，Skill 不需要维护错误处理逻辑。

### 过渡策略

在 CLI 尚未完全自带 action 指引之前，Skill 中保留最小的错误→业务动作映射（只保留 CLI 无法自述的部分，如 URL）。CLI 升级后逐步删除。

---

## 第五原则：Agent-First 交互模式

Skill 指导的是 Agent 的行为，不是用户的操作。

| 旧模式（教用户操作） | 新模式（Agent 代理执行） |
|-------------------|---------------------|
| "运行 `noxinfluencer quota` 查看余额" | Agent 自己跑 quota，告诉用户"你还有 X credits" |
| "使用 `noxinfluencer auth --key <key>` 配置" | "把你的 API Key 贴给我，我来帮你配好" |
| "访问 /skills/dashboard 获取 Key" | 这类**需要用户在浏览器操作**的步骤才给 URL |

**判断标准**：如果 Agent 可以代替用户执行，就不要告诉用户命令。只有需要用户**亲自在浏览器中操作**的事情（注册、充值、查看 dashboard）才给出 URL。

---

## 第六原则：多语言 URL 路由

NoxInfluencer 有中英文站点，域名不同：

| 语言 | 域名 |
|------|------|
| 中文 | cn.noxinfluencer.com |
| 其他 | www.noxinfluencer.com |

Skill 应指导 Agent 根据用户语言选择正确的域名。这个信息是稳定的、高频的（每次需要给 URL 时都用），且 CLI 不知道用户在用什么语言——所以属于 Skill 的职责。

---

## 各 Skill 职责边界

基于以上原则，每个 Skill 的核心价值：

### discovering-creators
- **保留**：澄清策略（何时追问 vs 直接搜）、shortlist 呈现规则（3-5 人、可比较表格）、handoff 到 analyzing-creator 的触发条件、平台数据差异（避免无效调用）
- **删除**：搜索参数表（用 `schema`）、命令语法示例（用 `--help`）

### analyzing-creator
- **保留**：verdict 判定框架（4 级结论）、due-diligence 维度权重和启发式规则、escalation 策略（混合证据怎么判）、平台数据差异
- **删除**：命令参数说明

### managing-account
- **保留**：onboarding 决策树（根据 doctor 结果走不同路径）、Key URLs 表（注册/dashboard/billing）、Agent-first 交互原则、语言→域名路由
- **删除**：CLI 命令语法、错误码解释（CLI 自带）、global options 列表

### retrieving-contacts
- **保留**：email_quality 解读（1=高质量、2=普通、0=无）、"不主动推荐 outreach"的行为边界
- **删除**：命令语法

### tracking-performance
- **保留**：项目消歧规则（重名时怎么选）、operational-only 边界（不做性能判断）、handoff 到 managing-account 的条件
- **删除**：命令参数表（用 `schema`）、monitor_days 校验规则（CLI/API 负责）

---

## CLI 优化方向（配合 Skill 瘦身）

为了让 Skill 更薄，CLI 侧可以增强：

| 能力 | 当前状态 | 目标 |
|------|---------|------|
| 错误响应带 action URL | 无 | `"action": {"url": "...", "message": "..."}` |
| quota 输出带可读说明 | 只有数字 | "你还可以做约 X 次搜索" |
| 搜索结果带 shortlist 格式 | 只有 JSON | `--plain` 输出可读表格 |
| 平台数据可用性查询 | 无 | `schema --platform youtube --availability` |

这些是渐进式优化，不阻塞当前 Skill 重构。CLI 每实现一项，对应的 Skill 内容就可以进一步精简。

---

## 决策流程图

当你不确定一条信息该放 Skill 还是 CLI 时：

```
这条信息 CLI 能自述吗？（schema / --help / doctor / 响应字段）
├── 是 → 不放 Skill，让 Agent 运行时获取
└── 否 →
    这条信息稳定吗？（不随 CLI 版本变化）
    ├── 否 → 不放 Skill，推动 CLI 增强自述能力
    └── 是 →
        这条信息高频吗？（大多数交互都需要）
        ├── 否 → 不放 Skill，Agent 按需从其他来源获取
        └── 是 →
            这条信息能减少 CLI 调用吗？（避免无效请求）
            ├── 否 → 考虑放，但优先级低
            └── 是 → 放 Skill ✓
```

---

## 迭代记录

| 日期 | 变更 | 驱动因素 |
|------|------|---------|
| 2026-03-26 | 初版：建立 6 条原则 + 决策流程图 | managing-account eval 暴露的 Skill 臃肿问题 |
| 2026-03-26 | Skill 瘦身：删除 error-codes.md、command-reference.md；精简 search-filters.md；5 个 SKILL.md 重写去除命令语法和错误处理 | CLI 实现 --lang + error action 字段后，Skill 重复信息可删除 |

后续每次 Skill/CLI 优化时更新本文档。
