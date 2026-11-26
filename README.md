# NoxInfluencer Skills, Plugin, and MCP

Use NoxInfluencer with your AI assistant to plan influencer campaigns, research creators, and manage marketing workflows.

- Official website: [NoxInfluencer](https://www.noxinfluencer.com/)
- Account and API access: [NoxInfluencer Skills Dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- Skill directories: [skills.sh](https://skills.sh/noxinfluencer/skills/noxinfluencer) · [ClawHub](https://clawhub.ai/noxinfluencer/skills/nox-influencer-marketing)

## What You Can Do

- Turn a campaign brief into a marketing strategy, creator-selection criteria, cooperation plan, and SOP.
- Improve existing marketing processes and, when requested, implement SOPs and automation with the tools and systems available to your assistant.
- Discover creators and similar accounts, filter results, and organize creator collections and CRM records.
- Evaluate creator audiences, content, and collaboration risks; check dispute history and submit evidence-backed dispute reports when approved.
- Find available creator contact details and manage email outreach and supported message workflows, including TikTok Shop private-message projects.
- Manage campaigns, products, short links, and Shopify affiliate collaborations.
- Find TikTok creators with Shop and video GMV filters, and research product, shop, and livestream GMV performance.
- Discover brands by name, category, or market, and analyze their creator, content, and product signals.
- Monitor campaign videos and automatically track matching content that selected creators publish later.
- Track shipped samples, including batch imports and tracking reports.
- Use spreadsheet templates, bulk imports, and report exports for supported workflows.
- Check account quota, Skill Credit prices, and historical usage to plan your work.

Strategy, writing, and analysis of materials you provide can work without connecting a NoxInfluencer account. Live data and account operations require authorization; available operations depend on your account and the tools provided by your installation.

TikTok Shop Creator Marketplace discovery, private messages, and target invitations require a connected store. These store workflows are separate from TikTok product, shop, and livestream market-data research. Shopify affiliate workflows require an authorized Shopify store.

For changes to your account or external sends, the assistant prepares a preview where supported and acts within the scope you approve. Existing approved operating rules can cover recurring work.

## Choose Your Setup

| Option | What it provides | Choose it when |
| --- | --- | --- |
| **Standalone Skills** | `influencer-marketing-manager` for strategy, SOPs, and automation; `noxinfluencer` for product data, interpretation, and CLI operations | Your Agent supports Skills and you want to install either Skill separately |
| **Plugin** | The marketing manager and NoxInfluencer MCP Skills together | You use Codex, Claude Code, Grok Build, or WorkBuddy and want an integrated setup |
| **MCP connection** | Direct access to NoxInfluencer tools through a connected account | Your AI client supports remote HTTP MCP servers and OAuth |

The manager helps define your strategy, workflow, and next business action. NoxInfluencer supplies product data, interpretation, and supported account operations. Use either Skill independently or use both together; the manager can also work with other systems available to your assistant.

## Install the Plugin

Choose the instructions for your app. Terminal installation requires Git and a version of the app with plugin support.

### Codex

```bash
codex plugin marketplace add NoxInfluencer/skills
codex plugin add noxinfluencer@noxinfluencer-codex
```

In the desktop app, you can also select **NoxInfluencer Marketplace** in the plugin directory after adding the marketplace, then install **NoxInfluencer**.

### Claude Code

```bash
claude plugin marketplace add https://github.com/NoxInfluencer/skills
claude plugin install noxinfluencer@noxinfluencer-plugins
```

### Grok Build

```bash
grok plugin marketplace add NoxInfluencer/skills
grok plugin install noxinfluencer@NoxInfluencer/skills --trust
grok plugin enable noxinfluencer
```

### WorkBuddy

In WorkBuddy's plugin page, choose **Add marketplace**, enter `NoxInfluencer/skills`, and install **noxinfluencer**.

See the official [WorkBuddy plugin instructions](https://www.workbuddy.cn/docs/workbuddy/Plugins) for marketplace help.

Other WorkBuddy setups are described in the [CLI Connector](connectors/noxinfluencer-cli) and [Marketing Expert packaging guide](scripts/workbuddy/README.md#expert). The CLI Connector uses CLI login; the Expert package adapts the same plugin contents for WorkBuddy's Expert market and uses the published MCP connector.

### Connect Your Account

After installing the plugin, use your app's MCP connection controls to connect NoxInfluencer. Complete sign-in and authorization in the browser, then return to your app and continue your request.

The plugin connects through MCP. It does not require the NoxInfluencer CLI or a manually copied API key. See the [plugin guide](plugins/noxinfluencer/README.md) for more setup help.

## Install Standalone Skills

Use the Skills CLI with Node.js and npm available. Install either Skill, or install both for strategy and product operations together.

### Influencer Marketing Manager

For marketing strategy, creator-selection criteria, partnership decisions, SOPs, workflow improvement, and automation using available tools:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill influencer-marketing-manager
```

### NoxInfluencer

For creator research, product-data interpretation, product guidance, and NoxInfluencer account workflows:

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer
```

To use NoxInfluencer account features with this standalone Skill, install the CLI and sign in:

```bash
npm install -g @noxinfluencer/cli@latest
noxinfluencer login
```

Open the authorization link shown by the CLI if your browser does not open automatically. Sign in or create a NoxInfluencer account, approve access, and return to your terminal.

For an Agent, container, or remote terminal without a local browser, start login separately:

```bash
noxinfluencer login start --json
```

Open the returned `verification_uri_complete` in your browser and complete authorization. Then use the returned `login_id` to finish login in the original environment:

```bash
noxinfluencer login wait <login_id>
```

If an assistant is helping, use the authorization link and user code it provides to complete sign-in in your own browser.

For account registration or manual API key setup:

- English: [Sign up](https://www.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) · [Skills dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- 中文：[注册账号](https://cn.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) · [Skills 控制台](https://cn.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)

### Select an Agent

You can target a compatible Agent during installation:

```bash
# Codex
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent codex

# Claude Code
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent claude-code

# Cursor
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent cursor

# OpenClaw
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer --agent openclaw
```

Replace `noxinfluencer` with `influencer-marketing-manager` to install the manager for the same Agent.

### Hermes Skills Hub

Install the NoxInfluencer Skill through Hermes:

```bash
hermes skills install skills-sh/noxinfluencer/skills/noxinfluencer
```

To preview it first:

```bash
hermes skills inspect skills-sh/noxinfluencer/skills/noxinfluencer
```

## Connect MCP Directly

If your AI client supports remote HTTP MCP servers with OAuth, add a connection with these settings:

| Setting | Value |
| --- | --- |
| Name | `noxinfluencer` |
| Server URL | `https://skill.noxinfluencer.com/mcp` |
| Transport | HTTP |
| Authentication | OAuth |

Use your client's connection controls to sign in and authorize your NoxInfluencer account. Once connected, ask your assistant to use the available NoxInfluencer tools. The connection uses your account's permissions and service entitlements.

## Example Requests

- "Help me define creator-selection criteria for a skincare campaign in the US."
- "Turn our creator outreach process into an SOP with clear follow-up steps."
- "Help automate our weekly creator follow-ups using our existing tools and approved rules."
- "Draft an outreach message based on this campaign brief."
- "Find creators for this campaign and explain how they match my criteria."
- "Review these creators' collaboration risks and available dispute history."
- "Track matching campaign videos these creators publish next."
- "Show my intelligent marketing-plan tasks."
- "Show the next page of my marketing-plan tasks."

For strategy advice, share your campaign goal, target market, budget, and current process. For account tasks, connect NoxInfluencer first and describe the data or workflow you need.

## License

The official NoxInfluencer plugin distribution and NoxInfluencer-owned, plugin-specific material are governed by the [plugin license](plugins/noxinfluencer/LICENSE).

Existing repository material outside the plugin-specific scopes, including the standalone Influencer Marketing Manager Skill, is licensed under [MIT No Attribution (MIT-0)](LICENSES/MIT-0.txt). Independently licensed material retains its applicable terms. See the [repository license scope](LICENSE).
