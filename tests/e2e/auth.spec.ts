import { expect, test } from '@playwright/test';

test('register-login', async ({ page }) => {
  await page.goto('login');

  await page.getByTestId('user-name-input').fill('test-user');
  await page.getByTestId('user-password-input').fill('test-pass');

  await page.getByTestId('user-login-button').click();

  const loggedInText = page.getByText('You are logged in, CONGRATS!');
  await expect(loggedInText).toBeVisible();
});
