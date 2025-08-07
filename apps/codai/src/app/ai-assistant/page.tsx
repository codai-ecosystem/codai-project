'use client';

import React, { useState } from 'react';
import {
  Brain,
  Send,
  Copy,
  Download,
  Lightbulb,
  Code2,
  FileText,
  Bug,
  Zap,
  Sparkles,
  MessageSquare,
  History,
  Settings,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Save
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    language?: string;
    codeType?: string;
    confidence?: number;
  };
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'code' | 'debug' | 'optimize' | 'explain';
  icon: React.ElementType;
}

const suggestions: Suggestion[] = [
  {
    id: '1',
    title: 'Generate React Component',
    description: 'Create a new React component with TypeScript',
    category: 'code',
    icon: Code2
  },
  {
    id: '2',
    title: 'Debug API Issue',
    description: 'Help me fix API connection problems',
    category: 'debug',
    icon: Bug
  },
  {
    id: '3',
    title: 'Optimize Database Query',
    description: 'Improve SQL query performance',
    category: 'optimize',
    icon: Zap
  },
  {
    id: '4',
    title: 'Explain Complex Code',
    description: 'Break down complicated algorithms',
    category: 'explain',
    icon: Lightbulb
  }
];

const quickPrompts = [
  'Write a function to validate email addresses',
  'Create a REST API endpoint for user authentication',
  'Implement error handling for async operations',
  'Generate unit tests for this component',
  'Optimize this React component for performance',
  'Explain the difference between useState and useRef'
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you write code, debug issues, explain concepts, and optimize your development workflow. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [showHistory, setShowHistory] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'll help you with that! Here's a comprehensive solution:\n\n\`\`\`typescript\n// Example response based on your query\nconst handleUserRequest = async (query: string) => {\n  try {\n    // Process the query\n    const result = await processQuery(query);\n    return {\n      success: true,\n      data: result,\n      message: 'Query processed successfully'\n    };\n  } catch (error) {\n    console.error('Error processing query:', error);\n    return {\n      success: false,\n      error: error.message\n    };\n  }\n};\n\`\`\`\n\nThis solution includes proper error handling and TypeScript types. Would you like me to explain any part of this code or help you implement additional features?`,
        timestamp: new Date(),
        metadata: {
          language: 'typescript',
          codeType: 'function',
          confidence: 0.95
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.description);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-80">
      <div className="flex h-screen">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI Coding Assistant</h1>
                  <p className="text-sm text-gray-600">Powered by {selectedModel.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="codex">GitHub Codex</option>
                </select>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <History className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                    {message.type === 'user' ?
                      <User className="w-4 h-4 text-white" /> :
                      <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                    <div className="whitespace-pre-wrap">
                      {message.content.includes('```') ? (
                        <div>
                          {message.content.split('```').map((part, index) => {
                            if (index % 2 === 1) {
                              const lines = part.split('\n');
                              const language = lines[0];
                              const code = lines.slice(1).join('\n');
                              return (
                                <div key={index} className="my-3">
                                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                                      <span className="text-sm text-gray-300">{language}</span>
                                      <button
                                        onClick={() => copyToClipboard(code)}
                                        className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm"
                                      >
                                        <Copy className="w-4 h-4" />
                                        <span>Copy</span>
                                      </button>
                                    </div>
                                    <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                                      <code>{code}</code>
                                    </pre>
                                  </div>
                                </div>
                              );
                            }
                            return <span key={index}>{part}</span>;
                          })}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.type === 'assistant' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <ThumbsUp className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <ThumbsDown className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Save className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        {message.metadata?.confidence && (
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(message.metadata.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-4xl">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-6">
            {/* Quick Suggestions */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Suggestions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Prompts</h3>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about coding, debugging, or development..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Powered by CODAI AI</span>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 bg-white border-l border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Conversation History</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <h4 className="font-medium text-sm text-gray-900">React Component Debug</h4>
                <p className="text-xs text-gray-600 mt-1">Fixed useState hook issue...</p>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <h4 className="font-medium text-sm text-gray-900">API Optimization</h4>
                <p className="text-xs text-gray-600 mt-1">Improved database query performance...</p>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <h4 className="font-medium text-sm text-gray-900">TypeScript Types</h4>
                <p className="text-xs text-gray-600 mt-1">Created complex interface definitions...</p>
                <span className="text-xs text-gray-500">2 days ago</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
