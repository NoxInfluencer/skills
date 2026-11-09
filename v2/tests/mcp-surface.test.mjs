import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createOutputs, repositoryRoot } from '../scripts/build.mjs';

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
