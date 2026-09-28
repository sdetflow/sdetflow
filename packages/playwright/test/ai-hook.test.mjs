import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFailureIfEnabled, createConfig } from '../dist/index.js';

test('AI is not invoked by default', async () => {
  let calls = 0;
  const result = await analyzeFailureIfEnabled({
    analyzer: { analyzeFailure: async () => { calls += 1; return {}; } },
  }, createConfig());
  assert.equal(result.invoked, false);
  assert.equal(calls, 0);
});

test('AI receives sanitized context only when explicitly enabled', async () => {
  let received;
  const result = await analyzeFailureIfEnabled({
    error: new Error('password=hunter2 Authorization: Bearer SECRET'),
    analyzer: { analyzeFailure: async (ctx) => { received = ctx; return { category: 'automation' }; } },
  }, createConfig({ ai: { enabled: true } }));
  assert.equal(result.invoked, true);
  assert.equal(JSON.stringify(received).includes('hunter2'), false);
  assert.equal(JSON.stringify(received).includes('SECRET'), false);
});

test('AI adapter failure is contained', async () => {
  const result = await analyzeFailureIfEnabled({
    analyzer: { analyzeFailure: async () => { throw new Error('provider timeout'); } },
  }, createConfig({ ai: { enabled: true } }));
  assert.equal(result.invoked, true);
  assert.match(result.error, /provider timeout/);
});
