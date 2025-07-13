/**
 * FabricAI Layout - AI Development Platform Layout
 * Modern layout with AI development tools navigation and workspace management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Cpu,
  Workflow,
  Bot,
  Sparkles,
  Layers,
  Terminal,
  FileCode,
  GitBranch,
  Play,
  Settings,
  User,
  Bell,
  Search,
  Menu,
  X,
  Home,
  FolderOpen,
  Zap,
  Database,
  Cloud,
  Shield,
  Palette,
  Layout,
  Box,
  Puzzle,
  Globe,
  Microscope,
  Rocket,
  ArrowUpRight,
  ChevronDown,
  Circle,
  Square,
  Hexagon
} from 'lucide-react';

interface FabricAILayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: string;
  children?: NavigationItem[];
}

interface NetworkStatus {
  connected: boolean;
  latency: number;
  region: string;
  aiModels: number;
}

const FabricAILayout: React.FC<FabricAILayoutProps> = ({ children }) => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    connected: true,
    latency: 45,
    region: 'US-East',
    aiModels: 12
  });
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser] = useState({
    name: 'Alex Chen',
    role: 'AI Developer',
    avatar: '/avatars/alex.jpg',
    plan: 'Pro'
  });

  // Navigation Configuration
  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      href: '/overview'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      href: '/projects',
      badge: '8'
    },
    {
      id: 'code-generation',
      label: 'Code Generation',
      icon: Code,
      href: '/generate',
      children: [
        { id: 'templates', label: 'Templates', icon: FileCode, href: '/templates' },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, href: '/assistant' },
        { id: 'snippets', label: 'Code Snippets', icon: Puzzle, href: '/snippets' }
      ]
    },
    {
      id: 'workflows',
      label: 'AI Workflows',
      icon: Workflow,
      href: '/workflows',
      badge: '4'
    },
    {
      id: 'models',
      label: 'AI Models',
      icon: Cpu,
      href: '/models',
      children: [
        { id: 'available', label: 'Available Models', icon: Database, href: '/models/available' },
        { id: 'custom', label: 'Custom Models', icon: Settings, href: '/models/custom' },
        { id: 'playground', label: 'Playground', icon: Play, href: '/models/playground' }
      ]
    },
    {
      id: 'tools',
      label: 'Dev Tools',
      icon: Terminal,
      href: '/tools',
      children: [
        { id: 'linter', label: 'AI Linter', icon: Shield, href: '/tools/linter' },
        { id: 'bundler', label: 'Smart Bundler', icon: Box, href: '/tools/bundler' },
        { id: 'tester', label: 'Auto Tester', icon: Microscope, href: '/tools/tester' }
      ]
    },
    {
      id: 'deployment',
      label: 'Deployment',
      icon: Cloud,
      href: '/deployment',
      children: [
        { id: 'platforms', label: 'Platforms', icon: Globe, href: '/deployment/platforms' },
        { id: 'pipelines', label: 'CI/CD', icon: GitBranch, href: '/deployment/pipelines' },
        { id: 'monitoring', label: 'Monitoring', icon: Zap, href: '/deployment/monitoring' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Sparkles,
      href: '/analytics'
    }
  ];

  // Effects
  useEffect(() => {
    // Simulate network status updates
    const interval = setInterval(() => {
      setNetworkStatus(prev => ({
        ...prev,
        latency: Math.floor(Math.random() * 100) + 20,
        connected: Math.random() > 0.05 // 95% uptime
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Event Handlers
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (itemId: string) => {
    setActiveSection(itemId);
    setIsMobileMenuOpen(false);
  };

  // Render Navigation Item
  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <motion.button
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          onClick={() => handleNavigation(item.id)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'}`} />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`} />
          )}
        </motion.button>

        {hasChildren && (
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1"
              >
                {item.children!.map(child => renderNavigationItem(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Top Navigation Bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  FabricAI
                </h1>
                <p className="text-xs text-gray-400">AI Development Platform</p>
              </div>
            </div>

            {/* Desktop Sidebar Toggle */}
            <button
              className="hidden md:block p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              onClick={toggleSidebar}
            >
              <Layout className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, templates, workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${networkStatus.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-gray-300">{networkStatus.latency}ms</span>
              <span className="text-xs text-gray-400">{networkStatus.region}</span>
            </div>

            {/* AI Models Status */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">{networkStatus.aiModels} models</span>
            </div>

            {/* Notifications */}
            <motion.button
              className="relative p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </motion.button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 px-3 py-1.5 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{currentUser.role}</p>
              </div>
              <div className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                {currentUser.plan}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="pt-20 flex">
        {/* Desktop Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              className="hidden md:block fixed left-0 top-20 bottom-0 w-64 bg-gray-800/50 backdrop-blur-md border-r border-gray-700/50 overflow-y-auto"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Code className="w-5 h-5 text-purple-400 mb-1" />
                      <span className="text-xs text-white">Generate</span>
                    </motion.button>
                    <motion.button
                      className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-200 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Rocket className="w-5 h-5 text-blue-400 mb-1" />
                      <span className="text-xs text-white">Deploy</span>
                    </motion.button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Navigation</h3>
                  <div className="space-y-1">
                    {navigationItems.map(item => renderNavigationItem(item))}
                  </div>
                </div>

                {/* AI Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">AI Status</h3>
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-300">AI Models Online</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>GPT-4 Code</span>
                        <span className="text-green-400">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Claude 3 Dev</span>
                        <span className="text-green-400">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gemini Pro</span>
                        <span className="text-yellow-400">Limited</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleMobileMenu}
              />
              <motion.aside
                className="md:hidden fixed left-0 top-20 bottom-0 w-72 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/50 overflow-y-auto z-50"
                initial={{ x: -288 }}
                animate={{ x: 0 }}
                exit={{ x: -288 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="p-6 space-y-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-1">
                    {navigationItems.map(item => renderNavigationItem(item))}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
          <div className="min-h-screen p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.5, type: 'spring' }}
      >
        <motion.button
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bot className="w-6 h-6 text-white group-hover:animate-bounce" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default FabricAILayout;
