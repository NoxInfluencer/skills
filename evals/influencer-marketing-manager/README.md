# Influencer Marketing Manager Evaluations

These assets make the first draft reviewable without pretending that static tests prove marketing quality.

## What the Cases Observe

The cases focus on decisions that should be visible in an Agent response or action trace:

- manager-versus-tool routing;
- useful assumptions versus unnecessary questioning;
- goal-specific creator judgment instead of raw search output;
- outreach and negotiation ownership;
- autonomy inside an approved boundary and confirmation at important commitments;
- adjustment when real results contradict the plan;
- optional Campaign use; and
- separation of tool success, business-stage movement, and final outcome.

Expectations are semantic. Do not grade fixed headings, phrases, or a single canonical answer.

## Staged Validation Loop

1. **Structure:** validate the Skill frontmatter and eval JSON. This catches packaging errors and malformed cases only.
2. **Behavior:** run the same realistic prompts with and without the Skill, retain action/response transcripts in the ignored `workspace/` directory, and review each observable expectation.
3. **Operator trial:** use a small number of real, appropriately authorized internal tasks. Record where an experienced operator would change the goal interpretation, next action, confirmation point, or adjustment.
4. **Narrow revision:** improve the smallest instruction or example supported by the failure, then rerun the affected cases. Add a hard restriction only after a repeated real failure cannot be corrected with positive guidance or context.

Stages 2 and 3 require actual Agent runs or business work. Passing Stage 1 is not evidence that either has passed.

## Stable Checks

Run from the repository root:

```bash
python /Users/yangyang/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/influencer-marketing-manager
python -m json.tool evals/influencer-marketing-manager/evals.json
python evals/influencer-marketing-manager/validate_evals.py
python evals/influencer-marketing-manager/validate_evals.py --self-test
```

Behavior transcripts and reviewer notes belong under `evals/influencer-marketing-manager/workspace/`, which is intentionally ignored.
