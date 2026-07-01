import { expect, type Locator, type Page } from '@playwright/test';

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
  readonly toggleNavMenu: Locator;

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
    this.toggleNavMenu = page.getByRole('button', { name: 'Toggle navigation' });
  }

  /** Navigate to a path relative to baseURL and wait for the network to settle. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Expand the collapsed mobile nav (Bootstrap `navbar-toggler`).
   *
   * On desktop the toggler is hidden and the nav is always shown, so this is a
   * no-op. On mobile a single click is flaky: clicks that land while Bootstrap's
   * collapse animation is running (`.collapsing`) are swallowed, and the
   * toggler's `aria-expanded` can drift out of sync with what's actually
   * visible. So we drive by the real source of truth — `navMenu` visibility —
   * and re-click until the menu is open (timeout if it never opens). 
   */
  async openNavMenu(): Promise<void> {
    if (!(await this.toggleNavMenu.isVisible())) return; // desktop: always expanded
    await expect(async () => {
      if (!(await this.navMenu.isVisible())) {
        await this.toggleNavMenu.click();
      }
      await expect(this.navMenu).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
  }

    async openNavSignIn(): Promise<void> {
    if (!(await this.toggleNavMenu.isVisible())) return; // desktop: always expanded
    await expect(async () => {
      if (!(await this.navSignIn.isVisible())) {
        await this.toggleNavMenu.click();
      }
      await expect(this.navSignIn).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
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
