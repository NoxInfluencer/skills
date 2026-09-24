# Operating design for repeatable marketing work

Read this reference when the user is designing or improving an SOP, connecting stages, or deciding whether a recurring task is ready for automation. Use the detailed lifecycle, workspace and tool guidance in [playbook.md](playbook.md), [workspace-context.md](workspace-context.md), and [operational-tool-prompts.md](operational-tool-prompts.md) when the task reaches those areas.

## Start with the business result

Choose the smallest repeatable result that matters now. A workflow is useful when its next handoff is clear and its outcome can be checked. Do not create roles, agents, dashboards, or states before the work and its evidence require them.

Use this flexible stage shape when it fits the work:

```text
discover → research → communicate → execute → deliver/recover → reuse or close
```

These are work stages, not a required number of people, agents, devices, or automations. Combine stages when one owner can do them safely. Split a stage only when the input, completion test, owner, or risk becomes materially different.

Each stage should leave a usable result for the next stage:

| Stage | Minimum result | Typical open question |
| --- | --- | --- |
| Discover | candidate or opportunity with source and identity | Is this the right object to research? |
| Research | evidence, fit judgment, unknowns and source path | Is there a credible reason to continue? |
| Communicate | reviewed proposal or message with terms and authority | Is the next external step allowed? |
| Execute | current state, evidence of the action, and next due point | Did the agreed work happen? |
| Deliver/recover | delivery, defect, delay or recovery state with owner | Can dependent work continue? |
| Reuse or close | rights, retention, result and learning state | What may be reused, and what should stop? |

For creator work, choose one primary job before searching or briefing: demand,
conversion, or content asset. Record secondary signals, the project-defined
observation window, and the decision they inform. For example, a conversion test
may use qualified visits and purchase questions as secondary signals; high views
alone do not prove sales. Keep this choice in the brief and use it to select the
next evidence rather than treating exposure and sales as interchangeable goals.

## Use one handoff contract

Write each handoff in the smallest form that lets another person or tool continue without re-reading the whole history:

```text
input and source
completion test
result and supporting evidence
missing or conflicting items
owner and authority
next check and due point
```

The useful state progression is usually:

```text
evidence + gaps → proposal + terms → current state + to-dos
```

Do not turn a chat summary into a completed state. Keep fit, contact readiness, interest, agreement, delivery, acceptance, and usage permission distinct. A reply is evidence of a conversation; it is not automatically qualification or agreement.

For a creator campaign, add the decision fields that let the next owner continue
without reopening the strategy: the primary job and secondary signals, the buying
reason, the content's main job, the destination or next touchpoint, and the
evidence expected at review. If reuse may affect the next decision, also record
authorized channels, territory, term and expiry, editing rights, paid-ads rights,
supporting contract or message evidence, owner, and next review. A published post
is evidence of delivery, not permission for indefinite reposting or paid media.

For materials and samples, read back these states separately when they matter:

```text
sent/dispatched → received → accepted/approved → authorized for use → published or reused
```

Record the evidence, owner and next action for each transition. A received file may still need revision, and acceptance does not grant rights that were not agreed.

## Choose a creator strategy from evidence

Start with the primary job and write the buying reason before choosing a creator.
Answer three questions: why does the user need it, why choose this option, and can
the user use it? Then look for a creator with a real scene, a credible way to
explain the problem, and a natural way to demonstrate the value. A solo-travel
product may need a creator who can show the actual travel setup and explain the
problem, rather than the largest channel. Check audience, scene, recent work,
safety, cost, and contactability together; do not reduce fit to follower count.

Give each asset a main job when that helps the decision: `demand` makes the need
visible, `choice` supports comparison, and `confidence` reduces usage risk. Define
the signal for that job. A hands-on video may answer compatibility and setup
questions; it does not need to maximize reach, education, and orders at once. These
labels are decision aids, not a required three-part campaign.

Carry the same buying reason into the product page, social post, email, live
session, or sales reply. Check facts such as compatibility, price, stock, delivery,
returns, and support. If the video promises an easy setup, the destination should
show supported devices and the purchase path. A click alone does not prove the
next touchpoint can complete the decision.

When results are weak, locate the break before changing the plan. Compare
`play → visit`, `visit → cart`, and `cart → order` using the same object, source,
market, and observation window. High plays with few visits points to creator fit,
the buying reason, the call to action, or the link; visits with few carts points to
the offer or page; carts with few orders points to payment, delivery, or checkout.
Test one leading explanation first instead of adding creators because orders are
low.

Separate evidence by what it can answer. UTM, affiliate links, and codes can assign
a tracked order (direct attribution). Brand search, direct traffic, email activity,
new-customer share, and feedback can show related movement (assisted evidence)
without proving who caused it. When the decision is important enough to justify
the cost, choose a time, geography, staggered-launch, or comparison design to
estimate incrementality. Without that design, call the result an observation or
hypothesis, not causal lift. Incrementality is an available method selected for a
material decision, not a default calculation for every campaign.

At review, choose scale, fix, or stop. Scale gradually only when fit,
repeatability, acceptable cost, and business contribution are supported. Fix when
a useful signal has a specific break to test. Stop or replace the approach after
sustained mismatch or repeated failed corrections. A single spike is not enough
for a large budget change. Ask how much authority the user wants the Manager to
have when unclear; prepare a recommendation and seek human confirmation for
material spend changes by default. Keep windows, thresholds, and budget rules
project-specific rather than presenting them as industry benchmarks.

## Make automation bounded and observable

Before proposing or implementing recurring automation, define only the contract needed for this task:

```text
business result and success signal
trigger, eligibility and scope
authoritative inputs and stable identity
decision rule and action
state update and readback
duplicate handling, retry, stop and escalation
```

For a due-date follow-up, check the current relationship state before preparing a task. A new human reply, refusal, pause, changed terms or conflicting owner should invalidate stale work and move the item to review unless an exact approved rule covers that reply class. An exception stops automatic progression and names the owner; it does not silently create another task or send a message.

Automation may prepare a draft, task or recommendation under the approved rule. Keep human approval for new or changed selection criteria, external promises, pricing, material timing or rights commitments, material scope changes and exceptions. A successful command, queued task or generated draft is not proof of the business result; read back the owning state.

When the required trigger, input feed, permission, sender or write path is unavailable, describe the supported preparation and the exact blocked step. Do not call a document, simulation or manual export run an unattended operation.

## Prove value with a small pilot

Start with one recurring work segment, one responsible owner and a small batch that can be reviewed. Define the expected result before running it. Compare the same batch or equivalent work using:

- actual time and waiting time;
- human review, judgment errors and source errors;
- edits, rework and omissions;
- duplicate or stale tasks;
- useful progress such as qualified replies, complete handoffs, accepted deliverables or verified state changes;
- setup, maintenance and exception effort.

Keep the pilot's input, rules, date, reviewer and result together. Expand only when quality and delivery are stable under the same definitions. If the result is mixed, narrow the scope or change the rule; do not scale because task volume increased.

## Keep data and cost claims honest

Numbers that share a topic do not necessarily share a denominator. Before calculating a rate, record:

```text
object and counting unit · source · snapshot or observation time
population and denominator · inclusion/exclusion rules · platform/market
```

Library size, contactable records, comments, imported rows and email records may be different sets. Keep them separate unless the source defines their relationship. A client may choose a different grouping or calculation when the business question changes; update the definitions and label the result rather than preserving a false funnel.

A cost comparison can be useful as a case reference when its limits are explicit. Compare equal delivery volume and quality, include retained human work, tools, setup, maintenance and amortization, and label wages, tool fees, exchange rates and internal assumptions as scenario inputs. The difference is a hypothesis to test in the pilot, not an industry benchmark, ROI, or realized saving. Do not generalize a case when its scope, currency, quality or workload assumptions are unknown.

## Connect channels through shared evidence

When the user is choosing more than one marketing channel, use this interface instead of listing channels in isolation:

```text
business result → channel jobs → shared audience/content/attribution evidence
→ stage checks → budget or workflow adjustment
```

Creator content may supply trust, demonstrations and reusable assets; affiliate activity may supply partner distribution and attributable actions; SEO/GEO may improve discoverability and answer continuity; advertising may amplify a tested audience or asset; social, email, website and live touchpoints may carry education and conversion. Treat these as hypotheses whose role depends on the target behavior, evidence and operating capacity. Do not add a channel, fixed allocation or universal benchmark just because a source mentions it.
