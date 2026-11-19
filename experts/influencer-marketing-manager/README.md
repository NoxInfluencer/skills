# NoxInfluencer Marketing Expert

This WorkBuddy Expert combines marketing strategy, creator discovery and evaluation, and partnership management with verified NoxInfluencer data and account operations. Its display name is **Nox 聚星·红人营销专家**. It starts from the user's request, including consultation, creator research, campaign progress, workflow design, or a partnership decision.

The package contains `noxinfluencer-plugin` and `influencer-marketing-manager-plugin`. These Skill snapshots are generated from the repository's maintained business sources and plugin adapters; edit those sources rather than the snapshots here. The shared Manager source retains its `influencer-marketing-manager` identity, and the V2 product entrypoint retains `noxinfluencer-v2`.

The Expert declares the WorkBuddy connector **source** `noxinfluencer-mcp` in `dependencies.connectors`. WorkBuddy guides the user through connecting this dependency. NoxInfluencer business reads, writes and verification use that MCP connector. The Expert does not install or fall back to the CLI and does not bundle a second MCP connection.

Use Node.js 22.22 or newer and install repository dependencies with `npm ci --ignore-scripts`. From the repository root:

```sh
npm run workbuddy:sync:expert
npm run workbuddy:check:expert
npm run workbuddy:package:expert
```

The package is written to `dist/noxinfluencer-workbuddy-expert.zip`. It contains the WorkBuddy manifest, Agent definition, both complete Skills, avatar and this README. Packaging validates the declared connector source and package resources locally; it does not publish the Expert or establish that the remote connector is available.

The MCP connector is currently under review. Connector discovery, authorization and live tool execution still need to be verified in WorkBuddy when the connector becomes available. Local package checks are separate from that platform verification.
