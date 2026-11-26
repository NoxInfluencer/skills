# Files And Exports

## File Roles

Keep four roles distinct: spreadsheet templates, spreadsheet imports, public rich-text images, and private attachments. A file prepared for one role must not be silently reused as another role because validation, visibility, retention, and authorization differ.

Spreadsheet imports must report accepted rows and `failed_items`. When the operation is all-or-nothing, any failed row means no business object was created. When partial success is supported, report both successful identities and failed rows explicitly.

Public images may be embedded in supported rich text. Private attachments remain access-controlled and should be referenced only by their returned identity. Never expose a local path, private object location, or credential-bearing address to the user.

## Direct Reports

Monitoring, normal short-link, and Shopify affiliation reports use a domain-owned report lifecycle. Preserve the domain object and report task identity, wait for readiness, and retrieve the file through the approved file handoff for the selected runtime.

## Shared Asynchronous Exports

Creator, collection, CRM, and brand-monitor exports use the shared export lifecycle: create once from an approved selection, retain the export identity, poll bounded status, and retrieve only when ready. A selected-result export must not expand beyond the chosen result identities.

Before creating a deep export, use an available preview to show projected rows, fields, and quota impact. Contact columns can consume separate contact quota. Do not recreate a pending export as a retry; query its state first.

## Local Result Safety

Before replacing an existing local file, ask for confirmation unless the user already approved that exact destination and overwrite. Use streaming for large results, enforce response and file-size limits, and avoid loading an entire report into memory when direct streaming is available.
