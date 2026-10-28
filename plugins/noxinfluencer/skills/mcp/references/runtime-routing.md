# MCP Runtime Routing

The bundled `noxinfluencer-mcp` Skill is this plugin's MCP execution entry point. Every NoxInfluencer operation must use the connected `noxinfluencer` MCP provider; there is no standalone CLI backend or fallback path. The Skill name is distinct from the provider name and from the shared business Skill named `noxinfluencer`.

## Shared Business Guidance

Follow [Shared Business Skills](../SKILL.md#shared-business-skills) when product or marketing guidance is needed. Read a sibling's plugin `SKILL.md` before its generated `upstream.md` or references. The upstream text is preserved in full except for the excluded CLI-response document; its CLI commands, metadata, login, response formats, and browser rules do not select a runtime. A missing shared file is a delivery gap, not an authentication failure, and must not trigger OAuth or CLI fallback.

Shared Skill entrypoints explicitly read `skills/mcp/SKILL.md` before NoxInfluencer execution. Their business guidance does not select a transport, authorize an action, or override this MCP execution contract. Reuse an already loaded entrypoint without recursive handoffs. Neither folder order nor a shared plugin namespace loads these rules automatically.

## Selection Algorithm

1. Read [mcp-runtime.md](mcp-runtime.md) before the first business operation. This Skill is packaged inside the MCP plugin; no runtime marker or standalone-backend selection is needed.
2. Verify that the connected provider named `noxinfluencer` exposes the Tool required for the user's request.
3. Use the current host's authorization controls. In Codex only, follow the one-attempt Host OAuth bootstrap in `mcp-runtime.md` when the explicitly invoked Plugin has loaded no `noxinfluencer` Tools at all and no transport failure is known, or when the MCP connection or Tool call explicitly returns `AuthRequired` or HTTP `401`. Do not bootstrap merely because one business Tool is absent while another provider Tool is loaded.
4. After successful Host authorization, recheck the Tool catalog and retry the original operation when the Tool is available.
5. If the current host cannot refresh its Tool catalog, explain that limitation and ask the user to start a new conversation after connecting successfully.
6. Report a capability as unavailable when the connection initializes and the Tool catalog refreshes successfully but the required Tool is absent. An already connected provider with one missing Tool does not require another login.

## Continuity and Boundaries

- Keep MCP selected for the complete workflow, including follow-up reads, previews, mutations, polling, downloads, and error recovery.
- Do not combine MCP identifiers or results with data from another backend.
- A missing OAuth grant, `401`, `403`, quota error, validation error, unavailable dependency, timeout, or missing Tool is never permission to use a CLI.
- Do not invent a Tool, parameter, Resource, route, or capability that is absent from the live provider.
- Preserve read-before-write behavior, stable identifiers, preview/validation/confirmation semantics, explicit approval requirements, quota explanations, platform boundaries, and error recovery.
- Translate business concepts into the connected Tool's runtime name, description, and input schema. Never execute a shell command merely because a workflow or reference uses a command-like label.

## MCP Authentication Boundary

When authorization is needed, use the current host's MCP connection controls. The following helper and commands are for Codex only; Claude Code and WorkBuddy use their own MCP OAuth surface and must not run Codex commands. In Codex, attempt automatic authorization at most once per user request. Windows uses the packaged OAuth helper; macOS/Linux uses an independently executable `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user`. The registration value is case-sensitive and must remain lowercase. This is a Host control action, not a NoxInfluencer business backend.

Let the Host perform DCR, PKCE, state validation, loopback callback, browser authorization, and Token storage. Never:

- construct an `/authorize` URL or request, print or store OAuth Tokens, authorization codes, `state`, `code_verifier`, cookies, or callback parameters;
- call kol-next or a Java service directly;
- construct a user identity from Tool arguments;
- request or install the NoxInfluencer CLI;
- fall back to a CLI after an OAuth challenge or failure.

Do not repeat Host login after cancellation, helper failure, `403`, or `insufficient_scope`. If the helper cannot start OAuth, direct the user to Connect/Re-authorize for NoxInfluencer in Codex settings.

Read `{baseDir}/references/mcp-runtime.md` for the exact Tool contracts, OAuth failure branches, and Browser Handoff rules.
