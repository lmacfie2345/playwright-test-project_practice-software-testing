import { test, expect } from '@fixtures/pages';

/**
 * Admin-only smoke. Overrides the project's storage state with the admin JWT
 * (the rest of the `authenticated-*` projects use the customer state).
 */
test.use({ storageState: '.auth/admin.json' });

test.describe('Admin @smoke', () => {
  test('admin sees the dashboard menu entry @regression', async ({ accountPage,isMobile }) => {
    await accountPage.goto('/');
    // eslint-disable-next-line playwright/no-conditional-in-test
    if(isMobile) {
     await accountPage.toggleNavMenu.click();
    }
    await accountPage.navMenu.click();

    await expect(accountPage.navAdminDashboard).toBeVisible();
  });
});
