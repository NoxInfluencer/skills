# NoxInfluencer Plugin 开发规范

开发边界为 `plugins/noxinfluencer/`。插件使用本目录内的 `.plugin/marketplace.json` 和 `.agents/plugins/marketplace.json`，均通过 `./` 定位自身。外层文件必须与 `main` 保持一致，仅保留旧 `plugins/nox-influencer/` 及其根 `.claude-plugin/marketplace.json` 的删除。不要修改、复制或同步外层独立 Skill、评测或 CLI Connector。

## 修改与验证

在插件目录执行：

```bash
npm ci
npm run verify
npm test
npm run verify:evals
npm run verify:boundary
```

`verify` 只读，检查通用与 Codex Manifest、插件内 Skill、MCP 配置和安装索引。两份 Manifest 的共用元数据必须一致，Codex 专用字段只放 `.codex-plugin/plugin.json`。

MCP Skill 唯一交付位置为 `skills/mcp/`，当前已迁入本分支的 MCP 专属指令、引用文件和 Codex OAuth 辅助脚本。业务名称为 `noxinfluencer`，直接使用 MCP，不生成或依赖宿主运行时标记。评测放在 `evals/mcp/`，不进入运行包。不在源码维护 `.claude-plugin/plugin.json`。

`package.json` 和锁文件是开发工具配置，保持无 `preinstall`、`install`、`postinstall`、`prepare` 等自动执行钩子。安装依赖不能触发插件注册、认证或业务操作。

## 本地联调

```bash
npm run plugin:local:bootstrap
npm run plugin:local:update
```

这两个命令会主动修改本机 Codex 插件安装状态；`update` 同时为两份 Manifest 写入开发版本。不要把开发 cachebuster 当成正式版本发布。修改后使用新会话测试。

## 发布

GitHub 安装直接读取默认分支源码，不要求生成 ZIP。用户命令保持 README 中的形式，不追加 npm 安装器版本号。

正式发布前补齐 MCP Skill、正式品牌图标、生产 MCP 配置与上架信息，然后执行：

```bash
npm run verify
npm test
npm run verify:release
git diff --check
```

可选 ZIP 使用 `npm run release:package`；Claude 包追加 `-- --target claude-code`。开发包使用 `npm run release:package:dev`。产物不作为源码维护。

ChatGPT 官方目录提交使用 `npm run verify:chatgpt` 与 `npm run package:chatgpt`。专用命令只收集 OpenAI Manifest、MCP 配置、插件内 Skill 和 assets，不加入通用安装器 Manifest。缺项一次报告，不提供绕过检查的参数；检查失败不生成新 ZIP。具体清单和限制见 README 的“ChatGPT 官方目录 ZIP”。

生产 MCP 地址必须为 HTTPS；如果声明 `oauth_resource`，它应与 `url` 完全相等，不含尾部斜杠、凭据、查询或片段。校验允许配置正式地址，不再把测试地址作为唯一合法值。日常开发校验允许测试环境和暂时为空的 MCP Skill；公开提交检查要求完整 Skill、正式地址及官方展示元数据。

不要提交个人 Marketplace、用户绝对路径、Token、密钥、日志、`node_modules/` 或 `dist/`。

原仓库级 CI 工作流保存在本插件的 `ci/noxinfluencer-plugin.yml` 作为参考模板。GitHub 不会自动发现这里的工作流；当前不向仓库根 `.github/workflows/` 增加文件。`verify:boundary` 检查工作区相对 `main` 的文件差异，拒绝插件目录之外的新增、修改和非授权删除。检查其他基准可运行 `node scripts/check-repository-boundary.mjs --base <ref>`。

## WorkBuddy 适配

仅在本插件的 `workbuddy/` 维护平台连接器元信息及按 Skill 目录补充的中英文展示字段。不要复制 Skill 正文或单独维护第二份 MCP URL／第三份插件版本。版本和服务地址分别从通用 Manifest 与 `.mcp.json` 生成。

`npm run verify` 包含 `verify:workbuddy:dev`，允许已知测试环境和完全为空的 MCP Skill。`npm run verify:workbuddy` 和 `npm run package:workbuddy` 用于完整正式交付；尚未补齐时应失败，不能为通过校验编造 Skill 或生产地址。`package:workbuddy:dev` 只生成明确带 `-dev` 标记的开发包。修改后运行 `npm test` 验证实际 ZIP 的内容和源码不变。

WorkBuddy 配置只进入 WorkBuddy 包，不改写现有 Codex／Claude 配置和 Skill 源码。官方审核、客户端联调、OAuth、品牌主体关系及 source 全局唯一性在打包之外完成。
