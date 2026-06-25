import { test, expect } from '@fixtures/pages';

/**
 * Admin-only smoke. Overrides the project's storage state with the admin JWT
 * (the rest of the `authenticated-*` projects use the customer state).
 */
test.use({ storageState: '.auth/admin.json' });

test.describe('Admin @smoke', () => {
  test('admin sees the dashboard menu entry @regression', async ({ accountPage }) => {
    await accountPage.goto('/');
    await accountPage.navMenu.click();

    await expect(accountPage.navAdminDashboard).toBeVisible();
  });
});
