# NoxInfluencer Skills

This repository contains the OpenClaw skill assets used by the NoxInfluencer agent workflow.

## Repository Structure

```text
skills/
├── README.md
└── skill/
    └── openclaw/
        ├── OPENCLAW_SKILL_SPEC.md
        ├── README.md
        ├── analyze-creator/
        ├── discover-creators/
        ├── nox-account/
        └── outreach-creators/
```

## Scope

- This repository currently publishes only the OpenClaw skill set.
- `server/`, `cli/`, and business docs are maintained in the private `kol_claw.git` repository.
- Claude-specific skill files are intentionally not managed in this repository.

## Development Notes

- Read `skill/openclaw/OPENCLAW_SKILL_SPEC.md` before changing any OpenClaw skill.
- Keep skill behavior aligned with the CLI and Server contracts maintained in the private project repository.
