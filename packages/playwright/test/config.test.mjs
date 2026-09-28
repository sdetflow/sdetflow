import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfig, configFromEnv } from '../dist/index.js';

test('defaults keep AI disabled and DOM off', () => {
  const config = createConfig();
  assert.equal(config.ai.enabled, false);
  assert.equal(config.artifacts.includeDom, false);
  assert.equal(config.smartLocator.order[0], 'testId');
});

test('nested config merges without losing defaults', () => {
  const config = createConfig({ retry: { maxAttempts: 5 } });
  assert.equal(config.retry.maxAttempts, 5);
  assert.equal(config.retry.factor, 2);
});

test('config is deeply frozen', () => {
  const config = createConfig();
  assert.equal(Object.isFrozen(config), true);
  assert.equal(Object.isFrozen(config.retry), true);
  assert.equal(Object.isFrozen(config.smartLocator.order), true);
});

test('invalid retry count is rejected', () => {
  assert.throws(() => createConfig({ retry: { maxAttempts: 0 } }), /retry\.maxAttempts/);
});

test('invalid timeout is rejected', () => {
  assert.throws(() => createConfig({ smartLocator: { timeoutMs: -1 } }), /smartLocator\.timeoutMs/);
});

test('environment values parse correctly', () => {
  const config = configFromEnv({
    SDETFLOW_AI_ENABLED: 'true',
    SDETFLOW_INCLUDE_DOM: 'no',
    SDETFLOW_SCREENSHOT_ON_FAILURE: '0',
    SDETFLOW_LOCATOR_TIMEOUT_MS: '1500',
    SDETFLOW_RETRY_MAX_ATTEMPTS: '4',
  });
  assert.equal(config.ai.enabled, true);
  assert.equal(config.artifacts.includeDom, false);
  assert.equal(config.artifacts.screenshotOnFailure, false);
  assert.equal(config.smartLocator.timeoutMs, 1500);
  assert.equal(config.retry.maxAttempts, 4);
});
