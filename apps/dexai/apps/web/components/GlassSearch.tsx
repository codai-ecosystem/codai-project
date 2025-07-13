'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

interface GlassSearchProps {
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  suggestions?: string[];
  isLoading?: boolean;
}

export default function GlassSearch({ 
  placeholder = "Scrie un cuvânt în română...", 
  size = 'large',
  onSearch,
  autoFocus = false,
  suggestions = [],
  isLoading = false
}: GlassSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    small: 'text-base py-3 px-4 pl-8',
    medium: 'text-lg py-4 px-6 pl-10',
    large: 'text-xl py-6 px-8 pl-12'
  };

  const buttonSizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-5 py-2.5 text-base',
    large: 'px-6 py-3 text-base'
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/dictionary?q=${encodeURIComponent(query.trim())}`);
      }
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      router.push(`/dictionary?q=${encodeURIComponent(suggestion)}`);
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Romanian Flag Accent - More Prominent */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <div className="w-2 h-10 bg-gradient-to-b from-blue-600 via-yellow-400 to-red-600 rounded-full shadow-lg"></div>
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0 && filteredSuggestions.length > 0);
              setSelectedSuggestionIndex(-1);
            }}
            onFocus={() => setShowSuggestions(query.length > 0 && filteredSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            aria-label="Search Romanian dictionary"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            role="combobox"
            className={`
              w-full ${sizeClasses[size]} 
              glass-input-improved
              text-white placeholder:text-white/50
              focus:placeholder:text-white/30
              group-hover:bg-white/15
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              text-base md:text-lg lg:text-xl
              ${isLoading ? 'pr-32' : 'pr-28'}
            `}
          />
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute right-32 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Search Button */}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`
              absolute right-3 top-1/2 transform -translate-y-1/2 
              glass-button-primary ${buttonSizeClasses[size]}
              rounded-lg font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 hover:scale-105
              focus:ring-2 focus:ring-white/50
            `}
            aria-label="Search"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isLoading ? 'Caută...' : 'Caută'}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl border border-white/30 shadow-2xl z-50 animate-fade-in"
          role="listbox"
        >
          <div className="p-3">
            <div className="text-sm text-white/80 mb-3 px-3 py-1 font-medium">
              💡 Sugestii populare:
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full text-left px-4 py-3 text-white rounded-lg transition-all duration-200 romanian-text
                  flex items-center justify-between group
                  ${index === selectedSuggestionIndex 
                    ? 'bg-white/20 border border-white/30' 
                    : 'hover:bg-white/10 border border-transparent'
                  }
                `}
                role="option"
                aria-selected={index === selectedSuggestionIndex}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3 opacity-60 group-hover:opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-medium">{suggestion}</span>
                </div>
                <svg className="w-4 h-4 opacity-40 group-hover:opacity-60 transform group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Stats */}
      <div className="mt-4 text-center">
        <p className="text-white/60 text-sm">
          <span className="font-semibold text-white/80">75,000+</span> cuvinte româneşti cu definiții AI
        </p>
      </div>
    </div>
  );
}
