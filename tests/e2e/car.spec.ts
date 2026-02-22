import { expect, test } from '@playwright/test';

import { PASS_WORD, USER_NAME } from './config';

const SEED_DATA_CLIENT_FIRST_NAME = 'Car Assignment';

test('assign-owner-to-car-and-see-it-under-client', async ({ page }) => {
  await page.goto('login');

  await page.getByLabel('Benutzername').fill(USER_NAME);
  await page.getByLabel('Passwort').fill(PASS_WORD);

  await page.getByTestId('login-button').click();

  // not visible because of a redirect
  await expect(page.getByTestId('login-button')).not.toBeVisible();

  await page.goto('cars');

  // create a new car
  const uniquePlate = `PW-${Date.now()}`;
  await page.getByTestId('button-car-create').click();

  await page.getByLabel('Kennzeichen').fill(uniquePlate);
  await page.getByLabel('Hersteller').fill('TestMarke');
  await page.getByLabel('Modell').fill('TestModell');

  // assign owner: click button, search for client, select, confirm
  await page.getByTestId('button-car-assign-owner').click();

  await page
    .getByTestId('owner-autocomplete')
    .fill(SEED_DATA_CLIENT_FIRST_NAME);
  await page.waitForSelector('[role="listbox"]');
  await page
    .getByRole('option', { name: new RegExp(SEED_DATA_CLIENT_FIRST_NAME) })
    .first()
    .click();

  await page.getByTestId('button-owner-save').click();

  // the owner card should now show the client name
  await expect(page.getByTestId('owner-card')).toContainText(
    SEED_DATA_CLIENT_FIRST_NAME,
  );

  // save the car
  await page.getByTestId('button-car-save').click();

  // navigate to clients and open the first seeded client
  await page.goto('clients');

  await page.waitForSelector('[data-testid*="client-row-"]');

  const targetClient = page
    .getByTestId(/client-row-.*/)
    .filter({ hasText: SEED_DATA_CLIENT_FIRST_NAME });
  await targetClient.click();

  // wait for the Fahrzeuge list to show the car
  await expect(page.getByText(uniquePlate)).toBeVisible();
});
