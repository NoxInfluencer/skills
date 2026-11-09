# Monitoring

Monitoring manages tracked creator content and performance collection. It does not decide whether a creator is suitable for collaboration.

## Published Content

For known published URLs, identify the target project and add only the selected content. Preserve the returned task and creator identities. Reject malformed or unsupported URLs as row-level failures rather than silently changing the target.

Project summaries answer aggregate performance questions. Task lists answer which videos are tracked and their current metrics. History answers how a tracked item changed over time. Keep these result types distinct.

## Future Content

Future-content tracking watches selected creators for newly published content. A rule must define the project, creators, supported platforms, time boundary, and any matching criteria. Do not treat historical content as future tracking unless the user explicitly requests a backfill supported by the capability.

Spreadsheet rule imports are all-or-nothing when validation reports failed rows. Explain the failed items, correct the workbook, and retry; do not claim a partial rule was created.

## Reports And Scale

Monitoring reports are direct report jobs associated with a project or task selection. They are not shared asynchronous exports. Keep report identity and readiness state until the report can be retrieved.

Use bounded pages for projects, tasks, and history. For many creators or URLs, batch within the accepted request limit, retain row-level failures, and avoid one remote request per row when a batch operation exists.
