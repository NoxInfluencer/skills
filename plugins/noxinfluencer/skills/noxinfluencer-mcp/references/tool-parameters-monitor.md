# MCP tools for monitor

## `add_monitor_task`

Add one published video URL to an authorized monitoring project.

- `project_id` (integer, required).
- `video_url` (string, required).
- `monitor_days` (integer, optional, default 60).
- `idempotency_key` (string, required).

## `add_monitor_task_labels`

Add up to 100 labels to up to 100 tasks in one authorized monitoring project.

- `project_id` (integer, required).
- `task_ids` (array of integer, required).
- `label_ids` (array of integer, required).
- `idempotency_key` (string, required).

## `create_monitor_label`

Create or reuse one video monitor label in a selected label group.

- `label_name` (string, required).
- `group_id` (integer, optional, default 1).
- `idempotency_key` (string, required).

## `create_monitor_project`

Create one video monitoring project for the authorized account.

- `project_name` (string, required).
- `idempotency_key` (string, required).

## `delete_monitor_label`

Delete one authorized video monitor label after explicit user approval.

- `label_id` (integer, required).
- `idempotency_key` (string, required).

## `get_monitor_auto_track_import_template`

Get the validated HTTPS download reference for the SaaS auto-track creator workbook.

- `language` (string, optional).

## `get_monitor_auto_track_rule`

Get one authorized auto-track rule and its creator set.

- `project_id` (integer, required).
- `rule_id` (integer, required).

## `get_monitor_import_template`

Get the validated HTTPS download reference for the SaaS video task import workbook.

- `language` (string, optional).

## `list_monitor_auto_track_rules`

List auto-track rules in one authorized video monitor project.

- `project_id` (integer, required).
- `status` (string, optional).
- `keyword` (string, optional).

## `list_monitor_labels`

List the authorized account's video monitor labels, optionally by group.

- `group_id` (integer, optional).

## `monitor_history`

Read time-series performance history for a monitored video task.

- `task_id` (integer, required).
- `granularity` (string, optional, default "daily").
- `start_date` (string, optional).
- `end_date` (string, optional).

## `monitor_list`

List video monitoring projects available to the authorized account.

- `keyword` (string, optional).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `monitor_summary`

Read aggregate performance summary for a video monitoring project.

- `project_id` (integer, required).

## `monitor_tasks`

List tracked videos and creators in a video monitoring project.

- `project_id` (integer, required).
- `keyword` (string, optional).
- `page_num` (integer, optional, default 1).
- `page_size` (integer, optional, default 20).

## `prepare_monitor_auto_track_import_report_download`

Create a one-time download URL for a bounded auto-track import failure workbook.

- `items` (array of object, required).

## `prepare_monitor_dashboard_report_download`

Create a one-time download URL for an authorized monitoring dashboard workbook.

- `project_ids` (array of integer, optional).
- `task_ids` (array of integer, optional).
- `select_all` (boolean, optional, default false).
- `keywords` (string, optional).
- `platform` (string, optional).
- `countries` (array of string, optional).
- `label_ids` (array of integer, optional).
- `monitor_days` (array of integer, optional).
- `views_min` (integer, optional).
- `views_max` (integer, optional).
- `publish_start_date` (string, optional).
- `publish_end_date` (string, optional).
- `language` (string, optional).
- `observation_start_date` (string, optional).
- `observation_end_date` (string, optional).

## `prepare_monitor_import_report_download`

Create a one-time download URL for a bounded task import failure workbook.

- `items` (array of object, required).

## `prepare_monitor_project_report_download`

Create a one-time download URL for an authorized project monitoring workbook.

- `project_ids` (array of integer, optional).
- `task_ids` (array of integer, optional).
- `select_all` (boolean, optional, default false).
- `keywords` (string, optional).
- `platform` (string, optional).
- `countries` (array of string, optional).
- `label_ids` (array of integer, optional).
- `monitor_days` (array of integer, optional).
- `views_min` (integer, optional).
- `views_max` (integer, optional).
- `publish_start_date` (string, optional).
- `publish_end_date` (string, optional).
- `language` (string, optional).

## `prepare_monitor_task_report_download`

Create a one-time download URL for one authorized video monitoring task workbook.

- `task_id` (integer, required).
- `language` (string, optional).
- `start_date` (string, optional).
- `end_date` (string, optional).

## `remove_monitor_task_labels`

Remove up to 100 labels from up to 100 tasks in one authorized monitoring project.

- `project_id` (integer, required).
- `task_ids` (array of integer, required).
- `label_ids` (array of integer, required).
- `idempotency_key` (string, required).

## `replace_monitor_task_labels`

Replace one label group on exactly one authorized video monitor task.

- `project_id` (integer, required).
- `task_ids` (array of integer, required).
- `group_id` (integer, required).
- `label_ids` (array of integer, required).
- `idempotency_key` (string, required).

## `update_monitor_label`

Rename one authorized video monitor label and optionally move its group.

- `label_id` (integer, required).
- `label_name` (string, required).
- `group_id` (integer, optional).
- `idempotency_key` (string, required).
