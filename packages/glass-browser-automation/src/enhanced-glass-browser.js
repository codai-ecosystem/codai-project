"use strict";
/**
 * Enhanced Glass Browser Controller
 * Integrates DOM inspection and smart element interaction
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedGlassBrowser = void 0;
const glass_mcp_connector_1 = require("./glass-mcp-connector");
const dom_inspector_1 = require("./dom-inspector");
const smart_element_interactor_1 = require("./smart-element-interactor");
class EnhancedGlassBrowser extends glass_mcp_connector_1.GlassMCPConnector {
    domInspector = null;
    elementInteractor = null;
    currentWindowHandle = null;
    /**
     * Initialize enhanced browser automation with DOM capabilities
     */
    async initializeBrowserAutomation(windowTitle) {
        // First, initialize the base Glass browser automation
        await this.initialize();
        // Find and focus the browser window
        const windows = await this.listWindows();
        const browserWindow = windows.find(w => w.title.toLowerCase().includes(windowTitle.toLowerCase()) ||
            w.title.toLowerCase().includes('edge') ||
            w.title.toLowerCase().includes('chrome') ||
            w.title.toLowerCase().includes('firefox'));
        if (!browserWindow) {
            throw new Error(`Browser window not found with title containing: ${windowTitle}`);
        }
        // Focus the browser window
        await this.focusWindow(browserWindow.title);
        // Store the window handle
        this.currentWindowHandle = browserWindow.handle;
        // Initialize DOM inspector and element interactor
        this.domInspector = new dom_inspector_1.DOMInspector(browserWindow.handle);
        this.elementInteractor = new smart_element_interactor_1.SmartElementInteractor(browserWindow.handle);
        // Get current page state
        const pageContent = await this.domInspector.getPageContent();
        return {
            url: pageContent.url,
            title: pageContent.title,
            content: pageContent,
            windowHandle: browserWindow.handle,
            isActive: true
        };
    }
    /**
     * Search for elements on the current page
     */
    async searchForElements(searchCriteria) {
        if (!this.domInspector) {
            throw new Error('DOM inspector not initialized. Call initializeBrowserAutomation first.');
        }
        const elements = await this.domInspector.findElements(searchCriteria);
        const bestMatch = searchCriteria.text ?
            await this.domInspector.findBestClickableElement(searchCriteria.text) :
            elements[0];
        // Generate suggestions for similar elements
        const suggestions = elements.map(el => ({
            element: el,
            confidence: this.calculateElementConfidence(el, searchCriteria),
            reason: this.generateElementReason(el, searchCriteria)
        })).sort((a, b) => b.confidence - a.confidence);
        return {
            found: elements.length > 0,
            elements,
            bestMatch: bestMatch || undefined,
            suggestions: suggestions.slice(0, 5) // Top 5 suggestions
        };
    }
    /**
     * Smart click on an element with advanced retry logic
     */
    async smartClickElement(searchCriteria, options = {}) {
        if (!this.elementInteractor) {
            throw new Error('Element interactor not initialized. Call initializeBrowserAutomation first.');
        }
        return await this.elementInteractor.smartClick(searchCriteria, options);
    }
    /**
     * Get comprehensive page analysis for debugging
     */
    async analyzeCurrentPage() {
        if (!this.domInspector) {
            throw new Error('DOM inspector not initialized');
        }
        const pageContent = await this.domInspector.getPageContent();
        const pageState = {
            url: pageContent.url,
            title: pageContent.title,
            content: pageContent,
            windowHandle: 0, // Would be set from actual window handle
            isActive: true
        };
        const elementAnalysis = {
            totalElements: pageContent.elements.length,
            clickableElements: pageContent.clickableElements.length,
            formElements: pageContent.formElements.length,
            buttons: pageContent.buttons.length,
            links: pageContent.links.length,
            inputs: pageContent.inputs.length
        };
        const actionableElements = [
            ...pageContent.buttons.map(el => ({
                element: el,
                type: 'button',
                confidence: this.calculateActionConfidence(el),
                description: `Button: "${el.text}" ${el.attributes.class || ''}`
            })),
            ...pageContent.links.map(el => ({
                element: el,
                type: 'link',
                confidence: this.calculateActionConfidence(el),
                description: `Link: "${el.text}" → ${el.attributes.href || 'unknown'}`
            })),
            ...pageContent.inputs.map(el => ({
                element: el,
                type: 'input',
                confidence: this.calculateActionConfidence(el),
                description: `Input: ${el.attributes.type || 'text'} ${el.attributes.placeholder || el.attributes.name || ''}`
            }))
        ].sort((a, b) => b.confidence - a.confidence);
        return {
            pageState,
            elementAnalysis,
            actionableElements: actionableElements.slice(0, 10) // Top 10 actionable elements
        };
    }
    /**
     * Navigate to a specific URL and wait for page load
     */
    async navigateToUrl(url, waitForLoad = true) {
        if (!this.currentWindowHandle) {
            throw new Error('No active window handle. Call initializeBrowserAutomation first.');
        }
        // Use keyboard shortcut to focus address bar and navigate
        await this.sendText(this.currentWindowHandle, '^l'); // Ctrl+L to focus address bar
        await this.delay(500);
        await this.sendText(this.currentWindowHandle, url);
        await this.sendText(this.currentWindowHandle, '{ENTER}');
        if (waitForLoad) {
            await this.delay(3000); // Wait for page load
        }
        // Reinitialize DOM inspector for new page
        if (this.domInspector) {
            const pageContent = await this.domInspector.getPageContent();
            return {
                url: pageContent.url,
                title: pageContent.title,
                content: pageContent,
                windowHandle: this.currentWindowHandle,
                isActive: true
            };
        }
        throw new Error('DOM inspector not available');
    }
    /**
     * Fill form with data intelligently
     */
    async fillForm(formData) {
        const filledFields = [];
        const failedFields = [];
        for (const [fieldName, value] of Object.entries(formData)) {
            try {
                // Try to find input field by name, placeholder, or label
                const searchResult = await this.searchForElements({
                    tag: 'input',
                    attributes: { name: fieldName }
                });
                if (!searchResult.found && searchResult.elements.length === 0) {
                    // Try by placeholder or nearby label
                    const placeholderSearch = await this.searchForElements({
                        tag: 'input',
                        attributes: { placeholder: fieldName }
                    });
                    if (placeholderSearch.found) {
                        searchResult.elements = placeholderSearch.elements;
                    }
                }
                if (searchResult.elements.length > 0) {
                    const element = searchResult.elements[0];
                    // Click on the input field
                    const clickResult = await this.smartClickElement({
                        selector: element.selector
                    });
                    if (clickResult.success) {
                        // Clear existing content and type new value
                        await this.sendText(this.currentWindowHandle, '^a'); // Select all
                        await this.sendText(this.currentWindowHandle, value);
                        filledFields.push(fieldName);
                    }
                    else {
                        failedFields.push({
                            field: fieldName,
                            error: clickResult.error || 'Failed to click field'
                        });
                    }
                }
                else {
                    failedFields.push({
                        field: fieldName,
                        error: 'Field not found on page'
                    });
                }
            }
            catch (error) {
                failedFields.push({
                    field: fieldName,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return {
            success: failedFields.length === 0,
            filledFields,
            failedFields
        };
    }
    /**
     * Scroll to element and ensure it's visible
     */
    async scrollToElement(selector) {
        try {
            const elements = await this.searchForElements({ containsText: selector });
            if (elements.found && elements.bestMatch) {
                const element = elements.bestMatch;
                // Calculate scroll position
                const scrollScript = `window.scrollTo(0, ${element.bounds.y - 100})`;
                // For now, we'll use keyboard scrolling as a fallback
                const currentY = element.bounds.y;
                const viewportHeight = 800; // Approximate viewport height
                if (currentY > viewportHeight) {
                    // Scroll down
                    const scrollCount = Math.ceil((currentY - viewportHeight / 2) / 100);
                    for (let i = 0; i < scrollCount && i < 20; i++) {
                        await this.sendText(this.currentWindowHandle, '{PGDN}');
                        await this.delay(100);
                    }
                }
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error scrolling to element:', error);
            return false;
        }
    }
    /**
     * Wait for element to appear on page
     */
    async waitForElement(searchCriteria, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                const searchResult = await this.searchForElements(searchCriteria);
                if (searchResult.found && searchResult.bestMatch) {
                    return searchResult.bestMatch;
                }
                await this.delay(500);
            }
            catch (error) {
                // Continue waiting on errors
            }
        }
        return null;
    }
    /**
     * Calculate element confidence score
     */
    calculateElementConfidence(element, criteria) {
        let confidence = 0;
        if (criteria.text && element.text.toLowerCase().includes(criteria.text.toLowerCase())) {
            confidence += 50;
        }
        if (criteria.clickable && element.isClickable) {
            confidence += 30;
        }
        if (element.isVisible) {
            confidence += 20;
        }
        return confidence;
    }
    /**
     * Generate element reason description
     */
    generateElementReason(element, criteria) {
        const reasons = [];
        if (criteria.text && element.text.toLowerCase().includes(criteria.text.toLowerCase())) {
            reasons.push(`Contains text "${criteria.text}"`);
        }
        if (criteria.clickable && element.isClickable) {
            reasons.push('Is clickable');
        }
        if (element.isVisible) {
            reasons.push('Is visible');
        }
        if (element.tagName === 'BUTTON') {
            reasons.push('Is a button element');
        }
        return reasons.join(', ') || 'Generic match';
    }
    /**
     * Calculate action confidence for actionable elements
     */
    calculateActionConfidence(element) {
        let confidence = 0;
        if (element.isVisible)
            confidence += 25;
        if (element.isClickable)
            confidence += 25;
        if (element.text.length > 0)
            confidence += 20;
        if (element.tagName === 'BUTTON')
            confidence += 20;
        if (element.attributes.type === 'submit')
            confidence += 15;
        if (element.id)
            confidence += 10;
        return confidence;
    }
    /**
     * Utility delay method
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EnhancedGlassBrowser = EnhancedGlassBrowser;
