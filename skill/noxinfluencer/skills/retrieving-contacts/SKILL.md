---
name: retrieving-contacts
description: Retrieves available contact information for a specific creator as the first step toward outreach. Use when the user has chosen a creator and needs their email or contact details.
---

# Retrieving Contacts

Retrieve contact information for a specific creator. This skill is intentionally narrow — it gets contact data, nothing more.

## When to Use

- User wants a creator's email or contact details
- User is ready to prepare outreach and knows which creator they mean

If the user hasn't decided whether the creator is worth contacting, use `analyzing-creator` first.

## Workflow

1. Confirm which creator (use `creator_id` from prior search or user input).
2. Run the contacts command.
3. Return only the contact info and quality signal.

Do not turn this into a sourcing or due-diligence workflow. If the user hasn't chosen a creator, hand off to `discovering-creators`.

## Output Rules

Return:
- Email address (if present)
- Email quality level with interpretation
- Brief explanation of quality meaning

Do not add outreach recommendations. Do not restate broad creator metrics unless needed to clarify whose contact was retrieved.

## Quality Interpretation

| `email_quality` | Meaning |
|-----------------|---------|
| `1` | High-quality contact signal |
| `2` | Normal contact signal |
| `0` | No verified high-confidence email |

If email is null or quality is `0`, clearly say no reliable email is currently available.

## Error Handling

If an operation fails, use the CLI response's `action` field for next steps.

## References

- [CLI Response Format](../../references/cli-response-format.md) — response structure and credit costs
