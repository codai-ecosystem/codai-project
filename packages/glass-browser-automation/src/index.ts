/**
 * Glass Browser Automation
 * Advanced browser control and automation capabilities
 */

export { GlassBrowserAutomation } from './browser/GlassBrowserAutomation';
export { VercelAutomation } from './automation/VercelAutomation';
export { ElementFinder } from './core/ElementFinder';
export { BrowserConnector } from './core/BrowserConnector';

// Types
export type {
  BrowserType,
  ConnectionOptions,
  NavigationOptions,
  ElementSelector,
  ElementOptions,
  ClickOptions,
  TypeOptions,
  VercelProjectConfig,
  EnvironmentVariable,
  AutomationResult,
  GlassBrowserConfig
} from './types';

// Utilities
export { createSelector, waitForElement, extractPageData } from './utils';
