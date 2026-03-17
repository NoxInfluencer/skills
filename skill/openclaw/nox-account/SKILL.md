---
name: nox-account
description: Use when the user wants to configure access, check quota, or resolve basic account-level issues for the NoxInfluencer workflow.
---

# Nox Account

Use this skill for simple account and quota operations. Keep it lightweight.

## When to Use

Use this skill when the user wants to:

- configure or update the API key
- check remaining quota or credit balance
- understand basic authentication or quota errors

Do not use this skill for creator discovery, creator analysis, or outreach workflows.
Do not use this skill for pricing interpretation, creator-specific quota reasoning, or business workflow decisions.

## Workflow

### Configure API key

Use:

```bash
noxinfluencer auth --key <key>
```

If a custom server URL is needed, use:

```bash
noxinfluencer auth --key <key> --server http://host:port
```

### Check quota

Use:

```bash
noxinfluencer quota
```

## Output Rules

For authentication actions:

- confirm whether the key was saved successfully
- mention the server URL only if it matters to the user

For quota checks:

- report total credit
- report used credit
- report remaining credit
- keep the summary short

Keep this skill operational and lightweight. Do not expand into long troubleshooting unless the user asks for deeper diagnosis.

## Error Handling

- If the CLI is not available, point the user to the local setup instructions.
- If the key is missing, tell the user to run the auth command first.
- If the quota response is unsuccessful, surface the returned error and keep the explanation short.
- If the user is actually blocked by creator workflow failures rather than auth/quota setup, route them back to the relevant business skill instead of over-handling the problem here.
