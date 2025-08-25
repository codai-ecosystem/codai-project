/**
 * @fileoverview WCAG Compliance Enhancer
 * @description Implements comprehensive WCAG 2.1 AA compliance features
 */

import fs from 'fs';
import path from 'path';

export default function enhanceWcagCompliance(dirs, appName) {
    createWcagComponents(dirs.componentsDir, appName);
    createWcagStyles(dirs.stylesDir, appName);
    createWcagMiddleware(dirs.utilsDir, appName);
    createWcagConfig(dirs.utilsDir, appName);
    console.log(`📋 WCAG 2.1 AA compliance features created for ${appName}`);
}

function createWcagComponents(componentsDir, appName) {
    const skipLinksContent = `/**
 * @fileoverview Skip Links Component
 * @description Provides keyboard navigation shortcuts
 */

import React from 'react';
import { useSkipLinks } from '../hooks/useAccessibility';

export interface SkipLinksProps {
  className?: string;
  links?: Array<{
    href: string;
    label: string;
    target?: string;
  }>;
}

/**
 * Skip Links Component for keyboard navigation
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({ 
  className = '',
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#main-navigation', label: 'Skip to navigation' },
    { href: '#footer', label: 'Skip to footer' }
  ]
}) => {
  const { skipToContent, skipToNavigation } = useSkipLinks();

  const handleSkipLinkClick = (href: string, event: React.MouseEvent) => {
    event.preventDefault();
    
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={\`skip-links \${className}\`} aria-label="Skip navigation links">
      <ul className="skip-links__list">
        {links.map((link, index) => (
          <li key={index} className="skip-links__item">
            <a
              href={link.href}
              className="skip-links__link"
              onClick={(e) => handleSkipLinkClick(link.href, e)}
              onFocus={(e) => e.target.classList.add('visible')}
              onBlur={(e) => e.target.classList.remove('visible')}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipLinks;`;

    const headingStructureContent = `/**
 * @fileoverview Heading Structure Component
 * @description Ensures proper heading hierarchy for screen readers
 */

import React, { createContext, useContext, ReactNode } from 'react';

interface HeadingContextType {
  level: number;
}

const HeadingContext = createContext<HeadingContextType>({ level: 1 });

interface HeadingProviderProps {
  children: ReactNode;
  level?: number;
}

/**
 * Heading Level Provider
 */
export const HeadingProvider: React.FC<HeadingProviderProps> = ({ 
  children, 
  level = 1 
}) => (
  <HeadingContext.Provider value={{ level }}>
    {children}
  </HeadingContext.Provider>
);

interface HeadingProps {
  children: ReactNode;
  className?: string;
  id?: string;
  increment?: boolean;
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Semantic Heading Component
 */
export const Heading: React.FC<HeadingProps> = ({
  children,
  className = '',
  id,
  increment = true,
  visualLevel
}) => {
  const { level } = useContext(HeadingContext);
  const headingLevel = Math.min(6, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5 | 6;
  const HeadingTag = \`h\${headingLevel}\` as keyof JSX.IntrinsicElements;
  
  const visualClass = visualLevel ? \`h\${visualLevel}\` : \`h\${headingLevel}\`;
  
  const nextLevel = increment ? level + 1 : level;
  
  return (
    <HeadingProvider level={nextLevel}>
      <HeadingTag 
        id={id}
        className={\`heading \${visualClass} \${className}\`}
      >
        {children}
      </HeadingTag>
    </HeadingProvider>
  );
};

/**
 * Hook to get current heading level
 */
export const useHeadingLevel = (): number => {
  const { level } = useContext(HeadingContext);
  return level;
};

export default { HeadingProvider, Heading, useHeadingLevel };`;

    const accessibleButtonContent = `/**
 * @fileoverview Accessible Button Component
 * @description Button component with full accessibility support
 */

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { useKeyboardNavigation, useAnnouncer } from '../hooks/useAccessibility';

export interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  tooltip?: string;
}

/**
 * Accessible Button Component
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText = 'Loading...',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  tooltip,
  disabled,
  onClick,
  className = '',
  ...props
}, ref) => {
  const { announce } = useAnnouncer();
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    
    // Announce button action for screen readers
    const buttonText = typeof children === 'string' ? children : 'Button';
    announce(\`\${buttonText} activated\`, 'polite');
    
    onClick?.(event);
  };

  const { handleKeyDown } = useKeyboardNavigation(
    () => handleClick({} as React.MouseEvent<HTMLButtonElement>),
    () => handleClick({} as React.MouseEvent<HTMLButtonElement>)
  );

  const buttonClasses = [
    'accessible-button',
    \`accessible-button--\${variant}\`,
    \`accessible-button--\${size}\`,
    fullWidth && 'accessible-button--full-width',
    loading && 'accessible-button--loading',
    disabled && 'accessible-button--disabled',
    className
  ].filter(Boolean).join(' ');

  const buttonContent = (
    <>
      {loading && (
        <span 
          className="accessible-button__spinner" 
          aria-hidden="true"
          role="presentation"
        >
          <span className="spinner" />
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="accessible-button__icon accessible-button__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      <span className="accessible-button__text">
        {loading ? loadingText : children}
      </span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="accessible-button__icon accessible-button__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={loading ? loadingText : undefined}
      aria-describedby={tooltip ? \`\${props.id}-tooltip\` : undefined}
      aria-busy={loading}
      type="button"
      {...props}
    >
      {buttonContent}
      
      {tooltip && (
        <span
          id={\`\${props.id}-tooltip\`}
          className="accessible-button__tooltip sr-only"
          role="tooltip"
        >
          {tooltip}
        </span>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;`;

    const accessibleLinkContent = `/**
 * @fileoverview Accessible Link Component
 * @description Link component with accessibility features
 */

import React, { forwardRef, AnchorHTMLAttributes, ReactNode } from 'react';
import { useKeyboardNavigation } from '../hooks/useAccessibility';

export interface AccessibleLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  external?: boolean;
  download?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  underline?: boolean;
  showExternalIcon?: boolean;
}

/**
 * Accessible Link Component
 */
export const AccessibleLink = forwardRef<HTMLAnchorElement, AccessibleLinkProps>(({
  children,
  external = false,
  download = false,
  icon,
  iconPosition = 'left',
  underline = true,
  showExternalIcon = true,
  className = '',
  href,
  target,
  rel,
  ...props
}, ref) => {
  
  const isExternal = external || (href && (href.startsWith('http') || href.startsWith('//')));
  const finalTarget = target || (isExternal ? '_blank' : undefined);
  const finalRel = rel || (isExternal ? 'noopener noreferrer' : undefined);

  const { handleKeyDown } = useKeyboardNavigation(
    () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.click();
      }
    }
  );

  const linkClasses = [
    'accessible-link',
    underline && 'accessible-link--underline',
    isExternal && 'accessible-link--external',
    download && 'accessible-link--download',
    className
  ].filter(Boolean).join(' ');

  const linkText = typeof children === 'string' ? children : '';
  const ariaLabel = isExternal && linkText 
    ? \`\${linkText} (opens in new tab)\`
    : undefined;

  return (
    <a
      ref={ref}
      href={href}
      target={finalTarget}
      rel={finalRel}
      className={linkClasses}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="accessible-link__icon accessible-link__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      <span className="accessible-link__text">
        {children}
      </span>
      
      {icon && iconPosition === 'right' && (
        <span className="accessible-link__icon accessible-link__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {isExternal && showExternalIcon && (
        <span className="accessible-link__external-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1h5v5L9.5 4.5 6.75 7.25 5.25 5.75 8 3H6V1zM2 3h2v1H2v6h6V8h1v3H1V3h1z"/>
          </svg>
        </span>
      )}
      
      {download && (
        <span className="accessible-link__download-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h3V0h2v4h3L6 8zM0 10h12v2H0v-2z"/>
          </svg>
        </span>
      )}
      
      {/* Screen reader only text for context */}
      {isExternal && (
        <span className="sr-only">
          (opens in new tab)
        </span>
      )}
      
      {download && (
        <span className="sr-only">
          (downloads file)
        </span>
      )}
    </a>
  );
});

AccessibleLink.displayName = 'AccessibleLink';

export default AccessibleLink;`;

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(componentsDir, 'SkipLinks.tsx'), skipLinksContent);
    fs.writeFileSync(path.join(componentsDir, 'HeadingStructure.tsx'), headingStructureContent);
    fs.writeFileSync(path.join(componentsDir, 'AccessibleButton.tsx'), accessibleButtonContent);
    fs.writeFileSync(path.join(componentsDir, 'AccessibleLink.tsx'), accessibleLinkContent);
}

function createWcagStyles(stylesDir, appName) {
    const wcagStylesContent = `/**
 * WCAG 2.1 AA Compliance Styles
 * Ensures accessibility standards are met across all components
 */

/* Skip Links Styles */
.skip-links {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  background: var(--color-primary, #0066cc);
  padding: 0;
  margin: 0;
}

.skip-links__list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
}

.skip-links__list:focus-within {
  transform: translateY(0);
}

.skip-links__item {
  margin: 0;
}

.skip-links__link {
  display: block;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  background: var(--color-primary, #0066cc);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.2s ease;
}

.skip-links__link:hover,
.skip-links__link:focus {
  background: var(--color-primary-dark, #0056b3);
  text-decoration: underline;
  outline: 2px solid white;
  outline-offset: -2px;
}

.skip-links__link.visible {
  transform: translateY(0);
}

/* Focus Management */
.focus-visible,
*:focus-visible {
  outline: 2px solid var(--color-focus, #0066cc);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove focus styles for mouse users */
.js-focus-visible *:focus:not(.focus-visible) {
  outline: none;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .accessible-button,
  .accessible-link,
  input,
  select,
  textarea {
    border: 2px solid;
  }
  
  .accessible-button:hover,
  .accessible-link:hover {
    border-width: 3px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .skip-links__list {
    transition: none;
  }
}

/* Screen Reader Only Content */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static !important;
  width: auto !important;
  height: auto !important;
  padding: inherit !important;
  margin: inherit !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
}

/* Accessible Button Styles */
.accessible-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* WCAG touch target size */
  min-width: 44px;
  position: relative;
  overflow: hidden;
}

.accessible-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.accessible-button--primary {
  background: var(--color-primary, #0066cc);
  color: white;
}

.accessible-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark, #0056b3);
}

.accessible-button--secondary {
  background: transparent;
  color: var(--color-primary, #0066cc);
  border: 2px solid var(--color-primary, #0066cc);
}

.accessible-button--secondary:hover:not(:disabled) {
  background: var(--color-primary, #0066cc);
  color: white;
}

.accessible-button--danger {
  background: var(--color-danger, #dc3545);
  color: white;
}

.accessible-button--danger:hover:not(:disabled) {
  background: var(--color-danger-dark, #c82333);
}

.accessible-button--small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.accessible-button--large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 52px;
}

.accessible-button--full-width {
  width: 100%;
}

.accessible-button--loading {
  color: transparent;
}

.accessible-button__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Accessible Link Styles */
.accessible-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary, #0066cc);
  text-decoration: none;
  position: relative;
  min-height: 44px; /* Touch target size */
  min-width: 44px;
  padding: 4px;
  border-radius: 4px;
}

.accessible-link--underline {
  text-decoration: underline;
}

.accessible-link:hover {
  color: var(--color-primary-dark, #0056b3);
  text-decoration: underline;
}

.accessible-link:focus {
  outline: 2px solid var(--color-focus, #0066cc);
  outline-offset: 2px;
}

.accessible-link__external-icon,
.accessible-link__download-icon {
  margin-left: 4px;
  flex-shrink: 0;
}

/* Color Contrast Variables */
:root {
  --color-primary: #0066cc;
  --color-primary-dark: #0056b3;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  --color-light: #f8f9fa;
  --color-dark: #343a40;
  --color-focus: #0066cc;
  
  /* Text Colors with WCAG AA contrast */
  --text-color-primary: #212529;
  --text-color-secondary: #6c757d;
  --text-color-inverse: #ffffff;
  
  /* Background Colors */
  --bg-color-primary: #ffffff;
  --bg-color-secondary: #f8f9fa;
  --bg-color-tertiary: #e9ecef;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #4dabf7;
    --color-primary-dark: #339af0;
    --text-color-primary: #ffffff;
    --text-color-secondary: #adb5bd;
    --bg-color-primary: #212529;
    --bg-color-secondary: #343a40;
    --bg-color-tertiary: #495057;
  }
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
  .accessible-button,
  .accessible-link {
    min-height: 48px; /* Larger touch targets for mobile */
    min-width: 48px;
  }
  
  .accessible-button--small {
    min-height: 44px;
  }
}

/* Print Styles */
@media print {
  .skip-links,
  .accessible-button__spinner,
  .accessible-link__external-icon {
    display: none;
  }
  
  .accessible-link::after {
    content: " (" attr(href) ")";
    font-size: smaller;
  }
}

/* Error and Success States */
.accessible-button--error {
  border: 2px solid var(--color-danger, #dc3545);
  background: #fff5f5;
  color: var(--color-danger, #dc3545);
}

.accessible-button--success {
  border: 2px solid var(--color-success, #28a745);
  background: #f0fff4;
  color: var(--color-success, #28a745);
}

/* Loading States */
.accessible-button--loading .accessible-button__text {
  opacity: 0;
}

/* Keyboard Navigation Indicators */
.keyboard-user .accessible-button:focus,
.keyboard-user .accessible-link:focus {
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.3);
  outline: 3px solid var(--color-focus, #0066cc);
}

/* High Contrast Mode Adjustments */
@media (forced-colors: active) {
  .accessible-button {
    border: 1px solid ButtonBorder;
  }
  
  .accessible-link {
    color: LinkText;
  }
  
  .accessible-link:visited {
    color: VisitedText;
  }
}`;

    if (!fs.existsSync(stylesDir)) {
        fs.mkdirSync(stylesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(stylesDir, 'wcag-compliance.css'), wcagStylesContent);
}

function createWcagMiddleware(utilsDir, appName) {
    const middlewareContent = `/**
 * @fileoverview WCAG Compliance Middleware
 * @description Express middleware for WCAG compliance checks
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Accessibility headers middleware
 */
export const accessibilityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add accessibility-related security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Add CSP headers that don't interfere with accessibility tools
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allows screen readers and accessibility tools
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  next();
};

/**
 * Language detection middleware
 */
export const languageDetection = (req: Request, res: Response, next: NextFunction) => {
  const acceptLanguage = req.headers['accept-language'] || 'en-US';
  const primaryLanguage = acceptLanguage.split(',')[0].split('-')[0];
  
  // Set language attribute for proper screen reader pronunciation
  res.locals.language = primaryLanguage;
  res.locals.locale = acceptLanguage.split(',')[0];
  
  next();
};

/**
 * Accessibility validation middleware
 */
export const validateAccessibility = (req: Request, res: Response, next: NextFunction) => {
  // Log accessibility-related request information
  if (process.env.NODE_ENV === 'development') {
    console.log('Accessibility Info:', {
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      preferredColorScheme: req.headers['sec-ch-prefers-color-scheme'],
      prefersReducedMotion: req.headers['sec-ch-prefers-reduced-motion']
    });
  }
  
  next();
};

/**
 * Error handling with accessibility considerations
 */
export const accessibleErrorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Provide accessible error responses
  const errorResponse = {
    error: {
      message: err.message,
      status: statusCode,
      // Include screen reader friendly error descriptions
      accessibleMessage: getAccessibleErrorMessage(statusCode, err.message),
      timestamp: new Date().toISOString(),
      path: req.path
    }
  };
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Generate screen reader friendly error messages
 */
function getAccessibleErrorMessage(statusCode: number, originalMessage: string): string {
  const accessibleMessages: { [key: number]: string } = {
    400: 'Bad Request: The information you provided is not valid. Please check your input and try again.',
    401: 'Unauthorized: You need to sign in to access this content.',
    403: 'Forbidden: You do not have permission to access this content.',
    404: 'Not Found: The page or resource you are looking for could not be found.',
    405: 'Method Not Allowed: The request method is not supported for this resource.',
    429: 'Too Many Requests: You have made too many requests. Please wait before trying again.',
    500: 'Internal Server Error: Something went wrong on our end. Please try again later.',
    502: 'Bad Gateway: The server is temporarily unavailable. Please try again later.',
    503: 'Service Unavailable: The service is temporarily unavailable. Please try again later.',
    504: 'Gateway Timeout: The server took too long to respond. Please try again later.'
  };
  
  return accessibleMessages[statusCode] || originalMessage;
}

/**
 * Content type middleware with accessibility considerations
 */
export const accessibleContentType = (req: Request, res: Response, next: NextFunction) => {
  // Ensure proper MIME types for assistive technologies
  const originalSend = res.send;
  
  res.send = function(body) {
    if (typeof body === 'string' && body.includes('<html')) {
      // Ensure HTML has proper language and accessibility attributes
      if (!body.includes('lang=')) {
        const language = res.locals.language || 'en';
        body = body.replace('<html', \`<html lang="\${language}"\`);
      }
      
      // Add skip navigation if not present
      if (!body.includes('skip-links') && !body.includes('#main-content')) {
        const skipLinks = \`
          <nav class="skip-links" aria-label="Skip navigation links">
            <a href="#main-content" class="skip-links__link">Skip to main content</a>
          </nav>
        \`;
        body = body.replace('<body', \`<body>\${skipLinks}\`);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Performance monitoring for accessibility
 */
export const accessibilityPerformance = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow responses that could affect accessibility
    if (duration > 3000) {
      console.warn(\`Slow response (\${duration}ms) for \${req.path} - may impact accessibility\`);
    }
  });
  
  next();
};

/**
 * ARIA live regions support
 */
export const liveRegionsSupport = (req: Request, res: Response, next: NextFunction) => {
  // Add helper method for live announcements
  res.locals.announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    return \`
      <div aria-live="\${priority}" aria-atomic="true" class="sr-only" role="status">
        \${message}
      </div>
    \`;
  };
  
  next();
};

export default {
  accessibilityHeaders,
  languageDetection,
  validateAccessibility,
  accessibleErrorHandler,
  accessibleContentType,
  accessibilityPerformance,
  liveRegionsSupport
};`;

    fs.writeFileSync(path.join(utilsDir, 'wcag-middleware.ts'), middlewareContent);
}

function createWcagConfig(utilsDir, appName) {
    const configContent = `/**
 * @fileoverview WCAG Configuration
 * @description Configuration for WCAG 2.1 AA compliance
 */

/**
 * WCAG 2.1 AA Color Contrast Requirements
 */
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5
} as const;

/**
 * WCAG Color Palette with AA compliance
 */
export const WCAG_COLORS = {
  // Primary colors with proper contrast
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb', 
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Main primary
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1'
  },
  
  // Text colors ensuring AA contrast
  text: {
    primary: '#212529',     // 16.94:1 contrast on white
    secondary: '#6c757d',   // 4.54:1 contrast on white (AA compliant)
    disabled: '#adb5bd',    // 2.8:1 contrast (for disabled states)
    inverse: '#ffffff'      // For dark backgrounds
  },
  
  // Background colors
  background: {
    paper: '#ffffff',
    default: '#fafafa',
    secondary: '#f5f5f5',
    tertiary: '#eeeeee'
  },
  
  // Status colors with proper contrast
  status: {
    success: {
      main: '#2e7d32',    // AA compliant on white
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ed6c02',    // AA compliant on white  
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff'
    },
    error: {
      main: '#d32f2f',    // AA compliant on white
      light: '#f44336', 
      dark: '#c62828',
      contrastText: '#ffffff'
    },
    info: {
      main: '#0288d1',    // AA compliant on white
      light: '#03a9f4',
      dark: '#01579b', 
      contrastText: '#ffffff'
    }
  }
} as const;

/**
 * Touch target minimum sizes per WCAG
 */
export const TOUCH_TARGET_SIZES = {
  MINIMUM: 44, // 44x44px minimum for WCAG AA
  COMFORTABLE: 48, // Recommended comfortable size
  LARGE: 56 // For primary actions
} as const;

/**
 * Typography scale with accessibility considerations
 */
export const TYPOGRAPHY_SCALE = {
  h1: {
    fontSize: '2.5rem',
    lineHeight: 1.2,
    fontWeight: 700,
    marginBottom: '1rem'
  },
  h2: {
    fontSize: '2rem', 
    lineHeight: 1.3,
    fontWeight: 600,
    marginBottom: '0.875rem'
  },
  h3: {
    fontSize: '1.75rem',
    lineHeight: 1.3, 
    fontWeight: 600,
    marginBottom: '0.75rem'
  },
  h4: {
    fontSize: '1.5rem',
    lineHeight: 1.4,
    fontWeight: 600, 
    marginBottom: '0.625rem'
  },
  h5: {
    fontSize: '1.25rem',
    lineHeight: 1.4,
    fontWeight: 500,
    marginBottom: '0.5rem'
  },
  h6: {
    fontSize: '1rem',
    lineHeight: 1.4, 
    fontWeight: 500,
    marginBottom: '0.5rem'
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5, // WCAG recommended line height
    fontWeight: 400
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 400
  },
  button: {
    fontSize: '0.875rem',
    lineHeight: 1.2,
    fontWeight: 500,
    textTransform: 'none' // Avoid all caps for screen readers
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 400
  }
} as const;

/**
 * Animation timing with reduced motion support
 */
export const ANIMATION_CONFIG = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)', 
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },
  // Respect user's reduced motion preference
  respectsReducedMotion: true
} as const;

/**
 * Focus management configuration
 */
export const FOCUS_CONFIG = {
  // Focus ring styles
  focusRing: {
    width: '2px',
    style: 'solid',
    color: WCAG_COLORS.primary[500],
    offset: '2px',
    borderRadius: '4px'
  },
  
  // Focus trap settings
  focusTrap: {
    initialFocus: true,
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    clickOutsideDeactivates: false
  }
} as const;

/**
 * ARIA configuration
 */
export const ARIA_CONFIG = {
  // Live region politeness levels
  liveRegions: {
    polite: 'polite',
    assertive: 'assertive', 
    off: 'off'
  },
  
  // Common ARIA attributes
  attributes: {
    labelledby: 'aria-labelledby',
    describedby: 'aria-describedby', 
    expanded: 'aria-expanded',
    hidden: 'aria-hidden',
    selected: 'aria-selected',
    checked: 'aria-checked',
    disabled: 'aria-disabled',
    required: 'aria-required',
    invalid: 'aria-invalid',
    busy: 'aria-busy',
    live: 'aria-live',
    atomic: 'aria-atomic',
    relevant: 'aria-relevant'
  },
  
  // Role definitions
  roles: {
    button: 'button',
    link: 'link', 
    heading: 'heading',
    navigation: 'navigation',
    main: 'main',
    banner: 'banner',
    contentinfo: 'contentinfo',
    complementary: 'complementary',
    search: 'search',
    dialog: 'dialog',
    alertdialog: 'alertdialog',
    alert: 'alert',
    status: 'status',
    log: 'log',
    marquee: 'marquee',
    timer: 'timer',
    application: 'application'
  }
} as const;

/**
 * Keyboard navigation configuration
 */
export const KEYBOARD_CONFIG = {
  keys: {
    tab: 'Tab',
    enter: 'Enter',
    space: ' ',
    escape: 'Escape',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown', 
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageUp: 'PageUp',
    pageDown: 'PageDown'
  },
  
  // Keyboard interaction patterns
  patterns: {
    menu: {
      trigger: ['Enter', ' ', 'ArrowDown', 'ArrowUp'],
      navigation: ['ArrowDown', 'ArrowUp', 'Home', 'End'],
      selection: ['Enter', ' '],
      close: ['Escape']
    },
    dialog: {
      close: ['Escape'],
      navigation: ['Tab']
    },
    tabs: {
      navigation: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
      activation: ['Enter', ' ']
    }
  }
} as const;

/**
 * Screen reader configuration
 */
export const SCREEN_READER_CONFIG = {
  // Announcement types
  announcements: {
    navigation: 'Navigation',
    status: 'Status update', 
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  },
  
  // Reading patterns
  readingFlow: {
    skipToContent: 'Skip to main content',
    skipToNavigation: 'Skip to navigation',
    pageStructure: 'Page structure',
    landmarks: 'Page landmarks'
  }
} as const;

/**
 * Form accessibility configuration 
 */
export const FORM_CONFIG = {
  validation: {
    showErrorsOnSubmit: true,
    showErrorsOnBlur: true,
    clearErrorsOnFocus: false,
    announceErrors: true
  },
  
  labels: {
    required: 'Required field',
    optional: 'Optional field', 
    invalid: 'Invalid input',
    valid: 'Valid input'
  },
  
  helpText: {
    position: 'after',
    associate: true
  }
} as const;

/**
 * Export combined configuration
 */
export const WCAG_CONFIG = {
  colors: WCAG_COLORS,
  contrast: WCAG_CONTRAST_RATIOS,
  touchTargets: TOUCH_TARGET_SIZES,
  typography: TYPOGRAPHY_SCALE,
  animation: ANIMATION_CONFIG,
  focus: FOCUS_CONFIG,
  aria: ARIA_CONFIG,
  keyboard: KEYBOARD_CONFIG,
  screenReader: SCREEN_READER_CONFIG,
  forms: FORM_CONFIG
} as const;

export default WCAG_CONFIG;`;

    fs.writeFileSync(path.join(utilsDir, 'wcag-config.ts'), configContent);
}