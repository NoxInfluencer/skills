import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runtimePaths, resolveInstalled, verifySchema, installCli, commandTimeoutMs } from '../source/noxinfluencer/adapters/cli/scripts/nox-cli.mjs';
import { loginInExternalBrowser, openExternalBrowser } from '../source/noxinfluencer/adapters/cli/scripts/external-login.mjs';

const contract = { name:'@noxinfluencer/cli',version:'0.6.3',bin:'dist/main.js' };

test('launcher permits the full login wait and keeps the ordinary deadline for business commands', () => {
  assert.ok(commandTimeoutMs(['--config', 'test.json', '--json', 'login', 'wait', 'id']) > 1800_000);
  assert.equal(commandTimeoutMs(['--config', 'login', 'creator', 'search']), 120_000);
});

test('desktop login opens the CLI-issued page and waits for the same login without displaying its URL', async () => {
  const url = 'https://cn.noxinfluencer.com/oauth/device?user_code=TEST-CODE';
  const env = { NOXINFLUENCER_CONFIG: 'test-config.json' };
  const calls = [];
  const messages = [];
  await loginInExternalBrowser('test-entry.js', env, {
    force: true,
    async run(entry, args, options) {
      assert.equal(entry, 'test-entry.js');
      assert.equal(options, env);
      calls.push(args);
      return args[1] === 'start'
        ? { status: 'pending', login_id: 'login_example', verification_uri_complete: url }
        : { success: true };
    },
    async open(address, { env: options }) {
      assert.equal(options, env);
      calls.push(address);
      return true;
    },
    report: message => messages.push(message),
  });
  assert.deepEqual(calls, [['login', 'start', '--force'], url, ['login', 'wait', 'login_example']]);
  assert.equal(messages.length, 2);
  assert.doesNotMatch(messages.join(' '), /https:|TEST-CODE|login_example/);
});

test('desktop login neither opens a non-Nox authorization URL nor waits after a failed browser launch', async () => {
  const pending = { status: 'pending', login_id: 'login_example' };
  for (const url of ['https://noxinfluencer.com.example.org/oauth/device?user_code=TEST-CODE',
    'https://www.noxinfluencer.com/oauth/device?user_code=TEST-CODE']) {
    let openCount = 0;
    await assert.rejects(loginInExternalBrowser('test-entry.js', {}, {
      run(_entry, args) {
        assert.deepEqual(args, ['login', 'start']);
        return { ...pending, verification_uri_complete: url };
      },
      open() { openCount++; return false; },
    }), /valid NoxInfluencer device authorization page|Could not open the external browser/);
    assert.equal(openCount, url.includes('example.org') ? 0 : 1);
  }
});

test('desktop login prefers Chrome and uses the OS default when Chrome is unavailable', async () => {
  const url = 'https://www.noxinfluencer.com/oauth/device?user_code=TEST-CODE';
  const calls = [];
  assert.equal(await openExternalBrowser(url, {
    platform: 'darwin', env: {},
    async launch(command, args) { calls.push([command, ...args]); return args[0] !== '-b'; },
  }), true);
  assert.deepEqual(calls, [['open', '-b', 'com.google.Chrome', url], ['open', url]]);

  await openExternalBrowser(url, {
    platform: 'win32', env: {},
    async launch(command, args, { env }) {
      assert.equal(command, 'powershell.exe');
      assert.equal(env.NOX_V2_EXTERNAL_LOGIN_URL, url);
      assert.doesNotMatch(args.join(' '), /TEST-CODE/);
      return true;
    },
  });
});
const schema = { commands: [{ command:'campaign plan get',arguments:[],required_options:[],mutation:false,supports_body_file:true,body_schema:{type:'object',additionalProperties:false} }] };

/** 用假 npm 写入实际目录布局，安装流程本身走真实验证和原子激活，不访问网络。 */
function fakePackage(prefix, version = contract.version) {
  const root = join(prefix,'node_modules/@noxinfluencer/cli');
  mkdirSync(join(root,'dist'),{ recursive:true });
  writeFileSync(join(root,'package.json'),JSON.stringify({...contract,version,bin:{noxinfluencer:contract.bin}}));
  writeFileSync(join(root,'dist/main.js'),'process.exit(0);');
}

test('V2 paths and default login configuration are isolated from the global CLI', () => {
  const paths = runtimePaths({ cacheHome:'/cache',version:contract.version });
  assert.equal(paths.root.endsWith('noxinfluencer-v2'),true);
  assert.equal(paths.config.startsWith(paths.root),true);
  assert.notEqual(paths.config,join('/cache','.noxinfluencer/config.json'));
  assert.throws(() => runtimePaths({ version:'../../outside' }));
});

test('schema verifier rejects missing commands, changed fields and renamed identities', () => {
  verifySchema(schema,schema);
  verifySchema(schema.commands,schema);
  for (const change of [ {commands:[]}, {commands:[{...schema.commands[0],body_schema:{type:'string'}}]},
    {commands:[{...schema.commands[0],mutation:true}]} ]) assert.throws(() => verifySchema(change,schema));
});

test('valid install activates a separately resolved package and preserves the old global fixture', t => {
  const directory = mkdtempSync(join(tmpdir(),'nox-v2-cli-'));
  t.after(() => rmSync(directory,{recursive:true,force:true}));
  const paths = runtimePaths({cacheHome:directory,version:contract.version});
  const global = join(directory,'legacy-global');
  fakePackage(global,'0.5.12');
  installCli({paths,contract,schemaContract:schema,npm:'npm-fixture',run(entry,args) {
    if (entry==='npm-fixture') { fakePackage(args[2]); return ''; }
    assert.deepEqual(args,['schema','--all']); return JSON.stringify(schema);
  }});
  assert.equal(resolveInstalled(paths.installation,contract).startsWith(paths.installation),true);
  assert.equal(JSON.parse(readFileSync(join(global,'node_modules/@noxinfluencer/cli/package.json'))).version,'0.5.12');
});

test('invalid replacement never activates and preserves the previously installed version', t => {
  const directory = mkdtempSync(join(tmpdir(),'nox-v2-invalid-'));
  t.after(() => rmSync(directory,{recursive:true,force:true}));
  const paths=runtimePaths({cacheHome:directory,version:contract.version});
  fakePackage(paths.installation);
  assert.throws(() => installCli({paths,contract,schemaContract:schema,npm:'npm-fixture',run(entry,args) {
    if (entry==='npm-fixture') { fakePackage(args[2]); return ''; }
    return JSON.stringify({commands:[]});
  }}),/lacks command/);
  assert.equal(existsSync(paths.installation+'.incoming-'+process.pid),false);
  assert.equal(resolveInstalled(paths.installation,contract).startsWith(paths.installation),true);
  assert.throws(() => resolveInstalled(paths.installation,{...contract,version:'9.9.9'}));
});

test('unsafe installation paths are rejected without spawning npm', t => {
  const directory=mkdtempSync(join(tmpdir(),'nox-v2-unsafe-'));
  t.after(() => rmSync(directory,{recursive:true,force:true}));
  let called=false;
  assert.throws(() => installCli({paths:{root:directory,installation:resolve(directory,'..','escape'),config:join(directory,'config.json')},contract,schemaContract:schema,npm:'npm-fixture',run(){called=true;}}),/Unsafe/);
  assert.equal(called,false);
});
