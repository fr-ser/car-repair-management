import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

test('get-create-delete-clients', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('clients');

  // Wait for clients to be loaded before counting
  await page.waitForSelector('[data-testid*="client-row-"]');
  const initialClientCount = await page.getByTestId(/client-row-.*/).count();

  // create a new client
  const uniqueLastname = `Last${Date.now()}`;
  await page.getByTestId('button-client-create').click();

  await page.getByLabel('Vorname').fill('Test');
  await page.getByLabel('Nachname').fill(uniqueLastname);
  await page.getByLabel('PLZ').fill('12345');
  await page.getByLabel('Stadt').fill('Test City');
  await page.getByLabel('Straße').fill('Test St 10');
  await page.getByLabel('Firma').fill('Test Company');
  await page.getByTestId('button-client-save').click();

  await expect(page.getByTestId(/client-row-.*/)).toHaveCount(
    initialClientCount + 1,
  );

  // check that the last client has the correct data
  const lastClient = page.getByTestId(/client-row-.*/).first();
  await expect(lastClient.getByTestId(/client-name-.*/)).toHaveText(
    'Test ' + uniqueLastname,
  );
  await expect(lastClient.getByTestId(/client-company-.*/)).toHaveText(
    'Test Company',
  );

  // hover the row first to see the delete button
  await lastClient.hover();
  // delete this client
  await lastClient.getByTestId(/button-client-delete-.*/).click();
  await page.getByTestId('button-client-delete-confirm').click();

  await expect(page.getByTestId(/client-row-.*/)).toHaveCount(
    initialClientCount,
  );

  // check that the first client is the one with client number K7
  const firstClient = page.getByTestId(/client-row-.*/).first();
  await expect(firstClient.getByTestId(/client-name-.*/)).not.toContainText(
    uniqueLastname,
  );

  // open first client for editing
  await firstClient.click();

  // change first name
  await page.getByLabel('Vorname').fill('ChangedName');
  await page.getByTestId('button-client-save').click();

  // check that the first client's first name is changed
  await expect(firstClient.getByTestId(/client-name-.*/)).toContainText(
    'ChangedName',
  );
});
