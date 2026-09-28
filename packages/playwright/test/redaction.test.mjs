import test from 'node:test';
import assert from 'node:assert/strict';
import { redactText, redactUnknown } from '../dist/index.js';

test('redacts bearer authorization token', () => {
  const value = redactText('Authorization: Bearer abc.def.123');
  assert.equal(value.includes('abc.def.123'), false);
  assert.match(value, /\[REDACTED\]/);
});

test('redacts password and api key values', () => {
  const value = redactText('password=hunter2 api_key=abcdef');
  assert.equal(value.includes('hunter2'), false);
  assert.equal(value.includes('abcdef'), false);
});

test('email redaction is opt-in', () => {
  assert.match(redactText('mail me at qa@example.com'), /qa@example\.com/);
  assert.equal(redactText('mail me at qa@example.com', { redactEmails: true }).includes('qa@example.com'), false);
});

test('custom patterns redact project-specific identifiers', () => {
  const value = redactText('CUSTOM-SECRET-123', { customPatterns: [/CUSTOM-SECRET-\d+/] });
  assert.equal(value, '[REDACTED]');
});

test('redactUnknown masks secret keys recursively', () => {
  const value = redactUnknown({ user: 'sumanth', auth: { accessToken: 'abc', safe: 'ok' } });
  assert.deepEqual(value, { user: 'sumanth', auth: { accessToken: '[REDACTED]', safe: 'ok' } });
});
