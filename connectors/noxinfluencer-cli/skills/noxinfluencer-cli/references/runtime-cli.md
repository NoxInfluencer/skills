## Standalone CLI Runtime Boundary

This connector uses the WorkBuddy-managed NoxInfluencer CLI for NoxInfluencer operations. Do not switch to another configured backend because it appears faster or more available. If the executable, authentication, quota, or a command is unavailable, follow the standalone recovery guidance and keep the selected runtime unchanged.

## SaaS Pages Belong To The User

Never open, inspect or operate NoxInfluencer SaaS pages with an embedded browser, external browser automation, computer use, or shell commands that launch a browser. This applies to normal work, troubleshooting and explicit requests to open a platform page. Do not log in, switch accounts, or manipulate browser sessions on the user's behalf.

When a step requires the website, provide the relevant trusted link and a short explanation for the user to complete it themselves. Interpret CLI help or returned actions saying "open SaaS" as instructions for the user, not permission for the Agent to open the page. For authorization use the WorkBuddy connector device-login flow in `@references/auth.md`. If a required capability is unavailable, explain the gap and continue only independent work; do not use the website as a fallback.

This restriction concerns Agent-controlled access to NoxInfluencer SaaS. It does not prohibit ordinary research on external creator or brand websites, CLI file transfers, or existing host-managed SaaS workspace result receipts. A receipt does not authorize browser automation or prove that a page opened.

## CLI Execution

At the start of each turn that uses NoxInfluencer, read the currently installed `Skill entrypoint provided by WorkBuddy` and run `noxinfluencer --version`. Use the current turn's page context rather than a remembered page. On first use, version change, sandbox restoration, or a command/schema mismatch, discard remembered command signatures and reload the relevant installed references. Discover exact parameters with `noxinfluencer schema "<command path>"` before the first use of each command in that turn. Use `schema --all` only when the command tree is unknown or has changed; do not load the full catalog every turn. A file modification date or CLI version alone does not prove that cached Skill text is current.

For creator discovery, save each complete search response as a task-local JSON file before summarizing it. Reuse that file for selection and follow-up payloads; do not repeat a paid search to recover identifiers omitted from a display. Read the result-reuse workflow in `@references/command-execution.md` before the first search.

Read only the CLI references needed for the current workflow:

- Installation and authentication: `@references/auth.md`
- Schema-driven commands, response handling, and writes: `@references/command-execution.md`
- Local inputs, imports, reports, and exports: `@references/files.md`
- `@references/search-filters-cli.md`
- `@references/verdict-heuristics-cli.md`
- `@references/marketing-ops-cli.md`
- `@references/brand-monitor-cli.md`
- `@references/platform-support-cli.md`

For user-provided local attachments, follow the common attachment rules in `@references/campaign-agent-automation.md` using the client's available reading tools. This does not change the business-command boundary above.
