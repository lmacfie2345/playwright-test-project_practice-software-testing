import { test, expect } from '@fixtures/pages';

/**
 * Public (no-auth) smoke for the UI login flow. Demonstrates the conventions:
 * POM via fixture, no inline locators.
 *
 * Both tests drive a fresh account registered via the API (`registeredUser`
 * fixture) rather than the shared seeded customer. The invalid-credentials case
 * trips the backend's failed-login lockout; pointing it at a disposable account
 * keeps those lockouts off any shared user, so the suite stays deterministic.
 */
test.describe('Login @smoke', () => {
  test('customer can log in through the UI @regression', async ({ loginPage, isMobile }) => {
    const email = process.env.CUSTOMER_EMAIL;
    const password = process.env.CUSTOMER_PASSWORD;
    await loginPage.open();
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (!email || !password) {
          throw new Error('CUSTOMER_EMAIL and CUSTOMER_PASSWORD must be set in .env');
  }
    await loginPage.login(email, password);
      // eslint-disable-next-line playwright/no-conditional-in-test
    if(isMobile) {
     await loginPage.toggleNavMenu.click();
    }
    // Successful login redirects to the account page and shows the account menu.
    await expect(loginPage.navMenu).toBeVisible();
    await expect(loginPage.navSignIn).toBeHidden();
  });

  test('shows an error for invalid credentials @regression', async ({ loginPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.login(registeredUser.email, 'wrong-password');

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorText()).toContain('Invalid');
  });
});
