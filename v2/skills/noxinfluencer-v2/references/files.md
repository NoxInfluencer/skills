# Standalone CLI Files, Imports, And Exports

CLI file operations use local filesystem paths declared by the current command schema. Keep local paths out of user-facing summaries except when the user needs the completed destination, and never reinterpret a path as a server-side object identity.

## Inputs And Templates

- Use `--file` only for commands whose schema declares that option, including approved attachments, images, evidence, or spreadsheets.
- Use `--body-file` for JSON-first commands whose schema declares `supports_body_file: true`; prefer standard input when persisting a temporary JSON file is unnecessary.
- Always download the current domain `import-template` before preparing a spreadsheet. Do not infer columns from an old workbook.
- Enforce the schema's extension, byte-size, row-count, item-count, and task-state limits before upload. Do not load a large workbook into the response or issue one remote call per row when the CLI exposes a batch import.

Monitor task imports accept `.xls` or `.xlsx` up to 10 MB, parse at most 1,000 rows, and save at most 500 valid rows per request. Monitor auto-track imports accept at most 50 creator homepage links and are all-or-nothing. CRM imports accept `.xls` or `.xlsx` up to 10 MB and 500 rows. Email recipient imports accept `.xls` or `.xlsx` up to 8 MB for one eligible task. Affiliation member imports accept `.xls` or `.xlsx` up to 10 MB for one campaign.

Preserve validation- and save-stage `failed_items`, plus `repeated_items` when returned. For an all-or-nothing import, fix every failed row and retry the complete workbook; for a partial-success contract, retry only the documented failed subset.

## File Roles

- `file image upload` creates a public `file_url` for approved rich-text content.
- `product image upload` and `campaign product-images upload` create product image URLs within their declared limits.
- Email, message history or draft, message-template, and feedback attachments remain private domain files. Never reuse a file identity across roles.

## Downloads And Destinations

- Direct reports and binary downloads write to `--output`; binary content is not stdout data.
- Confirm before overwriting an existing destination, and add `--overwrite` only after that exact replacement is intentional.
- Shared creator, collection, CRM, and brand-monitor exports return an `export_id`. Poll with `export get` or `export list`, then run `export download <export_id> --output <path>` only when ready.
- Monitor, short-link, affiliation, and import-report workbooks are direct downloads rather than shared asynchronous export tasks.
- Let the CLI stream or write the payload to the destination. Report the final local path and safe file metadata, not binary bytes.
