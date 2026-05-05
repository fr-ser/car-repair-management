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

  // Close the dialog (save keeps it open by design)
  await page.getByRole('button', { name: 'Schließen' }).click();

  // Open the newly created order
  const newRow = page
    .getByTestId(/order-row-.*/)
    .filter({ hasText: uniqueTitle });
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

  // The invoice row must be visible — filter by type label to avoid matching the offer test running in parallel
  const docRow = page
    .getByTestId(/document-row-.*/)
    .filter({ hasText: 'Rechnung' });
  await expect(docRow).toBeVisible();

  // Delete the document
  await docRow.hover();
  await docRow.getByTestId(/button-document-delete-.*/).click();
  await page.getByTestId('confirm-dialog-button-confirm').click();
  await page.waitForTimeout(500);

  await expect(docRow).not.toBeVisible();

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

test('create-offer-document', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('orders');
  await page.waitForTimeout(500);

  await page.getByTestId('button-order-create').click();

  const uniqueTitle = `OfferTest Auftrag ${Date.now()}`;
  await page.getByLabel('Titel').fill(uniqueTitle);

  await page
    .getByRole('group', { name: /Auftragsdatum/ })
    .getByRole('spinbutton')
    .first()
    .click();
  await page.keyboard.type('05052026');

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

  await page.getByRole('button', { name: 'Schließen' }).click();

  const newRow = page
    .getByTestId(/order-row-.*/)
    .filter({ hasText: uniqueTitle });
  await newRow.click();

  // Save as offer (Kostenvoranschlag) instead of invoice
  await page.getByTestId('button-order-save-as-offer').click();

  // Should redirect to /documents/:id
  await expect(page).toHaveURL(/\/documents\/\d+/);

  // Document view should show car license plate
  await expect(
    page.getByText('TEST-PW', { exact: false }).first(),
  ).toBeVisible();

  // Cleanup: navigate to documents list and delete the offer
  await page.goto('documents');
  await page.waitForTimeout(500);

  const docRow = page
    .getByTestId(/document-row-.*/)
    .filter({ hasText: 'Kostenvoranschlag' });
  await expect(docRow).toBeVisible();

  await docRow.hover();
  await docRow.getByTestId(/button-document-delete-.*/).click();
  await page.getByTestId('confirm-dialog-button-confirm').click();
  await page.waitForTimeout(500);

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
