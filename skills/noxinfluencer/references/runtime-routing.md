# Runtime Backend Routing

Select exactly one NoxInfluencer execution backend for each user workflow before taking an operational step. The packaging marker, not Tool availability, decides the backend.

## Selection Algorithm

1. Check whether `{baseDir}/references/codex-plugin-runtime.md` exists.
2. If the marker exists, read it and select **MCP**. The marker is generated only while packaging the NoxInfluencer Codex Plugin.
3. If the marker does not exist, select **CLI** and follow the original standalone Skill workflow.
4. After selecting MCP, verify that the connected provider named `noxinfluencer` exposes the required business Tool.
5. If the required Tool is missing or the MCP connection returns `AuthRequired`, treat the provider as possibly unconnected or awaiting authorization. Follow the one-attempt Codex Host OAuth bootstrap in `mcp-runtime.md`; do not report an incomplete rollout yet.
6. After successful Host login, recheck the Tool catalog. If the Tool is now available, retry the user's original business operation immediately. If the current task cannot dynamically refresh Tools, tell the user to create a new Codex task and resend the original request.
7. Report an incomplete MCP rollout only when authorization succeeded, the MCP connection and Tool catalog refreshed, and the required Tool is still absent.
8. After selecting CLI, verify that the `noxinfluencer` executable is available and follow the existing setup flow when it is missing. Never execute `codex mcp login` when the Plugin marker is absent.

Do not select MCP merely because an MCP provider or Tool happens to be available. Do not select the backend from the user's wording, a URL, an environment name, or whether both transports are installed.

## Precedence and Continuity

- The Codex Plugin package marker selects MCP. Its absence selects CLI.
- A standalone Skill user stays on CLI even when an MCP provider is separately available.
- A Codex Plugin workflow stays on MCP even when the CLI is installed.
- Keep the selected backend for the complete workflow, including follow-up reads, previews, mutations, polling, downloads, and error recovery.
- Do not combine identifiers or results obtained from different backends in one workflow unless a future NoxInfluencer contract explicitly declares them interchangeable.
- A missing OAuth grant, `401`, `403`, quota error, validation error, unavailable dependency, timeout, or missing MCP Tool is not permission to switch to the CLI.
- When MCP lacks a requested capability after successful authorization and a confirmed Tool-catalog refresh, state that the capability is not available in the current MCP rollout. Do not silently use the CLI.

## Shared Orchestration

Reuse the Skill's business workflow regardless of backend:

- Preserve read-before-write behavior and stable identifiers.
- Preserve dry-run, validation, preview, confirmation, and `--force` semantics as business guardrails, even when the MCP Tool expresses them with different parameters.
- Preserve explicit approval requirements for sends, schedules, reports, disputes, destructive operations, paid actions, and other mutations.
- Preserve output interpretation, quota explanations, platform boundaries, and error recovery.

In MCP mode, later CLI command names describe business capabilities only. Find the corresponding NoxInfluencer MCP Tool by its runtime name, description, and input schema. Never execute a shell command merely because a shared workflow names a CLI command.

## MCP Authentication Boundary

When MCP is selected, the Skill may run `codex mcp login noxinfluencer --oauth-client-registration DCR --scopes noxinfluencer.codex.user` once per user request to ask the Codex Host to bootstrap MCP OAuth. This is a Host control command, not the NoxInfluencer CLI backend. Let the Host perform DCR, PKCE, state validation, loopback callback, browser authorization, and Token storage. Never:

- run `noxinfluencer login`, any NoxInfluencer CLI business command, Device Flow, or API-key setup;
- construct an `/authorize` URL or request, print, or store OAuth Tokens, Authorization Codes, `state`, `code_verifier`, Cookies, or callback parameters;
- call kol-next or a Java service directly;
- construct a user identity from Tool arguments;
- fall back to CLI after an OAuth challenge or failure.

Do not repeat Host login after cancellation, command-launch failure, `403`, or `insufficient_scope`. If login is cancelled or the `codex` command is unavailable, direct the user to Connect/Re-authorize for NoxInfluencer in Codex settings.

Read `{baseDir}/references/mcp-runtime.md` after selecting MCP.
