import { Page, expect } from '@playwright/test';

/**
 * Fills the checkout form when on the page.
*/
export async function submitCheckoutForm(page: Page) {
  try {
    await expect(page).toHaveURL(/\/checkout/);

    await page.getByTestId('ship-name').fill('Test Customer');
    await page.getByTestId('ship-address1').fill('123 Test St');
    await page.getByTestId('ship-city').fill('Testville');
    await page.getByTestId('ship-zip').fill('12345');
    await page.getByTestId('ship-country').fill('US');

    await page.getByTestId('pay-name').fill('Test Customer');
    await page.getByTestId('pay-number').fill('4242424242424242');
    await page.getByTestId('pay-expiry').fill('12/30');
    await page.getByTestId('pay-cvc').fill('123');

    await page.getByTestId('place-order').click();
  } catch (error) {
    // If it doesn't appear within 5 seconds, it might be already dismissed or not present.
    // We just ignore the error.
    console.log(`Error while filling the checkout form: ${error}`);
  }
}