import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home / product catalog page (/).
 * Locators are the data-test values from UI/products/overview/overview.component.html.
 */
export class CatalogPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly sortSelect: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly searchCaption: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.sortSelect = page.getByTestId('sort');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.searchCaption = page.getByTestId('search-caption');
    this.noResults = page.getByTestId('no-results');
    // Product cards have a dynamic id (product-{id}); match by attribute prefix.
    this.productCards = page.locator('[data-test^="product-"]').filter({ has: this.productNames });
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  /** Wait until at least one product card is rendered. */
  async waitForProducts(): Promise<void> {
    await this.productNames.first().waitFor({ state: 'visible' });
  }

  async productCount(): Promise<number> {
    return this.productNames.count();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }
}
