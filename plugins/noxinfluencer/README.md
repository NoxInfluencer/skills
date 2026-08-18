# NoxInfluencer Codex Plugin

NoxInfluencer 面向 Codex 的正式插件工程。Plugin 负责装配 NoxInfluencer Skill、远程 MCP Server 连接配置及插件展示资源；真实业务由 NoxInfluencer 在线服务执行。

当前版本按照可上线产品的工程结构建设，以“查看智能营销计划任务列表”作为首个 MVP 业务切片。Demo 只代表当前能力范围较小，不代表采用临时配置或一次性实现。

## Monorepo 工程结构

```text
NoxInfluencer/skills
├─ skills/
│  └─ noxinfluencer/                 # Standalone Skill 唯一源码
└─ plugins/
   └─ noxinfluencer/                 # 本 Plugin 工程根目录
      ├─ .codex-plugin/
      │  └─ plugin.json
      ├─ skills/
      │  └─ noxinfluencer/           # 自动生成并提交的 Plugin 内置副本
      ├─ scripts/
      │  ├─ plugin-skill-sync.mjs
      │  ├─ sync-plugin-skill.mjs
      │  └─ package-plugin.mjs
      ├─ .mcp.json
      ├─ package.json
      └─ README.md
```

## 开发约定

- `plugin.json` 中的 `name` 必须与插件目录名保持一致。
- Monorepo 根目录的 `skills/noxinfluencer` 是 NoxInfluencer Skill 的唯一源码。
- Plugin 内的 `skills/noxinfluencer` 是生成副本，不允许手工编辑。
- 生成副本必须等于根 Skill 加上 `references/codex-plugin-runtime.md`；打包会强制检查逐文件内容，不允许漂移。
- `npm run package` 从已经验证同步的 Plugin 内置副本生成安装包。
- `.mcp.json` 是插件的正式组成部分；不同环境通过发布流程生成对应版本，不在用户安装后动态修改。
- 不在 Plugin 中保存账号密码、OAuth Token、API Key 或业务数据。

完整的日常开发、提交范围、Commit Message 和 CI 门禁见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 同步 Skill

修改根目录 Skill 后，在 `plugins/noxinfluencer` 中执行：

```powershell
npm run plugin:sync-skill
```

该命令从以下固定位置读取唯一源码：

```text
../../skills/noxinfluencer
```

然后完整替换以下生成目录，并注入 Codex Plugin 运行标记：

```text
skills/noxinfluencer
```

只校验、不修改文件时执行：

```powershell
npm run plugin:verify-sync
```

校验会拒绝缺失文件、额外文件、内容变化、符号链接和疑似密钥。打包脚本内部也会执行同一校验，因此直接调用 `package-plugin.mjs` 不能绕过防漂移规则。

`NOX_PLUGIN_SKILL_SOURCE` 仅用于迁移或隔离测试时临时覆盖 Skill 源目录；正常 Monorepo 开发不得设置它。

## 远程 MCP

Plugin 通过根目录的 `.mcp.json` 连接 NoxInfluencer 远程 MCP：

```text
https://skillhuidu.noxinfluencer.com/codex-plugin/mcp
```

该地址作为 MVP 的公开 MCP 端点契约。MCP Server 独立部署在 NoxInfluencer 云端，不打包进 Plugin；正式联调前需要完成该端点、OAuth Protected Resource Metadata 和 Tool 的部署。

## 打包

安装构建依赖：

```powershell
npm install
```

生成插件发布包：

```powershell
npm run package
```

正式打包要求整个 GitHub Monorepo 工作区干净，并使用已经提交的确定版本。开发 `mcp` 分支且暂不提交时，使用：

```powershell
npm run package:dev
```

开发模式只允许 GitHub Monorepo 的本地 `mcp` 分支，可以包含未提交修改。它不会修改源 `.codex-plugin/plugin.json`，只在临时 staging 中为版本增加 `+codex.local-<UTC时间>` cachebuster，并生成带该版本的本地开发 ZIP。开发包不得作为正式发布物。

`npm run plugin:sync-skill` 只在 Plugin 内置副本的 `references/` 中注入 `codex-plugin-runtime.md`；正式和开发打包都会验证并保留该标记。包内 Skill 以该文件作为 MCP 分路的确定标记；根 Skill 和其他独立安装方式没有该文件，因此继续使用原有 CLI 流程。

打包过程会依次完成：

1. 校验 `../../skills/noxinfluencer/SKILL.md` 存在；正式模式要求 Monorepo 工作区干净，开发模式要求本地 `mcp` 分支。
2. 验证 `skills/noxinfluencer/` 与根 Skill 加运行标记逐文件一致。
3. 将验证通过的内置 Skill 复制到临时 staging 的 `skills/noxinfluencer/`。
4. 仅装配 Plugin manifest、MCP 配置、目标 Skill，以及可选的 Plugin 资源。
5. 生成 ZIP 和 SHA-256 校验文件，并自动删除 staging 目录。

发布包只包含：

- `.codex-plugin/**`
- `.mcp.json`
- `skills/noxinfluencer/**`
- `assets/**`（存在时）
- `.app.json`（在 manifest 中声明时）

`.git`、评测文件及 Monorepo 中的其他插件内容都不会进入发布包。产物生成在 `dist/`；若根 Skill 缺失、内置副本发生漂移、正式打包时 Monorepo 有未提交修改、缺少必需配置、包含符号链接或疑似密钥文件，打包会直接失败。

## 发布前检查

- Plugin manifest 通过 Codex 插件校验；
- 根 Skill 与 Plugin 内置副本通过 `npm run plugin:verify-sync`；
- 最终 ZIP 中存在 `skills/noxinfluencer/SKILL.md`；
- MCP URL 指向正确环境并使用 HTTPS；
- Plugin、Skill 与 MCP Tool Schema 的兼容版本已记录；
- 发布物不包含 `.git`、密钥、日志和本地环境文件。

## 本地安装与版本更新

本地开发使用 Codex 默认发现的个人 Marketplace：

```text
C:\Users\<用户名>\.agents\plugins\marketplace.json
```

Marketplace 中的 `noxinfluencer` 条目指向个人插件快照目录：

```text
C:\Users\<用户名>\plugins\noxinfluencer
```

仓库仍是唯一源码。个人插件目录只是由开发包生成的可安装快照，不要直接编辑。脚本会保留源 Manifest 的 `0.1.0` 版本；开发 ZIP 使用 `+codex.local-<UTC时间>`，个人安装快照再由 `plugin-creator` 的更新器收敛为单一 `+codex.<cachebuster>`，然后从个人 Marketplace 重新安装。

首次在一台开发机上配置时执行：

```powershell
npm run plugin:local:deps
npm run plugin:local:bootstrap
```

该命令会：

1. 使用 Codex 内置 `plugin-creator` 创建默认个人 Marketplace 和 `noxinfluencer` 条目；
2. 执行开发打包并把 ZIP 解压到个人插件快照目录；
3. 校验 Plugin Manifest、Skill 和 MCP 配置；
4. 执行 `codex plugin add noxinfluencer@personal` 完成安装。

后续修改 Plugin、Skill 或 `.mcp.json` 后执行：

```powershell
npm run plugin:local:update
```

`plugin:local:install` 和 `plugin:local:update` 使用相同的安全重装流程；前者可用于首次 Marketplace 已经存在但插件尚未安装的情况。脚本先构建和校验新的快照，再替换个人插件目录；替换失败时会恢复旧快照。

查看源码版本、Marketplace 条目和当前快照版本：

```powershell
npm run plugin:local:status
```

本地脚本优先使用 Codex 随附的 Python，并调用 `codex` CLI。开发机使用其他可执行文件时，可以设置任务专用环境变量：

```powershell
$env:NOX_CODEX_PLUGIN_PYTHON = 'C:\path\to\python.exe'
$env:NOX_CODEX_PLUGIN_CLI = 'C:\path\to\codex.exe'
```

`plugin:local:deps` 会把固定版本的 `PyYAML` 安装到已忽略的 `.codex-local/python/`，不修改系统 Python，也不会进入 Plugin 发布包。该依赖用于运行 `plugin-creator` 的正式 Plugin 校验器。

每次安装或更新完成后，都应新建 Codex 会话再验证。已打开的旧会话可能继续使用更新前缓存的 Skill 和 MCP Tool 信息。
