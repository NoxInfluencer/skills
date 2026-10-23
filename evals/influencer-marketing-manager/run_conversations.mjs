/** Sequential behavioral probes; reuse prepared Skills and keep review outside the model. */
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { Codex } from '@openai/codex-sdk';
import { parse } from 'yaml';

const evalDir = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(evalDir, 'workspace/promptfoo');

export function copyCaseWorkspace(preparedRoot, testCase) {
  const directory = mkdtempSync(resolve(tmpdir(), 'manager-conversation-'));
  try {
    cpSync(resolve(preparedRoot, '.agents'), resolve(directory, '.agents'), { recursive: true });
    for (const name of testCase.files || []) {
      const destination = resolve(directory, name);
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(resolve(preparedRoot, name), destination);
    }
    return directory;
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

export function requestsFor(testCase) {
  const invocation = testCase.trigger === 'should-not-trigger' ? ''
    : 'Use the influencer-marketing-manager skill to handle this request.\n\n';
  const files = testCase.files?.length
    ? '\n\nSupplied read-only files:\n' + testCase.files.join('\n') : '';
  // Later user input and all expectations stay outside the current model turn.
  return [invocation + testCase.prompt + files,
    ...(testCase.followups || []).map(turn => turn.prompt)];
}

export async function runConversation(thread, testCase, save, timeoutMs) {
  const result = { case_id: testCase.id, category: testCase.category,
    review_required: true, turns: [], completed: false };
  for (const request of requestsFor(testCase)) {
    const turn = { request, events: [], response: '', completed: false };
    result.turns.push(turn);
    save(result);
    const started = Date.now();
    try {
      const { events } = await thread.runStreamed(request, { signal: AbortSignal.timeout(timeoutMs) });
      for await (const event of events) {
        turn.events.push(event);
        if (event.type === 'thread.started') result.thread_id = event.thread_id;
        if (event.type === 'item.completed' && event.item.type === 'agent_message') {
          turn.response = event.item.text;
        }
        if (event.type === 'turn.completed') {
          turn.completed = true;
          turn.usage = event.usage;
        }
        if (event.type === 'turn.failed' || event.type === 'error') {
          turn.error = event.error?.message || event.message || 'Turn failed';
        }
        save(result);
      }
      if (!turn.completed || !turn.response.trim() || turn.error) {
        throw new Error(turn.error || 'Turn ended without a completed response');
      }
    } catch (error) {
      turn.error = String(error.message || error);
      turn.completed = false;
    }
    turn.elapsed_ms = Date.now() - started;
    save(result);
    if (!turn.completed) return result;
  }
  result.completed = true; // Execution completeness only, never a semantic grade.
  save(result);
  return result;
}

async function main() {
  const { values } = parseArgs({ options: {
    cases: { type: 'string', default: '31,32,33,34' },
    variants: { type: 'string', default: 'baseline,candidate' },
    output: { type: 'string' },
  } });
  if (!values.output) throw new Error('--output is required; use an ignored workspace path');
  const ids = values.cases.split(',').map(Number);
  const variants = values.variants.split(',');
  if (!ids.length || ids.some(id => !Number.isInteger(id)) || new Set(ids).size !== ids.length) {
    throw new Error('Provide distinct numeric case IDs');
  }
  if (variants.some(value => !['baseline', 'candidate'].includes(value)) || new Set(variants).size !== variants.length) {
    throw new Error('Use baseline and/or candidate once each');
  }
  execFileSync('python3', [resolve(evalDir, 'prepare_promptfoo_fixtures.py'), '--check'], { stdio: 'pipe' });
  const cases = JSON.parse(readFileSync(resolve(evalDir, 'evals.json'), 'utf8')).evals;
  const selected = ids.map(id => {
    const testCase = cases.find(item => item.id === id);
    if (!testCase) throw new Error(`Unknown case ${id}`);
    return testCase;
  });
  const config = parse(readFileSync(resolve(evalDir, 'promptfooconfig.yaml'), 'utf8'));
  const shared = config['x-codex-config'];
  const defaultModel = shared.model.match(/default\("([^"]+)"\)/)?.[1];
  const model = process.env.INFLUENCER_EVAL_MODEL || defaultModel || shared.model;
  const options = {
    model, modelReasoningEffort: shared.model_reasoning_effort,
    skipGitRepoCheck: shared.skip_git_repo_check, sandboxMode: shared.sandbox_mode,
    approvalPolicy: shared.approval_policy, networkAccessEnabled: shared.network_access_enabled,
    webSearchMode: shared.web_search_mode,
  };
  const env = Object.fromEntries(['PATH', 'HOME', 'USER', 'TMPDIR', 'LANG', 'OPENAI_API_KEY', 'CODEX_API_KEY']
    .filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]));
  env.CODEX_HOME = resolve(workspace, 'codex-home');
  const proxy = process.env.INFLUENCER_EVAL_PROXY || process.env.HTTPS_PROXY || 'http://127.0.0.1:10808';
  env.HTTP_PROXY = process.env.HTTP_PROXY || proxy;
  env.HTTPS_PROXY = process.env.HTTPS_PROXY || proxy;
  env.ALL_PROXY = process.env.ALL_PROXY || proxy;
  env.NO_PROXY = process.env.INFLUENCER_EVAL_NO_PROXY || process.env.NO_PROXY ||
    '127.0.0.1,localhost,::1,10.0.0.0/8';
  const codex = new Codex({ env, config: shared.cli_config });
  const report = {
    schema_version: 1, started_at: new Date().toISOString(),
    fixture_snapshot: JSON.parse(readFileSync(resolve(workspace, 'fixture-manifest.json'), 'utf8')),
    runtime: options, conversations: [],
  };
  const output = resolve(values.output);
  // Refuse to overwrite a previous observation.
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  const save = () => writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  for (const testCase of selected) {
    for (const variant of variants) {
      const index = report.conversations.length;
      const directory = copyCaseWorkspace(resolve(workspace, 'fixtures', variant), testCase);
      try {
        const thread = codex.startThread({ ...options, workingDirectory: directory });
        const result = await runConversation(thread, testCase, value => {
          report.conversations[index] = { variant, ...value };
          save();
        }, config.evaluateOptions.timeoutMs);
        console.log(`${variant} case ${testCase.id}: ${result.completed ? 'recorded; review required' : 'runtime error'}`);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  }
  execFileSync('python3', [resolve(evalDir, 'prepare_promptfoo_fixtures.py'), '--check'], { stdio: 'pipe' });
  report.finished_at = new Date().toISOString();
  save();
  if (report.conversations.some(item => !item.completed)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
