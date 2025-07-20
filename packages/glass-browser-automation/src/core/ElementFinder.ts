/**
 * Element Finder for Glass Browser Automation
 * Handles finding elements using multiple strategies
 */

import type {
  ElementSelector,
  ElementOptions,
  ElementNotFoundError
} from '../types';
import { normalizeSelector, waitForElement, Timer } from '../utils';

export interface Element {
  selector: string;
  found: boolean;
  visible: boolean;
  enabled: boolean;
  text: string;
  attributes: Record<string, string>;
}

export class ElementFinder {
  private glassMcp: any; // Glass MCP client
  private pageContent: string = '';
  private lastUpdate: number = 0;
  private cache: Map<string, Element> = new Map();

  constructor(glassMcp: any) {
    this.glassMcp = glassMcp;
  }

  async findElement(selector: ElementSelector, options: ElementOptions = {}): Promise<Element> {
    const normalizedSelector = normalizeSelector(selector);
    const cacheKey = `${normalizedSelector}:${JSON.stringify(options)}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid()) {
      return cached;
    }

    const timer = new Timer();
    const timeout = options.timeout || 10000;

    try {
      // Update page content
      await this.updatePageContent();

      // Try multiple finding strategies
      const element = await this.findElementWithStrategies(normalizedSelector, options);

      if (!element.found) {
        throw new Error(`Element not found: ${normalizedSelector}`);
      }

      // Cache the result
      this.cache.set(cacheKey, element);

      return element;
    } catch (error) {
      throw new Error(`Element finding failed: ${error}`);
    }
  }

  async findElements(selector: ElementSelector, options: ElementOptions = {}): Promise<Element[]> {
    const normalizedSelector = normalizeSelector(selector);

    try {
      await this.updatePageContent();
      return await this.findMultipleElements(normalizedSelector, options);
    } catch (error) {
      throw new Error(`Elements finding failed: ${error}`);
    }
  }

  private async updatePageContent(): Promise<void> {
    try {
      this.pageContent = await this.glassMcp.windowExtractText('', false);
      this.lastUpdate = Date.now();
    } catch {
      this.pageContent = '';
    }
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastUpdate < 5000; // 5 second cache
  }

  private async findElementWithStrategies(
    selector: string,
    options: ElementOptions
  ): Promise<Element> {
    const strategies = [
      () => this.findBySelector(selector),
      () => this.findByText(selector),
      () => this.findByAttributes(selector),
      () => this.findByPattern(selector)
    ];

    for (const strategy of strategies) {
      try {
        const element = await strategy();
        if (element.found) {
          // Additional validation
          if (options.visible && !element.visible) continue;
          if (options.enabled && !element.enabled) continue;

          return element;
        }
      } catch {
        continue;
      }
    }

    return this.createNotFoundElement(selector);
  }

  private async findBySelector(selector: string): Promise<Element> {
    // CSS selector strategy
    if (this.isValidCssSelector(selector)) {
      return await this.findByCssSelector(selector);
    }

    // XPath strategy
    if (selector.startsWith('/') || selector.startsWith('./')) {
      return await this.findByXPath(selector);
    }

    return this.createNotFoundElement(selector);
  }

  private async findByText(selector: string): Promise<Element> {
    if (selector.startsWith('text=')) {
      const text = selector.substring(5).replace(/['"]/g, '');
      return await this.findElementByText(text);
    }

    return this.createNotFoundElement(selector);
  }

  private async findByAttributes(selector: string): Promise<Element> {
    // Handle attribute selectors like [data-testid="value"]
    const attrMatch = selector.match(/\[([^=]+)=["']([^"']+)["']\]/);
    if (attrMatch) {
      const [, attribute, value] = attrMatch;
      return await this.findElementByAttribute(attribute, value);
    }

    return this.createNotFoundElement(selector);
  }

  private async findByPattern(selector: string): Promise<Element> {
    // Try common patterns like buttons, inputs, etc.
    const patterns = this.getCommonPatterns(selector);

    for (const pattern of patterns) {
      const element = await this.findByCssSelector(pattern);
      if (element.found) {
        return element;
      }
    }

    return this.createNotFoundElement(selector);
  }

  private getCommonPatterns(selector: string): string[] {
    const patterns: string[] = [];

    // If selector looks like an ID
    if (!selector.startsWith('#') && !selector.startsWith('.') && !selector.includes('[')) {
      patterns.push(`#${selector}`);
      patterns.push(`[id="${selector}"]`);
      patterns.push(`[data-testid="${selector}"]`);
      patterns.push(`[name="${selector}"]`);
    }

    // Common button patterns
    if (selector.toLowerCase().includes('button') ||
      selector.toLowerCase().includes('submit') ||
      selector.toLowerCase().includes('click')) {
      patterns.push('button', 'input[type="button"]', 'input[type="submit"]', '[role="button"]');
    }

    // Common input patterns
    if (selector.toLowerCase().includes('input') ||
      selector.toLowerCase().includes('field')) {
      patterns.push('input', 'textarea', 'select', '[contenteditable]');
    }

    return patterns;
  }

  private async findByCssSelector(selector: string): Promise<Element> {
    // This is a simplified implementation
    // In a real scenario, we would parse the HTML and use a CSS selector engine

    // For now, we'll do basic pattern matching on the page content
    const found = this.pageContent.toLowerCase().includes(selector.toLowerCase()) ||
      this.matchesCssPattern(selector);

    return {
      selector,
      found,
      visible: found,
      enabled: found,
      text: found ? this.extractElementText(selector) : '',
      attributes: {}
    };
  }

  private async findByXPath(xpath: string): Promise<Element> {
    // XPath implementation would require a proper HTML parser
    // For now, return not found
    return this.createNotFoundElement(xpath);
  }

  private async findElementByText(text: string): Promise<Element> {
    const found = this.pageContent.toLowerCase().includes(text.toLowerCase());

    return {
      selector: `text="${text}"`,
      found,
      visible: found,
      enabled: found,
      text: text,
      attributes: {}
    };
  }

  private async findElementByAttribute(attribute: string, value: string): Promise<Element> {
    // Look for attribute patterns in the extracted text
    const pattern = new RegExp(`${attribute}[\\s]*=[\\s]*["']${value}["']`, 'i');
    const found = pattern.test(this.pageContent);

    return {
      selector: `[${attribute}="${value}"]`,
      found,
      visible: found,
      enabled: found,
      text: found ? this.extractElementText(`[${attribute}="${value}"]`) : '',
      attributes: { [attribute]: value }
    };
  }

  private async findMultipleElements(selector: string, options: ElementOptions): Promise<Element[]> {
    // Simplified implementation - in reality would find all matching elements
    const singleElement = await this.findElementWithStrategies(selector, options);
    return singleElement.found ? [singleElement] : [];
  }

  private isValidCssSelector(selector: string): boolean {
    try {
      // Basic validation - in real implementation would use a CSS parser
      return selector.length > 0 &&
        !selector.startsWith('//') &&
        !selector.startsWith('text=');
    } catch {
      return false;
    }
  }

  private matchesCssPattern(selector: string): boolean {
    // Basic CSS selector matching
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      return new RegExp(`id=["']${id}["']`, 'i').test(this.pageContent);
    }

    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      return new RegExp(`class=["'][^"']*${className}[^"']*["']`, 'i').test(this.pageContent);
    }

    // Element name
    const elementPattern = new RegExp(`<${selector}[^>]*>`, 'i');
    return elementPattern.test(this.pageContent);
  }

  private extractElementText(selector: string): string {
    // Extract text content for the element
    // This is a simplified implementation
    const lines = this.pageContent.split('\n');
    const relevantLines = lines.filter(line =>
      line.toLowerCase().includes(selector.toLowerCase())
    );

    return relevantLines.length > 0 ? relevantLines[0].trim() : '';
  }

  private createNotFoundElement(selector: string): Element {
    return {
      selector,
      found: false,
      visible: false,
      enabled: false,
      text: '',
      attributes: {}
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; lastUpdate: number; age: number } {
    return {
      size: this.cache.size,
      lastUpdate: this.lastUpdate,
      age: Date.now() - this.lastUpdate
    };
  }
}
