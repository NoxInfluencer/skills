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
  assert.match(handoff, /If no Handoff is configured or advertised, present the available business result in conversation/);
  assert.match(handoff, /If a configured Handoff fails, report that presentation failure with the confirmed business result/);
  assert.match(handoff, /business tool may return `handoff_url` itself/);
  assert.doesNotMatch(handoff, /currently deferred|only after the user explicitly asks/);
  const auth = plugin.get('references/oauth-and-scopes.md').toString();
  assert.match(auth, /successful exit and explicit login-success result mean authorization succeeded/);
  assert.match(auth, /do not assume launching a separate login process refreshed the active task/);
  assert.match(auth, /resume the retained original operation immediately/);
  assert.match(plugin.get('SKILL.md').toString(), /installed Agent plugin/);
  assert.match(plugin.get('references/runtime-mcp.md').toString(), /Agent Plugin Installation Context/);
  assert.equal(universal.has('references/runtime-plugin.md'), false);
});

test('installed Campaign rules keep browser automation out of opening, status checks and recovery', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('v2/skills/noxinfluencer-v2');
  const runtime = plugin.get('references/runtime-mcp.md').toString();
  const handoff = plugin.get('references/handoffs.md').toString();
  assert.ok(plugin.get('SKILL.md').toString().includes(runtime));
  for (const text of [runtime, handoff]) {
    assert.match(text, /Computer Use.*`cua_repl`.*browser automation/);
    assert.match(text, /`tab\.goto`.*`createBrowserTab`/);
    assert.match(text, /first open, .*status checks, and recovery/);
  }
  assert.match(handoff, /Never reuse another chat's workbench, including a chat for the same account/);
  assert.match(handoff, /A list Handoff opens the list only/);
  assert.match(handoff, /check only the declared structured status interface/);
  assert.match(handoff, /Never replay a possibly consumed URL.*repeat a business write/);
  assert.match(handoff, /ignore account A's state and late receipts/);
  assert.match(handoff, /never reopen from an old A Handoff/);
  assert.doesNotMatch(handoff, /clicking an unread invitation|navigate it to the fresh Handoff/);
  const manager = outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager');
  assert.match(manager.get('SKILL.md').toString(), /never use or delegate Computer Use or other browser automation.*right-side Campaign workbench/);
  assert.doesNotMatch(universal.get('SKILL.md').toString(), /Campaign Workbench|`cua_repl`/);
});

test('Campaign replies use verified business results without waiting for turn-triggered rendering', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const execution = plugin.get('references/tool-execution.md').toString();
  const host = plugin.get('references/codex-plugin-runtime.md').toString();
  assert.match(handoff, /conversation-only request.*suppress automatic opening and navigation/);
  assert.match(handoff, /real turn terminal event\. No new Handoff is needed/);
  assert.match(handoff, /render receipt are asynchronous\. Do not wait for either before replying/);
  assert.match(handoff, /displayed only after receiving the corresponding page-load receipt/);
  assert.match(handoff, /accepted invitation as queued until a later authoritative business status establishes delivery/);
  assert.match(execution, /preview\/execute.*explicit user confirmation/);
  assert.match(execution, /original execution key/);
  assert.doesNotMatch(execution, /verify that the requested view shows the latest confirmed result before the final response/);
  assert.match(host, /host-owned context or authenticated lifecycle reporting/);
  assert.match(host, /A tool result, `PostToolUse` event, or final message does not establish turn terminal status/);
  assert.match(plugin.get('references/campaign-agent-automation-mcp.md').toString(), /current workbench plan or tab.*declared, authorized workspace context interface/);
});

test('plan-list input schema and plugin prompts match the supported surface', () => {
  const tools = JSON.parse(readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/snapshots/mcp-tools.json'))).items;
  const schema = tools.find(tool => tool.name === 'campaign2_plan_list').input_schema;
  assert.deepEqual(Object.keys(schema.properties).sort(), ['page_num', 'page_size', 'keyword', 'start_time', 'end_time', 'invite_status'].sort());
  const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'plugins/noxinfluencer/.codex-plugin/plugin.json')));
  assert.ok(manifest.interface.defaultPrompt.some(prompt => /marketing.plan/i.test(prompt)));
});
