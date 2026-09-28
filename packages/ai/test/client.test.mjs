import test from 'node:test';
import assert from 'node:assert/strict';
import { createAIConfig, FakeProvider, SdetFlowAIClient, AIProviderError, AIBudgetError } from '../dist/index.js';

function result(provider, model, text = 'ok', usage = {}) {
  return { provider, model, text, usage, latencyMs: 1 };
}

test('disabled client blocks provider calls', async () => {
  let calls = 0;
  const client = new SdetFlowAIClient({
    config: createAIConfig(),
    providers: [new FakeProvider('fake', async () => { calls++; return result('fake', 'm'); })],
  });
  await assert.rejects(client.generate({ task: 'general', input: 'x' }), /disabled/);
  assert.equal(calls, 0);
});

test('client redacts secrets before provider invocation', async () => {
  let seen;
  const provider = new FakeProvider('fake', async (model, request) => { seen = request.input; return result('fake', model); });
  const client = new SdetFlowAIClient({
    config: createAIConfig({ enabled: true, routes: [{ task: '*', targets: [{ provider: 'fake', model: 'm' }] }] }),
    providers: [provider],
  });
  await client.generate({ task: 'general', input: 'password=hunter2 Authorization: Bearer SECRET qa@example.com' });
  assert.equal(seen.includes('hunter2'), false);
  assert.equal(seen.includes('SECRET'), false);
  assert.equal(seen.includes('qa@example.com'), false);
});

test('client retries retryable provider error', async () => {
  let calls = 0;
  const provider = new FakeProvider('fake', async (model) => {
    calls++;
    if (calls === 1) throw new AIProviderError('fake', 'busy', { status: 429, retryable: true });
    return result('fake', model);
  });
  const client = new SdetFlowAIClient({
    config: createAIConfig({ enabled: true, routes: [{ task: '*', targets: [{ provider: 'fake', model: 'm' }] }] }),
    providers: [provider], sleep: async () => {},
  });
  const out = await client.generate({ task: 'general', input: 'x' });
  assert.equal(out.text, 'ok');
  assert.equal(calls, 2);
});

test('client does not retry non-retryable provider error', async () => {
  let calls = 0;
  const provider = new FakeProvider('fake', async () => { calls++; throw new AIProviderError('fake', 'bad', { status: 400, retryable: false }); });
  const client = new SdetFlowAIClient({
    config: createAIConfig({ enabled: true, routes: [{ task: '*', targets: [{ provider: 'fake', model: 'm' }] }] }),
    providers: [provider], sleep: async () => {},
  });
  await assert.rejects(client.generate({ task: 'general', input: 'x' }), /bad/);
  assert.equal(calls, 1);
});

test('client falls back to second provider', async () => {
  const events = [];
  const p1 = new FakeProvider('p1', async () => { throw new AIProviderError('p1', 'down', { retryable: false }); });
  const p2 = new FakeProvider('p2', async (model) => result('p2', model, 'fallback ok'));
  const client = new SdetFlowAIClient({
    config: createAIConfig({ enabled: true, routes: [{ task: '*', targets: [{ provider: 'p1', model: 'a' }, { provider: 'p2', model: 'b' }] }] }),
    providers: [p1, p2], onEvent: (e) => events.push(e), sleep: async () => {},
  });
  const out = await client.generate({ task: 'general', input: 'x' });
  assert.equal(out.provider, 'p2');
  assert.equal(events.some((e) => e.type === 'fallback'), true);
});

test('input budget blocks before provider call', async () => {
  let calls = 0;
  const provider = new FakeProvider('fake', async (model) => { calls++; return result('fake', model); });
  const client = new SdetFlowAIClient({
    config: createAIConfig({ enabled: true, budget: { maxInputChars: 3 }, routes: [{ task: '*', targets: [{ provider: 'fake', model: 'm' }] }] }),
    providers: [provider],
  });
  await assert.rejects(client.generate({ task: 'general', input: '1234' }), AIBudgetError);
  assert.equal(calls, 0);
});

test('per-call estimated cost budget blocks before provider invocation', async () => {
  let calls = 0;
  const provider = new FakeProvider('fake', async (model) => { calls++; return result('fake', model, 'ok', { inputTokens: 1, outputTokens: 1 }); });
  const client = new SdetFlowAIClient({
    config: createAIConfig({
      enabled: true,
      budget: { maxOutputTokens: 1000, maxEstimatedCostUsdPerCall: 0.000001 },
      routes: [{ task: '*', targets: [{ provider: 'fake', model: 'm', inputCostPerMillionUsd: 1, outputCostPerMillionUsd: 10 }] }],
    }),
    providers: [provider],
  });
  await assert.rejects(client.generate({ task: 'general', input: 'x' }), AIBudgetError);
  assert.equal(calls, 0);
});

test('budget routing skips expensive target and uses cheaper fallback', async () => {
  const calls = [];
  const provider = new FakeProvider('fake', async (model) => { calls.push(model); return result('fake', model, 'ok', { inputTokens: 1, outputTokens: 1 }); });
  const client = new SdetFlowAIClient({
    config: createAIConfig({
      enabled: true,
      budget: { maxOutputTokens: 1000, maxEstimatedCostUsdPerCall: 0.001 },
      routes: [{ task: '*', targets: [
        { provider: 'fake', model: 'expensive', inputCostPerMillionUsd: 100, outputCostPerMillionUsd: 100 },
        { provider: 'fake', model: 'cheap', inputCostPerMillionUsd: 0.01, outputCostPerMillionUsd: 0.01 },
      ] }],
    }),
    providers: [provider],
  });
  const out = await client.generate({ task: 'general', input: 'x' });
  assert.equal(out.model, 'cheap');
  assert.deepEqual(calls, ['cheap']);
});

test('task-specific route beats wildcard route', async () => {
  const provider = new FakeProvider('fake', async (model) => result('fake', model));
  const client = new SdetFlowAIClient({
    config: createAIConfig({ enabled: true, routes: [
      { task: '*', targets: [{ provider: 'fake', model: 'general-model' }] },
      { task: 'failure-triage', targets: [{ provider: 'fake', model: 'triage-model' }] },
    ] }),
    providers: [provider],
  });
  const out = await client.generate({ task: 'failure-triage', input: 'x' });
  assert.equal(out.model, 'triage-model');
});
