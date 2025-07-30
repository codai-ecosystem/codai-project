'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// WCAG 2.1 AA Compliance Features
interface AccessibilityContextType {
  // Visual preferences
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

  // Interaction preferences
  focusMode: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;

  // Content preferences
  autoplay: boolean;
  animations: boolean;

  // Actions
  toggleHighContrast: () => void;
  setFontSize: (size: AccessibilityContextType['fontSize']) => void;
  setColorBlindMode: (mode: AccessibilityContextType['colorBlindMode']) => void;
  toggleReducedMotion: () => void;
  toggleFocusMode: () => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Load preferences from localStorage
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<AccessibilityContextType['fontSize']>('medium');
  const [colorBlindMode, setColorBlindMode] = useState<AccessibilityContextType['colorBlindMode']>('none');
  const [focusMode, setFocusMode] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [animations, setAnimations] = useState(true);

  // Initialize preferences
  useEffect(() => {
    // Load from localStorage
    const savedPrefs = localStorage.getItem('aide-accessibility');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        setHighContrast(prefs.highContrast || false);
        setReducedMotion(prefs.reducedMotion || false);
        setFontSize(prefs.fontSize || 'medium');
        setColorBlindMode(prefs.colorBlindMode || 'none');
        setFocusMode(prefs.focusMode || false);
        setAutoplay(prefs.autoplay !== false);
        setAnimations(prefs.animations !== false);
      } catch (error) {
        console.warn('Failed to load accessibility preferences:', error);
      }
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      setReducedMotion(true);
      setAnimations(false);
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    if (prefersHighContrast.matches) {
      setHighContrast(true);
    }

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Detect screen reader
    const isScreenReader = window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis;
    setScreenReaderMode(!!isScreenReader);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Save preferences
  useEffect(() => {
    const prefs = {
      highContrast,
      reducedMotion,
      fontSize,
      colorBlindMode,
      focusMode,
      autoplay,
      animations,
    };
    localStorage.setItem('aide-accessibility', JSON.stringify(prefs));
  }, [highContrast, reducedMotion, fontSize, colorBlindMode, focusMode, autoplay, animations]);

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const fontSizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'extra-large': '1.25rem',
    };
    root.style.setProperty('--font-size-base', fontSizes[fontSize]);
    root.style.setProperty('--font-scale', fontSize === 'small' ? '0.875' : fontSize === 'large' ? '1.125' : fontSize === 'extra-large' ? '1.25' : '1');

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color blind mode
    root.setAttribute('data-colorblind', colorBlindMode);

    // Focus mode
    if (focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Keyboard navigation
    if (keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [highContrast, reducedMotion, fontSize, colorBlindMode, focusMode, keyboardNavigation]);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    setAnimations(reducedMotion); // If enabling reduced motion, disable animations
  };
  const toggleFocusMode = () => setFocusMode(!focusMode);

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const contextValue: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    colorBlindMode,
    focusMode,
    keyboardNavigation,
    screenReaderMode,
    autoplay,
    animations,
    toggleHighContrast,
    setFontSize,
    setColorBlindMode,
    toggleReducedMotion,
    toggleFocusMode,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      <LiveRegion />
    </AccessibilityContext.Provider>
  );
}

// Screen reader announcement region
function LiveRegion() {
  return (
    <div
      id="live-region"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}

// Accessible Button Component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function AccessibleButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const { reducedMotion, announceToScreenReader } = useAccessibility();

  const baseClasses = `
    relative inline-flex items-center justify-center font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${reducedMotion ? '' : 'hover:scale-105 active:scale-95'}
  `;

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    ghost: 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;

    // Announce action to screen readers
    if (typeof children === 'string') {
      announceToScreenReader(`${children} activated`);
    }

    props.onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-describedby={loading ? 'loading-description' : undefined}
    >
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span id="loading-description" className="sr-only">Loading...</span>
        </motion.div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}

// Accessible Form Input
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export function AccessibleInput({
  label,
  error,
  helpText,
  required,
  className = '',
  id,
  ...props
}: AccessibleInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>

      <input
        {...props}
        id={inputId}
        required={required}
        className={`
          block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        aria-describedby={[
          helpText ? helpId : null,
          error ? errorId : null,
        ].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
      />

      {helpText && (
        <p id={helpId} className="text-sm text-gray-600 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Skip to Content Link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-indigo-600 text-white px-4 py-2 rounded-br-lg"
    >
      Skip to main content
    </a>
  );
}
