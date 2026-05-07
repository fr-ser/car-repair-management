import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

test('view-pending-orders-overview', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('overview');

  // "Offene Aufträge" tab should be visible
  await expect(
    page.getByRole('tab', { name: 'Offene Aufträge' }),
  ).toBeVisible();

  // The seeded in-progress order must appear in the pending orders table
  await expect(page.getByText('Test Order 2')).toBeVisible();
});
