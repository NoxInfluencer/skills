# NoxInfluencer Skills

Agent skill assets for the NoxInfluencer workflow. These skills power creator discovery, analysis, outreach, and monitoring capabilities across YouTube, TikTok, and Instagram.

## Repository Structure

```
skill/
└── noxinfluencer/                 # NoxInfluencer skill plugin
    ├── .claude-plugin/
    │   └── plugin.json            # Plugin manifest
    ├── README.md                  # Plugin overview
    ├── SKILL_SPEC.md              # Skill development specification
    ├── skills/                    # Individual skills
    │   ├── discovering-creators/
    │   ├── analyzing-creator/
    │   ├── managing-account/
    │   ├── retrieving-contacts/
    │   └── tracking-performance/
    ├── references/                # Shared reference docs
    └── evals/                     # Evaluation assets
```

## Scope

- This repository contains agent skill specifications only.
- `server/`, `cli/`, and business docs are maintained in the private `kol_claw` repository.
- Skills follow the Agent Skills Standard for cross-platform compatibility.

## Platform Support

These skills are designed to work with multiple agent platforms:

- Claude Code (plugin)
- Anthropic Agent SDK
- Anthropic Skills API
- OpenClaw
- Other SKILL.md-compatible agent runtimes

## Development

Read `skill/noxinfluencer/SKILL_SPEC.md` before changing any skill. Keep skill behavior aligned with the CLI and Server contracts in the private project repository.
