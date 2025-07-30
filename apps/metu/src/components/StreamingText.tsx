import React, { useEffect, useState, useRef } from 'react';
import '../styles/glassmorphism.css';

/**
 * StreamingText - Real-time Text Display with Visual Effects
 * 
 * Features:
 * - Streaming text display with typewriter animation
 * - User speech-to-text visualization
 * - Conversation history with smooth scrolling
 * - Text highlighting synchronized with audio playback
 * - Rich formatting for code, links, and structured data
 */

export interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  isComplete?: boolean;
  type?: 'user' | 'ai' | 'system';
  speed?: number; // Characters per second
  showCursor?: boolean;
  onComplete?: () => void;
  className?: string;
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  isComplete?: boolean;
  interrupted?: boolean;
}

export interface StreamingConversationProps {
  messages: ConversationMessage[];
  currentStreamingText?: string;
  isTyping?: boolean;
  maxHeight?: string;
  showTimestamps?: boolean;
  showStatus?: boolean;
  className?: string;
}

// Individual streaming text component
export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  isStreaming = false,
  isComplete = true,
  type = 'ai',
  speed = 30,
  showCursor = true,
  onComplete,
  className = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  // Handle streaming animation
  useEffect(() => {
    if (!isStreaming || isComplete) {
      setDisplayedText(text);
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = 1000 / speed; // Convert speed to interval

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= text.length) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onComplete?.();
          return text.length;
        }

        setDisplayedText(text.slice(0, nextIndex));
        return nextIndex;
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, isStreaming, isComplete, speed]);

  // Cursor animation class
  const cursorClass = showCursor && isStreaming && !isComplete
    ? "after:content-['|'] after:animate-pulse after:text-current"
    : '';

  // Style based on type with glassmorphism
  const typeStyles = {
    user: 'glass-text glass-blue',
    ai: 'glass-text glass-purple',
    system: 'glass-text glass-subtle text-yellow-300'
  };

  return (
    <span className={`${typeStyles[type]} ${cursorClass} ${className}`}>
      {displayedText}
    </span>
  );
};

// Format text with rich content (links, code, etc.)
const formatTextContent = (text: string): React.ReactNode => {
  // Handle code blocks
  if (text.includes('```')) {
    const parts = text.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        const lines = part.split('\n');
        const language = lines[0] || '';
        const code = lines.slice(1).join('\n');

        return (
          <div key={index} className="my-2 p-3 bg-gray-800 rounded-lg border border-gray-600">
            {language && (
              <div className="text-xs text-gray-400 mb-2 font-mono">
                {language}
              </div>
            )}
            <pre className="text-sm font-mono text-gray-200 whitespace-pre-wrap">
              {code}
            </pre>
          </div>
        );
      }

      // Handle inline code
      return part.split('`').map((codePart, codeIndex) => {
        if (codeIndex % 2 === 1) {
          return (
            <code
              key={`${index}-${codeIndex}`}
              className="px-1 py-0.5 bg-gray-700 text-cyan-300 rounded text-sm font-mono"
            >
              {codePart}
            </code>
          );
        }

        // Handle URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return codePart.split(urlRegex).map((urlPart, urlIndex) => {
          if (urlRegex.test(urlPart)) {
            return (
              <a
                key={`${index}-${codeIndex}-${urlIndex}`}
                href={urlPart}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                {urlPart}
              </a>
            );
          }
          return urlPart;
        });
      });
    });
  }

  // Handle inline code and links for simple text
  return text.split('`').map((part, index) => {
    if (index % 2 === 1) {
      return (
        <code key={index} className="px-1 py-0.5 bg-gray-700 text-cyan-300 rounded text-sm font-mono">
          {part}
        </code>
      );
    }

    // Handle URLs in regular text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return part.split(urlRegex).map((urlPart, urlIndex) => {
      if (urlRegex.test(urlPart)) {
        return (
          <a
            key={`${index}-${urlIndex}`}
            href={urlPart}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            {urlPart}
          </a>
        );
      }
      return urlPart;
    });
  });
};

// Main conversation component with streaming
export const StreamingConversation: React.FC<StreamingConversationProps> = ({
  messages,
  currentStreamingText = '',
  isTyping = false,
  maxHeight = '60vh',
  showTimestamps = true,
  showStatus = true,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingText]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        {messages.length === 0 && !currentStreamingText ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <div className="text-lg mb-2">Ready for conversation</div>
              <div className="text-sm">Your AI assistant is listening...</div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] lg:max-w-[70%] px-4 py-3 rounded-lg glass-fade-in ${message.type === 'user'
                    ? 'glass-blue glass-text'
                    : message.type === 'system'
                      ? 'glass-subtle text-yellow-300'
                      : `glass-purple glass-text ${message.interrupted ? 'opacity-60 border-dashed' : ''
                      }`
                  }`}>

                  {/* Message content */}
                  <div className="text-sm leading-relaxed">
                    {message.isStreaming && !message.isComplete ? (
                      <StreamingText
                        text={message.text}
                        isStreaming={true}
                        isComplete={false}
                        type={message.type}
                        speed={35}
                      />
                    ) : (
                      formatTextContent(message.text)
                    )}
                  </div>

                  {/* Message footer */}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    {showTimestamps && (
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    )}

                    {showStatus && (
                      <div className="flex items-center space-x-2">
                        {message.interrupted && (
                          <span className="text-yellow-400 flex items-center">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                            Interrupted
                          </span>
                        )}
                        {message.isStreaming && !message.isComplete && (
                          <span className="text-blue-400 flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></span>
                            Streaming...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Current streaming text */}
            {currentStreamingText && (
              <div className="flex justify-start">
                <div className="max-w-[80%] lg:max-w-[70%] px-4 py-3 rounded-lg bg-purple-500/10 border border-purple-500/20 border-dashed text-purple-200 backdrop-blur-sm">
                  <div className="text-sm leading-relaxed">
                    <StreamingText
                      text={currentStreamingText}
                      isStreaming={true}
                      isComplete={false}
                      type="ai"
                      speed={40}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
                    AI is responding...
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && !currentStreamingText && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-lg bg-purple-500/10 border border-purple-500/20 border-dashed text-purple-200 backdrop-blur-sm">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => {
              setAutoScroll(true);
              scrollToBottom();
            }}
            className="glass-button glass-blue text-xs"
          >
            ↓ Scroll to bottom
          </button>
        </div>
      )}
    </div>
  );
};

export default StreamingConversation;
