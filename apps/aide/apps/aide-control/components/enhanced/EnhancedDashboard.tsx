'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  FolderIcon,
  PlusIcon,
  XMarkIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CommandLineIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { Send, Zap, Globe, Code, Database } from 'lucide-react';

// Phase 3: Enhanced Project-Centric Interface with Chat Integration
interface ProjectTab {
  id: string;
  name: string;
  type: 'project' | 'chat' | 'settings';
  isActive: boolean;
  hasChanges: boolean;
  lastModified: Date;
  metadata: {
    language?: string;
    framework?: string;
    collaborators?: number;
    deploymentStatus?: 'none' | 'pending' | 'deployed' | 'failed';
  };
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  type: 'text' | 'code' | 'file' | 'system';
  metadata?: {
    language?: string;
    filepath?: string;
    action?: string;
  };
}

interface ProjectContext {
  currentProject?: string;
  activeFiles: string[];
  recentCommands: string[];
  collaborators: { id: string; name: string; avatar: string; status: 'online' | 'offline' }[];
  chatHistory: ChatMessage[];
}

export function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [tabs, setTabs] = useState<ProjectTab[]>([
    {
      id: 'welcome',
      name: 'Welcome',
      type: 'project',
      isActive: true,
      hasChanges: false,
      lastModified: new Date(),
      metadata: {},
    }
  ]);

  const [chatInput, setChatInput] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext>({
    activeFiles: [],
    recentCommands: [],
    collaborators: [
      { id: '1', name: 'Alice Chen', avatar: '/avatars/alice.jpg', status: 'online' },
      { id: '2', name: 'Bob Wilson', avatar: '/avatars/bob.jpg', status: 'online' },
      { id: '3', name: 'Carol Davis', avatar: '/avatars/carol.jpg', status: 'offline' },
    ],
    chatHistory: [
      {
        id: '1',
        content: 'Welcome to AIDE! I can help you create, modify, and deploy your projects. What would you like to build today?',
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      }
    ],
  });

  // Create new project tab
  const createNewProject = useCallback(() => {
    const newTab: ProjectTab = {
      id: `project-${Date.now()}`,
      name: `New Project`,
      type: 'project',
      isActive: true,
      hasChanges: false,
      lastModified: new Date(),
      metadata: {
        language: 'TypeScript',
        framework: 'Next.js',
        collaborators: 1,
        deploymentStatus: 'none',
      },
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat(newTab));
    setActiveTab(newTab.id);
  }, []);

  // Close tab
  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const updatedTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTab === tabId && updatedTabs.length > 0) {
        const newActiveTab = updatedTabs[updatedTabs.length - 1];
        newActiveTab.isActive = true;
        setActiveTab(newActiveTab.id);
      }
      return updatedTabs;
    });
  }, [activeTab]);

  // Send chat message
  const sendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: chatInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setProjectContext(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage],
    }));

    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: `I understand you want to "${chatInput}". Let me help you with that. I'll create the necessary files and configurations.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };

      setProjectContext(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, aiResponse],
      }));
    }, 1000);
  }, [chatInput]);

  // Quick actions for project creation
  const quickActions = [
    {
      id: 'nextjs-app',
      title: 'Next.js App',
      description: 'Full-stack React application with TypeScript',
      icon: <Globe className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'api-service',
      title: 'API Service',
      description: 'RESTful API with authentication',
      icon: <Database className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'ai-bot',
      title: 'AI Bot',
      description: 'Intelligent chatbot with NLP',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'mobile-app',
      title: 'Mobile App',
      description: 'Cross-platform mobile application',
      icon: <Code className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BoltIcon className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AIDE</h1>
            </div>

            {/* Project Tabs */}
            <div className="flex items-center space-x-1">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer
                    transition-all duration-200 group
                    ${tab.isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  onClick={() => {
                    setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tab.id })));
                    setActiveTab(tab.id);
                  }}
                >
                  {tab.type === 'project' ? (
                    <FolderIcon className="w-4 h-4" />
                  ) : tab.type === 'chat' ? (
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                  ) : (
                    <Cog6ToothIcon className="w-4 h-4" />
                  )}
                  <span>{tab.name}</span>
                  {tab.hasChanges && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  )}
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={createNewProject}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Collaborators */}
            <div className="flex items-center space-x-2">
              {projectContext.collaborators.slice(0, 3).map((collaborator) => (
                <div key={collaborator.id} className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {collaborator.name[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${collaborator.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                </div>
              ))}
              {projectContext.collaborators.length > 3 && (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-medium">
                  +{projectContext.collaborators.length - 3}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCommandPalette(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <CommandLineIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Project content */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'welcome' ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-8 overflow-auto"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
                      <SparklesIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      Welcome to AIDE
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                      Your AI-powered development environment. Create, collaborate, and deploy projects with ease.
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {quickActions.map((action) => (
                      <motion.div
                        key={action.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createNewProject}
                        className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer group"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                        <div className="p-6">
                          <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-lg mb-4 text-white`}>
                            {action.icon}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {action.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {action.description}
                          </p>
                          <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                            Create Project
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Projects */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Projects
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'E-commerce Platform', language: 'TypeScript', framework: 'Next.js', lastModified: '2 hours ago' },
                        { name: 'Chat API', language: 'Python', framework: 'FastAPI', lastModified: '1 day ago' },
                        { name: 'Mobile App', language: 'JavaScript', framework: 'React Native', lastModified: '3 days ago' },
                      ].map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <FolderIcon className="w-5 h-5 text-indigo-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {project.language} • {project.framework}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">{project.lastModified}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-8 bg-white dark:bg-gray-800"
              >
                <div className="text-center py-20">
                  <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Project Workspace
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your project files and code editor will appear here
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel - AI Chat */}
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
          {/* Chat header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Always ready to help</p>
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {projectContext.chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.sender === 'ai'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask AI to help with your project..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
