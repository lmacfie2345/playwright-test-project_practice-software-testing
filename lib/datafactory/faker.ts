import { faker, Faker } from '@faker-js/faker';

/**
 * Shared faker instance. Call `seedFaker(n)` to make data generation
 * deterministic (useful for reproducing a failing run).
 */
export { faker };
export type { Faker };

export function seedFaker(seed: number): void {
  faker.seed(seed);
}
