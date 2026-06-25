import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Customer account overview page (/account).
 * Locators are the data-test values from UI/account/overview/overview.component.html.
 */
export class AccountPage extends BasePage {
  readonly pageTitle: Locator;
  readonly favoritesLink: Locator;
  readonly profileLink: Locator;
  readonly invoicesLink: Locator;
  readonly messagesLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByTestId('page-title');
    this.favoritesLink = page.getByTestId('nav-favorites');
    this.profileLink = page.getByTestId('nav-profile');
    this.invoicesLink = page.getByTestId('nav-invoices');
    this.messagesLink = page.getByTestId('nav-messages');
  }

  async open(): Promise<void> {
    await this.goto('/account');
    await this.pageTitle.waitFor({ state: 'visible' });
  }
}
