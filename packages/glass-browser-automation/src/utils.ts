/**
 * Utility functions for Glass Browser Automation
 */

import type { ElementSelector, PageData, ElementOptions } from './types';

// Selector Utilities
export function createSelector(options: {
  css?: string;
  text?: string;
  placeholder?: string;
  role?: string;
  testId?: string;
  id?: string;
  name?: string;
  className?: string;
}): string {
  // Priority-based selector creation
  if (options.testId) return `[data-testid="${options.testId}"]`;
  if (options.id) return `#${options.id}`;
  if (options.name) return `[name="${options.name}"]`;
  if (options.role) return `[role="${options.role}"]`;
  if (options.className) return `.${options.className}`;
  if (options.css) return options.css;
  if (options.text) return `text="${options.text}"`;
  if (options.placeholder) return `[placeholder="${options.placeholder}"]`;

  throw new Error('At least one selector option must be provided');
}

export function normalizeSelector(selector: ElementSelector): string {
  if (typeof selector === 'string') {
    return selector;
  }

  return createSelector(selector);
}

// Wait Utilities
export async function waitForElement(
  findElement: (selector: string) => Promise<any>,
  selector: ElementSelector,
  options: ElementOptions = {}
): Promise<any> {
  const normalizedSelector = normalizeSelector(selector);
  const timeout = options.timeout || 10000;
  const retryAttempts = options.retryAttempts || 3;
  const interval = 500;
  const maxAttempts = Math.max(timeout / interval, retryAttempts);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const element = await findElement(normalizedSelector);
      if (element) {
        // Additional checks for visibility and enabled state if requested
        if (options.visible && !(await isElementVisible(element))) {
          throw new Error('Element not visible');
        }
        if (options.enabled && !(await isElementEnabled(element))) {
          throw new Error('Element not enabled');
        }
        return element;
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }

    await sleep(interval);
  }

  throw new Error(`Element not found after ${maxAttempts} attempts: ${normalizedSelector}`);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Element State Utilities
export async function isElementVisible(element: any): Promise<boolean> {
  try {
    // This would be implemented based on the specific browser automation library
    // For now, assume the element exists and is visible
    return element && element.isVisible ? await element.isVisible() : true;
  } catch {
    return false;
  }
}

export async function isElementEnabled(element: any): Promise<boolean> {
  try {
    return element && element.isEnabled ? await element.isEnabled() : true;
  } catch {
    return false;
  }
}

// Data Extraction Utilities
export function extractPageData(htmlContent: string): PageData {
  // Simple HTML parsing for basic page data extraction
  // In a real implementation, you might use a proper HTML parser like jsdom

  const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  // Extract links
  const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  const links: Array<{ text: string; href: string; }> = [];
  let linkMatch;
  while ((linkMatch = linkRegex.exec(htmlContent)) !== null) {
    links.push({
      href: linkMatch[1],
      text: linkMatch[2].trim()
    });
  }

  // Extract images
  const imageRegex = /<img[^>]*src=["']([^"']*)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
  const images: Array<{ src: string; alt: string; }> = [];
  let imageMatch;
  while ((imageMatch = imageRegex.exec(htmlContent)) !== null) {
    images.push({
      src: imageMatch[1],
      alt: imageMatch[2] || ''
    });
  }

  // Extract forms
  const formRegex = /<form[^>]*(?:action=["']([^"']*)["'])?[^>]*(?:method=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/form>/gi;
  const forms: Array<{ action: string; method: string; fields: string[]; }> = [];
  let formMatch;
  while ((formMatch = formRegex.exec(htmlContent)) !== null) {
    const formContent = formMatch[3];
    const fieldRegex = /<(?:input|textarea|select)[^>]*name=["']([^"']*)["'][^>]*>/gi;
    const fields: string[] = [];
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(formContent)) !== null) {
      fields.push(fieldMatch[1]);
    }

    forms.push({
      action: formMatch[1] || '',
      method: (formMatch[2] || 'get').toLowerCase(),
      fields
    });
  }

  // Extract metadata
  const metadataRegex = /<meta[^>]*(?:name|property)=["']([^"']*)["'][^>]*content=["']([^"']*)["'][^>]*>/gi;
  const metadata: Record<string, string> = {};
  let metaMatch;
  while ((metaMatch = metadataRegex.exec(htmlContent)) !== null) {
    metadata[metaMatch[1]] = metaMatch[2];
  }

  // Extract text content (simplified)
  const textContent = htmlContent
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title,
    url: '', // Would be populated by the calling function
    text: textContent,
    links,
    forms,
    images,
    metadata
  };
}

// String Utilities
export function escapeSelector(selector: string): string {
  return selector.replace(/[.#\[\]:]/g, '\\$&');
}

export function generateUniqueId(): string {
  return `glass-automation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// URL Utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

// Retry Utilities
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await sleep(delay * attempt); // Exponential backoff
    }
  }

  throw lastError!;
}

// Validation Utilities
export function validateElementSelector(selector: ElementSelector): void {
  if (typeof selector === 'string') {
    if (!selector.trim()) {
      throw new Error('Selector cannot be empty');
    }
    return;
  }

  if (!selector || typeof selector !== 'object') {
    throw new Error('Selector must be a string or object');
  }

  const hasValidProperty = Object.keys(selector).some(key =>
    ['css', 'xpath', 'text', 'placeholder', 'role', 'testId', 'id', 'name', 'className'].includes(key)
  );

  if (!hasValidProperty) {
    throw new Error('Selector object must have at least one valid property');
  }
}

// Timing Utilities
export class Timer {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  elapsed(): number {
    return Date.now() - this.startTime;
  }

  reset(): void {
    this.startTime = Date.now();
  }
}

// Glass MCP Integration Utilities
export function formatGlassCommand(action: string, params: Record<string, any> = {}): string {
  return JSON.stringify({ action, params, timestamp: Date.now() });
}

export function parseGlassResponse(response: string): any {
  try {
    return JSON.parse(response);
  } catch {
    return { success: false, error: 'Invalid response format', raw: response };
  }
}
