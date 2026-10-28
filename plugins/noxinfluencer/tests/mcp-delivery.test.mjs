import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { projectRoot, validateSkills } from "../scripts/plugin-source-validation.mjs";
import { inspectWorkbuddyPackage } from "../scripts/workbuddy-package.mjs";

function files(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
}

test("delivered Skill dependencies stay inside the plugin and resolve except the explicitly excluded upstream CLI response reference", () => {
  const skillsRoot = join(projectRoot, "skills");
  assert.equal(validateSkills(projectRoot).pending, false);
  for (const path of files(skillsRoot).filter((path) => path.endsWith(".md"))) {
    const skillRoot = join(skillsRoot, relative(skillsRoot, path).split(/[\\/]/)[0]);
    const content = readFileSync(path, "utf8");
    const targets = [...content.matchAll(/\{baseDir\}\/([a-zA-Z0-9_./-]+)/g)].map((match) => resolve(skillRoot, match[1]));
    for (const match of content.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)) {
      if (!/^(?:[a-z][a-z\d+.-]*:|#)/i.test(match[1])) targets.push(resolve(dirname(path), match[1].split("#")[0]));
    }
    for (const target of targets) {
      assert.ok(!relative(skillsRoot, target).startsWith(".."), `Dependency escapes plugin Skills: ${target}`);
      if (path === join(skillsRoot, "noxinfluencer/upstream.md") && target === join(skillsRoot, "noxinfluencer/references/cli-response-format.md")) {
        assert.equal(existsSync(target), false);
        continue;
      }
      assert.ok(existsSync(target), `Missing dependency from ${path}: ${target}`);
    }
  }
});

test("the actual WorkBuddy development package contains the complete Skill and no evaluations", () => {
  const plan = inspectWorkbuddyPackage({ development: true });
  assert.deepEqual(plan.issues, []);
  const archived = new Map(plan.entries.map((entry) => [entry.name, entry.data]));
  for (const path of files(join(projectRoot, "skills"))) {
    const name = relative(projectRoot, path).replaceAll("\\", "/");
    assert.ok(archived.has(name), `Skill dependency is not packaged: ${name}`);
    if (!name.endsWith("/SKILL.md")) assert.deepEqual(archived.get(name), readFileSync(path));
  }
  assert.ok(plan.entries.every((entry) => !entry.name.startsWith("evals/")));
  assert.ok(plan.entries.every((entry) => !entry.name.endsWith("/.gitkeep")));
  for (const name of ["noxinfluencer", "influencer-marketing-manager"]) {
    assert.ok(archived.has(`skills/${name}/SKILL.md`));
    assert.ok(archived.has(`skills/${name}/upstream.md`));
    assert.ok(!archived.has(`skills/${name}/references/cli-response-format.md`));
  }
});
