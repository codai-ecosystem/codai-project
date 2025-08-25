/**
 * @fileoverview Focus Management Creator
 * @description Creates comprehensive focus management system
 */

import fs from 'fs';
import path from 'path';

export default function createFocusManagement(dirs, appName) {
    createFocusComponents(dirs.componentsDir, appName);
    createFocusHooks(dirs.hooksDir, appName);
    createFocusStyles(dirs.stylesDir, appName);
    console.log(`🎯 Focus management features created for ${appName}`);
}

function createFocusComponents(componentsDir, appName) {
    const focusManagerContent = `/**
 * @fileoverview Focus Manager Component
 * @description Manages focus state and focus rings
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FocusManagerContextType {
  focusRingVisible: boolean;
  setFocusRingVisible: (visible: boolean) => void;
  currentFocusedElement: HTMLElement | null;
  setCurrentFocusedElement: (element: HTMLElement | null) => void;
  focusHistory: HTMLElement[];
  addToFocusHistory: (element: HTMLElement) => void;
  returnToPreviousFocus: () => void;
}

const FocusManagerContext = createContext<FocusManagerContextType | undefined>(undefined);

interface FocusManagerProps {
  children: ReactNode;
  showFocusRings?: boolean;
  trackFocusHistory?: boolean;
}

/**
 * Focus Manager Provider
 */
export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  showFocusRings = true,
  trackFocusHistory = true
}) => {
  const [focusRingVisible, setFocusRingVisible] = useState(false);
  const [currentFocusedElement, setCurrentFocusedElement] = useState<HTMLElement | null>(null);
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setFocusRingVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusRingVisible(false);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      setCurrentFocusedElement(target);
      
      if (trackFocusHistory) {
        addToFocusHistory(target);
      }
    };

    const handleFocusOut = () => {
      // Small delay to allow focus to move to new element
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          setCurrentFocusedElement(null);
        }
      }, 10);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [trackFocusHistory]);

  const addToFocusHistory = (element: HTMLElement) => {
    setFocusHistory(prev => {
      // Don't add if it's the same as the last element
      if (prev.length > 0 && prev[prev.length - 1] === element) {
        return prev;
      }
      
      // Keep only last 10 elements
      const newHistory = [...prev, element];
      return newHistory.slice(-10);
    });
  };

  const returnToPreviousFocus = () => {
    if (focusHistory.length > 1) {
      // Get the second-to-last element (since last is current)
      const previousElement = focusHistory[focusHistory.length - 2];
      if (previousElement && previousElement.focus) {
        previousElement.focus();
      }
    }
  };

  const value: FocusManagerContextType = {
    focusRingVisible: showFocusRings && focusRingVisible,
    setFocusRingVisible,
    currentFocusedElement,
    setCurrentFocusedElement,
    focusHistory,
    addToFocusHistory,
    returnToPreviousFocus
  };

  return (
    <FocusManagerContext.Provider value={value}>
      <div className={focusRingVisible ? 'focus-rings-visible' : 'focus-rings-hidden'}>
        {children}
      </div>
    </FocusManagerContext.Provider>
  );
};

/**
 * Hook to use focus manager
 */
export const useFocusManager = (): FocusManagerContextType => {
  const context = useContext(FocusManagerContext);
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManager');
  }
  return context;
};

export default FocusManager;`;

    const focusIndicatorContent = `/**
 * @fileoverview Focus Indicator Component
 * @description Provides enhanced focus indicators
 */

import React, { useRef, useEffect, ReactNode } from 'react';
import { useFocusManager } from './FocusManager';

interface FocusIndicatorProps {
  children: ReactNode;
  className?: string;
  highlightStyle?: 'ring' | 'background' | 'border' | 'custom';
  color?: string;
  thickness?: number;
  offset?: number;
  animated?: boolean;
}

/**
 * Enhanced Focus Indicator Component
 */
export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className = '',
  highlightStyle = 'ring',
  color = '#0066cc',
  thickness = 2,
  offset = 2,
  animated = true
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { focusRingVisible, currentFocusedElement } = useFocusManager();
  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleFocusIn = () => setIsFocused(true);
    const handleFocusOut = () => setIsFocused(false);

    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return () => {
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const focusStyles = React.useMemo(() => {
    if (!isFocused || !focusRingVisible) return {};

    const baseStyles: React.CSSProperties = {
      position: 'relative',
      zIndex: 1
    };

    switch (highlightStyle) {
      case 'ring':
        return {
          ...baseStyles,
          outline: \`\${thickness}px solid \${color}\`,
          outlineOffset: \`\${offset}px\`,
          borderRadius: '4px'
        };
      
      case 'background':
        return {
          ...baseStyles,
          backgroundColor: \`\${color}20\`, // 20% opacity
          border: \`\${thickness}px solid \${color}\`
        };
      
      case 'border':
        return {
          ...baseStyles,
          border: \`\${thickness}px solid \${color}\`,
          borderRadius: '4px'
        };
      
      default:
        return baseStyles;
    }
  }, [isFocused, focusRingVisible, highlightStyle, color, thickness, offset]);

  const animationClass = animated && isFocused && focusRingVisible 
    ? 'focus-indicator--animated' 
    : '';

  return (
    <div
      ref={elementRef}
      className={\`focus-indicator \${animationClass} \${className}\`}
      style={focusStyles}
    >
      {children}
    </div>
  );
};

export default FocusIndicator;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(componentsDir, 'FocusManager.tsx'), focusManagerContent);
    fs.writeFileSync(path.join(componentsDir, 'FocusIndicator.tsx'), focusIndicatorContent);
}

function createFocusHooks(hooksDir, appName) {
    const focusHooksContent = `/**
 * @fileoverview Focus Management Hooks
 * @description Custom hooks for focus management
 */

import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Hook for managing focus on component mount
 */
export const useAutoFocus = <T extends HTMLElement = HTMLElement>(
  shouldAutoFocus: boolean = true,
  delay: number = 0
) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (shouldAutoFocus && elementRef.current) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          elementRef.current?.focus();
        }, delay);
        return () => clearTimeout(timer);
      } else {
        elementRef.current.focus();
      }
    }
  }, [shouldAutoFocus, delay]);

  return elementRef;
};

/**
 * Hook for saving and restoring focus
 */
export const useFocusRestore = () => {
  const previousElementRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousElementRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousElementRef.current && previousElementRef.current.focus) {
      previousElementRef.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
};

/**
 * Hook for focus within detection
 */
export const useFocusWithin = <T extends HTMLElement = HTMLElement>() => {
  const elementRef = useRef<T>(null);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (element.contains(event.target as Node)) {
        setIsFocusWithin(true);
      }
    };

    const handleFocusOut = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node)) {
        setIsFocusWithin(false);
      }
    };

    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return () => {
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return [elementRef, isFocusWithin] as const;
};

export default {
  useAutoFocus,
  useFocusRestore,
  useFocusWithin
};`;

    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    fs.writeFileSync(path.join(hooksDir, 'useFocusManagement.ts'), focusHooksContent);
}

function createFocusStyles(stylesDir, appName) {
    const focusStylesContent = `/**
 * Focus Management Styles
 * Enhanced focus indicators and management
 */

/* Focus ring visibility control */
.focus-rings-visible *:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

.focus-rings-hidden *:focus {
  outline: none;
}

/* Enhanced focus indicators */
.focus-indicator {
  position: relative;
  transition: all 0.15s ease-in-out;
}

.focus-indicator--animated {
  animation: focusPulse 0.3s ease-in-out;
}

@keyframes focusPulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Custom focus styles for different element types */
.focus-indicator button:focus,
.focus-indicator [role="button"]:focus {
  box-shadow: 0 0 0 2px var(--focus-color, #0066cc);
}

.focus-indicator input:focus,
.focus-indicator select:focus,
.focus-indicator textarea:focus {
  border-color: var(--focus-color, #0066cc);
  box-shadow: 0 0 0 1px var(--focus-color, #0066cc);
}`;

    if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
    }

    fs.writeFileSync(path.join(stylesDir, 'focus-management.css'), focusStylesContent);
}