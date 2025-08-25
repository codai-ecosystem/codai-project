/**
 * @fileoverview Keyboard Navigation Enabler
 * @description Implements comprehensive keyboard navigation support
 */

import fs from 'fs';
import path from 'path';

export default function enableKeyboardNavigation(dirs, appName) {
    createKeyboardComponents(dirs.componentsDir, appName);
    createKeyboardHooks(dirs.hooksDir, appName);
    createKeyboardUtils(dirs.utilsDir, appName);
    createKeyboardStyles(dirs.stylesDir, appName);
    console.log(`⌨️ Keyboard navigation features created for ${appName}`);
}

function createKeyboardComponents(componentsDir, appName) {
    const keyboardProviderContent = `/**
 * @fileoverview Keyboard Navigation Provider
 * @description Provides keyboard navigation context and utilities
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

interface KeyboardNavigationContextType {
  isKeyboardUser: boolean;
  currentFocusIndex: number;
  setCurrentFocusIndex: (index: number) => void;
  registerFocusableElement: (element: HTMLElement) => number;
  unregisterFocusableElement: (index: number) => void;
  focusableElements: HTMLElement[];
  navigateToIndex: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  navigateFirst: () => void;
  navigateLast: () => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextType | undefined>(undefined);

interface KeyboardNavigationProviderProps {
  children: ReactNode;
  trapFocus?: boolean;
  autoDetectKeyboard?: boolean;
}

/**
 * Keyboard Navigation Provider Component
 */
export const KeyboardNavigationProvider: React.FC<KeyboardNavigationProviderProps> = ({
  children,
  trapFocus = false,
  autoDetectKeyboard = true
}) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  const elementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!autoDetectKeyboard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [autoDetectKeyboard]);

  useEffect(() => {
    if (!isKeyboardUser || !trapFocus) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        
        if (event.shiftKey) {
          navigatePrevious();
        } else {
          navigateNext();
        }
      } else if (event.key === 'Escape') {
        // Allow escape to break focus trap
        setCurrentFocusIndex(-1);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isKeyboardUser, trapFocus, focusableElements, currentFocusIndex]);

  const registerFocusableElement = (element: HTMLElement): number => {
    const index = elementsRef.current.length;
    elementsRef.current.push(element);
    setFocusableElements([...elementsRef.current]);
    return index;
  };

  const unregisterFocusableElement = (index: number) => {
    elementsRef.current.splice(index, 1);
    setFocusableElements([...elementsRef.current]);
    
    // Adjust current focus index if needed
    if (currentFocusIndex >= index && currentFocusIndex > 0) {
      setCurrentFocusIndex(currentFocusIndex - 1);
    }
  };

  const navigateToIndex = (index: number) => {
    if (index >= 0 && index < elementsRef.current.length) {
      const element = elementsRef.current[index];
      if (element && element.focus) {
        element.focus();
        setCurrentFocusIndex(index);
      }
    }
  };

  const navigateNext = () => {
    const nextIndex = currentFocusIndex + 1;
    if (nextIndex >= elementsRef.current.length) {
      navigateToIndex(0); // Wrap to first element
    } else {
      navigateToIndex(nextIndex);
    }
  };

  const navigatePrevious = () => {
    const prevIndex = currentFocusIndex - 1;
    if (prevIndex < 0) {
      navigateToIndex(elementsRef.current.length - 1); // Wrap to last element
    } else {
      navigateToIndex(prevIndex);
    }
  };

  const navigateFirst = () => {
    navigateToIndex(0);
  };

  const navigateLast = () => {
    navigateToIndex(elementsRef.current.length - 1);
  };

  const value: KeyboardNavigationContextType = {
    isKeyboardUser,
    currentFocusIndex,
    setCurrentFocusIndex,
    registerFocusableElement,
    unregisterFocusableElement,
    focusableElements: elementsRef.current,
    navigateToIndex,
    navigateNext,
    navigatePrevious,
    navigateFirst,
    navigateLast
  };

  return (
    <KeyboardNavigationContext.Provider value={value}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

/**
 * Hook to use keyboard navigation context
 */
export const useKeyboardNavigationContext = (): KeyboardNavigationContextType => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigationContext must be used within a KeyboardNavigationProvider');
  }
  return context;
};

export default KeyboardNavigationProvider;`;

    const focusTrapContent = `/**
 * @fileoverview Focus Trap Component
 * @description Traps keyboard focus within a container
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useAccessibility';

export interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  returnFocus?: boolean;
  className?: string;
  onEscape?: () => void;
  initialFocus?: HTMLElement | null;
  finalFocus?: HTMLElement | null;
}

/**
 * Focus Trap Component
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  returnFocus = true,
  className = '',
  onEscape,
  initialFocus,
  finalFocus
}) => {
  const containerRef = useFocusTrap<HTMLDivElement>(active);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isActivatedRef = useRef(false);

  useEffect(() => {
    if (active && !isActivatedRef.current) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      isActivatedRef.current = true;

      // Focus initial element if provided, otherwise focus container
      if (initialFocus) {
        initialFocus.focus();
      } else if (containerRef.current) {
        containerRef.current.focus();
      }
    }

    if (!active && isActivatedRef.current && returnFocus) {
      // Return focus to previously focused element or final focus element
      const elementToFocus = finalFocus || previousFocusRef.current;
      if (elementToFocus && elementToFocus.focus) {
        elementToFocus.focus();
      }
      isActivatedRef.current = false;
    }
  }, [active, initialFocus, finalFocus, returnFocus]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={\`focus-trap \${className}\`}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

export default FocusTrap;`;

    const keyboardShortcutsContent = `/**
 * @fileoverview Keyboard Shortcuts Component
 * @description Manages global keyboard shortcuts with accessibility
 */

import React, { useEffect, useCallback, useState, ReactNode } from 'react';
import { useAnnouncer } from '../hooks/useAccessibility';

export interface KeyboardShortcut {
  key: string;
  modifiers?: Array<'ctrl' | 'alt' | 'shift' | 'meta'>;
  description: string;
  action: () => void;
  enabled?: boolean;
}

export interface KeyboardShortcutsProps {
  children: ReactNode;
  shortcuts: KeyboardShortcut[];
  showHelp?: boolean;
  helpKey?: string;
}

/**
 * Keyboard Shortcuts Manager Component
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  children,
  shortcuts,
  showHelp = true,
  helpKey = '?'
}) => {
  const [helpVisible, setHelpVisible] = useState(false);
  const { announce } = useAnnouncer();

  const checkModifiers = useCallback((event: KeyboardEvent, modifiers?: string[]) => {
    if (!modifiers || modifiers.length === 0) return true;

    return modifiers.every(modifier => {
      switch (modifier) {
        case 'ctrl':
          return event.ctrlKey;
        case 'alt':
          return event.altKey;
        case 'shift':
          return event.shiftKey;
        case 'meta':
          return event.metaKey;
        default:
          return false;
      }
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle help toggle
    if (showHelp && event.key === helpKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      setHelpVisible(prev => {
        const newVisible = !prev;
        announce(newVisible ? 'Keyboard shortcuts help opened' : 'Keyboard shortcuts help closed');
        return newVisible;
      });
      return;
    }

    // Handle shortcuts
    for (const shortcut of shortcuts) {
      if (shortcut.enabled === false) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const modifiersMatch = checkModifiers(event, shortcut.modifiers);

      if (keyMatches && modifiersMatch) {
        event.preventDefault();
        shortcut.action();
        announce(\`Shortcut activated: \${shortcut.description}\`);
        break;
      }
    }
  }, [shortcuts, checkModifiers, announce, showHelp, helpKey]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts = [];
    
    if (shortcut.modifiers) {
      shortcut.modifiers.forEach(modifier => {
        switch (modifier) {
          case 'ctrl':
            parts.push('Ctrl');
            break;
          case 'alt':
            parts.push('Alt');
            break;
          case 'shift':
            parts.push('Shift');
            break;
          case 'meta':
            parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win');
            break;
        }
      });
    }
    
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <>
      {children}
      
      {helpVisible && (
        <div 
          className="keyboard-shortcuts-help"
          role="dialog"
          aria-labelledby="shortcuts-title"
          aria-modal="true"
        >
          <div className="keyboard-shortcuts-help__overlay" />
          <div className="keyboard-shortcuts-help__content">
            <div className="keyboard-shortcuts-help__header">
              <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
              <button
                className="keyboard-shortcuts-help__close"
                onClick={() => setHelpVisible(false)}
                aria-label="Close keyboard shortcuts help"
              >
                ✕
              </button>
            </div>
            
            <div className="keyboard-shortcuts-help__body">
              <ul className="keyboard-shortcuts-help__list">
                {shortcuts.filter(s => s.enabled !== false).map((shortcut, index) => (
                  <li key={index} className="keyboard-shortcuts-help__item">
                    <kbd className="keyboard-shortcuts-help__key">
                      {formatShortcut(shortcut)}
                    </kbd>
                    <span className="keyboard-shortcuts-help__description">
                      {shortcut.description}
                    </span>
                  </li>
                ))}
                
                {showHelp && (
                  <li className="keyboard-shortcuts-help__item">
                    <kbd className="keyboard-shortcuts-help__key">
                      {helpKey}
                    </kbd>
                    <span className="keyboard-shortcuts-help__description">
                      Show/hide keyboard shortcuts
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;`;

    const rovingTablindexContent = `/**
 * @fileoverview Roving Tabindex Component
 * @description Implements roving tabindex for keyboard navigation lists
 */

import React, { useRef, useEffect, useState, ReactNode, Children, cloneElement } from 'react';
import { useKeyboardNavigation } from '../hooks/useAccessibility';

export interface RovingTabindexProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  role?: string;
}

/**
 * Roving Tabindex Component for lists and grids
 */
export const RovingTabindex: React.FC<RovingTabindexProps> = ({
  children,
  orientation = 'vertical',
  loop = true,
  defaultIndex = 0,
  onIndexChange,
  className = '',
  role = 'group'
}) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const itemsRef = useRef<HTMLElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateIndex = (newIndex: number) => {
    const itemCount = itemsRef.current.length;
    if (itemCount === 0) return;

    let actualIndex = newIndex;
    
    if (loop) {
      if (newIndex < 0) actualIndex = itemCount - 1;
      if (newIndex >= itemCount) actualIndex = 0;
    } else {
      if (newIndex < 0) actualIndex = 0;
      if (newIndex >= itemCount) actualIndex = itemCount - 1;
    }

    setCurrentIndex(actualIndex);
    onIndexChange?.(actualIndex);

    // Update tabindex attributes
    itemsRef.current.forEach((item, index) => {
      if (item) {
        item.setAttribute('tabindex', index === actualIndex ? '0' : '-1');
        if (index === actualIndex) {
          item.focus();
        }
      }
    });
  };

  const { handleKeyDown } = useKeyboardNavigation(
    () => updateIndex(currentIndex), // Enter - activate current item
    () => updateIndex(currentIndex), // Space - activate current item  
    undefined, // Escape
    (direction) => {
      switch (direction) {
        case 'up':
          if (orientation === 'vertical' || orientation === 'both') {
            updateIndex(currentIndex - 1);
          }
          break;
        case 'down':
          if (orientation === 'vertical' || orientation === 'both') {
            updateIndex(currentIndex + 1);
          }
          break;
        case 'left':
          if (orientation === 'horizontal' || orientation === 'both') {
            updateIndex(currentIndex - 1);
          }
          break;
        case 'right':
          if (orientation === 'horizontal' || orientation === 'both') {
            updateIndex(currentIndex + 1);
          }
          break;
      }
    }
  );

  const enhancedHandleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Home and End keys
    if (event.key === 'Home') {
      event.preventDefault();
      updateIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      updateIndex(itemsRef.current.length - 1);
    } else {
      handleKeyDown(event);
    }
  };

  useEffect(() => {
    // Initialize tabindex for all items
    itemsRef.current.forEach((item, index) => {
      if (item) {
        item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
      }
    });
  }, [currentIndex]);

  const registerItem = (element: HTMLElement, index: number) => {
    itemsRef.current[index] = element;
  };

  const enhancedChildren = Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return cloneElement(child, {
        ...child.props,
        ref: (el: HTMLElement) => {
          if (el) {
            registerItem(el, index);
          }
          // Call original ref if it exists
          if (child.ref) {
            if (typeof child.ref === 'function') {
              child.ref(el);
            } else {
              (child.ref as any).current = el;
            }
          }
        },
        tabIndex: index === currentIndex ? 0 : -1,
        'aria-posinset': index + 1,
        'aria-setsize': Children.count(children)
      });
    }
    return child;
  });

  return (
    <div
      ref={containerRef}
      className={\`roving-tabindex \${className}\`}
      role={role}
      onKeyDown={enhancedHandleKeyDown}
      aria-activedescendant={\`item-\${currentIndex}\`}
    >
      {enhancedChildren}
    </div>
  );
};

export default RovingTabindex;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(componentsDir, 'KeyboardNavigationProvider.tsx'), keyboardProviderContent);
    fs.writeFileSync(path.join(componentsDir, 'FocusTrap.tsx'), focusTrapContent);
    fs.writeFileSync(path.join(componentsDir, 'KeyboardShortcuts.tsx'), keyboardShortcutsContent);
    fs.writeFileSync(path.join(componentsDir, 'RovingTabindex.tsx'), roving TablindexContent);
}

function createKeyboardHooks(hooksDir, appName) {
    const keyboardHooksContent = `/**
 * @fileoverview Enhanced Keyboard Navigation Hooks
 * @description Advanced hooks for keyboard navigation and interaction
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for advanced keyboard navigation with directional movement
 */
export const useAdvancedKeyboardNavigation = (options: {
  items: HTMLElement[];
  orientation?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  wrap?: boolean;
  onActivate?: (index: number, element: HTMLElement) => void;
  onFocusChange?: (index: number, element: HTMLElement) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { items, orientation = 'vertical', columns = 1, wrap = true, onActivate, onFocusChange } = options;

  const moveFocus = useCallback((newIndex: number) => {
    if (items.length === 0) return;

    let targetIndex = newIndex;

    if (wrap) {
      if (targetIndex < 0) targetIndex = items.length - 1;
      if (targetIndex >= items.length) targetIndex = 0;
    } else {
      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= items.length) targetIndex = items.length - 1;
    }

    if (items[targetIndex]) {
      items[targetIndex].focus();
      setCurrentIndex(targetIndex);
      onFocusChange?.(targetIndex, items[targetIndex]);
    }
  }, [items, wrap, onFocusChange]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'vertical') {
          moveFocus(currentIndex + 1);
        } else if (orientation === 'grid') {
          moveFocus(currentIndex + columns);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'vertical') {
          moveFocus(currentIndex - 1);
        } else if (orientation === 'grid') {
          moveFocus(currentIndex - columns);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'horizontal') {
          moveFocus(currentIndex + 1);
        } else if (orientation === 'grid') {
          moveFocus(currentIndex + 1);
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'horizontal') {
          moveFocus(currentIndex - 1);
        } else if (orientation === 'grid') {
          moveFocus(currentIndex - 1);
        }
        break;

      case 'Home':
        event.preventDefault();
        moveFocus(0);
        break;

      case 'End':
        event.preventDefault();
        moveFocus(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        if (onActivate && items[currentIndex]) {
          event.preventDefault();
          onActivate(currentIndex, items[currentIndex]);
        }
        break;
    }
  }, [currentIndex, items, orientation, columns, moveFocus, onActivate]);

  return {
    currentIndex,
    setCurrentIndex: moveFocus,
    handleKeyDown
  };
};

/**
 * Hook for keyboard shortcuts management
 */
export const useKeyboardShortcuts = (shortcuts: Array<{
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

/**
 * Hook for managing focus within a component
 */
export const useFocusManagement = <T extends HTMLElement = HTMLElement>() => {
  const elementRef = useRef<T>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [focusedChild, setFocusedChild] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleFocusIn = (event: FocusEvent) => {
      setHasFocus(true);
      setFocusedChild(event.target as HTMLElement);
    };

    const handleFocusOut = (event: FocusEvent) => {
      // Check if focus is moving to a child element
      const relatedTarget = event.relatedTarget as HTMLElement;
      const isMovingToChild = relatedTarget && element.contains(relatedTarget);
      
      if (!isMovingToChild) {
        setHasFocus(false);
        setFocusedChild(null);
      }
    };

    element.addEventListener('focusin', handleFocusIn);
    element.addEventListener('focusout', handleFocusOut);

    return () => {
      element.removeEventListener('focusin', handleFocusIn);
      element.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const focusElement = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  const focusFirstChild = useCallback(() => {
    if (elementRef.current) {
      const firstFocusable = elementRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, []);

  const focusLastChild = useCallback(() => {
    if (elementRef.current) {
      const focusableElements = elementRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const lastFocusable = focusableElements[focusableElements.length - 1];
      if (lastFocusable) {
        lastFocusable.focus();
      }
    }
  }, []);

  return {
    elementRef,
    hasFocus,
    focusedChild,
    focusElement,
    focusFirstChild,
    focusLastChild
  };
};

/**
 * Hook for escape key handling
 */
export const useEscapeKey = (callback: () => void, enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [callback, enabled]);
};

/**
 * Hook for tab navigation detection
 */
export const useTabNavigation = () => {
  const [isTabbing, setIsTabbing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsTabbing(true);
      }
    };

    const handleMouseDown = () => {
      setIsTabbing(false);
    };

    const handleFocusIn = () => {
      // Reset tabbing state when focus changes without tab
      setTimeout(() => {
        setIsTabbing(false);
      }, 100);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  return isTabbing;
};

/**
 * Hook for arrow key navigation in menus/lists
 */
export const useArrowNavigation = (
  itemsSelector: string = '[role="menuitem"], [role="option"], [tabindex="0"]'
) => {
  const containerRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getItems = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(itemsSelector));
  }, [itemsSelector]);

  const focusIndex = useCallback((index: number) => {
    const items = getItems();
    if (items[index]) {
      items[index].focus();
      setCurrentIndex(index);
    }
  }, [getItems]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const items = getItems();
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusIndex((currentIndex + 1) % items.length);
        break;

      case 'ArrowUp':
        event.preventDefault();
        focusIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
        break;

      case 'Home':
        event.preventDefault();
        focusIndex(0);
        break;

      case 'End':
        event.preventDefault();
        focusIndex(items.length - 1);
        break;
    }
  }, [currentIndex, focusIndex, getItems]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    containerRef,
    currentIndex,
    focusIndex,
    getItems
  };
};

export default {
  useAdvancedKeyboardNavigation,
  useKeyboardShortcuts,
  useFocusManagement,
  useEscapeKey,
  useTabNavigation,
  useArrowNavigation
};`;

    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }
    fs.writeFileSync(path.join(hooksDir, 'useKeyboardNavigation.ts'), keyboardHooksContent);
}

function createKeyboardUtils(utilsDir, appName) {
    const keyboardUtilsContent = `/**
 * @fileoverview Keyboard Navigation Utilities
 * @description Utility functions for keyboard navigation and interaction
 */

/**
 * Focusable elements selector
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details summary',
  'iframe'
].join(', ');

/**
 * Key codes for keyboard navigation
 */
export const KEYBOARD_KEYS = {
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace'
} as const;

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(element => {
      // Check if element is actually focusable (not hidden or display:none)
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        !element.hasAttribute('inert')
      );
    });
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  return focusableElements[0] || null;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  return focusableElements[focusableElements.length - 1] || null;
}

/**
 * Check if element is currently focused
 */
export function isFocused(element: HTMLElement): boolean {
  return document.activeElement === element;
}

/**
 * Check if element contains the currently focused element
 */
export function containsFocus(container: HTMLElement): boolean {
  const activeElement = document.activeElement;
  return activeElement ? container.contains(activeElement) : false;
}

/**
 * Trap focus within a container
 */
export class FocusTrap {
  private container: HTMLElement;
  private isActive: boolean = false;
  private previouslyFocusedElement: HTMLElement | null = null;
  private handleKeyDown: (event: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.handleKeyDown = this.createKeyDownHandler();
  }

  private createKeyDownHandler() {
    return (event: KeyboardEvent) => {
      if (!this.isActive) return;

      if (event.key === KEYBOARD_KEYS.TAB) {
        this.handleTabKey(event);
      } else if (event.key === KEYBOARD_KEYS.ESCAPE) {
        this.deactivate();
      }
    };
  }

  private handleTabKey(event: KeyboardEvent) {
    const focusableElements = getFocusableElements(this.container);
    
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (activeElement === firstElement || !this.container.contains(activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab (forward)
      if (activeElement === lastElement || !this.container.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  activate() {
    if (this.isActive) return;

    this.isActive = true;
    this.previouslyFocusedElement = document.activeElement as HTMLElement;
    
    // Focus first focusable element
    const firstFocusable = getFirstFocusableElement(this.container);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      this.container.focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    document.removeEventListener('keydown', this.handleKeyDown);

    // Return focus to previously focused element
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.focus) {
      this.previouslyFocusedElement.focus();
    }
  }

  destroy() {
    this.deactivate();
  }
}

/**
 * Keyboard navigation handler for lists and menus
 */
export class KeyboardNavigationHandler {
  private items: HTMLElement[];
  private currentIndex: number = 0;
  private orientation: 'horizontal' | 'vertical';
  private wrap: boolean;
  private onActivate?: (index: number, element: HTMLElement) => void;

  constructor(options: {
    items: HTMLElement[];
    orientation?: 'horizontal' | 'vertical';
    wrap?: boolean;
    onActivate?: (index: number, element: HTMLElement) => void;
  }) {
    this.items = options.items;
    this.orientation = options.orientation || 'vertical';
    this.wrap = options.wrap !== false;
    this.onActivate = options.onActivate;
  }

  updateItems(items: HTMLElement[]) {
    this.items = items;
    this.currentIndex = Math.min(this.currentIndex, items.length - 1);
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    let handled = false;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_UP:
        if (this.orientation === 'vertical') {
          this.moveFocus(-1);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ARROW_DOWN:
        if (this.orientation === 'vertical') {
          this.moveFocus(1);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ARROW_LEFT:
        if (this.orientation === 'horizontal') {
          this.moveFocus(-1);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (this.orientation === 'horizontal') {
          this.moveFocus(1);
          handled = true;
        }
        break;

      case KEYBOARD_KEYS.HOME:
        this.setFocusIndex(0);
        handled = true;
        break;

      case KEYBOARD_KEYS.END:
        this.setFocusIndex(this.items.length - 1);
        handled = true;
        break;

      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        if (this.onActivate) {
          this.onActivate(this.currentIndex, this.items[this.currentIndex]);
          handled = true;
        }
        break;
    }

    return handled;
  }

  private moveFocus(delta: number) {
    let newIndex = this.currentIndex + delta;

    if (this.wrap) {
      if (newIndex < 0) newIndex = this.items.length - 1;
      if (newIndex >= this.items.length) newIndex = 0;
    } else {
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= this.items.length) newIndex = this.items.length - 1;
    }

    this.setFocusIndex(newIndex);
  }

  private setFocusIndex(index: number) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.items[index].focus();
    }
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrentElement(): HTMLElement | null {
    return this.items[this.currentIndex] || null;
  }
}

/**
 * Roving tabindex manager
 */
export class RovingTabindexManager {
  private items: HTMLElement[] = [];
  private currentIndex: number = 0;

  constructor(items: HTMLElement[] = []) {
    this.setItems(items);
  }

  setItems(items: HTMLElement[]) {
    this.items = items;
    this.updateTabindices();
  }

  addItem(item: HTMLElement, index?: number) {
    if (typeof index === 'number') {
      this.items.splice(index, 0, item);
    } else {
      this.items.push(item);
    }
    this.updateTabindices();
  }

  removeItem(item: HTMLElement) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      if (this.currentIndex >= index && this.currentIndex > 0) {
        this.currentIndex--;
      }
      this.updateTabindices();
    }
  }

  setCurrentIndex(index: number) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.updateTabindices();
    }
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrentItem(): HTMLElement | null {
    return this.items[this.currentIndex] || null;
  }

  private updateTabindices() {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
    });
  }
}

/**
 * Utility to check if an element should receive focus on keyboard navigation
 */
export function shouldReceiveFocus(element: HTMLElement): boolean {
  // Check if element is disabled
  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  // Check if element is hidden
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Check if element has inert attribute
  if (element.hasAttribute('inert')) {
    return false;
  }

  // Check if element is inside an element with aria-hidden="true"
  let parent = element.parentElement;
  while (parent) {
    if (parent.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    parent = parent.parentElement;
  }

  return true;
}

/**
 * Utility to announce text to screen readers
 */
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after a delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export default {
  FOCUSABLE_SELECTOR,
  KEYBOARD_KEYS,
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  isFocused,
  containsFocus,
  FocusTrap,
  KeyboardNavigationHandler,
  RovingTabindexManager,
  shouldReceiveFocus,
  announceToScreenReader
};`;

    fs.writeFileSync(path.join(utilsDir, 'keyboard-utils.ts'), keyboardUtilsContent);
}

function createKeyboardStyles(stylesDir, appName) {
    const keyboardStylesContent = `/**
 * Keyboard Navigation Styles
 * Provides visual feedback for keyboard navigation
 */

/* Keyboard user detection */
.keyboard-user *:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

.mouse-user *:focus {
  outline: none;
}

/* Focus trap styles */
.focus-trap {
  position: relative;
}

.focus-trap[tabindex="-1"]:focus {
  outline: none;
}

/* Keyboard shortcuts help */
.keyboard-shortcuts-help {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyboard-shortcuts-help__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.keyboard-shortcuts-help__content {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.keyboard-shortcuts-help__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.keyboard-shortcuts-help__header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.keyboard-shortcuts-help__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: color 0.2s, background 0.2s;
  min-width: 44px;
  min-height: 44px;
}

.keyboard-shortcuts-help__close:hover,
.keyboard-shortcuts-help__close:focus {
  color: #333;
  background: #f0f0f0;
}

.keyboard-shortcuts-help__body {
  padding: 16px 24px 24px;
  overflow-y: auto;
}

.keyboard-shortcuts-help__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.keyboard-shortcuts-help__item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.keyboard-shortcuts-help__key {
  background: #f5f5f5;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 6px 12px;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  min-width: 80px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.keyboard-shortcuts-help__description {
  flex: 1;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Roving tabindex styles */
.roving-tabindex {
  position: relative;
}

.roving-tabindex [tabindex="0"] {
  position: relative;
}

.roving-tabindex [tabindex="0"]:focus {
  z-index: 1;
}

/* Focus indicators for different element types */
button:focus,
[role="button"]:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

a:focus,
[role="link"]:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 1px;
}

/* Menu navigation styles */
[role="menu"],
[role="menubar"],
[role="listbox"] {
  position: relative;
}

[role="menuitem"]:focus,
[role="option"]:focus {
  background: var(--highlight-bg, #e3f2fd);
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: -2px;
}

/* Tab navigation styles */
[role="tablist"] {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

[role="tab"] {
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

[role="tab"]:hover {
  background: #f5f5f5;
}

[role="tab"]:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: -2px;
  z-index: 1;
}

[role="tab"][aria-selected="true"] {
  background: white;
  border-bottom: 2px solid var(--primary-color, #0066cc);
}

[role="tab"][aria-selected="true"]::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: white;
}

/* Grid navigation styles */
[role="grid"] {
  position: relative;
}

[role="gridcell"]:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: -1px;
  background: var(--highlight-bg, #e3f2fd);
}

/* Tree navigation styles */
[role="tree"] {
  position: relative;
}

[role="treeitem"]:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: -1px;
  background: var(--highlight-bg, #e3f2fd);
}

[role="treeitem"][aria-expanded="true"] > [role="group"] {
  display: block;
}

[role="treeitem"][aria-expanded="false"] > [role="group"] {
  display: none;
}

/* Skip links focus styles */
.skip-links a:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  padding: 12px 16px;
  background: var(--primary-color, #0066cc);
  color: white;
  text-decoration: none;
  outline: 2px solid white;
  outline-offset: -2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  *:focus {
    outline-width: 3px;
    outline-style: solid;
  }
  
  .keyboard-shortcuts-help__content {
    border: 2px solid;
  }
  
  .keyboard-shortcuts-help__key {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *:focus {
    transition: none;
  }
  
  .keyboard-shortcuts-help__content {
    animation: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .keyboard-shortcuts-help__content {
    background: #2d2d2d;
    border: 1px solid #555;
  }
  
  .keyboard-shortcuts-help__header {
    border-bottom-color: #555;
  }
  
  .keyboard-shortcuts-help__header h2 {
    color: #fff;
  }
  
  .keyboard-shortcuts-help__close {
    color: #ccc;
  }
  
  .keyboard-shortcuts-help__close:hover,
  .keyboard-shortcuts-help__close:focus {
    color: #fff;
    background: #444;
  }
  
  .keyboard-shortcuts-help__key {
    background: #444;
    border-color: #666;
    color: #fff;
  }
  
  .keyboard-shortcuts-help__description {
    color: #ccc;
  }
  
  [role="menuitem"]:focus,
  [role="option"]:focus {
    background: #0d47a1;
  }
  
  [role="tab"]:hover {
    background: #444;
  }
  
  [role="tab"][aria-selected="true"] {
    background: #2d2d2d;
  }
}

/* Print styles */
@media print {
  .keyboard-shortcuts-help,
  .focus-trap::before,
  .focus-trap::after {
    display: none;
  }
  
  *:focus {
    outline: none;
  }
}

/* Animation for focus transitions */
*:focus {
  transition: outline-color 0.15s ease-in-out;
}

/* Custom focus styles for branded elements */
.branded-focus:focus {
  outline: 2px solid var(--brand-color, #0066cc);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1);
}

/* Focus styles for interactive cards */
.interactive-card:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Focus styles for custom controls */
.custom-control:focus {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}

.custom-control:focus-within {
  outline: 2px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
}`;

    if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(stylesDir, 'keyboard-navigation.css'), keyboardStylesContent);
}