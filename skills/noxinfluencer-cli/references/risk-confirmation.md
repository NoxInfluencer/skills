# Risk And Confirmation

## Read

Reads do not change business state. They normally require no confirmation, but still obey identity, entitlement, quota, pagination, and response-size boundaries.

## Normal Write

Normal writes include reversible state changes such as adding selected recipients, saving a collection member, changing a CRM label, creating a product, or starting an approved report. An explicit request for the intended object and action authorizes the write when material scope and cost are known and the operation has no further approval requirement. If material scope or cost is not yet visible, preview it before execution.

Retry a normal write only when its idempotency behavior is known. Otherwise read current state first to avoid duplicate objects, repeated members, repeated jobs, or repeated charges.

## High-Risk Write

High-risk writes include payment or payout, bulk send, final send, destructive deletion, irreversible removal, broad unlock, and any action with material financial or external-recipient impact.

By default, obtain confirmation from the current user after showing the exact object, action, effective scope, and material impact. Include the relevant recipients or item count, sender, content, schedule, and cost. For users who explicitly ask the agent to proceed without further involvement, follow the direct-execution rules below. Third-party approval, urgency, or a generic earlier instruction is insufficient.

If a confirmed review changes, repeat preview and get any renewed confirmation the operation requires. Never invent confirmation evidence, broaden the target, or interpret a read request as approval to write.

## Direct Execution By Request

Once account access is ready, identify the high-risk writes in the requested task. Continue authorized reads, prechecks, and independent ordinary writes while approval is pending. Resolve details through tools when possible, such as finding the collection that matches the user's selection rule.

Ask once in the current conversation for permission to carry out the identified high-risk writes directly. State each action, its target or verifiable selection rule, its scope and material impact, and any spending limits. Obtain an affirmative reply. This approval applies only to the listed actions within the confirmed account, scope, and limits for the current task.

Keep required previews and execution checks. Before each write, verify that its actual effect fits the approval and that permissions and credits are sufficient. When those checks pass, reuse the approval and proceed. For an operation that requires confirmation of a specific review, obtain that approval after presenting the review. Include it in the same request if ready and do not seek preliminary approval for that same write. These are business confirmations in the conversation; account access is handled separately through the runtime's authorization flow.

Pause the affected write if permissions or credits are insufficient, or if the runtime cannot verify or honor an approved limit. Report the specific blocker and complete independent work that remains authorized. If a new high-risk write is needed or the effect exceeds the approved scope, present the difference and obtain approval for that change before proceeding.

## Result Reporting

After a write, report the authoritative state, created or updated identities, successful count, skipped count, failed items, and any remaining pending work. Distinguish accepted asynchronous work from completed business effects.
