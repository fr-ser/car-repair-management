import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

test('create-view-delete-document', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  // Navigate to orders and create a fresh order
  await page.goto('orders');
  await page.waitForTimeout(500);

  await page.getByTestId('button-order-create').click();

  const uniqueTitle = `DocTest Auftrag ${Date.now()}`;
  await page.getByLabel('Titel').fill(uniqueTitle);

  await page
    .getByRole('group', { name: /Auftragsdatum/ })
    .getByRole('spinbutton')
    .first()
    .click();
  await page.keyboard.type('17032026');

  await page.getByTestId('order-autocomplete-car').fill('TEST-PW');
  await page.waitForSelector('[role="listbox"]');
  await page
    .getByRole('option', { name: /TEST-PW/ })
    .first()
    .click();

  await page.getByTestId('order-autocomplete-client').fill('Test First 1');
  await page.waitForSelector('[role="listbox"]');
  await page
    .getByRole('option', { name: /Test First 1/ })
    .first()
    .click();

  await page.getByTestId('button-order-save').click();
  await page.waitForTimeout(500);

  // Open the newly created order
  const newRow = page.getByTestId(/order-row-.*/).first();
  await newRow.click();

  // Save as invoice
  await page.getByTestId('button-order-save-as-invoice').click();

  // Should redirect to /documents/:id
  await expect(page).toHaveURL(/\/documents\/\d+/);

  // Document view should show car license plate
  await expect(
    page.getByText('TEST-PW', { exact: false }).first(),
  ).toBeVisible();

  // Navigate to documents list
  await page.goto('documents');
  await page.waitForTimeout(500);

  // Document should appear in list
  await expect(page.getByTestId(/document-row-.*/)).toHaveCount(
    await page.getByTestId(/document-row-.*/).count(),
  );
  const docRow = page.getByTestId(/document-row-.*/).first();
  await expect(docRow).toBeVisible();

  // Delete the document
  await docRow.hover();
  await docRow.getByTestId(/button-document-delete-.*/).click();
  await page.getByTestId('confirm-dialog-button-confirm').click();
  await page.waitForTimeout(500);

  // Document should be gone (or count reduced)
  await expect(page.getByTestId(/document-row-.*/)).toHaveCount(0);

  // Cleanup: delete the test order
  await page.goto('orders');
  await page.waitForTimeout(500);
  const orderRow = page
    .getByTestId(/order-row-.*/)
    .filter({ hasText: uniqueTitle });
  await orderRow.hover();
  await orderRow.getByTestId(/button-order-delete-.*/).click();
  await page.getByTestId('confirm-dialog-button-confirm').click();
});
