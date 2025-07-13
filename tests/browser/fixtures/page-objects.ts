import { Page, Locator } from '@playwright/test';
import { PageObjectBase } from '../utils/browser-test-base';

export class CodaiDashboardPage extends PageObjectBase {
  readonly heading: Locator;
  readonly navigationTabs: Locator;
  readonly projectCards: Locator;
  readonly quickStartSection: Locator;
  readonly aiAssistantSection: Locator;
  readonly statsCards: Locator;
  readonly appNavigationLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /welcome to codai/i });
    this.navigationTabs = page.locator('[role="tablist"]');
    this.projectCards = page.locator('[data-testid="project-card"]');
    this.quickStartSection = page.locator('[data-testid="quick-start"]');
    this.aiAssistantSection = page.locator('[data-testid="ai-assistant"]');
    this.statsCards = page.locator('[data-testid="stats-card"]');
    this.appNavigationLinks = page.locator('[data-testid="app-nav-link"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async verifyDashboardElements() {
    await this.heading.waitFor({ state: 'visible' });
    await this.navigationTabs.waitFor({ state: 'visible' });
    await this.quickStartSection.waitFor({ state: 'visible' });
  }

  async navigateToTab(tabName: string) {
    await this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
    await this.page.waitForTimeout(500); // Wait for tab content to load
  }

  async getProjectCount(): Promise<number> {
    return await this.projectCards.count();
  }

  async clickQuickStartAction(actionName: string) {
    await this.page.locator(`[data-testid="quick-start"] button`, { hasText: actionName }).click();
  }

  async verifyResponsiveLayout() {
    // Check if navigation is properly responsive
    const navigation = this.navigationTabs;
    const isVisible = await navigation.isVisible();
    return isVisible;
  }

  async navigateToApp(appName: string) {
    const appLink = this.page.locator(`[data-testid="app-nav-link"]`, { hasText: new RegExp(appName, 'i') });
    await appLink.click();
  }
}

export class MemoraiDashboardPage extends PageObjectBase {
  readonly heading: Locator;
  readonly memoryStats: Locator;
  readonly memoryList: Locator;
  readonly searchBox: Locator;
  readonly addMemoryButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /memorai/i });
    this.memoryStats = page.locator('[data-testid="memory-stats"]');
    this.memoryList = page.locator('[data-testid="memory-list"]');
    this.searchBox = page.locator('[data-testid="memory-search"]');
    this.addMemoryButton = page.locator('[data-testid="add-memory"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async verifyDashboardElements() {
    await this.heading.waitFor({ state: 'visible' });
    await this.memoryStats.waitFor({ state: 'visible' });
  }

  async searchMemories(query: string) {
    await this.searchBox.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  async addNewMemory(title: string, content: string) {
    await this.addMemoryButton.click();

    // Assuming a modal or form appears
    await this.page.locator('[data-testid="memory-title"]').fill(title);
    await this.page.locator('[data-testid="memory-content"]').fill(content);
    await this.page.locator('[data-testid="save-memory"]').click();
  }

  async getMemoryCount(): Promise<number> {
    return await this.memoryList.locator('[data-testid="memory-item"]').count();
  }
}

export class LogaiAuthPage extends PageObjectBase {
  readonly heading: Locator;
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly socialLoginButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /logai/i });
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.signupLink = page.locator('[data-testid="signup-link"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.socialLoginButtons = page.locator('[data-testid="social-login"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async verifyAuthElements() {
    await this.heading.waitFor({ state: 'visible' });
    await this.loginForm.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async goToSignup() {
    await this.signupLink.click();
  }

  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async loginWithSocial(provider: string) {
    await this.page.locator(`[data-testid="social-login-${provider}"]`).click();
  }
}
