import type { Locator, Page } from '@playwright/test';

/**
 * Base for all Page Objects. Holds the shared header/nav locators (data-test
 * values from UI/header/header.component.html) and common navigation helpers.
 *
 * Every locator lives here or in a subclass — never inline in a spec.
 */
export abstract class BasePage {
  readonly navHome: Locator;
  readonly navCategories: Locator;
  readonly navContact: Locator;
  readonly navSignIn: Locator;
  readonly navMenu: Locator;
  readonly navSignOut: Locator;
  readonly navMyAccount: Locator;
  readonly navCart: Locator;
  readonly navAdminDashboard: Locator;

  constructor(protected readonly page: Page) {
    this.navHome = page.getByTestId('nav-home');
    this.navCategories = page.getByTestId('nav-categories');
    this.navContact = page.getByTestId('nav-contact');
    this.navSignIn = page.getByTestId('nav-sign-in');
    this.navMenu = page.getByTestId('nav-menu');
    this.navSignOut = page.getByTestId('nav-sign-out');
    this.navMyAccount = page.getByTestId('nav-my-account');
    this.navCart = page.getByTestId('nav-cart');
    this.navAdminDashboard = page.getByTestId('nav-admin-dashboard');
  }

  /** Navigate to a path relative to baseURL and wait for the network to settle. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Open the account/admin menu and sign out. */
  async signOut(): Promise<void> {
    await this.navMenu.click();
    await this.navSignOut.click();
  }

  /** True when a session is active (the account menu is shown instead of sign-in). */
  async isSignedIn(): Promise<boolean> {
    return this.navMenu.isVisible();
  }
}
