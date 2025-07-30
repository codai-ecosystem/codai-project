import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Accessibility Types
export interface AccessibilityFeature {
  id: string;
  name: string;
  type: 'visual' | 'auditory' | 'motor' | 'cognitive';
  wcagLevel: 'A' | 'AA' | 'AAA';
  description: string;
  implementation: {
    ariaAttributes?: Record<string, string>;
    keyboardHandlers?: Record<string, (event: KeyboardEvent) => void>;
    screenReaderText?: string;
    focusManagement?: {
      trapFocus?: boolean;
      restoreFocus?: boolean;
      skipLinks?: string[];
    };
    colorContrast?: {
      minimumRatio: number;
      backgroundColors: string[];
      textColors: string[];
    };
    animations?: {
      respectReducedMotion: boolean;
      alternativeText?: string;
    };
  };
  enabled: boolean;
  userPreferences?: Record<string, any>;
}

export interface AccessibilityState {
  features: Map<string, AccessibilityFeature>;
  userPreferences: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardOnly: boolean;
    colorBlindFriendly: boolean;
    dyslexiaFriendly: boolean;
    cognitiveSupport: boolean;
  };
  activeFeatures: Set<string>;
  violations: Array<{
    id: string;
    severity: 'error' | 'warning' | 'info';
    wcagRule: string;
    description: string;
    element?: HTMLElement;
    suggestions: string[];
  }>;
  announcement: string | null;
}

// Accessibility Context
interface AccessibilityContextType {
  state: AccessibilityState;
  enableFeature: (featureId: string) => void;
  disableFeature: (featureId: string) => void;
  updatePreferences: (preferences: Partial<AccessibilityState['userPreferences']>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (selector: string | HTMLElement) => void;
  trapFocus: (container: HTMLElement) => () => void;
  checkViolations: () => Promise<void>;
  isFeatureEnabled: (featureId: string) => boolean;
  getContrastRatio: (foreground: string, background: string) => number;
  validateKeyboardNavigation: () => Promise<boolean>;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Accessibility Provider
export interface AccessibilityProviderProps {
  children: React.ReactNode;
  features?: AccessibilityFeature[];
  autoDetectPreferences?: boolean;
  enableViolationChecking?: boolean;
  onViolationDetected?: (violation: any) => void;
  announcePageChanges?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  features = [],
  autoDetectPreferences = true,
  enableViolationChecking = true,
  onViolationDetected,
  announcePageChanges = true,
}) => {
  const [state, setState] = useState<AccessibilityState>({
    features: new Map(features.map(f => [f.id, f])),
    userPreferences: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false,
      keyboardOnly: false,
      colorBlindFriendly: false,
      dyslexiaFriendly: false,
      cognitiveSupport: false,
    },
    activeFeatures: new Set(features.filter(f => f.enabled).map(f => f.id)),
    violations: [],
    announcement: null,
  });

  const liveRegionRef = useRef<HTMLDivElement>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);

  // Auto-detect user preferences
  useEffect(() => {
    if (!autoDetectPreferences) return;

    const detectedPreferences: Partial<AccessibilityState['userPreferences']> = {};

    // Detect reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    detectedPreferences.reducedMotion = reducedMotionQuery.matches;

    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    detectedPreferences.highContrast = highContrastQuery.matches;

    // Detect color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Use this for color blind friendly defaults

    // Detect screen reader usage (heuristic)
    const hasScreenReader = 'speechSynthesis' in window ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver');
    detectedPreferences.screenReader = hasScreenReader;

    setState(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...detectedPreferences,
      },
    }));

    // Listen for preference changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches });
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      updatePreferences({ highContrast: e.matches });
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, [autoDetectPreferences]);

  const enableFeature = useCallback((featureId: string) => {
    setState(prev => ({
      ...prev,
      activeFeatures: new Set([...prev.activeFeatures, featureId]),
    }));
  }, []);

  const disableFeature = useCallback((featureId: string) => {
    setState(prev => {
      const newActiveFeatures = new Set(prev.activeFeatures);
      newActiveFeatures.delete(featureId);
      return {
        ...prev,
        activeFeatures: newActiveFeatures,
      };
    });
  }, []);

  const updatePreferences = useCallback((preferences: Partial<AccessibilityState['userPreferences']>) => {
    setState(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        ...preferences,
      },
    }));

    // Apply CSS classes based on preferences
    const rootElement = document.documentElement;
    Object.entries(preferences).forEach(([key, value]) => {
      if (value) {
        rootElement.classList.add(`a11y-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      } else {
        rootElement.classList.remove(`a11y-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      }
    });
  }, []);

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return;

    setState(prev => ({ ...prev, announcement: message }));

    // Clear announcement after it's been read
    setTimeout(() => {
      setState(prev => ({ ...prev, announcement: null }));
    }, 1000);

    // Use live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;

    document.body.appendChild(liveRegion);

    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 2000);
  }, []);

  const focusElement = useCallback((selector: string | HTMLElement) => {
    const element = typeof selector === 'string'
      ? document.querySelector(selector) as HTMLElement
      : selector;

    if (element) {
      // Store current focus for restoration
      const currentFocus = document.activeElement as HTMLElement;
      if (currentFocus) {
        focusHistoryRef.current.push(currentFocus);
      }

      element.focus();

      // Scroll into view if needed
      element.scrollIntoView({
        behavior: state.userPreferences.reducedMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    }
  }, [state.userPreferences.reducedMotion]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore previous focus
      const previousFocus = focusHistoryRef.current.pop();
      previousFocus?.focus();
    };
  }, []);

  const getContrastRatio = useCallback((foreground: string, background: string): number => {
    // Convert colors to RGB values
    const getRGBValues = (color: string): [number, number, number] => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };

    const getLuminance = ([r, g, b]: [number, number, number]): number => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fgLuminance = getLuminance(getRGBValues(foreground));
    const bgLuminance = getLuminance(getRGBValues(background));

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const checkViolations = useCallback(async () => {
    if (!enableViolationChecking) return;

    const violations: AccessibilityState['violations'] = [];

    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      violations.push({
        id: `missing-alt-${Date.now()}`,
        severity: 'error',
        wcagRule: '1.1.1',
        description: 'Image missing alternative text',
        element: img as HTMLElement,
        suggestions: ['Add descriptive alt attribute to image'],
      });
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      if (!id || !document.querySelector(`label[for="${id}"]`)) {
        violations.push({
          id: `missing-label-${Date.now()}`,
          severity: 'error',
          wcagRule: '3.3.2',
          description: 'Form input missing label',
          element: input as HTMLElement,
          suggestions: ['Add label element or aria-label attribute'],
        });
      }
    });

    // Check color contrast
    const textElements = document.querySelectorAll('*');
    for (const element of textElements) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = getContrastRatio(color, backgroundColor);
        const fontSize = parseFloat(computedStyle.fontSize);
        const isBold = computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700;

        const requiredRatio = (fontSize >= 18 || (fontSize >= 14 && isBold)) ? 3 : 4.5;

        if (contrast < requiredRatio) {
          violations.push({
            id: `contrast-${Date.now()}`,
            severity: 'error',
            wcagRule: '1.4.3',
            description: `Insufficient color contrast (${contrast.toFixed(2)}:1, required ${requiredRatio}:1)`,
            element: element as HTMLElement,
            suggestions: ['Increase color contrast between text and background'],
          });
        }
      }
    }

    setState(prev => ({ ...prev, violations }));

    violations.forEach(violation => {
      onViolationDetected?.(violation);
    });
  }, [enableViolationChecking, getContrastRatio, onViolationDetected]);

  const isFeatureEnabled = useCallback((featureId: string) => {
    return state.activeFeatures.has(featureId);
  }, [state.activeFeatures]);

  const validateKeyboardNavigation = useCallback(async (): Promise<boolean> => {
    const focusableElements = document.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    let isValid = true;

    // Check if all interactive elements are focusable
    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
        isValid = false;
      }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    if (skipLinks.length === 0) {
      isValid = false;
    }

    return isValid;
  }, []);

  useEffect(() => {
    // Run initial violation check
    if (enableViolationChecking) {
      setTimeout(checkViolations, 1000);
    }

    // Set up keyboard navigation listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Track keyboard usage
        updatePreferences({ keyboardOnly: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableViolationChecking, checkViolations, updatePreferences]);

  const contextValue: AccessibilityContextType = {
    state,
    enableFeature,
    disableFeature,
    updatePreferences,
    announceToScreenReader,
    focusElement,
    trapFocus,
    checkViolations,
    isFeatureEnabled,
    getContrastRatio,
    validateKeyboardNavigation,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Screen reader live region */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.announcement}
      </div>

      {/* Skip navigation link */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#000',
          color: '#fff',
          padding: '8px',
          zIndex: 10000,
          textDecoration: 'none',
          transform: 'translateY(-100%)',
          transition: 'transform 0.3s',
        }}
        onFocus={(e) => {
          e.target.style.transform = 'translateY(0%)';
        }}
        onBlur={(e) => {
          e.target.style.transform = 'translateY(-100%)';
        }}
      >
        Skip to main content
      </a>

      {children}
    </AccessibilityContext.Provider>
  );
};

// Accessible Modal Component
export interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  initialFocus?: string;
  returnFocus?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  initialFocus,
  returnFocus = true,
}) => {
  const { announceToScreenReader, trapFocus, focusElement } = useAccessibility();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Announce modal opening
      announceToScreenReader(`${title} dialog opened`);

      // Set up focus trap
      const cleanup = modalRef.current ? trapFocus(modalRef.current) : undefined;

      // Focus initial element
      setTimeout(() => {
        if (initialFocus) {
          focusElement(initialFocus);
        } else {
          const firstButton = modalRef.current?.querySelector('button');
          firstButton?.focus();
        }
      }, 50);

      return cleanup;
    } else if (returnFocus && previousFocusRef.current) {
      // Restore focus when modal closes
      previousFocusRef.current.focus();
    }
  }, [isOpen, title, initialFocus, returnFocus, announceToScreenReader, trapFocus, focusElement]);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRef}
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
        <div id="modal-description" className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Accessible Form Field Component
export interface AccessibleFormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  children,
  error,
  hint,
  required = false,
  className = '',
}) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [
    hint && hintId,
    error && errorId,
  ].filter(Boolean).join(' ');

  return (
    <div className={`form-field ${className} ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={id} className="form-field__label">
        {label}
        {required && (
          <span className="form-field__required" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <div id={hintId} className="form-field__hint">
          {hint}
        </div>
      )}

      <div className="form-field__control">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required ? 'true' : undefined,
        })}
      </div>

      {error && (
        <div id={errorId} className="form-field__error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// Color Contrast Analyzer Component
export interface ColorContrastAnalyzerProps {
  foreground: string;
  background: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  showDetails?: boolean;
}

export const ColorContrastAnalyzer: React.FC<ColorContrastAnalyzerProps> = ({
  foreground,
  background,
  fontSize = 16,
  fontWeight = 'normal',
  showDetails = false,
}) => {
  const { getContrastRatio } = useAccessibility();

  const ratio = getContrastRatio(foreground, background);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight === 'bold');
  const requiredRatio = isLargeText ? 3 : 4.5;
  const aaaPasses = ratio >= (isLargeText ? 4.5 : 7);
  const aaPasses = ratio >= requiredRatio;

  return (
    <div className="contrast-analyzer">
      <div
        className="contrast-analyzer__sample"
        style={{
          backgroundColor: background,
          color: foreground,
          padding: '16px',
          fontSize: `${fontSize}px`,
          fontWeight,
        }}
      >
        Sample text with current colors
      </div>

      <div className="contrast-analyzer__results">
        <div className="contrast-analyzer__ratio">
          Contrast Ratio: <strong>{ratio.toFixed(2)}:1</strong>
        </div>

        <div className="contrast-analyzer__compliance">
          <div className={`compliance-badge ${aaPasses ? 'pass' : 'fail'}`}>
            WCAG AA: {aaPasses ? 'Pass' : 'Fail'}
          </div>
          <div className={`compliance-badge ${aaaPasses ? 'pass' : 'fail'}`}>
            WCAG AAA: {aaaPasses ? 'Pass' : 'Fail'}
          </div>
        </div>

        {showDetails && (
          <div className="contrast-analyzer__details">
            <p>Required ratio: {requiredRatio}:1 ({isLargeText ? 'Large text' : 'Normal text'})</p>
            <p>Font size: {fontSize}px, Weight: {fontWeight}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  AccessibilityProvider,
  AccessibleModal,
  AccessibleFormField,
  ColorContrastAnalyzer,
  useAccessibility,
};
