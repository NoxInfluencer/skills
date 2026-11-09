# NoxInfluencer Skills

This repository publishes two complementary Agent Skills for influencer marketing:

| Skill | Role | Use it for |
|---|---|---|
| `influencer-marketing-manager` | Marketing workflow and automation manager | Industry guidance, strategy, SOP design, automating existing processes, partnership decisions, and continuous improvement |
| `noxinfluencer` | NoxInfluencer capability specialist | Nox data and interpretation, product-native workflows, system operations, quota, previews, mutations, errors, and verified readback |

The manager helps users build and improve automated influencer-marketing workflows, starting from their current goal and existing methods. Consultation, strategy, and SOP design can each be a complete task; implementation proceeds when requested. NoxInfluencer owns correct use of its product capabilities and can also serve experienced users directly when their objective and method are already clear. In a combined workflow, the manager sets the business action and acceptance criteria while NoxInfluencer returns verified evidence and system state.

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
- Track shipped samples with native `logistics`, including carrier discovery, batch imports, and saved tracking exports; check installed CLI support and current pricing
- Manage NoxInfluencer campaigns, collections, CRM channels, products, normal short links, Shopify affiliate campaigns, email/message tasks, and export jobs
- Search TikTok Shop Creator Marketplace and manage private-message projects through a connected store (CLI 0.5.8+)
- Search TikTok creators with Shop/GMV filters and read product, shop, and live GMV results (`tiktok search product|shop|live`)
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

The [NoxInfluencer CLI Connector](connectors/noxinfluencer-cli) brings creator research and marketing operations to WorkBuddy. It uses the NoxInfluencer CLI device-login flow.

### WorkBuddy Expert (draft)

The [Influencer Marketing Manager Expert draft](experts/influencer-marketing-manager) combines marketing workflow guidance with the NoxInfluencer CLI Connector for supported account operations.

### NoxInfluencer CLI

The skill uses the current `@noxinfluencer/cli` command tree; TikTok GMV/TTS search requires 0.5.8+, 0.5.10 adds creator average-comment, exposure-period, YouTube content-type, and recent-content pagination filters, 0.5.11 adds search precision and official-account filters, and 0.5.12 adds explicit protected creator shop detail. Install the latest npm package:

```bash
npm install -g @noxinfluencer/cli@latest
```

After installation, verify the needed operations with `noxinfluencer schema --all` and command-specific schema/help. Version output alone is not enough if a local/global install has stale compiled files.

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

### Codex and Claude Code Plugin Marketplace

The NoxInfluencer plugin uses the connected MCP service for account operations. For setup and sign-in instructions, see the [plugin guide](plugins/noxinfluencer/README.md).

#### Codex

```bash
codex plugin marketplace add NoxInfluencer/skills
codex plugin add noxinfluencer@noxinfluencer-codex
```

#### Claude Code

```bash
claude plugin marketplace add https://github.com/NoxInfluencer/skills
claude plugin install noxinfluencer@noxinfluencer-plugins
```

## Platform Entry Points

- **ClawHub**: best for browsing the public skill page, versions, and release metadata
- **Skills CLI / skills.sh**: use the CLI install command above, or browse the public listing on [skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer)
- **OpenClaw**: use the OpenClaw-targeted install command above
- **Hermes Skills Hub**: install through the skills.sh identifier shown above; Hermes can also discover this repository through GitHub taps
- **Codex and Claude Code**: use Skills CLI for the standalone Skill or Marketplace for the connected MCP plugin

## Notes

- This repository publishes `influencer-marketing-manager` and `noxinfluencer`.
- The manager is tool-agnostic and can implement business SOPs and automation across available systems; the NoxInfluencer Skill supplies product-native data, workflow guidance, and execution.
- The standalone NoxInfluencer Skill uses the CLI by default. Pause steps that need an unavailable capability and continue supported work. Use NoxInfluencer SaaS only when the user requests or approves that route. Check the installed CLI for Campaign recipient support.
- With the standalone Skill, use original creator and channel pages for visual review. For approved NoxInfluencer SaaS work, use an external browser, preferably Chrome. Users complete sign-in, authorization, and billing themselves.
- Marketing-ops write actions default to preview/dry-run behavior and require explicit approval before execution.
- Creator, collection, CRM, and brand-monitor exports use shared async export tasks; monitor, short-link, and affiliation Excel reports download directly.
- Public rich-text/product image URLs are separate from private email/message attachments.
- ChatGPT is not a supported Skill runtime; OpenAI users should run this Skill with OpenAI Codex.
- Some workflows may require a NoxInfluencer account, API access, or CLI authentication during setup.

## License

The official NoxInfluencer plugin distribution and NoxInfluencer-owned, plugin-specific material are governed by the [plugin license](plugins/noxinfluencer/LICENSE).

Existing repository material outside the plugin-specific scopes, including the standalone Influencer Marketing Manager Skill, is licensed under [MIT No Attribution (MIT-0)](LICENSES/MIT-0.txt). Independently licensed material retains its applicable terms. See the [repository license scope](LICENSE).
