# Main / V2 reconciliation — 2026-11-17

## Reviewed sources

- Public main baseline: `622f8c48719d0287a1ea65f26cfb441903273e8f` (2026-11-16).
- V2 entered main through `7e781c2` on 2026-11-09. The branches share `f07645d` (2026-11-10).
- `agent-plugin` then added `7f664d6` (2026-11-11, percentage/commission units) and `004a0fd` (2026-11-13, MCP commercial-content compatibility); neither is an ancestor of the reviewed main baseline.
- Previous legacy semantic review ended at `edab951` (2026-10-20). Legacy product changes through this main baseline add `1547dc6` (2026-10-28, creator average-view scopes). That commit existed in main history and legacy output, but its guidance was absent from V2.

## Reconciliation

| Source | Treatment |
| --- | --- |
| `7f664d6` | Preserve shared numeric/commission units, CLI parameter guidance, both snapshots and derived Campaign contract. |
| `004a0fd` | Preserve MCP membership-tool removal, explicit operation-cost query schemas, neutral quota/permission guidance, compatibility documentation and regression test. Standalone CLI commercial behavior stays available. |
| `1547dc6` | Adapt search classification, exposure interpretation and detail-sample semantics into shared V2 references and CLI syntax guidance. Reuse legacy cases 51/52 for both runtimes; add Instagram, exposure and Shorts probes. |
| Main plugin releases and `c65dd06` | Retain main's current Handoff adapters, generator, host behavior and marketplace metadata. Do not restore older agent-plugin Handoff policy or downgrade plugin version. |
| Manager changes through `622f8c4` | Already present in main. Keep shared business source and existing 64-case evaluation collection; do not duplicate Manager or claim its unexecuted cases passed. |

Source maintenance is on public main. Universal Skill and plugin outputs are regenerated from reviewed sources; legacy customer entrypoints remain unchanged. Skill version is 0.10.3 and plugin version is 1.0.1, advancing both previously used identities.

## Validation boundary

Build, output drift, packaging, schema tests and Skill validation are offline checks. The behavioral probes in [creator-metrics.md](creator-metrics.md) and [mcp-commercial-content.md](mcp-commercial-content.md) require actual model traces for behavioral acceptance. No real account calls, npm publication, deployment or marketplace submission is part of this reconciliation.

Local checks on 2026-11-17: 26 V2 Node tests passed; build/check and both ZIP packages succeeded; both generated product Skills passed frontmatter/resource validation; the existing 52 legacy evaluation cases passed structural validation. Git comparison confirmed legacy product/Connector/Expert/root README, shared Manager and main's Handoff adapters/generator/output were unchanged. The default Python lacked PyYAML, so Skill validation used the existing project environment with that dependency. No model evaluation was run.

Local checks on 2026-11-17: 26 V2 Node tests passed; build/check and both ZIP packages succeeded; both generated product Skills passed frontmatter/resource validation; the existing 52 legacy evaluation cases passed structural validation. Git comparison confirmed legacy product/Connector/Expert/root README, shared Manager and main's Handoff adapters/generator/output were unchanged. The default Python lacked PyYAML, so Skill validation used the existing project environment with that dependency. No model evaluation was run.
