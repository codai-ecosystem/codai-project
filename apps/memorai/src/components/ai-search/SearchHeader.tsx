/**
 * SearchHeader Component
 * Optimized following Microsoft React best practices
 */
'use client';

import React, { memo, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
// Standard lucide-react import - optimized by Next.js experimental.optimizePackageImports
import {
  Brain,
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Settings
} from 'lucide-react';

interface SearchHeaderProps {
  sessionId?: string;
  showDetails: boolean;
  onToggleDetails: () => void;
  onClearConversation: () => void;
  onSettingsClick?: () => void;
  messageCount: number;
  className?: string;
}

/**
 * SearchHeader - Memoized header component with controls
 * Implements Microsoft's React performance patterns:
 * - React.memo to prevent unnecessary re-renders
 * - useCallback for event handlers
 * - Proper ARIA labels for accessibility
 */
const SearchHeader = memo(({
  sessionId,
  showDetails,
  onToggleDetails,
  onClearConversation,
  onSettingsClick,
  messageCount,
  className
}: SearchHeaderProps) => {

  // Memoized event handlers following Microsoft best practices
  const handleToggleDetails = useCallback(() => {
    onToggleDetails();
  }, [onToggleDetails]);

  const handleClearConversation = useCallback(() => {
    onClearConversation();
  }, [onClearConversation]);

  const handleSettingsClick = useCallback(() => {
    onSettingsClick?.();
  }, [onSettingsClick]);

  // Keyboard accessibility for buttons
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLButtonElement>,
    action: () => void
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  return (
    <header
      className={`flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm ${className || ''}`}
      role="banner"
      aria-label="AI Memory Search header"
    >
      {/* Title Section */}
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        <h1 className="text-lg font-semibold text-gray-900">
          AI Memory Search
        </h1>
        <Badge variant="secondary" className="text-xs" aria-label="Natural language processing enabled">
          <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
          Natural Language
        </Badge>

        {/* Session Info */}
        {sessionId && (
          <Badge variant="outline" className="text-xs ml-2">
            Session: {sessionId.slice(-8)}
          </Badge>
        )}
      </div>

      {/* Controls Section */}
      <div className="flex items-center gap-2" role="toolbar" aria-label="Search controls">
        {/* Message Counter */}
        {messageCount > 0 && (
          <span className="text-xs text-gray-500 px-2">
            {messageCount} message{messageCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleDetails}
          onKeyDown={(e) => handleKeyDown(e, handleToggleDetails)}
          className="text-xs"
          aria-label={showDetails ? 'Hide processing details' : 'Show processing details'}
          aria-pressed={showDetails}
          title={showDetails ? 'Hide Details' : 'Show Details'}
        >
          {showDetails ? (
            <ChevronUp className="h-4 w-4 mr-1" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" aria-hidden="true" />
          )}
          Details
        </Button>

        {/* Settings Button */}
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettingsClick}
            onKeyDown={(e) => handleKeyDown(e, handleSettingsClick)}
            className="text-xs"
            aria-label="Open search settings"
            title="Settings"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        {/* Clear Conversation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearConversation}
          onKeyDown={(e) => handleKeyDown(e, handleClearConversation)}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label="Clear conversation history"
          title="Clear Conversation"
          disabled={messageCount === 0}
        >
          <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
          Clear
        </Button>
      </div>
    </header>
  );
});

SearchHeader.displayName = 'SearchHeader';

export default SearchHeader;