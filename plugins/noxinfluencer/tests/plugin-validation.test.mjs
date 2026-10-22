import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { projectRoot, readJson, validatePluginSource, validateSkills } from "../scripts/plugin-source-validation.mjs";
import { validateMarketplaces } from "../scripts/validate-marketplace.mjs";

function fixture(t) {
  const repository = mkdtempSync(join(tmpdir(), "nox-plugin-test-"));
  const root = join(repository, "plugins/noxinfluencer");
  t.after(() => rmSync(repository, { recursive: true, force: true }));
  for (const directory of [".plugin", ".codex-plugin", "skills/mcp", "assets"]) mkdirSync(join(root, directory), { recursive: true });
  for (const file of [".plugin/plugin.json", ".codex-plugin/plugin.json", ".mcp.json"]) cpSync(join(projectRoot, file), join(root, file));
  return { root, repository };
}

const skill = "---\nname: noxinfluencer\ndescription: NoxInfluencer MCP workflows.\n---\n\nUse the connected MCP provider.\n";

test("empty mcp delivery is accepted during development", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/.gitkeep"), "");
  assert.equal(validatePluginSource({ root }).skills.pending, true);
});

test("partial MCP delivery fails instead of silently installing zero skills", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/reference.md"), "Incomplete delivery");
  assert.throws(() => validatePluginSource({ root }), /delivery is incomplete/);
});

test("delivered Skill may retain its business name without a generated host marker", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/SKILL.md"), skill);
  assert.deepEqual(validatePluginSource({ root }).skills, { pending: false, fileCount: 1 });
});

test("malformed delivered Skill is rejected", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/SKILL.md"), "Missing frontmatter");
  assert.throws(() => validatePluginSource({ root }), /frontmatter/);
});

test("valid folded YAML descriptions do not need to be rewritten", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/SKILL.md"), skill.replace("description: NoxInfluencer MCP workflows.", "description: >-\n  NoxInfluencer MCP workflows."));
  assert.equal(validatePluginSource({ root }).skills.pending, false);
});

test("frontmatter alone is not a completed Skill", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/SKILL.md"), skill.split("\n\n")[0]);
  assert.throws(() => validatePluginSource({ root }), /must contain instructions/);
});

test("credential files cannot enter delivered Skill contents", (t) => {
  const { root } = fixture(t);
  writeFileSync(join(root, "skills/mcp/SKILL.md"), skill);
  writeFileSync(join(root, "skills/mcp/.env"), "SYNTHETIC_TEST_VALUE=example");
  assert.throws(() => validatePluginSource({ root }), /Potential secret/);
});

test("formal Skill release fails while delivery is pending", (t) => {
  const { root } = fixture(t);
  assert.throws(() => validateSkills(root, { release: true }), /delivery is pending/);
});

test("common and Codex versions cannot drift", (t) => {
  const { root } = fixture(t);
  const path = join(root, ".codex-plugin/plugin.json");
  const manifest = readJson(path);
  manifest.version = "9.9.9";
  writeFileSync(path, JSON.stringify(manifest));
  assert.throws(() => validatePluginSource({ root }), /fields differ: version/);
});

test("test shell cannot be packaged as a formal release", (t) => {
  const { root } = fixture(t);
  assert.throws(() => validatePluginSource({ root, release: true }), /Formal release requires/);
});

test("MCP OAuth resource mismatch is rejected", (t) => {
  const { root } = fixture(t);
  const path = join(root, ".mcp.json");
  const config = readJson(path);
  config.mcpServers.noxinfluencer.oauth_resource = "https://example.invalid/mcp";
  writeFileSync(path, JSON.stringify(config));
  assert.throws(() => validatePluginSource({ root }), /must be equal/);
});

test("new index resolves nested plugin and detects a shadowing root index", (t) => {
  const { root, repository } = fixture(t);
  const sourceRepository = join(projectRoot, "../..");
  for (const file of [".plugin/marketplace.json", ".agents/plugins/marketplace.json"]) {
    mkdirSync(join(repository, file, ".."), { recursive: true });
    cpSync(join(sourceRepository, file), join(repository, file));
  }
  assert.equal(validateMarketplaces(repository, root).plugins[0].source, "./plugins/noxinfluencer");
  writeFileSync(join(repository, "marketplace.json"), JSON.stringify({ plugins: [] }));
  assert.throws(() => validateMarketplaces(repository, root), /shadows/);
});
