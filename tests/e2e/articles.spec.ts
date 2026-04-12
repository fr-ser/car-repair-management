import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

test('get-create-edit-delete-article', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('articles');

  // Wait for articles to be loaded (or empty table)
  await page.waitForTimeout(500);
  const initialArticleCount = await page.getByTestId(/article-row-.*/).count();

  // create a new article
  const uniqueId = `ART${Date.now()}`;
  const uniqueDescription = `Test Artikel ${Date.now()}`;

  await page.getByTestId('button-article-create').click();

  await page.getByLabel('Artikel-Nr').fill(uniqueId);
  await page.getByLabel('Bezeichnung').fill(uniqueDescription);
  await page.getByLabel('Preis / Einheit').fill('12,50');
  await page.getByTestId('button-article-save').click();
  await page.keyboard.press('Escape');

  await expect(page.getByTestId(/article-row-.*/)).toHaveCount(
    initialArticleCount + 1,
  );

  // check that the new article appears with correct data
  const newRow = page.getByTestId(`article-row-${uniqueId}`);
  await expect(newRow.getByTestId(`article-id-${uniqueId}`)).toHaveText(
    uniqueId,
  );
  await expect(
    newRow.getByTestId(`article-description-${uniqueId}`),
  ).toHaveText(uniqueDescription);

  // edit the article: change description
  await newRow.click();

  const updatedDescription = `Updated Artikel ${Date.now()}`;
  await page.getByLabel('Bezeichnung').click({ clickCount: 3 });
  await page.getByLabel('Bezeichnung').fill(updatedDescription);
  await page.getByTestId('button-article-save').click();
  await page.keyboard.press('Escape');

  await expect(page.getByTestId(`article-description-${uniqueId}`)).toHaveText(
    updatedDescription,
  );

  // hover row and delete
  const rowToDelete = page.getByTestId(`article-row-${uniqueId}`);
  await rowToDelete.hover();
  await rowToDelete.getByTestId(`button-article-delete-${uniqueId}`).click();
  await page.getByTestId('confirm-dialog-button-confirm').click();

  await expect(page.getByTestId(/article-row-.*/)).toHaveCount(
    initialArticleCount,
  );
});
