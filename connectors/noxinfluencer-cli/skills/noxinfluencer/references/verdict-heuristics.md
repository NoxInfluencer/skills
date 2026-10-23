# NoxInfluencer Evidence Interpretation

Use this reference to turn NoxInfluencer creator data into a concise, tool-scoped conclusion. It supports an experienced user's own decision and supplies evidence to a wider influencer-marketing workflow.

## Scope the question

Start with the user's stated concern or criteria. A complete creator recommendation normally depends on the business objective, audience, content scene, cooperation model, recent content, complete cost, and execution context. Judge only the dimensions that the checked NoxInfluencer data and supplied context can support.

Use one of four conclusions:

1. **Strong within the checked scope:** the checked evidence supports the supplied criteria and shows no material unresolved conflict.
2. **Workable with risks:** the evidence is broadly useful, with one or more named concerns that can be evaluated or managed.
3. **Insufficient evidence:** a decision-critical dimension is missing, stale, platform-limited, or internally inconsistent.
4. **Weak within the checked scope:** the checked evidence materially conflicts with the supplied criteria or shows a serious risk.

These conclusions describe the evidence reviewed. They do not turn a search result, composite score, or one platform metric into a universal partnership verdict.

## Evidence dimensions

Inspect only the dimensions needed for the question:

### Identity and freshness

- Confirm the creator, platform, stable `creator_id`, and observation time.
- Distinguish current content and audience evidence from older profile or cooperation history.
- State when a field is unavailable for the platform or its semantics are unclear.

### Content and performance

- Compare recent, representative, same-format content when available.
- Keep long-form, Shorts, reels, posts, live replays, and other formats separate.
- Read averages, medians or typical ranges, trend, volatility, and peer benchmarks as different signals.
- Treat an outlier or composite performance level as a reason to inspect underlying content, not a complete conclusion.

### Audience

- Relate geography, language, age, gender, interests, authenticity, and audience types to the supplied target.
- Surface suspicious or inactive audience signals and material missing coverage.
- Describe available evidence without inventing precision for platform-limited fields.

### Cooperation and commercial signals

- Surface dispute history and meaningful negative cooperation signals prominently.
- Compare estimated price, response behavior, prior brand work, cooperation duration, and promotional-content performance when available.
- Treat pricing as one input. A business decision may also need rights, exclusivity, tax, logistics, production support, payment terms, and expected contribution.

## Interpretation rules

- Use search, tags, percentiles, composite scores, cooperation scores, contact flags, and lookalike ranking as triage signals.
- Establish field semantics before interpreting missing, empty, or default-looking zero values.
- Explain the benchmark population and window when available; otherwise state that the comparison base is unknown.
- Keep creator fit and contact readiness separate. A contact signal does not prove an actual verified address.
- When checked signals conflict, prefer `insufficient evidence` and name the smallest useful NoxInfluencer read or external review.
- Keep recommendations tied to supplied criteria. If the criteria themselves require strategy work, return the evidence and identify that open business decision.

## Output

Return:

```text
scoped conclusion and question answered
supporting NoxInfluencer evidence with freshness
material risks, missing dimensions, and data limits
next Nox-native read or operation, when useful
business decision that remains open, if any
```

Lead with the conclusion and the most decision-relevant evidence. Do not dump every normalized field.
