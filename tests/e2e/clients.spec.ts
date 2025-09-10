import { expect, test } from '@playwright/test';

test('get-create-delete-clients', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill('test-user');
  await page.getByLabel('Passwort').fill('test-pass');

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('clients');

  // check that we have 7 clients from the seed data by test id starting with client-row-*
  await expect(page.getByTestId(/client-row-.*/)).toHaveCount(7);

  // create a new client
  await page.getByTestId('button-client-create').click();

  await page.getByLabel('Vorname').fill('Test');
  await page.getByLabel('Nachname').fill('Client');
  await page.getByLabel('PLZ').fill('12345');
  await page.getByLabel('Stadt').fill('Test City');
  await page.getByLabel('Straße').fill('Test St 10');
  await page.getByLabel('E-Mail').fill('test.client@example.com');
  await page.getByTestId('button-client-save').click();

  // check that we have 8 clients now
  await expect(page.getByTestId(/client-row-.*/)).toHaveCount(8);

  // check that the last client has the correct data
  const lastClient = page.getByTestId(/client-row-.*/).first();
  await expect(lastClient.getByTestId(/client-number-.*/)).toHaveText('K8');
  await expect(lastClient.getByTestId(/client-first-name-.*/)).toHaveText(
    'Test',
  );
  await expect(lastClient.getByTestId(/client-last-name-.*/)).toHaveText(
    'Client',
  );
  await expect(lastClient.getByTestId(/client-email-.*/)).toHaveText(
    'test.client@example.com',
  );

  // hover the row first to see the delete button
  await lastClient.hover();
  // delete this client
  await lastClient.getByTestId(/button-client-delete-.*/).click();
  await page.getByTestId('button-client-delete-confirm').click();

  // check that we have 7 clients now
  await expect(page.getByTestId(/client-row-.*/)).toHaveCount(7);

  // check that the first client is the one with client number K7
  const firstClient = page.getByTestId(/client-row-.*/).first();
  await expect(firstClient.getByTestId(/client-number-.*/)).toHaveText('K7');

  // open first client for editing
  await firstClient.click();

  // change first name
  await page.getByLabel('Vorname').fill('ChangedName');
  await page.getByTestId('button-client-save').click();

  // check that the first client's first name is changed
  await expect(firstClient.getByTestId(/client-first-name-.*/)).toHaveText(
    'ChangedName',
  );
});
