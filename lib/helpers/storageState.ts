/**
 * Pure helpers for building a Playwright storage state from an API token.
 *
 * The Angular app authenticates by reading the JWT from localStorage under the
 * key `auth-token` (see UI/_services/token-storage.service.ts). So seeding that
 * key for the app origin is enough to start a test already logged in — no UI
 * login needed.
 */

export const AUTH_TOKEN_KEY = 'auth-token';

export interface StorageStateOrigin {
  origin: string;
  localStorage: { name: string; value: string }[];
}

export interface StorageState {
  cookies: never[];
  origins: StorageStateOrigin[];
}

/** Normalise a base URL to a bare origin (scheme + host), no trailing slash. */
export function toOrigin(baseURL: string): string {
  return new URL(baseURL).origin;
}

/** Build a storage state that logs a session in via the saved JWT. */
export function buildStorageState(baseURL: string, token: string): StorageState {
  return {
    cookies: [],
    origins: [
      {
        origin: toOrigin(baseURL),
        localStorage: [{ name: AUTH_TOKEN_KEY, value: token }],
      },
    ],
  };
}
