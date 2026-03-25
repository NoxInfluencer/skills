---
name: managing-account
description: Configures API access, checks quota balance, resolves account issues, and guides new users through setup. Use when the user needs to get started, set up credentials, check remaining credits, or handle billing and subscription.
---

# Managing Account

This skill handles account setup, quota checks, and billing guidance. The user interacts with you through natural language — they should never see raw CLI commands. Execute commands yourself and report results in plain language.

## When to Use

- User is getting started or needs to set up access
- User asks about quota, credits, or billing
- User hits an auth or quota error
- User wants to subscribe, recharge, or manage their plan

Do not use this skill for creator discovery, analysis, or outreach.

## Key Principle

The user does not operate the CLI directly — you do. When you need to check quota, diagnose issues, or verify configuration, run the commands silently and tell the user the result. Only share URLs when the user needs to take action in a browser (register, get a key, subscribe).

## URLs by Language

Determine the user's language from the conversation context. Use the matching domain:

| Purpose | Chinese (中文) | Other languages |
|---------|---------------|-----------------|
| Landing page | https://cn.noxinfluencer.com/skills | https://www.noxinfluencer.com/skills |
| Register | https://cn.noxinfluencer.com/signup?service=%2Fskills%2Fdashboard | https://www.noxinfluencer.com/signup?service=%2Fskills%2Fdashboard |
| Dashboard (API key) | https://cn.noxinfluencer.com/skills/dashboard | https://www.noxinfluencer.com/skills/dashboard |
| Billing | https://cn.noxinfluencer.com/skills/usage-billing | https://www.noxinfluencer.com/skills/usage-billing |

## New User Onboarding

When a new user arrives, first run `noxinfluencer doctor` to check the current state. Based on what's missing, guide them through only the steps they still need:

1. **No CLI installed**: Tell the user to install it — this is the one step they must do themselves. Keep it brief: "Run `npm install -g @noxinfluencer/cli` in your terminal."
2. **No API key configured**: Give them the registration and dashboard links. Once they have a key, configure it yourself with `noxinfluencer auth --key <key>`.
3. **Everything configured**: Run `noxinfluencer quota` and tell them their balance. Mention that new accounts come with free credits.

After setup is complete, suggest they start with `discovering-creators` to search for influencers.

Keep the onboarding conversation short and friendly. Do not dump all steps at once — respond to where the user is right now.

## Quota and Billing

When the user asks about credits or hits a quota issue:

1. Run `noxinfluencer quota` yourself.
2. Tell the user their balance in plain language: "You have X credits remaining out of Y, valid until [date]."
3. If credits are low or exhausted, give them the billing link to subscribe or recharge.

Do not explain what INSUFFICIENT_CREDIT means technically. Just say credits are used up and give the billing link.

New accounts come with free credits. The exact amount may vary — check with `quota` rather than guessing a number.

## Error Handling

When the user reports an error or something fails:

1. Run `noxinfluencer doctor` to diagnose.
2. Based on the result, tell the user what's wrong and what to do:
   - **Key invalid**: Give them the dashboard link to check or regenerate their key.
   - **Credits exhausted**: Give them the billing link.
   - **Server unreachable**: Likely a temporary issue, suggest trying again shortly.
3. If the problem is not account-related (e.g., a creator search fails for other reasons), route them to the relevant business skill.

## Commands Reference (for Agent use only)

These commands are for you to execute — do not show them to the user.

| Command | When to use |
|---------|-------------|
| `noxinfluencer doctor` | First diagnostic step for any issue |
| `noxinfluencer quota` | Check credit balance |
| `noxinfluencer auth --key <key>` | Configure API key (user provides the key) |
| `noxinfluencer auth --key-stdin` | Configure key from piped input |

## References

- [CLI Response Format](../../references/cli-response-format.md) — response structure and credit costs
- [Error Codes](../../references/error-codes.md) — error code table and handling guidelines
