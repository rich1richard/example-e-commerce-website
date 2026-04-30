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
});
