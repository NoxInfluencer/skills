import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { projectRoot, validateSkills } from "../scripts/plugin-source-validation.mjs";
import { inspectWorkbuddyPackage } from "../scripts/workbuddy-package.mjs";

function files(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
}

test("delivered MCP instructions resolve every local dependency inside their own Skill", () => {
  const skillRoot = join(projectRoot, "skills/mcp");
  assert.equal(validateSkills(projectRoot).pending, false);
  for (const path of files(skillRoot).filter((path) => path.endsWith(".md"))) {
    const content = readFileSync(path, "utf8");
    const targets = [...content.matchAll(/\{baseDir\}\/([a-zA-Z0-9_./-]+)/g)].map((match) => resolve(skillRoot, match[1]));
    for (const match of content.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)) {
      if (!/^(?:[a-z][a-z\d+.-]*:|#)/i.test(match[1])) targets.push(resolve(dirname(path), match[1].split("#")[0]));
    }
    for (const target of targets) {
      assert.ok(!relative(skillRoot, target).startsWith(".."), `Dependency escapes Skill: ${target}`);
      assert.ok(existsSync(target), `Missing dependency from ${path}: ${target}`);
    }
  }
});

test("the actual WorkBuddy development package contains the complete Skill and no evaluations", () => {
  const plan = inspectWorkbuddyPackage({ development: true });
  assert.deepEqual(plan.issues, []);
  const archived = new Map(plan.entries.map((entry) => [entry.name, entry.data]));
  for (const path of files(join(projectRoot, "skills/mcp"))) {
    const name = relative(projectRoot, path).replaceAll("\\", "/");
    assert.ok(archived.has(name), `Skill dependency is not packaged: ${name}`);
    if (!name.endsWith("/SKILL.md")) assert.deepEqual(archived.get(name), readFileSync(path));
  }
  assert.ok(plan.entries.every((entry) => !entry.name.startsWith("evals/")));
});
