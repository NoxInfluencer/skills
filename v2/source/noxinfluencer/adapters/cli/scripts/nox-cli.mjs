import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, lstatSync } from 'node:fs';
import { dirname, resolve, join, relative, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** V2 包及默认登录配置放在独立用户目录，旧全局 CLI 不参与解析。 */
export function runtimePaths({ cacheHome = process.env.LOCALAPPDATA || process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), version } = {}) {
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version ?? '')) throw new Error('Invalid CLI package version');
  const root = resolve(cacheHome, 'noxinfluencer-v2');
  return { root, installation: join(root, 'cli', version), config: join(root, 'config.json') };
}

/** 严格验证实际安装包身份及入口位置，拒绝符号链接、旧全局命令和目录逃逸。 */
export function resolveInstalled(installation, contract) {
  const root = resolve(installation);
  const packageRoot = join(root, 'node_modules', '@noxinfluencer', 'cli');
  for (let current = packageRoot; current !== dirname(current); current = dirname(current)) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Linked CLI installation is not supported');
    if (current === root) break;
  }
  const metadata = JSON.parse(readFileSync(join(packageRoot, 'package.json')));
  if (metadata.name !== contract.name || metadata.version !== contract.version || metadata.bin?.noxinfluencer !== contract.bin) throw new Error('Installed V2 CLI identity does not match this Skill');
  const entry = resolve(packageRoot, contract.bin);
  const distance = relative(packageRoot, entry);
  if (!distance || distance.startsWith('..') || isAbsolute(distance) || !existsSync(entry)) throw new Error('Invalid CLI entrypoint');
  if (realpathSync(entry) !== resolve(realpathSync(packageRoot), contract.bin) || !lstatSync(entry).isFile()) throw new Error('Invalid CLI entrypoint link');
  return entry;
}

/** 用真实 schema 对照安装包的 Campaign 参数合同，避免只认版本字符串。 */
export function verifySchema(schema, expected) {
  const commands = Array.isArray(schema) ? schema : Array.isArray(schema.commands) ? schema.commands : [];
  const canonical = value => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a < b ? -1 : 1).map(([key,item]) => [key,canonical(item)])) : value;
  for (const required of expected.commands) {
    const actual = commands.find(item => item.command === required.command);
    if (!actual) throw new Error(`V2 CLI lacks command: ${required.command}`);
    for (const key of ['arguments', 'required_options', 'mutation', 'supports_body_file', 'body_schema']) {
      if (required[key] === undefined) continue;
      if (key === 'arguments' || key === 'required_options') {
        const pick = rows => rows.map(row => key === 'arguments'
          ? { name: row.name, required: row.required, variadic: row.variadic }
          : { flag: row.flag, required: row.required });
        if (JSON.stringify(pick(actual[key] ?? [])) !== JSON.stringify(pick(required[key]))) throw new Error(`V2 CLI argument drift: ${required.command}`);
      } else if (JSON.stringify(canonical(actual[key])) !== JSON.stringify(canonical(required[key]))) throw new Error(`V2 CLI schema drift: ${required.command} / ${key}`);
    }
  }
}

/** 所有子进程都有超时；安装/检查输出留在本机，不把诊断正文当成用户结果。 */
function runNode(entry, args, options = {}) {
  const result = spawnSync(process.execPath, [entry, ...args], { windowsHide: true,
    timeout: 120000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8', ...options });
  if (result.error || result.status !== 0) {
    const code=result.error?.code || result.stderr?.match(/npm error code ([A-Z0-9_]+)/)?.[1] || result.status;
    throw new Error(`V2 setup/CLI command failed (${code}); verify package availability and compatibility without exposing credentials`);
  }
  return result.stdout;
}

/** 找到 Node 配套 npm 脚本，直接执行 JavaScript，避免 Windows shell 拼接。 */
function npmEntry() {
  const prefix = dirname(process.execPath);
  const candidates = [process.env.npm_execpath, join(prefix, 'node_modules/npm/bin/npm-cli.js'),
    join(prefix, '../lib/node_modules/npm/bin/npm-cli.js')];
  const found = candidates.find(path => path && existsSync(path) && path.endsWith('npm-cli.js'));
  if (!found) throw new Error('npm is unavailable; use the client’s supported Node/npm setup');
  return found;
}

/** 固定版本安装到 staging，合同通过后激活；只清理已验证位于 V2 根目录内的 staging。 */
export function installCli({ paths, contract, schemaContract, localPackage, run = runNode, npm = npmEntry() }) {
  const staging = paths.installation + `.incoming-${process.pid}`;
  const backup = paths.installation + `.backup-${process.pid}`;
  for (const path of [paths.installation, staging, backup]) {
    const distance = relative(paths.root, path);
    if (!distance || distance.startsWith('..') || isAbsolute(distance) || resolve(path) !== path) throw new Error('Unsafe V2 installation target');
    for (let current = path; current !== dirname(current); current = dirname(current)) {
      if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Linked V2 cache is not supported');
      if (current === paths.root) break;
    }
  }
  if (existsSync(staging) || existsSync(backup)) throw new Error('A previous V2 installation needs inspection');
  mkdirSync(staging, { recursive: true });
  let backedUp = false;
  try {
    let spec = `${contract.name}@${contract.version}`;
    if (localPackage) {
      spec = resolve(localPackage);
      if (!spec.endsWith('.tgz') || !lstatSync(spec).isFile() || lstatSync(spec).isSymbolicLink()) throw new Error('Expected an authorized local npm tarball');
    }
    run(npm, ['install', '--prefix', staging, '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=20000', '--registry', 'https://registry.npmjs.org', spec]);
    const entry = resolveInstalled(staging, contract);
    const schema = JSON.parse(run(entry, ['schema', '--all'], { env: { ...process.env, NOXINFLUENCER_CONFIG: paths.config } }));
    verifySchema(schema, schemaContract);
    if (existsSync(paths.installation)) { renameSync(paths.installation, backup); backedUp = true; }
    try { renameSync(staging, paths.installation); }
    catch (error) { if (backedUp) renameSync(backup, paths.installation); throw error; }
    if (backedUp) rmSync(backup, { recursive: true });
  } finally {
    if (existsSync(staging)) rmSync(staging, { recursive: true });
  }
}

/** 统一执行入口仅解析隔离版本，实际命令和授权交互仍由 CLI 提供。 */
export function main(argv = process.argv.slice(2)) {
  const skill = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const contract = JSON.parse(readFileSync(join(skill, 'cli-package.json')));
  const expected = JSON.parse(readFileSync(join(skill, 'campaign-runtime-contract.json')));
  const paths = runtimePaths({ version: contract.version });
  if (argv[0] === '--install' || argv[0] === '--install-from') {
    if ((argv[0] === '--install' && argv.length !== 1) || (argv[0] === '--install-from' && argv.length !== 2)) throw new Error('Invalid installation arguments');
    installCli({ paths, contract, schemaContract: expected, localPackage: argv[0] === '--install-from' ? argv[1] : undefined });
    console.log('V2 CLI installed and schema verified. Complete authorization through its login flow.');
    return;
  }
  const entry = resolveInstalled(paths.installation, contract);
  if (argv[0] === '--verify') {
    verifySchema(JSON.parse(runNode(entry, ['schema','--all'], { env: { ...process.env, NOXINFLUENCER_CONFIG: paths.config } })), expected);
    console.log('V2 CLI schema verified.'); return;
  }
  const result = spawnSync(process.execPath, [entry, ...argv], { windowsHide: true, timeout: 120000,
    stdio: 'inherit', env: { ...process.env, NOXINFLUENCER_CONFIG: paths.config } });
  if (result.error) throw new Error(`V2 CLI launch failed: ${result.error.code}`);
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
