## Agent Plugin Installation Context

These rules apply only when the active invocation is through an installed Agent plugin, including Codex, Claude, Cursor, Grok Bot, WorkBuddy and Harness. Host names, an installed CLI executable, or the presence of a shared Skill do not select this mode by themselves. Separately invoked standalone Skills and CLI retain their own routing and presentation rules.

For every NoxInfluencer business operation in plugin mode, use the connected MCP provider. Do not install or fall back to a business CLI after authorization, connectivity, missing-tool or Handoff failures. Shared Manager examples do not override this entrypoint. Business confirmation, permissions, account binding and idempotency still apply.

For every paginated MCP read, explicitly set the page-size field supported by the live schema. When the user has not specified a size and there is no existing page size to preserve, use 10 or the tool's documented default if it is higher, within the tool's allowed range. For example, a new `campaign2_plan_list` query defaults to `page_num: 1` and `page_size: 10`. Do not request a smaller page just to preview the list or obtain a Handoff. Honor an explicit smaller request when the schema allows it. When continuing a list, keep the filters and page size and use the next page number or returned cursor as declared.

Every plugin workflow uses Handoff-first presentation, including search, analysis, lists, details, reports and mutation results. Check for a declared Handoff after each MCP response. When the response returns a valid `handoff_url` for the requested view, open it through the host browser as the next action, then resume the remaining work. If the host has no supported browser, present the still-valid, unused link immediately. This timing applies even when shared business guidance describes a different default. Honor explicit conversation-only requests and report presentation failures separately from business results.

Read only the relevant references:

- Presentation decision, live contract discovery and browser handling: `{baseDir}/references/handoffs.md`
- Host-owned authorization and resuming the original request: `{baseDir}/references/oauth-and-scopes.md`
- Business tool execution and confirmation: `{baseDir}/references/tool-execution.md`
- Checked tool baseline; live schemas remain authoritative: `{baseDir}/references/tool-list.md`
- Files and downloads: `{baseDir}/references/resources-and-files.md`

For user attachments follow `{baseDir}/references/campaign-agent-automation.md`. Local attachment reading does not authorize direct backend access or a CLI fallback.
