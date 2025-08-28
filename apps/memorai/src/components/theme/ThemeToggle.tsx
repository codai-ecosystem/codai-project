/**
 * @fileoverview Theme Toggle Component
 * @description Interactive button for switching between light/dark themes
 */

'use client';

import React from 'react';
import { useTheme, type Theme } from './ThemeProvider';
import { useTranslations } from 'next-intl';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md',
  showLabel = false,
  className = ''
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const t = useTranslations('theme');

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="appearance-none bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="system">{t('system')}</option>
          <option value="light">{t('light')}</option>
          <option value="dark">{t('dark')}</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className={iconSize[size]} />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        ${className}
        relative inline-flex items-center justify-center
        rounded-md border border-border
        bg-background hover:bg-muted/50
        text-foreground
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={t('toggleTheme')}
      aria-label={t('toggleTheme')}
    >
      {/* Sun Icon */}
      <SunIcon
        className={`
          ${iconSize[size]}
          absolute transition-transform duration-300
          ${resolvedTheme === 'dark' ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}
        `}
      />
      
      {/* Moon Icon */}
      <MoonIcon
        className={`
          ${iconSize[size]}
          absolute transition-transform duration-300
          ${resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}
        `}
      />
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {t(resolvedTheme)}
        </span>
      )}
    </button>
  );
}

// Icon components
function SunIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

// Theme system status indicator (for development/debugging)
export function ThemeDebugInfo() {
  const { theme, resolvedTheme } = useTheme();
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-md px-3 py-2 text-xs font-mono shadow-lg z-50">
      <div className="text-foreground/60">Theme Debug</div>
      <div className="text-foreground">
        Setting: <span className="text-primary font-semibold">{theme}</span>
      </div>
      <div className="text-foreground">
        Resolved: <span className="text-secondary font-semibold">{resolvedTheme}</span>
      </div>
    </div>
  );
}