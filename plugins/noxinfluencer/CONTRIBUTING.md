# NoxInfluencer Plugin 开发规范

开发边界为 `plugins/noxinfluencer/`。仓库根 `.plugin/marketplace.json` 仅负责定位该目录；既有 `.agents/plugins/marketplace.json` 继续作为新版 Codex 原生入口。不要读写、复制或同步外层独立 Skill。

## 修改与验证

在插件目录执行：

```bash
npm ci
npm run verify
npm test
```

`verify` 只读，检查通用与 Codex Manifest、插件内 Skill、MCP 配置和安装索引。两份 Manifest 的共用元数据必须一致，Codex 专用字段只放 `.codex-plugin/plugin.json`。

MCP Skill 唯一交付位置为 `skills/mcp/`。交付前仅保留 `.gitkeep`；交付后必须有有效 `SKILL.md` 和全部依赖文件。不生成或注入宿主运行时标记。不在源码维护 `.claude-plugin/plugin.json`。

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

生产 MCP 地址必须为 HTTPS，`url` 与 `oauth_resource` 完全相等，不含尾部斜杠、凭据、查询或片段。切换生产环境时同步调整 `scripts/plugin-source-validation.mjs` 的地址白名单及发布检查，不能仅修改 JSON 绕过环境约束。

不要提交个人 Marketplace、用户绝对路径、Token、密钥、日志、`node_modules/` 或 `dist/`。

CI 监听 `.plugin/marketplace.json`、`.agents/plugins/marketplace.json`、本插件目录和对应工作流，执行依赖安装、只读校验及失败场景测试。
