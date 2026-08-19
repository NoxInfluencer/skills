# Codex Plugin Runtime

This file is generated only in the NoxInfluencer Codex Plugin package. Its presence is the authoritative execution-backend marker for the bundled Skill.

- Use the connected MCP provider named `noxinfluencer` for every NoxInfluencer operation.
- Reuse the shared business workflows and guardrails from the Skill.
- When OAuth is required, actively start the Codex Host OAuth flow exactly once per user request. On Windows desktop or CLI conversations, use the bundled `scripts/start-codex-oauth.ps1` helper; on macOS/Linux, use an independently executable `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user`. The CLI registration value is case-sensitive and must remain lowercase.
- The Windows helper may invoke the Plugin App Server control CLI already installed under the current `CODEX_HOME`. It must never invoke a `WindowsApps` alias, copy or elevate an executable, construct an authorization URL, or read OAuth credentials.
- Let the Codex Host handle DCR, PKCE, state, the loopback callback, external-browser authorization, and Token storage. Fall back to NoxInfluencer Connect/Re-authorize in Codex settings only when the one automatic attempt cannot start or the user cancels it.
- Never execute `noxinfluencer login`, any NoxInfluencer CLI business command, Device Flow, or API-key setup in this packaged runtime.
- Never fall back to the NoxInfluencer CLI when OAuth, MCP connection, or Tool availability fails. Never request, construct, print, or store OAuth credentials or authorization URLs in the Skill.
