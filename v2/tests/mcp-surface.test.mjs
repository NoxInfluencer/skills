import Ajv from 'ajv';
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
  const universal = outputs.get('skills/noxinfluencer-v2');
  const tools = JSON.parse(readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/snapshots/mcp-tools.json'))).items;
  const index = mcp.get('references/tool-list.md').toString();
  const listed = [...index.matchAll(/^- `([^`]+)`$/gm)].map(match => match[1]);
  assert.deepEqual(listed.sort(), tools.map(tool => tool.name).sort());
  for (const tool of tools) {
    const path = `references/tool-parameters-${tool.workflow}.md`;
    assert.ok(index.includes(`\`{baseDir}/${path}\``), path);
    const section = markdownSection(mcp.get(path).toString(), `## \`${tool.name}\``);
    assert.ok(section.startsWith(`\n${tool.description}\n`), tool.name);
    const fields = Object.keys(tool.input_schema.properties ?? {});
    const parameters = [...section.matchAll(/^- `([^`]+)` \(([^\n]+?)\)\./gm)];
    assert.deepEqual(parameters.map(([, field]) => field), fields, tool.name);
    for (const [, field, details] of parameters) {
      const status = tool.input_schema.required?.includes(field) ? 'required' : 'optional';
      assert.ok(details.split(', ').includes(status), `${tool.name}.${field}`);
    }
    if (!fields.length) assert.match(section, /No input parameters\./);
  }
  const entrypoint = mcp.get('SKILL.md').toString();
  assert.match(entrypoint, /campaign2_plan_list/);
  for (const name of ['brand-monitor', 'outreach-and-messaging', 'product-short-link-affiliation']) {
    assert.equal(mcp.has(`references/${name}.md`), false);
    assert.equal(universal.has(`references/${name}.md`), true);
  }
  for (const [path, bytes] of mcp) {
    if (path.endsWith('.md')) assert.doesNotMatch(bytes.toString(), /open_marketing_plan_tasks|list_marketing_plan_tasks|plan_list\/[^\n]*\/copy\//);
  }
  assert.doesNotMatch(mcp.get('references/product-overview-mcp.md').toString(), /Shopify|brand monitoring|message threads/i);
  assert.doesNotMatch(mcp.get('references/campaign-agent-automation.md').toString(), /workspace smart actions|creator-reply automation run|request one corresponding page/);
  assert.match(mcp.get('references/campaign-agent-automation.md').toString(), /User attachments/);
  assert.match(universal.get('references/campaign-agent-automation.md').toString(), /creator-reply automation run/);
  assert.doesNotMatch(mcp.get('references/creator.md').toString(), /Connected-Store Target Invitations/);
});

test('plugin and universal Skills ship the same MCP rules', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('skills/noxinfluencer-v2');
  for (const name of ['handoffs', 'mcp-host-runtime', 'tool-execution', 'runtime-mcp', 'campaign-agent-automation-mcp',
    'files-and-exports-mcp', 'product-overview-mcp', 'quota-pricing-dispute-feedback-mcp']) {
    const path = `references/${name}.md`;
    assert.ok(plugin.has(path));
    assert.deepEqual(plugin.get(path), universal.get(path));
  }
  const handoff = plugin.get('references/handoffs.md').toString();
  assert.match(handoff, /If no Handoff is configured or advertised, present the available business result in conversation/);
  assert.match(handoff, /If a configured Handoff fails, report that presentation failure with the confirmed business result/);
  assert.doesNotMatch(handoff, /currently deferred|only after the user explicitly asks/);
  const auth = plugin.get('references/oauth-and-scopes.md').toString();
  assert.equal(auth, universal.get('references/oauth-and-scopes.md').toString());
  const selection = markdownSection(universal.get('SKILL.md').toString(), '## Runtime Selection');
  assert.match(selection, /If MCP is selected and the connection is not ready, follow .*references\/oauth-and-scopes\.md/);
  assert.match(selection, /If CLI is selected and needs setup, follow .*references\/auth\.md/);
  assert.match(selection, /Continue through the selected runtime's recovery, including when the other runtime is ready/);
  assert.match(selection, /For a new workflow with no selected runtime/);
  assert.match(selection, /isolated V2 CLI if it is installed, authorized for that account, and its live schema covers the task/);
  assert.match(auth, /successful exit and explicit login-success result mean authorization succeeded/);
  assert.match(auth, /do not assume launching a separate login process refreshed the active task/);
  assert.match(auth, /resume the retained original operation immediately/);
  assert.match(plugin.get('SKILL.md').toString(), /installed Agent plugin/);
  assert.match(plugin.get('references/runtime-mcp.md').toString(), /MCP Runtime Boundary/);
  assert.equal(universal.has('references/runtime-plugin.md'), false);
});

test('the shared plugin routes OAuth to the running host and resolves WorkBuddy Skill resources', () => {
  const plugin = createOutputs().outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const auth = plugin.get('references/oauth-and-scopes.md').toString();
  const setup = markdownSection(auth, '## Common Host Connection Setup');
  const continuation = markdownSection(auth, '## One Attempt, Then Resume');
  const workbuddy = markdownSection(auth, '## WorkBuddy Authorization');
  const codex = markdownSection(auth, '## Codex Authorization Only');
  assert.match(setup, /Install if confirmed missing, enable if disabled, and reuse any valid authorization/);
  assert.match(setup, /invoke the host's native authorization or reconnect action once/);
  assert.match(setup, /Use the confirmed host's section/);
  assert.match(setup, /Use the connection declared by the plugin or Expert when present/);
  assert.match(setup, /Reuse an existing pending flow/);
  assert.match(setup, /When authorization succeeds but tools are still absent, follow the readiness checks.*Do not start authorization again/);
  assert.doesNotMatch(setup + continuation, /codex mcp login|start-codex-oauth/);
  assert.match(workbuddy, /WorkBuddy's native authorization action/);
  assert.match(workbuddy, /连接 \(Connect\)/);
  assert.match(workbuddy, /skipped, cancelled or failed, go directly to the recovery controls/);
  assert.match(workbuddy, /without invoking another host's login commands/);
  assert.doesNotMatch(workbuddy, /codex mcp login|noxinfluencer\.codex\.user|start-codex-oauth/);
  assert.match(codex, /only when trusted host context confirms that the running host is Codex/);
  assert.match(codex, /codex mcp login noxinfluencer --oauth-client-registration dcr --scopes noxinfluencer\.codex\.user/);
  assert.ok(plugin.has('scripts/start-codex-oauth.ps1'), 'Codex authorization remains available in the same shared plugin');
  const entrypoint = plugin.get('SKILL.md').toString();
  const operation = markdownSection(entrypoint, '## Choose The Available Operation');
  assert.match(operation, /first read .*references\/oauth-and-scopes\.md/);
  assert.ok(operation.indexOf('references/oauth-and-scopes.md') < operation.indexOf('references/tool-list.md'));
  assert.match(entrypoint, /\$\{CODEBUDDY_SKILL_DIR\}/);
  assert.match(entrypoint, /use this native, host-expanded location for every/);
  assert.match(entrypoint, /A sibling Skill has its own directory/);
});

test('installed MCP entrypoint and page policy require actual tool-issued Handoffs for every new business page', () => {
  const plugin = createOutputs().outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const policy = markdownSection(plugin.get('references/handoffs.md').toString(), '## Business page opening');
  const entrypoint = markdownSection(plugin.get('SKILL.md').toString(), '## Business page opening');
  assert.match(entrypoint, /references\/handoffs\.md/);
  assert.match(policy, /Every new NoxInfluencer business page open or navigation/);
  for (const [name, text] of [['entrypoint', entrypoint], ['policy', policy]]) {
    assert.match(text, /corresponding MCP tool[\s\S]+actual, valid[^.]+`handoff_url`/, name);
    const prohibition = text.match(/(?:Never|Do not) bypass MCP[^.]+\./)?.[0];
    assert.ok(prohibition, `${name} must explicitly prohibit bypassing MCP`);
    for (const alternative of [/ordinary[^.]+URL/, /(?:construct|guess)[^.]+route/, /search/, /direct browser navigation/]) {
      assert.match(prohibition, alternative, name);
    }
  }
  assert.match(policy, /current authorized account and target/);
  assert.doesNotMatch(policy, /Grok|Start-Process|xdg-open/);
});

test('missing Handoffs stop page opening across page routes while valid-link host failures remain presentation failures', () => {
  const plugin = createOutputs().outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const policy = markdownSection(handoff, '## Business page opening');
  const entrypoint = markdownSection(plugin.get('SKILL.md').toString(), '## Business page opening');
  const other = markdownSection(handoff, '## Other MCP results');
  const recovery = markdownSection(handoff, '### Recover an expired or uncertain link');
  for (const [name, text] of [['entrypoint', entrypoint], ['policy', policy], ['other results', other], ['recovery', recovery]]) {
    assert.ok(text.includes('"没有相关页面可以打开。"'), `${name} must retain the exact unavailable-page reply`);
    assert.match(text, /stop (?:the page-opening action|opening the page)/i, name);
  }
  assert.match(policy, /no usable `handoff_url`/);
  assert.match(policy, /return any verified business result/);
  assert.match(policy, /valid URL that the host cannot open is a presentation failure, not proof that no page exists/);
  assert.match(recovery, /declared read-only MCP entrypoint[^.]+fresh Handoff for the exact target/);
  assert.match(recovery, /no matching read-only entrypoint or it cannot supply a valid link/);
});

test('business-page gate preserves current Handoff reuse and separate OAuth, download, evidence and standalone workflows', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('skills/noxinfluencer-v2');
  const policy = markdownSection(plugin.get('references/handoffs.md').toString(), '## Business page opening');
  assert.match(policy, /valid Handoff already returned with the current business operation[^.]+do not make a redundant MCP call/);
  assert.match(policy, /exact matching page open under the reuse rules below is not a new page open/);
  assert.match(policy, /OAuth authorization, file downloads, and original public creator or video evidence retain their own rules/);
  assert.deepEqual(plugin.get('references/oauth-and-scopes.md'),
    readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/adapters/mcp/oauth-and-scopes.md')));
  assert.deepEqual(universal.get('references/handoffs.md'),
    readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/adapters/mcp/handoffs.md')));
  assert.deepEqual(plugin.get('references/handoffs.md'), universal.get('references/handoffs.md'));
  assert.doesNotMatch(universal.get('SKILL.md').toString(), /## Business page opening|没有相关页面可以打开。/);
});

test('Campaign page reuse requires an exact current account and chat match and uses the website SSE refresh', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const handoff = plugin.get('references/handoffs.md').toString();
  const reuse = markdownSection(handoff, '### Reuse the exact open page');
  assert.match(reuse, /existing view in the current conversation only when[^.]+host information confirms[^.]+current authorized account[^.]+exact target plan and view/);
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

test('Campaign references delegate presentation to the selected runtime', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const universal = outputs.get('skills/noxinfluencer-v2');
  const runtime = plugin.get('references/runtime-mcp.md').toString();
  assert.ok(plugin.get('SKILL.md').toString().includes(runtime));
  const obsoleteOpeningRules = /turn terminal|terminal-triggered|host turn ends|page-load receipt|render receipt|verified native (?:host|Handoff) action|structured (?:workbench|status interface)|authorized workspace context interface|SaaS Campaign workspace after the final answer|workspace navigation guidance for the page link|Open a page only when the user asks/i;
  for (const name of ['runtime-mcp', 'tool-execution', 'mcp-host-runtime', 'campaign-agent-automation-mcp']) {
    const path = `references/${name}.md`;
    const content = plugin.get(path).toString();
    assert.match(content, /references\/handoffs\.md/, path);
    assert.doesNotMatch(content, obsoleteOpeningRules, path);
  }
  assert.doesNotMatch(plugin.get('references/handoffs.md').toString(), obsoleteOpeningRules);
  const manager = outputs.get('plugins/noxinfluencer/skills/influencer-marketing-manager');
  assert.match(manager.get('SKILL.md').toString(), /Otherwise use the `noxinfluencer-mcp` product Skill/);
  assert.doesNotMatch(manager.get('SKILL.md').toString(), obsoleteOpeningRules);
  assert.doesNotMatch(universal.get('SKILL.md').toString(), /## Campaign presentation|`cua_repl`/);
  for (const name of ['campaign-invitation-management', 'marketing-plan-and-campaign']) {
    const path = `references/${name}.md`;
    assert.deepEqual(plugin.get(path), universal.get(path));
    assert.match(universal.get(path).toString(), /selected runtime's (?:Campaign )?presentation rules/);
  }
});

test('plan-list input schema and plugin prompts match the supported surface', () => {
  const tools = JSON.parse(readFileSync(resolve(repositoryRoot, 'v2/source/noxinfluencer/snapshots/mcp-tools.json'))).items;
  const schema = tools.find(tool => tool.name === 'campaign2_plan_list').input_schema;
  assert.deepEqual(Object.keys(schema.properties).sort(), ['page_num', 'page_size', 'keyword', 'start_time', 'end_time', 'invite_status'].sort());
  const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, 'plugins/noxinfluencer/.codex-plugin/plugin.json')));
  assert.ok(manifest.interface.defaultPrompt.some(prompt => /marketing.plan/i.test(prompt)));
});

test('MCP uses explicit write scope and retains verification and local output when a workflow is interrupted', () => {
  const { outputs } = createOutputs();
  const plugin = outputs.get('plugins/noxinfluencer/skills/noxinfluencer-mcp');
  const execution = plugin.get('references/tool-execution.md').toString();
  assert.match(execution, /an explicit request for the exact object and action establishes approval/);
  assert.match(execution, /tool has no additional confirmation step/);
  assert.match(execution, /For a declared preview\/execute flow, preview the impact, obtain exact user confirmation/);
  const plan = plugin.get('references/marketing-plan-and-campaign.md').toString();
  assert.match(markdownSection(plan, '## Requests With Multiple Operations'), /write the parts supported by their materials and any verified results to the requested path and format/);
  assert.match(markdownSection(plan, '## Execution And Reporting'), /After apply, use the declared read operation to compare the actual applied fields/);
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
