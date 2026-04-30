import { test, expect } from '@playwright/test';

import { dismissCookieBanner } from './helpers/cookie-consent';
import { submitCheckoutForm } from './helpers/checkout-form';
import { TEST_EMAIL, TEST_PASSWORD } from './helpers/auth-credentials';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    await page.goto('/products');
    const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: 'In stock' }).first();
    if (await productCard.getByRole('link', { name: 'Choose options' }).isVisible()) {
      await productCard.click();
      const sizeButtons = page.getByRole('button', { name: /XS|S|M|L|XL/ });
      if (await sizeButtons.count() > 0) {
        await sizeButtons.first().click();
      }
      await page.getByRole('button', { name: 'Add to cart' }).click();
    } else {
      await productCard.getByRole('button', { name: 'Add to cart' }).click();
    }
  });

  test('can complete an order end-to-end and see it in order history', async ({ page }) => {
    await page.getByTestId('cart-button').click();

    const checkoutBtnDrawer = page.getByTestId('cart-drawer-checkout');
    await checkoutBtnDrawer.click();

    await submitCheckoutForm(page);

    await expect(page).toHaveURL(/\/confirmation\/ORDER\-.+/);
    await expect(page.getByRole('heading', { name: 'Order placed — thank you!' })).toBeVisible();

    const orderNumberText = await page.getByTestId('confirmation-order-id').textContent();
    const orderNumber = orderNumberText?.trim();
    expect(orderNumber).toBeTruthy();

    await page.getByRole('link', { name: 'View account' }).click();
    await expect(page).toHaveURL(/\/account/);

    const orderInHistory = page.getByText(orderNumber as string);
    await expect(orderInHistory).toBeVisible();
  });

  test.describe('Shipping form — required fields', () => {
    test('shows error when full name is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('ship-name').click();
      await page.getByTestId('ship-name').press('Tab');

      await expect(page.getByTestId('ship-name-error')).toBeVisible();
      await expect(page.getByTestId('ship-name-error')).toHaveText('Full name is required');
    });

    test('shows error when address line 1 is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('ship-address1').click();
      await page.getByTestId('ship-address1').press('Tab');

      await expect(page.getByTestId('ship-address1-error')).toBeVisible();
      await expect(page.getByTestId('ship-address1-error')).toHaveText('Address is required');
    });

    test('shows error when city is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('ship-city').click();
      await page.getByTestId('ship-city').press('Tab');

      await expect(page.getByTestId('ship-city-error')).toBeVisible();
      await expect(page.getByTestId('ship-city-error')).toHaveText('City is required');
    });

    test('shows error when ZIP code is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('ship-zip').click();
      await page.getByTestId('ship-zip').press('Tab');

      await expect(page.getByTestId('ship-zip-error')).toBeVisible();
      await expect(page.getByTestId('ship-zip-error')).toHaveText('ZIP / postal code is required');
    });

    test('shows error when country is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('ship-country').click();
      await page.getByTestId('ship-country').press('Tab');

      await expect(page.getByTestId('ship-country-error')).toBeVisible();
      await expect(page.getByTestId('ship-country-error')).toHaveText('Country is required');
    });
  });

  test.describe('Payment form — required fields', () => {
    test('shows error when cardholder name is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('pay-name').click();
      await page.getByTestId('pay-name').press('Tab');

      await expect(page.getByTestId('pay-name-error')).toBeVisible();
      await expect(page.getByTestId('pay-name-error')).toHaveText('Cardholder name is required');
    });

    test('shows error when card number is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('pay-number').click();
      await page.getByTestId('pay-number').press('Tab');

      await expect(page.getByTestId('pay-number-error')).toBeVisible();
      await expect(page.getByTestId('pay-number-error')).toHaveText('Card number is required');
    });

    test('shows error when expiry is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('pay-expiry').click();
      await page.getByTestId('pay-expiry').press('Tab');

      await expect(page.getByTestId('pay-expiry-error')).toBeVisible();
      await expect(page.getByTestId('pay-expiry-error')).toHaveText('Expiry is required');
    });

    test('shows error when CVC is left empty', async ({ page }) => {
      await page.getByTestId('cart-button').click();
      await page.getByTestId('cart-drawer-checkout').click();
      await expect(page).toHaveURL(/\/checkout/);

      await page.getByTestId('pay-cvc').click();
      await page.getByTestId('pay-cvc').press('Tab');

      await expect(page.getByTestId('pay-cvc-error')).toBeVisible();
      await expect(page.getByTestId('pay-cvc-error')).toHaveText('CVC is required');
    });
  });
});
