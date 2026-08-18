# Codex Plugin Runtime

This file is generated only in the NoxInfluencer Codex Plugin package. Its presence is the authoritative execution-backend marker for the bundled Skill.

- Use the connected MCP provider named `noxinfluencer` for every NoxInfluencer operation.
- Reuse the shared business workflows and guardrails from the Skill.
- Do not execute or fall back to the NoxInfluencer CLI in this packaged runtime.
- Let the Codex MCP Client handle OAuth; never request or store credentials in the Skill.
