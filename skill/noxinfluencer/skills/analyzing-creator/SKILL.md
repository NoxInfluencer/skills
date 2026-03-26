---
name: analyzing-creator
description: Performs decision-oriented due diligence on a specific creator, assessing reliability, risk, audience quality, and pricing reasonableness. Use when the user has a creator in mind and needs a go/no-go verdict.
---

# Analyzing Creator

Help the user decide whether a creator is worth pursuing. Lead with a verdict, not a wall of numbers.

## When to Use

- User already has a creator candidate
- User asks whether a creator is reliable, safe, or worth working with
- User wants to check disputes, audience quality, benchmark position, or pricing

Do not use for first-pass sourcing. Use `discovering-creators` first when the user still needs a shortlist.

## Workflow

1. Confirm which creator to analyze (use `creator_id` from prior search or user input).
2. If user asked about a specific concern, check that dimension first.
3. If no specific concern, follow default order: profile → audience → content → cooperation (all with `--detail` flag).
4. For content analysis in Chinese context, add `--language zh`.
5. Return verdict first, then supporting evidence.

Use `noxinfluencer schema creator <dimension>` to check available options for each command.

## Verdict Framework

Always lead with one of these four conclusions:

1. **High-priority collaboration candidate** — no dispute signal, healthy audience, competitive performance, no pricing friction
2. **Viable, but with clear risks** — workable overall, but 1-2 notable concerns (weak cooperation, volatility, questionable pricing)
3. **Needs manual review before proceeding** — mixed evidence, or commercial reasonableness unclear from available data
4. **Not a priority collaboration candidate** — multiple weak signals across data quality, audience, cooperation, or pricing

See [verdict-heuristics.md](references/verdict-heuristics.md) for detailed heuristic rules and the full due-diligence output structure.

## Interpretation Rules

- Dispute history and negative cooperation signals are decision-critical — always surface them.
- Benchmark position is context, not the sole determinant.
- Evaluate pricing relative to performance, audience quality, and cooperation signals.
- When evidence is mixed, prefer "Needs manual review" over false confidence.
- When only one dimension was checked, present it as a scoped judgment, not a full verdict.

## Escalation Rules

- One bad dimension → explain the tradeoff, don't force a hard reject.
- Multiple weak dimensions → clear cautionary verdict.
- User asks about one dimension → stay focused, but still mention obvious red flags.
- Do not expand into sourcing or contact retrieval unless the verdict clearly points there.

## Error Handling

If an operation fails, use the CLI response's `action` field for next steps.

## References

- [Verdict Heuristics](references/verdict-heuristics.md) — detailed heuristic rules and output structure
- [Platform Support](../../references/platform-support.md) — data availability differences by platform
- [CLI Response Format](../../references/cli-response-format.md) — response structure and credit costs
