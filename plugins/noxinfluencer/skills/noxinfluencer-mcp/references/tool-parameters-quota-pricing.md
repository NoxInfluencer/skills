# MCP tools for quota-pricing

## `list_tool_pricing`

List current Skill Credit unit prices for public actions, including authorized account overrides.

- `tool` (string, optional).
- `action` (string, optional).
- `include_free` (boolean, optional, default true).

## `quota`

Read authoritative Credit and execution access for the authorized account without claiming a trial or consuming Credit. The response includes execution_available, claim_eligible, trial_claimed and, when needed, a Dashboard or billing action. Remaining Credit alone does not grant execution access.

No input parameters.
