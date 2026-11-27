# Standalone CLI Installation And Authentication

Use this reference only for the independently installed NoxInfluencer CLI runtime. An unavailable executable or failed authentication does not authorize a backend change.

## Installation And Command Tree

Check the isolated executable with `node "{baseDir}/scripts/nox-cli.mjs" --version`. If it is missing and an authorized terminal with Node.js and npm is available, run `node "{baseDir}/scripts/nox-cli.mjs" --install`. The helper installs the pinned package in the user's V2 cache and checks its declared Campaign schema before activation. Run subsequent commands through the helper to use the same package and default V2 login configuration.

Use `node "{baseDir}/scripts/nox-cli.mjs" --install-from <local-package.tgz>` for a matching package supplied by a maintainer. Both installation methods verify package identity and schema. If the pinned package is unavailable, report the distribution gap. Use the client's normal setup controls for a missing terminal, Node.js, or npm.

After installation or a Skill update, run `node "{baseDir}/scripts/nox-cli.mjs" --verify` and check the required operation with `schema <cmd>` through the helper. If the expected command family remains absent, report a CLI package or command-tree mismatch. Keep the legacy global installation and its saved credentials separate.

The expected families include creator, monitor, campaign, collection, email, message, CRM, product, short-link, affiliation, brand-monitor, dispute, export, file, feedback, quota, pricing, and agent operations.

## Device Login In The User's External Browser

- From a terminal with access to the user's local desktop, run `node "{baseDir}/scripts/nox-cli.mjs" --login`. The helper starts device login, opens the CLI-issued authorization page in the user's normal Chrome session or system default external browser, and waits for the same login. Let the user complete sign-in and consent there and wait for the command to finish. Use `--login --force` when the current credentials are rejected and reauthorization is needed.
- Keep the authorization URL, login identity, and codes inside the helper. Do not print them in the conversation, open the page inside the Agent, run the interactive `login` command, or use browser automation to sign in or consent.
- If the desktop browser is unavailable, fails to open, or the user declines or lets authorization expire, explain the observed state and keep the task pending. If a supported host-managed authorization control is available, guide the user to it. Do not offer the authorization URL as a chat link, retry automatically, or switch runtimes.

## API-Key Fallback

Manual API-key entry is a fallback only when the user explicitly chooses it. Read the key from standard input with `node "{baseDir}/scripts/nox-cli.mjs" auth --key-stdin`. Never place an API key in a command argument, log, output, transcript, environment example, or Skill file.

Continue the retained task after the CLI confirms authorization for the intended account. Do not print configuration files or copy stored credentials.
