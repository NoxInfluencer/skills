# NoxInfluencer V2 maintenance and self-test

V2 is maintained in this repository. The one-time source migration is recorded in `migration.json`; builds and updates do not read or synchronize the private repository. The repository-root README and legacy `skills/noxinfluencer`, Connector and Expert remain their existing installation entrypoints during this self-test. Directory visibility is not an access restriction.

## Source and generated outputs

| Maintain here | Generated result |
| --- | --- |
| `v2/source/noxinfluencer/shared/` | The same business guidance in the universal Skill and MCP plugin |
| `v2/source/noxinfluencer/universal.md`, `setup.md`, `adapters/cli/`, `adapters/mcp/` | `v2/skills/noxinfluencer-v2/`, with on-demand CLI/MCP adaptation |
| Shared source and `adapters/mcp/` | `plugins/noxinfluencer/skills/noxinfluencer-mcp/`, fixed to MCP |
| Existing `skills/influencer-marketing-manager/` | An unchanged, self-contained copy in the plugin; no V2 Manager identity |
| Versioned public contracts in `snapshots/`, `capabilities/`, `versions.yaml` | Validated schemas, package identity, runtime evidence and file hashes |

Edit source files, not generated product Skills. Manager remains independently maintained in its existing source directory. Its business guidance does not choose CLI, MCP or a product version; execution remains bound to the active product entrypoint. The plugin contains the same Manager bytes, not a second hand-maintained wrapper or upstream copy.

## Build and checks

Maintainers use Node 24.21.0 / npm 11.19.0 and Python 3.12. From the repository root:

```sh
npm ci --ignore-scripts
npm run v2:build
npm run v2:check
npm run v2:test
python evals/v2/check.py
python -m unittest discover -s evals/v2/campaign-runtime -p "test_*.py"
npm run v2:package
```

`v2:build` validates bounded inputs, paired capability contracts, links and public content before replacing outputs atomically. `v2:check` is read-only and fails on drift. The existing `skills-plugin` / `skills-plugin:check` commands call this same build. They no longer maintain a separate Manager wrapper. ZIPs and hashes under ignored `v2/dist/` are local artifacts; no command commits, pushes, publishes npm, or submits a marketplace release.

## Self-test installation

Use the `mcp` branch of this repository. In a separate client test profile, install the complete `v2/skills/noxinfluencer-v2/` directory with the client's supported local Skill installer, together with the existing shared `skills/influencer-marketing-manager/`. The product Skill's name is `noxinfluencer-v2`. Keep the existing public `noxinfluencer` installation separate; do not install every Skill discovered in the repository. For an offline handoff, the generated `noxinfluencer-v2.zip` includes both required Skill directories.

The universal Skill chooses from the client's real capabilities, account context and task requirements. Only its selected runtime reference is loaded. A plugin installation already chooses MCP and must not install or fall back to a CLI. Actual user authorization and operating-system approvals remain in normal client controls.

For CLI testing, the installed product exposes:

```sh
node "<installed-v2-skill>/scripts/nox-cli.mjs" --install
node "<installed-v2-skill>/scripts/nox-cli.mjs" --verify
node "<installed-v2-skill>/scripts/nox-cli.mjs" login start --json
node "<installed-v2-skill>/scripts/nox-cli.mjs" login wait <login_id>
```

The CLI package version comes from the checked `cli-schema` snapshot, not npm `latest`. Installation and default login configuration live in a separate per-user V2 cache. No global CLI is replaced and no legacy credential file is copied. User-safe login links/codes can be shown; device secrets and credentials must not be exposed.

**Distribution observation, 2026-10-29:** the required CLI 0.6.3 is not available from the official npm registry. Until it is published separately, maintainers can supply a local package from the matching CLI build:

```sh
node "<installed-v2-skill>/scripts/nox-cli.mjs" --install-from <authorized-local-cli-package.tgz>
```

The local package must pass the same package-identity and actual Campaign-schema checks before activation. An unavailable package is a distribution gap; do not silently use the legacy CLI. Publishing the CLI or deploying `kol_claw` is separate from this Skill change.

For the MCP self-test, give the plugin maintainer the complete `plugins/noxinfluencer/` directory or `noxinfluencer-mcp-plugin.zip`. It contains its own Skills, OAuth helper, icon and MCP configuration, and requires no repository-relative files. Use the current client's supported plugin/connection mechanism. Do not assume that changing this branch changes an already installed plugin or marketplace reference.

## Service and contract changes

For a `kol_claw` change, review both CLI schema and MCP tools/authorization/file-transfer contracts. Export the relevant public snapshot in the existing versioned snapshot format (`id`, `kind`, `version`, `source`, `items`, and required schema metadata), then run:

```sh
node v2/scripts/update-snapshot.mjs cli-schema <cli-schema-snapshot.json>
node v2/scripts/update-snapshot.mjs mcp-tools <mcp-tools-snapshot.json>
```

The updater stages the complete public source in a temporary workspace and validates it before atomically updating a snapshot and its digest. CLI Campaign contracts are derived from the imported command schema. An incompatible capability-registry change fails validation and leaves source untouched; update the paired registry/versions and business guidance as part of the same reviewed change. Do not remove confirmation, idempotency or account bindings to make validation pass. Then build, check and run affected tests. New service operations need appropriate adapters and semantic cases; a generated digest is not behavioral acceptance.

Keep the legacy CLI/server contracts compatible while legacy clients remain installed. Skill directory isolation does not itself guarantee API compatibility.

## Acceptance layers

`evals/v2/` contains synthetic inputs and review expectations, plus an offline harness that keeps future turns and rubrics out of model input. Structural validation, unit tests, ZIP checks and local CLI schema verification are offline evidence. Record separate evidence for model decisions, actual client installation, authorized account identity, live tool/schema availability, file transfer and business readback before rollout. The production endpoint configuration alone does not establish that every snapshotted tool or OAuth scope is deployed.

After acceptance, replacing the legacy default is a separate change to the stable `skills/noxinfluencer` artifact, installer references and relevant channel packages. Changing README text alone does not update existing installations.
