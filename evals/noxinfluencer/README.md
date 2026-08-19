# Evaluation Assets

This directory holds evaluation test cases and benchmark results for NoxInfluencer skills.

## Methodology

Following Anthropic's eval-first development approach:

1. **Baseline**: Run representative tasks without the skill, record failure points
2. **Minimal skill**: Write the smallest instruction set that addresses the failures
3. **With-skill / baseline comparison**: Run the same tasks with and without the skill
4. **Benchmark**: Aggregate pass rate, token usage, latency, and tool call counts
5. **Iterate**: Fix issues, re-run, expand sample size

## Eval Query Design

This skill should have 3-5 eval queries per major workflow category covering:

- **Should-trigger**: Clear use cases that match the skill's description
- **Should-not-trigger**: Near-miss queries that belong to a different skill
- **Boundary**: Ambiguous queries where correct behavior matters most
- **Runtime routing**: Plugin-marker versus standalone execution, including strict CLI isolation
- **MCP auth recovery**: one-attempt automatic desktop/CLI OAuth startup, settings fallback, refresh/retry behavior, and safe failure branches

### Negative Example Quality

Negative examples must be **near-neighbor** queries — requests that sound similar but belong to a different skill. Do not use completely unrelated queries as negatives.

## Directory Structure

```
evals/
└── noxinfluencer/
    ├── README.md                 # This file
    ├── evals.json                # All eval cases for the single noxinfluencer skill
    └── workspace/                # Benchmark artifacts and reviewer feedback
```

## MCP OAuth Coverage

The eval set covers missing MCP Tools, `AuthRequired`, automatic desktop/CLI OAuth startup, settings fallback, Tool refresh, `403`/`insufficient_scope`, cancellation, unavailable Host commands, credential non-disclosure, prohibition on hand-built authorization URLs, and the standalone marker-absent CLI path. Plugin cases distinguish the one-attempt Codex Host OAuth bootstrap from the forbidden `noxinfluencer login` and NoxInfluencer CLI business fallback.

## Status

The eval set includes standalone CLI workflows plus Codex Plugin routing, Tool-schema, Browser Handoff, and OAuth-bootstrap cases.
