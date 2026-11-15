import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createOutputs, repositoryRoot } from '../scripts/build.mjs';

function markdownSection(markdown, heading) {
  const sections = markdown.split(/(?=^#{1,6} )/m);
  const section = sections.find(text => text.startsWith(heading + '\n'));
  assert.ok(section, `Missing section: ${heading}`);
  return section.slice(heading.length + 1);
}

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
  assert.doesNotMatch(handoff, /currently deferred|only after the user explicitly asks/);
  const auth = plugin.get('references/oauth-and-scopes.md').toString();
  assert.match(auth, /successful exit and explicit login-success result mean authorization succeeded/);
  assert.match(auth, /do not assume launching a separate login process refreshed the active task/);
  assert.match(auth, /resume the retained original operation immediately/);
  assert.match(plugin.get('SKILL.md').toString(), /installed Agent plugin/);
  assert.match(plugin.get('references/runtime-mcp.md').toString(), /Agent Plugin Installation Context/);
  assert.equal(universal.has('references/runtime-plugin.md'), false);
});

test('Campaign page reuse requires an exact current account and chat match and uses the website SSE refresh', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const reuse = markdownSection(handoff, '### Reuse the exact open page');
  assert.match(reuse, /current conversation's right-side page only when[^.]+host information confirms[^.]+current authorized account[^.]+exact target plan and view/);
  assert.match(reuse, /Java publishes invitation changes[^.]+kol-next subscribes via SSE[^.]+page in place/);
  assert.match(reuse, /Queued Sends view is already open[^.]+keep it/);
  assert.match(reuse, /Skip reopening the page and requesting or consuming a Handoff for display/);
});

test('Campaign first open, reopen and plan or view switches use the exact ready Handoff', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const open = markdownSection(handoff, '### Open a different or closed page');
  assert.match(open, /first open, reopening after closure, switching plans or result views[^.]+exact match cannot be confirmed/);
  assert.match(open, /original, valid, unused `handoff_url`[^.]+structured MCP result with `presentation\.status=ready` for the exact authorized target/);
  assert.match(open, /Queued Sends Handoff[^.]+plan A's Overview to plan A's Queued Sends/);
  assert.match(open, /plan list Handoff opens only the plan list/);
  assert.match(open, /Handoff supplied with the business result or a read-only producer declared for that target/);
  assert.match(open, /URL unchanged to an opening capability supported by the host/);
  assert.match(open, /Prefer a suitable right-side tab in the current conversation when the host supports targeting it/);
  assert.match(open, /Use browser capabilities only to open a valid Handoff/);
  assert.match(open, /Keep all Campaign operations and business result checks in MCP/);
});

test('Campaign replies report business results independently of page opening and keep the manual fallback single-use', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const campaign = markdownSection(handoff, '## Campaign pages');
  assert.match(campaign, /conversation-only request for the current turn/);
  assert.match(campaign, /business result in conversation[^.]+skip Handoff requests made solely for display, page opening, and manual open links/);
  const report = markdownSection(handoff, '### Report business and page status');
  assert.match(report, /Report the verified MCP business outcome even when opening fails, is unavailable, or cannot be confirmed/);
  assert.match(report, /accepted invitation as queued[^.]+delivery only when authoritative MCP business status establishes it/);
  assert.match(report, /Reply without waiting for the page to load/);
  assert.match(report, /Report the page as open only if host information establishes that state/);
  assert.match(report, /cannot open the page automatically[^.]+business result[^.]+supported manual open option[^.]+valid Handoff[^.]+no consumption attempt/);
  const execution = plugin.get('references/tool-execution.md').toString();
  assert.match(execution, /preview\/execute.*explicit user confirmation/);
  assert.match(execution, /original execution key/);
});

test('Campaign link recovery requires a declared read-only MCP entrypoint for the same target', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const recover = markdownSection(handoff, '### Recover an expired or uncertain link');
  assert.match(recover, /expired or its consumption status is uncertain[^.]+use only a declared read-only MCP entrypoint[^.]+fresh Handoff for the exact target/);
  assert.match(recover, /Never replay the URL or repeat a business write to obtain a link/);
  assert.match(recover, /no matching read-only entrypoint[^.]+report the presentation limitation with the business result/);
  assert.match(recover, /`campaign2_invitations_list`[^.]+`campaign_id`[^.]+`view: "pending"`[^.]+`status_group: "queued"`/);
  assert.match(recover, /only when it is ready for `campaign_invitation_queued`/);
});

test('installed Campaign references delegate opening to Handoff policy and standalone retains its separate workflow', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('v2/skills/noxinfluencer-v2');
  const runtime = plugin.get('references/runtime-mcp.md').toString();
  assert.ok(plugin.get('SKILL.md').toString().includes(runtime));
  const obsoleteOpeningRules = /turn terminal|terminal-triggered|host turn ends|page-load receipt|render receipt|verified native (?:host|Handoff) action|structured (?:workbench|status interface)|authorized workspace context interface|SaaS Campaign workspace after the final answer|workspace navigation guidance for the page link|Open a page only when the user asks/i;
  for (const name of ['runtime-mcp', 'tool-execution', 'codex-plugin-runtime', 'campaign-agent-automation-mcp',
    'campaign-invitation-management', 'marketing-plan-and-campaign']) {
    const path = `references/${name}.md`;
    const content = plugin.get(path).toString();
    assert.match(content, /references\/handoffs\.md/, path);
    assert.doesNotMatch(content, obsoleteOpeningRules, path);
  }
  assert.doesNotMatch(plugin.get('references/handoffs.md').toString(), obsoleteOpeningRules);
  const manager = outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager');
  assert.match(manager.get('SKILL.md').toString(), /references\/handoffs\.md/);
  assert.doesNotMatch(manager.get('SKILL.md').toString(), obsoleteOpeningRules);
  assert.doesNotMatch(universal.get('SKILL.md').toString(), /## Campaign presentation|`cua_repl`/);
  assert.match(universal.get('references/handoffs.md').toString(), /Campaign and page Handoff are currently deferred/);
  assert.match(universal.get('references/campaign-invitation-management.md').toString(), /SaaS Campaign workspace after the final answer/);
  assert.match(universal.get('references/marketing-plan-and-campaign.md').toString(), /Open a page only when the user asks to continue visually/);
});

test('plan-list input schema and plugin prompts match the supported surface', () => {
  const tools = JSON.parse(readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/snapshots/mcp-tools.json'))).items;
  const schema = tools.find(tool => tool.name === 'campaign2_plan_list').input_schema;
  assert.deepEqual(Object.keys(schema.properties).sort(), ['page_num', 'page_size', 'keyword', 'start_time', 'end_time', 'invite_status'].sort());
  const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'plugins/noxinfluencer/.codex-plugin/plugin.json')));
  assert.ok(manifest.interface.defaultPrompt.some(prompt => /marketing.plan/i.test(prompt)));
});
