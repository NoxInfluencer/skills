import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import test from "node:test";
import { sharedSkillNames, syncSharedSkills } from "../scripts/sync-shared-skills.mjs";

function write(root, path, data) {
  mkdirSync(join(root, path, ".."), { recursive: true });
  writeFileSync(join(root, path), data);
}

function snapshot(root) {
  const result = {};
  function walk(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) walk(child);
      else result[relative(root, child)] = readFileSync(child);
    }
  }
  walk(root);
  return result;
}

function fixture(t) {
  const repository = mkdtempSync(join(tmpdir(), "nox-shared-skills-"));
  t.after(() => rmSync(repository, { recursive: true, force: true }));
  const root = join(repository, "plugins/noxinfluencer");
  const sourceRoot = join(repository, "skills");
  for (const name of sharedSkillNames) {
    write(sourceRoot, `${name}/SKILL.md`, `---\r\nname: ${name}\r\ndescription: 原始业务与 CLI 指令。\r\nmetadata: { install: cli }\r\n---\r\n\r\nKeep CLI examples unchanged.\r\n`);
    write(sourceRoot, `${name}/references/guide.md`, "Business methods and CLI examples.\n");
    write(sourceRoot, `${name}/references/cli-response-format.md`, "Excluded CLI response format.\n");
    write(root, `skills/${name}/SKILL.md`, `Hand-maintained ${name} MCP entrypoint.\n`);
    write(root, `skills/${name}/.gitkeep`, "");
  }
  write(root, "skills/mcp/SKILL.md", "MCP execution rules.\n");
  return { repository, root, sourceRoot };
}

test("sync preserves all source bytes, renames only the entrypoint, excludes CLI responses, and leaves sources and wrappers intact", (t) => {
  const options = fixture(t);
  const before = snapshot(options.sourceRoot);
  const wrappers = sharedSkillNames.map((name) => readFileSync(join(options.root, "skills", name, "SKILL.md")));
  write(options.sourceRoot, "noxinfluencer/assets/nested/icon.bin", Buffer.from([0, 255, 128, 1]));
  write(options.sourceRoot, "influencer-marketing-manager/scripts/helper.mjs", "// Original helper\n");
  const original = snapshot(options.sourceRoot);
  syncSharedSkills(options);
  assert.deepEqual(snapshot(options.sourceRoot), original);
  sharedSkillNames.forEach((name, index) => {
    const destination = join(options.root, "skills", name);
    assert.deepEqual(readFileSync(join(destination, "SKILL.md")), wrappers[index]);
    for (const [path, bytes] of Object.entries(snapshot(join(options.sourceRoot, name)))) {
      if (path.endsWith("cli-response-format.md")) assert.equal(existsSync(join(destination, path)), false);
      else assert.deepEqual(readFileSync(join(destination, path === "SKILL.md" ? "upstream.md" : path)), bytes);
    }
    assert.deepEqual(readFileSync(join(destination, "upstream.md")), before[join(name, "SKILL.md")]);
    assert.equal(existsSync(join(destination, ".gitkeep")), false);
  });
});

test("repeated sync updates additions and deletions, removes stale excluded files, and preserves plugin entrypoints and MCP", (t) => {
  const options = fixture(t);
  syncSharedSkills(options);
  write(options.root, "skills/noxinfluencer/SKILL.md", "Updated MCP entrypoint.\n");
  write(options.root, "skills/noxinfluencer/references/cli-response-format.md", "Old accidental copy.\n");
  rmSync(join(options.sourceRoot, "noxinfluencer/references/guide.md"));
  write(options.sourceRoot, "noxinfluencer/references/replacement.md", "New upstream guidance.\n");
  write(options.sourceRoot, "influencer-marketing-manager/SKILL.md", "Updated upstream text.\n");
  syncSharedSkills(options);
  const destination = join(options.root, "skills/noxinfluencer");
  assert.equal(existsSync(join(destination, "references/guide.md")), false);
  assert.equal(existsSync(join(destination, "references/cli-response-format.md")), false);
  assert.equal(readFileSync(join(destination, "references/replacement.md"), "utf8"), "New upstream guidance.\n");
  assert.equal(readFileSync(join(destination, "SKILL.md"), "utf8"), "Updated MCP entrypoint.\n");
  assert.equal(readFileSync(join(options.root, "skills/mcp/SKILL.md"), "utf8"), "MCP execution rules.\n");
  const after = snapshot(options.root);
  assert.equal(syncSharedSkills(options).inSync, true);
  assert.deepEqual(snapshot(options.root), after);
});

test("check mode detects changed, missing, and stale content without writing", (t) => {
  const options = fixture(t);
  syncSharedSkills(options);
  assert.equal(syncSharedSkills({ ...options, check: true }).inSync, true);
  write(options.sourceRoot, "noxinfluencer/SKILL.md", "Changed upstream.\n");
  rmSync(join(options.root, "skills/noxinfluencer/references/guide.md"));
  write(options.root, "skills/influencer-marketing-manager/stale.md", "Old upstream file.\n");
  const before = snapshot(options.root);
  const result = syncSharedSkills({ ...options, check: true });
  assert.equal(result.inSync, false);
  assert.deepEqual(result.skills[0].changed, ["upstream.md", "references/guide.md"]);
  assert.deepEqual(result.skills[1].removed, ["stale.md"]);
  assert.deepEqual(snapshot(options.root), before);
});

test("missing second source or a reserved-path collision fails before either snapshot changes", (t) => {
  const options = fixture(t);
  const before = snapshot(options.root);
  const source = join(options.sourceRoot, "influencer-marketing-manager/SKILL.md");
  const original = readFileSync(source);
  rmSync(source);
  assert.throws(() => syncSharedSkills(options), /Missing non-empty source SKILL.md/);
  assert.deepEqual(snapshot(options.root), before);
  writeFileSync(source, original);
  write(options.sourceRoot, "influencer-marketing-manager/upstream.md", "Conflicting upstream file.\n");
  assert.throws(() => syncSharedSkills(options), /collides/);
  assert.deepEqual(snapshot(options.root), before);
});

test("sync rejects destination junctions without changing an external tree or the other Skill", (t) => {
  const options = fixture(t);
  const external = join(options.repository, "external");
  write(external, "SKILL.md", "External file must survive.\n");
  const target = join(options.root, "skills/influencer-marketing-manager");
  rmSync(target, { recursive: true });
  try { symlinkSync(external, target, process.platform === "win32" ? "junction" : "dir"); }
  catch (error) { if (["EPERM", "EACCES"].includes(error.code)) return t.skip("Symlinks unavailable"); throw error; }
  const before = snapshot(join(options.root, "skills/noxinfluencer"));
  assert.throws(() => syncSharedSkills(options), /Symbolic links and junctions/);
  assert.deepEqual(snapshot(join(options.root, "skills/noxinfluencer")), before);
  assert.equal(readFileSync(join(external, "SKILL.md"), "utf8"), "External file must survive.\n");
});
