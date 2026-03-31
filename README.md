# NoxInfluencer Skills

Agent skill for influencer marketing: creator discovery, due-diligence analysis, contact retrieval, and video monitoring across YouTube, TikTok, and Instagram.

Official website: [https://www.noxinfluencer.com/](https://www.noxinfluencer.com/)

## Structure

```
skills/
└── nox-influencer/            # Canonical skill source for ClawHub/OpenClaw/skills.sh
    ├── SKILL.md
    └── references/

.claude-plugin/
└── marketplace.json           # Claude Code marketplace wrapper

plugins/
└── nox-influencer/
    ├── .claude-plugin/
    │   └── plugin.json        # Claude Code plugin manifest
    └── skills/
        └── nox-influencer -> ../../../skills/nox-influencer

evals/
└── nox-influencer/            # Evaluation assets, not part of release artifact

refs/                          # Local development references, not part of release artifact
```

## Canonical Source

- `skills/nox-influencer/` is the only skill source of truth.
- ClawHub uploads use that directory directly.
- OpenClaw loads that directory directly.
- skills.sh discovers that directory directly.
- Claude Code compatibility is added as a thin wrapper around the same files; it does not own a second copy of the skill.

## Platform Matrix

| Platform | Packaging entry | Published identity |
|----------|-----------------|--------------------|
| ClawHub | `skills/nox-influencer/` | slug `noxinfluencer` |
| OpenClaw | `skills/nox-influencer/` | skill `nox-influencer` |
| skills.sh | repo root `skills/` tree | skill `nox-influencer` |
| Claude Code Plugin Marketplace | repo root `.claude-plugin/marketplace.json` + `plugins/nox-influencer/` | marketplace `noxinfluencer`, plugin `nox-influencer` |

Identity mapping:

- skill name: `nox-influencer`
- ClawHub slug: `noxinfluencer`
- Claude marketplace name: `noxinfluencer`
- Claude plugin name: `nox-influencer`

## Development

See `refs/SKILL_SPEC.md` and `refs/ARCHITECTURE.md` for local development guidance.

## Validation

Schema and CLI sanity checks:

- `noxinfluencer schema creator.search`
- `noxinfluencer schema 'creator search'`
- `noxinfluencer auth --help`

Discovery and runtime checks:

- `npx -y skills add . --list`
- `npx -y skills add . --list --agent openclaw`
- `npx -y skills add . --list --agent claude-code`
- `openclaw skills check`
- `clawhub inspect noxinfluencer`

Claude marketplace checks:

- `claude plugin validate .claude-plugin/marketplace.json`
- `claude plugin validate plugins/nox-influencer`

## Release Notes

- Official ClawHub org releases should be published from the web UI under `@noxinfluencer`.
- Continue uploading only `skills/nox-influencer/` to ClawHub; do not upload the repo root there.
- Do not use `clawhub publish` as the final org release path because the CLI still cannot select an org publisher.
- The Claude marketplace wrapper exists for Claude Code compatibility only; it is not the release source for ClawHub or OpenClaw.
