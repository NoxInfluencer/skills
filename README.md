# NoxInfluencer Skills, Plugin, and MCP

Use NoxInfluencer with your AI assistant to plan influencer campaigns, research creators, and manage marketing workflows.

## Install Standalone Skills

Use Node.js and npm to install either Skill or both.

### NoxInfluencer V2

Use the product Skill for creator research and NoxInfluencer account operations. It selects the available connection and tools for the current task.

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer-v2
```

### Influencer Marketing Manager

Use the Manager for marketing strategy, creator selection, partnership decisions, and SOPs. For account operations, it uses the product Skill already selected for the task or defaults to `noxinfluencer-v2`.

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill influencer-marketing-manager
```

See [agent-specific commands](#select-an-agent) to choose an installation target.
For local installation, use the complete [V2 Skill directory](skills/noxinfluencer-v2/) or [Manager Skill directory](skills/influencer-marketing-manager/).

## Connect Your Account

Strategy, writing, and analysis of materials you provide can work without an account connection. Live data and account operations require authorization. Available operations depend on the permissions, entitlements, and tools in your setup.

When the Skill prompts you to connect, follow the setup steps for your client. For MCP, sign in and authorize NoxInfluencer through your client's connection controls.

Account changes and sends follow the preview and approval steps required by the operation.

## Example Requests

- "Help me define creator-selection criteria for a skincare campaign in the US."
- "Find creators for this campaign and explain how they match my criteria."
- "Show my intelligent marketing-plan tasks."
- "Track matching campaign videos these creators publish next."

## What You Can Do

- **Creator research** Discover creators, similar accounts, and brands. Evaluate audiences, content, contacts, and collaboration risks. Review disputes and submit evidence when approved.
- **Campaign operations** Manage campaigns, collections, CRM records, outreach, products, short links, sample shipments, and Shopify affiliate collaborations.
- **Monitoring and reporting** Track published videos and future creator content. Use spreadsheet templates, bulk imports, and exports. Check quota, prices, and credit usage.
- **TikTok Shop research** Filter creators by Shop and video GMV, or research product, shop, and livestream performance.

TikTok Shop Creator Marketplace discovery, private messages, and target invitations require a connected store. Shopify affiliate workflows require an authorized Shopify store.

## Choose Your Setup

| What you need | Setup |
| --- | --- |
| Install only the Skills you choose | [Standalone Skills](#install-standalone-skills) |
| Install the product Skill and Manager together through MCP | [Plugin](#install-the-plugin) |
| Connect your existing MCP client to NoxInfluencer | [Direct MCP](#connect-mcp-directly) |

### Select an Agent

Add `--agent` to either standalone install command. Supported examples include `codex`, `claude-code`, `cursor`, `openclaw`, and `grok`. Add `-g` for a user-level installation across projects.

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer-v2 --agent codex
```

#### Grok Build standalone Skills

**V2 product Skill**

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill noxinfluencer-v2 --agent grok -g
```

**Manager Skill**

```bash
npx skills add https://github.com/NoxInfluencer/skills --skill influencer-marketing-manager --agent grok -g
```

## Install the Plugin

The plugin bundles the Manager and the MCP product Skill. Terminal installation requires Git and a client version with plugin support.

### Codex

```bash
codex plugin marketplace add NoxInfluencer/skills
codex plugin add noxinfluencer@noxinfluencer-codex
```

After adding the marketplace, desktop users can also install **NoxInfluencer** from **NoxInfluencer Marketplace** in the plugin directory.

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

In WorkBuddy's plugin page, choose **Add marketplace**, enter `NoxInfluencer/skills`, and install **noxinfluencer**. [WorkBuddy plugin instructions](https://www.workbuddy.cn/docs/workbuddy/Plugins)

Use your app's MCP controls to [connect your account](#connect-your-account).

## Connect MCP Directly

Your client needs support for remote HTTP MCP servers and OAuth.

| Setting | Value |
| --- | --- |
| Name | `noxinfluencer` |
| Server URL | `https://skill.noxinfluencer.com/mcp` |
| Transport | HTTP |
| Authentication | OAuth |

## Hermes Skills Hub

```bash
hermes skills install skills-sh/noxinfluencer/skills/noxinfluencer-v2
```

To inspect the Skill first, run `hermes skills inspect skills-sh/noxinfluencer/skills/noxinfluencer-v2`.

## Resources

- **NoxInfluencer** [Official website](https://www.noxinfluencer.com/) · [Sign up](https://www.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) · [注册账号](https://cn.noxinfluencer.com/signup?userType=brand&service=%2Fskills%2Fdashboard&utm_source=skill&utm_medium=cli) · [Skills dashboard](https://www.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli) · [Skills 控制台](https://cn.noxinfluencer.com/skills/dashboard?utm_source=skill&utm_medium=cli)
- **Skill directories** [skills.sh](https://www.skills.sh/noxinfluencer/skills/noxinfluencer-v2) · [ClawHub](https://clawhub.ai/noxinfluencer/skills/nox-influencer-marketing)
- **Setup and maintenance** [Plugin guide](plugins/noxinfluencer/README.md) · [V2 build and self-test](v2/README.md) · [WorkBuddy packaging](scripts/workbuddy/README.md)
- **WorkBuddy** [Marketing Expert](scripts/workbuddy/README.md#expert)

## License

The official NoxInfluencer plugin distribution and NoxInfluencer-owned, plugin-specific material are governed by the [plugin license](plugins/noxinfluencer/LICENSE).

Existing repository material outside the plugin-specific scopes, including the standalone Influencer Marketing Manager Skill, is licensed under [MIT No Attribution (MIT-0)](LICENSES/MIT-0.txt). Independently licensed material retains its applicable terms. See the [repository license scope](LICENSE).
