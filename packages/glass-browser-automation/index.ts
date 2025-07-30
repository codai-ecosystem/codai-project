/**
 * Enhanced Glass Browser Automation - Main Entry Point
 * Exports all enhanced browser automation capabilities
 */

// Core classes
export { GlassMCPConnector, GlassWindow } from './src/glass-mcp-connector';
export { DOMInspector, DOMElement, PageContent } from './src/dom-inspector';
export { SmartElementInteractor, ClickResult, InteractionOptions } from './src/smart-element-interactor';
export { EnhancedGlassBrowser, BrowserPageState, ElementSearchResult } from './src/enhanced-glass-browser';

// Specialized automation
export {
    EnhancedVercelAutomation,
    EnvironmentVariable,
    VercelAutomationResult
} from './src/enhanced-vercel-automation';

// Import for internal use
import { EnhancedGlassBrowser } from './src/enhanced-glass-browser';
import { EnhancedVercelAutomation } from './src/enhanced-vercel-automation';

// Utility types and interfaces
export interface AutomationConfig {
    timeout?: number;
    retryCount?: number;
    waitForPageLoad?: boolean;
    scrollToElements?: boolean;
    debugMode?: boolean;
}

export interface BrowserCapabilities {
    domInspection: boolean;
    smartClicking: boolean;
    formFilling: boolean;
    pageNavigation: boolean;
    elementWaiting: boolean;
    multipleMethodClicking: boolean;
    keyboardNavigation: boolean;
    coordinateClicking: boolean;
}

// Default configuration
export const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
    timeout: 10000,
    retryCount: 3,
    waitForPageLoad: true,
    scrollToElements: true,
    debugMode: false
};

// Browser capabilities manifest
export const ENHANCED_BROWSER_CAPABILITIES: BrowserCapabilities = {
    domInspection: true,
    smartClicking: true,
    formFilling: true,
    pageNavigation: true,
    elementWaiting: true,
    multipleMethodClicking: true,
    keyboardNavigation: true,
    coordinateClicking: true
};

// Utility functions
export function createEnhancedBrowser(config: AutomationConfig = DEFAULT_AUTOMATION_CONFIG): EnhancedGlassBrowser {
    const browser = new EnhancedGlassBrowser();

    // Apply configuration (in a real implementation, this would set internal properties)
    if (config.debugMode) {
        console.log('Enhanced Glass Browser created with config:', config);
    }

    return browser;
}

export function createVercelAutomation(config: AutomationConfig = DEFAULT_AUTOMATION_CONFIG): EnhancedVercelAutomation {
    const automation = new EnhancedVercelAutomation();

    if (config.debugMode) {
        console.log('Enhanced Vercel Automation created with config:', config);
    }

    return automation;
}

// Version and metadata
export const VERSION = '2.0.0';
export const PACKAGE_NAME = '@codai/glass-browser-automation';
export const DESCRIPTION = 'Enhanced Glass MCP browser automation with DOM inspection and smart element interaction';

// Feature flags for different automation capabilities
export const FEATURES = {
    DOM_INSPECTION: true,
    SMART_CLICKING: true,
    FORM_AUTOMATION: true,
    ELEMENT_WAITING: true,
    MULTI_METHOD_INTERACTION: true,
    VERCEL_INTEGRATION: true,
    CLIPBOARD_OPERATIONS: true,
    WINDOW_MANAGEMENT: true,
    KEYBOARD_AUTOMATION: true,
    PAGE_ANALYSIS: true
} as const;

// Export feature detection function
export function hasFeature(feature: keyof typeof FEATURES): boolean {
    return FEATURES[feature] === true;
}

// Export compatibility check
export function checkCompatibility(): {
    compatible: boolean;
    missingFeatures: string[];
    warnings: string[];
} {
    const missingFeatures: string[] = [];
    const warnings: string[] = [];

    // Check if Glass MCP is available (would check actual availability in real implementation)
    const glassMCPAvailable = true; // Mock check

    if (!glassMCPAvailable) {
        missingFeatures.push('Glass MCP Server');
    }

    // Check browser availability
    const browserAvailable = true; // Mock check

    if (!browserAvailable) {
        warnings.push('No compatible browser detected');
    }

    return {
        compatible: missingFeatures.length === 0,
        missingFeatures,
        warnings
    };
}

// Main automation factory
export class GlassAutomationFactory {
    static async createBrowserAutomation(
        windowTitle?: string,
        config: AutomationConfig = DEFAULT_AUTOMATION_CONFIG
    ): Promise<EnhancedGlassBrowser> {
        const browser = createEnhancedBrowser(config);

        if (windowTitle) {
            await browser.initializeBrowserAutomation(windowTitle);
        }

        return browser;
    }

    static async createVercelAutomation(
        config: AutomationConfig = DEFAULT_AUTOMATION_CONFIG
    ): Promise<EnhancedVercelAutomation> {
        const automation = createVercelAutomation(config);
        await automation.initialize();
        return automation;
    }

    static getCapabilities(): BrowserCapabilities {
        return { ...ENHANCED_BROWSER_CAPABILITIES };
    }

    static getVersion(): string {
        return VERSION;
    }

    static checkSystemCompatibility(): ReturnType<typeof checkCompatibility> {
        return checkCompatibility();
    }
}
