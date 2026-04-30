import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './helpers/cookie-consent';

test.describe('Product Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);
  });

  test('can view product detail, check stock and select options', async ({ page }) => {
    const productCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: 'In stock' }).first();
    const productTitle = await productCard.locator('div > a').first().textContent();

    await productCard.click();

    await expect(page).toHaveURL(/\/products?\//);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(productTitle!);

    await expect(page.getByTestId('stock-badge').first()).toBeVisible();

    const sizeButtons = page.getByRole('button', { name: /XS|S|M|L|XL/ });
    if (await sizeButtons.count() > 0) {
      await sizeButtons.first().click();
    }

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await expect(page.getByTestId('cart-badge')).toBeVisible();
  });
});
