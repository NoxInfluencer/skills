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

evals/
└── nox-influencer/            # Evaluation assets and benchmark artifacts

refs/                          # Development references
```

## Scope

- This repository contains agent skill specifications only.
- CLI and server code are maintained in the private `kol_claw` repository.
- Published compatibility target is OpenClaw + ClawHub.

## Platform Support

- OpenClaw
- ClawHub

## Development

See `refs/SKILL_SPEC.md` and `refs/ARCHITECTURE.md` for development guidelines.

## OpenClaw / ClawHub Release

Use `skills/nox-influencer/` as the only release directory. It should contain only `SKILL.md` and bundled support files under `references/`.

Pre-publish checks:

- `noxinfluencer schema creator.search`
- `noxinfluencer schema 'creator search'`
- `noxinfluencer auth --help`
- `openclaw skills check`

Release notes:

- Skill name in `SKILL.md` remains `nox-influencer`
- ClawHub slug remains `noxinfluencer`
- Official org releases should be done from the ClawHub web UI under `@noxinfluencer`
- Do not use `clawhub publish` as the final organization release path because the CLI cannot choose an org publisher
