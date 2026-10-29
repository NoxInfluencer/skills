import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runtimePaths, resolveInstalled, verifySchema, installCli } from '../source/noxinfluencer/adapters/cli/scripts/nox-cli.mjs';

const contract = { name:'@noxinfluencer/cli',version:'0.6.3',bin:'dist/main.js' };
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
