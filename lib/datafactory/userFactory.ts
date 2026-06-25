import { faker } from './faker';
import type { RegisterUserRequest } from '@api/types';

/**
 * Builds a valid customer registration payload.
 *
 * Honours the backend rules found in StoreCustomer:
 *  - dob must put the customer between 18 and 75 years old
 *  - password must be >= 8 chars with mixed case, a number and a symbol,
 *    and must not be a known-breached password (`uncompromised`), so we
 *    append randomness rather than using a common word.
 *
 * Pass overrides to pin specific fields. Use `seedFaker()` beforehand for
 * deterministic output.
 */
export function buildCustomer(overrides: Partial<RegisterUserRequest> = {}): RegisterUserRequest {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    first_name: firstName,
    last_name: lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: buildStrongPassword(),
    dob: buildAdultDob(),
    phone: faker.string.numeric({ length: 11 }),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      postal_code: faker.location.zipCode(),
    },
    ...overrides,
  };
}

/** A date of birth that satisfies the 18-75 age window. */
export function buildAdultDob(): string {
  const dob = faker.date.birthdate({ min: 20, max: 70, mode: 'age' });
  return dob.toISOString().slice(0, 10); // Y-m-d
}

/**
 * Strong, almost-certainly-uncompromised password:
 * upper + lower + digits + symbol, with a random core.
 */
export function buildStrongPassword(): string {
  return `${faker.internet.password({ length: 12 })}A1!z`;
}
