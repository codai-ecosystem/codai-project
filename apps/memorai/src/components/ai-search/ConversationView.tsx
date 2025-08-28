/**
 * ConversationView Component
 * Optimized following Microsoft React best practices
 */
'use client';

import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
// Standard lucide-react import - optimized by Next.js experimental.optimizePackageImports
import {
  Brain,
  User,
  Bot,
  Clock,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Type for scroll behavior  
type ScrollBehavior = 'auto' | 'smooth';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  query?: string;
  results?: QueryResult[];
  metadata?: {
    processingTime: number;
    confidence: number;
    resultCount: number;
  };
}

export interface QueryResult {
  id: string;
  title: string;
  content: string;
  type: string;
  relevance: number;
  importance?: number;
  tags: string[];
  createdAt: string;
  url?: string;
  metadata?: {
    source?: string;
    category?: string;
    lastAccessed?: string;
  };
}

interface ConversationViewProps {
  messages: ConversationMessage[];
  onResultSelect?: (result: QueryResult) => void;
  onCopy?: (text: string) => void;
  className?: string;
  showTimestamps?: boolean;
  showMetadata?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Message component - Memoized with comprehensive accessibility
 * Enhanced with WCAG 2.1 AA compliance and Microsoft accessibility best practices
 */
const MessageItem = memo(({
  message,
  onResultSelect,
  onCopy,
  showTimestamps = true,
  showMetadata = false,
  messageIndex = 0,
  totalMessages = 1
}: {
  message: ConversationMessage;
  onResultSelect?: (result: QueryResult) => void;
  onCopy?: (text: string) => void;
  showTimestamps?: boolean;
  showMetadata?: boolean;
  messageIndex?: number;
  totalMessages?: number;
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const messageId = useRef(`message-${message.id}`);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  // Memoized event handlers with accessibility announcements and SSR safety
  const handleCopy = useCallback(async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setCopyFeedback('Copy not available');
      setTimeout(() => setCopyFeedback(''), 2000);
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message.content);
        setCopyFeedback('Message copied to clipboard');
        onCopy?.(message.content);
      } else {
        setCopyFeedback('Copy not supported in this browser');
      }

      // Clear feedback after announcement
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (error) {
      setCopyFeedback('Failed to copy message');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  }, [message.content, onCopy]);

  const handleResultClick = useCallback((result: QueryResult, index: number) => {
    onResultSelect?.(result);
    // Announce to screen readers
    const announcement = `Opening result ${index + 1}: ${result.title}`;
    // This would be announced through a live region in the parent component
  }, [onResultSelect]);

  // Enhanced keyboard navigation for results
  const handleResultKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLDivElement>,
    result: QueryResult,
    index: number
  ) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleResultClick(result, index);
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Focus next result or first if at end
        const nextResult = e.currentTarget.nextElementSibling as HTMLElement;
        if (nextResult) {
          nextResult.focus();
        } else {
          // Focus first result
          const firstResult = e.currentTarget.parentElement?.firstElementChild as HTMLElement;
          firstResult?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Focus previous result or last if at beginning
        const prevResult = e.currentTarget.previousElementSibling as HTMLElement;
        if (prevResult) {
          prevResult.focus();
        } else {
          // Focus last result
          const lastResult = e.currentTarget.parentElement?.lastElementChild as HTMLElement;
          lastResult?.focus();
        }
        break;
    }
  }, [handleResultClick]);

  // Memoized importance color calculation with high contrast
  const getImportanceColor = useCallback((importance?: number): string => {
    if (!importance) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (importance >= 8) return 'bg-red-100 text-red-900 border-red-300';
    if (importance >= 6) return 'bg-orange-100 text-orange-900 border-orange-300';
    if (importance >= 4) return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    return 'bg-green-100 text-green-900 border-green-300';
  }, []);

  // Handle both string and Date timestamp types
  const timestamp = useMemo(() => {
    return typeof message.timestamp === 'string' 
      ? new Date(message.timestamp) 
      : message.timestamp;
  }, [message.timestamp]);

  // Memoized timestamp formatting with full date for screen readers
  const timestampInfo = useMemo(() => {
    const displayTime = timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const fullDateTime = timestamp.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return { displayTime, fullDateTime };
  }, [timestamp]);

  // Message icon based on type with proper ARIA
  const MessageIcon = useMemo(() => {
    switch (message.type) {
      case 'user': return User;
      case 'assistant': return Bot;
      case 'system': return AlertCircle;
      default: return Brain;
    }
  }, [message.type]);

  const messageTypeLabel = useMemo(() => {
    switch (message.type) {
      case 'user': return 'User question';
      case 'assistant': return 'AI Assistant response';
      case 'system': return 'System message';
      default: return 'Message';
    }
  }, [message.type]);

  return (
    <article
      id={messageId.current}
      className={cn(
        'flex gap-3 p-4 rounded-lg transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        {
          'bg-blue-50/50': message.type === 'user',
          'bg-green-50/50': message.type === 'assistant',
          'bg-gray-50/50': message.type === 'system'
        }
      )}
      role="article"
      aria-labelledby={`${messageId.current}-header`}
      aria-describedby={`${messageId.current}-content`}
      tabIndex={0}
    >
      {/* Message Icon */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        {
          'bg-blue-600 text-white': message.type === 'user',
          'bg-green-600 text-white': message.type === 'assistant',
          'bg-gray-600 text-white': message.type === 'system'
        }
      )}
        aria-hidden="true"
      >
        <MessageIcon className="h-4 w-4" />
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        {/* Message Header */}
        <header
          id={`${messageId.current}-header`}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm capitalize">
              {message.type === 'assistant' ? 'AI Assistant' : messageTypeLabel}
              <span className="sr-only">
                {` - Message ${messageIndex + 1} of ${totalMessages}`}
              </span>
            </h3>
            {showTimestamps && (
              <time
                dateTime={timestamp.toISOString()}
                className="text-xs text-gray-500 flex items-center gap-1"
                title={timestampInfo.fullDateTime}
              >
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span aria-label={`Sent at ${timestampInfo.fullDateTime}`}>
                  {timestampInfo.displayTime}
                </span>
              </time>
            )}
          </div>

          {/* Copy button with enhanced accessibility */}
          <Button
            ref={copyButtonRef}
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full"
            aria-label={`Copy ${messageTypeLabel.toLowerCase()} to clipboard`}
            title="Copy message content (Ctrl+C when focused)"
          >
            <Copy className="h-3 w-3" aria-hidden="true" />
            {copyFeedback && (
              <span className="sr-only" role="status" aria-live="polite">
                {copyFeedback}
              </span>
            )}
          </Button>
        </header>

        {/* Message Text */}
        <div
          id={`${messageId.current}-content`}
          className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
          role="region"
          aria-label="Message content"
        >
          {message.content}
        </div>

        {/* Metadata with enhanced accessibility */}
        {showMetadata && message.metadata && (
          <aside className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="sr-only">Processing details:</div>
            <span className="flex items-center gap-1" title="Processing time">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`Processed in ${message.metadata.processingTime} milliseconds`}>
                {message.metadata.processingTime}ms
              </span>
            </span>
            <span className="flex items-center gap-1" title="Confidence score">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              <span aria-label={`${(message.metadata.confidence * 100).toFixed(0)} percent confidence`}>
                {(message.metadata.confidence * 100).toFixed(0)}% confidence
              </span>
            </span>
            <span aria-label={`Found ${message.metadata.resultCount} matching results`}>
              {message.metadata.resultCount} results
            </span>
          </aside>
        )}

        {/* Results with comprehensive accessibility */}
        {message.results && message.results.length > 0 && (
          <section
            className="space-y-2 pt-2"
            role="region"
            aria-labelledby={`${messageId.current}-results-heading`}
          >
            <h4
              id={`${messageId.current}-results-heading`}
              className="text-xs font-medium text-gray-600 uppercase tracking-wide"
            >
              Search Results ({message.results.length})
              <span className="sr-only">
                - Use arrow keys to navigate between results, Enter or Space to open
              </span>
            </h4>
            <div
              className="space-y-2"
              role="group"
              aria-label={`${message.results.length} search results`}
            >
              {message.results.map((result, index) => (
                <Card
                  key={result.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-indigo-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  onClick={() => handleResultClick(result, index)}
                  onKeyDown={(e) => handleResultKeyDown(e, result, index)}
                  role="button"
                  tabIndex={0}
                  aria-labelledby={`result-${result.id}-title`}
                  aria-describedby={`result-${result.id}-content`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5
                            id={`result-${result.id}-title`}
                            className="font-medium text-sm truncate"
                          >
                            {result.title}
                          </h5>
                          {result.importance && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs px-1.5 py-0.5 border',
                                getImportanceColor(result.importance)
                              )}
                              aria-label={`Importance score: ${result.importance} out of 10`}
                            >
                              {result.importance}/10
                            </Badge>
                          )}
                        </div>
                        <p
                          id={`result-${result.id}-content`}
                          className="text-xs text-gray-600 line-clamp-2 mb-2"
                        >
                          {result.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            aria-label={`Content type: ${result.type}`}
                          >
                            {result.type}
                          </Badge>
                          <span
                            className="text-xs text-gray-500"
                            aria-label={`Relevance match: ${(result.relevance * 100).toFixed(0)} percent`}
                          >
                            {(result.relevance * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </div>
                      <ExternalLink
                        className="h-4 w-4 text-gray-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Keyboard navigation instructions */}
            <div className="text-xs text-gray-500 italic mt-2 sr-only">
              Navigate results with Tab or arrow keys. Press Enter or Space to open a result.
            </div>
          </section>
        )}
      </div>
    </article>
  );
});

MessageItem.displayName = 'MessageItem';

/**
 * ConversationView - Enhanced conversation display with comprehensive accessibility
 * Follows Microsoft's React accessibility best practices and WCAG 2.1 AA compliance
 */
const ConversationView = memo(({
  messages,
  onResultSelect,
  onCopy,
  className,
  showTimestamps = true,
  showMetadata = false,
  isLoading = false,
  error = null
}: ConversationViewProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [userSentMessage, setUserSentMessage] = useState(false);
  const conversationId = useRef(`conversation-${Date.now()}`);

  // Enhanced auto-scroll with accessibility considerations
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const isNearBottom = scrollArea.scrollTop + scrollArea.clientHeight >=
        scrollArea.scrollHeight - 100;

      // Only auto-scroll if user is near bottom or sent a new message
      if (isNearBottom || userSentMessage) {
        // Check if scrollTo method exists (not available in test environment)
        if (typeof scrollArea.scrollTo === 'function') {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior
          });
        } else {
          // Fallback for test environment
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
        setUserSentMessage(false);
      }
    }
  }, [userSentMessage]);

  // Detect new messages and trigger scroll
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'user') {
      setUserSentMessage(true);
    }
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Enhanced copy handler with accessibility feedback and SSR safety
  const handleCopy = useCallback(async (text: string) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setCopyFeedback('Copy not available in server environment');
      setTimeout(() => setCopyFeedback(''), 3000);
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyFeedback('Message copied to clipboard successfully');
        onCopy?.(text);
      } else {
        setCopyFeedback('Copy not supported in this browser');
      }

      // Clear feedback after screen reader announcement
      setTimeout(() => setCopyFeedback(''), 3000);
    } catch (error) {
      setCopyFeedback('Failed to copy message to clipboard');
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  }, [onCopy]);

  // Enhanced keyboard navigation for conversation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Home':
        e.preventDefault();
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      case 'End':
        e.preventDefault();
        scrollToBottom('smooth');
        break;
      case 'PageUp':
        e.preventDefault();
        if (scrollAreaRef.current) {
          const scrollArea = scrollAreaRef.current;
          scrollArea.scrollBy({ top: -scrollArea.clientHeight * 0.8, behavior: 'smooth' });
        }
        break;
      case 'PageDown':
        e.preventDefault();
        if (scrollAreaRef.current) {
          const scrollArea = scrollAreaRef.current;
          scrollArea.scrollBy({ top: scrollArea.clientHeight * 0.8, behavior: 'smooth' });
        }
        break;
    }
  }, [scrollToBottom]);

  // Message statistics for screen readers
  const messageStats = useMemo(() => {
    const userMessages = messages.filter(m => m.type === 'user').length;
    const assistantMessages = messages.filter(m => m.type === 'assistant').length;
    const totalResults = messages.reduce((acc, m) => acc + (m.results?.length || 0), 0);

    return {
      userMessages,
      assistantMessages,
      totalMessages: messages.length,
      totalResults
    };
  }, [messages]);

  // Memoized empty state with accessibility
  const EmptyState = useMemo(() => (
    <div
      className="flex flex-col items-center justify-center h-full py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <MessageSquare className="h-16 w-16 text-gray-300 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        Start a Conversation
      </h3>
      <p className="text-sm text-gray-500 max-w-md">
        Ask questions about your memories, search for specific information,
        or explore insights from your knowledge base.
      </p>
      <div className="text-xs text-gray-400 mt-4">
        <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs mr-2">Enter</kbd>
        to send messages
      </div>
    </div>
  ), []);

  return (
    <div
      className={cn('flex flex-col h-full bg-white border rounded-lg shadow-sm', className)}
      role="complementary"
      aria-labelledby={`${conversationId.current}-title`}
    >
      {/* Conversation Header with accessibility */}
      <header className="flex items-center justify-between p-4 border-b bg-gray-50/50">
        <div>
          <h2
            id={`${conversationId.current}-title`}
            className="text-lg font-semibold text-gray-900"
          >
            Conversation
            <span className="sr-only">
              {` - ${messageStats.totalMessages} messages total: ${messageStats.userMessages} questions, ${messageStats.assistantMessages} responses`}
              {messageStats.totalResults > 0 && `, ${messageStats.totalResults} search results`}
            </span>
          </h2>
          <p className="text-sm text-gray-500">
            AI-powered memory search and insights
          </p>
        </div>

        {/* Conversation controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToBottom('smooth')}
            className="text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="Scroll to bottom of conversation"
            title="Jump to latest message"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Badge
            variant="outline"
            className="text-xs"
            aria-label={`${messageStats.totalMessages} total messages in conversation`}
          >
            {messageStats.totalMessages} messages
          </Badge>
        </div>
      </header>

      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {copyFeedback && <div role="status">{copyFeedback}</div>}
      </div>

      {/* Conversation Content */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? EmptyState : (
          <div
            ref={scrollAreaRef}
            className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="log"
            aria-label="Conversation messages - use Page Up/Down to scroll, Home/End to jump to start/end"
            aria-describedby={`${conversationId.current}-instructions`}
          >
            {messages.map((message, index) => (
              <MessageItem
                key={`${message.id}-${index}`}
                message={message}
                messageIndex={index}
                totalMessages={messages.length}
                onResultSelect={onResultSelect}
                onCopy={handleCopy}
                showTimestamps={showTimestamps}
                showMetadata={showMetadata}
              />
            ))}

            {/* Scroll anchor for screen readers */}
            <div
              id="conversation-end"
              aria-label="End of conversation"
              className="sr-only"
            />
          </div>
        )}
      </div>

      {/* Keyboard instructions for screen readers */}
      <div
        id={`${conversationId.current}-instructions`}
        className="sr-only"
        aria-label="Keyboard navigation instructions"
      >
        Use Page Up and Page Down to scroll through messages.
        Press Home to go to the start of the conversation or End to go to the latest message.
        Use Tab to navigate between message actions and search results.
        Press Enter or Space on search results to view details.
      </div>

      {/* Status bar with message count and accessibility info */}
      <footer
        className="px-4 py-2 bg-gray-50/50 border-t text-xs text-gray-500 flex items-center justify-between"
        role="status"
        aria-label="Conversation status"
      >
        <span>
          {messageStats.userMessages} questions • {messageStats.assistantMessages} responses
          {messageStats.totalResults > 0 && ` • ${messageStats.totalResults} results`}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span aria-label="Last updated timestamp">
            {messages.length > 0 && (() => {
              const lastMessage = messages[messages.length - 1];
              if (lastMessage?.timestamp) {
                const timestamp = typeof lastMessage.timestamp === 'string' 
                  ? new Date(lastMessage.timestamp) 
                  : lastMessage.timestamp;
                return timestamp.toLocaleTimeString();
              }
              return '';
            })()}
          </span>
        </span>
      </footer>
    </div>
  );
});

ConversationView.displayName = 'ConversationView';

export default ConversationView;