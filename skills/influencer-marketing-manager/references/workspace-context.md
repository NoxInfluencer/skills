# Workspace Context Contract

Use this contract when a project directory, Campaign workspace, CRM export, or team knowledge base is available. It lets the Manager benefit from local operating experience while keeping reusable method, current business state, and historical evidence in their proper places.

## Contents

- [Load the smallest useful context](#load-the-smallest-useful-context)
- [Source precedence](#source-precedence)
- [Classify what was read](#classify-what-was-read)
- [Keep one business record](#keep-one-business-record)
- [Record the decision](#record-the-decision)
- [Resolve conflicts and stale state](#resolve-conflicts-and-stale-state)

## Load the smallest useful context

When the user identifies a project or workspace:

1. Read the nearest `AGENTS.md` or equivalent execution instructions.
2. Read the project `README.md` or index to learn the map and current entry points.
3. Read only the topic documents that match the request: strategy, creator evaluation, outreach, fulfillment, measurement, compliance, knowledge management, or automation.
4. Read the current business system or supplied export for the specific records being acted on.
5. Read dated reports, snapshots, and lessons when they explain a decision or expose a useful pattern.

A one-off comparison usually needs a small working context. A sustained operation needs the current rules, state source, decision authority, and a place for the resulting record. Expand context when a material uncertainty cannot be resolved from the initial slice.

## Source precedence

Use this order when sources disagree:

1. The user's latest explicit objective, constraint, or decision;
2. A current readback from the authoritative business system (Campaign, CRM, mail, logistics, or platform data);
3. The active project rules and execution instructions;
4. Stable topic guidance and reviewed team experience;
5. Dated exports, reports, DOCX files, screenshots, and temporary snapshots;
6. An unverified assumption.

The order describes authority, not usefulness. A dated case can reveal a strong method while a live system supplies the current status. State which role a source is playing when that distinction matters.

## Classify what was read

Label information mentally or in the record as one of these kinds:

| Kind | Use | Typical home |
| --- | --- | --- |
| Current fact | Decide and report present state | Campaign, CRM, mail, logistics, platform |
| Active rule | Constrain current work | Project rules, `AGENTS.md`, approved brief |
| Team method | Supply a reusable prior | Reviewed topic guide or baseline reference |
| Machine state | Support deduplication, monitoring, or automation | State JSON or application binding |
| Historical evidence | Explain what happened at a point in time | Dated report, export, DOCX, snapshot |
| Learning | Record an observation, test, or promoted pattern | Lessons or the single owning topic document |

Do not turn a machine snapshot or dated report into current business truth without a fresh readback. Do not copy dynamic records into a second long-lived knowledge base.

## Keep one business record

Carry the same identity and lifecycle across discovery, outreach, replies, terms, delivery, and measurement. Prefer a stable creator/channel ID; retain the source URL and the time of the observation when no stable ID is available. Keep current status, owner, next action, and commercial terms in the authoritative system.

The Manager's working record should preserve the reasoning that makes the next decision reproducible:

```text
goal / stage
hypothesis or question
creator or relationship identity
evidence (source and freshness, what it supports)
decision and confidence
uncertainty or risk
next action, owner, and authority
observed result and resulting state
```

This is a decision record, not a duplicate CRM. A concise record is enough when the action is reversible; add detail when the decision changes spend, rights, reputation, or lifecycle state.

## Record the decision

Use a compact candidate or relationship card appropriate to the stage.

For discovery, retain the coarse-search source, structured facts, fine-review evidence, fit decision, contact readiness, and next qualification action. For outreach, retain the selected angle, message version, recipients, authorization, send result, and response state. For negotiation, retain the complete package, target and limits, open terms, and confirmation. For fulfillment and measurement, retain the checklist evidence, public asset, metrics, attribution confidence, and learning.

The user-facing message may be shorter than the record. Lead with the result and decision; expose source details when they change confidence or require a choice.

## Resolve conflicts and stale state

When a rule, snapshot, and live state differ:

1. Identify the fact or decision that conflicts.
2. Compare source authority and observation time.
3. Read the current authoritative system if it is available.
4. Preserve the older item as historical evidence with its date.
5. Ask the user only when the remaining difference changes a material action or commitment.

After any external or system action, read back the target record or state. A request preview, queued job, or successful transport response is an execution signal; the final record, message, export, or public asset is the business evidence.
