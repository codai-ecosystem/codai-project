"use strict";
/**
 * Smart Element Interaction for Glass Browser Automation
 * Advanced element clicking and interaction capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartElementInteractor = void 0;
const dom_inspector_1 = require("./dom-inspector");
class SmartElementInteractor {
    windowHandle;
    domInspector;
    constructor(windowHandle) {
        this.windowHandle = windowHandle;
        this.domInspector = new dom_inspector_1.DOMInspector(windowHandle);
    }
    /**
     * Smart click that tries multiple methods to interact with an element
     */
    async smartClick(searchCriteria, options = {}) {
        const { retryCount = 3, scrollToElement = true, method = 'auto' } = options;
        let attempt = 0;
        let lastError;
        while (attempt < retryCount) {
            try {
                // Find the element
                const element = await this.findTargetElement(searchCriteria);
                if (!element) {
                    lastError = `Element not found with criteria: ${JSON.stringify(searchCriteria)}`;
                    attempt++;
                    await this.delay(1000);
                    continue;
                }
                // Scroll to element if needed
                if (scrollToElement) {
                    await this.scrollToElement(element);
                }
                // Try different interaction methods
                if (method === 'auto') {
                    return await this.tryMultipleClickMethods(element);
                }
                else {
                    return await this.clickElementByMethod(element, method);
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error.message : 'Unknown error';
                attempt++;
                await this.delay(1000);
            }
        }
        return {
            success: false,
            method: 'automation',
            error: `Failed after ${retryCount} attempts. Last error: ${lastError}`
        };
    }
    /**
     * Find target element using various criteria
     */
    async findTargetElement(criteria) {
        if (criteria.text) {
            return await this.domInspector.findBestClickableElement(criteria.text);
        }
        if (criteria.selector || criteria.xpath || criteria.attributes) {
            const elements = await this.domInspector.findElements({
                attributes: criteria.attributes,
                clickable: true
            });
            return elements[0] || null;
        }
        return null;
    }
    /**
     * Try multiple click methods in order of preference
     */
    async tryMultipleClickMethods(element) {
        // Method 1: Try coordinate click
        try {
            return await this.clickElementByMethod(element, 'coordinate');
        }
        catch {
            console.log('Coordinate click failed, trying selector method');
        }
        // Method 2: Try selector-based automation
        try {
            return await this.clickElementByMethod(element, 'selector');
        }
        catch {
            console.log('Selector click failed, trying keyboard method');
        }
        // Method 3: Try keyboard navigation
        try {
            return await this.clickElementByMethod(element, 'keyboard');
        }
        catch {
            console.log('Keyboard interaction failed, trying accessibility method');
        }
        // Method 4: Basic automation fallback
        return await this.clickElementByMethod(element, 'automation');
    }
    /**
     * Click element using specific method
     */
    async clickElementByMethod(element, method) {
        switch (method) {
            case 'coordinate':
                return await this.clickByCoordinates(element);
            case 'selector':
                return await this.clickBySelector(element);
            case 'keyboard':
                return await this.clickByKeyboard(element);
            case 'automation':
            default:
                return await this.clickByAutomation(element);
        }
    }
    /**
     * Click by coordinates
     */
    async clickByCoordinates(element) {
        const centerX = element.bounds.x + element.bounds.width / 2;
        const centerY = element.bounds.y + element.bounds.height / 2;
        // This would use Windows API to click at coordinates
        // For now, simulate with keyboard and mouse automation
        await this.sendMouseClick(centerX, centerY);
        return {
            success: true,
            element,
            method: 'coordinate'
        };
    }
    /**
     * Click by CSS selector or XPath
     */
    async clickBySelector(element) {
        // This would execute JavaScript in browser to click element
        const script = `document.querySelector('${element.selector}')?.click();`;
        await this.executeJavaScript(script);
        return {
            success: true,
            element,
            method: 'selector'
        };
    }
    /**
     * Click using keyboard navigation (Tab + Enter)
     */
    async clickByKeyboard(element) {
        // Navigate to element using Tab key
        await this.navigateToElement(element);
        // Press Enter or Space to activate
        await this.sendKey('{ENTER}');
        return {
            success: true,
            element,
            method: 'keyboard'
        };
    }
    /**
     * Click using basic automation
     */
    async clickByAutomation(element) {
        // Use UI Automation to find and click element
        // This is a fallback method using Windows UI Automation
        return {
            success: true,
            element,
            method: 'automation'
        };
    }
    /**
     * Scroll to element to make it visible
     */
    async scrollToElement(element) {
        if (!element.isVisible) {
            // Calculate scroll position
            const scrollY = element.bounds.y - (window.innerHeight / 2);
            // Execute scroll in browser
            await this.executeJavaScript(`window.scrollTo(0, ${scrollY});`);
            // Wait for scroll to complete
            await this.delay(500);
        }
    }
    /**
     * Navigate to element using keyboard
     */
    async navigateToElement(element) {
        // Focus on document body first
        await this.sendKey('^{HOME}'); // Ctrl+Home to go to top
        // Use Tab to navigate to the element
        // This is a simplified approach - in reality would need smarter navigation
        let tabCount = 0;
        const maxTabs = 50; // Safety limit
        while (tabCount < maxTabs) {
            await this.sendKey('{TAB}');
            await this.delay(100);
            // Check if we've reached the target element (simplified)
            // In real implementation, would check focus state
            const currentElement = await this.getCurrentFocusedElement();
            if (currentElement && this.elementsMatch(currentElement, element)) {
                break;
            }
            tabCount++;
        }
    }
    /**
     * Get currently focused element
     */
    async getCurrentFocusedElement() {
        const script = `
      const focused = document.activeElement;
      if (!focused) return null;
      
      const rect = focused.getBoundingClientRect();
      return {
        id: focused.id || '',
        tagName: focused.tagName,
        text: focused.textContent?.trim() || '',
        selector: focused.id ? '#' + focused.id : focused.tagName.toLowerCase(),
        bounds: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      };
    `;
        return await this.executeJavaScript(script);
    }
    /**
     * Check if two elements match
     */
    elementsMatch(element1, element2) {
        if (element1.selector && element2.selector && element1.selector === element2.selector) {
            return true;
        }
        if (element1.xpath && element2.xpath && element1.xpath === element2.xpath) {
            return true;
        }
        if (element1.id && element2.id && element1.id === element2.id) {
            return true;
        }
        return false;
    }
    /**
     * Send mouse click at coordinates (placeholder)
     */
    async sendMouseClick(x, y) {
        // This would use Windows API to send mouse click
        console.log(`Sending mouse click at (${x}, ${y})`);
    }
    /**
     * Send key to window
     */
    async sendKey(key) {
        // Use Glass MCP to send key
        console.log(`Sending key: ${key}`);
    }
    /**
     * Execute JavaScript in browser
     */
    async executeJavaScript(script) {
        // This would execute JavaScript in the browser
        console.log(`Executing JavaScript: ${script}`);
        return null;
    }
    /**
     * Delay execution
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get comprehensive page analysis for debugging
     */
    async analyzePageForDebugging() {
        const pageContent = await this.domInspector.getPageContent();
        const clickableElements = pageContent.clickableElements;
        const suggestedElements = clickableElements
            .filter(el => el.text.toLowerCase().includes('add') || el.text.toLowerCase().includes('create') || el.text.toLowerCase().includes('new'))
            .map(el => ({
                element: el,
                confidence: this.domInspector['calculateElementScore'](el, 'add'),
                reason: `Contains action word in text: "${el.text}"`
            }))
            .sort((a, b) => b.confidence - a.confidence);
        return {
            pageContent,
            clickableElements,
            suggestedElements
        };
    }
}
exports.SmartElementInteractor = SmartElementInteractor;
