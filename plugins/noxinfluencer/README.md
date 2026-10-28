# NoxInfluencer Plugin

NoxInfluencer brings influencer-marketing guidance and connected NoxInfluencer workflows to Codex and Claude Code.

The plugin combines two complementary assistants:

| Assistant | Role | Use it for |
| --- | --- | --- |
| Influencer Marketing Manager | Marketing strategy and workflow planning | Campaign goals, creator-selection criteria, partnership decisions, outreach drafts, SOPs, and process improvement |
| NoxInfluencer MCP | Product guidance and account workflows | Understanding NoxInfluencer data and features, viewing marketing-plan tasks, and opening authorized business pages |

The manager helps you decide what to do and how to organize the work. NoxInfluencer provides product-specific guidance and performs supported account operations through a connected MCP service.

- Official website: [NoxInfluencer](https://www.noxinfluencer.com/)

## What You Can Do

- Turn a campaign brief into creator-selection criteria and a partnership workflow.
- Design or improve SOPs for creator evaluation, outreach, collaboration, and reporting.
- Draft outreach messages and plan next steps for creator partnerships.
- Understand NoxInfluencer product workflows and interpret the evidence you provide.
- View your intelligent marketing-plan tasks, including subsequent pages of results.
- Open the intelligent marketing-plan task page using your authorized NoxInfluencer account.

The current connected actions are listing marketing-plan tasks and opening the task page. Other account operations depend on the tools available through your connection. Marketing advice and drafting can be used without connecting an account.

## Install from GitHub Marketplace

Use a current version of Codex or Claude Code with plugin support. The commands below require Git; connected account features also require a NoxInfluencer account.

### Codex

Run these commands in your terminal:

```bash
codex plugin marketplace add NoxInfluencer/skills
codex plugin add noxinfluencer@noxinfluencer-codex
```

In the desktop app, you can also select **NoxInfluencer Marketplace** in the plugin directory and install **NoxInfluencer** after adding the marketplace.

Codex downloads and manages the marketplace automatically.

### Claude Code

Run these commands in your terminal:

```bash
claude plugin marketplace add NoxInfluencer/skills
claude plugin install noxinfluencer@noxinfluencer-plugins
```

Alternatively, run the following inside Claude Code:

```text
/plugin marketplace add NoxInfluencer/skills
/plugin install noxinfluencer@noxinfluencer-plugins
```

For help with marketplace installation, see the official [Codex marketplace instructions](https://developers.openai.com/plugins/build/plugins#add-a-marketplace-from-the-cli) or [Claude Code plugin instructions](https://code.claude.com/docs/en/plugins/install).

## Connect Your NoxInfluencer Account

After installation, use your app's MCP connection controls to connect NoxInfluencer and complete the sign-in and authorization prompts. Start a new conversation after setup to load the plugin and its connected tools.

Account operations use the permissions and service entitlements of the NoxInfluencer account you authorize. The plugin connects through MCP; installing the NoxInfluencer CLI or copying an API key is not required.

## Example Requests

- "Help me define creator-selection criteria for a skincare campaign in the US."
- "Turn our creator outreach process into an SOP with clear follow-up steps."
- "Draft a first outreach message for this creator based on my campaign brief."
- "Show my intelligent marketing-plan tasks."
- "Show the next page of my marketing-plan tasks."
- "Open my intelligent marketing-plan tasks in NoxInfluencer."

Tell the assistant your campaign goal, target market, budget, and current process when asking for strategy or workflow advice. For account tasks, connect NoxInfluencer first and describe the information or page you want to access.
