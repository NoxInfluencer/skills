# MCP commercial-content compatibility

## Scope

The product decision confirmed on 2026-11-12 applies the requested OpenAI marketplace submission boundary to all NoxInfluencer MCP clients. It is not a claim of marketplace approval. The MCP URL and OAuth resource remain `https://skill.noxinfluencer.com/mcp`; no new channel, branch-specific endpoint or environment switch is required.

## Maintained behavior

- Membership pricing is absent from MCP discovery and unavailable for direct calls.
- Account queries retain authoritative balances, execution permission and neutral limitation reasons. Credit balance alone does not grant permission.
- Credit-cost queries require an explicit tool or action. Report the returned unit cost; a total remains unknown without the operation-specific quantities and billing basis. Use an available preflight instead of inventing a total.
- MCP guidance does not offer trial claims, upgrades, recharges, purchases or membership-page navigation. Restrictions do not erase successful business results.
- CLI commands, their snapshot and commercial recovery guidance remain available in standalone CLI mode. An MCP restriction does not authorize switching transports.

## Source and restoration

Maintain `source/noxinfluencer/adapters/mcp/core.md`, `runtime.md` and `references/quota-pricing-dispute-feedback.md`. The runtime rule also covers MCP selected by the universal Skill, whose shared references retain CLI semantics. Update the MCP primitives in `capabilities/registry.yaml` and the `quota`/`list_tool_pricing` schemas in `snapshots/mcp-tools.json`; membership pricing is removed from that snapshot. Run the snapshot updater, `v2:build`, `v2:check` and `v2:test`.

The Claw repository's `docs/mcp-commercial-content-compatibility.md` owns server behavior and restoration instructions. Before restoring any commercial capability, confirm the intended distribution requirements, adjust Claw registration, execution, response and routing together, then update these sources and regenerate. Do not restore a Skill instruction before the backend supports it, and do not revert unrelated business fixes.

`tests/mcp-surface.test.mjs` checks discovery and argument schemas while preserving CLI commands. The manual behavioral cases in `evals/mcp-commercial-content.md` cover Agent decisions; automated structural tests do not constitute an executed model evaluation or live endpoint acceptance.
