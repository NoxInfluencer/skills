# NoxInfluencer Skills

Agent skills for creator discovery, analysis, contact retrieval, account management, and video monitoring across YouTube, TikTok, and Instagram.

## Skills

| Skill | Purpose |
|-------|---------|
| [discovering-creators](skills/discovering-creators/SKILL.md) | Search and shortlist creators matching specified criteria |
| [analyzing-creator](skills/analyzing-creator/SKILL.md) | Due diligence with go/no-go verdict on a specific creator |
| [managing-account](skills/managing-account/SKILL.md) | API key configuration and quota management |
| [retrieving-contacts](skills/retrieving-contacts/SKILL.md) | Creator contact information retrieval |
| [tracking-performance](skills/tracking-performance/SKILL.md) | Video monitoring project and task management |

## Workflow

```
discovering-creators
    ↓ user selects a candidate
analyzing-creator
    ↓ user decides to reach out
retrieving-contacts
    ↓
tracking-performance (as needed for campaign monitoring)
managing-account (as needed for auth/quota issues)
```

## Shared References

| Reference | Content |
|-----------|---------|
| [cli-response-format.md](references/cli-response-format.md) | Unified JSON response structure and credit costs |
| [error-codes.md](references/error-codes.md) | Error codes, HTTP status, and handling guidelines |
| [platform-support.md](references/platform-support.md) | YouTube, TikTok, Instagram data availability differences |

## Development

Read [SKILL_SPEC.md](SKILL_SPEC.md) before creating or modifying any skill.

Key principles:

- **Narrow skills**: each skill has a single, well-defined responsibility
- **Decision-oriented output**: lead with verdicts and actions, not data dumps
- **Eval-first development**: establish baselines before writing instructions
- **Platform-agnostic**: use only standard frontmatter fields for cross-platform portability

## Platform Compatibility

These skills follow the Agent Skills Standard and are compatible with:

- Claude Code (via `.claude-plugin/plugin.json`)
- Anthropic Agent SDK
- Anthropic Skills API
- OpenClaw
- Other agent platforms that support `SKILL.md` format
