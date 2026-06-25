import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test as setup, expect } from '@fixtures/pages';
import { buildStorageState } from '@helpers/storageState';

/**
 * Authentication setup — runs as the `setup` project before authenticated specs.
 *
 * Both roles are authenticated via the API (fast, stable) and the resulting JWT
 * is persisted into a Playwright storage state file. The Angular app reads the
 * token from localStorage (`auth-token`), so seeding that key logs the session
 * in without driving the UI.
 *
 * These run on every setup invocation, so a missing or expired storage state is
 * always regenerated fresh.
 */

const AUTH_DIR = path.resolve('.auth');

async function saveState(file: string, baseURL: string, token: string): Promise<void> {
  await mkdir(AUTH_DIR, { recursive: true });
  const state = buildStorageState(baseURL, token);
  await writeFile(path.join(AUTH_DIR, file), JSON.stringify(state, null, 2), 'utf-8');
}

setup('authenticate as customer', async ({ apiClient, baseURL }) => {
  const email = process.env.CUSTOMER_EMAIL;
  const password = process.env.CUSTOMER_PASSWORD;
  expect(email, 'CUSTOMER_EMAIL must be set  (via .env locally or CI secrets)').toBeTruthy();
  expect(password, 'CUSTOMER_PASSWORD must be set  (via .env locally or CI secrets)').toBeTruthy();

  const token = await apiClient.getToken(email!, password!);
  expect(token, 'customer login returned no access_token').toBeTruthy();

  await saveState('customer.json', baseURL!, token);
});

setup('authenticate as admin', async ({ apiClient, baseURL }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  expect(email, 'ADMIN_EMAIL must be set  (via .env locally or CI secrets)').toBeTruthy();
  expect(password, 'ADMIN_PASSWORD must be set  (via .env locally or CI secrets)').toBeTruthy();

  const token = await apiClient.getToken(email!, password!);
  expect(token, 'admin login returned no access_token').toBeTruthy();

  await saveState('admin.json', baseURL!, token);
});
