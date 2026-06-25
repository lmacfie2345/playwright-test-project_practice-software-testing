import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  Cart,
  LoginResponse,
  RegisterUserRequest,
  StatusResponse,
  User,
} from './types';

/**
 * Typed client wrapping Playwright's APIRequestContext.
 *
 * Handles authentication and test-data setup/teardown against the Laravel REST
 * API (default https://api.practicesoftwaretesting.com). Endpoints are taken
 * from sprint5/API/routes/api.php.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiURL: string,
  ) {}

  private url(path: string): string {
    return `${this.apiURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  private static authHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }

  /** Throws a readable error if the response is not OK. */
  private static async ensureOk(response: APIResponse, context: string): Promise<APIResponse> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `${context} failed: ${response.status()} ${response.statusText()} — ${body}`,
      );
    }
    return response;
  }

  /** GET /status — health check. */
  async getStatus(): Promise<StatusResponse> {
    const response = await ApiClient.ensureOk(
      await this.request.get(this.url('/status')),
      'GET /status',
    );
    return response.json() as Promise<StatusResponse>;
  }

  /**
   * POST /refresh — resets the database to the seeded baseline
   * (migrate:fresh --seed). Use sparingly; it is a global, destructive reset.
   */
  async refreshDatabase(): Promise<void> {
    await ApiClient.ensureOk(await this.request.post(this.url('/refresh')), 'POST /refresh');
  }

  /** POST /users/login — returns the full token payload. */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await ApiClient.ensureOk(
      await this.request.post(this.url('/users/login'), { data: { email, password } }),
      `POST /users/login (${email})`,
    );
    return response.json() as Promise<LoginResponse>;
  }

  /** Convenience: login and return just the bearer token. */
  async getToken(email: string, password: string): Promise<string> {
    const { access_token } = await this.login(email, password);
    return access_token;
  }

  /** GET /users/me — the authenticated user. */
  async getMe(token: string): Promise<User> {
    const response = await ApiClient.ensureOk(
      await this.request.get(this.url('/users/me'), { headers: ApiClient.authHeaders(token) }),
      'GET /users/me',
    );
    return response.json() as Promise<User>;
  }

  /** POST /users/register — create a customer account. */
  async registerUser(user: RegisterUserRequest): Promise<User> {
    const response = await ApiClient.ensureOk(
      await this.request.post(this.url('/users/register'), { data: user }),
      `POST /users/register (${user.email})`,
    );
    return response.json() as Promise<User>;
  }

  /** DELETE /users/{id} — admin-only teardown of a user. */
  async deleteUser(id: string, adminToken: string): Promise<void> {
    await ApiClient.ensureOk(
      await this.request.delete(this.url(`/users/${id}`), {
        headers: ApiClient.authHeaders(adminToken),
      }),
      `DELETE /users/${id}`,
    );
  }

  /** POST /carts — create an empty cart, returns its id. */
  async createCart(): Promise<Cart> {
    const response = await ApiClient.ensureOk(
      await this.request.post(this.url('/carts')),
      'POST /carts',
    );
    return response.json() as Promise<Cart>;
  }

  /** DELETE /carts/{id} — teardown a cart. */
  async deleteCart(id: string): Promise<void> {
    await ApiClient.ensureOk(
      await this.request.delete(this.url(`/carts/${id}`)),
      `DELETE /carts/${id}`,
    );
  }
}
