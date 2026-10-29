# Standalone CLI Installation And Authentication

Use this reference only for the independently installed NoxInfluencer CLI runtime. An unavailable executable or failed authentication does not authorize a backend change.

## Installation And Command Tree

1. Confirm that `noxinfluencer` is executable.
2. If it is absent, use the authorized isolated installer in `{baseDir}/references/setup.md`; never install npm latest or replace the global executable.
3. After installation or reinstall, verify the actual command tree with `node "{baseDir}/scripts/nox-cli.mjs" schema --all`; a version string alone does not prove that stale compiled files were replaced.
4. If the expected command family remains absent, stop that workflow and report a CLI package or command-tree mismatch.

The expected families include creator, monitor, campaign, collection, email, message, CRM, product, short-link, affiliation, brand-monitor, dispute, export, file, feedback, quota, pricing, and agent operations.

## Interactive And Device Flow Login

- In a direct interactive terminal, run `node "{baseDir}/scripts/nox-cli.mjs" login` and let the CLI own its browser authorization and credential storage.
- In an agent or remote terminal, use the CLI Device Flow: run `node "{baseDir}/scripts/nox-cli.mjs" login start --json`, show only the returned user-safe verification address and user code, wait for the user to authorize, then run `node "{baseDir}/scripts/nox-cli.mjs" login wait <login_id>`.
- Treat `login_id` as an opaque polling identity. Never reveal a device code, saved credential, callback value, or any field that the CLI does not mark user-safe.
- Do not construct an authorization address, exchange a code, or store a credential outside the CLI.

## API-Key Fallback

Manual API-key entry is a fallback only when the user explicitly chooses it. Read the key from standard input with `node "{baseDir}/scripts/nox-cli.mjs" auth --key-stdin`. Never place an API key in a command argument, log, output, transcript, environment example, or Skill file.

On cancellation or authentication failure, report the safe CLI error and stop. Do not print configuration files, retry in a loop, or switch runtimes.
