import test from 'node:test';
import assert from 'node:assert/strict';
import { createAIConfig } from '../dist/index.js';

test('AI is disabled by default', () => {
  const config = createAIConfig();
  assert.equal(config.enabled, false);
  assert.deepEqual(config.routes, []);
});

test('enabled AI requires a route', () => {
  assert.throws(() => createAIConfig({ enabled: true }), /At least one route/);
});

test('configured routes are deeply frozen', () => {
  const config = createAIConfig({ enabled: true, routes: [{ task: '*', targets: [{ provider: 'fake', model: 'x' }] }] });
  assert.equal(Object.isFrozen(config), true);
  assert.equal(Object.isFrozen(config.routes), true);
  assert.equal(Object.isFrozen(config.routes[0].targets), true);
});

test('invalid retry policy is rejected', () => {
  assert.throws(() => createAIConfig({ retry: { maxAttemptsPerTarget: 0 } }), /maxAttemptsPerTarget/);
});
