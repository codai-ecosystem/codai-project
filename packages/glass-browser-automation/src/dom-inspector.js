"use strict";
/**
 * DOM Inspector for Glass Browser Automation
 * Advanced browser content reading and element identification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMInspector = void 0;
class DOMInspector {
  windowHandle;
  constructor(windowHandle) {
    this.windowHandle = windowHandle;
  }
  /**
   * Get comprehensive page content including all interactive elements
   */
  async getPageContent() {
    // Inject DOM inspection script into the browser
    const inspectionScript = this.generateInspectionScript();
    // This would be executed via browser automation
    const rawContent = await this.executeScript(inspectionScript);
    return this.parsePageContent(rawContent);
  }
  /**
   * Find elements by various criteria
   */
  async findElements(criteria) {
    const pageContent = await this.getPageContent();
    return pageContent.elements.filter(element => {
      if (criteria.text && !element.text.toLowerCase().includes(criteria.text.toLowerCase())) {
        return false;
      }
      if (criteria.tag && element.tagName.toLowerCase() !== criteria.tag.toLowerCase()) {
        return false;
      }
      if (criteria.role && element.role !== criteria.role) {
        return false;
      }
      if (criteria.containsText && !element.text.toLowerCase().includes(criteria.containsText.toLowerCase())) {
        return false;
      }
      if (criteria.clickable && !element.isClickable) {
        return false;
      }
      if (criteria.attributes) {
        for (const [key, value] of Object.entries(criteria.attributes)) {
          if (element.attributes[key] !== value) {
            return false;
          }
        }
      }
      return true;
    });
  }
  /**
   * Find the best clickable element based on text content
   */
  async findBestClickableElement(searchText) {
    const elements = await this.findElements({
      containsText: searchText,
      clickable: true
    });
    if (elements.length === 0) {
      return null;
    }
    // Sort by text similarity and visibility
    return elements.sort((a, b) => {
      const aScore = this.calculateElementScore(a, searchText);
      const bScore = this.calculateElementScore(b, searchText);
      return bScore - aScore;
    })[0];
  }
  /**
   * Generate JavaScript for DOM inspection
   */
  generateInspectionScript() {
    return `
    (function() {
      const elements = [];
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);
        
        // Skip invisible elements
        if (rect.width === 0 && rect.height === 0) return;
        if (computedStyle.display === 'none') return;
        if (computedStyle.visibility === 'hidden') return;
        
        const isClickable = (
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          el.tagName === 'INPUT' ||
          el.type === 'button' ||
          el.type === 'submit' ||
          el.onclick !== null ||
          el.getAttribute('role') === 'button' ||
          computedStyle.cursor === 'pointer' ||
          el.getAttribute('tabindex') !== null
        );
        
        const attributes = {};
        for (let attr of el.attributes) {
          attributes[attr.name] = attr.value;
        }
        
        const aria = {};
        for (let attr of el.attributes) {
          if (attr.name.startsWith('aria-')) {
            aria[attr.name] = attr.value;
          }
        }
        
        elements.push({
          id: el.id || 'element_' + index,
          tagName: el.tagName,
          text: el.textContent?.trim() || '',
          attributes: attributes,
          bounds: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          },
          isVisible: rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0,
          isClickable: isClickable,
          selector: this.generateSelector(el),
          xpath: this.generateXPath(el),
          role: el.getAttribute('role') || undefined,
          aria: Object.keys(aria).length > 0 ? aria : undefined
        });
      });
      
      return {
        url: window.location.href,
        title: document.title,
        elements: elements,
        clickableElements: elements.filter(el => el.isClickable),
        formElements: elements.filter(el => ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)),
        buttons: elements.filter(el => el.tagName === 'BUTTON' || el.attributes.type === 'button' || el.attributes.type === 'submit'),
        links: elements.filter(el => el.tagName === 'A'),
        inputs: elements.filter(el => el.tagName === 'INPUT')
      };
      
      // Helper function to generate CSS selector
      function generateSelector(el) {
        if (el.id) return '#' + el.id;
        
        let selector = el.tagName.toLowerCase();
        
        if (el.className) {
          selector += '.' + el.className.split(' ').join('.');
        }
        
        // Add parent context if needed
        let parent = el.parentElement;
        if (parent && parent.tagName !== 'BODY') {
          let parentSelector = parent.tagName.toLowerCase();
          if (parent.id) parentSelector += '#' + parent.id;
          else if (parent.className) parentSelector += '.' + parent.className.split(' ')[0];
          selector = parentSelector + ' > ' + selector;
        }
        
        return selector;
      }
      
      // Helper function to generate XPath
      function generateXPath(el) {
        if (el.id) return '//*[@id="' + el.id + '"]';
        
        let path = '';
        let current = el;
        
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let tagName = current.tagName.toLowerCase();
          let siblings = Array.from(current.parentNode?.children || []);
          let index = siblings.filter(sibling => sibling.tagName === current.tagName).indexOf(current) + 1;
          
          if (index > 1) {
            tagName += '[' + index + ']';
          }
          
          path = '/' + tagName + path;
          current = current.parentElement;
        }
        
        return path;
      }
    })();
    `;
  }
  /**
   * Execute script in browser (placeholder - would integrate with actual browser automation)
   */
  async executeScript(/* _script */) {
    // This would be implemented to execute JavaScript in the browser
    // For now, return mock data
    console.log('Executing script in browser:', this.windowHandle);
    // In real implementation, this would:
    // 1. Inject script into browser
    // 2. Execute it
    // 3. Return results
    return {
      url: 'https://vercel.com/codai-ro/codai/settings/environment-variables',
      title: 'Environment Variables - Vercel',
      elements: [
        {
          id: 'add-env-var-button',
          tagName: 'BUTTON',
          text: 'Add',
          attributes: { class: 'add-button', type: 'button' },
          bounds: { x: 100, y: 200, width: 80, height: 32 },
          isVisible: true,
          isClickable: true,
          selector: 'button.add-button',
          xpath: '//button[@class="add-button"]',
          role: 'button'
        }
      ]
    };
  }
  /**
   * Parse raw page content into structured format
   */
  parsePageContent(rawContent) {
    return rawContent;
  }
  /**
   * Calculate element relevance score
   */
  calculateElementScore(element, searchText) {
    let score = 0;
    // Exact text match gets highest score
    if (element.text.toLowerCase() === searchText.toLowerCase()) {
      score += 100;
    }
    // Text contains search term
    if (element.text.toLowerCase().includes(searchText.toLowerCase())) {
      score += 50;
    }
    // Clickable elements get bonus
    if (element.isClickable) {
      score += 25;
    }
    // Visible elements get bonus
    if (element.isVisible) {
      score += 15;
    }
    // Button elements get bonus for action-oriented searches
    if (element.tagName === 'BUTTON') {
      score += 20;
    }
    // Elements with IDs get slight bonus
    if (element.id && !element.id.startsWith('element_')) {
      score += 5;
    }
    return score;
  }
}
exports.DOMInspector = DOMInspector;
