import React, { useState, useEffect } from 'react';
import { Send, Paperclip, Smile, Plus, X, Check, Copy, Code, FileText, MessageCircle, Bot, User, Zap } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { ChatMessage, AIAgent } from '@/types/ai';

interface ChatTab {
  id: string;
  title: string;
  active: boolean;
  messages: ChatMessage[];
  activeAgent?: string;
}

const mockTabs: ChatTab[] = [
  {
    id: '1',
    title: 'Build React Components',
    active: true,
    messages: [
      {
        id: '1',
        content: 'Create a user authentication component with login and signup forms',
        sender: 'user',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        content: "I'll create a comprehensive authentication component for you. This will include login and signup forms with proper validation, state management, and styling.",
        sender: 'ai',
        timestamp: new Date(Date.now() - 180000),
        status: 'executing',
        progress: 75,
        files: [
          'src/components/Auth/LoginForm.tsx',
          'src/components/Auth/SignupForm.tsx',
          'src/hooks/useAuth.ts'
        ],
        agentId: 'code-assistant'
      },
      {
        id: '3',
        content: 'Authentication components created successfully. Tests added and passing.',
        sender: 'ai',
        timestamp: new Date(Date.now() - 60000),
        status: 'completed',
        files: [
          'src/components/Auth/LoginForm.tsx',
          'src/components/Auth/SignupForm.tsx',
          'src/hooks/useAuth.ts',
          'src/__tests__/Auth.test.tsx'
        ],
        agentId: 'code-assistant'
      }
    ]
  }
];

const MessageProgress: React.FC<{ progress: number; files: string[]; agentId?: string }> = ({ progress, files, agentId }) => {
  const agent = agentId ? aiService.getAgent(agentId) : null;

  return (
    <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs text-gray-400">Status:</span>
        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">executing</span>
        {agent && (
          <div className="flex items-center space-x-1">
            <Bot className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">{agent.name}</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-blue-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-gray-400">Files:</span>
        {files.map((file, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <FileText className="w-3 h-3 text-blue-400" />
            <span className="text-white">{file}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MessageFiles: React.FC<{ files: string[]; agentId?: string }> = ({ files, agentId }) => {
  const agent = agentId ? aiService.getAgent(agentId) : null;

  return (
    <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
      <div className="flex items-center space-x-2 mb-2">
        {agent && (
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-400" />
            <Bot className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">{agent.name}</span>
            <span className="text-xs text-gray-400">completed</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-xs text-gray-400">Files created:</span>
        {files.map((file, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <Check className="w-3 h-3 text-green-400" />
            <span className="text-white">{file}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AgentSelector: React.FC<{
  selectedAgent?: string;
  onAgentSelect: (agentId: string) => void;
}> = ({ selectedAgent, onAgentSelect }) => {
  const agents = aiService.getAllAgents();

  return (
    <div className="flex items-center space-x-2 px-3 py-2 border-b border-white/10 bg-black/20">
      <span className="text-xs text-gray-400">AI Agent:</span>
      <div className="flex space-x-1">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onAgentSelect(agent.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${selectedAgent === agent.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
          >
            <Bot className="w-3 h-3" />
            <span>{agent.name}</span>
            {agent.status !== 'idle' && (
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const EnhancedChatInterface: React.FC = () => {
  const [tabs] = useState<ChatTab[]>(mockTabs);
  const [activeTab] = useState('1');
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('code-assistant');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const handleSend = async () => {
    if (message.trim() && !isProcessing) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: message,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessage('');
      setIsProcessing(true);

      try {
        // Simulate AI processing
        const response = await aiService.processMessage(activeTab, userMessage);

        // Simulate progressive task execution for visual feedback
        if (selectedAgent) {
          await aiService.simulateTask(selectedAgent, message, (progress) => {
            console.log(`Task progress: ${progress}%`);
          });
        }

        console.log('AI Response:', response);
      } catch (error) {
        console.error('Error processing message:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Real-time agent status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // This would normally come from a WebSocket or polling
      // For now, we'll just force a re-render to show agent status changes
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-black/10 backdrop-blur-md">
      {/* Agent Selector */}
      <AgentSelector
        selectedAgent={selectedAgent}
        onAgentSelect={setSelectedAgent}
      />

      {/* Chat Tabs */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${tab.active
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-transparent hover:bg-white/5'
                }`}
            >
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium whitespace-nowrap">{tab.title}</span>
              <button className="p-1 rounded hover:bg-white/10 transition-colors">
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}

          <button className="flex items-center space-x-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4 max-w-4xl mx-auto">
          {activeTabData?.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${msg.sender === 'user'
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : msg.status === 'completed'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-white/5 border border-white/10'
                }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center ${msg.sender === 'user'
                      ? 'bg-blue-500'
                      : msg.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-gradient-to-br from-purple-400 to-blue-400'
                    }`}>
                    {msg.sender === 'user' ? (
                      <User className="w-3 h-3 text-white" />
                    ) : msg.status === 'completed' ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Bot className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white leading-relaxed">{msg.content}</p>

                    {msg.status === 'executing' && msg.progress && msg.files && (
                      <MessageProgress progress={msg.progress} files={msg.files} agentId={msg.agentId} />
                    )}

                    {msg.status === 'completed' && msg.files && (
                      <MessageFiles files={msg.files} agentId={msg.agentId} />
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 rounded hover:bg-white/10 transition-colors">
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-white/5 border border-white/10">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full mt-0.5 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center animate-pulse">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white">AI is thinking</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-white/10 p-4 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to help with coding, debugging, testing, or deployment..."
                disabled={isProcessing}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />

              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 rounded hover:bg-white/10 transition-colors">
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={isProcessing || !message.trim()}
              className="p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
