# NoxInfluencer Plugin

面向 Codex 和 Claude Code 的 NoxInfluencer MCP 插件。插件源码只维护在 `plugins/noxinfluencer/`，仓库外层的独立 Skill 不参与本插件的开发、校验或安装。WorkBuddy 本轮暂不适配。

## 用户安装

下列命令在本次修改合并并发布到 GitHub 仓库默认分支后生效；当前分支的本地修改不会被远程安装命令读取。

Codex：

```bash
npx plugins add https://github.com/NoxInfluencer/skills --target codex
```

Claude Code：

```bash
npx plugins add https://github.com/NoxInfluencer/skills --target claude-code
```

安装器使用 npm 默认版本，不指定版本号。首次运行可按 npx 提示下载安装器，然后按安装器提示选择安装范围。用户需要可用的 Node.js/npm、Git 和对应宿主。安装后新建会话，再按宿主提示连接 MCP 并授权。

这两条命令从 GitHub 分发插件；官方目录上架需要另行提交审核。插件业务使用远程 MCP，不通过 NoxInfluencer CLI 执行。

## 目录和安装路由

```text
NoxInfluencer/skills/
├── .plugin/marketplace.json             # 通用安装器索引，只列新插件
├── .agents/plugins/marketplace.json     # 保留既有 Codex 原生入口
└── plugins/noxinfluencer/
    ├── .plugin/plugin.json             # 通用元数据
    ├── .codex-plugin/plugin.json       # Codex 配置和展示信息
    ├── .mcp.json                       # 共享 MCP 连接配置
    ├── skills/mcp/.gitkeep             # 待 MCP 团队交付
    ├── assets/.gitkeep                 # 待补正式品牌图标
    ├── scripts/                        # 开发校验、可选打包、本地开发安装
    ├── tests/
    ├── doc/
    ├── package.json
    ├── package-lock.json
    ├── CONTRIBUTING.md
    ├── README.md
    └── .gitignore
```

仓库根 `.plugin/marketplace.json` 的 `source: "./plugins/noxinfluencer"` 定位插件。插件内 `.plugin/plugin.json` 描述插件本身，不能代替仓库索引。根目录不要再添加优先级更高的 `marketplace.json`。

已核对的 npm `plugins` 1.3.5 先查根 `marketplace.json`，再查 `.plugin/marketplace.json`，然后才是其他平台索引；发现有效索引后不合并其他索引。本仓库由 `.plugin/marketplace.json` 统一定位新版插件。版本后续升级时需重新验证。

Codex 使用显式 `.codex-plugin/plugin.json`，避免安装器生成默认分类和展示信息。Claude Code 安装时，安装器在临时安装目录把 `.plugin/` 转换为 `.claude-plugin/`；源码不维护第三份 Manifest，也不复制三份 Skill。

## MCP Skill 交付

目前 `skills/mcp/` 仅用 `.gitkeep` 保留目录，不注册虚假的 Skill。MCP 团队测试通过后将完整内容直接放入：

```text
skills/mcp/
├── SKILL.md
├── references/       # 按实际需要交付
└── scripts/          # 按实际需要交付
```

`SKILL.md` 的业务名称可以继续使用 `noxinfluencer`；文件夹按约定叫 `mcp`。内部指令需适用于支持的宿主，安装器只转换插件包装配置，不会改写 Markdown 中的平台命令。不再自动生成 Codex 运行时标记，也不从外层 Skill 同步。

## 开发和校验

在插件目录执行：

```bash
npm ci
npm run verify
npm test
```

`npm install` 或 `npm ci` 只安装开发依赖，不注册插件、不启动 OAuth，也不修改用户宿主配置。没有生命周期安装脚本。校验本身不要求安装依赖；可直接用 Node.js 20 以上执行 `scripts/verify-plugin.mjs` 和 `scripts/validate-marketplace.mjs`。

日常校验允许 MCP 目录暂时为空，检测不完整交付、Manifest 元数据漂移、MCP OAuth Resource 不一致，以及通用和 Codex 索引是否解析到本插件。不会要求交付内容包含特定宿主的运行时文件。

Windows 下保留 Codex 原生本地开发入口，供开发者主动调用：

```bash
npm run plugin:local:status
npm run plugin:local:bootstrap
npm run plugin:local:update
```

`status` 仅读取信息。`bootstrap` 注册当前本地仓库并安装；`update` 同时更新两份 Manifest 的开发版本，再重新安装。它们不依赖外部 `plugin-creator` Python 脚本。可用 `NOX_CODEX_PLUGIN_CLI` 指定控制 CLI；正式发布前恢复确定版本。

## 可选 ZIP

正常 GitHub 安装不需要构建产物。需要开发包时执行：

```bash
npm run release:package:dev
npm run release:package:dev -- --target claude-code
```

ZIP 和 SHA-256 清单位于忽略提交的 `dist/`。只打包 Manifest、MCP 配置、插件内 Skill 和资源；Claude ZIP 的原生 Manifest 在打包时生成，不回写源码。开发包可以没有业务 Skill，不能作为完整业务验收结果。

完整交付后运行 `npm run verify:release` 和 `npm run release:package`；正式检查会拦截未交付 Skill、缺失图标或仍使用测试 MCP 的配置。

## 上线前待交付

- MCP 团队提供 `skills/mcp/` 完整内容，并完成 Codex、Claude Code 的业务及 OAuth 联调。
- 提供正式方形品牌图标，放到 `assets/icon.svg`，将 Codex `interface.logo`、`interface.composerIcon` 配为 `./assets/icon.svg`。当前不编造品牌素材。
- 确定公网生产 MCP 地址，同步更新 `.mcp.json` 与校验脚本中允许的环境地址。当前保留 `https://skilltest.noxinfluencer.com/mcp` 测试配置。
- 官方上架时准备真实的隐私政策、服务条款、支持链接与审核材料，补入对应展示字段。图标规范参见 [OpenAI 官方提交文档](https://developers.openai.com/plugins/deploy/submission)。
- 使用确定版本，运行校验后合并到 GitHub 默认分支；验证两条真实远程安装命令，再进行官方目录提交。

已确认 `plugins` 1.3.5 在已有个人 Codex Marketplace 时可能保留原名称、却写入 `@plugins-cli` 启用键；还会使用默认用户目录，忽略自定义 `CODEX_HOME`。这属于安装器兼容性限制，本插件没有加入自动修补用户配置的逻辑。当前只验证安装发现和转换，最终宿主加载与 OAuth 仍需联调。
