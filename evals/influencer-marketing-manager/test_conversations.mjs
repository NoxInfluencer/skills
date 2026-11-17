import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { captureState, conversationPlan, copyCaseWorkspace, loadReferences, requestsFor, runConversation } from './run_conversations.mjs';

const testCase = { id: 31, trigger: 'should-trigger', prompt: 'FIRST', expectations: ['HIDDEN RUBRIC'],
  files: ['inputs/source.md'], followups: [{ prompt: 'LATER', expectations: ['HIDDEN FOLLOWUP RUBRIC'] }] };

test('each case sees only its declared sources and an independent Skill copy', () => {
  const prepared = mkdtempSync(resolve(tmpdir(), 'conversation-test-'));
  const roots = [prepared];
  try {
    mkdirSync(resolve(prepared, '.agents/skills'), { recursive: true });
    mkdirSync(resolve(prepared, 'inputs'));
    writeFileSync(resolve(prepared, '.agents/skills/skill.md'), 'original');
    writeFileSync(resolve(prepared, 'inputs/source.md'), 'declared');
    writeFileSync(resolve(prepared, 'inputs/other-case.md'), 'future facts');
    const populated = copyCaseWorkspace(prepared, testCase);
    const empty = copyCaseWorkspace(prepared, { files: [] });
    roots.push(populated, empty);
    assert.deepEqual(readdirSync(resolve(populated, 'inputs')), ['source.md']);
    assert.deepEqual(readdirSync(empty), ['.agents']);
    writeFileSync(resolve(populated, '.agents/skills/skill.md'), 'changed');
    assert.equal(readFileSync(resolve(empty, '.agents/skills/skill.md'), 'utf8'), 'original');
    assert.equal(readFileSync(resolve(prepared, '.agents/skills/skill.md'), 'utf8'), 'original');
  } finally {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  }
});

test('only user input and source paths cross into each turn', () => {
  const requests = requestsFor(testCase);
  assert.equal(requests[0], 'Use the influencer-marketing-manager skill to handle this request.\n\n' +
    'FIRST\n\nSupplied read-only files:\ninputs/source.md');
  assert.equal(requests.length, 2);
  assert.ok(requests[0].includes('FIRST'));
  assert.ok(requests[0].includes('inputs/source.md'));
  assert.ok(!requests[0].includes('LATER'));
  assert.ok(!requests.join('\n').includes('RUBRIC'));
  assert.equal(requests[1], 'LATER');
  assert.equal(requestsFor({ ...testCase, trigger: 'should-not-trigger' })[0],
    'FIRST\n\nSupplied read-only files:\ninputs/source.md');
});

test('authorized exercise writes stay in independent copies without changing read-only defaults', () => {
  const prepared = mkdtempSync(resolve(tmpdir(), 'conversation-writable-test-'));
  const roots = [prepared];
  try {
    mkdirSync(resolve(prepared, '.agents'));
    mkdirSync(resolve(prepared, 'inputs'));
    writeFileSync(resolve(prepared, 'inputs/state.json'), '{"runs":0}');
    const exercise = { ...testCase, files: ['inputs/state.json'], requires_isolated_workspace: true };
    const first = copyCaseWorkspace(prepared, exercise);
    const second = copyCaseWorkspace(prepared, exercise);
    roots.push(first, second);
    writeFileSync(resolve(first, 'inputs/state.json'), '{"runs":1}');
    assert.equal(JSON.parse(readFileSync(resolve(second, 'inputs/state.json'))).runs, 0);
    assert.equal(JSON.parse(readFileSync(resolve(prepared, 'inputs/state.json'))).runs, 0);
    const request = requestsFor(exercise)[0];
    assert.match(request, /isolated exercise files/);
    assert.match(request, /changes require the user's current request and adapter contract/);
    assert.ok(!request.includes('Supplied read-only files:'));
    assert.ok(!request.includes('HIDDEN RUBRIC'));
    assert.match(requestsFor(testCase)[0], /Supplied read-only files:/);
  } finally {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  }
});

test('repeated rounds alternate variant order without changing the default schedule', () => {
  const cases = [testCase, { ...testCase, id: 32 }];
  const variants = ['baseline', 'candidate'];
  const schedule = repeat => [...conversationPlan(cases, variants, repeat)]
    .map(item => [item.testCase.id, item.variant, item.repetition]);
  assert.deepEqual(schedule(1), [[31, 'baseline', 1], [31, 'candidate', 1],
    [32, 'baseline', 1], [32, 'candidate', 1]]);
  assert.deepEqual(schedule(2).slice(4), [[31, 'candidate', 2], [31, 'baseline', 2],
    [32, 'candidate', 2], [32, 'baseline', 2]]);
  assert.deepEqual(variants, ['baseline', 'candidate']);
  for (const repeat of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => [...conversationPlan(cases, variants, repeat)], /positive integer/);
  }
});

test('every repeated observation starts with an untouched independent workspace', () => {
  const prepared = mkdtempSync(resolve(tmpdir(), 'conversation-repeat-test-'));
  const roots = [prepared];
  try {
    mkdirSync(resolve(prepared, '.agents'), { recursive: true });
    writeFileSync(resolve(prepared, '.agents/state.md'), 'original');
    for (const job of conversationPlan([{ files: [] }], ['baseline', 'candidate'], 2)) {
      const directory = copyCaseWorkspace(prepared, job.testCase);
      roots.push(directory);
      assert.equal(readFileSync(resolve(directory, '.agents/state.md'), 'utf8'), 'original');
      writeFileSync(resolve(directory, '.agents/state.md'), 'modified by this observation');
    }
    assert.equal(new Set(roots).size, 5);
    assert.equal(readFileSync(resolve(prepared, '.agents/state.md'), 'utf8'), 'original');
  } finally {
    for (const root of roots) rmSync(root, { recursive: true, force: true });
  }
});

test('preload delivers exact selected reference text and hashes without future turns or rubric', async () => {
  const prepared = mkdtempSync(resolve(tmpdir(), 'conversation-reference-test-'));
  const name = 'references/method.md';
  const text = 'Non-ASCII 原文\r\nwith original spacing.\n';
  try {
    const manager = resolve(prepared, '.agents/skills/influencer-marketing-manager');
    mkdirSync(resolve(manager, 'references'), { recursive: true });
    writeFileSync(resolve(manager, name), text);
    writeFileSync(resolve(manager, 'references/unselected.md'), 'UNSELECTED CONTENT');
    const references = loadReferences(prepared, [name]);
    assert.deepEqual(references, [{ path: name, text, bytes: Buffer.byteLength(text),
      sha256: createHash('sha256').update(text).digest('hex') }]);
    const calls = [];
    const thread = { async runStreamed(request) {
      calls.push(request);
      return { events: (async function* () {
        yield { type: 'item.completed', item: { type: 'agent_message', text: 'answer' } };
        yield { type: 'turn.completed' };
      })() };
    } };
    const result = await runConversation(thread, testCase, () => {}, 1000, references);
    assert.ok(calls[0].startsWith(requestsFor(testCase)[0]));
    assert.ok(calls[0].includes(text));
    assert.ok(!calls[0].includes('LATER'));
    assert.ok(!calls.join('\n').includes('RUBRIC'));
    assert.ok(!calls.join('\n').includes('UNSELECTED CONTENT'));
    assert.equal(calls[1], 'LATER');
    assert.equal(result.turns[0].request, calls[0]);
    assert.equal(result.completed, true);
    assert.deepEqual(loadReferences('/nonexistent', []), []);
  } finally {
    rmSync(prepared, { recursive: true, force: true });
  }
});

test('preload cannot escape Manager references through a path or symlink', () => {
  const prepared = mkdtempSync(resolve(tmpdir(), 'conversation-reference-boundary-'));
  try {
    const manager = resolve(prepared, '.agents/skills/influencer-marketing-manager');
    mkdirSync(resolve(manager, 'references'), { recursive: true });
    writeFileSync(resolve(manager, 'references/valid.md'), 'valid');
    const outside = resolve(prepared, 'private.md');
    writeFileSync(outside, 'must not enter a request');
    symlinkSync(outside, resolve(manager, 'references/link.md'));
    for (const name of [outside, '../private.md', 'references/../private.md',
      'references/../../private.md', 'references\\valid.md', 'references//valid.md',
      'references/valid.txt', 'references/link.md', 'inputs/source.md', '']) {
      assert.throws(() => loadReferences(prepared, [name]));
    }
    assert.throws(() => loadReferences(prepared, ['references/valid.md', 'references/valid.md']), /distinct/);
    rmSync(resolve(manager, 'references'), { recursive: true });
    symlinkSync(prepared, resolve(manager, 'references'));
    assert.throws(() => loadReferences(prepared, ['references/private.md']), /stay inside/);
  } finally {
    rmSync(prepared, { recursive: true, force: true });
  }
});

test('a continuing conversation retains raw events and uses the same thread', async () => {
  const calls = [];
  const thread = { async runStreamed(prompt) {
    calls.push(prompt);
    return { events: (async function* () {
      yield { type: 'thread.started', thread_id: 'test-thread' };
      yield { type: 'item.completed', item: { type: 'agent_message', text: 'response ' + calls.length } };
      yield { type: 'turn.completed', usage: { input_tokens: 5, output_tokens: 2 } };
    })() };
  } };
  const result = await runConversation(thread, testCase, () => {}, 1000);
  assert.deepEqual(calls, requestsFor(testCase));
  assert.equal(result.turns[1].response, 'response 2');
  assert.equal(result.turns[0].events.length, 3);
  assert.equal(result.completed, true);
  assert.equal(result.review_required, true);
});

test('failure keeps partial evidence and stops dependent followups', async () => {
  let calls = 0;
  const thread = { async runStreamed() {
    calls++;
    return { events: (async function* () {
      yield { type: 'item.completed', item: { type: 'agent_message', text: 'partial answer' } };
      throw new Error('connection lost');
    })() };
  } };
  const result = await runConversation(thread, testCase, () => {}, 1000);
  assert.equal(calls, 1);
  assert.equal(result.completed, false);
  assert.equal(result.turns[0].response, 'partial answer');
  assert.match(result.turns[0].error, /connection lost/);
});

test('an empty or truncated turn is not completion', async () => {
  for (const events of [[], [{ type: 'turn.completed' }]]) {
    const thread = { async runStreamed() { return { events: (async function* () { yield* events; })() }; } };
    const result = await runConversation(thread, testCase, () => {}, 1000);
    assert.equal(result.completed, false);
    assert.equal(result.turns.length, 1);
  }
});

test('isolated state evidence survives each turn and a later runtime failure', async () => {
  const root = mkdtempSync(resolve(tmpdir(), 'conversation-state-evidence-'));
  try {
    mkdirSync(resolve(root, 'inputs'));
    const file = resolve(root, 'inputs/state.json');
    writeFileSync(file, '{"runs":0}');
    const exercise = { ...testCase, requires_isolated_workspace: true, files: ['inputs/state.json'] };
    let calls = 0;
    const thread = { async runStreamed() {
      calls++;
      return { events: (async function* () {
        writeFileSync(file, JSON.stringify({ runs: calls }));
        if (calls === 2) throw new Error('connection lost after local write');
        yield { type: 'item.completed', item: { type: 'agent_message', text: 'first complete' } };
        yield { type: 'turn.completed' };
      })() };
    } };
    let saved;
    const result = await runConversation(thread, exercise, value => { saved = structuredClone(value); }, 1000, [], root);
    assert.equal(result.completed, false);
    assert.equal(saved.state_snapshots.before['inputs/state.json'].state.runs, 0);
    assert.equal(saved.state_snapshots.after_turn[1]['inputs/state.json'].state.runs, 1);
    const after = saved.state_snapshots.after_turn[2]['inputs/state.json'];
    assert.equal(after.state.runs, 2);
    assert.equal(after.sha256, createHash('sha256').update(readFileSync(file)).digest('hex'));
    assert.match(saved.turns[1].error, /connection lost/);
    assert.equal(saved.turns[0].response, 'first complete');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('state capture is bounded to declared JSON inside the workspace and records missing evidence', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'conversation-state-boundary-'));
  const outside = mkdtempSync(resolve(tmpdir(), 'conversation-private-state-'));
  try {
    const exercise = { requires_isolated_workspace: true,
      files: ['linked.json', '../private.json', 'large.json', 'missing.json', 'invalid.json', 'source.md'] };
    writeFileSync(resolve(outside, 'private.json'), '{"secret":"outside-content"}');
    symlinkSync(resolve(outside, 'private.json'), resolve(root, 'linked.json'));
    writeFileSync(resolve(root, 'large.json'), ' '.repeat(256 * 1024 + 1));
    writeFileSync(resolve(root, 'invalid.json'), '{');
    writeFileSync(resolve(root, 'source.md'), 'not a state artifact');
    const state = captureState(root, exercise);
    assert.equal(Object.keys(state).length, 5);
    assert.ok(Object.values(state).every(value => value.error && !value.state));
    assert.ok(!JSON.stringify(state).includes('outside-content'));
    assert.match(state['linked.json'].error, /inside/);
    assert.match(state['large.json'].error, /256 KiB/);
    assert.equal(captureState(root, testCase), undefined);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test('an isolated exercise cannot run without a directory for its state evidence', async () => {
  const thread = { async runStreamed() { assert.fail('must validate before execution'); } };
  await assert.rejects(runConversation(thread, { ...testCase, requires_isolated_workspace: true },
    () => {}, 1000), /working directory/);
});
