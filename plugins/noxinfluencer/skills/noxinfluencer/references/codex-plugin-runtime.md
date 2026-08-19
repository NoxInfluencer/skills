# Codex Plugin Runtime

This file is generated only in the NoxInfluencer Codex Plugin package. Its presence is the authoritative execution-backend marker for the bundled Skill.

- Use the connected MCP provider named `noxinfluencer` for every NoxInfluencer operation.
- Reuse the shared business workflows and guardrails from the Skill.
- The Skill may run `codex mcp login noxinfluencer --oauth-client-registration DCR --scopes noxinfluencer.codex.user` once per user request, only to ask the Codex Host to bootstrap MCP OAuth.
- That Host command is not the NoxInfluencer CLI backend and is not a business-command fallback. Let the Codex Host handle DCR, PKCE, state, the loopback callback, browser authorization, and Token storage.
- Never execute `noxinfluencer login`, any NoxInfluencer CLI business command, Device Flow, or API-key setup in this packaged runtime.
- Never fall back to the NoxInfluencer CLI when OAuth, MCP connection, or Tool availability fails. Never request, construct, print, or store OAuth credentials or authorization URLs in the Skill.
