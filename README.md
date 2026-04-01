# NoxInfluencer Skills

Agent skill for influencer and creator marketing: creator discovery, due-diligence analysis, outreach-ready contact retrieval, and campaign video monitoring across YouTube, TikTok, and Instagram.

Official website: [https://www.noxinfluencer.com/](https://www.noxinfluencer.com/)
ClawHub: [https://clawhub.ai/noxinfluencer/noxinfluencer](https://clawhub.ai/noxinfluencer/noxinfluencer)

## Install

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer
```

## Structure

```
skills/
└── noxinfluencer/             # Canonical skill source for ClawHub/OpenClaw/skills.sh
    ├── SKILL.md
    └── references/

.claude-plugin/
└── marketplace.json           # Claude Code marketplace wrapper

plugins/
└── nox-influencer/
    ├── .claude-plugin/
    │   └── plugin.json        # Claude Code plugin manifest
    └── skills/
        └── noxinfluencer -> ../../../skills/noxinfluencer

evals/
└── noxinfluencer/             # Evaluation assets, not part of release artifact

refs/                          # Local development references, not part of release artifact
```

## Canonical Source

- `skills/noxinfluencer/` is the only skill source of truth.
- ClawHub uploads use that directory directly.
- OpenClaw loads that directory directly.
- skills.sh discovers that directory directly.
- Claude Code compatibility is added as a thin wrapper around the same files; it does not own a second copy of the skill.

## Symlink Note

- `plugins/nox-influencer/skills/noxinfluencer` is a Git symlink to the canonical skill directory.
- This works for current macOS/Linux development and Claude plugin validation, but some Windows and CI environments need explicit symlink support.
- If symlinks are unavailable, recreate the link or copy `skills/noxinfluencer/` into the plugin package as a build artifact.
- ClawHub uploads should still use `skills/noxinfluencer/` directly; do not upload the Claude wrapper paths.

## Platform Matrix

| Platform | Packaging entry | Published identity |
|----------|-----------------|--------------------|
| ClawHub | `skills/noxinfluencer/` | slug `noxinfluencer` |
| OpenClaw | `skills/noxinfluencer/` | skill `noxinfluencer` |
| skills.sh | repo root `skills/` tree | skill `noxinfluencer` |
| Claude Code Plugin Marketplace | repo root `.claude-plugin/marketplace.json` + `plugins/nox-influencer/` | marketplace `noxinfluencer`, plugin `nox-influencer` |

Identity mapping:

- skill name: `noxinfluencer`
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
- Continue uploading only `skills/noxinfluencer/` to ClawHub; do not upload the repo root there.
- Do not use `clawhub publish` as the final org release path because the CLI still cannot select an org publisher.
- The Claude marketplace wrapper exists for Claude Code compatibility only; it is not the release source for ClawHub or OpenClaw.
