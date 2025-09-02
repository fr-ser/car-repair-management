import { expect, test } from '@playwright/test';

test('register-login', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill('test-user');
  await page.getByLabel('Passwort').fill('test-pass');

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();
});
