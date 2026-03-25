# Video Monitoring Command Reference

Full command syntax and parameter details for video monitoring operations (CLI v0.2.0+).

## List Projects

```bash
noxinfluencer monitor list [--keyword <value>] [--page_num <n>] [--page_size <n>]
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--keyword` | string | — | Filter projects by name keyword |
| `--page_num` | number | 1 | Page number |
| `--page_size` | number | 20 | Results per page |

**Response fields:** project_id, project_name, created_at, monitor_count, platforms

## Create Project

```bash
noxinfluencer monitor create --project_name <name> --force
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `--project_name` | string | yes | Name for the new monitoring project |
| `--force` | flag | yes* | Execute the mutation (without it, dry-run only) |
| `--body-file` | path | no | Read body from file or stdin (`-`) |

**Write operation**: defaults to dry-run. Must include `--force` to actually create.

**Response:** project_id, project_name, created_at

## Add Monitoring Task

```bash
noxinfluencer monitor add-task --project_id <id> --video_url <url> [--monitor_days <n>] --force
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `--project_id` | string | yes | — | Target project ID |
| `--video_url` | string | yes | — | YouTube, TikTok, or Instagram video URL |
| `--monitor_days` | number | no | 30 | Monitoring duration: `30`, `60`, or `180` only |
| `--force` | flag | yes* | — | Execute the mutation (without it, dry-run only) |
| `--body-file` | path | no | — | Read body from file or stdin (`-`) |

**Write operation**: defaults to dry-run. Must include `--force` to actually add.

**Response:** task_id, video_url, monitor_days, status

**Notes:**
- Only `30`, `60`, and `180` are accepted for `monitor_days`. Other values will be rejected.
- Adding the same video URL to the same project returns `DUPLICATE_DATA` error.

## List Tasks

```bash
noxinfluencer monitor tasks --project_id <id> [--keyword <value>] [--page_num <n>] [--page_size <n>]
```

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `--project_id` | string | yes | — | Target project ID |
| `--keyword` | string | no | — | Filter by video title or creator name |
| `--page_num` | number | no | 1 | Page number |
| `--page_size` | number | no | 20 | Results per page |

**Response fields per task:** task_id, platform, video_url, monitor_days, status, creator_name, video_title, published_at, views, likes, comments, engagement_rate

## Get Project Summary

```bash
noxinfluencer monitor summary --project_id <id>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `--project_id` | string | yes | Target project ID |

**Response fields:** project_id, project_name, monitor_count, total_views, total_likes, total_comments, avg_engagement_rate, platform_breakdown

## Task Status Values

| Status | Meaning |
|--------|---------|
| `loading` | Task is initializing |
| `monitoring` | Actively collecting data |
| `completed` | Monitoring period ended |
| `video restricted` | Video is restricted or unavailable |
| `invalid link` | URL could not be resolved |

## Global Options

All commands support:

| Flag | Description |
|------|-------------|
| `--json` | JSON output (default) |
| `--plain` | Plain text / TSV output |
| `--verbose` | Request details to stderr |
| `--dry-run` | Explicit preview mode |
| `--force` | Execute write operations |
| `--no-input` | Agent mode: fail instead of prompting |
| `--env <env>` | Override environment (online/pre/test/dev) |
