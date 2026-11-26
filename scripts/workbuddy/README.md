# WorkBuddy Developer Guide

This guide covers building, checking, and preparing the repository's WorkBuddy distributions for review. For installation and account setup, see the [repository README](../../README.md).

Run the commands below from the repository root. Use Node.js 22.22 or newer and install npm dependencies first:

```bash
npm ci --ignore-scripts
```

## Standalone Strategy Skill

Build **Nox聚星红人营销策略** for the WorkBuddy Skills market:

```bash
npm run workbuddy:check:manager
npm run workbuddy:package:manager
npm run workbuddy:test:manager
```

The package is `dist/noxinfluencer-marketing-manager-workbuddy.zip`, with Skill name `noxinfluencer-marketing-manager`. The builder adapts the shared [Manager source](../../skills/influencer-marketing-manager/) and includes its complete resources; the shared source keeps its existing `influencer-marketing-manager` name.

This standalone Skill provides strategy, creator-selection criteria, cooperation planning, and SOP guidance. It bundles no Expert, connector, or second Skill. The WorkBuddy output treats `noxinfluencer` as a reference to a separately installed, optional Skill: use it only when the task requires live product data or account operations and the capability is actually available. Consultation and analysis of supplied materials work independently; no automatic installation is requested. Only platform review can establish whether WorkBuddy accepts this cross-package reference.

Packaging also exports `dist/noxinfluencer-marketing-manager-workbuddy-icon.png` (512×512 PNG, at most 500KB). Upload this image through the avatar upload control on WorkBuddy's Skill confirmation page. The standalone Skill documentation does not define an archive avatar field, so the builder keeps the image as a separate submission asset.

Maintain the bilingual listing text and version in [manager/skill-metadata.json](manager/skill-metadata.json), and the brand image in [manager/icon.png](manager/icon.png).

## MCP Connector

Build the **Nox 聚星红人营销 MCP** connector:

```bash
npm run workbuddy:check:mcp
npm run workbuddy:package:mcp
npm run workbuddy:test:mcp
```

The check command validates the package inputs without writing a ZIP. Packaging writes `dist/noxinfluencer-workbuddy-mcp.zip` (default version `1.0.4`) with the `noxinfluencer-mcp` Skill and WorkBuddy cloud OAuth (`auth_mode: "server-side"`, `auth_type: "mcp_oauth"`). After importing the package, use server-side authentication with dynamic registration and the `noxinfluencer.agent.user` scope.

All content inputs are physical files under [plugins/noxinfluencer](../../plugins/noxinfluencer/): `.mcp.json`, `assets/icon.png`, the `noxinfluencer-mcp` Skill, and the shared [MCP tool catalog](../../plugins/noxinfluencer/resources/mcp-tools.json). The catalog keeps tool names, workflows, purposes and input schemas together; update it together with the plugin Skill's tool list. The connected server's live catalog and schemas remain authoritative. The full plugin ZIP also includes this resource.

The packager generates WorkBuddy's connector metadata, MCP layout, resource paths and parameter references in memory. It selects the plugin's WorkBuddy OAuth route and shared continuation rules, and omits the Codex-only login route and script. It reads no V2 source snapshots, runs no V2 regeneration, and maintains no separate WorkBuddy content directory. Shared guidance prohibiting CLI fallback is retained.

Use `--version x.y.z` to select a release version and `--output dist/name.zip` to preserve a named archive, for example:

```bash
npm run workbuddy:package:mcp -- --version 1.0.4 --output dist/noxinfluencer-workbuddy-mcp-1.0.4.zip
```

The MCP connector's `source` and bundled MCP server key are both `noxinfluencer-mcp`, distinct from the CLI connector's `noxinfluencer-cli`. When replacing a package that used `source: "noxinfluencer"`, reimport the package and verify that WorkBuddy uses the new connector identity; a version update alone should not be assumed to migrate the old identity.

WorkBuddy's cloud needs ongoing network access to the MCP resource metadata and the NoxInfluencer OAuth metadata, registration, and token endpoints. Verify account authorization, token exchange, and a read-only MCP operation through the platform's self-test before submitting the package for review.

## Expert

The NoxInfluencer Expert is packaged directly from the existing [plugin directory](../../plugins/noxinfluencer/). Its content inputs are the physical plugin manifests, MCP configuration, README, license, two Skill directories and brand image in that directory. The packager generates WorkBuddy's manifest, Agent wrapper, package layout and connector dependency in memory.

The package contains the `noxinfluencer-plugin` and `influencer-marketing-manager-plugin` Skills and depends on the published WorkBuddy MCP connector with source `noxinfluencer-mcp`. The Manager uses the same-package product Skill only when it is installed and available in the current WorkBuddy context.

```bash
npm run workbuddy:check:expert
npm run workbuddy:package:expert
npm run workbuddy:test:expert
```

The Expert ZIP defaults to `dist/noxinfluencer-workbuddy-expert-<version>.zip`. Check and package read the stored plugin files directly. Update `plugins/noxinfluencer/` when changing package content; the Expert packager does not regenerate the plugin from another source tree or maintain a second copy of its business guidance.

The packager maps the public Expert and Agent identity, WorkBuddy resource references and Skill availability conditions in memory. The plugin's original names and business guidance remain shared, including MCP-only execution boundaries, explanatory comparisons and maintenance commands. Use `--version x.y.z` after the package or check command to select an explicit release version.

The compatibility entrypoint `python scripts/workbuddy/sync_expert.py check|package` delegates to the same builder and also accepts `--version`. Packaging writes only the selected archive under `dist/`; it does not create a separate Expert source directory or synchronized Skill snapshots.

The MCP connector v1.0.3 is published with source `noxinfluencer-mcp`. Local package checks validate the declared dependency; connector discovery, account authorization and a live tool operation still require client acceptance.

## CLI Connector

The [NoxInfluencer CLI Connector](../../connectors/noxinfluencer-cli/) uses the NoxInfluencer CLI device-login flow and is packaged separately from the MCP connector:

```bash
python scripts/workbuddy/sync_connector.py check
python scripts/workbuddy/sync_connector.py package
```

The default archive is `dist/noxinfluencer-cli-<Connector version>.zip`. The script also accepts `sync` to refresh its bundled Skill from the [shared NoxInfluencer source](../../skills/noxinfluencer/). Run sync before checking and packaging if that source has changed:

```bash
python scripts/workbuddy/sync_connector.py sync
```
