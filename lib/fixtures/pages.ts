import { test as base, request as playwrightRequest } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { CatalogPage } from '@pages/CatalogPage';
import { AccountPage } from '@pages/AccountPage';
import { ApiClient } from '@api/apiClient';
import { buildCustomer } from '@datafactory/userFactory';

/** Credentials for a freshly-registered, disposable account. */
export interface RegisteredUser {
  email: string;
  password: string;
}

/**
 * Custom test options. `apiURL` is sourced from env in playwright.config.ts and
 * is available to all tests/fixtures.
 */
export interface TestOptions {
  apiURL: string;
}

/**
 * Fixtures exposed to tests. Always instantiate Page Objects and the API client
 * through these fixtures — never `new SomePage(page)` inside a test.
 */
export interface PageFixtures {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  accountPage: AccountPage;
  apiClient: ApiClient;
}

/**
 * Worker-scoped fixtures. `registeredUser` is created once per worker and shared
 * across the tests in that worker.
 */
export interface WorkerFixtures {
  registeredUser: RegisteredUser;
}

export const test = base.extend<TestOptions & PageFixtures, WorkerFixtures>({
  // Option with a default; overridden from config `use.apiURL`.
  apiURL: ['https://api.practicesoftwaretesting.com', { option: true }],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },

  // A request-context-backed API client scoped to the worker's test.
  apiClient: async ({ apiURL }, use) => {
    const context = await playwrightRequest.newContext();
    await use(new ApiClient(context, apiURL));
    await context.dispose();
  },

  // A fresh, disposable account registered via the API once per worker. Tests
  // that need to exercise login (including the failed-login path, which can lock
  // an account) use this throwaway user instead of the shared seeded customer,
  // so lockouts never accumulate on a shared account and flake other runs.
  registeredUser: [
    async ({}, use) => {
      // Worker fixtures cannot read the test-scoped `apiURL` option, so source
      // the API URL from env (same default as playwright.config.ts).
      const apiURL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';
      const context = await playwrightRequest.newContext();
      const api = new ApiClient(context, apiURL);

      const customer = buildCustomer();
      const created = await api.registerUser(customer);

      await use({ email: customer.email, password: customer.password });

      // Best-effort teardown: remove the throwaway account so it does not pile
      // up on the shared test server. Requires admin credentials.
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (adminEmail && adminPassword) {
        try {
          const adminToken = await api.getToken(adminEmail, adminPassword);
          await api.deleteUser(created.id, adminToken);
        } catch {
          // Ignore teardown failures — the account is disposable.
        }
      }

      await context.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
