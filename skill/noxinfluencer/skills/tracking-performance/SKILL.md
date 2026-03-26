---
name: tracking-performance
description: Manages video monitoring projects, adds videos for tracking, and retrieves project-level monitoring status. Use when the user wants to set up or check video performance monitoring.
---

# Tracking Performance

Manage video monitoring projects and tracked videos. This skill is operational — it manages monitoring, not performance judgment.

## When to Use

- User wants to list, create, or manage monitoring projects
- User wants to add a video to a project
- User wants project summaries or task snapshots

Do not use for creator sourcing, due diligence, contact retrieval, or marketing performance judgment.

## Workflow

1. List projects first when the target project is unclear.
2. Create a project when user wants a new one.
3. If user wants to create a project AND monitor a video in one request, create first then add task.
4. For project overview, use summary first; for specific videos, use task list.
5. Keep it operational. Do not drift into performance analysis.

Use `noxinfluencer schema monitor.<subcommand>` (e.g., `schema monitor.create`) for parameter details. Write operations (create, add-task) default to dry-run for safety — use `--force` to execute.

## Project Identification Rules

- Prefer `project_id` over `project_name` after the first lookup.
- Project names may repeat. Never choose a duplicated name automatically.
- If names collide, show only disambiguation fields: project_id, name, created time, platforms, monitor count.
- If no project is fixed yet, ask whether to create new or add to existing.
- Once a project is selected in conversation, keep using that `project_id` until user switches.

## Output Rules

Keep responses operational and concise:
- Project lists: name, project_id, platforms, monitor count
- Summaries: monitor count, total views/likes/comments, avg engagement, platform breakdown
- Task lists: creator name, video title, views, engagement rate, status
- Do not turn outputs into performance verdicts
- For long task lists, show a concise subset first and mention pagination

## Status Interpretation

| Status | Meaning |
|--------|---------|
| `loading` | Initializing |
| `monitoring` | Actively collecting data |
| `completed` | Monitoring period ended |
| `video restricted` | Video unavailable |
| `invalid link` | URL could not be resolved |

## Boundaries

Do not use for: deciding if performance is strong/weak, recommending campaign actions, explaining creator or audience quality, finding creators or retrieving contacts.

## Error Handling

If an operation fails, use the CLI response's `action` field for next steps. For `DUPLICATE_DATA`, tell user the video is already being monitored in that project.

## References

- [CLI Response Format](../../references/cli-response-format.md) — response structure and credit costs
- [Platform Support](../../references/platform-support.md) — data availability differences by platform
