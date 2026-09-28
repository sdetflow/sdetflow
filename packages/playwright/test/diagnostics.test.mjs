import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiagnosticContext, captureFailureDiagnostics, createConfig } from '../dist/index.js';

test('diagnostic context redacts error and URL secrets', async () => {
  const context = await buildDiagnosticContext({
    page: { url: () => 'https://example.test/?api_key=SECRET', title: async () => 'Checkout' },
    testInfo: { title: 'checkout', status: 'failed', expectedStatus: 'passed' },
    error: new Error('Authorization: Bearer TOKEN'),
  });
  assert.equal(JSON.stringify(context).includes('SECRET'), false);
  assert.equal(JSON.stringify(context).includes('TOKEN'), false);
  assert.equal(context.redactionApplied, true);
});

test('DOM is excluded by default', async () => {
  const context = await buildDiagnosticContext({ page: { content: async () => '<html>secret</html>' } });
  assert.equal('dom' in context, false);
});

test('DOM can be explicitly included and redacted', async () => {
  const context = await buildDiagnosticContext({
    page: { content: async () => '<input password=hunter2>' },
  }, {}, true);
  assert.equal(context.dom.includes('hunter2'), false);
});

test('capture attaches metadata and screenshot while keeping DOM off', async () => {
  const attachments = [];
  const result = await captureFailureDiagnostics({
    page: {
      url: () => 'https://example.test',
      title: async () => 'Example',
      screenshot: async () => new Uint8Array([1, 2, 3]),
      content: async () => '<html></html>',
    },
    testInfo: {
      status: 'failed', expectedStatus: 'passed',
      attach: async (name, options) => attachments.push([name, options.contentType]),
    },
  }, createConfig());
  assert.equal(result.metadataAttached, true);
  assert.equal(result.screenshotAttached, true);
  assert.equal(result.domAttached, false);
  assert.deepEqual(attachments.map((a) => a[0]), ['sdetflow-diagnostic.json', 'sdetflow-failure.png']);
});

test('artifact failure is isolated as warning', async () => {
  const result = await captureFailureDiagnostics({
    page: { screenshot: async () => { throw new Error('browser gone'); } },
    testInfo: { attach: async () => {} },
  }, createConfig());
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /browser gone/);
});
