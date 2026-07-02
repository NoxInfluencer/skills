# NoxInfluencer Skill

Agent skill for NoxInfluencer creator and marketing operations: creator discovery, due-diligence analysis, platform email outreach, external contact retrieval, campaign video monitoring, campaign/collection workflows, CRM/email/message/product/short-link/affiliation operations, brand monitoring, and exports across YouTube, TikTok, and Instagram.

- Official website: [NoxInfluencer](https://www.noxinfluencer.com/)
- Skills dashboard / API key fallback: [NoxInfluencer Skills Dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- skills.sh: [NoxInfluencer on skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- ClawHub: [NoxInfluencer on ClawHub](https://clawhub.ai/noxinfluencer/noxinfluencer)

## What This Skill Helps With

- Discover creators for influencer, creator, and social media marketing campaigns
- Evaluate creators with audience, content, and cooperation signals
- Retrieve visible/exportable contact information for selected creators when external outreach is needed
- Monitor campaign video performance over time
- Manage NoxInfluencer campaigns, collections, CRM channels, products, normal short links, Shopify affiliate campaigns, email/message tasks, and export jobs
- Analyze monitored brands, product signals, influencer/content/tag/product assets, and brand-monitor exports

## Account Setup

If you are starting from scratch, install the CLI and run browser login:

```bash
noxinfluencer login
```

The CLI opens NoxInfluencer, reuses your SaaS login session, creates or reuses a non-expiring API key, and saves it locally.

Manual fallback:

- English: [Sign up](https://www.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) and [open the Skills dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- Chinese: [注册账号](https://cn.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) and [打开 Skills 控制台](https://cn.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)

## Install

The skill expects the latest `@noxinfluencer/cli`, including the command tree with `campaign`, `collection`, `email`, `message`, `crm`, `product`, `short-link`, `affiliation`, `brand-monitor`, `export`, and `agent`. Install the latest npm package:

```bash
npm install -g @noxinfluencer/cli@latest
```

After installation, verify with `noxinfluencer schema --all` and confirm the expected command groups are present. Version output alone is not enough if a local/global install has stale compiled files.

### Skills CLI / skills.sh

Install the skill from GitHub with the open skills ecosystem CLI:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer
```

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

## Optional X/Twitter Companion

For Hermes Agent workflows that need X/Twitter exploration, tweet reads, or
gated X actions around creator and brand research, install Hermes Tweet:

```bash
hermes plugins install Xquik-dev/hermes-tweet --enable
```

Configure `XQUIK_API_KEY` for read and action tools. Set
`HERMES_TWEET_ENABLE_ACTIONS=true` only when action workflows are intentional.
Keep NoxInfluencer as the creator, campaign, and brand-monitor operations skill.

## Notes

- This repository publishes the `noxinfluencer` skill.
- The skill is designed to help an agent operate the NoxInfluencer CLI on the user's behalf.
- Marketing-ops write actions default to preview/dry-run behavior and require explicit approval before execution.
- Some workflows may require a NoxInfluencer account, API access, or CLI authentication during setup.
