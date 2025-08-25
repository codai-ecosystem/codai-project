/**
 * @fileoverview Screen Reader Optimizer
 * @description Optimizes content and components for screen readers
 */

import fs from 'fs';
import path from 'path';

export default function optimizeForScreenReaders(dirs, appName) {
    createScreenReaderComponents(dirs.componentsDir, appName);
    createScreenReaderHooks(dirs.hooksDir, appName);
    createAriaUtils(dirs.utilsDir, appName);
    console.log(`📢 Screen reader optimization features created for ${appName}`);
}

function createScreenReaderComponents(componentsDir, appName) {
    const liveRegionContent = `/**
 * @fileoverview Live Region Component
 * @description Provides ARIA live regions for screen reader announcements
 */

import React, { useEffect, useRef, ReactNode } from 'react';

export interface LiveRegionProps {
  children?: ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
  id?: string;
}

/**
 * Live Region Component for screen reader announcements
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text',
  className = 'sr-only',
  id
}) => {
  const regionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={regionRef}
      id={id}
      className={className}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
    >
      {children}
    </div>
  );
};

/**
 * Announcement Region - Self-clearing live region
 */
export const AnnouncementRegion: React.FC<{
  message: string;
  politeness?: 'polite' | 'assertive';
  duration?: number;
  onComplete?: () => void;
}> = ({
  message,
  politeness = 'polite',
  duration = 1000,
  onComplete
}) => {
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onComplete]);

  if (!visible || !message) return null;

  return (
    <LiveRegion politeness={politeness} atomic={true}>
      {message}
    </LiveRegion>
  );
};

export default { LiveRegion, AnnouncementRegion };`;

    const screenReaderContentContent = `/**
 * @fileoverview Screen Reader Content Component
 * @description Provides structured content for screen readers
 */

import React, { ReactNode } from 'react';

export interface ScreenReaderContentProps {
  children: ReactNode;
  description?: string;
  instructions?: string;
  shortcuts?: Array<{ key: string; description: string }>;
}

/**
 * Screen Reader Content - Provides structured information
 */
export const ScreenReaderContent: React.FC<ScreenReaderContentProps> = ({
  children,
  description,
  instructions,
  shortcuts
}) => {
  return (
    <div>
      {description && (
        <div className="sr-only" role="note">
          <h3>Page Description</h3>
          <p>{description}</p>
        </div>
      )}

      {instructions && (
        <div className="sr-only" role="note">
          <h3>Instructions</h3>
          <p>{instructions}</p>
        </div>
      )}

      {shortcuts && shortcuts.length > 0 && (
        <div className="sr-only" role="note">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            {shortcuts.map((shortcut, index) => (
              <li key={index}>
                {shortcut.key}: {shortcut.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}
    </div>
  );
};

/**
 * Screen Reader Only Text Component
 */
export const ScreenReaderOnly: React.FC<{
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">{children}</Component>
);

/**
 * Visually Hidden but focusable content
 */
export const VisuallyHiddenFocusable: React.FC<{
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
}> = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only-focusable">{children}</Component>
);

export default { ScreenReaderContent, ScreenReaderOnly, VisuallyHiddenFocusable };`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(componentsDir, 'LiveRegion.tsx'), liveRegionContent);
    fs.writeFileSync(path.join(componentsDir, 'ScreenReaderContent.tsx'), screenReaderContentContent);
}

function createScreenReaderHooks(hooksDir, appName) {
    const screenReaderHooksContent = `/**
 * @fileoverview Screen Reader Hooks
 * @description Custom hooks for screen reader functionality
 */

import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook for screen reader detection
 */
export const useScreenReaderDetection = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Multiple detection methods
    const detectionMethods = [
      // Check for screen reader specific APIs
      () => 'speechSynthesis' in window,
      () => 'webkitSpeechSynthesis' in window,
      () => navigator.userAgent.includes('NVDA'),
      () => navigator.userAgent.includes('JAWS'),
      () => navigator.userAgent.includes('VoiceOver'),
      () => window.navigator.userAgent.includes('Talkback')
    ];

    const detected = detectionMethods.some(method => method());
    setIsScreenReaderActive(detected);

    // Additional detection through focus patterns
    let tabCount = 0;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        tabCount++;
        if (tabCount > 3) {
          setIsScreenReaderActive(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isScreenReaderActive;
};

/**
 * Hook for live announcements
 */
export const useLiveAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'live-announcer';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current && document.body.contains(announcerRef.current)) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite',
    clearDelay: number = 1000
  ) => {
    if (!announcerRef.current) return;

    // Update the politeness level
    announcerRef.current.setAttribute('aria-live', priority);
    
    // Set the message
    announcerRef.current.textContent = message;

    // Clear the message after delay
    if (clearDelay > 0) {
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, clearDelay);
    }
  }, []);

  const announceError = useCallback((message: string) => {
    announce(\`Error: \${message}\`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(\`Success: \${message}\`, 'polite');
  }, [announce]);

  const announceNavigation = useCallback((message: string) => {
    announce(\`Navigated to \${message}\`, 'polite');
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceNavigation
  };
};

/**
 * Hook for managing reading flow
 */
export const useReadingFlow = () => {
  const [currentSection, setCurrentSection] = useState<string>('');
  const [readingMode, setReadingMode] = useState<'browse' | 'forms' | 'application'>('browse');

  const markSection = useCallback((sectionId: string, sectionName: string) => {
    setCurrentSection(sectionName);
    
    // Announce section change
    const announcer = document.getElementById('live-announcer');
    if (announcer) {
      announcer.textContent = \`Now in \${sectionName} section\`;
    }
  }, []);

  const changeReadingMode = useCallback((mode: 'browse' | 'forms' | 'application') => {
    setReadingMode(mode);
    
    const modeMessages = {
      browse: 'Browse mode: Navigate through content with arrow keys',
      forms: 'Forms mode: Use Tab to move between form fields',
      application: 'Application mode: Interactive elements are focusable'
    };
    
    const announcer = document.getElementById('live-announcer');
    if (announcer) {
      announcer.textContent = modeMessages[mode];
    }
  }, []);

  return {
    currentSection,
    readingMode,
    markSection,
    changeReadingMode
  };
};

export default {
  useScreenReaderDetection,
  useLiveAnnouncer,
  useReadingFlow
};

    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(hooksDir, 'useScreenReader.ts'), screenReaderHooksContent);
}

function createAriaUtils(utilsDir, appName) {
    const ariaUtilsContent = `/**
 * @fileoverview ARIA Utilities for Screen Readers
 * @description Enhanced ARIA utilities for screen reader optimization
 */

    /**
     * ARIA Live Region Manager
     */
    export class AriaLiveManager {
        private static instance: AriaLiveManager;
        private politeRegion: HTMLElement | null = null;
        private assertiveRegion: HTMLElement | null = null;

        private constructor() {
            this.initializeRegions();
        }

        static getInstance(): AriaLiveManager {
            if (!AriaLiveManager.instance) {
                AriaLiveManager.instance = new AriaLiveManager();
            }
            return AriaLiveManager.instance;
        }

        private initializeRegions() {
            // Create polite live region
            this.politeRegion = document.createElement('div');
            this.politeRegion.setAttribute('aria-live', 'polite');
            this.politeRegion.setAttribute('aria-atomic', 'true');
            this.politeRegion.className = 'sr-only';
            this.politeRegion.id = 'aria-live-polite';
            document.body.appendChild(this.politeRegion);

            // Create assertive live region
            this.assertiveRegion = document.createElement('div');
            this.assertiveRegion.setAttribute('aria-live', 'assertive');
            this.assertiveRegion.setAttribute('aria-atomic', 'true');
            this.assertiveRegion.className = 'sr-only';
            this.assertiveRegion.id = 'aria-live-assertive';
            document.body.appendChild(this.assertiveRegion);
        }

        announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
            const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

            if (region) {
                // Clear previous message
                region.textContent = '';

                // Add new message after a brief delay to ensure screen readers notice the change
                setTimeout(() => {
                    region.textContent = message;
                }, 100);

                // Clear message after announcement
                setTimeout(() => {
                    region.textContent = '';
                }, 1000);
            }
        }

        announceError(message: string): void {
            this.announce(\`Error: \${message}\`, 'assertive');
  }

  announceSuccess(message: string): void {
    this.announce(\`Success: \${message}\`, 'polite');
  }

  announceNavigation(location: string): void {
    this.announce(\`Navigated to \${location}\`, 'polite');
  }

  announceLoading(isLoading: boolean, message?: string): void {
    if (isLoading) {
      this.announce(message || 'Loading content, please wait', 'polite');
    } else {
      this.announce('Content loaded', 'polite');
    }
  }
}

/**
 * Enhanced ARIA utilities for screen readers
 */
export class EnhancedAriaUtils {
  /**
   * Create comprehensive ARIA description
   */
  static createDescription(element: HTMLElement, options: {
    includeRole?: boolean;
    includeState?: boolean;
    includeInstructions?: boolean;
    context?: string;
  } = {}): string {
    const parts: string[] = [];
    
    if (options.context) {
      parts.push(options.context);
    }
    
    // Add role information
    if (options.includeRole) {
      const role = element.getAttribute('role') || this.getImplicitRole(element);
      if (role) {
        parts.push(\`\${role} element\`);
      }
    }
    
    // Add state information
    if (options.includeState) {
      const states = this.getElementStates(element);
      parts.push(...states);
    }
    
    // Add instructions
    if (options.includeInstructions) {
      const instructions = this.getUsageInstructions(element);
      if (instructions) {
        parts.push(instructions);
      }
    }
    
    return parts.join(', ');
  }

  /**
   * Get implicit ARIA role for element
   */
  static getImplicitRole(element: HTMLElement): string | null {
    const tagName = element.tagName.toLowerCase();
    
    const roleMap: { [key: string]: string } = {
      'button': 'button',
      'a': element.hasAttribute('href') ? 'link' : null,
      'input': this.getInputRole(element as HTMLInputElement),
      'select': 'combobox',
      'textarea': 'textbox',
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'h1': 'heading', 'h2': 'heading', 'h3': 'heading',
      'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
      'ul': 'list', 'ol': 'list', 'li': 'listitem',
      'table': 'table', 'tr': 'row', 'td': 'cell', 'th': 'columnheader'
    };
    
    return roleMap[tagName] || null;
  }

  /**
   * Get input element role based on type
   */
  private static getInputRole(input: HTMLInputElement): string {
    const type = input.type.toLowerCase();
    
    const inputRoles: { [key: string]: string } = {
      'button': 'button',
      'submit': 'button',
      'reset': 'button',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'range': 'slider',
      'search': 'searchbox',
      'email': 'textbox',
      'password': 'textbox',
      'text': 'textbox',
      'url': 'textbox',
      'tel': 'textbox'
    };
    
    return inputRoles[type] || 'textbox';
  }

  /**
   * Get current element states for screen readers
   */
  static getElementStates(element: HTMLElement): string[] {
    const states: string[] = [];
    
    // Check various ARIA states
    if (element.getAttribute('aria-expanded') === 'true') {
      states.push('expanded');
    } else if (element.getAttribute('aria-expanded') === 'false') {
      states.push('collapsed');
    }
    
    if (element.getAttribute('aria-selected') === 'true') {
      states.push('selected');
    }
    
    if (element.getAttribute('aria-checked') === 'true') {
      states.push('checked');
    } else if (element.getAttribute('aria-checked') === 'false') {
      states.push('unchecked');
    }
    
    if (element.getAttribute('aria-disabled') === 'true' || element.hasAttribute('disabled')) {
      states.push('disabled');
    }
    
    if (element.getAttribute('aria-required') === 'true' || element.hasAttribute('required')) {
      states.push('required');
    }
    
    if (element.getAttribute('aria-invalid') === 'true') {
      states.push('invalid');
    }
    
    return states;
  }

  /**
   * Get usage instructions for interactive elements
   */
  static getUsageInstructions(element: HTMLElement): string | null {
    const role = element.getAttribute('role') || this.getImplicitRole(element);
    
    const instructions: { [key: string]: string } = {
      'button': 'Press Enter or Space to activate',
      'link': 'Press Enter to follow link',
      'combobox': 'Use arrow keys to navigate options',
      'listbox': 'Use arrow keys to navigate, Enter to select',
      'menu': 'Use arrow keys to navigate, Enter to select, Escape to close',
      'menuitem': 'Press Enter to activate',
      'tab': 'Use arrow keys to navigate tabs, Enter to activate',
      'slider': 'Use arrow keys to adjust value',
      'checkbox': 'Press Space to toggle',
      'radio': 'Use arrow keys to select option'
    };
    
    return instructions[role || ''] || null;
  }

  /**
   * Format text for optimal screen reader pronunciation
   */
  static formatForScreenReader(text: string, type: 'number' | 'date' | 'time' | 'currency' | 'text' = 'text'): string {
    switch (type) {
      case 'number':
        return this.formatNumberForSR(text);
      case 'date':
        return this.formatDateForSR(text);
      case 'time':
        return this.formatTimeForSR(text);
      case 'currency':
        return this.formatCurrencyForSR(text);
      default:
        return this.formatTextForSR(text);
    }
  }

  private static formatNumberForSR(text: string): string {
    const num = parseFloat(text);
    if (isNaN(num)) return text;
    
    if (num >= 1000000) {
      return \`\${(num / 1000000).toFixed(1)} million\`;
    } else if (num >= 1000) {
      return \`\${(num / 1000).toFixed(1)} thousand\`;
    }
    return num.toString();
  }

  private static formatDateForSR(text: string): string {
    const date = new Date(text);
    if (isNaN(date.getTime())) return text;
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private static formatTimeForSR(text: string): string {
    const time = new Date(\`2000-01-01 \${text}\`);
    if (isNaN(time.getTime())) return text;
    
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  private static formatCurrencyForSR(text: string): string {
    const match = text.match(/^[$]?([0-9,]+.?[0-9]*)/);
    if (!match) return text;
    
    const amount = parseFloat(match[1].replace(',', ''));
    return \`\${amount} dollars\`;
  }

  private static formatTextForSR(text: string): string {
    // Replace common abbreviations with full words
    return text
      .replace(/&/g, 'and')
      .replace(/\//g, ' slash ')
      .replace(/@/g, ' at ')
      .replace(/#/g, ' hash ')
      .replace(/\$/g, ' dollar ')
      .replace(/%/g, ' percent ');
  }
}

export default { AriaLiveManager, EnhancedAriaUtils }`;

            fs.writeFileSync(path.join(utilsDir, 'screen-reader-utils.ts'), ariaUtilsContent); `;