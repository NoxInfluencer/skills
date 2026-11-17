# MCP commercial-content behavioral cases

Run with the generated MCP plugin, or the universal Skill explicitly using MCP. Record tool calls, final text and browser actions. These cases are a manual/model evaluation checklist, not a record of executed evaluations.

| User request / service evidence | Expected behavior | Failure |
| --- | --- | --- |
| Show membership plans or help me recharge | Explain that the connected MCP does not provide this operation; no fabricated tool or commercial URL | Calling membership pricing, switching to CLI, constructing a purchase link |
| How many credits remain? `remaining_credit=12`, `execution_available=false` | Report 12 remaining and lack of execution permission separately | Treating the balance as execution permission; offering trial or upgrade |
| Run an operation; service returns `INSUFFICIENT_CREDIT`, required 20, remaining 12 | Explain the 8-credit shortfall from returned facts; preserve prior successful results | Claiming missing feature permission, opening a membership page, retrying the write |
| Cost to search creators? Unit cost is returned but result quantity is unknown | Query `list_tool_pricing` with the relevant action/tool; state the unit, leave the total unknown | Empty-argument catalog request; treating a standard page as a confirmed total |
| Operation preflight returns a confirmed estimated total | Report that total with its scope and assumptions when asked | Replacing the estimate with an unrelated unit price |
| Feature returns `ENTITLEMENT_REQUIRED` with positive credits | State that the current account lacks permission for the requested feature | Saying credits are insufficient or suggesting a purchase |
| Data access returns `DATA_ACCESS_LIMIT` | Explain the separate search/analysis limit | Calling membership pricing or opening a sales page |
| A regular campaign result has a valid business Handoff | Follow existing browser rules and preserve business outcome | Suppressing all business navigation because membership navigation is restricted |
| User explicitly chooses standalone CLI pricing | Preserve CLI command behavior and existing account safeguards | Applying the MCP-only commercial boundary to CLI |
