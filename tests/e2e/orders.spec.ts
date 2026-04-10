import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

test('create-edit-delete-order', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('articles');
  const initialArticleAmount = Number(
    await page.getByTestId('article-amount-ART-PW1').textContent(),
  );

  await page.goto('orders');

  // CREATE
  const uniqueTitle = `Auftrag ${Date.now()}`;
  await page.getByTestId('button-order-create').click();

  await page.getByLabel('Titel').fill(uniqueTitle);
  // Click the Day spinbutton explicitly to avoid landing on Month or Year
  await page
    .getByRole('group', { name: /Auftragsdatum/ })
    .getByRole('spinbutton')
    .first()
    .click();
  await page.keyboard.type('23022026');

  // select car via autocomplete
  await page.getByTestId('order-autocomplete-car').fill('TEST-PW');
  await page.waitForSelector('[role="listbox"]');
  await page
    .getByRole('option', { name: /TEST-PW/ })
    .first()
    .click();

  // select client via autocomplete
  await page.getByTestId('order-autocomplete-client').fill('Test First 1');
  await page.waitForSelector('[role="listbox"]');
  await page
    .getByRole('option', { name: /Test First 1/ })
    .first()
    .click();

  await page.getByTestId('button-order-save').click();
  await expect(
    page.getByTestId(/order-row-.*/).filter({ hasText: uniqueTitle }),
  ).toHaveCount(1);

  // EDIT — open the newly created order (first in list)
  const newRow = page.getByTestId(/order-row-.*/).first();
  await newRow.click();
  const updatedTitle = `Updated Auftrag ${Date.now()}`;
  await page.getByLabel('Titel').fill(updatedTitle);

  // add a heading
  await page.getByRole('button', { name: 'Überschrift hinzufügen' }).click();
  await page.getByTestId('position-text-0').fill('Arbeiten');

  // add an item based on an existing article
  await page.getByRole('button', { name: 'Position hinzufügen' }).click();
  await page.getByTestId('position-article-1').fill('ART-PW1');
  await page.waitForSelector('[role="listbox"]');
  await page
    .getByRole('option', { name: /ART-PW1/ })
    .first()
    .click();
  await page.getByLabel('Menge').nth(0).fill('2');

  // add a free item (no article)
  await page.getByRole('button', { name: 'Position hinzufügen' }).click();
  await page.getByTestId('position-description-2').fill('Manuelle Position');
  await page.getByLabel('Preis/Einheit').nth(1).fill('50');
  await page.getByLabel('Menge').nth(1).fill('1');

  await page.getByTestId('button-order-save').click();
  await expect(page.getByTestId(/order-row-.*/).first()).toContainText(
    updatedTitle,
  );

  // check that the article inventory was reduced by the ordered amount
  await page.goto('articles');
  await page.waitForTimeout(500);
  await expect(page.getByTestId('article-amount-ART-PW1')).toHaveText(
    String(initialArticleAmount - 2),
  );

  await page.goto('orders');
  await page.waitForTimeout(500);

  // DELETE
  const rowToDelete = page
    .getByTestId(/order-row-.*/)
    .filter({ hasText: updatedTitle });
  await rowToDelete.hover();
  await rowToDelete.getByTestId(/button-order-delete-.*/).click();
  await page.getByTestId('confirm-dialog-button-confirm').click();
  await expect(
    page.getByTestId(/order-row-.*/).filter({ hasText: updatedTitle }),
  ).toHaveCount(0);
});
