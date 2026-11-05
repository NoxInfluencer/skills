# Quota And Pricing

Use `quota` for current allowance, `list_tool_pricing` for action prices and `list_membership_pricing` for membership pricing when the user asks or a restriction blocks the task. Report only relevant service-returned allowances, restrictions and next actions. Routine business updates do not need billing details.

Prices and entitlements are server-owned. A successful action can depend on both Skill Credit and a separate product entitlement. Do not infer current allowance from historical usage or treat credit exhaustion as an OAuth failure.
