import { request, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { ApiClient } from '@api/apiClient';

dotenv.config();

/**
 * Global setup, wired via playwright.config.ts `globalSetup`.
 *
 *  1. API health check — fail fast if the backend is unreachable.
 *  2. Optional baseline data reset.
 *
 * The reset (POST /refresh -> migrate:fresh --seed) is GLOBAL and DESTRUCTIVE:
 * it wipes the entire database back to the seeded baseline. The default target
 * is the SHARED public demo, so the reset is OFF by default and only runs when
 * `RESET_DB=true` (intended for a private/local target you own). Tests are
 * expected to create and clean up their own data via the API regardless.
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  const apiURL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';
  const context = await request.newContext();
  const api = new ApiClient(context, apiURL);

  try {
    const status = await api.getStatus();
    console.log(
      `[global.setup] API healthy at ${apiURL} — ${status.app_name} v${status.version} (${status.environment})`,
    );

    if (process.env.RESET_DB === 'true') {
      console.warn('[global.setup] RESET_DB=true — resetting database to seeded baseline...');
      await api.refreshDatabase();
      console.log('[global.setup] Database reset complete.');
    }
  } finally {
    await context.dispose();
  }
}

export default globalSetup;
