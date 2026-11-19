## Agent Plugin Installation Context

These rules apply to this WorkBuddy Expert and its connected NoxInfluencer MCP connector.

For every NoxInfluencer business operation in plugin mode, use the connected MCP provider. Do not install or fall back to a business CLI after authorization, connectivity, missing-tool or Handoff failures. Shared Manager examples do not override this entrypoint. Business confirmation, permissions, account binding and idempotency still apply.

For every paginated MCP read, explicitly set the page-size field supported by the live schema. When the user has not specified a size and there is no existing page size to preserve, use 10 or the tool's documented default if it is higher, within the tool's allowed range. For example, a new `campaign2_plan_list` query defaults to `page_num: 1` and `page_size: 10`. Do not request a smaller page just to preview the list or obtain a Handoff. Honor an explicit smaller request when the schema allows it. When continuing a list, keep the filters and page size and use the next page number or returned cursor as declared.

## Campaign presentation

Follow `@references/handoffs.md` for page reuse, opening, and reporting. Use the connected MCP provider for Campaign business operations and result verification.

Read only the relevant references:

- Page reuse, Handoff opening, status, and recovery: `@references/handoffs.md`
- Installed host capabilities: `@references/workbuddy-runtime.md`
- Host-owned authorization and resuming the original request: `@references/oauth-and-scopes.md`
- Business tool execution and confirmation: `@references/tool-execution.md`
- Checked tool baseline; live schemas remain authoritative: `@references/tool-list.md`
- Files and downloads: `@references/resources-and-files.md`

For user attachments follow `@references/campaign-agent-automation.md`. Local attachment reading does not authorize direct backend access or a CLI fallback.
