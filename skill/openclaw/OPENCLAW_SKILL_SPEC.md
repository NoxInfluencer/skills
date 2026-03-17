# OpenClaw Skill 规范（项目内参考版）

> 目的：为本项目后续开发 OpenClaw Skill 提供统一规范入口。
>
> 说明：本文件基于 OpenClaw 官方文档与 `openclaw/openclaw` 仓库公开资料整理，优先保存“如何写、如何放、如何生效、如何校验”这些实际开发必须遵守的规则。
>
> 更新日期：2026-03-16

## 1. 官方来源

以下来源是本文件的依据。后续如果 OpenClaw 行为发生变化，优先以官方文档最新版本为准：

- Skills（系统总览）
  `https://docs.openclaw.ai/tools/skills`
- Creating Skills（创建自定义 Skill）
  `https://docs.openclaw.ai/tools/creating-skills`
- CLI: `openclaw skills`
  `https://docs.openclaw.ai/cli/skills`
- 仓库内置示例：`skill-creator/SKILL.md`
  `https://raw.githubusercontent.com/openclaw/openclaw/main/skills/skill-creator/SKILL.md`

## 2. 本项目的强制约束

在本项目开发 OpenClaw Skill 时，必须遵守以下本地规则：

1. OpenClaw 相关资料统一放在 `skill/openclaw/`。
2. 开发或修改 OpenClaw Skill 前，先阅读本文件。
3. 业务行为、字段命名、命令参数、接口契约必须以本项目现有 CLI / Server / 业务文档为准，不要只照抄 OpenClaw 示例。
4. 如果 OpenClaw 官方规范与本项目现有业务约定冲突：
   - Skill 格式、加载机制、前置元数据规则：以 OpenClaw 官方规范为准。
   - 业务能力、接口字段、命令设计：以本项目代码和文档事实为准。

## 3. OpenClaw 中什么是 Skill

根据官方文档，OpenClaw 的 Skill 是一个目录，目录内至少包含一个 `SKILL.md` 文件。

- `SKILL.md` 负责提供 YAML frontmatter 和 Markdown 指令。
- Skill 目录可以额外包含脚本、资源、参考文件。
- OpenClaw 使用 AgentSkills-compatible 的 Skill 目录格式。

对本项目而言，可以把 OpenClaw Skill 理解为：

- 面向 OpenClaw Agent 的能力说明书
- 约束 Agent 何时调用哪些工具、如何组织参数、如何遵循业务流程
- Skill 文档和业务实现之间的桥接层

## 4. Skill 目录和加载位置

OpenClaw 会从以下位置加载 Skill：

1. Bundled skills（安装自带）
2. `~/.openclaw/skills`
3. `<workspace>/skills`

如果同名 Skill 冲突，优先级是：

1. `<workspace>/skills` 最高
2. `~/.openclaw/skills`
3. bundled skills 最低

另外还可以通过 `~/.openclaw/openclaw.json` 的 `skills.load.extraDirs` 增加额外目录，但它的优先级低于上述三层。

### 对本项目的映射

本项目当前把 OpenClaw 规范参考放在 `skill/openclaw/`，这是项目内文档目录，不是 OpenClaw 运行时默认自动发现目录。

后续如果真正要给 OpenClaw 运行时加载某个 Skill，需要根据实际集成方式把 Skill 目录放到：

- OpenClaw 当前工作区的 `skills/`
- 或 `~/.openclaw/skills`
- 或通过插件方式声明 Skill 目录

## 5. 多 Agent 与共享 Skill

官方文档对多 Agent 的规则是：

- 每个 Agent 的 `<workspace>/skills` 只对该 Agent 生效
- `~/.openclaw/skills` 是同一台机器上多个 Agent 共享的 Skill 位置
- `skills.load.extraDirs` 也可以作为共享 Skill 包目录

对本项目的启示：

- 如果某个 OpenClaw Skill 是项目专用的，优先按工作区 Skill 管理
- 如果是团队/机器级共享能力，再考虑放到 `~/.openclaw/skills`

## 6. 插件与 Skill 的关系

OpenClaw 支持插件自带 Skill。

规则是：

- 插件可以在 `openclaw.plugin.json` 中声明 `skills` 目录
- 这些目录相对插件根目录解析
- 插件启用后，Skill 会参与正常的优先级和 gating 规则
- 可以通过 `metadata.openclaw.requires.config` 和插件配置联动控制是否生效

这意味着如果本项目后续是以 OpenClaw 插件形式接入，而不是单纯复制文档，那么最终的 Skill 目录布局和注册方式需要和插件 manifest 一起设计。

## 7. `SKILL.md` 的最小格式要求

OpenClaw 官方文档要求 `SKILL.md` 至少包含：

- `name`
- `description`

并且文件使用：

- YAML frontmatter
- Markdown 正文

最小骨架如下：

```md
---
name: example_skill
description: Brief description of the skill
---

# Example Skill

Instructions for the agent...
```

### 已知格式限制

根据官方 Skills 文档，本项目开发 OpenClaw Skill 时还要额外注意：

- frontmatter 的 key 需要单行写法
- `metadata` 应该写成单行 JSON 对象
- 可以用 `{baseDir}` 在说明中引用 Skill 目录路径

## 8. `SKILL.md` 支持的额外 frontmatter

官方文档列出的可选字段包括：

- `homepage`
- `user-invocable`
- `disable-model-invocation`
- `command-dispatch`
- `command-tool`
- `command-arg-mode`

### 含义整理

- `homepage`：在 macOS Skills UI 中显示网站链接
- `user-invocable: true|false`：是否暴露为用户 slash command
- `disable-model-invocation: true|false`：是否从模型 prompt 中排除，但仍允许用户调用
- `command-dispatch: tool`：slash command 直接分发给工具，不经过模型
- `command-tool`：和 `command-dispatch: tool` 配合，指定实际调用的工具
- `command-arg-mode: raw`：把原始参数字符串直接传给工具

当使用工具直派发时，OpenClaw 会把参数按类似下面的结构给工具：

- `command`
- `commandName`
- `skillName`

## 9. `metadata.openclaw` 规则

OpenClaw 使用 `metadata.openclaw` 做加载期过滤和扩展控制。

常用字段：

- `always: true`
- `emoji`
- `homepage`
- `os`
- `requires.bins`
- `requires.anyBins`
- `requires.env`
- `requires.config`
- `primaryEnv`
- `install`
- `skillKey`

### 这些字段的实际作用

- `always: true`：强制始终包含，跳过其他 gating
- `emoji`：macOS Skills UI 展示用
- `os`：限制只在指定系统上可用，如 `darwin` / `linux` / `win32`
- `requires.bins`：要求这些二进制都在 PATH 中
- `requires.anyBins`：要求至少有一个二进制存在
- `requires.env`：要求环境变量存在，或可由 config 注入
- `requires.config`：要求 `openclaw.json` 中指定路径为 truthy
- `primaryEnv`：与 `skills.entries.<name>.apiKey` 关联的主环境变量名
- `install`：用于 macOS Skills UI 的安装器定义
- `skillKey`：允许配置项不直接使用 skill 名称作为 key

### sandbox 相关注意事项

官方文档特别说明：

- `requires.bins` 是在 host 上检查的
- 如果 Agent 跑在 sandbox/container 里，容器内也必须有这些命令
- 需要通过 sandbox setupCommand 或自定义镜像预装依赖

因此本项目如果以后开发依赖外部二进制的 OpenClaw Skill，必须同时考虑：

- host 机器上命令是否可用
- sandbox 内命令是否也可用

## 10. `install` 字段的能力范围

官方文档列出了 `install` 可用于描述安装器信息，常见种类包括：

- `brew`
- `node`
- `go`
- `uv`
- `download`

其中 `download` 类还涉及：

- `url`
- `archive`
- `extract`
- `stripComponents`
- `targetDir`

对本项目来说，这一段主要用于：

- 如果某个 OpenClaw Skill 依赖额外 CLI，可以把安装方式写进 Skill 元数据
- 但具体是否真的需要 `install`，必须看我们后续 Skill 是否面向 macOS Skills UI 分发

## 11. `openclaw.json` 中的 Skill 配置

官方文档给出的关键路径是：

- `skills.entries.<skill-key>`
- `skills.load.extraDirs`
- `skills.load.watch`
- `skills.load.watchDebounceMs`
- `skills.install.nodeManager`
- `skills.allowBundled`

### `skills.entries.<skill-key>` 可用字段

- `enabled`
- `apiKey`
- `env`
- `config`

规则整理如下：

- `enabled: false` 可以禁用 Skill
- `env` 只会在进程中缺少该变量时才注入
- `apiKey` 是 `primaryEnv` 的便捷写法，可直接写明文，也可写 SecretRef 对象
- 自定义配置项应该放进 `config`
- 如果 Skill 名带连字符，JSON key 建议显式加引号
- 如果定义了 `metadata.openclaw.skillKey`，则配置 key 应改用这个值

## 12. 环境变量注入生命周期

OpenClaw 在一次 Agent run 开始时会：

1. 读取 Skill metadata
2. 把 `skills.entries.<key>.env` 和 `apiKey` 注入到 `process.env`
3. 基于 eligible skills 构建系统 prompt
4. 在 run 结束后恢复原始环境

这意味着：

- 注入作用域是单次 agent run
- 不是全局 shell 环境持久修改
- Skill 依赖的 secret 不应该直接硬编码进 prompt

## 13. Session snapshot / watcher / refresh

官方文档说明：

- OpenClaw 会在 session 开始时快照 eligible skills
- 同一 session 后续 turn 默认复用这个 skill 列表
- 修改 Skill 或配置后，通常要等到下一次新 session 才生效
- 如果启用了 watcher，`SKILL.md` 变更可以触发中途 refresh，并在下一次 agent turn 生效

相关配置：

```json
{
  "skills": {
    "load": {
      "watch": true,
      "watchDebounceMs": 250
    }
  }
}
```

官方 Creating Skills 页面还提到，开发新 Skill 后可以：

- 让 Agent “refresh skills”
- 或直接重启 gateway

## 14. CLI 自检命令

OpenClaw CLI 提供了 `openclaw skills` 系列命令，用来检查 Skill 是否被识别和满足条件：

```bash
openclaw skills list
openclaw skills list --eligible
openclaw skills info <name>
openclaw skills check
```

这些命令在本项目以后接入 OpenClaw Skill 时非常重要，因为它们可以帮助判断：

- Skill 是否被发现
- 是否因为缺少 bin / env / config 而被判定为 ineligible

## 15. 官方最佳实践

Creating Skills 文档里明确提了几条：

- Be concise：告诉模型要做什么，不要写成冗长 AI 说教
- Safety first：如果 Skill 用到 `bash` 等危险工具，要防止把不可信用户输入直接拼进命令
- Test locally：可以先用本地 agent 命令验证 Skill 是否生效

仓库里的 `skill-creator` 内置 Skill 也强化了这些方向：

- Skill 应该是可复用的模块化能力说明
- 要优先保留真正有用的流程和约束，不要写成历史叙事
- 文档要尽量精炼，减少无效上下文

## 16. 本项目开发 OpenClaw Skill 的落地规则

后续在本项目开发 OpenClaw Skill 时，统一采用下面的做法：

1. 先在 `skill/openclaw/` 阅读本规范和官方来源。
2. 先确认 Skill 是给 OpenClaw runtime 直接加载，还是只是作为项目内设计文档保存。
3. 如果要让 OpenClaw 真正加载，按 OpenClaw 运行时目录规则放置 Skill，不要误以为 `skill/openclaw/` 会被自动发现。
4. Skill 中引用的命令、字段、接口，必须对齐本项目现有 CLI / Server 实现。
5. 如果 Skill 依赖某个环境变量、外部二进制或配置项，必须明确写进 `metadata.openclaw`，并准备好验证方式。
6. 完成后至少做两类验证：
   - 本项目内文档对齐检查
   - OpenClaw 侧 `openclaw skills` 自检 / 本地调用验证

## 17. 推荐的 OpenClaw Skill 起步模板

如果后续要在本项目里新增一个 OpenClaw Skill，建议从这个最小结构开始：

```text
<runtime-workspace>/skills/<skill-name>/
└── SKILL.md
```

最小 `SKILL.md`：

```md
---
name: your_skill_name
description: Brief description of when this skill should be used
---

# Your Skill Name

Describe:
- 触发条件
- 允许使用的工具
- 参数组织方式
- 业务约束
- 失败时如何处理
```

如果后续需要：

- 额外脚本：再加 `scripts/`
- 重参考资料：再加 `references/`
- 安装/环境依赖：补 `metadata.openclaw`

## 18. 本地维护建议

本文件不是官方文档镜像，而是项目内规范参考。维护方式建议如下：

- OpenClaw 版本升级后，复查本文的“加载位置、frontmatter、metadata.openclaw、CLI 自检命令”
- 如果我们开始真的开发 OpenClaw Skill，再把项目级约定补到本目录
- 如果官方文档改动较大，优先更新本文件，再更新项目入口文档
