// Accessibility utility components for WCAG 2.1 AA compliance

import React from 'react';

// Skip Navigation Link Component
export const SkipNavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    role="navigation"
    aria-label="Skip to main content"
  >
    {children}
  </a>
);

// Accessible Button Component
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, ariaLabel, ariaDescribedBy, disabled = false, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    disabled={disabled}
    className={`${className} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
  >
    {children}
  </button>
);

// Accessible Heading Component (ensures proper hierarchy)
export const AccessibleHeading: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ level, children, className = '', id }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      id={id}
      className={`${className} focus:outline-none`}
      tabIndex={-1}
    >
      {children}
    </Tag>
  );
};

// Screen Reader Only Text Component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// Accessible Link Component with proper focus management
export const AccessibleLink: React.FC<{
  href: string;
  children: React.ReactNode;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
}> = ({ href, children, external = false, ariaLabel, className = '' }) => (
  <a
    href={href}
    aria-label={ariaLabel}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className={`${className} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
  >
    {children}
  </a>
);

// Form Input with Accessibility Features
export const AccessibleInput: React.FC<{
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, type = 'text', required = false, error, helpText, className = '', value, onChange }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
    </label>
    <input
      id={id}
      type={type}
      required={required}
      aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
      aria-invalid={error ? 'true' : 'false'}
      className={`${className} w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : ''}`}
      value={value}
      onChange={onChange}
    />
    {helpText && (
      <p id={`${id}-help`} className="text-sm text-gray-600">
        {helpText}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
);

// Live Region Component for Dynamic Content Announcements
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  level?: 'polite' | 'assertive';
  atomic?: boolean;
}> = ({ children, level = 'polite', atomic = false }) => (
  <div
    aria-live={level}
    aria-atomic={atomic}
    className="sr-only"
  >
    {children}
  </div>
);
