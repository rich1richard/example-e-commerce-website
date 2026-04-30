import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './helpers/cookie-consent';

test.describe('Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('homepage loads and displays hero section', async ({ page }) => {
    await expect(page).toHaveTitle(/Northwind Goods/);
    await expect(page.getByRole('heading', { name: 'Goods made well, shipped slow.' })).toBeVisible();
    await expect(page.getByTestId('hero-shop-cta')).toBeVisible();
  });

  test('can navigate to shop and view product listing', async ({ page }) => {
    await page.getByTestId('nav-products').click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: 'All products' })).toBeVisible();

    // Check if products are loaded
    const productCards = page.locator('[data-testid^="product-card-"]');
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test('can search and filter products', async ({ page }) => {
    await page.goto('/products');

    // Search
    const searchInput = page.getByTestId('search-input');
    await searchInput.fill('Tee');

    // Wait for debounce or immediate update
    await expect(page.locator('[data-testid^="product-card-"]').first()).toContainText('Tee', { ignoreCase: true });

    // Clear the search input
    await searchInput.clear();

    // Filter by category
    await page.getByRole('button', { name: 'Accessories' }).click();

    // Validate filter applied
    await expect(page.locator('[data-testid^="product-card-"]').first()).toBeVisible();
  });
});
