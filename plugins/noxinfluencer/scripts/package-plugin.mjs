import { createHash } from "node:crypto";
import {
  copyFileSync,
  createReadStream,
  createWriteStream,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import yazl from "yazl";
import { validatePluginSource } from "./plugin-source-validation.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(projectRoot, ".codex-plugin", "plugin.json");
const outputDirectory = join(projectRoot, "dist");
const stagingDirectory = join(outputDirectory, ".staging");
const fixedArchiveDate = new Date("1980-01-01T00:00:00.000Z");

function fail(message) {
  throw new Error(message);
}

function toArchivePath(path, root = projectRoot) {
  return relative(root, path).split(sep).join(posix.sep);
}

function listFiles(path) {
  if (!existsSync(path)) return [];

  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) {
    fail(`Symbolic links are not allowed in the plugin package: ${toArchivePath(path)}`);
  }
  if (stat.isFile()) return path.split(sep).at(-1) === ".gitkeep" ? [] : [path];
  if (!stat.isDirectory()) {
    fail(`Unsupported filesystem entry: ${toArchivePath(path)}`);
  }

  return readdirSync(path, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => listFiles(join(path, entry.name)));
}

function assertSafeArchivePath(archivePath) {
  const segments = archivePath.split("/");
  const baseName = segments.at(-1)?.toLowerCase() ?? "";

  const forbiddenSegments = new Set([
    ".git",
    "node_modules",
    "dist",
    "build",
    "coverage",
  ]);
  if (segments.some((segment) => forbiddenSegments.has(segment.toLowerCase()))) {
    fail(`Development-only content cannot be packaged: ${archivePath}`);
  }

  if (
    baseName === ".env" ||
    baseName.startsWith(".env.") ||
    baseName === "id_rsa" ||
    baseName.endsWith(".pem") ||
    baseName.endsWith(".key") ||
    baseName.endsWith(".p12") ||
    baseName.endsWith(".pfx")
  ) {
    fail(`Potential secret file cannot be packaged: ${archivePath}`);
  }
}

function copyFileToStaging(sourcePath, archivePath) {
  assertSafeArchivePath(archivePath);
  const destinationPath = join(stagingDirectory, ...archivePath.split("/"));
  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
}

function writeTextToStaging(archivePath, contents) {
  assertSafeArchivePath(archivePath);
  const destinationPath = join(stagingDirectory, ...archivePath.split("/"));
  mkdirSync(dirname(destinationPath), { recursive: true });
  writeFileSync(destinationPath, contents, "utf8");
}

function stageDirectory(sourceRoot, archiveRoot) {
  for (const path of listFiles(sourceRoot)) {
    const relativePath = toArchivePath(path, sourceRoot);
    copyFileToStaging(path, posix.join(archiveRoot, relativePath));
  }
}

function buildStaging(manifest, common, options = {}) {
  const declaredSkills = manifest.skills ?? "./skills/";
  if (declaredSkills !== "./skills/") {
    fail(`Unsupported skills path "${declaredSkills}"; expected "./skills/".`);
  }
  if (manifest.mcpServers !== "./.mcp.json") {
    fail('plugin.json must declare "mcpServers": "./.mcp.json".');
  }

  const pluginManifestDirectory = join(projectRoot, ".codex-plugin");
  const mcpPath = join(projectRoot, ".mcp.json");
  for (const path of [pluginManifestDirectory, mcpPath]) {
    if (!existsSync(path)) {
      fail(`Required package path is missing: ${toArchivePath(path)}`);
    }
  }

  // Keep other target ZIPs when producing Codex and Claude packages in sequence.
  rmSync(stagingDirectory, { recursive: true, force: true });
  mkdirSync(stagingDirectory, { recursive: true });

  stageDirectory(pluginManifestDirectory, ".codex-plugin");
  stageDirectory(join(projectRoot, ".plugin"), ".plugin");
  if (options.stagedVersion) {
    writeTextToStaging(
      ".codex-plugin/plugin.json",
      `${JSON.stringify({ ...manifest, version: options.stagedVersion }, null, 2)}\n`,
    );
    writeTextToStaging(
      ".plugin/plugin.json",
      `${JSON.stringify({ ...common, version: options.stagedVersion }, null, 2)}\n`,
    );
  }
  copyFileToStaging(mcpPath, ".mcp.json");
  stageDirectory(join(projectRoot, "skills"), "skills");

  // Native Claude ZIPs need a manifest; ordinary npx installs generate it.
  if (options.target === "claude-code") {
    writeTextToStaging(
      ".claude-plugin/plugin.json",
      `${JSON.stringify({ ...common, version: options.stagedVersion || common.version }, null, 2)}\n`,
    );
  }

  const assetsPath = join(projectRoot, "assets");
  if (existsSync(assetsPath)) stageDirectory(assetsPath, "assets");

  if (manifest.apps) {
    if (manifest.apps !== "./.app.json") {
      fail(`Unsupported apps path "${manifest.apps}"; expected "./.app.json".`);
    }
    const appPath = join(projectRoot, ".app.json");
    if (!existsSync(appPath)) fail("plugin.json declares apps, but .app.json is missing.");
    copyFileToStaging(appPath, ".app.json");
  }

  const files = listFiles(stagingDirectory).sort((left, right) =>
    toArchivePath(left, stagingDirectory).localeCompare(
      toArchivePath(right, stagingDirectory),
    ),
  );
  return files;
}

async function createZip(files, outputPath) {
  await new Promise((resolvePromise, rejectPromise) => {
    const zip = new yazl.ZipFile();
    const output = createWriteStream(outputPath);

    output.on("close", resolvePromise);
    output.on("error", rejectPromise);
    zip.outputStream.on("error", rejectPromise);
    zip.outputStream.pipe(output);

    for (const path of files) {
      zip.addFile(path, toArchivePath(path, stagingDirectory), {
        mtime: fixedArchiveDate,
        mode: 0o100644,
        compress: true,
      });
    }
    zip.end();
  });
}

function sha256(path) {
  const hash = createHash("sha256");
  return new Promise((resolvePromise, rejectPromise) => {
    const input = createReadStream(path);
    input.on("data", (chunk) => hash.update(chunk));
    input.on("end", () => resolvePromise(hash.digest("hex")));
    input.on("error", rejectPromise);
  });
}

function createDevelopmentVersion(version, now = new Date()) {
  const baseVersion = String(version).split("+")[0];
  const cachebuster = now
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  return `${baseVersion}+codex.local-${cachebuster}`;
}

async function main() {
  const args = process.argv.slice(2);
  let target = "codex";
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--dev") continue;
    if (args[index] === "--target" && ["codex", "claude-code"].includes(args[index + 1])) {
      target = args[++index];
      continue;
    }
    fail(`Unsupported package argument: ${args[index]}`);
  }
  const development = args.includes("--dev");

  if (!existsSync(manifestPath)) {
    fail("Missing .codex-plugin/plugin.json.");
  }

  const { manifest, common, skills } = validatePluginSource({ release: !development });
  const artifactVersion = development
    ? createDevelopmentVersion(manifest.version)
    : manifest.version;
  const files = buildStaging(manifest, common, {
    stagedVersion: development ? artifactVersion : "",
    target,
  });
  const artifactName = `${manifest.name}-${target}-${artifactVersion}.zip`;
  const outputPath = join(outputDirectory, artifactName);

  try {
    await createZip(files, outputPath);
    const digest = await sha256(outputPath);
    writeFileSync(`${outputPath}.sha256`, `${digest}  ${artifactName}\n`, "utf8");

    console.log(`Package mode: ${development ? "development" : "production"}`);
    console.log(`Plugin version: ${artifactVersion}`);
    console.log(`MCP Skill: ${skills.pending ? "pending delivery" : `${skills.fileCount} files`}`);
    console.log(`Packaged ${files.length} files:`);
    for (const path of files) {
      console.log(`- ${toArchivePath(path, stagingDirectory)}`);
    }
    console.log(`Artifact: ${relative(projectRoot, outputPath)}`);
    console.log(`SHA-256: ${digest}`);
  } finally {
    rmSync(stagingDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  rmSync(stagingDirectory, { recursive: true, force: true });
  console.error(`Packaging failed: ${error.message}`);
  process.exitCode = 1;
});
