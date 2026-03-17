---
name: outreach-creators
description: Use when the user wants creator contact information as the first step toward outreach and needs a direct way to retrieve available contact details.
---

# Outreach Creators

Use this skill when the user is ready to move from evaluation toward contact. At the moment, this skill is intentionally narrow: it retrieves contact information only.

## When to Use

Use this skill when the user:

- wants a creator's contact details
- asks for email or contact availability
- is ready to prepare outreach and already knows which creator they mean

If the user still needs to decide whether the creator is worth contacting, use `analyze-creator` first.

## Current Scope

This skill currently supports one action only:

```bash
noxinfluencer get_creator_contacts --creator_id <id>
```

The broader outreach workflow may expand later, but this skill should not pretend those capabilities already exist.

## Workflow

1. Confirm which creator should be contacted.
2. Use an encrypted `creator_id` from prior search results or from the user.
3. Run the contacts command.
4. Return only the contact information that exists and the email quality signal.

Do not turn this skill into a sourcing or due-diligence workflow. If the user has not chosen a creator yet, hand off instead of guessing.

## Output Rules

Keep the response simple.

Return:

- email address if present
- email quality level
- a brief explanation of what the quality level means

Do not add an outreach recommendation by default. This skill should provide contact information, not decide whether outreach should happen.
Do not restate broad creator metrics here unless they are directly needed to clarify whose contact data was retrieved.

## Quality Interpretation

Use these meanings for `email_quality`:

- `1`: high-quality contact signal
- `2`: normal contact signal
- `0`: no verified high-confidence email signal

If the email is null or the quality is `0`, clearly say that no reliable email is currently available.

## Errors and Fallbacks

- If no `creator_id` is available, ask for one or direct the user back to `discover-creators`.
- If the user is still comparing multiple creators, ask them to choose one creator first instead of retrieving contacts for several by default.
- If quota is insufficient, state that contact retrieval cannot continue.
- If the command fails, return the contact retrieval error without inventing extra outreach advice.
