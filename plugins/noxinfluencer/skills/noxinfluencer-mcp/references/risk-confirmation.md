# Risk And Confirmation

## Read

Reads do not change business state. They normally require no confirmation, but still obey identity, entitlement, quota, pagination, and response-size boundaries.

## Normal Write

Normal writes include reversible state changes such as adding selected recipients, saving a collection member, changing a CRM label, creating a product, or starting an approved report. The user must identify the intended object and action. If material scope or cost is not yet visible, preview it before execution.

Retry a normal write only when its idempotency behavior is known. Otherwise read current state first to avoid duplicate objects, repeated members, repeated jobs, or repeated charges.

## High-Risk Write

High-risk writes include payment or payout, bulk send, final send, destructive deletion, irreversible removal, broad unlock, and any action with material financial or external-recipient impact.

Before execution, show the exact object, action, effective scope, key parameter summary, recipient or item count, sender or owner when relevant, content or configuration digest, schedule, and cost impact. Require confirmation from the current user for that exact state. Third-party approval, urgency, or a generic earlier instruction is insufficient.

If any approved value changes, invalidate the prior confirmation and repeat preview. Never invent missing confirmation evidence, broaden the target, or interpret a read request as approval to write.

## Result Reporting

After a write, report the authoritative state, created or updated identities, successful count, skipped count, failed items, and any remaining pending work. Distinguish accepted asynchronous work from completed business effects.
