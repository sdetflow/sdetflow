import test from 'node:test';
import assert from 'node:assert/strict';
import { SmartLocator, createConfig } from '../dist/index.js';

function locator({ click, fill, count = 1 }) {
  return {
    click: click ?? (async () => {}),
    fill: fill ?? (async () => {}),
    count: async () => count,
  };
}

function policy(order = ['testId', 'role', 'label', 'text', 'css']) {
  return createConfig({ smartLocator: { order, timeoutMs: 25 } }).smartLocator;
}

test('click uses testId first when successful', async () => {
  const called = [];
  const page = {
    getByTestId: () => locator({ click: async () => called.push('testId') }),
    getByRole: () => locator({ click: async () => called.push('role') }),
  };
  const smart = new SmartLocator(page, { policy: policy() });
  const result = await smart.click({ testId: 'save', role: 'button', roleName: 'Save' });
  assert.equal(result.strategy, 'testId');
  assert.deepEqual(called, ['testId']);
});

test('click falls back when earlier strategy fails', async () => {
  const called = [];
  const page = {
    getByTestId: () => locator({ click: async () => { called.push('testId'); throw new Error('not visible'); } }),
    getByRole: () => locator({ click: async () => called.push('role') }),
  };
  const smart = new SmartLocator(page, { policy: policy() });
  const result = await smart.click({ testId: 'save', role: 'button', roleName: 'Save' });
  assert.equal(result.strategy, 'role');
  assert.deepEqual(called, ['testId', 'role']);
  assert.equal(result.attempts[0].success, false);
});

test('configured strategy order is honored', async () => {
  const page = {
    getByTestId: () => locator({}),
    getByRole: () => locator({}),
  };
  const smart = new SmartLocator(page, { policy: policy(['role', 'testId']) });
  const result = await smart.resolve({ testId: 'save', role: 'button' });
  assert.equal(result.strategy, 'role');
});

test('missing candidate is skipped', async () => {
  const page = { getByText: () => locator({}) };
  const smart = new SmartLocator(page, { policy: policy() });
  const result = await smart.resolve({ text: 'Continue' });
  assert.equal(result.strategy, 'text');
});

test('all failures produce deterministic error and redacted telemetry', async () => {
  const events = [];
  const page = {
    getByTestId: () => locator({ click: async () => { throw new Error('Authorization: Bearer SECRET123'); } }),
    locator: () => locator({ click: async () => { throw new Error('bad css'); } }),
  };
  const smart = new SmartLocator(page, { policy: policy(), onTelemetry: (e) => events.push(e) });
  await assert.rejects(smart.click({ testId: 'x', css: '#x' }), /failed for all candidates/);
  assert.equal(JSON.stringify(events).includes('SECRET123'), false);
  assert.equal(events.at(-1).attempts.length, 2);
});

test('fill falls back and writes value once to successful locator', async () => {
  const values = [];
  const page = {
    getByLabel: () => locator({ fill: async () => { throw new Error('detached'); } }),
    getByText: () => locator({ fill: async (value) => values.push(value) }),
  };
  const smart = new SmartLocator(page, { policy: policy() });
  const result = await smart.fill({ label: 'Email', text: 'Email input' }, 'qa@example.com');
  assert.equal(result.strategy, 'text');
  assert.deepEqual(values, ['qa@example.com']);
});
