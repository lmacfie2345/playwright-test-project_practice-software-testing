/**
 * API types derived from the Laravel backend
 * (sprint5/API: routes/api.php, Controllers, OpenAPI annotations).
 */

export type UserRole = 'user' | 'admin';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  requires_totp?: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  house_number?: string;
}

/**
 * Payload accepted by POST /users/register (validated by StoreCustomer).
 * Note the nested `address` object and the strict password policy
 * (min 8, mixed case, number, symbol, not breached) plus the dob age 18-75 rule.
 */
export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  address: Address;
  phone?: string;
  dob: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: UserRole;
}

export interface StatusResponse {
  version: string;
  environment: string;
  app_name: string;
}

export interface Cart {
  id: string;
}
