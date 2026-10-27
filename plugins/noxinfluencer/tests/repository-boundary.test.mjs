import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { checkRepositoryBoundary } from "../scripts/check-repository-boundary.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "nox-boundary-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" });
  const write = (path, content = "baseline\n") => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  };
  git("init", "-b", "main");
  for (const path of ["README.md", "skills/noxinfluencer/SKILL.md", ".claude-plugin/marketplace.json", "plugins/nox-influencer/.claude-plugin/plugin.json", "plugins/nox-influencer/skills/noxinfluencer"]) write(path);
  git("add", ".");
  git("-c", "commit.gpgsign=false", "-c", "user.name=Boundary Test", "-c", "user.email=boundary@example.invalid", "commit", "-m", "Fixture baseline");
  for (const path of [".claude-plugin/marketplace.json", "plugins/nox-influencer/.claude-plugin/plugin.json", "plugins/nox-influencer/skills/noxinfluencer"]) rmSync(join(root, path));
  return { root, write, check: () => checkRepositoryBoundary({ repositoryRoot: root }) };
}

test("plugin changes and only the three authorized deletions pass", (t) => {
  const { write, check } = fixture(t);
  write("plugins/noxinfluencer/skills/mcp/SKILL.md", "plugin instructions\n");
  const report = check();
  assert.deepEqual(report.failures, []);
  assert.equal(report.deletedLegacy.length, 3);
  assert.equal(report.checkedFiles, 2);
});

test("an outer standalone Skill edit is rejected", (t) => {
  const { write, check } = fixture(t);
  write("skills/noxinfluencer/SKILL.md", "unexpected plugin rules\n");
  assert.ok(check().failures.includes("M skills/noxinfluencer/SKILL.md"));
});

test("an extra outer installer index is rejected even when untracked", (t) => {
  const { write, check } = fixture(t);
  write(".plugin/marketplace.json", "{}\n");
  assert.ok(check().failures.includes("untracked .plugin/marketplace.json"));
});

test("unrelated deletions and legacy restoration are rejected", (t) => {
  const { root, write, check } = fixture(t);
  rmSync(join(root, "README.md"));
  write(".claude-plugin/marketplace.json");
  const report = check();
  assert.ok(report.failures.includes("D README.md"));
  assert.ok(report.failures.includes("legacy plugin entry still exists: .claude-plugin/marketplace.json"));
});
