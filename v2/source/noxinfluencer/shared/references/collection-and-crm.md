# Collections And CRM

Collections are reusable creator working sets. CRM records hold relationship state such as labels, status, collaborators, notes, communication history, and account-specific organization.

## Collections

List or read the target collection before adding or removing creators when its identity is unclear. Preserve creator identities and deduplicate the requested set before mutation. If the workflow supports automatic creation, report whether a collection was created or reused; never create repeated collections during a retry.

For batch changes, preview requested count, already-present count, valid new count, invalid items, and final projected size. Apply only the approved effective change. Removal must show which selected creators will leave the collection and must not expand to the entire collection.

## CRM

Read current records before changing status, labels, collaborators, notes, or archive state. Treat labels as a set unless ordering has documented business meaning. Avoid repeated writes when the desired status or label set already matches current state.

Updating cooperation status or labels can automatically create a CRM channel when one does not exist. A label-only update uses the default cooperation status for that new channel. Owner-only or archive-only changes must not automatically create a channel; a missing channel is a real business failure, not a skipped success.

Before apply, preview must report `existing` and `will_create` counts for the selected creators. After apply, report the authoritative `created` count together with updated, unchanged, and failed items. Do not infer these counts from the original request size.

Bulk CRM updates must keep per-creator outcomes. Use bounded batches and one batch operation where supported; do not issue an unbounded sequence of single-record remote calls. Retry only failed, idempotent items and preserve the original selection digest.

Conversation archival belongs to the message thread. CRM archival changes relationship-record state and must not be substituted for a whole-conversation archive.

## Pagination And Collaboration

Preserve page size, filters, sort, and cursor across pages. Deduplicate by record identity. When collaborators or ownership affect visibility, report the restriction rather than treating an inaccessible record as missing data.
