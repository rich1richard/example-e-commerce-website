import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './helpers/cookie-consent';

test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

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

  test('can update quantities and remove items', async ({ page }) => {
    await page.getByTestId('cart-button').click();

    const viewCartBtn = page.getByTestId('cart-drawer-view');
    await viewCartBtn.click();

    await expect(page).toHaveURL(/\/cart/);
    const cartView = page.getByTestId('page-cart');


    // Increase quantity
    const qtyInput = cartView.getByLabel('Quantity', { exact: true });
    const increaseBtn = cartView.getByLabel('Increase quantity', { exact: true });

    await increaseBtn.click();
    await expect(qtyInput).toHaveValue('2');

    // Decrease quantity
    const decreaseBtn = cartView.getByLabel('Decrease quantity', { exact: true });

    await decreaseBtn.click();
    await expect(qtyInput).toHaveValue('1');

    // Remove item
    await cartView.getByRole('button', { name: 'Remove' }).click();

    await expect(cartView.getByText('Your cart is empty')).toBeVisible();
  });

  test('can apply a promo code', async ({ page }) => {
    await page.getByTestId('cart-button').click();
    const viewCartBtn = page.getByTestId('cart-drawer-view');
    await viewCartBtn.click();

    await page.getByTestId('promo-input').fill('WELCOME10');
    await page.getByTestId('promo-apply').click();

    await expect(page.getByTestId('promo-applied')).toBeVisible();
  });
});
