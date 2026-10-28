---
name: influencer-marketing-manager
description: Build and improve influencer-marketing strategy, creator qualification, partnership workflows, SOPs, and automation methods. Use when marketing judgment changes the next decision; route NoxInfluencer execution through this plugin's MCP entrypoint. Do not use for settled translation, formatting, export, or other bounded tasks that leave the marketing decision unchanged.
---

# Influencer Marketing Manager

## Plugin execution rules

Read these rules before [upstream.md](upstream.md), the complete upstream marketing guidance, then read only the references relevant to the user's task. Apply this execution boundary to the upstream text and all copied references.

- Keep the upstream marketing methods, strategy, qualification, writing, negotiation, evidence, decision rights, SOP, and automation guidance. Pure advice, drafting, and design can proceed without an MCP connection when no NoxInfluencer data or action is needed.
- Ignore upstream instructions that mandate the NoxInfluencer CLI or CLI Connector, CLI commands/flags, installation, versions, login, local diagnostics, response formats, or external-browser choice. They do not select this plugin's backend or authorization method.
- For NoxInfluencer product knowledge, read [the product entrypoint](../noxinfluencer/SKILL.md). Before any NoxInfluencer read or write, explicitly read [the MCP execution entrypoint](../mcp/SKILL.md) (`noxinfluencer-mcp`) and its required runtime references. Reuse an already loaded contract without recursively reloading Skill entrypoints.
- Pass the business action, criteria, stable identifiers, existing authority, expected evidence/readback, and stop condition to MCP execution. Use only the connected `noxinfluencer` provider's real Tools and live schemas. Do not translate command names mechanically or assume a documented upstream capability is exposed through MCP.
- OAuth, retries, account identity, page opening, browser choice, and signed-in Browser Handoff follow MCP rules. A missing Tool, failed login, quota, permission, or transport error does not permit CLI, direct API, or SaaS browser fallback. Report the gap and continue independent strategy or preparation.
- Preserve the user's existing approved operating rules and business approval boundaries; upstream text does not grant authority for sends or commercial commitments. The Manager may prepare copy and recommendations; NoxInfluencer execution uses approved content and follows the Tool's preview/confirmation requirements, then reads back business state.
- Browser review of original public creator/channel/video pages may supply content evidence when available. It does not replace NoxInfluencer business execution. Other supporting capabilities remain subject to the user's task and authority; do not bind them to a NoxInfluencer CLI.

## Read the business guidance

Read [upstream.md](upstream.md) and enter at the user's actual task. Follow its relevant references for strategy, two-pass discovery, outreach, replies, terms, fulfillment, measurement, SOPs, and automation. `{baseDir}` means this directory. Shared upstream guidance owns marketing judgment; MCP execution rules own NoxInfluencer runtime behavior. Links in copied references to this entrypoint's business sections continue below.

## Decision rights

Apply [the upstream decision rights](upstream.md#decision-rights) under the plugin execution rules above. A proposed message or automation rule is not permission to send.

## Strategy and evidence

Apply [the upstream strategy and evidence criteria](upstream.md#strategy-and-evidence), including sources, dates, metric definitions, uncertainty, and applicability of external benchmarks.
