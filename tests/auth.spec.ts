import { test, expect } from '@playwright/test';

import { dismissCookieBanner } from './helpers/cookie-consent';
import { TEST_EMAIL, TEST_PASSWORD } from './helpers/auth-credentials';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('can register a new account', async ({ page }) => {
    await page.goto('/register');

    await page.getByTestId('register-name').fill('Playwright Tester');
    await page.getByTestId('register-email').fill(`test-${Date.now()}@example.com`);
    await page.getByTestId('register-password').fill('Password123!');
    await page.getByTestId('register-confirm').fill('Password123!');

    await page.getByTestId('register-submit').click();

    await expect(page.getByTestId('account-menu')).toContainText('Playwright');
  });

  test('can login with valid credentials and logout', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('account-menu')).toContainText('Test');

    const isMobile = await page.evaluate(() => window.innerWidth < 768);
    if (isMobile) {
      await page.getByTestId('account-menu').click();
    } else {
      await page.getByTestId('account-menu').hover();
    }

    await page.getByRole('menuitem', { name: 'Log out' }).click({ force: true });

    await expect(page.getByTestId('account-menu')).toContainText('Account');
  });

  test('shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill('test@example.com');
    await page.getByTestId('login-password').fill('WrongPassword!');
    await page.getByTestId('login-submit').click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
});
