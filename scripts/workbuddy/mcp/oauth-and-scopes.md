# WorkBuddy MCP Authorization and Task Continuation

## Scope and identity

Use WorkBuddy's connector OAuth flow for the `noxinfluencer-mcp` MCP connector. WorkBuddy's cloud discovers the authorization service, registers its OAuth client, exchanges the authorization code, and manages the credentials. The user completes account authorization in the browser. The NoxInfluencer MCP service advertises the `noxinfluencer.agent.user` scope. Use the account and permissions established by the active connection. Keep credentials and OAuth callback details within WorkBuddy's authorization flow.

## Authorize when needed, then resume

1. Retain the original request, selected objects, filters, pagination, and confirmed progress. If the required MCP tool is loaded and the connection is ready, use it directly.
2. An explicit connection state that requires authorization, `AuthRequired`, or HTTP `401` permits one native authorization attempt. If authorization has expired, use the same WorkBuddy flow to reconnect.
3. Use WorkBuddy's native authorization action when available. Otherwise, direct the user to choose **连接 (Connect)** on the NoxInfluencer connector in WorkBuddy. WorkBuddy initiates the browser authorization and handles the callback. Use only the authorization action prepared by WorkBuddy for the pending session.
4. Wait for WorkBuddy to confirm the outcome. A browser opening is an intermediate step. If authorization fails or the user cancels, stop automatic attempts and report the observed result.
5. After WorkBuddy confirms authorization, recheck the live MCP catalog and connection readiness. Use WorkBuddy's reconnect or reload control if one is available and the current task still lacks the tools. If the tools remain unavailable, say that authorization succeeded and retain a concise summary of the pending request for a task with the connection loaded.
6. Once the required tool is ready, continue the retained request from the last confirmed step. An authorization or connection recovery must not repeat a completed write, recreate a job, or reuse a consumed Handoff. Resolve uncertain outcomes with the original operation's status or idempotency protocol. For result presentation, follow `@references/handoffs.md`.

## Other failures

- HTTP `403` or insufficient scope indicates an access restriction. Report it and preserve the selected account and operation when explaining the required access.
- A missing tool in a ready catalog, an unavailable Handoff, quota exhaustion, and transport errors require their own handling. Continue independent supported work when possible.
- Keep authorization status, tool readiness, business results, and page status distinct. Do not request or expose credentials, cookies, authorization codes, tokens, state, verifier, callback parameters, or raw authorization URLs in chat or logs.
