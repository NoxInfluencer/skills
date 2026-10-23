import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { copyCaseWorkspace, requestsFor, runConversation } from './run_conversations.mjs';

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
  assert.equal(requests.length, 2);
  assert.ok(requests[0].includes('FIRST'));
  assert.ok(requests[0].includes('inputs/source.md'));
  assert.ok(!requests[0].includes('LATER'));
  assert.ok(!requests.join('\n').includes('RUBRIC'));
  assert.equal(requests[1], 'LATER');
  assert.equal(requestsFor({ ...testCase, trigger: 'should-not-trigger' })[0],
    'FIRST\n\nSupplied read-only files:\ninputs/source.md');
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
