# Exports And Reports

Creator, lookalike, collection and CRM exports use the shared export lifecycle. Preview when available, create once for the approved selection, retain the export identity, and poll `get_export` with a bounded stopping condition. Use `list_exports` to find an existing task instead of recreating it.

When ready, use `get_export_download` for the returned export identity. Present a service-returned usable result link when available. Do not invent a URL or claim that a file has been saved locally merely because a result link was returned.

Monitoring and CRM report preparation use the corresponding catalogued `prepare_*_report_download` tools. Keep their returned object identities and readiness states distinct from shared exports. Report partial failures and missing results.

Template retrieval is separate from importing a file. Use only catalogued template tools. Read `{baseDir}/references/resources-and-files.md` for file-result boundaries.
