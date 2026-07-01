import { test, expect } from '@fixtures/pages';

/**
 * Authenticated smoke. Runs in the `authenticated-*` projects, which depend on
 * the `setup` project and load the customer storage state — so the session is
 * already logged in via the saved JWT, no UI login here.
 */
test.describe('Customer account @smoke', () => {
  test('reaches the account overview when authenticated @regression', async ({ accountPage }) => {
    await accountPage.open();

    await expect(accountPage.pageTitle).toBeVisible();
    await expect(accountPage.favoritesLink).toBeVisible();
    await expect(accountPage.profileLink).toBeVisible();
  });

  test('shows the account menu instead of sign-in @regression', async ({ accountPage, isMobile }) => {
    await accountPage.goto('/');
 
    // eslint-disable-next-line playwright/no-conditional-in-test
    if(isMobile) {
     await accountPage.openNavMenu();
    }
    await expect(accountPage.navMenu).toBeVisible();
    await expect(accountPage.navSignIn).toBeHidden();
  });
});
