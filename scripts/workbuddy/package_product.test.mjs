import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { repositoryRoot } from '../../v2/scripts/build.mjs';
import { readDirectoryFileMap } from '../../v2/scripts/lib/canonical-files.mjs';
import { readZipEntries } from '../../v2/tests/helpers/zip-reader.mjs';
import { createProductEntries, packageProduct, skillName } from './package_product.mjs';
import { frontmatter } from './standalone_skill.mjs';

test('WorkBuddy product ZIP keeps the published Skill identity and bundles both V2 runtime routes', async t => {
  const root = mkdtempSync(join(tmpdir(), 'nox-workbuddy-product-'));
  t.after(() => {
    const contained = relative(resolve(tmpdir()), resolve(root));
    assert.ok(contained.startsWith('nox-workbuddy-product-') && !isAbsolute(contained));
    rmSync(root, { recursive: true, force: true });
  });
  const sourcePath = 'skills/noxinfluencer-v2';
  const iconPath = 'plugins/noxinfluencer/assets/logo.png';
  for (const path of [sourcePath, 'scripts/workbuddy/product/skill-metadata.json', iconPath]) {
    const target = resolve(root, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repositoryRoot, path), target, { recursive: true });
  }

  const original = readDirectoryFileMap(resolve(root, sourcePath));
  assert.equal(frontmatter(original.get('SKILL.md'), 'V2 source SKILL.md').fields.name, 'noxinfluencer-v2');
  const expected = createProductEntries({ root });
  const first = await packageProduct({ root });
  const second = await packageProduct({ root });
  assert.equal(first.sha256, second.sha256);
  assert.deepEqual(readDirectoryFileMap(resolve(root, sourcePath)), original);
  assert.deepEqual(readFileSync(first.iconPath), readFileSync(resolve(root, iconPath)));
  const entries = readZipEntries(first.path);
  assert.deepEqual(entries, expected.entries);

  const prefix = `${skillName}/`;
  const { fields, body } = frontmatter(entries.get(prefix + 'SKILL.md'), 'Packaged V2 SKILL.md');
  assert.equal(fields.name, 'noxinfluencer');
  assert.equal(fields.display_name, 'Nox聚星红人营销');
  assert.ok([...entries.keys()].every(path => path.startsWith('noxinfluencer/')));
  assert.match(body, /prefer an already connected official NoxInfluencer provider/);
  assert.match(body, /@references\/runtime-mcp\.md/);
  assert.match(body, /@references\/runtime-cli\.md/);
  const oauth = entries.get(prefix + 'references/oauth-and-scopes.md').toString();
  assert.deepEqual(oauth.match(/^## .+$/gm), ['## Common Host Connection Setup', '## WorkBuddy Authorization',
    '## One Attempt, Then Resume', '## Failure Boundaries']);
  assert.match(oauth, /WorkBuddy's native authorization action/);
  assert.match(oauth, /resume the retained original operation immediately/);
  assert.doesNotMatch(oauth, /codex mcp login|start-codex-oauth|## Other Hosts/);
  const guide = resolve(root, sourcePath, 'references/oauth-and-scopes.md');
  writeFileSync(guide, original.get('references/oauth-and-scopes.md').toString()
    .replace('## WorkBuddy Authorization\n\n', '## WorkBuddy Authorization\n\nAuthorization source proof.\n\n'));
  const revised = createProductEntries({ root });
  assert.match(revised.entries.get(prefix + 'references/oauth-and-scopes.md').toString(), /Authorization source proof/);
  assert.match(entries.get(prefix + 'references/auth.md').toString(), /\$\{CODEBUDDY_SKILL_DIR\}\/scripts\/nox-cli\.mjs/);
  assert.deepEqual(entries.get(prefix + 'scripts/external-login.mjs'), original.get('scripts/external-login.mjs'));
  assert.ok(![...entries.keys()].some(path => /(?:^|\/)(?:cli\.json|mcp\.json|connector-meta\.json|start-codex-oauth\.ps1)$/.test(path)));
  for (const path of ['cli-package.json', 'campaign-runtime-contract.json']) {
    assert.deepEqual(entries.get(`${prefix}scripts/${path}`), original.get(path));
  }

  const installed = resolve(root, 'installed');
  for (const [path, bytes] of entries) {
    const target = resolve(installed, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
  const contract = JSON.parse(entries.get(prefix + 'scripts/cli-package.json'));
  const schema = entries.get(prefix + 'scripts/campaign-runtime-contract.json');
  const cache = resolve(root, 'cache');
  const fakePackage = resolve(cache, 'noxinfluencer-v2', 'cli', contract.version, 'node_modules', '@noxinfluencer', 'cli');
  const fakeEntry = resolve(fakePackage, contract.bin);
  mkdirSync(dirname(fakeEntry), { recursive: true });
  writeFileSync(resolve(fakePackage, 'package.json'), JSON.stringify({
    name: contract.name, version: contract.version, bin: { noxinfluencer: contract.bin },
  }));
  writeFileSync(resolve(fakePackage, 'schema.json'), schema);
  writeFileSync(fakeEntry, 'process.stdout.write(require("node:fs").readFileSync(require("node:path").join(__dirname, "..", "schema.json")));\n');

  const verification = spawnSync(process.execPath, [resolve(installed, prefix, 'scripts/nox-cli.mjs'), '--verify'], {
    cwd: root, encoding: 'utf8', env: { ...process.env, LOCALAPPDATA: cache, XDG_CACHE_HOME: cache },
  });
  assert.equal(verification.status, 0, verification.stderr);
  assert.match(verification.stdout, /V2 CLI schema verified/);
});
