import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../plugins/noxinfluencer");

function listRuntimeFiles(path, root = path) {
  const stat = lstatSync(path);
  const name = relative(root, path).split(sep).join("/");
  if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${name || path}`);
  if (stat.isDirectory()) {
    if (/^(node_modules|dist|build|coverage|logs|evals|\.git|\.evals)$/i.test(path.split(sep).at(-1))) {
      throw new Error(`Development directory is not allowed: ${name}`);
    }
    return readdirSync(path).sort().flatMap((entry) => listRuntimeFiles(join(path, entry), root));
  }
  if (!stat.isFile()) throw new Error(`Unsupported filesystem entry: ${name}`);
  if (/^(\.env(?:\..*)?|id_rsa)$|\.(pem|key|p12|pfx|log)$/i.test(path.split(sep).at(-1))) {
    throw new Error(`Potential secret or log file is not allowed: ${name}`);
  }
  return [path];
}

export const sharedSkillNames = ["noxinfluencer", "influencer-marketing-manager"];

// Check every ancestor before reading or writing; never follow a directory
// junction into the outer sources or another part of the developer's machine.
function plainPath(path) {
  const parent = dirname(path);
  if (parent !== path) plainPath(parent);
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) throw new Error(`Symbolic links and junctions are not allowed: ${path}`);
  return stat;
}

function inside(root, path) {
  const name = relative(root, path);
  return Boolean(name) && name !== ".." && !name.startsWith(`..${sep}`) && !isAbsolute(name);
}

function pruneEmptyDirectories(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(path, entry.name);
    pruneEmptyDirectories(directory);
    if (readdirSync(directory).length === 0) rmdirSync(directory);
  }
}

export function syncSharedSkills({ root = projectRoot, sourceRoot = resolve(root, "../../skills"), check = false } = {}) {
  root = resolve(root);
  sourceRoot = resolve(sourceRoot);
  for (const path of [root, sourceRoot, join(root, "skills")]) {
    if (!plainPath(path).isDirectory()) throw new Error(`Expected a plain directory: ${path}`);
  }

  // Read and validate BOTH snapshots before changing either destination.
  const plans = sharedSkillNames.map((name) => {
    const source = join(sourceRoot, name), target = join(root, "skills", name);
    if (!inside(root, target) || source === target || inside(source, target) || inside(target, source)) {
      throw new Error(`Source and destination must be separate trees: ${source}, ${target}`);
    }
    if (!plainPath(source).isDirectory() || !plainPath(target).isDirectory()) throw new Error(`Missing Skill directory: ${name}`);
    const wrapper = join(target, "SKILL.md");
    if (!plainPath(wrapper).isFile() || !readFileSync(wrapper).length) throw new Error(`Missing plugin entrypoint: ${wrapper}`);

    const snapshot = new Map();
    const excluded = [];
    const keys = new Set(["skill.md"]); // The hand-maintained entrypoint is reserved.
    for (const path of listRuntimeFiles(source)) {
      const sourceName = relative(source, path).split(sep).join("/");
      if (sourceName.split("/").at(-1).toLowerCase() === "cli-response-format.md") {
        excluded.push(sourceName);
        continue;
      }
      const outputName = sourceName === "SKILL.md" ? "upstream.md" : sourceName;
      const key = outputName.normalize("NFC").toLowerCase();
      if (keys.has(key)) throw new Error(`Copied path collides with a reserved or existing path: ${name}/${outputName}`);
      keys.add(key);
      snapshot.set(outputName, readFileSync(path));
    }
    if (!existsSync(join(source, "SKILL.md")) || !snapshot.get("upstream.md")?.length) {
      throw new Error(`Missing non-empty source SKILL.md: ${source}`);
    }
    const current = new Map(listRuntimeFiles(target)
      .filter((path) => path !== wrapper)
      .map((path) => [relative(target, path).split(sep).join("/"), path]));
    const changed = [...snapshot].filter(([path, data]) => !current.has(path) || !readFileSync(current.get(path)).equals(data)).map(([path]) => path);
    const removed = [...current.keys()].filter((path) => !snapshot.has(path));
    return { name, target, snapshot, current, changed, removed, excluded };
  });

  if (!check) {
    for (const plan of plans) {
      // All non-SKILL.md content here is a generated snapshot. Only remove
      // validated ordinary files inside these two fixed destinations.
      for (const name of plan.removed) {
        const path = plan.current.get(name);
        if (!inside(plan.target, path) || !plainPath(path).isFile()) throw new Error(`Unsafe removal: ${path}`);
        rmSync(path);
      }
      pruneEmptyDirectories(plan.target);
      for (const name of plan.changed) {
        const path = resolve(plan.target, name);
        if (!inside(plan.target, path)) throw new Error(`Unsafe output path: ${path}`);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, plan.snapshot.get(name));
      }
    }
  }
  return {
    inSync: plans.every(({ changed, removed }) => changed.length === 0 && removed.length === 0),
    skills: plans.map(({ name, snapshot, changed, removed, excluded }) => ({ name, fileCount: snapshot.size, changed, removed, excluded })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) throw new Error("Usage: npm run skills-plugin [-- --check]");
    const check = args[0] === "--check";
    const result = syncSharedSkills({ check });
    for (const skill of result.skills) {
      console.log(`${skill.name}: ${skill.fileCount} upstream files; ${skill.changed.length} ${check ? "outdated" : "updated"}, ${skill.removed.length} ${check ? "stale" : "removed"}; excluded: ${skill.excluded.join(", ") || "none"}`);
    }
    if (check && !result.inSync) {
      console.error("Shared Skill snapshots are stale. From the repository root, run npm run skills-plugin and commit the generated files with the source update.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
