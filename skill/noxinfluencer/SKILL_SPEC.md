# NoxInfluencer Skill Development Specification

Platform-agnostic specification for developing and maintaining NoxInfluencer agent skills.

## Skill Format

Every skill is defined by a `SKILL.md` file inside a named directory under `skills/`.

### Minimum Structure

```
skills/<skill-name>/
└── SKILL.md
```

### Extended Structure

```
skills/<skill-name>/
├── SKILL.md              # Required: metadata + instructions
├── references/           # Optional: detailed docs, parameter tables
│   └── *.md
├── scripts/              # Optional: deterministic utility scripts
│   └── *.py / *.sh
└── templates/            # Optional: output templates
    └── *.md
```

## SKILL.md Format

Every `SKILL.md` must begin with YAML frontmatter:

```yaml
---
name: skill-name
description: What the skill does and when to use it. Third-person voice.
---
```

### Required Fields

| Field | Rules |
|-------|-------|
| `name` | Lowercase letters, numbers, hyphens only. Must match the directory name. Max 64 characters. Use gerund style (e.g., `discovering-creators`). |
| `description` | Must describe **what** the skill does AND **when** to use it. Third-person voice. Max 1024 characters. No XML tags. |

### Optional Fields (Platform-Specific)

These fields are recognized by Claude Code but may be ignored by other agent platforms:

| Field | Purpose |
|-------|---------|
| `argument-hint` | Arguments shown in autocomplete |
| `disable-model-invocation` | Prevent auto-invocation (manual trigger only) |
| `user-invocable` | Hide from slash-command menu when `false` |
| `allowed-tools` | Restrict available tools during execution |
| `model` | Override model selection |
| `effort` | Override effort level (`low`, `medium`, `high`, `max`) |
| `context` | Set to `fork` for isolated subagent execution |

For maximum cross-platform portability, use only `name` and `description` in frontmatter.

## Content Guidelines

### Length

- SKILL.md body: **under 500 lines**.
- If content exceeds this, extract detail into `references/` files.
- Reference files over 100 lines should include a table of contents at the top.

### Structure

Every SKILL.md should include:

1. **When to Use** — trigger conditions and scope boundaries
2. **Workflow** — numbered steps for the primary task flow
3. **Command Mapping** — CLI commands with parameters
4. **Output Rules** — what the response should look like
5. **Error Handling** — how to handle common failures
6. **Handoff Rules** — when to delegate to other skills (if applicable)

### Writing Style

- Be concise. Avoid generic filler.
- Use numbered steps for workflows, not prose paragraphs.
- State scope boundaries explicitly: what the skill does AND does not do.
- Lead with decisions, not data dumps.
- Use checklists for quality-critical evaluation flows.

### References

- Link to reference files with relative paths: `See [search-filters.md](references/search-filters.md)`
- Keep references one level deep (no nested references).
- Shared references across skills live in the plugin-level `references/` directory.

### Scripts

- Use scripts only for deterministic, repeatable, verifiable operations.
- Scripts should handle their own errors, not punt to the model.
- Prefer "execute it" over "read it" — scripts are tools, not documentation.

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Skill directory | kebab-case, gerund | `discovering-creators` |
| SKILL.md `name` | Must match directory name | `discovering-creators` |
| Reference files | kebab-case, descriptive | `search-filters.md` |
| Script files | kebab-case | `validate-response.py` |

## Cross-Platform Deployment

This skill set is designed to work across multiple agent platforms:

| Platform | How Skills Are Loaded |
|----------|----------------------|
| **Claude Code** | Auto-discovered from `.claude/skills/` or via plugin. Uses `.claude-plugin/plugin.json` manifest. |
| **Agent SDK** | Set `setting_sources: ['user', 'project']` to enable skill loading. `allowed-tools` in SKILL.md is ignored; use `allowedTools` in the SDK request. |
| **Skills API** | Upload via `POST /v1/skills`. Pin to specific version in production. |
| **OpenClaw** | Copy to workspace `skills/` or `~/.openclaw/skills/` directory. May use `metadata.openclaw` for platform-specific config. |
| **Other Agents** | Load SKILL.md directly. Only `name` and `description` are universally recognized. |

## Quality Standards

Before publishing a skill:

- [ ] `name` matches directory name
- [ ] `description` states what AND when, in third-person
- [ ] SKILL.md is under 500 lines
- [ ] No hardcoded secrets or environment-specific values
- [ ] Cross-skill references use current skill names
- [ ] Error handling covers auth, quota, and missing ID scenarios
- [ ] Scope boundaries are explicitly stated

## Evaluation Methodology

Follow eval-first development:

1. Run representative tasks **without** the skill to establish a baseline
2. Write a minimal skill version
3. Compare with-skill vs. baseline performance
4. Iterate based on actual behavior, not assumptions
5. Prepare 3-5 eval queries per skill: should-trigger, should-not-trigger, and boundary cases

Eval assets are stored in the `evals/` directory.

## Business Alignment

All skill behavior must stay aligned with the CLI and Server contracts maintained in the `kol_claw` repository:

- CLI commands, parameters, and response structures are the source of truth
- Skills document workflows and decision logic; they do not implement API calls directly
- External data access and actions are provided through CLI tools or MCP, not through skill scripts
