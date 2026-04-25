# NoxInfluencer Skill

Agent skill for NoxInfluencer creator and marketing operations: creator discovery, due-diligence analysis, outreach-ready contact retrieval, campaign video monitoring, campaign/collection workflows, CRM/email/message operations, brand monitoring, and exports across YouTube, TikTok, and Instagram.

- Official website: [NoxInfluencer](https://www.noxinfluencer.com/)
- Skills dashboard / API key: [NoxInfluencer Skills Dashboard](https://www.noxinfluencer.com/skills/dashboard)
- skills.sh: [NoxInfluencer on skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- ClawHub: [NoxInfluencer on ClawHub](https://clawhub.ai/noxinfluencer/noxinfluencer)

## What This Skill Helps With

- Discover creators for influencer, creator, and social media marketing campaigns
- Evaluate creators with audience, content, and cooperation signals
- Retrieve outreach-ready contact information for selected creators
- Monitor campaign video performance over time
- Manage NoxInfluencer campaigns, collections, CRM channels, email/message tasks, and export jobs
- Analyze monitored brands, product signals, influencer/content/tag/product assets, and brand-monitor exports

## Account Setup

If you are starting from scratch, create a brand account and get an API key first:

- English: [Sign up](https://www.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard) and [open the Skills dashboard](https://www.noxinfluencer.com/skills/dashboard)
- Chinese: [注册账号](https://cn.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard) and [打开 Skills 控制台](https://cn.noxinfluencer.com/skills/dashboard)

## Install

The skill expects the NoxInfluencer CLI command tree with `campaign`, `collection`, `email`, `message`, `crm`, `brand-monitor`, `export`, and `agent`. Until the npm package is republished with that command tree, OpenClaw installs the pinned release artifact:

```bash
npm install -g https://github.com/NoxInfluencer/skills/releases/download/noxinfluencer-cli-0.4.0-ops.1/noxinfluencer-cli-0.4.0.tgz
```

After installation, verify with `noxinfluencer schema --all`. Version output alone is not enough because the previously published npm `0.4.0` package has stale compiled files.

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
- **Claude Code**: use either the Skills CLI install or the plugin marketplace install

## Notes

- This repository publishes the `noxinfluencer` skill.
- The skill is designed to help an agent operate the NoxInfluencer CLI on the user's behalf.
- Marketing-ops write actions default to preview/dry-run behavior and require explicit approval before execution.
- Some workflows may require a NoxInfluencer account, API access, or CLI authentication during setup.
