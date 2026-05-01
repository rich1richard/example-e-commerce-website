import { Page } from '@playwright/test';

/**
 * Dismisses the Secure Privacy cookie banner if it appears.
 */
export async function dismissCookieBanner(page: Page) {
  // The site uses the Secure Privacy cookie banner.
  // We need to wait for it and accept/dismiss it.
  try {
    // The typical Secure Privacy button might have a specific ID, text, or class.
    // Assuming standard "Accept" or "Allow" text based on common usage, but we'll try to find a typical accept button.
    // If we need the specific selector, we might have to refine this based on actual DOM.
    // For now, we will look for a button containing "Accept" or a specific secure privacy class.

    // We can also just wait for the element loosely. Let's look for a text 'Accept' inside the banner.
    // The Secure Privacy banner is actually loaded inside an iframe!
    // We must use frameLocator to interact with it.
    const acceptBtn = page.frameLocator('#ifrmCookieBanner').locator('#sp-accept');
    await acceptBtn.waitFor({ state: 'visible', timeout: 10000 });
    await acceptBtn.click();
  } catch (error) {
    // If it doesn't appear within the delay, it might be already dismissed or not present.
    // We just ignore the error.
    console.log('Cookie banner not found or already dismissed.');
  }
}
