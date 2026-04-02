# NoxInfluencer Skills

Agent skill for influencer and creator marketing: creator discovery, due-diligence analysis, outreach-ready contact retrieval, and campaign video monitoring across YouTube, TikTok, and Instagram.

- Official website: [https://www.noxinfluencer.com/](https://www.noxinfluencer.com/)
- Skills dashboard / API key: [https://www.noxinfluencer.com/skills/dashboard](https://www.noxinfluencer.com/skills/dashboard)
- ClawHub: [https://clawhub.ai/noxinfluencer/noxinfluencer](https://clawhub.ai/noxinfluencer/noxinfluencer)

## What This Skill Helps With

- Discover creators for influencer, creator, and social media marketing campaigns
- Evaluate creators with audience, content, and cooperation signals
- Retrieve outreach-ready contact information for selected creators
- Monitor campaign video performance over time

## Account Setup

If you are starting from scratch, create a brand account and get an API key first:

- English signup: `https://www.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard`
- English API key: `https://www.noxinfluencer.com/skills/dashboard`
- Chinese signup: `https://cn.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard`
- Chinese API key: `https://cn.noxinfluencer.com/skills/dashboard`

## Install

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
- **Skills CLI / skills.sh**: best for installing the skill from GitHub into supported agents
- **OpenClaw**: use the OpenClaw-targeted install command above
- **Claude Code**: use either the Skills CLI install or the plugin marketplace install

## Notes

- This repository publishes the `noxinfluencer` skill.
- The skill is designed to help an agent operate the NoxInfluencer CLI on the user's behalf.
- Some workflows may require a NoxInfluencer account, API access, or CLI authentication during setup.
