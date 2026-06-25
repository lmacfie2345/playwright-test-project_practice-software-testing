import { test, expect } from '@fixtures/pages';

/**
 * Public (no-auth) smoke: the catalog home page loads and renders products.
 * Runs without a storage state in the `no-auth-*` projects.
 */
test.describe('Home / catalog @smoke', () => {
  test('displays product catalog to anonymous visitors @regression', async ({ catalogPage }) => {
    await catalogPage.open();
    await catalogPage.waitForProducts();

    expect(await catalogPage.productCount()).toBeGreaterThan(0);
    await expect(catalogPage.productNames.first()).toBeVisible();
    await expect(catalogPage.productPrices.first()).toBeVisible();
  });

  test('shows the sign-in link when logged out @regression', async ({ catalogPage }) => {
    await catalogPage.open();

    await expect(catalogPage.navSignIn).toBeVisible();
    await expect(catalogPage.navMenu).toBeHidden();
  });
});
