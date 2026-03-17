---
name: analyze-creator
description: Use when the user already has a creator in mind and wants a decision-oriented assessment of reliability, risk, audience quality, data quality, or pricing reasonableness.
---

# Analyze Creator

Use this skill for due diligence. The goal is not to restate metrics. The goal is to help the user decide whether a creator is worth pursuing.

## When to Use

Use this skill when the user:

- already has a creator candidate
- asks whether a creator is reliable, safe, or worth working with
- wants to check disputes, audience quality, benchmark position, or pricing reasonableness
- wants a deeper decision beyond overview-level discovery data

Do not use this skill for first-pass sourcing. Use `discover-creators` first when the user still needs a shortlist.

## Workflow

1. Confirm which creator should be analyzed.
2. If the user already provided a `creator_id`, use it. Otherwise, use an encrypted ID from prior shortlist results.
3. If the user asked about a specific concern, call the most relevant detailed command first.
4. If the user did not specify a concern, follow the default due-diligence order.
5. Keep the analysis decision-oriented. Do not fall back to a field-by-field paraphrase.
6. Return a verdict first, then the supporting evidence.

## Default Due-Diligence Order

Use these dimensions when the user wants a full analysis:

1. profile detail
2. audience detail
3. content detail
4. cooperation detail

Default command set:

```bash
noxinfluencer get_creator_profile_detail --creator_id <id>
noxinfluencer get_creator_audience_detail --creator_id <id>
noxinfluencer get_creator_content_detail --creator_id <id> --language <code>
noxinfluencer get_creator_cooperation_detail --creator_id <id>
```

Use `--language zh` when the user is working in Chinese and audience-interest descriptions are more useful in Chinese. Otherwise keep the default language behavior.

## Verdict Framework

Always lead with one of these four conclusions:

1. High-priority collaboration candidate
2. Viable, but with clear risks
3. Needs manual review before proceeding
4. Not a priority collaboration candidate

Do not lead with a wall of numbers. Lead with a decision and the 1-2 strongest reasons.

If only one narrow dimension was checked, explicitly present the answer as a scoped judgment rather than a full creator verdict.

## Verdict Heuristics

Use these heuristics to keep verdicts consistent:

- **High-priority collaboration candidate**
  - no meaningful dispute signal
  - audience quality is healthy
  - performance is competitive for the niche
  - pricing and cooperation signals do not show obvious friction

- **Viable, but with clear risks**
  - overall profile is workable
  - but one or two notable concerns exist, such as weak cooperation signals, volatility, or questionable pricing efficiency

- **Needs manual review before proceeding**
  - the evidence is mixed
  - or commercial reasonableness cannot be judged confidently from the available data
  - or one critical dimension is unclear enough that a firm recommendation would be misleading

- **Not a priority collaboration candidate**
  - multiple weak signals appear across data quality, audience quality, cooperation risk, or pricing reasonableness
  - or the creator is clearly a poor fit for the stated collaboration goal

## Output Rules

After the verdict, organize the evidence into a due-diligence structure:

### 1. Data Performance

- views and engagement quality
- stability and volatility
- benchmark position against peers
- content-type differences if relevant

### 2. Audience Quality

- authenticity
- suspicious audience risk
- demographic fit
- marketing attractiveness and promotion signals

### 3. Cooperation Risk

- dispute history
- cooperation tendency
- negative partnership signals

### 4. Commercial Reasonableness

- pricing range
- negotiation gap
- response speed
- collaboration efficiency
- existing brand partnerships

### 5. Final Recommendation

- whether to continue
- what should be double-checked manually
- whether the next step should be outreach or shortlist replacement

Keep the write-up selective. Highlight decision-relevant evidence first instead of restating every returned metric.

## Interpretation Rules

- Treat dispute history and negative cooperation signals as decision-critical.
- Treat benchmark position as context, not the only answer.
- Treat pricing as reasonable or questionable only in relation to performance, audience quality, and cooperation signals.
- If the evidence is mixed, prefer "Needs manual review before proceeding" over false confidence.
- If two or more critical dimensions are missing, unclear, or platform-limited, do not force a confident verdict.

## Escalation Rules

- If only one dimension looks bad, explain the tradeoff instead of forcing a hard reject.
- If multiple dimensions look weak, give a clear cautionary verdict.
- If the user only wants one dimension, stay focused on that dimension but still mention any obvious red flag that should not be ignored.
- Do not expand into creator sourcing or replacement suggestions unless the current verdict makes replacement the clearer next step.
- Do not move into contact retrieval unless the user asks for it or the final recommendation clearly points to outreach as the next action.

## Errors and Fallbacks

- If no `creator_id` is available, ask for one or return to `discover-creators`.
- If quota is insufficient, state which detail step could not be completed.
- If a field is null or platform-specific, explain that the missing value may be normal for that platform instead of treating it as a data error.
