/**
 * @fileoverview Accessibility Configuration Creator
 * @description Creates comprehensive accessibility configuration and setup
 */

import fs from 'fs';
import path from 'path';

export default function createAccessibilityConfig(dirs, appName) {
    createA11yProvider(dirs.componentsDir, appName);
    createA11yHooks(dirs.hooksDir, appName);
    createA11yUtils(dirs.utilsDir, appName);
    createA11yTypes(dirs.utilsDir, appName);
    console.log(`🌟 Accessibility configuration created for ${appName}`);
}

function createA11yProvider(componentsDir, appName) {
    const providerContent = `/**
 * @fileoverview Accessibility Provider
 * @description Provides accessibility context and utilities throughout the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  focusedElementId: string | null;
  setFocusedElementId: (id: string | null) => void;
  keyboardNavigation: boolean;
  setKeyboardNavigation: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Accessibility Provider Component
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Live region for announcements
  const [liveRegionContent, setLiveRegionContent] = useState('');
  const [liveRegionPriority, setLiveRegionPriority] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Check for high contrast preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Detect keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setLiveRegionContent(message);
    setLiveRegionPriority(priority);
    
    // Clear the message after announcement
    setTimeout(() => {
      setLiveRegionContent('');
    }, 1000);
  };

  const value: AccessibilityContextType = {
    announceMessage,
    isReducedMotion,
    isHighContrast,
    focusedElementId,
    setFocusedElementId,
    keyboardNavigation,
    setKeyboardNavigation
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Live regions for screen reader announcements */}
      <div
        aria-live={liveRegionPriority}
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {liveRegionContent}
      </div>
      
      {/* Screen reader only content */}
      <div className="sr-only">
        <h1>Accessibility Features Enabled</h1>
        <p>This application supports full keyboard navigation and screen readers.</p>
      </div>
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to use accessibility context
 */
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

/**
 * HOC to wrap components with accessibility features
 */
export function withAccessibility<T extends {}>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  const WrappedComponent = (props: T) => (
    <AccessibilityProvider>
      <Component {...props} />
    </AccessibilityProvider>
  );
  
  WrappedComponent.displayName = \`withAccessibility(\${Component.displayName || Component.name})\`;
  
  return WrappedComponent;
}

export default AccessibilityProvider;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(componentsDir, 'AccessibilityProvider.tsx'), providerContent);
}

function createA11yHooks(hooksDir, appName) {
    const hooksContent = `/**
 * @fileoverview Accessibility Hooks
 * @description Custom React hooks for accessibility features
 */

import { useEffect, useRef, useState, RefObject, MutableRefObject } from 'react';
import { useAccessibility } from '../components/AccessibilityProvider';

/**
 * Hook for managing focus
 */
export const useFocus = <T extends HTMLElement = HTMLElement>(): [RefObject<T>, () => void] => {
  const elementRef = useRef<T>(null);
  
  const setFocus = () => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  };
  
  return [elementRef, setFocus];
};

/**
 * Hook for focus trap (useful for modals, dropdowns)
 */
export const useFocusTrap = <T extends HTMLElement = HTMLElement>(
  isActive: boolean = true
): RefObject<T> => {
  const containerRef = useRef<T>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
  
  return containerRef;
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) => {
  const { keyboardNavigation } = useAccessibility();
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!keyboardNavigation) return;
    
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('up');
        }
        break;
      case 'ArrowDown':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('down');
        }
        break;
      case 'ArrowLeft':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('left');
        }
        break;
      case 'ArrowRight':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('right');
        }
        break;
    }
  };
  
  return { handleKeyDown, isKeyboardUser: keyboardNavigation };
};

/**
 * Hook for managing ARIA announcements
 */
export const useAnnouncer = () => {
  const { announceMessage } = useAccessibility();
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceMessage(message, priority);
  };
  
  const announceError = (message: string) => {
    announce(\`Error: \${message}\`, 'assertive');
  };
  
  const announceSuccess = (message: string) => {
    announce(\`Success: \${message}\`, 'polite');
  };
  
  const announceLoading = (message: string = 'Loading') => {
    announce(message, 'polite');
  };
  
  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading
  };
};

/**
 * Hook for skip links
 */
export const useSkipLinks = () => {
  const skipToContent = () => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent instanceof HTMLElement) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };
  
  const skipToNavigation = () => {
    const navigation = document.querySelector('nav, [role="navigation"], #main-navigation');
    if (navigation instanceof HTMLElement) {
      const firstLink = navigation.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  };
  
  return {
    skipToContent,
    skipToNavigation
  };
};

/**
 * Hook for managing expanded/collapsed state with ARIA
 */
export const useExpandable = (initialExpanded: boolean = false) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  const toggle = () => {
    setIsExpanded(prev => !prev);
  };
  
  const expand = () => {
    setIsExpanded(true);
  };
  
  const collapse = () => {
    setIsExpanded(false);
  };
  
  const ariaProps = {
    'aria-expanded': isExpanded,
    'aria-controls': undefined as string | undefined
  };
  
  const setControlledElementId = (id: string) => {
    ariaProps['aria-controls'] = id;
  };
  
  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    ariaProps,
    setControlledElementId
  };
};

/**
 * Hook for form accessibility
 */
export const useFormAccessibility = () => {
  const { announceMessage } = useAccessibility();
  
  const announceValidationError = (field: string, error: string) => {
    announceMessage(\`\${field}: \${error}\`, 'assertive');
  };
  
  const announceFormSubmission = (isSubmitting: boolean, isSuccess?: boolean, message?: string) => {
    if (isSubmitting) {
      announceMessage('Form is being submitted', 'polite');
    } else if (isSuccess !== undefined) {
      if (isSuccess) {
        announceMessage(message || 'Form submitted successfully', 'polite');
      } else {
        announceMessage(message || 'Form submission failed', 'assertive');
      }
    }
  };
  
  return {
    announceValidationError,
    announceFormSubmission
  };
};

/**
 * Hook for managing modal accessibility
 */
export const useModalAccessibility = (isOpen: boolean) => {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Add aria-hidden to main content
      const mainContent = document.querySelector('main, [role="main"], #root > *:not([role="dialog"])');
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Remove aria-hidden from main content
      const mainContent = document.querySelector('main, [role="main"], [aria-hidden="true"]');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
      
      // Return focus to previously focused element
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleEscapeKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // This should be handled by the parent component
      event.stopPropagation();
    }
  };
  
  return {
    modalRef,
    handleEscapeKey
  };
};

/**
 * Hook for reduced motion preference
 */
export const useReducedMotion = () => {
  const { isReducedMotion } = useAccessibility();
  
  const getAnimationProps = (animatedProps: object, staticProps: object = {}) => {
    return isReducedMotion ? staticProps : animatedProps;
  };
  
  return {
    isReducedMotion,
    getAnimationProps
  };
};

/**
 * Hook for high contrast preference
 */
export const useHighContrast = () => {
  const { isHighContrast } = useAccessibility();
  
  return {
    isHighContrast
  };
};

export default {
  useFocus,
  useFocusTrap,
  useKeyboardNavigation,
  useAnnouncer,
  useSkipLinks,
  useExpandable,
  useFormAccessibility,
  useModalAccessibility,
  useReducedMotion,
  useHighContrast
};`;

    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }
    fs.writeFileSync(path.join(hooksDir, 'useAccessibility.ts'), hooksContent);
}

function createA11yUtils(utilsDir, appName) {
    const utilsContent = `/**
 * @fileoverview Accessibility Utilities
 * @description Utility functions for accessibility features
 */

/**
 * Color contrast calculation utilities
 */
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   */
  static getRelativeLuminance(hexColor: string): number {
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rSRGB, gSRGB, bSRGB] = [r, g, b].map(c => c / 255);
    const [rLinear, gLinear, bLinear] = [rSRGB, gSRGB, bSRGB].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }
  
  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getRelativeLuminance(color1);
    const luminance2 = this.getRelativeLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  /**
   * Check if color combination meets WCAG AA standards
   */
  static meetsWCAG_AA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    const threshold = isLargeText ? 3.0 : 4.5;
    return ratio >= threshold;
  }
  
  /**
   * Check if color combination meets WCAG AAA standards
   */
  static meetsWCAG_AAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    const threshold = isLargeText ? 4.5 : 7.0;
    return ratio >= threshold;
  }
  
  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

/**
 * ARIA utilities
 */
export class AriaUtils {
  /**
   * Generate unique ARIA ID
   */
  static generateId(prefix: string = 'aria'): string {
    return \`\${prefix}-\${Math.random().toString(36).substr(2, 9)}\`;
  }
  
  /**
   * Create ARIA label from element content
   */
  static createLabelFromContent(element: HTMLElement): string {
    const text = element.textContent || element.innerText || '';
    return text.trim().replace(/\\s+/g, ' ');
  }
  
  /**
   * Set ARIA live region content
   */
  static announceLive(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  }
  
  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return focusableSelectors.some(selector => 
      element.matches(selector) || element.querySelector(selector) !== null
    );
  }
  
  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardUtils {
  /**
   * Check if key is navigation key
   */
  static isNavigationKey(key: string): boolean {
    const navigationKeys = [
      'Tab', 'Enter', ' ', 'Escape',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown'
    ];
    return navigationKeys.includes(key);
  }
  
  /**
   * Handle roving tabindex for lists
   */
  static handleRovingTabindex(
    items: HTMLElement[],
    currentIndex: number,
    direction: 'next' | 'previous' | 'first' | 'last'
  ): number {
    let newIndex = currentIndex;
    
    switch (direction) {
      case 'next':
        newIndex = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
        break;
      case 'previous':
        newIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = items.length - 1;
        break;
    }
    
    // Update tabindex attributes
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === newIndex ? '0' : '-1');
    });
    
    // Focus the new item
    items[newIndex]?.focus();
    
    return newIndex;
  }
}

/**
 * Screen reader utilities
 */
export class ScreenReaderUtils {
  /**
   * Check if screen reader is detected
   */
  static isScreenReaderDetected(): boolean {
    // This is a basic detection method
    // More sophisticated detection would require additional setup
    return window.speechSynthesis !== undefined || 
           'webkitSpeechSynthesis' in window ||
           navigator.userAgent.includes('NVDA') ||
           navigator.userAgent.includes('JAWS');
  }
  
  /**
   * Create screen reader only text
   */
  static createSROnlyText(text: string): HTMLElement {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }
  
  /**
   * Format number for screen readers
   */
  static formatNumberForSR(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1000000) return \`\${(num / 1000).toFixed(1)} thousand\`;
    if (num < 1000000000) return \`\${(num / 1000000).toFixed(1)} million\`;
    return \`\${(num / 1000000000).toFixed(1)} billion\`;
  }
  
  /**
   * Format date for screen readers
   */
  static formatDateForSR(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Format time for screen readers
   */
  static formatTimeForSR(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

/**
 * Form accessibility utilities
 */
export class FormA11yUtils {
  /**
   * Associate label with input
   */
  static associateLabel(input: HTMLInputElement, label: HTMLLabelElement): void {
    const inputId = input.id || AriaUtils.generateId('input');
    input.id = inputId;
    label.setAttribute('for', inputId);
  }
  
  /**
   * Add error message to input
   */
  static addErrorMessage(input: HTMLInputElement, errorMessage: string): void {
    const errorId = AriaUtils.generateId('error');
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = errorMessage;
    
    // Insert error element after input
    input.parentNode?.insertBefore(errorElement, input.nextSibling);
    
    // Associate error with input
    const describedBy = input.getAttribute('aria-describedby');
    const newDescribedBy = describedBy ? \`\${describedBy} \${errorId}\` : errorId;
    input.setAttribute('aria-describedby', newDescribedBy);
    input.setAttribute('aria-invalid', 'true');
  }
  
  /**
   * Remove error message from input
   */
  static removeErrorMessage(input: HTMLInputElement): void {
    const describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      const errorIds = describedBy.split(' ').filter(id => id.startsWith('error-'));
      errorIds.forEach(errorId => {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.remove();
        }
      });
      
      const newDescribedBy = describedBy.split(' ')
        .filter(id => !id.startsWith('error-'))
        .join(' ');
        
      if (newDescribedBy) {
        input.setAttribute('aria-describedby', newDescribedBy);
      } else {
        input.removeAttribute('aria-describedby');
      }
    }
    
    input.setAttribute('aria-invalid', 'false');
  }
}

/**
 * Touch and gesture utilities for accessibility
 */
export class TouchA11yUtils {
  /**
   * Check if touch target meets minimum size requirements
   */
  static meetsTouchTargetSize(element: HTMLElement, minSize: number = 44): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width >= minSize && rect.height >= minSize;
  }
  
  /**
   * Add touch feedback for accessibility
   */
  static addTouchFeedback(element: HTMLElement): void {
    element.addEventListener('touchstart', () => {
      element.classList.add('touch-active');
    });
    
    element.addEventListener('touchend', () => {
      setTimeout(() => {
        element.classList.remove('touch-active');
      }, 100);
    });
  }
}

export default {
  ColorContrast,
  AriaUtils,
  KeyboardUtils,
  ScreenReaderUtils,
  FormA11yUtils,
  TouchA11yUtils
};`;

    fs.writeFileSync(path.join(utilsDir, 'accessibility-utils.ts'), utilsContent);
}

function createA11yTypes(utilsDir, appName) {
    const typesContent = `/**
 * @fileoverview Accessibility Type Definitions
 * @description TypeScript types for accessibility features
 */

// ARIA Role Types
export type AriaRole = 
  | 'alert' | 'alertdialog' | 'application' | 'article' | 'banner'
  | 'button' | 'cell' | 'checkbox' | 'columnheader' | 'combobox'
  | 'complementary' | 'contentinfo' | 'definition' | 'dialog' | 'directory'
  | 'document' | 'feed' | 'figure' | 'form' | 'grid' | 'gridcell'
  | 'group' | 'heading' | 'img' | 'link' | 'list' | 'listbox'
  | 'listitem' | 'log' | 'main' | 'marquee' | 'math' | 'menu'
  | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio'
  | 'navigation' | 'none' | 'note' | 'option' | 'presentation'
  | 'progressbar' | 'radio' | 'radiogroup' | 'region' | 'row'
  | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox'
  | 'separator' | 'slider' | 'spinbutton' | 'status' | 'switch'
  | 'tab' | 'table' | 'tablist' | 'tabpanel' | 'term' | 'textbox'
  | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem';

// ARIA Property Types
export type AriaProperty = 
  | 'aria-activedescendant' | 'aria-atomic' | 'aria-autocomplete'
  | 'aria-busy' | 'aria-checked' | 'aria-colcount' | 'aria-colindex'
  | 'aria-colspan' | 'aria-controls' | 'aria-current' | 'aria-describedby'
  | 'aria-details' | 'aria-disabled' | 'aria-dropeffect' | 'aria-errormessage'
  | 'aria-expanded' | 'aria-flowto' | 'aria-grabbed' | 'aria-haspopup'
  | 'aria-hidden' | 'aria-invalid' | 'aria-keyshortcuts' | 'aria-label'
  | 'aria-labelledby' | 'aria-level' | 'aria-live' | 'aria-modal'
  | 'aria-multiline' | 'aria-multiselectable' | 'aria-orientation'
  | 'aria-owns' | 'aria-placeholder' | 'aria-posinset' | 'aria-pressed'
  | 'aria-readonly' | 'aria-relevant' | 'aria-required' | 'aria-roledescription'
  | 'aria-rowcount' | 'aria-rowindex' | 'aria-rowspan' | 'aria-selected'
  | 'aria-setsize' | 'aria-sort' | 'aria-valuemax' | 'aria-valuemin'
  | 'aria-valuenow' | 'aria-valuetext';

// Live Region Types
export type AriaLive = 'off' | 'polite' | 'assertive';
export type AriaRelevant = 'additions' | 'removals' | 'text' | 'all';

// Keyboard Navigation Types
export type NavigationKey = 
  | 'Tab' | 'Enter' | 'Space' | 'Escape'
  | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
  | 'Home' | 'End' | 'PageUp' | 'PageDown';

export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'first' | 'last';

// Focus Management Types
export interface FocusableElement extends HTMLElement {
  focus(): void;
  blur(): void;
}

export interface FocusOptions {
  preventScroll?: boolean;
}

// Color Contrast Types
export interface ColorContrastRatio {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  isLargeText: boolean;
}

export interface AccessibilityColors {
  foreground: string;
  background: string;
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA' | 'fail';
}

// Component Accessibility Props
export interface AccessibilityProps {
  role?: AriaRole;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-live'?: AriaLive;
  'aria-atomic'?: boolean;
  'aria-relevant'?: AriaRelevant;
  'aria-busy'?: boolean;
  tabIndex?: number;
}

// Form Accessibility Types
export interface FormFieldAccessibility {
  id: string;
  labelId: string;
  errorId?: string;
  helpTextId?: string;
  required: boolean;
  invalid: boolean;
  errorMessage?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
}

// Modal Accessibility Types
export interface ModalAccessibilityProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialFocus?: RefObject<HTMLElement>;
  finalFocus?: RefObject<HTMLElement>;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

// Announcement Types
export interface AnnouncementOptions {
  priority?: AriaLive;
  timeout?: number;
  id?: string;
}

export interface ScreenReaderAnnouncement {
  message: string;
  priority: AriaLive;
  timestamp: number;
  id: string;
}

// Keyboard Navigation Handler Types
export type KeyboardEventHandler = (event: KeyboardEvent) => void;
export type FocusEventHandler = (event: FocusEvent) => void;

export interface KeyboardNavigationHandlers {
  onKeyDown?: KeyboardEventHandler;
  onKeyUp?: KeyboardEventHandler;
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
}

// Skip Link Types
export interface SkipLinkTarget {
  id: string;
  label: string;
  element: HTMLElement;
}

// Accessibility Testing Types
export interface AccessibilityTestResult {
  passed: boolean;
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  score: number;
}

export interface AccessibilityViolation {
  id: string;
  description: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  nodes: HTMLElement[];
  help: string;
  helpUrl: string;
}

export interface AccessibilityWarning {
  id: string;
  description: string;
  nodes: HTMLElement[];
  help: string;
}

// Responsive Accessibility Types
export interface ResponsiveAccessibilityBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  reducedMotion: string;
  highContrast: string;
  darkMode: string;
}

// Touch Accessibility Types
export interface TouchAccessibilityProps {
  minTouchTargetSize: number;
  touchFeedback: boolean;
  gestureSupport: boolean;
}

// Animation and Motion Types
export interface MotionPreferences {
  prefersReducedMotion: boolean;
  allowAnimations: boolean;
  animationDuration: number;
}

// High Contrast Types
export interface HighContrastPreferences {
  prefersHighContrast: boolean;
  customContrastRatio: number;
  forcedColors: boolean;
}

// Accessibility Context Types
export interface AccessibilityContextValue {
  announceMessage: (message: string, options?: AnnouncementOptions) => void;
  focusedElementId: string | null;
  setFocusedElementId: (id: string | null) => void;
  keyboardNavigation: boolean;
  setKeyboardNavigation: (enabled: boolean) => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  screenReaderActive: boolean;
  touchDevice: boolean;
}

// Component-Specific Types
export interface ButtonAccessibilityProps extends AccessibilityProps {
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export interface InputAccessibilityProps extends AccessibilityProps {
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  helpText?: string;
}

export interface SelectAccessibilityProps extends AccessibilityProps {
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  placeholder?: string;
}

export interface TableAccessibilityProps extends AccessibilityProps {
  caption?: string;
  sortable?: boolean;
  selectable?: boolean;
  currentSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
}

// Hook Return Types
export interface UseFocusReturn<T extends HTMLElement> {
  ref: RefObject<T>;
  setFocus: () => void;
  isFocused: boolean;
}

export interface UseKeyboardNavigationReturn {
  handleKeyDown: (event: React.KeyboardEvent) => void;
  isKeyboardUser: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export interface UseAnnouncerReturn {
  announce: (message: string, priority?: AriaLive) => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announceLoading: (message?: string) => void;
}

// Utility Function Types
export type ContrastChecker = (foreground: string, background: string, isLargeText?: boolean) => ColorContrastRatio;
export type AriaIdGenerator = (prefix?: string) => string;
export type FocusableElementsGetter = (container: HTMLElement) => HTMLElement[];

export default {
  AriaRole,
  AriaProperty,
  AriaLive,
  NavigationKey,
  AccessibilityProps,
  FormFieldAccessibility,
  ModalAccessibilityProps,
  AnnouncementOptions,
  AccessibilityTestResult,
  AccessibilityContextValue
};`;

    fs.writeFileSync(path.join(utilsDir, 'accessibility-types.ts'), typesContent);
}