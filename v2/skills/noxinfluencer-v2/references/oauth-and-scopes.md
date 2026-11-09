# MCP OAuth Identity And Scopes

The deployed provider is `noxinfluencer`. OAuth obtains the user's existing platform Skills API Key and the Host credential store keeps it. The Agent never sees, configures, logs, or displays that Key. Never send `uid`, `parent_uid`, Key, Token, or Secret as a Tool argument.

## One-Attempt Bootstrap

1. When the required Tool is loaded, call it directly. There is no login, Token, or credential Tool.
2. In Codex only, when no provider Tools are loaded and no transport failure is known, or the connection explicitly returns `AuthRequired` or `401`, mark OAuth bootstrap attempted for this user request and start the Codex Host flow exactly once.
3. Use the current host’s own supported connection controls outside Codex; never run Codex bootstrap commands in another client. In Codex, when the Codex Host control CLI is independently executable, run `codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer.codex.user` on any operating system. Otherwise, on Windows run the packaged resolver with `powershell -NoProfile -ExecutionPolicy Bypass -File "{baseDir}/scripts/start-codex-oauth.ps1"`. If neither trusted Host control path is available, stop instead of substituting another login flow.
4. Let the Host perform DCR, PKCE, state validation, loopback callback handling, external-browser authorization, and Token storage. Never construct an authorization URL or handle OAuth credentials.
5. After success, refresh the Tool catalog and retry the original operation. If the current task cannot refresh, tell the user to start a new Codex task and resend the request.

One missing business Tool while other provider Tools are loaded is a capability gap, not an OAuth trigger. The only supported Plugin scope is `noxinfluencer.codex.user`. Insufficient Skill Credit is a business error and never retries OAuth. Only an invalid or deleted Key (`AuthRequired`/`401`) permits the single Host OAuth attempt above. A `403` or `insufficient_scope` does not permit a login loop.

If the helper cannot start or the user cancels, stop automatic attempts and direct the user to NoxInfluencer Connect/Re-authorize in Codex settings. Never ask the user to paste a Key or run `noxinfluencer login`. Disconnect does not delete the shared platform Key. Never expose a Token, Cookie, authorization code, `state`, or `code_verifier`.
