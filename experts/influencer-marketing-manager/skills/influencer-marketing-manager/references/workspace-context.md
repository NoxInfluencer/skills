# Workspace Context Contract

Use this reference when a project directory, Campaign workspace, CRM export, or team knowledge base is available. It keeps reusable method, current business state, and historical evidence in their proper places.

## Contents

- [Load the smallest useful context](#load-the-smallest-useful-context)
- [Resolve source roles](#resolve-source-roles)
- [Classify what was read](#classify-what-was-read)
- [Keep one business record](#keep-one-business-record)
- [Develop the operating method](#develop-the-operating-method)
- [Implement automation](#implement-automation)
- [Promote useful experience](#promote-useful-experience)
- [Resolve conflicts and stale state](#resolve-conflicts-and-stale-state)

## Load the smallest useful context

When the user identifies a project or workspace:

1. Read the nearest `AGENTS.md` or equivalent execution instructions.
2. Read the project `README.md` or index to understand the map and current entry points.
3. Read only topic documents that match the request: strategy, creator evaluation, outreach, fulfillment, measurement, compliance, knowledge management, or automation.
4. Read the current business system or supplied export for the specific records being acted on.
5. Read dated reports, snapshots, and lessons only when they explain a decision or expose a useful pattern.

A one-off comparison usually needs a small slice. A sustained operation needs current rules, a state source, decision authority, and a place for the resulting record. Expand context only when a material uncertainty remains.

## Resolve source roles

When sources disagree, use the source appropriate to the kind of fact:

1. **Objective or constraint for this round:** the user's latest explicit instruction.
2. **Current state:** a fresh readback from the authoritative Campaign, CRM, mail, logistics, or platform system.
3. **Operating rule:** the active project rules, approved brief, and execution instructions, unless the user explicitly changes them.
4. **Reusable method:** reviewed team guidance and experienced practice.
5. **History:** dated exports, reports, documents, screenshots, and temporary snapshots.
6. **Unknowns:** an explicit, provisional assumption.

This is authority by role, not a claim that older evidence is useless. Preserve a dated case as learning while using a live system for present state. Do not silently rewrite a record when the conflict changes a material action.

## Classify what was read

Label information in the working record when useful:

| Kind | Use | Typical home |
| --- | --- | --- |
| Current fact | Decide and report present state | Campaign, CRM, mail, logistics, platform |
| Active rule | Constrain current work | Project rules, `AGENTS.md`, approved brief |
| Team method | Supply a reusable prior | Reviewed topic guide or baseline |
| Machine state | Support identity, deduplication, monitoring, or automation | State JSON or application binding |
| Historical evidence | Explain what happened at a point in time | Dated report, export, document, snapshot |
| Learning | Record an observation or promoted pattern | Lessons or the owning topic document |

Do not turn a machine snapshot or dated report into current truth without a fresh readback.

## Keep one business record

Carry the same creator or relationship identity across discovery, outreach, replies, terms, delivery, and measurement. Prefer a stable creator/channel ID; when none exists, retain a verified source URL and observation time. Display names, result-row positions, and boolean contact flags are supporting clues, not identity keys. Keep current status, owner, next action, and commercial terms in the authoritative system.

The working record should preserve the reasoning that makes the next decision reproducible:

```text
goal / stage · hypothesis or question · creator or relationship identity
evidence (source, freshness, and what it supports)
decision and confidence · uncertainty or risk
next action, owner, and authority/confirmation
observed result and resulting state
```

Use a concise record for reversible work and add detail when spend, rights, reputation, or lifecycle state changes. This is a decision record, not a duplicate CRM.

By stage, retain the coarse source and fine evidence for discovery; message version, recipients, authorization, and response state for outreach; task-level counters and a dated comparison baseline for monitoring; complete terms and confirmation for negotiation; and checklist evidence, public assets, metrics, attribution confidence, and learning for fulfillment and measurement.

## Develop the operating method

An SOP is a working method for producing a repeatable result. Build or refine it from the real workflow rather than from an idealized template:

1. Observe the current inputs, decisions, systems, handoffs, outputs, and recurring failures.
2. Identify which judgments require expertise and which actions can follow a stable rule.
3. Define the minimum sequence, owners, evidence, confirmation points, completion test, and recovery path.
4. Use the SOP on a bounded real case and record where the operator changes it.
5. Revise the method from the observed result and keep one current project version.

Keep the document proportional to the work. A short checklist may be enough for one repeated task; a cross-stage process may need states, role handoffs, templates, and measurement definitions. The SOP should help someone make the next correct decision, not preserve every historical action.

## Implement automation

Automation is the executable form of an approved operating method. Separate stable business logic from the runtime binding so the same intent can be implemented through Campaign settings, an Agent scheduler, a workspace state file, scripts, or another available system.

Define only the contract needed to run and verify it:

```text
business result and success signal
trigger, eligibility, scope, and schedule
required inputs, stable identities, and authoritative sources
decision rules, actions, owners, and confirmation points
state, deduplication, readback, retry, stop, and escalation
```

Then implement the smallest end-to-end path, run it on a bounded scope, and verify both the action and the resulting business state. Preserve the last verified state when a retryable dependency fails; re-read current state before retrying so the automation does not duplicate work.

When implementation cannot continue, return a capability gap rather than a speculative substitute:

```text
missing capability or access
business step it blocks and evidence used to diagnose it
exact account, permission, connection, API, input, or runtime the user must provide
verification to run after it is available
```

Ask the user for that concrete requirement. Do not label a workflow operational until the required capability exists and the bounded readback succeeds.

## Promote useful experience

During authorized project work, update the project SOP or method when observed evidence changes how the next similar task should be performed. Keep current project rules, live business state, historical cases, and reusable method in their respective authoritative locations.

Treat a single result as an observation or hypothesis. Promote it into the published general Skill or a shared baseline only when its conditions are understood and either repeated evidence supports it or an experienced operator validates it. Promotion to the general Skill requires review by the responsible influencer-marketing operations owner.

When promoting a pattern, retain the situation, evidence, action, reasoning, observed result, applicability, and review date. Prefer revising one positive decision rule over adding a new exception list.

## Resolve conflicts and stale state

When a rule, snapshot, and live state differ:

1. Identify the conflicting fact or decision.
2. Compare source role and observation time.
3. Read the current authoritative system when available.
4. Preserve older material as dated historical evidence.
5. Ask the user only when the remaining difference changes a material action or commitment.

After any external or system action, read back the target record or state. A preview, queued job, or successful transport response is an execution signal; the final record, message, export, or public asset is the business evidence.
