# MCP Skill evaluations

These 14 plugin-owned cases retain IDs 51–64 from the branch. They exercise `noxinfluencer-mcp` under `skills/mcp/`; the standalone evaluation set is maintained independently on main. The provider is still named `noxinfluencer`. The two shared business Skills now have MCP-filtering plugin entrypoints and generated upstream references. Snapshot and packaging tests cover their delivery; these 14 cases do not establish their behavioral compliance with the execution filter.

Coverage includes MCP-only routing and continuity, exact pagination fields, Browser Handoff, runtime Tool-schema limits, Host-owned OAuth, one automatic Codex attempt, settings fallback, Tool refresh, `403`/`insufficient_scope`, cancellation, unavailable Host commands, credential non-disclosure, and prohibition on hand-built authorization URLs. The standalone request is a non-activation control: the plugin must not change or take over that Skill.

Cases distinguish a missing business Tool from an unconnected provider: a single absent Tool with other provider Tools loaded does not start OAuth. Codex-only commands and helpers must never be run by Claude Code or WorkBuddy. No generated package marker selects a backend.

From the plugin directory:

```bash
python evals/mcp/validate_evals.py
python evals/mcp/validate_evals.py --self-test
```

These are document-structure checks, not live behavior tests. Behavioral evaluation must review actual Tool traces and avoid live mutations without authorization. Keep transient transcripts in the ignored `evals/mcp/workspace/` directory. No evaluation files enter runtime packages.
