# Evaluation Assets

This directory holds stable evaluation cases and validation tools for the NoxInfluencer Skill.

## Methodology

Following Anthropic's eval-first development approach:

1. **Baseline**: Run representative tasks with the previous Skill, record failure points
2. **Minimal skill**: Write the smallest instruction set that addresses the failures
3. **With-skill / baseline comparison**: Run the same tasks with and without the skill
4. **Benchmark**: Aggregate pass rate, token usage, latency, and tool call counts
5. **Iterate**: Fix issues, re-run, expand sample size

## Eval Query Design

This skill should have 3-5 eval queries per major workflow category covering:

- **Should-trigger**: Clear use cases that match the skill's description
- **Should-not-trigger**: Near-miss queries that belong to a different skill
- **Boundary**: Ambiguous queries where correct behavior matters most

Also test coexistence with `influencer-marketing-manager`:

- A user with settled goals and criteria can use NoxInfluencer independently for data interpretation, product-native workflow design, and system operations.
- A request for goal selection, broader marketing strategy, a company SOP, or cross-tool automation should keep business ownership with the Manager while NoxInfluencer contributes its supported capabilities.
- A NoxInfluencer conclusion must stay within the evidence checked; it should identify the business context or external evidence still needed for a broader decision.

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

## Behavior and Structure Checks

Behavior evaluation and static validation have different roles:

- Behavior evaluation runs the same pressure prompts against the previous and updated Skill, then reviews the actual Agent responses against each case's expectations. RED/GREEN transcripts and reviewer notes belong in the ignored `evals/noxinfluencer/workspace/` directory; they may contain transient model output and are not committed.
- `validate_evals.py` checks only the JSON document structure, unique eval IDs, non-empty prompts, and non-empty string expectations. Passing it does not prove Agent behavior.

Run the stable static checks from the repository root:

```bash
python -m json.tool evals/noxinfluencer/evals.json
python evals/noxinfluencer/validate_evals.py
```

Run the validator's built-in contract test after changing validation logic:

```bash
python evals/noxinfluencer/validate_evals.py --self-test
```
