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

### Negative Example Quality

Negative examples must be **near-neighbor** queries — requests that sound similar but belong to a different skill. Do not use completely unrelated queries as negatives.

## Directory Structure

```
evals/
└── nox-influencer/
    ├── README.md                 # This file
    ├── evals.json                # All eval cases for the single nox-influencer skill
    └── workspace/                # Benchmark artifacts and reviewer feedback
```

## Status

Eval scaffolding is planned. Test cases will be added as skills are validated.
