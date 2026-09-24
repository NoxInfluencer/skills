# MCP Runtime Routing

This bundled Skill is MCP-only. Every NoxInfluencer operation must use the connected `noxinfluencer` MCP provider; there is no standalone CLI backend or fallback path.

## Selection Algorithm

1. Read `{baseDir}/references/codex-plugin-runtime.md` and `{baseDir}/references/mcp-runtime.md` before the first business operation.
2. Verify that the connected provider named `noxinfluencer` exposes the Tool required for the user's request.
3. Follow the one-attempt Codex Host OAuth bootstrap in `mcp-runtime.md` when the explicitly invoked Plugin has loaded no `noxinfluencer` Tools at all and no transport failure is known, or when the MCP connection or Tool call explicitly returns `AuthRequired` or HTTP `401`. Do not bootstrap merely because one business Tool is absent while another provider Tool is loaded.
4. After successful Host authorization, recheck the Tool catalog and retry the original operation when the Tool is available.
5. If the current task cannot refresh its Tool catalog, tell the user to create a new Codex task and resend the original request.
6. Report a capability as unavailable only after authorization succeeded, the MCP connection and Tool catalog were refreshed, and the required Tool is still absent.

## Continuity and Boundaries

- Keep MCP selected for the complete workflow, including follow-up reads, previews, mutations, polling, downloads, and error recovery.
- Do not combine MCP identifiers or results with data from another backend.
- A missing OAuth grant, `401`, `403`, quota error, validation error, unavailable dependency, timeout, or missing Tool is never permission to use a CLI.
- Do not invent a Tool, parameter, Resource, route, or capability that is absent from the live provider.
- Preserve read-before-write behavior, stable identifiers, preview/validation/confirmation semantics, explicit approval requirements, quota explanations, platform boundaries, and error recovery.
- Translate business concepts into the connected Tool's runtime name, description, and input schema. Never execute a shell command merely because a workflow or reference uses a command-like label.

## MCP Authentication Boundary

When authorization is needed, actively start the authorization surface owned by the current Codex host at most once per user request. Windows uses the packaged OAuth helper; macOS/Linux uses an independently executable `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user`. The registration value is case-sensitive and must remain lowercase. This is a Host control action, not a NoxInfluencer business backend.

Let the Host perform DCR, PKCE, state validation, loopback callback, browser authorization, and Token storage. Never:

- construct an `/authorize` URL or request, print or store OAuth Tokens, authorization codes, `state`, `code_verifier`, cookies, or callback parameters;
- call kol-next or a Java service directly;
- construct a user identity from Tool arguments;
- request or install the NoxInfluencer CLI;
- fall back to a CLI after an OAuth challenge or failure.

Do not repeat Host login after cancellation, helper failure, `403`, or `insufficient_scope`. If the helper cannot start OAuth, direct the user to Connect/Re-authorize for NoxInfluencer in Codex settings.

Read `{baseDir}/references/mcp-runtime.md` for the exact Tool contracts, OAuth failure branches, and Browser Handoff rules.
