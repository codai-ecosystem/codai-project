/**
 * Glass Browser Automation - Main Class
 * Advanced browser control using Glass MCP integration
 */

import type {
  BrowserType,
  ConnectionOptions,
  NavigationOptions,
  ElementSelector,
  ElementOptions,
  ClickOptions,
  TypeOptions,
  SelectOptions,
  AutomationResult,
  AutomationStep,
  GlassBrowserConfig
} from '../types';
import { DEFAULT_CONFIG } from '../types';

import { BrowserConnector } from '../core/BrowserConnector';
import { ElementFinder, type Element } from '../core/ElementFinder';
import { normalizeSelector, normalizeUrl, withRetry, Timer } from '../utils';

export class GlassBrowserAutomation {
  private connector: BrowserConnector;
  private elementFinder: ElementFinder;
  private config: GlassBrowserConfig;
  private currentSteps: AutomationStep[] = [];

  constructor(config: Partial<GlassBrowserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    const connectionOptions: ConnectionOptions = {
      browserType: this.config.defaultBrowser,
      timeout: this.config.connectionTimeout
    };

    this.connector = new BrowserConnector(connectionOptions);
    this.elementFinder = new ElementFinder(this.connector);
  }

  // Connection Management
  async connect(browserType?: BrowserType): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const step: AutomationStep = {
      action: 'connect',
      target: browserType || this.config.defaultBrowser,
      success: false
    };

    try {
      if (browserType) {
        this.config.defaultBrowser = browserType;
      }

      const success = await this.connector.connect();

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async disconnect(): Promise<void> {
    await this.connector.disconnect();
    this.elementFinder.clearCache();
    this.currentSteps = [];
  }

  isConnected(): boolean {
    return this.connector.isConnected();
  }

  // Navigation
  async navigate(url: string, options: NavigationOptions = {}): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const normalizedUrl = normalizeUrl(url);
    const step: AutomationStep = {
      action: 'navigate',
      target: normalizedUrl,
      success: false
    };

    try {
      const success = await this.connector.navigateToUrl(normalizedUrl);

      if (success) {
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, options.timeout || 3000));
      }

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async refresh(): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const step: AutomationStep = {
      action: 'refresh',
      success: false
    };

    try {
      const success = await this.connector.refresh();

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async back(): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const step: AutomationStep = {
      action: 'back',
      success: false
    };

    try {
      const success = await this.connector.goBack();

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async forward(): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const step: AutomationStep = {
      action: 'forward',
      success: false
    };

    try {
      const success = await this.connector.goForward();

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  // Element Finding
  async findElement(selector: ElementSelector, options: ElementOptions = {}): Promise<AutomationResult<Element>> {
    const timer = new Timer();
    const normalizedSelector = normalizeSelector(selector);
    const step: AutomationStep = {
      action: 'findElement',
      target: normalizedSelector,
      success: false
    };

    try {
      const element = await this.elementFinder.findElement(selector, options);

      step.success = element.found;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      if (!element.found) {
        return {
          success: false,
          error: `Element not found: ${normalizedSelector}`,
          duration: timer.elapsed(),
          steps: [step]
        };
      }

      return {
        success: true,
        data: element,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async findElements(selector: ElementSelector, options: ElementOptions = {}): Promise<AutomationResult<Element[]>> {
    const timer = new Timer();
    const normalizedSelector = normalizeSelector(selector);
    const step: AutomationStep = {
      action: 'findElements',
      target: normalizedSelector,
      success: false
    };

    try {
      const elements = await this.elementFinder.findElements(selector, options);

      step.success = elements.length > 0;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: true,
        data: elements,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  // Element Interactions
  async click(selector: ElementSelector, options: ClickOptions = {}): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const normalizedSelector = normalizeSelector(selector);
    const step: AutomationStep = {
      action: 'click',
      target: normalizedSelector,
      success: false
    };

    try {
      // First find the element
      const elementResult = await this.findElement(selector, options);
      if (!elementResult.success || !elementResult.data) {
        throw new Error(`Element not found for click: ${normalizedSelector}`);
      }

      // Focus browser and perform click
      await this.connector.focusBrowser();

      // For now, we'll use Tab navigation and Enter to simulate clicks
      // In a more advanced implementation, we could use coordinate-based clicking
      const success = await this.simulateElementClick(elementResult.data);

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async type(selector: ElementSelector, text: string, options: TypeOptions = {}): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const normalizedSelector = normalizeSelector(selector);
    const step: AutomationStep = {
      action: 'type',
      target: `${normalizedSelector} -> "${text}"`,
      success: false
    };

    try {
      // First find and click the element to focus it
      const clickResult = await this.click(selector, options);
      if (!clickResult.success) {
        throw new Error(`Could not focus element for typing: ${normalizedSelector}`);
      }

      // Clear existing content if requested
      if (options.clear !== false) {
        await this.connector.sendText('^a'); // Ctrl+A to select all
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Type the text
      const success = await this.connector.sendText(text);

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  async select(selector: ElementSelector, value: string, options: SelectOptions = {}): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const normalizedSelector = normalizeSelector(selector);
    const step: AutomationStep = {
      action: 'select',
      target: `${normalizedSelector} -> "${value}"`,
      success: false
    };

    try {
      // Click on the select element
      const clickResult = await this.click(selector, options);
      if (!clickResult.success) {
        throw new Error(`Could not open select dropdown: ${normalizedSelector}`);
      }

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to the option (simplified - type the value)
      const success = await this.connector.sendText(value);

      step.success = success;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success,
        data: success,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  // Data Extraction
  async extractText(selector?: ElementSelector): Promise<AutomationResult<string>> {
    const timer = new Timer();
    const step: AutomationStep = {
      action: 'extractText',
      target: selector ? normalizeSelector(selector) : 'page',
      success: false
    };

    try {
      let text: string;

      if (selector) {
        const elementResult = await this.findElement(selector);
        if (!elementResult.success || !elementResult.data) {
          throw new Error(`Element not found for text extraction: ${normalizeSelector(selector)}`);
        }
        text = elementResult.data.text;
      } else {
        text = await this.connector.extractText();
      }

      step.success = true;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: true,
        data: text,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  // Utility Methods
  async waitFor(selector: ElementSelector, options: ElementOptions = {}): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const step: AutomationStep = {
      action: 'waitFor',
      target: normalizeSelector(selector),
      success: false
    };

    try {
      await withRetry(async () => {
        const result = await this.findElement(selector, options);
        if (!result.success) {
          throw new Error('Element not found');
        }
        return result;
      }, options.retryAttempts || this.config.retryAttempts);

      step.success = true;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: true,
        data: true,
        duration: timer.elapsed(),
        steps: [step]
      };
    } catch (error) {
      step.error = (error as Error).message;
      step.duration = timer.elapsed();
      this.currentSteps.push(step);

      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps: [step]
      };
    }
  }

  // Private helper methods
  private async simulateElementClick(element: Element): Promise<boolean> {
    try {
      // For buttons and clickable elements, we can try pressing Enter/Space
      if (element.selector.includes('button') ||
        element.selector.includes('[role="button"]') ||
        element.text.toLowerCase().includes('click')) {
        return await this.connector.sendText('{ENTER}');
      }

      // For links, try pressing Enter
      if (element.selector.includes('a') || element.selector.includes('link')) {
        return await this.connector.sendText('{ENTER}');
      }

      // Default: try Enter
      return await this.connector.sendText('{ENTER}');
    } catch {
      return false;
    }
  }

  // Get automation history
  getSteps(): AutomationStep[] {
    return [...this.currentSteps];
  }

  clearSteps(): void {
    this.currentSteps = [];
  }

  // Configuration
  updateConfig(config: Partial<GlassBrowserConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): GlassBrowserConfig {
    return { ...this.config };
  }
}
