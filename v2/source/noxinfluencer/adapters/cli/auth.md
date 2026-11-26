# Standalone CLI Installation And Authentication

Use this reference only for the independently installed NoxInfluencer CLI runtime. An unavailable executable or failed authentication does not authorize a backend change.

## Installation And Command Tree

Check the isolated executable with `node "{baseDir}/scripts/nox-cli.mjs" --version`. If it is missing and an authorized terminal with Node.js and npm is available, run `node "{baseDir}/scripts/nox-cli.mjs" --install`. The helper installs the pinned package in the user's V2 cache and checks its declared Campaign schema before activation. Run subsequent commands through the helper to use the same package and default V2 login configuration.

Use `node "{baseDir}/scripts/nox-cli.mjs" --install-from <local-package.tgz>` for a matching package supplied by a maintainer. Both installation methods verify package identity and schema. If the pinned package is unavailable, report the distribution gap. Use the client's normal setup controls for a missing terminal, Node.js, or npm.

After installation or a Skill update, run `node "{baseDir}/scripts/nox-cli.mjs" --verify` and check the required operation with `schema <cmd>` through the helper. If the expected command family remains absent, report a CLI package or command-tree mismatch. Keep the legacy global installation and its saved credentials separate.

The expected families include creator, monitor, campaign, collection, email, message, CRM, product, short-link, affiliation, brand-monitor, dispute, export, file, feedback, quota, pricing, and agent operations.

## User-Completed Device Flow Login

- Whenever the Agent initiates login, run `node "{baseDir}/scripts/nox-cli.mjs" login start --json`, show only the returned user-safe verification address and user code, let the user open the link and authorize, then run `node "{baseDir}/scripts/nox-cli.mjs" login wait <login_id>`.
- Do not run bare `login`, `login --browser`, or any browser launcher, and do not open or complete authorization using browser or computer-use tools. A terminal being interactive does not make Agent-driven login a manual user action.
- Treat `login_id` as an opaque polling identity. Never reveal a device code, saved credential, callback value, or any field that the CLI does not mark user-safe.
- Do not construct an authorization address, exchange a code, or store a credential outside the CLI.

## API-Key Fallback

Manual API-key entry is a fallback only when the user explicitly chooses it. Read the key from standard input with `node "{baseDir}/scripts/nox-cli.mjs" auth --key-stdin`. Never place an API key in a command argument, log, output, transcript, environment example, or Skill file.

On cancellation or authentication failure, report the safe CLI error and stop. Do not print configuration files, retry in a loop, or switch runtimes.
