# NoxInfluencer Codex Plugin 提交规范

本规范适用于以下两个相互关联的目录：

```text
skills/noxinfluencer
plugins/noxinfluencer
```

## 唯一源码与生成副本

- `skills/noxinfluencer` 是 NoxInfluencer Skill 的唯一源码，独立 Skill 用户从这里使用 CLI 分路。
- `plugins/noxinfluencer/skills/noxinfluencer` 是 Codex Plugin 的生成副本，不允许手工编辑。
- Plugin 内置副本必须严格等于根 Skill，再额外包含自动生成的 `references/codex-plugin-runtime.md`；该文件用于确定 MCP 分路。
- 不得把 `.git`、评测目录、日志、构建产物、环境文件或疑似密钥复制进 Plugin 内置 Skill。

所有命令均从仓库根目录下的 `plugins/noxinfluencer` 执行：

```powershell
cd plugins/noxinfluencer
```

## 修改 Skill

先修改唯一源码：

```text
skills/noxinfluencer
```

然后同步并校验：

```powershell
npm ci
npm run plugin:sync-skill
npm run plugin:verify-sync
npm run package:dev
```

同一个提交必须同时包含：

```text
skills/noxinfluencer
plugins/noxinfluencer/skills/noxinfluencer
```

不得只提交其中一份，也不得直接修补 Plugin 内置副本。

## 只修改 Plugin

只修改 `plugins/noxinfluencer` 下的 manifest、MCP 配置、脚本、文档或其他 Plugin 文件时，执行：

```powershell
npm ci
npm run plugin:verify-sync
npm run package:dev
```

如果 `plugin:verify-sync` 报告内置 Skill 漂移，不要手工修复副本；回到根 Skill 确认修改，再执行 `npm run plugin:sync-skill`。

## 提交前检查

提交前必须确认：

- `npm run plugin:verify-sync` 通过，且没有修改文件。
- `npm run package:dev` 通过。
- `git status` 中没有 `node_modules`、`dist`、日志、环境文件、密钥或临时文件。
- Skill 变更同时包含根 Skill 和 Plugin 内置副本。
- Plugin-only 变更没有误改根 Skill 或手工修改内置副本。
- `.mcp.json` 中 `url` 与 `oauth_resource` 完全相等，使用 HTTPS，且不带尾部 `/`。

## Commit Message

使用 Conventional Commits，并明确变更范围：

```text
feat(skill): add creator workflow
fix(skill): tighten campaign guardrails
feat(plugin): add Codex MCP runtime
fix(plugin): validate MCP resource
docs(plugin): document release workflow
chore(plugin): refresh bundled skill
```

一个提交只表达一个完整意图。由同一次 Skill 修改产生的根 Skill 与 Plugin 内置副本属于同一个完整意图，应放在同一提交中。

## CI 门禁

当 Pull Request 或 `mcp` 分支推送涉及以下路径时，GitHub Actions 会自动执行 Plugin 校验：

```text
skills/noxinfluencer/**
plugins/noxinfluencer/**
```

CI 固定执行：

```powershell
npm ci
npm run plugin:verify-sync
npm run package
```

`plugin:verify-sync` 是只读检查；如果开发者忘记同步、直接手改内置副本，或复制了额外文件，CI 会失败。Git hook 可以作为本地便利，但不作为唯一保障。
