# NoxInfluencer Skills

This repository publishes two complementary Agent Skills for influencer marketing:

| Skill | Role | Use it for |
|---|---|---|
| `influencer-marketing-manager` | Expert business manager | User-defined stage results across strategy, two-pass creator discovery, outreach, negotiation, delivery, measurement, and iteration |
| `noxinfluencer` | Native data and execution capability | Creator intelligence, system operations, quota, previews, mutations, errors, and verified readback |

Together they form a naturally aligned business and execution stack: the manager directs stage-appropriate business progress, while NoxInfluencer supplies creator intelligence and operational capabilities. They share business concepts and can each be used independently where the task calls for one layer.

- Official website: [NoxInfluencer](https://www.noxinfluencer.com/)
- Skills dashboard / API key fallback: [NoxInfluencer Skills Dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- skills.sh: [NoxInfluencer on skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- ClawHub: [NoxInfluencer on ClawHub](https://clawhub.ai/noxinfluencer/skills/nox-influencer-marketing)

## NoxInfluencer Tool Capabilities

- Discover creators with topic exclusions and SaaS result filters, and mark or unmark creators as Not interested
- Find similar creators with the same opaque creator IDs and returned-result pricing as normal search
- Preview business quota and export an approved subset of creator search or lookalike results
- Evaluate creators with audience, content, and cooperation signals
- Check creator dispute history and submit evidence-backed collaboration dispute reports when explicitly approved
- Retrieve visible/exportable contact information for selected creators when external outreach is needed
- Monitor known campaign videos and auto-track matching content that selected creators publish later
- Use SaaS spreadsheet templates, imports, failure reports, and direct Excel reports for supported workflows
- Manage NoxInfluencer campaigns, collections, CRM channels, products, normal short links, Shopify affiliate campaigns, email/message tasks, and export jobs
- Discover global brands by name or category/market, then analyze monitored brands, product signals, influencer/content/tag/product assets, and exports
- Upload approved public images and download authorized email, message, template, feedback, and export files
- Check current Skill Credit prices and historical consumption to plan Agent workflows

## NoxInfluencer Account Setup

If you are starting from scratch, install the CLI and start login:

```bash
noxinfluencer login
```

The CLI prints an authorization URL and opens it when possible. Complete SaaS login/registration and authorization in any browser; the CLI creates or reuses a non-expiring API key and saves it locally.

For an Agent, container, or remote terminal, start and wait separately:

```bash
noxinfluencer login start --json
noxinfluencer login wait <login_id>
```

Give the user only `verification_uri_complete` and `user_code` from `login start`; never expose its secret device code. Use `noxinfluencer login --browser` only when a local loopback callback is available.

Manual fallback:

- English: [Sign up](https://www.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) and [open the Skills dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- Chinese: [注册账号](https://cn.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) and [打开 Skills 控制台](https://cn.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)

## Install Skills

Install the business manager:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill influencer-marketing-manager
```

Install the NoxInfluencer tool skill when the Agent should operate NoxInfluencer:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer
```

### WorkBuddy Connector

The WorkBuddy CLI Connector source lives at [`connectors/noxinfluencer-cli`](connectors/noxinfluencer-cli). Its embedded `noxinfluencer` Skill is generated from [`skills/noxinfluencer`](skills/noxinfluencer); edit the latter, then synchronize and verify the package:

```bash
python3 scripts/sync_connector.py sync
python3 scripts/sync_connector.py check
python3 scripts/sync_connector.py package
```

The Connector pins `@noxinfluencer/cli@0.5.5` and uses the CLI's device-login flow. The generated zip under `dist/` is a local release artifact for WorkBuddy review; it is not submitted to the marketplace automatically.

### NoxInfluencer CLI

The skill expects the latest `@noxinfluencer/cli`, including the command tree with `creator`, `monitor`, `campaign`, `collection`, `email`, `message`, `crm`, `product`, `short-link`, `affiliation`, `brand-monitor`, `dispute`, `export`, `file`, `feedback`, `quota`, `pricing`, and `agent`. Install the latest npm package:

```bash
npm install -g @noxinfluencer/cli@latest
```

After installation, verify with `noxinfluencer schema --all` and confirm the expected command groups are present. Version output alone is not enough if a local/global install has stale compiled files.

### skills.sh

The GitHub install commands above are the canonical Skills CLI path. The current public skills.sh listing is for the `noxinfluencer` tool skill; the repository is the source of truth for both Skill directories.

### OpenClaw

Install directly to OpenClaw:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent openclaw
```

### Hermes Skills Hub

Hermes can install this skill through its Skills Hub aggregation layer. The skills.sh identifier is the most stable Hermes entry point:

```bash
hermes skills install skills-sh/noxinfluencer/skills/noxinfluencer
```

You can also preview it before installing:

```bash
hermes skills inspect skills-sh/noxinfluencer/skills/noxinfluencer
```

### Claude Code

Install the skill to Claude Code through the Skills CLI:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent claude-code
```

### Other Skills CLI Agents

Examples for other compatible agents:

```bash
# Codex
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent codex

# Cursor
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent cursor
```

### Claude Code Plugin Marketplace

If you prefer the Claude Code plugin marketplace flow:

```bash
claude plugin marketplace add https://github.com/NoxInfluencer/skills
claude plugin install nox-influencer@noxinfluencer
```

## Platform Entry Points

- **ClawHub**: best for browsing the public skill page, versions, and release metadata
- **Skills CLI / skills.sh**: use the CLI install command above, or browse the public listing on [skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- **OpenClaw**: use the OpenClaw-targeted install command above
- **Hermes Skills Hub**: install through the skills.sh identifier shown above; Hermes can also discover this repository through GitHub taps
- **Claude Code**: use either the Skills CLI install or the plugin marketplace install

## Notes

- This repository publishes `influencer-marketing-manager` and `noxinfluencer`.
- The manager is tool-agnostic; the tool skill helps an Agent operate the NoxInfluencer CLI on the user's behalf.
- Marketing-ops write actions default to preview/dry-run behavior and require explicit approval before execution.
- Creator, collection, CRM, and brand-monitor exports use shared async export tasks; monitor, short-link, and affiliation Excel reports download directly.
- Public rich-text/product image URLs are separate from private email/message attachments.
- ChatGPT is not a supported Skill runtime; OpenAI users should run this Skill with OpenAI Codex.
- Some workflows may require a NoxInfluencer account, API access, or CLI authentication during setup.
