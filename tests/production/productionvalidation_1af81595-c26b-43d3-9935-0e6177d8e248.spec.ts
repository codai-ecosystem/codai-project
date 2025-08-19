
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('ProductionValidation_2025-08-08', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://memorai-alb-prod-2014965749.eu-central-1.elb.amazonaws.com');
});