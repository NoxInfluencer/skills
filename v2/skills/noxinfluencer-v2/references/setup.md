# V2 Setup And Updates

The user installs NoxInfluencer, not a technical transport choice. Check the current client's actual capabilities and reuse a supported authorized connection where possible. Do not install both backends by default. An MCP-capable client is not necessarily configured, authorized or able to self-configure a provider.

## Connected provider

Use the official endpoint `https://skill.noxinfluencer.com/mcp` with provider name `noxinfluencer`, configured through the client's supported connection controls. Read the MCP authorization reference for the exact host-specific flow. Only Codex uses its documented Codex bootstrap; other clients use their own supported OAuth controls. Do not infer identity from a provider's display name or construct authorization URLs.

Check the live tool catalog for the user's task. One missing business tool on an otherwise connected provider is a capability gap, not a reason to repeat login. File upload/download and page handoff require the supported host and server contracts; do not infer them from ordinary business tools. Never install a CLI as recovery inside the MCP plugin.

## Isolated V2 CLI

When a permitted terminal and Node.js/npm are available, run `node "{baseDir}/scripts/nox-cli.mjs" --install`. The helper installs the pinned compatible package under the current user's V2 cache, without a global install, and checks the declared Campaign schema before activating it. Run all subsequent commands through `node "{baseDir}/scripts/nox-cli.mjs"`; the bare global `noxinfluencer` executable belongs to a separate installation and is not evidence that V2 is ready.

The helper uses a separate default V2 login configuration. Start its documented device-login flow and let the user complete authorization. Do not read, copy or print the legacy CLI's saved credentials. Do not ask the user to paste credentials into chat.

For a maintainer-provided local test package, use `node "{baseDir}/scripts/nox-cli.mjs" --install-from <local-package.tgz>`. The same installed package version and schema checks still apply. Never substitute npm `latest`, an incompatible global executable, or a package obtained from an arbitrary URL. If the pinned package is unavailable, explain the distribution gap; do not invent a successful installation. Node/npm installation itself uses the client's normal authorized mechanism when available, otherwise explain the necessary setup step in plain language.

## Updates

Use this repository's V2 Skill directory for V2 updates and keep the CLI package contract with the installed Skill. After updating, rerun the helper's schema verification and refresh the relevant references. Plugin updates use the plugin channel and refresh the MCP tool catalog. Do not replace the legacy Skill or global executable during V2 self-tests. Repository changes do not update previously installed clients until their updater or an explicit update runs.
