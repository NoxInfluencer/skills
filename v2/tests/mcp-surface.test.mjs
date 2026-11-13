import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createOutputs, repositoryRoot } from '../scripts/build.mjs';
import Ajv from 'ajv';

test('MCP advertised tools exactly match the checked catalog and omit unsupported domain routes', () => {
  const { outputs } = createOutputs();
  const mcp = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('v2/skills/noxinfluencer-v2');
  const tools = JSON.parse(readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/snapshots/mcp-tools.json'))).items;
  const listed = [...mcp.get('references/tool-list.md').toString().matchAll(/^- `([^`]+)`$/gm)].map(match => match[1]);
  assert.deepEqual(listed.sort(), tools.map(tool => tool.name).sort());
  const entrypoint = mcp.get('SKILL.md').toString();
  assert.match(entrypoint, /campaign2_plan_list/);
  for (const name of ['brand-monitor', 'outreach-and-messaging', 'product-short-link-affiliation']) {
    assert.equal(mcp.has(`references/${name}.md`), false);
    assert.equal(universal.has(`references/${name}.md`), true);
  }
  for (const [path, bytes] of mcp) {
    if (path.endsWith('.md')) assert.doesNotMatch(bytes.toString(), /open_marketing_plan_tasks|list_marketing_plan_tasks|plan_list\/[^\n]*\/copy\//);
  }
  assert.doesNotMatch(mcp.get('references/product-overview.md').toString(), /Shopify|brand monitoring|message threads/i);
  assert.doesNotMatch(mcp.get('references/campaign-agent-automation.md').toString(), /workspace smart actions|creator-reply automation run|request one corresponding page/);
  assert.match(mcp.get('references/campaign-agent-automation.md').toString(), /User attachments/);
  assert.match(universal.get('references/campaign-agent-automation.md').toString(), /creator-reply automation run/);
  assert.doesNotMatch(mcp.get('references/creator.md').toString(), /Connected-Store Target Invitations/);
});

test('plugin ships live-contract Handoff and honest authorization continuation, isolated from historical standalone policy', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('v2/skills/noxinfluencer-v2');
  for (const name of ['handoffs', 'oauth-and-scopes', 'codex-plugin-runtime']) {
    const path = `references/${name}.md`;
    assert.ok(plugin.has(path));
    assert.notDeepEqual(plugin.get(path), universal.get(path));
  }
  const handoff = plugin.get('references/handoffs.md').toString();
  assert.match(handoff, /No Handoff configured/);
  assert.match(handoff, /Configured but failed/);
  assert.match(handoff, /unknown\/not advertised/);
  assert.match(handoff, /business tool may return `handoff_url` itself/);
  assert.match(handoff, /right/);
  assert.doesNotMatch(handoff, /currently deferred|only after the user explicitly asks/);
  const auth = plugin.get('references/oauth-and-scopes.md').toString();
  assert.match(auth, /successful exit and explicit login-success result mean authorization succeeded/);
  assert.match(auth, /do not assume launching a separate login process refreshed the active task/);
  assert.match(auth, /resume the retained original operation immediately/);
  assert.match(plugin.get('SKILL.md').toString(), /installed Agent plugin/);
  assert.match(plugin.get('references/runtime-mcp.md').toString(), /Agent Plugin Installation Context/);
  assert.equal(universal.has('references/runtime-plugin.md'), false);
});

test('plan-list input schema and plugin prompts match the supported surface', () => {
  const tools = JSON.parse(readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/snapshots/mcp-tools.json'))).items;
  const schema = tools.find(tool => tool.name === 'campaign2_plan_list').input_schema;
  assert.deepEqual(Object.keys(schema.properties).sort(), ['page_num', 'page_size', 'keyword', 'start_time', 'end_time', 'invite_status'].sort());
  const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'plugins/noxinfluencer/.codex-plugin/plugin.json')));
  assert.ok(manifest.interface.defaultPrompt.some(prompt => /marketing.plan/i.test(prompt)));
});

test('MCP commercial boundary rejects broad pricing while CLI pricing stays available', () => {
  const read = name => JSON.parse(readFileSync(resolve(repositoryRoot, `v2/source/noxinfluencer/snapshots/${name}.json`))).items;
  const tools = read('mcp-tools');
  assert.equal(tools.some(tool => tool.name === 'list_membership_pricing'), false);
  const validate = new Ajv({ strict: false }).compile(tools.find(tool => tool.name === 'list_tool_pricing').input_schema);
  for (const input of [{}, { include_free: true }, { tool: '' }, { action: '  ' }, { action: null }]) {
    assert.equal(validate(input), false, JSON.stringify(input));
  }
  for (const input of [{ tool: 'discover_creators' }, { action: 'creator_search' }]) {
    assert.equal(validate(input), true, JSON.stringify(input));
  }
  const quota = tools.find(tool => tool.name === 'quota').output_schema.properties.data;
  assert.equal('claim_eligible' in quota.properties, false);
  assert.equal('trial_claimed' in quota.properties, false);
  assert.ok(quota.required.includes('execution_available'));
  assert.ok(quota.required.includes('limitation_reason'));
  const cli = read('cli-schema');
  assert.ok(cli.some(command => command.command === 'pricing'));
  assert.ok(cli.some(command => command.command === 'pricing tools'));
});
