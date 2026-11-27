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

This standalone Skill provides strategy, creator-selection criteria, cooperation planning, and SOP guidance. Its shared collaboration rules use the active product entrypoint for account work and default to the separately installed `noxinfluencer` Skill when available. The archive contains the standalone Manager and its resources.

Packaging also exports `dist/noxinfluencer-marketing-manager-workbuddy-icon.png` (512×512 PNG, at most 500KB). Upload this image through the avatar upload control on WorkBuddy's Skill confirmation page. The standalone Skill documentation does not define an archive avatar field, so the builder keeps the image as a separate submission asset.

Maintain the bilingual listing text and version in [manager/skill-metadata.json](manager/skill-metadata.json), and the brand image in [manager/icon.png](manager/icon.png).

## Standalone Product Skill

Build **Nox聚星红人营销** for the WorkBuddy Skills market from the generated [V2 product Skill](../../skills/noxinfluencer-v2/).

```bash
npm run v2:build
npm run workbuddy:check:product
npm run workbuddy:package:product
npm run workbuddy:test:product
```

The output is `dist/noxinfluencer-v2-workbuddy.zip`, with one Skill named `noxinfluencer-v2`. Upload the separate `dist/noxinfluencer-v2-workbuddy-icon.png` on the Skill submission form. Listing fields are maintained in [product/skill-metadata.json](product/skill-metadata.json).

The Skill prefers an existing authorized NoxInfluencer MCP connection that supports the task. Its MCP authorization guide uses the common setup, WorkBuddy route, and recovery rules from the generated V2 Skill. It also includes the isolated V2 CLI launcher and contracts for compatible terminal environments. The CLI follows the pinned package contract in the V2 build and has its own login flow. Import the archive through the standalone Skill upload flow.

## MCP Connector

Build the **Nox 聚星红人营销 MCP** connector:

```bash
npm run workbuddy:check:mcp
npm run workbuddy:package:mcp
npm run workbuddy:test:mcp
```

The check command validates the package inputs without writing a ZIP. Packaging writes `dist/noxinfluencer-workbuddy-mcp.zip` (default version `1.0.4`) with the `noxinfluencer-mcp` Skill and WorkBuddy cloud OAuth (`auth_mode: "server-side"`, `auth_type: "mcp_oauth"`). After importing the package, use server-side authentication with dynamic registration and the `noxinfluencer.agent.user` scope.

The content inputs under [plugins/noxinfluencer](../../plugins/noxinfluencer/) are `.mcp.json`, `assets/icon.png`, and the `noxinfluencer-mcp` Skill. The connector packages the Skill's [V2-generated tool list and linked parameter references](../../plugins/noxinfluencer/skills/noxinfluencer-mcp/references/tool-list.md). Tool calls use the connected server's live catalog and input schemas.

The packager adapts the connector metadata, MCP layout and resource paths in memory. It uses the plugin's WorkBuddy OAuth route and shared continuation rules. Run `v2:build` when updating the canonical tool snapshot, then package the generated plugin Skill.

Use `--version x.y.z` to select a release version and `--output dist/name.zip` to preserve a named archive, for example:

```bash
npm run workbuddy:package:mcp -- --version 1.0.4 --output dist/noxinfluencer-workbuddy-mcp-1.0.4.zip
```

The MCP connector's `source` and bundled MCP server key are both `noxinfluencer-mcp`, distinct from the CLI connector's `noxinfluencer-cli`. When replacing a package that used `source: "noxinfluencer"`, reimport the package and verify that WorkBuddy uses the new connector identity; a version update alone should not be assumed to migrate the old identity.

WorkBuddy's cloud needs ongoing network access to the MCP resource metadata and the NoxInfluencer OAuth metadata, registration, and token endpoints. Verify account authorization, token exchange, and a read-only MCP operation through the platform's self-test before submitting the package for review.

## Expert

The NoxInfluencer Expert is packaged directly from the existing [plugin directory](../../plugins/noxinfluencer/). Its inputs include the plugin manifests, MCP configuration, README, license, two Skill directories, brand image and generated `.workbuddy-plugin/expert-agent.md.tmpl`. The packager fills in the Agent template and assembles the WorkBuddy manifest, layout and connector dependency in memory.

The package contains the `noxinfluencer-plugin` and `influencer-marketing-manager-plugin` Skills and depends on the published WorkBuddy MCP connector with source `noxinfluencer-mcp`. Packaging binds the Manager's default product Skill to `noxinfluencer-plugin`. The connector package carries the detailed tool parameter references. The Agent links to the bundled product Skill's connection guide for account tasks without a ready connection. The guide includes the common setup, WorkBuddy fallback, and shared recovery rules.

```bash
npm run workbuddy:check:expert
npm run workbuddy:package:expert
npm run workbuddy:test:expert
```

The Expert ZIP defaults to `dist/noxinfluencer-workbuddy-expert-<version>.zip`. Run `npm run v2:build` after changing the V2 connection guide or Agent template. Check and package read the generated plugin files directly.

The packager maps the public Expert and Agent identity and WorkBuddy resource references in memory. Use `--version x.y.z` after the package or check command to select an explicit release version.

The compatibility entrypoint `python scripts/workbuddy/sync_expert.py check|package` delegates to the same builder and also accepts `--version`. Packaging writes only the selected archive under `dist/`; it does not create a separate Expert source directory or synchronized Skill snapshots.

The MCP connector v1.0.3 is published with source `noxinfluencer-mcp`. Local package checks validate the declared dependency; connector discovery, account authorization and a live tool operation still require client acceptance.

## CLI Connector

The [NoxInfluencer CLI Connector](../../connectors/noxinfluencer-cli/) uses the generated [V2 CLI Skill](../../skills/noxinfluencer-cli/). Its archive bundles `skills/noxinfluencer-cli/SKILL.md` and the corresponding references. WorkBuddy's managed Node.js runtime installs the CLI pinned in `cli.json` and runs its device-login flow. The bundled Skill uses that same CLI and connection.

Build and package the connector from the repository root. The packager reads `skills/noxinfluencer-cli/` and assembles the WorkBuddy Skill inside the ZIP.

```bash
npm run v2:build
python scripts/workbuddy/sync_connector.py check
python scripts/workbuddy/sync_connector.py package
```

The default archive is `dist/noxinfluencer-cli-<Connector version>.zip`. When the CLI package contract changes, keep `cli.json` aligned with `skills/noxinfluencer-cli/cli-package.json`. WorkBuddy's configured registry must have that version for installation. Packaging checks the archive inputs locally. Verify device login and a read-only command in WorkBuddy before submitting the connector.
