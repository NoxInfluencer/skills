# Influencer Marketing Manager Evaluations

These assets make the first draft reviewable by separating structural confidence, Agent behavior, and real marketing quality.

## What the Cases Observe

The cases focus on decisions that should be visible in an Agent response or action trace:

- business-manager and operational-capability selection;
- proportional questions and useful working assumptions;
- goal-specific creator judgment and interpreted discovery results;
- outreach and negotiation ownership;
- autonomous execution under approved operating authority and clear user decisions for important commitments;
- adjustment when real results contradict the plan;
- stage-appropriate working context, including lightweight and Campaign-backed work; and
- accurate reporting of execution, stage, and overall results.

Expectations are semantic. Grade the business decisions, actions, and observed state changes represented in the response or trace.

## Staged Validation Loop

1. **Structure:** validate the Skill frontmatter and eval JSON. This establishes packaging and evaluation-document confidence.
2. **Behavior:** run the same realistic prompts in baseline and Skill-enabled conditions, retain action/response transcripts in the ignored `workspace/` directory, and review each observable expectation.
3. **Operator trial:** use a small number of real, appropriately authorized internal tasks. Record where an experienced operator would change the goal interpretation, next action, decision rights, or adjustment.
4. **Narrow revision:** improve the smallest positive instruction or example supported by the failure, then rerun the affected cases. Consider a focused hard restriction after repeated real failures show that positive guidance and context are insufficient.

Stage 1 establishes structural confidence. Actual Agent runs in Stage 2 and business work in Stage 3 establish behavioral and operating confidence.

## Stable Checks

Run from the repository root:

```bash
python /Users/yangyang/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/influencer-marketing-manager
python -m json.tool evals/influencer-marketing-manager/evals.json
python evals/influencer-marketing-manager/validate_evals.py
python evals/influencer-marketing-manager/validate_evals.py --self-test
```

Behavior transcripts and reviewer notes belong under `evals/influencer-marketing-manager/workspace/`, which is intentionally ignored.
