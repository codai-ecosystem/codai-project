/**
 * Type definitions for Glass Browser Automation
 */

// Browser Types
export type BrowserType = 'edge' | 'chrome' | 'chromium' | 'firefox' | 'safari';

// Connection Configuration
export interface ConnectionOptions {
  browserType: BrowserType;
  debuggingPort?: number;
  headless?: boolean;
  timeout?: number;
  userDataDir?: string;
  executablePath?: string;
}

// Navigation Options
export interface NavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  referer?: string;
}

// Element Selection
export type ElementSelector = string | {
  css?: string;
  xpath?: string;
  text?: string;
  placeholder?: string;
  role?: string;
  testId?: string;
  id?: string;
  name?: string;
  className?: string;
};

export interface ElementOptions {
  timeout?: number;
  visible?: boolean;
  enabled?: boolean;
  retryAttempts?: number;
  waitForStable?: boolean;
}

// Interaction Options
export interface ClickOptions extends ElementOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  force?: boolean;
  position?: { x: number; y: number };
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
}

export interface TypeOptions extends ElementOptions {
  delay?: number;
  clear?: boolean;
  noWaitAfter?: boolean;
}

export interface SelectOptions extends ElementOptions {
  value?: string | string[];
  label?: string | string[];
  index?: number | number[];
}

// Data Extraction
export interface ExtractOptions {
  selector?: ElementSelector;
  attribute?: string;
  property?: string;
  evaluate?: string;
}

export interface PageData {
  title: string;
  url: string;
  text: string;
  links: Array<{ text: string; href: string; }>;
  forms: Array<{ action: string; method: string; fields: string[]; }>;
  images: Array<{ src: string; alt: string; }>;
  metadata: Record<string, string>;
}

// Vercel Specific Types
export interface VercelProjectConfig {
  name: string;
  framework?: string;
  gitRepository?: {
    type: 'github' | 'gitlab' | 'bitbucket';
    url: string;
    branch?: string;
  };
  buildSettings?: {
    buildCommand?: string;
    outputDirectory?: string;
    installCommand?: string;
    devCommand?: string;
  };
  environmentVariables?: Record<string, EnvironmentVariable>;
  domains?: string[];
}

export interface EnvironmentVariable {
  value: string;
  target?: Array<'production' | 'preview' | 'development'>;
  type?: 'plain' | 'secret' | 'system';
}

export interface VercelTeam {
  id: string;
  name: string;
  slug: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  gitRepository?: {
    type: string;
    url: string;
    branch: string;
  };
  productionDomain: string;
  createdAt: string;
  updatedAt: string;
}

// Automation Results
export interface AutomationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  duration?: number;
  steps?: AutomationStep[];
}

export interface AutomationStep {
  action: string;
  target?: string;
  success: boolean;
  duration?: number;
  error?: string;
  screenshot?: string;
}

// Browser State
export interface BrowserState {
  connected: boolean;
  currentUrl?: string;
  currentTitle?: string;
  tabCount?: number;
  activeTabId?: string;
}

export interface TabInfo {
  id: string;
  url: string;
  title: string;
  active: boolean;
  pinned: boolean;
}

// Error Types
export class BrowserAutomationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BrowserAutomationError';
  }
}

export class ElementNotFoundError extends BrowserAutomationError {
  constructor(selector: ElementSelector, timeout?: number) {
    super(
      `Element not found: ${JSON.stringify(selector)}${timeout ? ` (timeout: ${timeout}ms)` : ''}`,
      'ELEMENT_NOT_FOUND',
      { selector, timeout }
    );
  }
}

export class ConnectionError extends BrowserAutomationError {
  constructor(browserType: BrowserType, details?: any) {
    super(
      `Failed to connect to ${browserType} browser`,
      'CONNECTION_FAILED',
      { browserType, ...details }
    );
  }
}

export class NavigationError extends BrowserAutomationError {
  constructor(url: string, details?: any) {
    super(
      `Navigation failed to ${url}`,
      'NAVIGATION_FAILED',
      { url, ...details }
    );
  }
}

// Configuration
export interface GlassBrowserConfig {
  defaultBrowser: BrowserType;
  connectionTimeout: number;
  elementTimeout: number;
  retryAttempts: number;
  debugMode: boolean;
  screenshotOnError: boolean;
  glassMcpEndpoint?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_CONFIG: GlassBrowserConfig = {
  defaultBrowser: 'edge',
  connectionTimeout: 30000,
  elementTimeout: 10000,
  retryAttempts: 3,
  debugMode: false,
  screenshotOnError: true,
  glassMcpEndpoint: 'http://localhost:8001',
  logLevel: 'info'
};
