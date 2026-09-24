# NoxInfluencer Codex Plugin

这是 NoxInfluencer 面向 Codex 的独立插件。插件通过远程 MCP Server 执行业务，插件目录内的 Skill、Manifest、MCP 配置和脚本共同构成完整源码。

插件以 GitHub Marketplace 为主要分发方式。用户安装时由 Codex 拉取 GitHub 仓库并缓存插件，不需要开发者预先生成 ZIP，也不需要用户手工下载发布包。

## 从 GitHub 安装

添加 NoxInfluencer GitHub Marketplace：

```powershell
codex plugin marketplace add NoxInfluencer/skills
```

安装插件：

```powershell
codex plugin add noxinfluencer@noxinfluencer-codex
```

安装完成后新建 Codex 会话，使新的 Skill 和 MCP 配置生效。首次使用需要连接 NoxInfluencer 时，按 Codex 的授权提示完成 OAuth。

如需固定到某个发布 Tag，可在首次添加 Marketplace 时指定：

```powershell
codex plugin marketplace add NoxInfluencer/skills --ref v0.1.0
```

## 从 GitHub 更新

刷新 Marketplace，并重新安装当前插件版本：

```powershell
codex plugin marketplace upgrade noxinfluencer-codex
codex plugin add noxinfluencer@noxinfluencer-codex
```

更新后新建 Codex 会话。

## 工程结构

```text
NoxInfluencer/skills/
├─ .agents/
│  └─ plugins/
│     └─ marketplace.json          # Codex GitHub Marketplace 入口
└─ plugins/
   └─ noxinfluencer/
      ├─ .codex-plugin/
      │  └─ plugin.json
      ├─ .mcp.json
      ├─ skills/
      │  └─ noxinfluencer/         # Plugin Skill 唯一源码
      ├─ scripts/
      ├─ package.json
      └─ README.md
```

`plugins/noxinfluencer/skills/noxinfluencer/` 是插件自己的 Skill 源码。插件开发、校验和安装流程不读取、比较或覆盖仓库中的独立 Skill 目录。

仓库级 `.agents/plugins/marketplace.json` 将 `noxinfluencer@noxinfluencer-codex` 映射到 `./plugins/noxinfluencer`。Codex 从 GitHub 获取 Marketplace 后，直接安装该目录。Codex Marketplace 使用独立名称，以免与仓库现有的 Claude 兼容 Marketplace 冲突。

## 开发校验

安装构建依赖：

```powershell
npm ci
```

运行完整的只读校验：

```powershell
npm run verify
```

该命令检查：

- 插件本地 Skill 及 `codex-plugin-runtime.md` 运行时标记；
- `.codex-plugin/plugin.json` 与 `.mcp.json`；
- 仓库 Marketplace 名称、插件条目、安装策略及相对路径；
- Marketplace 条目是否准确解析到本插件目录。

如需刷新插件本地运行时标记：

```powershell
npm run plugin:sync-skill
```

该命令只操作插件自己的 Skill，不会从其他 Skill 目录复制文件。

## 本地开发安装

本地开发也直接使用仓库 Marketplace，不再生成或解压 ZIP。

首次准备 Python 校验依赖并注册本地仓库 Marketplace：

```powershell
npm run plugin:local:deps
npm run plugin:local:bootstrap
```

`plugin:local:bootstrap` 会：

1. 校验插件和仓库 Marketplace；
2. 执行 `codex plugin marketplace add <当前仓库目录>`；
3. 安装 `noxinfluencer@noxinfluencer-codex`。

插件已注册后，普通安装执行：

```powershell
npm run plugin:local:install
```

修改插件后更新本地缓存：

```powershell
npm run plugin:local:update
```

更新命令按照 Codex 本地插件开发约定，为源码 Manifest 写入新的 `+codex.<cachebuster>`，重新校验并安装。开发完成准备正式发布时，应把版本改为确定的发布版本，例如 `0.1.1`，并通过 Git Tag 固定发布内容。

查看本地源码与 Marketplace 信息：

```powershell
npm run plugin:local:status
```

本地脚本优先使用 Codex 随附的 Python 和控制 CLI。需要覆盖时可设置：

```powershell
$env:NOX_CODEX_PLUGIN_PYTHON = 'C:\path\to\python.exe'
$env:NOX_CODEX_PLUGIN_CLI = 'C:\path\to\codex.exe'
```

## 可选 ZIP 发布物

GitHub Marketplace 安装不需要 ZIP。仅在需要离线交付、GitHub Release 附件或固定文件清单审计时生成：

```powershell
npm run release:package
```

生成带本地 cachebuster 的开发 ZIP：

```powershell
npm run release:package:dev
```

为了兼容旧自动化，`npm run package` 和 `npm run package:dev` 仍分别作为以上两个命令的别名。ZIP 产物位于 `dist/`，但不参与 GitHub Marketplace 的正常安装和更新。

## 远程 MCP

Plugin 通过 `.mcp.json` 连接 NoxInfluencer 远程 MCP。MCP Server 独立部署在 NoxInfluencer 云端，不打包进 GitHub 仓库安装缓存之外的本地服务，也不在 Plugin 中保存账号密码、OAuth Token、API Key 或业务数据。

当前测试构建连接 `https://skilltest.noxinfluencer.com/mcp`，仅供能够解析并访问该内网域名的 Codex Desktop 联调。该地址使用 HTTPS，并作为测试环境固定的 MCP URL 与 OAuth Resource。

## CI 与发布

GitHub Actions 只执行源码和 Marketplace 校验：

```powershell
npm ci
npm run verify
```

CI 不再要求生成 ZIP。正式发布建议：

1. 更新 `.codex-plugin/plugin.json` 的确定版本；
2. 运行 `npm run verify`；
3. 提交并创建对应 Git Tag；
4. 用户通过 GitHub Marketplace 安装或升级该版本。
