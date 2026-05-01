import { test, expect } from '@playwright/test';

import { dismissCookieBanner } from './helpers/cookie-consent';
import { TEST_EMAIL, TEST_PASSWORD } from './helpers/auth-credentials';
import { submitCheckoutForm } from './helpers/checkout-form';

test.describe('Exploration Report Anomalies & Observations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test.fail('Anomaly: Missing Category (In Footer > Shop)', async ({ page }) => {
    // Navigate directly to products page
    await page.goto('/products');

    // Scroll to footer
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();

    // Get the number of categories from the product filter (excluding "All")
    const categoryChips = page.locator('[data-testid^="category-chip-"]:not([data-testid="category-chip-all"])');
    const expectedCategoryCount = await categoryChips.count();

    // Get the number of specific category links in the footer's Shop column (excluding "All products")
    const shopCol = footer.locator('div.container > div > div').filter({ has: page.locator('h3', { hasText: 'Shop', exact: true }) });
    const footerShopLinks = shopCol.getByRole('link').filter({ hasNotText: 'All products' });
    const footerCategoryCount = await footerShopLinks.count();

    // Verify the number of categories in the footer matches the products page
    // "Home & Living" is missing in the footer. This assertion SHOULD FAIL if the bug is present.
    expect(footerCategoryCount, "The number of categories in the footer does not match the number of categories on the products page.").toBe(expectedCategoryCount);
  });

  test.fail('Anomaly: No Working Links (In Footer > Shop)', async ({ page }) => {
    // Navigate directly to products page
    await page.goto('/products');

    // Scroll to footer
    const footer = page.getByTestId('footer');
    await footer.scrollIntoViewIfNeeded();

    // Get the number of specific category links in the footer's Shop column (excluding "All products")
    const shopCol = footer.locator('div.container > div > div').filter({ has: page.locator('h3', { hasText: 'Shop', exact: true }) });
    const footerShopLinks = shopCol.getByRole('link').filter({ hasNotText: 'All products' });

    const linkCount = await footerShopLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const link = footerShopLinks.nth(i);
      const linkUrl = await link.getAttribute('href') as string;

      // Get the page heading before clicking the link
      const prevHeadingText = await page.getByRole('heading', { level: 1 }).textContent() as string;

      await link.click();

      // The URL should change to the category URL
      await expect(page).toHaveURL(linkUrl);

      // The page heading should update to reflect the category
      const heading = page.getByRole('heading', { level: 1 });

      // Scroll the page heading into view if needed
      await heading.scrollIntoViewIfNeeded();

      // This assertion SHOULD FAIL if the bug is present
      await expect(heading, "Page heading did not update after clicking category link").not.toHaveText(prevHeadingText);
    }
  });

  test.fail('Anomaly: Disappearing Account Menu (In the Header)', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'This bug is specific to desktop hover behavior');

    const accountTrigger = page.getByTestId('account-menu');
    const loginLink = page.getByTestId('account-menu-login');

    // Hover the account trigger to open the menu
    await accountTrigger.hover();
    await expect(loginLink).toBeVisible();

    // Attempt to move the mouse to the login link
    const triggerBox = await accountTrigger.boundingBox();
    const linkBox = await loginLink.boundingBox();

    if (triggerBox && linkBox) {
      // Move mouse from top of trigger to top of link
      await page.mouse.move(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);

      // Move mouse slowly to the login link
      await page.mouse.move(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2, { steps: 5 });

      // If the bug is present, the menu will disappear while crossing the gap
      await expect(loginLink, "The menu does not show after the mouse hover").toBeVisible();
    }
  });

  test.fail('Anomaly: Prices Difference (In Cart Panel)', async ({ page }) => {
    await page.goto('/products');

    // Add item to cart
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

    await page.getByTestId('cart-button').click();

    // Capture line item totals in the cart drawer
    const lineTotalElements = page.locator('[data-testid^="cart-line-total-"]');
    const lineTotalCount = await lineTotalElements.count();

    let lineItemTotals: number = 0;

    // Dismiss the toast
    await page.getByTestId("toast").locator("button").click();

    // Wait for the cart panel to be fully visible
    await lineTotalElements.first().waitFor({ state: 'visible' });

    for (let i = 0; i < lineTotalCount; i++) {
      const txt = await lineTotalElements.nth(i).textContent();
      const val = parseFloat(txt?.replace('$', '') || '0');
      lineItemTotals += val;
    }

    // Get total
    const totalText = await page.getByTestId('cart-drawer-total').textContent();
    const total = parseFloat(totalText?.replace('$', '') || '0');

    // This assertion SHOULD FAIL if the bug is present
    expect(total, "The total in the cart drawer does not match the sum of the line item totals.").toBeCloseTo(lineItemTotals, 2);
  });

  test.fail('Observation: Order Details (In Account Page)', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    // Add item & checkout
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

    await page.getByTestId('cart-button').click();

    const checkoutBtnDrawer = page.getByTestId('cart-drawer-checkout');
    await checkoutBtnDrawer.click();

    await submitCheckoutForm(page);

    const orderNumberText = await page.locator('text=Order number:').textContent();
    const orderNumber = orderNumberText?.replace('Order number: ', '').trim();

    await page.getByRole('link', { name: 'View account' }).click();
    const orderInHistory = page.getByText(orderNumber as string);
    await expect(orderInHistory).toBeVisible();

    // Test if it's clickable (Observation)
    const orderContainer = orderInHistory.locator('..');
    const isLink = await orderContainer.evaluate((node) => node.tagName === 'A' || node.closest('a') !== null);

    // Expected to fail if not implemented
    expect(isLink, 'Expected order history item to be clickable to view details').toBe(true);
  });
});
