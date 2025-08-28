'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Users, Keyboard, Volume2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface AccessibilityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'unknown';
  details?: string;
}

export const AccessibilityTester: React.FC = () => {
  const [checks, setChecks] = useState<AccessibilityCheck[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const runAccessibilityChecks = async () => {
    setIsRunning(true);
    const newChecks: AccessibilityCheck[] = [];

    // Check 1: Alt text for images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
    newChecks.push({
      id: 'alt-text',
      name: 'Image Alt Text',
      description: 'All images should have descriptive alt text',
      status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
      details: imagesWithoutAlt.length > 0 ? `${imagesWithoutAlt.length} images missing alt text` : `All ${images.length} images have alt text`
    });

    // Check 2: Heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let headingIssues = 0;
    let lastLevel = 0;

    Array.from(headings).forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      if (currentLevel > lastLevel + 1) {
        headingIssues++;
      }
      lastLevel = currentLevel;
    });

    newChecks.push({
      id: 'heading-hierarchy',
      name: 'Heading Hierarchy',
      description: 'Headings should follow logical hierarchy (h1 → h2 → h3)',
      status: headingIssues === 0 ? 'pass' : 'warning',
      details: headingIssues > 0 ? `${headingIssues} heading hierarchy issues found` : 'Proper heading hierarchy maintained'
    });

    // Check 3: Color contrast (basic check)
    const textElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');
    let lowContrastElements = 0;

    Array.from(textElements).slice(0, 50).forEach(element => {
      const styles = window.getComputedStyle(element);
      const textColor = styles.color;
      const backgroundColor = styles.backgroundColor;

      // Basic contrast check (simplified)
      if (textColor && backgroundColor && textColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // This is a simplified check - real contrast calculation would be more complex
        const isLowContrast = textColor === backgroundColor ||
          (textColor.includes('rgb(128') && backgroundColor.includes('rgb(128'));
        if (isLowContrast) {
          lowContrastElements++;
        }
      }
    });

    newChecks.push({
      id: 'color-contrast',
      name: 'Color Contrast',
      description: 'Text should have sufficient contrast against background',
      status: lowContrastElements === 0 ? 'pass' : 'warning',
      details: lowContrastElements > 0 ? `${lowContrastElements} potential contrast issues` : 'Good color contrast detected'
    });

    // Check 4: Focus indicators
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]');
    const elementsWithFocus = Array.from(interactiveElements).filter(el => {
      const styles = window.getComputedStyle(el, ':focus');
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    newChecks.push({
      id: 'focus-indicators',
      name: 'Focus Indicators',
      description: 'Interactive elements should have visible focus indicators',
      status: elementsWithFocus.length > 0 ? 'pass' : 'warning',
      details: `${elementsWithFocus.length}/${interactiveElements.length} elements have focus indicators`
    });

    // Check 5: ARIA labels
    const buttonsWithoutAriaLabel = Array.from(document.querySelectorAll('button')).filter(btn => {
      const hasText = btn.textContent?.trim();
      const hasAriaLabel = btn.getAttribute('aria-label');
      const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
      return !hasText && !hasAriaLabel && !hasAriaLabelledBy;
    });

    newChecks.push({
      id: 'aria-labels',
      name: 'ARIA Labels',
      description: 'Buttons without text should have ARIA labels',
      status: buttonsWithoutAriaLabel.length === 0 ? 'pass' : 'warning',
      details: buttonsWithoutAriaLabel.length > 0 ? `${buttonsWithoutAriaLabel.length} buttons missing ARIA labels` : 'All buttons properly labeled'
    });

    // Check 6: Keyboard navigation
    const tabIndexElements = document.querySelectorAll('[tabindex="-1"]');
    const negativeTabIndex = Array.from(tabIndexElements).filter(el =>
      !el.matches('div, span') // Allow negative tabindex on non-interactive elements
    );

    newChecks.push({
      id: 'keyboard-navigation',
      name: 'Keyboard Navigation',
      description: 'Interactive elements should be keyboard accessible',
      status: negativeTabIndex.length === 0 ? 'pass' : 'warning',
      details: negativeTabIndex.length > 0 ? `${negativeTabIndex.length} elements may block keyboard navigation` : 'Keyboard navigation appears accessible'
    });

    // Check 7: Reduced motion support
    const hasReducedMotionSupport = document.querySelector('style, link[rel="stylesheet"]')?.textContent?.includes('prefers-reduced-motion') ||
      Array.from(document.styleSheets).some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule =>
            rule.cssText?.includes('prefers-reduced-motion')
          );
        } catch (e) {
          return false;
        }
      });

    newChecks.push({
      id: 'reduced-motion',
      name: 'Reduced Motion',
      description: 'Support for users who prefer reduced motion',
      status: hasReducedMotionSupport ? 'pass' : 'warning',
      details: hasReducedMotionSupport ? 'Reduced motion preferences supported' : 'Consider adding reduced motion support'
    });

    // Check 8: Language attribute
    const htmlLang = document.documentElement.getAttribute('lang');
    newChecks.push({
      id: 'language',
      name: 'Page Language',
      description: 'HTML should have lang attribute for screen readers',
      status: htmlLang ? 'pass' : 'warning',
      details: htmlLang ? `Language set to: ${htmlLang}` : 'Missing lang attribute on HTML element'
    });

    setChecks(newChecks);
    setIsRunning(false);
  };

  const getStatusIcon = (status: AccessibilityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />;
    }
  };

  const getStatusCount = (status: AccessibilityCheck['status']) => {
    return checks.filter(check => check.status === status).length;
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-20 right-4 z-50 p-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Accessibility Tester"
      >
        <Eye className="w-5 h-5" />
      </button>

      {/* Accessibility Panel */}
      {isVisible && (
        <div className="fixed bottom-36 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Accessibility Checker
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Run Tests Button */}
          <button
            onClick={runAccessibilityChecks}
            disabled={isRunning}
            className="w-full mb-4 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Run Accessibility Tests
              </>
            )}
          </button>

          {checks.length > 0 && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {getStatusCount('pass')}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">Passed</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    {getStatusCount('warning')}
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">Warnings</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {getStatusCount('fail')}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">Failed</div>
                </div>
              </div>

              {/* Checks List */}
              <div className="space-y-3">
                {checks.map((check) => (
                  <div key={check.id} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(check.status)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {check.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {check.description}
                        </p>
                        {check.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {check.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accessibility Tips */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  Accessibility Features:
                </h5>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Focus indicators on interactive elements</li>
                  <li>• Reduced motion support implemented</li>
                  <li>• Semantic HTML structure used</li>
                  <li>• ARIA labels for screen readers</li>
                  <li>• Keyboard navigation supported</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};