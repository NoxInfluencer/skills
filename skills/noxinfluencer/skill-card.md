# Skill Card

## Description

NoxInfluencer runs creator discovery, creator due diligence, platform outreach operations, campaign and collection workflows, CRM/email/message/product/short-link/affiliation operations, brand monitoring, exports, and account setup through the NoxInfluencer CLI.

This skill is intended for commercial use by NoxInfluencer customers and authorized agents that have an active NoxInfluencer account and API access.

## Owner

NoxInfluencer is accountable for this skill, the NoxInfluencer CLI dependency, and the NoxInfluencer SaaS workflows it operates.

- Website: [NoxInfluencer Skills](https://www.noxinfluencer.com/skills)
- Source repository: [NoxInfluencer/skills](https://github.com/NoxInfluencer/skills)
- Public registry pages: [ClawHub](https://clawhub.ai/noxinfluencer/noxinfluencer), [skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- Support and feedback: use GitHub Issues for repository issues, or `noxinfluencer feedback submit` for product bugs, data issues, suggestions, and usage questions.

## License/Terms of Use

The skill is published with MIT-0 metadata in ClawHub and Claude plugin manifests. NoxInfluencer SaaS data access, API usage, quota, billing, and account permissions are governed by NoxInfluencer product terms and the user's account entitlements.

## Use Case

Use this skill when a marketer, agency operator, creator partnerships team, or growth team needs an agent to operate NoxInfluencer workflows on their behalf:

- Find creators across YouTube, TikTok, and Instagram.
- Evaluate creators using profile, audience, content, cooperation, pricing, dispute, and performance signals.
- Retrieve visible/exportable contacts only when external outreach is explicitly requested.
- Manage NoxInfluencer campaign, collection, CRM, platform email, message, product, short-link, Shopify affiliation, export, and feedback workflows.
- Monitor campaign videos and inspect brand-monitor intelligence.
- Diagnose setup, authentication, quota, and entitlement issues.

Do not use this skill as a general writing assistant, legal reviewer, media-plan decision maker, external CRM operator, ad-platform operator, spreadsheet automation layer, or substitute for human review of commercial and brand-safety decisions.

## Deployment Geography for Use

Global, subject to NoxInfluencer SaaS availability, platform data availability, user account permissions, and applicable marketing, privacy, export, and consumer-protection rules in the user's jurisdiction.

The CLI supports English and Chinese routing. Chinese-language workflows should use `--lang zh` or the `cn.noxinfluencer.com` links exposed by the CLI.

## Requirements / Dependencies

Requires API Key or External Credential: Yes for API-backed operations.

Credential types:

- NoxInfluencer account session for browser login.
- NoxInfluencer API key created or reused by `noxinfluencer login`, then stored in the local CLI config.
- Manual API-key handoff is a fallback only and must use `noxinfluencer auth --key-stdin`; do not put keys in argv, logs, prompts, or echoed messages.

Runtime dependencies:

- `noxinfluencer` CLI from the npm package `@noxinfluencer/cli`.
- A recent CLI command tree with `campaign`, `collection`, `email`, `message`, `crm`, `product`, `short-link`, `affiliation`, `brand-monitor`, `export`, `feedback`, `quota`, `pricing`, and `agent`.
- Network access to NoxInfluencer API endpoints and the underlying SaaS account permissions for the requested workflow.

Operational dependencies:

- Read exact parameters at runtime with `noxinfluencer schema <cmd>` or `noxinfluencer schema --all`.
- Check setup and auth state with `noxinfluencer doctor`.
- Check Skill quota and entitlement blockers with `noxinfluencer quota`.
- Check current server-side Skill Credit prices with `noxinfluencer pricing tools`.

## Known Risks and Mitigations

Risk: Write commands can create or modify NoxInfluencer campaigns, collections, CRM channels, email tasks, message drafts/replies, products, short links, affiliation objects, exports, feedback threads, and brand-monitor unlocks.

Mitigation: The skill treats write operations as dry-run or preview first, uses `validate` and `preview` stages when available, and runs `--force` only after the user approves the exact object and action.

Risk: Some operations may consume Skill quota, SaaS-side quota, paid entitlement, contact quota, unlock quota, or export capacity.

Mitigation: The skill checks `quota` for account state, uses `pricing tools` for current per-action Skill Credit prices, uses API error `action.url` and `action.hint` for billing or entitlement guidance, and explains quota-impacting unlock/export/contact operations before execution.

Risk: Creator contacts and CRM/email/message data can contain personal or commercially sensitive information.

Mitigation: The skill retrieves visible/exportable contacts only when explicitly requested, avoids dumping raw JSON, limits output to the requested contact or task fields, and does not operate external CRM, email, messaging, spreadsheet, or ad platforms.

Risk: Platform data coverage differs across YouTube, TikTok, and Instagram; pricing, cooperation, audience, and brand-partnership data may be partial or null on some platforms.

Mitigation: The skill uses platform-aware skips and explains unavailable fields as data coverage limits. Brand-monitor product signal commands are treated as YouTube-only unless the CLI schema later exposes broader support.

Risk: Outreach send/schedule operations can contact real creators.

Mitigation: The skill does not draft outreach copy from scratch, requires user-approved content, confirms task/thread, recipients, sender, schedule, and attachments before send or schedule, and does not create new external communication channels.

Risk: Export downloads and attachment uploads can read or write local files.

Mitigation: The skill uses explicit user-provided paths, reports output file paths after download, treats export creation as asynchronous, and only downloads when the export status is ready.

Risk: CLI or repository documentation can drift from the installed CLI command tree.

Mitigation: The skill instructs agents to rely on `schema <cmd>` and `schema --all` instead of memorized parameters. If expected command groups are missing after reinstalling `@noxinfluencer/cli@latest`, the agent stops the affected workflow and reports a CLI package or command-tree mismatch.

## References

- Skill instructions: [SKILL.md](SKILL.md)
- Marketing operations reference: [references/marketing-ops.md](references/marketing-ops.md)
- Brand monitor reference: [references/brand-monitor.md](references/brand-monitor.md)
- Platform support reference: [references/platform-support.md](references/platform-support.md)
- CLI response format reference: [references/cli-response-format.md](references/cli-response-format.md)
- Evaluation cases: [evals/noxinfluencer/evals.json](https://github.com/NoxInfluencer/skills/blob/main/evals/noxinfluencer/evals.json)
- Public source: [NoxInfluencer/skills](https://github.com/NoxInfluencer/skills)
- Public skill listing: [skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- Public registry listing: [ClawHub](https://clawhub.ai/noxinfluencer/noxinfluencer)
- Skill card guidance: [NVIDIA Skill Cards](https://docs.nvidia.com/skills/skill-cards)
- Trust pipeline guidance: [NVIDIA Agent Skill Trust Pipeline](https://docs.nvidia.com/skills/agent-skill-trust-pipeline)

## Skill Output

Output types:

- Plain-language summaries and operational status updates.
- Comparable creator shortlists and creator due-diligence verdicts.
- NoxInfluencer campaign, collection, CRM, email, message, product, short-link, affiliation, brand-monitor, feedback, quota, and export state summaries.
- Local files only when an export download or approved attachment workflow explicitly requires them.

Output formats:

- Markdown or plain text for user-facing answers.
- Tables for shortlists, task lists, and comparable rows.
- JSON body files only as temporary command inputs when the CLI schema requires `--body-file`.
- Downloaded export files at explicit output paths.

Output limits and side effects:

- The skill should not expose secrets, raw API keys, or full raw JSON responses to the user.
- The skill should preserve stable IDs such as `creator_id`, `campaign_id`, `collection_id`, `task_id`, `thread_id`, `brand_id`, and `export_id` for follow-up operations.
- The skill should label scoped checks as scoped judgments and avoid presenting partial data as a complete verdict.

## Skill Version

- Public skill name: `noxinfluencer`
- ClawHub install slug: `@noxinfluencer/nox-influencer-marketing`
- Current ClawHub version observed: `0.1.13`
- Source snapshot observed while generating this card: `21e51e7`
- NoxInfluencer CLI version observed locally: `0.4.18`
- Skill card generated: `2026-07-03`

Release evidence currently available:

- ClawHub moderation status observed as `CLEAN` with moderation reason `scanner.llm.clean`.
- 32 repository eval cases exist across account, discovery, analysis, contacts, monitoring, marketing-ops, brand-monitor, high-risk, routing, and should-not-trigger categories.

Release evidence not currently included in this repository:

- No `BENCHMARK.md` with a completed benchmark report was found.
- No SkillSpector report was found.
- No detached OMS signature file (`skill.oms.sig`) was found.
- No root `LICENSE` file was found, although MIT-0 is declared in registry/plugin metadata.

## Ethical Considerations

Users remain responsible for legal, privacy, platform-policy, brand-safety, campaign-budget, and commercial decisions. The skill can retrieve and summarize NoxInfluencer data, but it should not make final partnership decisions, replace legal or contract review, infer protected-class targeting, or encourage spammy outreach.

Agents using this skill should minimize data exposure, avoid unnecessary contact retrieval, respect creator privacy and platform rules, and require human approval before actions that contact creators, unlock paid data, mutate SaaS records, or download/export datasets.
