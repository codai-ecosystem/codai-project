/**
 * ExplorerLayout - Comprehensive Blockchain Explorer Layout
 * Advanced layout with network switching, real-time blockchain data, and DeFi analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Activity,
  Blocks,
  Users,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  Home,
  Send,
  Coins,
  PieChart,
  Network
} from 'lucide-react';
import { explorerService, BlockchainNetwork, NetworkStats } from '../lib/ExplorerService';

interface ExplorerLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  active?: boolean;
  badge?: number | string;
  color?: string;
}

const ExplorerLayout: React.FC<ExplorerLayoutProps> = ({ children }) => {
  // State Management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [networks, setNetworks] = useState<BlockchainNetwork[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<BlockchainNetwork | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Navigation Configuration
  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Overview', icon: Home, path: '/', active: true, color: 'emerald' },
    { id: 'blocks', label: 'Blocks', icon: Blocks, path: '/blocks', color: 'blue' },
    { id: 'transactions', label: 'Transactions', icon: Send, path: '/transactions', color: 'purple' },
    { id: 'addresses', label: 'Addresses', icon: Users, path: '/addresses', color: 'orange' },
    { id: 'tokens', label: 'Tokens', icon: Coins, path: '/tokens', badge: 'ERC20', color: 'green' },
    { id: 'defi', label: 'DeFi', icon: PieChart, path: '/defi', badge: 'TVL $2.1B', color: 'cyan' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', color: 'indigo' }
  ];

  // Initialize Data
  useEffect(() => {
    initializeExplorer();
    setupRealTimeUpdates();
  }, []);

  const initializeExplorer = async () => {
    try {
      const networksData = explorerService.getNetworks();
      const currentNet = explorerService.getCurrentNetwork();
      const stats = await explorerService.getNetworkStats();

      setNetworks(networksData);
      setCurrentNetwork(currentNet);
      setNetworkStats(stats);
    } catch (error) {
      console.error('Failed to initialize explorer:', error);
      setIsOnline(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const stats = await explorerService.getNetworkStats();
        setNetworkStats(stats);
        setLastUpdate(new Date());
        setIsOnline(true);
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
        setIsOnline(false);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  // Theme Configuration
  const themeConfig = {
    light: {
      bg: 'bg-gradient-to-br from-gray-50 to-blue-50',
      card: 'bg-white/90 backdrop-blur-sm border border-gray-200/50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      sidebar: 'bg-white/95 backdrop-blur-md border-r border-gray-200/50'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900',
      card: 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      sidebar: 'bg-gray-900/95 backdrop-blur-md border-r border-gray-700/50'
    }
  };

  const currentTheme = themeConfig[theme];

  return (
    <html lang="en">
      <body>
        <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
          {/* Floating Network Particles */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-blue-400/20 rounded-full"
                animate={{
                  x: [0, Math.random() * 200 - 100],
                  y: [0, Math.random() * 200 - 100],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: Math.random() * 15 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
              />
            ))}
          </div>

          {/* Sidebar */}
          <motion.div
            className={`fixed left-0 top-0 h-full z-30 ${currentTheme.sidebar} shadow-xl`}
            animate={{ width: sidebarCollapsed ? 80 : 300 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-700/50">
              <motion.div
                className="flex items-center space-x-3"
                animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                  <Network className="w-8 h-8 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      BlockExplorer
                    </h1>
                    <p className={`text-sm ${currentTheme.textSecondary}`}>
                      Blockchain Analytics Platform
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    className={`
                      relative flex items-center space-x-3 p-3 rounded-xl cursor-pointer
                      transition-all duration-200 group
                      ${item.active
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                        : 'hover:bg-gray-700/30'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`relative ${item.active ? 'text-blue-400' : currentTheme.textSecondary}`}>
                      <IconComponent className="w-5 h-5" />
                      {item.badge && (
                        <motion.div
                          className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium min-w-[20px] h-5"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {typeof item.badge === 'number' && item.badge > 999 ? '999+' : item.badge}
                        </motion.div>
                      )}
                    </div>

                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1"
                        >
                          <span className={`font-medium ${item.active ? 'text-blue-400' : currentTheme.text}`}>
                            {item.label}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hover Tooltip for Collapsed State */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </nav>

            {/* Network Status */}
            <div className="p-4 border-t border-gray-700/50">
              <motion.div
                className={`${currentTheme.card} p-3 rounded-xl`}
                animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {!sidebarCollapsed && networkStats && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${currentTheme.text}`}>Network Status</span>
                      <div className={`flex items-center space-x-1 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className={currentTheme.textSecondary}>Gas Price</p>
                        <p className={`font-medium ${currentTheme.text}`}>{networkStats.gasPrice.standard} gwei</p>
                      </div>
                      <div>
                        <p className={currentTheme.textSecondary}>Block Time</p>
                        <p className={`font-medium ${currentTheme.text}`}>{currentNetwork?.blockTime}s</p>
                      </div>
                    </div>
                    <div className={`text-xs ${currentTheme.textSecondary}`}>
                      Last update: {lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Collapse Button */}
            <motion.button
              className={`absolute -right-3 top-8 w-6 h-6 ${currentTheme.card} rounded-full flex items-center justify-center shadow-lg`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className={`w-4 h-4 ${currentTheme.text} rotate-90`} />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Main Content */}
          <div
            className="transition-all duration-300"
            style={{ marginLeft: sidebarCollapsed ? 80 : 300 }}
          >
            {/* Top Header */}
            <header className={`${currentTheme.card} shadow-sm border-b border-gray-700/50 px-6 py-4 sticky top-0 z-20`}>
              <div className="flex items-center justify-between">
                {/* Search */}
                <div className="flex-1 max-w-2xl">
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${currentTheme.textSecondary}`} />
                    <input
                      type="text"
                      placeholder="Search addresses, transactions, blocks, or tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 ${currentTheme.card} border border-gray-700/50 rounded-xl focus:border-blue-500/50 focus:outline-none transition-colors ${currentTheme.text} placeholder-gray-400`}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 ml-6">
                  {/* Theme Toggle */}
                  <motion.button
                    className={`p-2 rounded-xl ${currentTheme.card} border border-gray-700/50 hover:border-blue-500/50 transition-colors`}
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {theme === 'light' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </motion.button>

                  {/* Settings */}
                  <motion.button
                    className={`p-2 rounded-xl ${currentTheme.card} border border-gray-700/50 hover:border-blue-500/50 transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
};

export default ExplorerLayout;
