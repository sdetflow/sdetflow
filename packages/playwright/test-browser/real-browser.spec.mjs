import { test, expect } from '@playwright/test';
import { createConfig, SdetFlowSession } from '../dist/index.js';

test('smart locator works against a real Playwright Page', async ({ page }, testInfo) => {
  await page.setContent(`
    <main>
      <label for="name">Name</label><input id="name" data-testid="name-input" />
      <button aria-label="Submit order">Submit</button>
    </main>
  `);
  const flow = new SdetFlowSession(page, createConfig());
  await flow.locator.fill({ testId: 'name-input', label: 'Name' }, 'SDETFlow');
  await flow.locator.click({ role: 'button', roleName: 'Submit order', text: 'Submit' });
  await expect(page.getByTestId('name-input')).toHaveValue('SDETFlow');
  flow.evidence.console('browser-integration-ok');
  const evidence = flow.evidence.snapshot();
  expect(evidence.locators.length).toBe(2);
});

test('failure diagnostics attach metadata and screenshot to real testInfo', async ({ page }, testInfo) => {
  await page.setContent('<h1>Safe failure fixture</h1>');
  const flow = new SdetFlowSession(page, createConfig({ artifacts: { screenshotOnFailure: true } }));
  const out = await flow.onFailure(new Error('fixture password=secret'), testInfo);
  expect(out.capture.metadataAttached).toBeTruthy();
  expect(out.capture.screenshotAttached).toBeTruthy();
  expect(JSON.stringify(out.capture.context)).not.toContain('secret');
});
