# V2 Setup And Updates

The user installs NoxInfluencer, not a technical transport choice. Check the current client's actual capabilities and reuse a supported authorized connection where possible. Do not install both backends by default. An MCP-capable client is not necessarily configured, authorized or able to self-configure a provider.

## Connected provider

Use the official endpoint `https://skill.noxinfluencer.com/mcp` with provider name `noxinfluencer`, configured through the client's supported connection controls. Read the MCP authorization reference for the exact host-specific flow. Only Codex uses its documented Codex bootstrap; other clients use their own supported OAuth controls. Do not infer identity from a provider's display name or construct authorization URLs.

Check the live tool catalog for the user's task. One missing business tool on an otherwise connected provider is a capability gap, not a reason to repeat login. File upload/download and page handoff require the supported host and server contracts; do not infer them from ordinary business tools. Never install a CLI as recovery inside the MCP plugin.

## Isolated V2 CLI

When the workflow selects CLI, follow `{baseDir}/references/auth.md` for the isolated installer, CLI schema verification, and user-completed device login. Run the V2 CLI through its bundled helper and use its separate per-user login configuration.

## Updates

Use this repository's V2 Skill directory for V2 updates and keep the CLI package contract with the installed Skill. After updating, rerun the helper's schema verification and refresh the relevant references. Plugin updates use the plugin channel and refresh the MCP tool catalog. Do not replace the legacy Skill or global executable during V2 self-tests. Repository changes do not update previously installed clients until their updater or an explicit update runs.
