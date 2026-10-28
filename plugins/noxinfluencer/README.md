# NoxInfluencer Plugin

通过 NoxInfluencer MCP 服务查看营销计划、打开业务页面，并获得达人营销策略和产品业务指导。实际可执行的操作以当前连接提供的工具为准。

## GitHub Marketplace 安装

Marketplace 根目录是仓库中的 `plugins/noxinfluencer/`，所有安装索引都位于这个目录内。当前分发分支为 `mcp`；以下远程地址需在相应配置提交并推送后使用。

### Claude Code

在 Claude Code 中添加 GitHub 上的 Marketplace JSON，再安装插件：

```text
/plugin marketplace add https://raw.githubusercontent.com/NoxInfluencer/skills/mcp/plugins/noxinfluencer/.claude-plugin/marketplace.json
/plugin install noxinfluencer@noxinfluencer-plugins
```

索引使用 `git-subdir` 指向同一仓库的 `plugins/noxinfluencer/`，并固定 `ref: mcp`，因此无需把插件或索引复制到仓库根目录。更新发布分支时，应同时调整索引地址中的分支和插件条目的 `source.ref`。

### Codex

先克隆分发分支，再将实际 Marketplace 子目录添加到 Codex：

```bash
git clone --branch mcp --single-branch https://github.com/NoxInfluencer/skills.git noxinfluencer-marketplace
codex plugin marketplace add ./noxinfluencer-marketplace/plugins/noxinfluencer
```

然后在 Codex 的插件目录中选择 **NoxInfluencer Marketplace**，安装 **NoxInfluencer**。如果仓库已经克隆，可直接添加本机对应的 `plugins/noxinfluencer` 目录。索引中的 `source.path: ./` 相对于这个 Marketplace 根目录解析，指向插件自身。

ChatGPT 工作区管理员也可使用 GitHub Marketplace 导入，填写：

| 字段 | 值 |
| --- | --- |
| Source | `https://github.com/NoxInfluencer/skills` |
| Path | `plugins/noxinfluencer` |
| Branch, tag, or commit | `mcp` |

这里保留子目录索引，因此不要把仅含仓库名的 `NoxInfluencer/skills` 当作自动扫描子目录的安装入口。

格式依据：[OpenAI Marketplace 文档](https://developers.openai.com/plugins/build/plugins#marketplace-metadata)、[工作区 GitHub 导入](https://learn.chatgpt.com/docs/enterprise/plugin-management)、[Claude Code Marketplace 文档](https://code.claude.com/docs/en/plugins/marketplace-reference)。

## 使用

安装插件后，在宿主的 MCP 连接入口连接 NoxInfluencer 并完成授权，再新建会话使用。Codex、Claude Code 和 WorkBuddy 使用各自的授权入口；插件不会要求安装 NoxInfluencer CLI 或粘贴 API Key。

可以直接提出任务，例如：

- 查看我的智能营销计划任务。
- 继续查看下一页任务。
- 打开聚星的智能营销计划任务页面。
- 帮我设计达人筛选和合作推进流程。

页面通过服务端返回的 Browser Handoff 地址打开。业务权限和可用能力由当前账户与 MCP 服务决定。

## 插件内容

```text
noxinfluencer/
├── .agents/plugins/marketplace.json  # Codex 安装索引
├── .claude-plugin/marketplace.json  # Claude Code GitHub 安装索引
├── .codex-plugin/plugin.json         # Codex 插件配置
├── .plugin/                         # 通用安装器配置和索引
├── .mcp.json                        # 远程 MCP 服务配置
├── assets/icon.png                  # 插件图标
├── skills/
│   ├── mcp/                         # MCP 执行、授权和页面交接规则
│   ├── noxinfluencer/               # 产品业务入口与参考资料
│   └── influencer-marketing-manager/ # 营销策略、合作流程和 SOP
└── README.md
```

两个业务 Skill 的 `SKILL.md` 是插件入口，`upstream.md` 和 `references/` 提供业务指导。其中的 CLI 示例不作为插件执行方式；NoxInfluencer 业务操作统一通过 MCP。MCP Skill 内的 Windows 脚本仅用于 Codex Host 授权，不是 NoxInfluencer CLI。

官网：[NoxInfluencer](https://www.noxinfluencer.com/)
