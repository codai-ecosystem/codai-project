/**
 * SearchInput Component
 * Enhanced with Microsoft accessibility best practices and WCAG 2.1 AA compliance
 * Optimized following Microsoft React best practices
 */
'use client';

import React, { memo, useCallback, forwardRef, useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
// Standard lucide-react import - optimized by Next.js experimental.optimizePackageImports
import { Search, Loader2, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  isLoading: boolean;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

/**
 * SearchInput - Memoized search input component with comprehensive accessibility
 * Implements Microsoft's React performance patterns and WCAG 2.1 AA compliance:
 * - React.memo to prevent unnecessary re-renders
 * - useCallback for event handlers to maintain referential equality
 * - forwardRef for proper focus management
 * - Complete keyboard navigation support
 * - Screen reader compatibility with ARIA labels and live regions
 * - Focus management and visual indicators
 */
const SearchInput = memo(forwardRef<HTMLInputElement, SearchInputProps>(({
  value,
  onChange,
  onSubmit,
  isLoading,
  suggestions,
  onSuggestionClick,
  placeholder = "Ask me anything about your memories...",
  className,
  showSuggestions = true
}, ref) => {

  // State for accessibility features
  const [isFocused, setIsFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const suggestionsListRef = useRef<HTMLDivElement>(null);
  const formId = useRef(`search-form-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = useRef(`search-input-${Math.random().toString(36).substr(2, 9)}`);

  // Announce changes to screen readers
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
    }
  }, []);

  // Enhanced event handlers with accessibility support
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;

    announceToScreenReader(`Searching for: ${value.trim()}`, 'assertive');
    onSubmit(value.trim());
    setActiveSuggestionIndex(-1);
  }, [value, isLoading, onSubmit, announceToScreenReader]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setActiveSuggestionIndex(-1);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      announceToScreenReader(`${suggestions.length} search suggestions available. Use down arrow to navigate.`);
    }
  }, [suggestions.length, announceToScreenReader]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Small delay to allow suggestion clicks to register
    setTimeout(() => setActiveSuggestionIndex(-1), 150);
  }, []);

  const handleClear = useCallback(() => {
    onChange('');
    setActiveSuggestionIndex(-1);
    announceToScreenReader('Search input cleared');

    // Focus back to input
    if (ref && 'current' in ref && ref.current) {
      ref.current.focus();
    }
  }, [onChange, announceToScreenReader, ref]);

  const handleSuggestionClick = useCallback((suggestion: string, index?: number) => {
    onSuggestionClick(suggestion);
    setActiveSuggestionIndex(index ?? -1);
    announceToScreenReader(`Selected suggestion: ${suggestion}`);
  }, [onSuggestionClick, announceToScreenReader]);

  // Enhanced keyboard navigation for input and suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          const newIndex = activeSuggestionIndex < suggestions.length - 1 ? activeSuggestionIndex + 1 : 0;
          setActiveSuggestionIndex(newIndex);
          announceToScreenReader(`Suggestion ${newIndex + 1} of ${suggestions.length}: ${suggestions[newIndex]}`);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (suggestions.length > 0) {
          const newIndex = activeSuggestionIndex > 0 ? activeSuggestionIndex - 1 : suggestions.length - 1;
          setActiveSuggestionIndex(newIndex);
          announceToScreenReader(`Suggestion ${newIndex + 1} of ${suggestions.length}: ${suggestions[newIndex]}`);
        }
        break;

      case 'Enter':
        if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
          e.preventDefault();
          handleSuggestionClick(suggestions[activeSuggestionIndex], activeSuggestionIndex);
        }
        // If no active suggestion, form submit will handle it
        break;

      case 'Escape':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          setActiveSuggestionIndex(-1);
          announceToScreenReader('Suggestion navigation cancelled');
        } else if (value) {
          handleClear();
        }
        break;

      case 'Tab':
        // Allow normal tab navigation
        setActiveSuggestionIndex(-1);
        break;
    }
  }, [suggestions, activeSuggestionIndex, announceToScreenReader, handleSuggestionClick, value, handleClear]);

  // Keyboard navigation for suggestion badges
  const handleSuggestionKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLElement>,
    suggestion: string,
    index: number
  ) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleSuggestionClick(suggestion, index);
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = index < suggestions.length - 1 ? index + 1 : 0;
        const nextButton = suggestionsListRef.current?.children[nextIndex] as HTMLButtonElement;
        nextButton?.focus();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : suggestions.length - 1;
        const prevButton = suggestionsListRef.current?.children[prevIndex] as HTMLButtonElement;
        prevButton?.focus();
        break;

      case 'Escape':
        e.preventDefault();
        if (ref && 'current' in ref && ref.current) {
          ref.current.focus();
        }
        break;
    }
  }, [handleSuggestionClick, suggestions.length, ref]);

  // Announce loading state changes
  useEffect(() => {
    if (isLoading) {
      announceToScreenReader('Searching your memories...', 'assertive');
    }
  }, [isLoading, announceToScreenReader]);

  // Character count validation
  const characterCount = value.length;
  const maxLength = 500;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className={cn('space-y-4', className)} role="region" aria-label="Memory search interface">
      {/* Search Form with enhanced accessibility */}
      <form
        onSubmit={handleSubmit}
        className="relative"
        id={formId.current}
        role="search"
        aria-label="Search your memories"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={ref}
              id={inputId.current}
              type="search"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={isLoading}
              maxLength={maxLength}
              className={cn(
                "pr-10 text-sm transition-all duration-200 ease-in-out",
                "border-2 rounded-lg focus:ring-2 focus:ring-offset-1",
                isFocused
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-300 hover:border-gray-400",
                isOverLimit && "border-red-500 ring-red-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              )}
              // Comprehensive ARIA attributes
              aria-label="Search your memories using natural language"
              aria-describedby={cn(
                "search-help",
                isNearLimit && "char-count-warning",
                isOverLimit && "char-count-error"
              )}
              aria-invalid={isOverLimit}
              aria-autocomplete="list"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-controls={suggestions.length > 0 ? "suggestions-list" : undefined}
              aria-activedescendant={
                activeSuggestionIndex >= 0
                  ? `suggestion-${activeSuggestionIndex}`
                  : undefined
              }
              autoComplete="off"
              spellCheck="true"
              role="searchbox"
            />

            {/* Search icon */}
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />

            {/* Clear button when there's content */}
            {value && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                aria-label={`Clear search query: ${value.slice(0, 30)}${value.length > 30 ? '...' : ''}`}
                title="Clear search (Escape key)"
                tabIndex={-1} // Handled by keyboard navigation
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={!value.trim() || isLoading || isOverLimit}
            className="min-w-[80px] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={isLoading ? "Searching memories..." : `Search for: ${value.slice(0, 30)}${value.length > 30 ? '...' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                <span className="sr-only">Searching your memories...</span>
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Character count and validation */}
        <div className="mt-1 flex justify-between items-center">
          {/* Instructions and help text */}
          <div className="text-sm text-gray-600">
            <span id="search-help" className="sr-only">
              Enter your search query in natural language. Use arrow keys to navigate suggestions. Press Escape to clear or cancel.
            </span>

            {isNearLimit && (
              <span
                id="char-count-warning"
                className={cn(
                  "text-amber-600",
                  isOverLimit && "sr-only"
                )}
                role="status"
                aria-live="polite"
              >
                {maxLength - characterCount} characters remaining
              </span>
            )}

            {isOverLimit && (
              <span
                id="char-count-error"
                className="text-red-600 font-medium"
                role="alert"
                aria-live="assertive"
              >
                Query too long. Please limit to {maxLength} characters.
              </span>
            )}
          </div>

          {/* Character count */}
          <span
            className={cn(
              "text-xs",
              isNearLimit ? "text-amber-600" : "text-gray-500",
              isOverLimit && "text-red-600 font-medium"
            )}
            aria-label={`${characterCount} of ${maxLength} characters used`}
          >
            {characterCount}/{maxLength}
          </span>
        </div>
      </form>

      {/* Suggestions with enhanced accessibility */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="space-y-2"
          role="region"
          aria-label={`${suggestions.length} search suggestions available`}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Try these suggestions:</span>
          </div>
          <div
            ref={suggestionsListRef}
            id="suggestions-list"
            className="flex flex-wrap gap-2"
            role="listbox"
            aria-label="Search suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <Badge
                key={`suggestion-${index}`}
                id={`suggestion-${index}`}
                variant="secondary"
                className={cn(
                  "cursor-pointer hover:bg-indigo-100 transition-colors text-xs",
                  "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none",
                  activeSuggestionIndex === index && "bg-indigo-100 ring-2 ring-blue-500"
                )}
                onClick={() => handleSuggestionClick(suggestion, index)}
                onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion, index)}
                tabIndex={0}
                role="option"
                aria-selected={activeSuggestionIndex === index}
                aria-label={`Use suggestion ${index + 1} of ${suggestions.length}: ${suggestion}`}
                title={`Click to search for: ${suggestion}`}
              >
                {suggestion}
              </Badge>
            ))}
          </div>

          {/* Additional instructions for keyboard users */}
          <p className="text-xs text-gray-500 mt-2">
            <span className="sr-only">
              Navigate suggestions using arrow keys from the search input, or tab through suggestion badges.
              Press Enter or Space to select a suggestion.
            </span>
            <span aria-hidden="true">
              Use arrow keys or Tab to navigate • Enter/Space to select
            </span>
          </p>
        </div>
      )}

      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}));

SearchInput.displayName = 'SearchInput';

export default SearchInput;