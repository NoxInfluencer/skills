# Runtime Backend Routing

Select exactly one NoxInfluencer execution backend for each user workflow before taking an operational step. The packaging marker, not Tool availability, decides the backend.

## Selection Algorithm

1. Check whether `{baseDir}/references/codex-plugin-runtime.md` exists.
2. If the marker exists, read it and select **MCP**. The marker is generated only while packaging the NoxInfluencer Codex Plugin.
3. If the marker does not exist, select **CLI** and follow the original standalone Skill workflow.
4. After selecting MCP, verify that the connected provider named `noxinfluencer` exposes the required business Tool. If not, report that the plugin connection or current MCP rollout does not provide the capability.
5. After selecting CLI, verify that the `noxinfluencer` executable is available and follow the existing setup flow when it is missing.

Do not select MCP merely because an MCP provider or Tool happens to be available. Do not select the backend from the user's wording, a URL, an environment name, or whether both transports are installed.

## Precedence and Continuity

- The Codex Plugin package marker selects MCP. Its absence selects CLI.
- A standalone Skill user stays on CLI even when an MCP provider is separately available.
- A Codex Plugin workflow stays on MCP even when the CLI is installed.
- Keep the selected backend for the complete workflow, including follow-up reads, previews, mutations, polling, downloads, and error recovery.
- Do not combine identifiers or results obtained from different backends in one workflow unless a future NoxInfluencer contract explicitly declares them interchangeable.
- A missing OAuth grant, `401`, `403`, quota error, validation error, unavailable dependency, timeout, or missing MCP Tool is not permission to switch to the CLI.
- When MCP lacks a requested capability, state that the capability is not available in the current MCP rollout. Do not silently use the CLI.

## Shared Orchestration

Reuse the Skill's business workflow regardless of backend:

- Preserve read-before-write behavior and stable identifiers.
- Preserve dry-run, validation, preview, confirmation, and `--force` semantics as business guardrails, even when the MCP Tool expresses them with different parameters.
- Preserve explicit approval requirements for sends, schedules, reports, disputes, destructive operations, paid actions, and other mutations.
- Preserve output interpretation, quota explanations, platform boundaries, and error recovery.

In MCP mode, later CLI command names describe business capabilities only. Find the corresponding NoxInfluencer MCP Tool by its runtime name, description, and input schema. Never execute a shell command merely because a shared workflow names a CLI command.

## MCP Authentication Boundary

When MCP is selected, let the Codex MCP Client perform OAuth. Never:

- run CLI login or API-key setup;
- request or store OAuth tokens;
- call kol-next or a Java service directly;
- construct a user identity from Tool arguments;
- fall back to CLI after an OAuth challenge or failure.

Read `{baseDir}/references/mcp-runtime.md` after selecting MCP.
