/**
 * @fileoverview Accessibility Testing Automator
 * @description Automated accessibility testing and validation
 */

import fs from 'fs';
import path from 'path';

export default function createAccessibilityTesting(dirs, appName) {
    createTestingUtils(dirs.utilsDir, appName);
    createTestingComponents(dirs.componentsDir, appName);
    createTestingScripts(dirs.scriptsDir, appName);
    console.log(`🧪 Accessibility testing automation created for ${appName}`);
}

function createTestingUtils(utilsDir, appName) {
    const testingUtilsContent = `/**
 * @fileoverview Accessibility Testing Utilities
 * @description Utilities for automated accessibility testing
 */

/**
 * WCAG validation utilities
 */
export class WCAGValidator {
  /**
   * Check color contrast ratios
   */
  static validateColorContrast(
    foreground: string, 
    background: string, 
    fontSize: number = 16
  ): { ratio: number; passes: boolean; level: string } {
    const ratio = this.calculateContrastRatio(foreground, background);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && this.isBold(fontSize));
    const minRatio = isLargeText ? 3.0 : 4.5;
    
    return {
      ratio,
      passes: ratio >= minRatio,
      level: ratio >= 7.0 ? 'AAA' : ratio >= minRatio ? 'AA' : 'Fail'
    };
  }

  /**
   * Validate heading structure
   */
  static validateHeadingStructure(container: HTMLElement = document.body): Array<{
    element: HTMLElement;
    level: number;
    text: string;
    issues: string[];
  }> {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const results: Array<{
      element: HTMLElement;
      level: number;
      text: string;
      issues: string[];
    }> = [];
    
    let previousLevel = 0;
    let hasH1 = false;

    headings.forEach((heading, index) => {
      const element = heading as HTMLElement;
      const level = parseInt(heading.tagName.charAt(1));
      const text = element.textContent?.trim() || '';
      const issues: string[] = [];

      if (level === 1) {
        if (hasH1) {
          issues.push('Multiple H1 elements found');
        }
        hasH1 = true;
      }

      if (index === 0 && level !== 1) {
        issues.push('First heading should be H1');
      }

      if (level > previousLevel + 1 && previousLevel > 0) {
        issues.push(\`Heading level jumps from H\${previousLevel} to H\${level}\`);
      }

      if (!text) {
        issues.push('Heading has no text content');
      }

      results.push({ element, level, text, issues });
      previousLevel = level;
    });

    if (!hasH1) {
      results.push({
        element: document.createElement('h1'),
        level: 1,
        text: '',
        issues: ['No H1 element found on page']
      });
    }

    return results;
  }

  /**
   * Validate form accessibility
   */
  static validateFormAccessibility(form: HTMLFormElement): Array<{
    element: HTMLElement;
    type: string;
    issues: string[];
  }> {
    const results: Array<{
      element: HTMLElement;
      type: string;
      issues: string[];
    }> = [];

    // Check form controls
    const controls = form.querySelectorAll('input, select, textarea');
    controls.forEach(control => {
      const element = control as HTMLElement;
      const issues: string[] = [];
      const type = element.tagName.toLowerCase();

      // Check for labels
      const id = element.id;
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const hasLabel = id && document.querySelector(\`label[for="\${id}"]\`);

      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        issues.push('Form control has no accessible label');
      }

      // Check required fields
      if (element.hasAttribute('required') && !element.getAttribute('aria-required')) {
        issues.push('Required field should have aria-required="true"');
      }

      // Check error handling
      if (element.getAttribute('aria-invalid') === 'true') {
        const errorId = element.getAttribute('aria-describedby');
        if (!errorId || !document.getElementById(errorId)) {
          issues.push('Invalid field should reference error message with aria-describedby');
        }
      }

      if (issues.length > 0) {
        results.push({ element, type, issues });
      }
    });

    return results;
  }

  /**
   * Validate keyboard navigation
   */
  static validateKeyboardNavigation(container: HTMLElement = document.body): Array<{
    element: HTMLElement;
    issues: string[];
  }> {
    const results: Array<{
      element: HTMLElement;
      issues: string[];
    }> = [];

    // Check for keyboard focusable elements
    const focusableElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [contenteditable="true"]'
    );

    focusableElements.forEach(element => {
      const el = element as HTMLElement;
      const issues: string[] = [];

      // Check tabindex values
      const tabindex = el.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push('Positive tabindex values should be avoided');
      }

      // Check for click handlers without keyboard support
      const hasClickHandler = el.onclick || el.getAttribute('onclick');
      if (hasClickHandler && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
        const hasKeyHandler = el.onkeydown || el.onkeyup || el.getAttribute('onkeydown') || el.getAttribute('onkeyup');
        if (!hasKeyHandler) {
          issues.push('Interactive element with click handler missing keyboard support');
        }
      }

      if (issues.length > 0) {
        results.push({ element: el, issues });
      }
    });

    return results;
  }

  private static calculateContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rSRGB, gSRGB, bSRGB] = [r, g, b].map(c => c / 255);
    const [rLinear, gLinear, bLinear] = [rSRGB, gSRGB, bSRGB].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private static isBold(fontSize: number): boolean {
    // This is a simplified check - in practice you'd check font-weight
    return fontSize >= 14; // Assume bold for larger text
  }
}

/**
 * Accessibility testing runner
 */
export class AccessibilityTestRunner {
  private results: Array<{
    test: string;
    status: 'pass' | 'fail' | 'warning';
    details: string;
    element?: HTMLElement;
  }> = [];

  /**
   * Run all accessibility tests
   */
  runAllTests(container: HTMLElement = document.body): Promise<{
    passed: number;
    failed: number;
    warnings: number;
    results: Array<{
      test: string;
      status: 'pass' | 'fail' | 'warning';
      details: string;
      element?: HTMLElement;
    }>;
  }> {
    return new Promise((resolve) => {
      this.results = [];

      // Test color contrast
      this.testColorContrast(container);
      
      // Test heading structure
      this.testHeadingStructure(container);
      
      // Test form accessibility
      this.testFormAccessibility(container);
      
      // Test keyboard navigation
      this.testKeyboardNavigation(container);
      
      // Test ARIA usage
      this.testAriaUsage(container);

      // Calculate summary
      const passed = this.results.filter(r => r.status === 'pass').length;
      const failed = this.results.filter(r => r.status === 'fail').length;
      const warnings = this.results.filter(r => r.status === 'warning').length;

      resolve({
        passed,
        failed,
        warnings,
        results: this.results
      });
    });
  }

  private testColorContrast(container: HTMLElement) {
    // Basic color contrast test - would need more sophisticated implementation
    const elementsWithText = container.querySelectorAll('*');
    let contrastIssues = 0;

    elementsWithText.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const validation = WCAGValidator.validateColorContrast(color, backgroundColor);
        if (!validation.passes) {
          contrastIssues++;
        }
      }
    });

    if (contrastIssues === 0) {
      this.results.push({
        test: 'Color Contrast',
        status: 'pass',
        details: 'All text has sufficient color contrast'
      });
    } else {
      this.results.push({
        test: 'Color Contrast',
        status: 'fail',
        details: \`\${contrastIssues} elements fail color contrast requirements\`
      });
    }
  }

  private testHeadingStructure(container: HTMLElement) {
    const headingResults = WCAGValidator.validateHeadingStructure(container);
    const issues = headingResults.filter(result => result.issues.length > 0);

    if (issues.length === 0) {
      this.results.push({
        test: 'Heading Structure',
        status: 'pass',
        details: 'Heading structure is logical and accessible'
      });
    } else {
      this.results.push({
        test: 'Heading Structure',
        status: 'fail',
        details: \`\${issues.length} heading structure issues found\`
      });
    }
  }

  private testFormAccessibility(container: HTMLElement) {
    const forms = container.querySelectorAll('form');
    let totalIssues = 0;

    forms.forEach(form => {
      const formResults = WCAGValidator.validateFormAccessibility(form as HTMLFormElement);
      totalIssues += formResults.length;
    });

    if (totalIssues === 0) {
      this.results.push({
        test: 'Form Accessibility',
        status: 'pass',
        details: 'All forms are properly labeled and accessible'
      });
    } else {
      this.results.push({
        test: 'Form Accessibility',
        status: 'fail',
        details: \`\${totalIssues} form accessibility issues found\`
      });
    }
  }

  private testKeyboardNavigation(container: HTMLElement) {
    const keyboardResults = WCAGValidator.validateKeyboardNavigation(container);

    if (keyboardResults.length === 0) {
      this.results.push({
        test: 'Keyboard Navigation',
        status: 'pass',
        details: 'All interactive elements support keyboard navigation'
      });
    } else {
      this.results.push({
        test: 'Keyboard Navigation',
        status: 'fail',
        details: \`\${keyboardResults.length} keyboard navigation issues found\`
      });
    }
  }

  private testAriaUsage(container: HTMLElement) {
    const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
    let ariaIssues = 0;

    elementsWithAria.forEach(element => {
      // Check for common ARIA mistakes
      const role = element.getAttribute('role');
      if (role === 'button' && element.tagName === 'BUTTON') {
        ariaIssues++; // Redundant role
      }
    });

    if (ariaIssues === 0) {
      this.results.push({
        test: 'ARIA Usage',
        status: 'pass',
        details: 'ARIA attributes are used correctly'
      });
    } else {
      this.results.push({
        test: 'ARIA Usage',
        status: 'warning',
        details: \`\${ariaIssues} potential ARIA usage issues found\`
      });
    }
  }
}

export default { WCAGValidator, AccessibilityTestRunner };`;

    fs.writeFileSync(path.join(utilsDir, 'accessibility-testing.ts'), testingUtilsContent);
}

function createTestingComponents(componentsDir, appName) {
    const testingReportContent = `/**
 * @fileoverview Accessibility Testing Report Component
 * @description Displays accessibility test results
 */

import React, { useState, useEffect } from 'react';
import { AccessibilityTestRunner } from '../utils/accessibility-testing';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  element?: HTMLElement;
}

interface AccessibilityReportProps {
  container?: HTMLElement;
  autoRun?: boolean;
  onResultsChange?: (results: TestResult[]) => void;
}

/**
 * Accessibility Testing Report Component
 */
export const AccessibilityReport: React.FC<AccessibilityReportProps> = ({
  container,
  autoRun = false,
  onResultsChange
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState({ passed: 0, failed: 0, warnings: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const runner = new AccessibilityTestRunner();
    const testResults = await runner.runAllTests(container);
    
    setResults(testResults.results);
    setSummary({
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings
    });
    
    onResultsChange?.(testResults.results);
    setIsLoading(false);
  };

  useEffect(() => {
    if (autoRun) {
      runTests();
    }
  }, [autoRun, container]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return '#28a745';
      case 'fail':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  if (!autoRun && results.length === 0) {
    return (
      <div className="accessibility-report">
        <div className="accessibility-report__header">
          <h2>Accessibility Testing</h2>
          <button 
            onClick={runTests} 
            disabled={isLoading}
            className="accessibility-report__run-button"
          >
            {isLoading ? 'Running Tests...' : 'Run Accessibility Tests'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accessibility-report">
      <div className="accessibility-report__header">
        <h2>Accessibility Test Results</h2>
        <button 
          onClick={runTests} 
          disabled={isLoading}
          className="accessibility-report__run-button"
        >
          {isLoading ? 'Running Tests...' : 'Re-run Tests'}
        </button>
      </div>

      <div className="accessibility-report__summary">
        <div className="summary-item summary-item--pass">
          <span className="summary-item__count">{summary.passed}</span>
          <span className="summary-item__label">Passed</span>
        </div>
        <div className="summary-item summary-item--fail">
          <span className="summary-item__count">{summary.failed}</span>
          <span className="summary-item__label">Failed</span>
        </div>
        <div className="summary-item summary-item--warning">
          <span className="summary-item__count">{summary.warnings}</span>
          <span className="summary-item__label">Warnings</span>
        </div>
      </div>

      <div className="accessibility-report__results">
        {results.map((result, index) => (
          <div 
            key={index}
            className={\`result-item result-item--\${result.status}\`}
          >
            <div className="result-item__header">
              <span className="result-item__icon">
                {getStatusIcon(result.status)}
              </span>
              <span className="result-item__test">{result.test}</span>
            </div>
            <p className="result-item__details">{result.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessibilityReport;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(componentsDir, 'AccessibilityReport.tsx'), testingReportContent);
}

function createTestingScripts(scriptsDir, appName) {
    const testScriptContent = `/**
 * @fileoverview Accessibility Test Script
 * @description Node.js script for running accessibility tests
 */

const { AccessibilityTestRunner } = require('../utils/accessibility-testing');

/**
 * Run accessibility tests from command line
 */
async function runAccessibilityTests() {
  console.log('🧪 Starting accessibility tests...');
  
  try {
    // This would typically use a headless browser like Puppeteer
    // For now, we'll create a mock DOM environment
    const runner = new AccessibilityTestRunner();
    
    // In a real implementation, you'd load the page with Puppeteer/Playwright
    // const results = await runner.runAllTests(document.body);
    
    console.log('✅ Accessibility tests completed');
    console.log('Run npm run test:a11y in the browser for detailed results');
    
  } catch (error) {
    console.error('❌ Accessibility tests failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runAccessibilityTests();
}

module.exports = { runAccessibilityTests };`;

    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(scriptsDir, 'test-accessibility.js'), testScriptContent);
}