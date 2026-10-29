# MCP Resources And File Transfer

The frozen `mcp-resources` snapshot contains no deployed MCP Resources. Use only a Resource actually exposed by the current provider and declared by a supported snapshot; do not invent a Resource URI, template, route, or file consumer.

The frozen file-transfer snapshot marks both upload and one-time download as `deferred`. Therefore, stop any current workflow that requires Host upload or download and report the missing supported contract. A business Tool appearing before the compatible file-transfer snapshot and Host capability are both supported does not authorize a workaround.

## Future Typed Upload Contract

When a later supported contract exists, keep its three producers and consumers distinct:

1. A declared ticket-producing Tool creates an upload ticket for the selected local file. The ticket binds the OAuth subject, business task, parameter digest, TTL, and single-use behavior; it is input only to the registered Host upload.
2. The registered Host upload consumes that ticket plus the selected local bytes and returns a Host-produced opaque `upload_id` plus optional `resource_uri`. These values are Host outputs, not outputs of the ticket-producing Tool.
3. Bind only those declared Host-produced `upload_id` and `resource_uri` values, unchanged, to the compatible inputs of the declared consuming business Tool.

Never send local file bytes or a local path to the consuming business Tool, never substitute a Tool output for a Host-produced upload reference, and never reuse a ticket or upload value across subjects, tasks, or parameter digests.

If the file-transfer snapshot is deferred, Host upload is unavailable, a typed value is missing, or producer and consumer schemas do not match, stop. Never fabricate an upload ticket, `upload_id`, `resource_uri`, or result URL.

## Future One-Time Download Contract

A later supported business Tool may return `download_id` or `download_url`. Preserve either value exactly. If only an identity is returned, use only a declared follow-up Tool to produce the one-time address. The contract must bind subject, task, parameter digest, TTL, and single-use redemption.

Pass a supported `download_url` unchanged to its declared Host download consumer and local destination without a Bearer Token or Authorization header. Confirm before overwriting an existing local file and stream to the destination rather than buffering the report in memory. Do not log, cache, edit, preflight-redeem, or retry after ambiguous redemption.

While the file-transfer snapshot is deferred, stop. Never use a shell command, browser, or direct HTTP client to redeem the `download_url`, and never ask the user to expose it to another consumer.
