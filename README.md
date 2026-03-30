# NoxInfluencer Skills

Agent skill for influencer marketing — creator discovery, analysis, outreach, and monitoring across YouTube, TikTok, and Instagram.

## Structure

```
skills/
└── nox-influencer/
    ├── SKILL.md               # Skill instructions
    ├── references/            # Supporting docs
    │   ├── cli-response-format.md
    │   ├── platform-support.md
    │   ├── search-filters.md
    │   └── verdict-heuristics.md
    └── evals/                 # Evaluation assets

refs/                          # Development references
```

## Scope

- This repository contains agent skill specifications only.
- CLI and server code are maintained in the private `kol_claw` repository.
- Skills follow the Agent Skills Standard for cross-platform compatibility.

## Platform Support

- Claude Code
- Anthropic Agent SDK
- Anthropic Skills API
- OpenClaw
- Other SKILL.md-compatible agent runtimes

## Development

See `refs/SKILL_SPEC.md` and `refs/ARCHITECTURE.md` for development guidelines.
