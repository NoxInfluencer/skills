# NoxInfluencer Codex Plugin 提交规范

本规范适用于 `plugins/noxinfluencer` 及仓库级 `.agents/plugins/marketplace.json`。插件内 Skill 是独立源码；仓库中的其他 Skill 不参与本插件的开发、验证或安装。

所有插件命令从插件根目录执行：

```powershell
cd plugins/noxinfluencer
```

## 开发流程

直接修改插件目录内的 Skill、Manifest、MCP 配置、脚本或文档。不要从其他 Skill 目录同步或复制内容。

首次安装依赖：

```powershell
npm ci
```

提交前执行：

```powershell
npm run verify
```

`verify` 是只读校验，覆盖 Plugin Skill、Manifest、MCP 配置以及仓库 Marketplace。正常开发和 CI 不需要生成 ZIP。

如果修改了运行时标记模板，先执行：

```powershell
npm run plugin:sync-skill
npm run verify
```

## Marketplace 约束

仓库 Marketplace 位于：

```text
.agents/plugins/marketplace.json
```

必须保持：

- Marketplace 名称为 `noxinfluencer-codex`；
- 插件名称为 `noxinfluencer`；
- 来源为 `./plugins/noxinfluencer`；
- 安装策略为 `AVAILABLE`；
- 认证策略为 `ON_INSTALL`；
- 分类为 `Marketing`。

不要把个人 Marketplace、用户目录路径、Token 或机器相关配置提交到仓库。

## 本地更新

首次注册当前仓库 Marketplace：

```powershell
npm run plugin:local:deps
npm run plugin:local:bootstrap
```

后续修改插件后：

```powershell
npm run plugin:local:update
```

本地更新按照 `plugin-creator` 的开发流程更新 Manifest cachebuster，再从仓库 Marketplace 重新安装。更新完成后使用新 Codex 会话测试。

本地 cachebuster 不能直接作为正式发布版本。正式发布前把 Manifest 版本改成确定版本，并运行 `npm run verify`。

## 可选发布 ZIP

仅在离线交付、GitHub Release 附件或文件清单审计需要时执行：

```powershell
npm run release:package
```

开发 ZIP：

```powershell
npm run release:package:dev
```

ZIP 不是 GitHub Marketplace 安装链路的一部分。

## 提交前检查

- `npm run verify` 通过；
- `git diff --check` 通过；
- `git status` 中没有 `node_modules`、`dist`、日志、环境文件、密钥或临时文件；
- Marketplace 条目仍指向本插件目录；
- `.mcp.json` 中 `type` 为 `http`，`url` 与 `oauth_resource` 完全相等且不带尾部 `/`；当前测试构建仅允许固定 HTTPS 内网域名 `https://skilltest.noxinfluencer.com/mcp`；
- 正式发布使用确定版本和对应 Git Tag。

## Commit Message

使用 Conventional Commits：

```text
feat(plugin): add creator workflow
fix(plugin): tighten MCP guardrails
feat(marketplace): publish GitHub install entry
fix(plugin): validate MCP resource
docs(plugin): document GitHub installation
```

## CI 门禁

当以下路径发生变化时，GitHub Actions 执行验证：

```text
.agents/plugins/marketplace.json
plugins/noxinfluencer/**
.github/workflows/noxinfluencer-plugin.yml
```

CI 固定执行：

```powershell
npm ci
npm run verify
```
