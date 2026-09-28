import { test, expect } from '@playwright/test';
import {
  SmartLocator,
  captureFailureDiagnostics,
  createConfig,
} from '@sdetflow/playwright';

const config = createConfig({
  smartLocator: { timeoutMs: 1_500 },
  artifacts: { screenshotOnFailure: true, includeDom: false },
});

test('example SDETFlow integration', async ({ page }, testInfo) => {
  try {
    await page.goto('https://example.com');

    const locator = new SmartLocator(page, {
      policy: config.smartLocator,
      redaction: config.redaction,
    });

    await locator.click({
      description: 'Example link',
      role: 'link',
      roleName: 'More information',
      text: 'More information',
    });

    await expect(page).toHaveURL(/iana/);
  } catch (error) {
    await captureFailureDiagnostics({ page, testInfo, error }, config);
    throw error;
  }
});
