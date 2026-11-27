## Runtime Selection

This is the V2 product entrypoint. Use the sibling installed `influencer-marketing-manager` for marketing judgment when relevant. That shared Manager does not select a transport or version. Before business execution, return to the currently selected product entrypoint; examples naming the legacy Skill do not change the active V2 workflow. Reuse already loaded rules without recursive handoffs.

Read `{baseDir}/references/setup.md` when installation, connection, or runtime selection is needed. Do not ask a nontechnical customer to choose CLI versus MCP. Select from observed client capabilities, authorized account context, available operations and setup effort. Respect an explicitly selected product or transport. A shell, installed package, provider name or successful authorization alone does not establish business capability.

1. Honor the explicitly selected runtime or retain the runtime and account already selected for the current workflow. If MCP is selected and the connection is not ready, follow `{baseDir}/references/oauth-and-scopes.md`. If CLI is selected and needs setup, follow `{baseDir}/references/auth.md`. Continue through the selected runtime's recovery, including when the other runtime is ready.
2. For a new workflow with no selected runtime, prefer an already connected official NoxInfluencer provider when its live tools support the requested task for the intended account. Otherwise use the isolated V2 CLI if it is installed, authorized for that account, and its live schema covers the task.
3. If neither is ready for the new workflow, follow `{baseDir}/references/setup.md` to choose one available setup path. Prefer MCP when the host can establish the official connection and there is evidence the provider supports the required operation. Choose CLI when its supported installation and operation are the available path. Keep login and approval in the client's normal controls and hold the account task pending until access is ready.

After selecting MCP, read `{baseDir}/references/runtime-mcp.md`. After selecting CLI, read `{baseDir}/references/runtime-cli.md`. The selected runtime determines all tool calls and presentation for the workflow.

In CLI mode, never open or operate NoxInfluencer SaaS pages through an embedded browser, external browser automation, computer use, or a shell browser launcher. Give the user the relevant link for any required manual step, including an explicit request to open a page. Follow the CLI runtime's user-handoff rules. This CLI boundary does not change MCP host-managed authorization or supported page handoffs.

Read only the selected runtime's execution references and the business references needed for the task. Keep that runtime and account for reads, previews, writes, polling and recovery. An authentication, permission, quota, missing-tool or network error does not authorize an automatic backend switch. Before intentionally changing runtimes, resolve outstanding writes and confirm matching identity and target scope. Never resend an uncertain write through the other runtime.

For authorized current-turn attachments use the client's actual file-reading tools and the shared attachment rules. No embedded Agent, sandbox module or private service is required to interpret this Skill.
