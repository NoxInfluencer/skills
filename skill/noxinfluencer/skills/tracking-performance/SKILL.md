---
name: tracking-performance
description: Manages video monitoring projects, adds videos for tracking, and retrieves project-level monitoring status. Use when the user wants to set up or check video performance monitoring.
---

# Tracking Performance

Use this skill for operational video-monitoring management. It manages projects and monitored videos, but does not judge performance quality.

## When to Use

Use this skill when the user:

- wants to list monitoring projects
- wants to create a monitoring project
- wants to add a video into a project
- wants to inspect a project summary or task snapshot

Do not use this skill for creator sourcing, creator due diligence, contact retrieval, or marketing performance judgment.

## Workflow

1. List projects first when the target project is unclear.
2. Create a project when the user wants a new one.
3. If the user asks to create a project and monitor a video in one request, create the project first and add the task immediately after.
4. To add a video into an existing project, require a `project_id`.
5. For project overview, use `get_video_monitor_project_summary` first.
6. For specific monitored videos, use `list_video_monitor_tasks`.
7. Keep the workflow operational. Do not drift into performance analysis.

## Command Mapping

See [command-reference.md](references/command-reference.md) for the full command syntax and parameter details.

Core commands:

- `noxinfluencer list_video_monitor_projects` — List projects
- `noxinfluencer create_video_monitor_project --project_name <name>` — Create project
- `noxinfluencer add_video_monitor_task --project_id <id> --video_url <url> --monitor_days <days>` — Add video
- `noxinfluencer list_video_monitor_tasks --project_id <id>` — List tasks
- `noxinfluencer get_video_monitor_project_summary --project_id <id>` — Project summary

`monitor_days` rules:

- allowed values: `30`, `60`, `180`
- default: `30`
- if the user asks for another value, ask them to choose one of the supported values

## Project Identification Rules

- Always prefer `project_id` over `project_name` after the first lookup.
- Project names may repeat. Never choose a duplicated name automatically.
- If several projects share a name, show only the fields needed for disambiguation:
  - `project_id`
  - project name
  - created time
  - platforms
  - monitor count
- If the user wants to add a video but no project is fixed yet, ask whether to create a new project or add to an existing one.
- Once the user has selected a project in the current conversation, keep using that same `project_id` until they switch projects.

## Output Rules

Keep responses operational and concise.

- Project lists: prioritize project name, `project_id`, platforms, and monitor count.
- Project summary: prioritize monitor count, total views, total likes, total comments, average engagement rate, and platform breakdown.
- Task lists: prioritize creator name, video title, current views, engagement rate, and status.
- Do not turn these outputs into a performance verdict.
- If a task list is long, show a concise visible subset first and mention pagination.

## Status Rules

The API returns task status as English description. Use it directly:
- `loading`
- `monitoring`
- `completed`
- `video restricted`
- `invalid link`

## Error Handling

- If the API returns `DUPLICATE_DATA`, tell the user that the same video is already being monitored in that project.
- If authentication fails, route the user to `managing-account`.
- If quota or permission errors block the operation, surface the returned error clearly and keep the explanation short.
- If the link is invalid or the task status comes back as `invalid link`, tell the user that the provided video link could not be accepted for monitoring.
- If the user first asks for a project overview, use `get_video_monitor_project_summary` before listing tasks.
- If the user then asks about a specific monitored video, use `list_video_monitor_tasks` with a keyword when possible.
- If the user provides multiple video URLs, handle them as separate add operations.

## Boundaries

This skill is for monitoring management only.

Do not use it for:

- deciding whether performance is strong or weak
- recommending campaign actions
- explaining creator quality or audience quality
- finding creators or retrieving contact details
