import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

test('register-login', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();
});
