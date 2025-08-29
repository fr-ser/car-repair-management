import { expect, test } from '@playwright/test';

test('register-login', async ({ page }) => {
  await page.goto('register');

  await page.getByTestId('user-email-input').fill('test@test.test');
  await page.getByTestId('user-username-input').fill('test');
  await page.getByTestId('user-password-input').fill('test');

  await page.getByTestId('user-register-button').click();

  await page.goto('login');

  await page.getByTestId('user-email-input').fill('test@test.test');
  await page.getByTestId('user-password-input').fill('test');

  await page.getByTestId('user-login-button').click();

  const loggedInText = await page.getByText('You are logged in, CONGRATS!');
  await expect(loggedInText).toBeVisible();
});
