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
```

The check command validates the package inputs without writing a ZIP. Packaging writes `dist/noxinfluencer-workbuddy-mcp.zip` with the v2 `noxinfluencer-mcp` Skill and WorkBuddy cloud OAuth (`auth_mode: "server-side"`, `auth_type: "mcp_oauth"`). After importing the package, use server-side authentication with dynamic registration and the `noxinfluencer.agent.user` scope. The tool reference is built from the [v2 MCP input schemas](../../v2/source/noxinfluencer/snapshots/mcp-tools.json) and the checked-in tool purposes in [mcp/](mcp/).

The MCP connector's `source` and bundled MCP server key are both `noxinfluencer-mcp`, distinct from the CLI connector's `noxinfluencer-cli`. When replacing a package that used `source: "noxinfluencer"`, reimport the package and verify that WorkBuddy uses the new connector identity; a version update alone should not be assumed to migrate the old identity.

WorkBuddy's cloud needs ongoing network access to the MCP resource metadata and the NoxInfluencer OAuth metadata, registration, and token endpoints. Verify account authorization, token exchange, and a read-only MCP operation through the platform's self-test before submitting the package for review.

## Expert

The [NoxInfluencer Expert](../../experts/influencer-marketing-manager/README.md) bundles the `noxinfluencer-plugin` and `influencer-marketing-manager-plugin` Skills and depends on the WorkBuddy MCP connector with source `noxinfluencer-mcp`.

```bash
npm run workbuddy:check:expert
npm run workbuddy:package:expert
npm run workbuddy:test:expert
```

The Expert ZIP is `dist/noxinfluencer-workbuddy-expert.zip`. Check and package assemble from current canonical sources in memory, without requiring a prior V2 build or using stale Skill snapshots.

To refresh the reviewable copies under the [Expert's skills directory](../../experts/influencer-marketing-manager/skills/), run:

```bash
npm run workbuddy:sync:expert
```

The previous `python scripts/workbuddy/sync_expert.py sync|check|package` entrypoint delegates to the same builder. Edit maintained business sources and plugin adapters rather than generated Skill snapshots.

The connector was marked as under review in the existing distribution documentation. Local package checks do not establish platform availability; verify connector discovery, account authorization, and live tool execution in WorkBuddy when the connector becomes available.

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
