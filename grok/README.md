# NoxInfluencer for Grok Build

This adapter gives Grok Build its own marketplace index and self-contained plugin root. It includes the NoxInfluencer MCP connection and the `noxinfluencer-mcp` and `influencer-marketing-manager` Skills.

## Install

Run these commands in a terminal with Grok Build and Git installed:

```bash
grok plugin marketplace add NoxInfluencer/skills
grok plugin install noxinfluencer@NoxInfluencer/skills --trust
grok plugin enable noxinfluencer
```

The GitHub repository qualifier selects this source explicitly; Grok reads its dedicated `.grok-plugin/marketplace.json` index. If the repository was previously added without installing a plugin, refresh it with `grok plugin marketplace update` before installing.

Check the installed plugin with `grok plugin details noxinfluencer`. It should contain two Skills and the `noxinfluencer` MCP server configured at `https://skill.noxinfluencer.com/mcp`. Reload plugins or start a new Grok Build session after installation, and complete the MCP account authorization when requested. A successful plugin installation does not by itself authorize the MCP connection.

These are Grok Build CLI commands. Running them from another app installs into the Grok Build environment where the commands execute.

## Replace an older installation

The older shared layout and this adapter use different source directories. For an existing installation, first remove the old Grok plugin while keeping its data, then refresh the marketplace and install the adapter:

```bash
grok plugin uninstall noxinfluencer --confirm --keep-data
grok plugin marketplace update
grok plugin install noxinfluencer@NoxInfluencer/skills --trust
grok plugin enable noxinfluencer
```

Reinstalling without removing the old source can leave two installed entries with the same name. These commands operate on Grok Build's plugin registry; the Codex and Claude installations have their own registries.

## Maintain the adapter

From the repository root, with repository dependencies installed:

```bash
npm run grok:build
npm run grok:check
npm run grok:test
grok plugin validate ./grok/noxinfluencer
```

The builder reuses the maintained V2 business sources and plugin metadata in memory. It writes only `.grok-plugin/marketplace.json` and `grok/noxinfluencer/`; edit the maintained sources rather than the generated Skills here. The generated plugin places `plugin.json`, `.mcp.json`, and `skills/` at the same root so Grok can discover every component.

The Codex and Claude marketplace indexes, plugin manifests, generated files, and packaging commands remain independent. The Grok adapter does not require changing or reinstalling those hosts.

See the [official Grok Build plugin guide](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/09-plugins.md) for marketplace and plugin commands.
