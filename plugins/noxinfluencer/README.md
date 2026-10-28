# NoxInfluencer Plugin

面向 Codex、Claude Code 和 WorkBuddy 的 NoxInfluencer MCP 插件。插件入口、MCP 运行规则和开发工具维护在 `plugins/noxinfluencer/`；公共业务内容只在外层 `skills/` 维护，通过显式脚本同步为插件内快照。WorkBuddy 使用独立的连接器提交包，尚待客户端联调和官方审核。

## 用户安装

本插件的安装元数据、Skill、授权指引和开发工具全部位于当前目录。仓库根目录与 `main` 保持一致，不再提供新版插件的根级安装索引，因此不能把仓库根 URL 当作新版插件的远程安装入口。

Codex 本地联调使用下文的 `plugin:local:bootstrap`；Codex／Claude Code、ChatGPT 和 WorkBuddy 的 ZIP 分发使用各自的打包命令。若后续需要远程安装，应将本目录作为独立发布根，另行验证远程安装入口。这里不自动发布、安装或修改用户配置。

安装后新建会话，再按当前宿主的 MCP 连接入口授权。插件业务仅使用远程 MCP；Codex 专用 OAuth 辅助脚本不会在 Claude Code 或 WorkBuddy 中运行。

## 目录和安装路由

```text
plugins/noxinfluencer/
    ├── .plugin/marketplace.json        # 插件内通用索引，source 为 ./
    ├── .agents/plugins/marketplace.json # 插件内 Codex 索引，path 为 ./
    ├── .plugin/plugin.json             # 通用元数据
    ├── .codex-plugin/plugin.json       # Codex 配置和展示信息
    ├── .mcp.json                       # 共享 MCP 连接配置
    ├── skills/mcp/SKILL.md             # noxinfluencer-mcp：MCP 主执行入口
    ├── skills/noxinfluencer/           # 产品业务入口和生成的上游快照
    ├── skills/influencer-marketing-manager/ # 营销经理入口和生成的上游快照
    ├── evals/mcp/                     # 14 条插件专属评测及校验器
    ├── ci/                            # 原工作流模板，不在仓库根启用
    ├── assets/icon.png                 # 正式品牌图标，128×128 PNG
    ├── workbuddy/                      # WorkBuddy 元信息和 Skill 平台字段
    ├── scripts/                        # 开发校验、可选打包、本地开发安装
    ├── tests/
    ├── doc/
    ├── package.json
    ├── package-lock.json
    ├── CONTRIBUTING.md
    ├── README.md
    └── .gitignore
```

本目录 `.plugin/marketplace.json` 的 `source: "./"` 定位插件自身；`.agents/plugins/marketplace.json` 同样使用 `./`。本地开发注册的是插件目录，而非仓库根目录。

不要在本目录添加会遮蔽 `.plugin/marketplace.json` 的 `marketplace.json`。目录外的安装索引不参与本插件校验或打包；外层两个 Skill 仅作为显式同步和一致性检查的只读来源，安装和打包使用插件内快照。

Codex 使用显式 `.codex-plugin/plugin.json`，避免安装器生成默认分类和展示信息。Claude Code 安装时，安装器在临时安装目录把 `.plugin/` 转换为 `.claude-plugin/`；源码不维护第三份 Manifest，也不复制三份 Skill。

## MCP Skill 交付

本分支此前编写的 MCP-only Skill 已整理至以下目录，包含运行路由、OAuth、错误处理、Browser Handoff、业务引用及 Windows Codex 授权辅助脚本：

```text
skills/
├── mcp/
│   ├── SKILL.md       # name: noxinfluencer-mcp
│   ├── references/   # MCP 路由、OAuth、Handoff 与当前业务指引
│   └── scripts/      # Codex Windows 授权辅助
├── noxinfluencer/
│   ├── SKILL.md      # 手工维护：MCP 执行约束及上游引用
│   ├── upstream.md   # 外层 SKILL.md 的完整原文
│   └── references/   # 上游资源，排除 cli-response-format.md
└── influencer-marketing-manager/
    ├── SKILL.md      # 手工维护：营销职责、MCP 执行约束及上游引用
    ├── upstream.md   # 外层 SKILL.md 的完整原文
    └── references/   # 上游资源原样保留
```

MCP 主执行 Skill 的名称为 `noxinfluencer-mcp`，目录固定为 `mcp`；远程 provider 仍名为 `noxinfluencer`。Skill 直接使用 MCP，不检查外层 CLI Skill，不生成运行时标记，不切换到 NoxInfluencer CLI。Codex 专用授权命令在指令中明确限定宿主；其他宿主使用自身授权入口。

两个公共 Skill 的薄入口先声明插件执行规则，再引用 `upstream.md` 和所需参考文档。业务原文不做段落过滤，仍可能含 CLI 命令或元数据；这些内容不承担插件安装、认证或执行职责。薄入口明确忽略 CLI／CLI Connector、参数、安装、登录、诊断、CLI 响应格式和浏览器路线；实际 NoxInfluencer 读写统一交给 `noxinfluencer-mcp` 和真实 Tool schema。忽略执行方式不移除业务授权、费用影响、写入副作用或结果核验规则。Manager 可开展策略和文案工作，执行角色使用已批准内容。

三个 Skill 的名称唯一。目录顺序不产生自动优先级；每个公共入口明确引用 `mcp/SKILL.md`，并将其执行约束应用于完整上游文本和所有参考文件。`cli-response-format.md` 不交付，原文中对它的引用明确跳过。Manager 参考文档中的业务授权和证据章节通过薄入口链接到 `upstream.md` 的相应章节。

## 同步公共业务 Skill

在仓库根目录（`D:\KOL\skills`）执行，无需进入插件目录：

```bash
npm run skills-plugin
npm run skills-plugin:check
```

根目录的 npm 命令直接调用插件内同步脚本，不需要手动执行 Node 命令，也无需安装 npm 依赖。脚本按自身位置定位路径，不依赖当前工作目录。

同步从外层 `skills/noxinfluencer/` 和 `skills/influencer-marketing-manager/` 读取全部文件，只做两项处理：根 `SKILL.md` 改名为 `upstream.md`，任何名为 `cli-response-format.md` 的文件不复制。其余文件保留相对路径和原始字节，包括未来新增的脚本或资源；不执行其中的脚本。外层文件、插件薄入口 `SKILL.md` 和 `skills/mcp/` 不被改写。

**两个目标目录中，除根 `SKILL.md` 外的内容均为生成快照。** 同步会更新新增和修改文件、删除已从上游移除或被排除的文件；不要手工维护快照。脚本先检查两个来源和目标，再执行写入，拒绝符号链接、目录联接和保留路径冲突。

`skills-plugin:check` 只读，快照过期时返回非零状态；插件内的 `npm run verify` 已包含同一检查。更新外层内容后显式同步，并将外层改动与插件快照一起提交，GitHub 安装和各平台 ZIP 使用同一套已提交快照。安装及打包不自动读取外层来源或触发同步，不添加安装生命周期钩子；独立发布插件目录时应先在完整仓库中同步。

`skills/` 下可放多个并列 Skill，每个目录有自己的 `SKILL.md`。在 ChatGPT／Codex 中，宿主先提供各 Skill 的名称与描述，匹配请求或被明确调用时才加载对应正文；不会因为同属一个插件就自动读取全部 Skill。公共授权规则由当前入口明确引用 `references/mcp-runtime.md`，以后增加其他业务 Skill 时也应明确引用所需的公共规则，不能依赖另一个 Skill 自动加载。参见 [OpenAI 官方 Skill 激活说明](https://developers.openai.com/plugins/concepts/skills)。

插件评测位于 `evals/mcp/`，保留原 MCP 用例编号 51–64。结构校验不能证明业务和 OAuth 联调已通过；测试地址、实时工具目录和各宿主授权仍需实际验证。

## 开发和校验

在插件目录执行：

```bash
npm ci
npm run skills:sync
npm run verify
npm test
npm run verify:evals
npm run verify:boundary
```

`npm install` 或 `npm ci` 只安装开发依赖，不注册插件、不启动 OAuth，也不修改用户宿主配置。没有生命周期安装脚本。完整 `verify` 包含 WorkBuddy 配置检查，需要开发依赖；基础 Manifest 和索引检查仍可直接用 Node.js 20 以上执行 `scripts/verify-plugin.mjs` 和 `scripts/validate-marketplace.mjs`。

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
node scripts/package-plugin.mjs --dev --target claude-code
```

ZIP 和 SHA-256 清单位于忽略提交的 `dist/`。只打包 Manifest、MCP 配置、插件内 Skill 和资源；Claude ZIP 的原生 Manifest 在打包时生成，不回写源码。开发包可以没有业务 Skill，不能作为完整业务验收结果。

完整交付后，通用发布包可以运行 `npm run verify:release` 和 `npm run release:package`。ChatGPT 官方目录提交使用下方专用命令，增加公开提交字段检查并排除通用安装器元数据。

## ChatGPT 官方目录 ZIP

要求 Node.js 20 以上。从仓库根目录执行以下命令；首次使用时执行 `npm ci` 安装锁定的开发依赖，之后使用一个命令打包：

```powershell
cd plugins/noxinfluencer
npm ci
npm run package:chatgpt
```

只检查、不生成文件：

```powershell
npm run verify:chatgpt
```

也可以从仓库根目录执行 `npm --prefix plugins/noxinfluencer run package:chatgpt`。脚本按自身位置定位插件，不依赖调用者的工作目录。

检查成功后，按当前版本 `0.1.0` 生成：

```text
dist/
├── noxinfluencer-chatgpt-0.1.0.zip
├── noxinfluencer-chatgpt-0.1.0.zip.sha256
└── noxinfluencer-chatgpt-0.1.0.zip.files.json
```

只将 `.zip` 上传到 OpenAI 插件后台的远程 MCP 提交流程（With MCP）。`.sha256` 是整个 ZIP 的校验值；`.files.json` 是包内路径、字节大小及逐文件校验值，不进入 ZIP。

ZIP 的根目录直接包含：

```text
.codex-plugin/plugin.json
.mcp.json
assets/icon.png                 # 以及 assets/ 内其他资源
skills/mcp/SKILL.md             # 以及插件内全部 Skill 的配套资源
```

脚本采用固定收集范围：只读取 `.codex-plugin/plugin.json`、`.mcp.json`、`skills/`、`assets/`。不加入 `.plugin/`、Marketplace 索引、根级开发脚本、测试、文档、package 文件或依赖目录。忽略 `.gitkeep` 等占位文件；Skill 内实际引用的 `references/` 和 `scripts/` 会完整保留。源文件不会被改写，重复打包相同内容可得到相同的 ZIP 校验值。

打包前集中报告以下本地问题，检查失败返回非零退出码，不创建新的 ZIP，也不覆盖此前的产物：

- 插件名称、正式版本、必填展示文本、公开提交的长度限制及官方分类；
- 官网、支持、隐私、条款四个 HTTPS 链接的格式；
- 能力标签、示例提问、品牌色格式和对比度；
- 图标路径、格式识别、文件大小和图像尺寸；
- `skills/mcp/SKILL.md` 已交付、Skill 直接位于 `skills/` 下、有效 YAML、必填名称／描述及非空正文；
- 普通 Markdown 文件链接引用的本地文件是否包含在 ZIP 内；
- 生产 MCP URL 的格式，拒绝已知测试、示例和本地地址；
- 文件路径、目录联接／符号链接、危险文件名、重复路径及官方 ZIP 体积／数量限制；
- Manifest 内的固定凭据、认证请求头、app 引用及生命周期钩子。

脚本不提供绕过检查的 `--force` 或开发模式。当前 Skill 已迁入，正式 URL 和部分展示字段仍未交付，命令会如实列出缺项；不会自动从外部仓库补 Skill，也不会替你编造正式文案或生产地址。

这些是离线打包检查，并不是官方审核通过证明。它不连接 MCP、不发起 OAuth、不上传 ZIP，也不验证网页是否真实可访问、身份认证、域名所有权、服务器工具或图像的完整解码安全性。业务可用性、完整工具扫描、审核用例、演示录像和最终审核仍需在后台完成；可选审核元数据如已写入 Manifest，会原样随包包含。可选 UI 截图还需官方扫描确认有 UI 才能提交。

规则依据：[官方提交流程与字段](https://developers.openai.com/plugins/deploy/submission)、[官方包和资源校验规则](https://developers.openai.com/plugins/deploy/submission-errors)。

## WorkBuddy 连接器 ZIP

复用本插件的 `.mcp.json`、`assets/icon.png` 和唯一的 `skills/` 源码，不新增业务 Skill 副本。平台配置放在：

```text
workbuddy/
├── connector-meta.json   # 中英文名称、介绍、示例、source 和最低客户端版本
└── skill-metadata.json   # 按 Skill 目录补充中英文展示字段，不含业务指令
```

当前文案以已有功能描述和智能营销计划示例为基础，提审前应结合 MCP 实际能力确认。`source` 使用 `noxinfluencer`，全局唯一性须在 WorkBuddy 后台确认。

在插件目录安装开发依赖后执行：

```powershell
npm ci
npm run verify:workbuddy
npm run package:workbuddy
```

从仓库根目录也可运行 `npm --prefix plugins/noxinfluencer run package:workbuddy`。检查成功后生成 `dist/noxinfluencer-workbuddy-0.1.0.zip`、相邻的 `.sha256` 和 `.files.json`，提交时使用 ZIP。包根目录直接包含：

```text
connector-meta.json
mcp.json
icon.png
skills/mcp/SKILL.md
skills/mcp/references/ ...       # 如有，包含实际交付的配套文件
skills/mcp/scripts/ ...
```

打包时从 `.plugin/plugin.json` 读取连接器版本，避免再维护第三份插件版本号；从 `.mcp.json` 读取唯一服务地址，生成 `type: "streamableHttp"` 和 `timeout: 30000` 的 WorkBuddy `mcp.json`，不输出 OpenAI 的 `oauth_resource` 字段。使用 MCP 服务自身的标准 OAuth，`auth_mode` 省略，不配置 CLI 或 Token 表单。最低 WorkBuddy 版本设为 `4.24.0`，与中英文示例字段一致。

Skill 正文和配套资源保留。输出包内的 frontmatter 仅补充缺失的 WorkBuddy 字段：中英文说明／展示名称来自 `workbuddy/skill-metadata.json` 的对应目录项，作者／版本默认来自通用 Manifest；已交付字段不会被覆盖。额外 Skill 若没有中英文说明，应按目录补充配置，不能用 MCP Skill 的说明冒充。源码 `skills/mcp/` 保持不变，也不会从外层 Skill 或网络下载内容。

正式命令要求公网生产 MCP 地址和已交付的 `skills/mcp/SKILL.md`。虽然 WorkBuddy 对 MCP 连接器允许不带 Skill，本项目的正式包仍要求完整交付。当前 Skill 已迁入，测试地址仍会阻止生成正式包；校验失败保留原有 ZIP。开发阶段可执行：

```powershell
npm run verify:workbuddy:dev
npm run package:workbuddy:dev
```

开发命令只允许测试地址和暂时完全为空的 MCP Skill，产物明确命名为 `noxinfluencer-workbuddy-0.1.0-dev.zip`，不能上传上架。部分交付、错误 YAML、断开的 Markdown 文件链接、错误平台字段、凭据文件和符号链接等仍会失败。

收集范围只包含生成的连接器元信息、MCP 配置、品牌图标和插件内 Skill；不加入其他平台 Manifest、开发文档、测试、package 文件、依赖或平台补充配置原文件。文件数量／大小限制是本地保护措施，不表示官方公布限制。相同输入产生相同 ZIP 和文件校验清单。

这是离线配置适配和打包，不证明 MCP/OAuth 可用，也不会登录、安装或上传。MCP 团队仍需验证 WorkBuddy 的发现、动态注册、PKCE、续期和回调兼容性；按当前 source，首选回调为 `workbuddy://workbuddy/mcp/connector%3Anoxinfluencer/oauth/callback`，并检查官方约定的本机回环回退。公司信息、发布权限、审核资料和市场唯一标识在官方后台处理，不写入包中的个人凭证。

官方依据：[连接器格式、认证与提交](https://open.workbuddy.cn/docs/connector)、[Skill 格式](https://open.workbuddy.cn/docs/skill)。

## 上线前待交付

- MCP 团队核对已迁入的 `skills/mcp/` 与实时 Tool 契约，并完成 Codex、Claude Code、WorkBuddy 的业务及 OAuth 联调。
- 确定公网生产 MCP 地址后更新 `.mcp.json`；当前保留 `https://skilltest.noxinfluencer.com/mcp` 测试配置。校验不再固定要求该测试地址，正式打包会拒绝测试地址。
- 官方上架时准备真实的隐私政策、服务条款、支持链接与审核材料，补入对应展示字段。图标规范参见 [OpenAI 官方提交文档](https://developers.openai.com/plugins/deploy/submission)。
- 使用确定版本，运行校验；远程分发时以本插件目录作为发布根并验证实际安装入口，再进行官方目录提交。

已确认 `plugins` 1.3.5 在已有个人 Codex Marketplace 时可能保留原名称、却写入 `@plugins-cli` 启用键；还会使用默认用户目录，忽略自定义 `CODEX_HOME`。这属于安装器兼容性限制，本插件没有加入自动修补用户配置的逻辑。当前只验证安装发现和转换，最终宿主加载与 OAuth 仍需联调。
