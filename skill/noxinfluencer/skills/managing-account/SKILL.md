---
name: managing-account
description: Configures API access, checks quota balance, resolves account issues, and guides new users through setup. Use when the user needs to get started, set up credentials, check remaining credits, or handle billing and subscription.
---

# Managing Account

Handle account setup, quota checks, and billing guidance. The user interacts through natural language — execute CLI commands yourself and report results in plain language. Never expose raw commands to the user.

## When to Use

- User is getting started or needs to set up access
- User asks about quota, credits, or billing
- User hits an auth or quota error
- User wants to subscribe, recharge, or manage their plan

## Key Principle: Agent-First

The user does not operate the CLI. You do. Run commands silently, tell the user the result. Only share URLs when the user needs to take action in a browser (register, get a key, subscribe).

CLI handles language-aware URL routing via `--lang`. Set `--lang zh` for Chinese users — this switches all URLs (error actions, hints) to `cn.noxinfluencer.com` automatically.

## New User Onboarding

Run `noxinfluencer doctor` first to check the current state. Based on what's missing, guide through only the remaining steps:

1. **No CLI installed** → Tell user: "Run `npm install -g @noxinfluencer/cli` in your terminal." (the one step they must do themselves)
2. **No API key** → Give registration and dashboard links (CLI's auth error `action` field provides these). Once they have a key, configure it yourself.
3. **Everything configured** → Run `quota`, tell them their balance. New accounts come with free credits.

After setup, suggest `discovering-creators` to start searching.

Keep it short. Do not dump all steps at once — respond to where the user is now.

## Quota and Billing

Run `quota` yourself, report the balance. CLI's summary field gives a readable explanation.

If credits are low or exhausted, the error response's `action` field includes the billing URL. Pass it to the user.

## Error Handling

When something fails, the CLI response includes an `action` field with:
- `action.url` — where the user should go (dashboard, billing page)
- `action.hint` — what to do

Use this directly. Do not maintain a separate error-to-action mapping. For unexpected failures, run `doctor` as a first diagnostic step.

## References

- [CLI Response Format](../../references/cli-response-format.md) — response structure and credit costs
- [Platform Support](../../references/platform-support.md) — data availability differences by platform
