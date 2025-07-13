/**
 * DashLayout - Comprehensive Dashboard Platform Layout
 * Advanced layout with dashboard grid, real-time metrics, and analytics navigation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Bell,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Grid,
  Layout,
  PieChart,
  Activity,
  Target,
  Zap,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Plus,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { dashService, DashboardLayout as DashboardLayoutType, Alert, RealTimeMetrics } from '../lib/DashService';

import { useLogAI, setupGlobalErrorHandling, logPerformanceMetrics } from '@codai/logai-integration'

interface DashLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  active?: boolean;
  badge?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  color: string;
}

const DashLayout: React.FC<DashLayoutProps> = ({ children }) => {
  // State Management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<DashboardLayoutType | null>(null);
  const [dashboards, setDashboards] = useState<DashboardLayoutType[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDashboardSelector, setShowDashboardSelector] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Navigation Configuration
  const navigationItems: NavigationItem[] = [
    { id: 'overview', label: 'Overview', icon: Grid, path: '/dashboard', active: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'performance', label: 'Performance', icon: Activity, path: '/performance' },
    { id: 'users', label: 'Users', icon: Users, path: '/users', badge: 42 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, path: '/revenue' },
    { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
    { id: 'reports', label: 'Reports', icon: PieChart, path: '/reports' },
    { id: 'real-time', label: 'Real-time', icon: Zap, path: '/real-time', badge: realTimeMetrics?.metrics.activeUsers }
  ];

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      action: handleExport,
      color: 'blue'
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      action: handleShare,
      color: 'emerald'
    },
    {
      id: 'filter',
      label: 'Filters',
      icon: Filter,
      action: handleFilter,
      color: 'purple'
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      action: handleRefresh,
      color: 'orange'
    }
  ];

  // Initialize Dashboard Data
  useEffect(() => {
    initializeDashboard();
    setupRealTimeUpdates();

    return () => {
      cleanup();
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      const [dashboardsData, metricsData] = await Promise.all([
        dashService.getDashboards(),
        dashService.getRealTimeMetrics()
      ]);

      setDashboards(dashboardsData);
      setCurrentDashboard(dashboardsData.find(d => d.isDefault) || dashboardsData[0]);
      setRealTimeMetrics(metricsData);
      setAlerts(metricsData.alerts);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    // Subscribe to real-time metrics
    const interval = setInterval(async () => {
      try {
        const metrics = await dashService.getRealTimeMetrics();
        setRealTimeMetrics(metrics);
        setAlerts(metrics.alerts);
      } catch (error) {
        console.error('Failed to fetch real-time metrics:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  };

  const cleanup = () => {
    // Clean up subscriptions and intervals
  };

  // Event Handlers
  async function handleExport() {
    if (!currentDashboard) return;

    setIsRefreshing(true);
    try {
      const exportData = await dashService.exportDashboard(currentDashboard.id, {
        includeCharts: true,
        includeData: true,
        includeFilters: true,
        timeframe: '24h'
      });

      // Trigger download
      const blob = new Blob([JSON.stringify(exportData.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${currentDashboard.name}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleShare() {
    if (!currentDashboard) return;

    try {
      const shareUrl = await dashService.shareDashboard(currentDashboard.id, ['read']);
      await navigator.clipboard.writeText(shareUrl);
      // Show toast notification
    } catch (error) {
      console.error('Share failed:', error);
    }
  }

  function handleFilter() {
    // Open filter panel
    setShowNotifications(false);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await initializeDashboard();
    } finally {
      setIsRefreshing(false);
    }
  }

  const handleDashboardChange = async (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      setCurrentDashboard(dashboard);
      setShowDashboardSelector(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Theme Configuration
  const themeConfig = {
    light: {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      card: 'bg-white/80 backdrop-blur-sm border border-gray-200/50',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      sidebar: 'bg-white/90 backdrop-blur-md border-r border-gray-200/50',
      accent: 'text-emerald-600'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      card: 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      sidebar: 'bg-gray-900/90 backdrop-blur-md border-r border-gray-700/50',
      accent: 'text-emerald-400'
    }
  };

  const currentTheme = themeConfig[theme];

  return (
    <div className={`min-h-screen ${currentTheme.bg} transition-all duration-300`}>
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
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
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700/50">
          <motion.div
            className="flex items-center space-x-3"
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Dash Analytics
                </h1>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  Visual Dashboard Platform
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                className={`
                  relative flex items-center space-x-3 p-3 rounded-xl cursor-pointer
                  transition-all duration-200 group
                  ${item.active
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30'
                    : 'hover:bg-gray-700/30'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`relative ${item.active ? currentTheme.accent : currentTheme.textSecondary}`}>
                  <IconComponent className="w-5 h-5" />
                  {item.badge && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
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
                      <span className={`font-medium ${item.active ? currentTheme.accent : currentTheme.text}`}>
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

        {/* Real-time Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <motion.div
            className={`${currentTheme.card} p-3 rounded-xl`}
            animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {!sidebarCollapsed && realTimeMetrics && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${currentTheme.text}`}>System Status</span>
                  <div className={`w-2 h-2 rounded-full ${realTimeMetrics.status === 'healthy' ? 'bg-green-400' :
                      realTimeMetrics.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                </div>
                <div className={`text-xs ${currentTheme.textSecondary}`}>
                  {realTimeMetrics.metrics.activeUsers.toLocaleString()} active users
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
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Top Header */}
        <header className={`${currentTheme.card} shadow-sm border-b border-gray-700/50 px-6 py-4`}>
          <div className="flex items-center justify-between">
            {/* Dashboard Selector */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <motion.button
                  className={`flex items-center space-x-2 px-4 py-2 ${currentTheme.card} rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-colors`}
                  onClick={() => setShowDashboardSelector(!showDashboardSelector)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Layout className="w-4 h-4" />
                  <span className={`font-medium ${currentTheme.text}`}>
                    {currentDashboard?.name || 'Select Dashboard'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                  {showDashboardSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-full mt-2 w-64 ${currentTheme.card} rounded-xl shadow-xl border border-gray-700/50 py-2 z-50`}
                    >
                      {dashboards.map((dashboard) => (
                        <motion.button
                          key={dashboard.id}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-700/30 transition-colors ${currentTheme.text}`}
                          onClick={() => handleDashboardChange(dashboard.id)}
                          whileHover={{ x: 4 }}
                        >
                          <div className="font-medium">{dashboard.name}</div>
                          <div className={`text-sm ${currentTheme.textSecondary}`}>
                            {dashboard.description}
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${currentTheme.textSecondary}`} />
                <input
                  type="text"
                  placeholder="Search dashboards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 ${currentTheme.card} border border-gray-700/50 rounded-xl focus:border-emerald-500/50 focus:outline-none transition-colors ${currentTheme.text} placeholder-gray-400`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    className={`p-2 rounded-xl bg-${action.color}-500/20 hover:bg-${action.color}-500/30 transition-colors group`}
                    onClick={action.action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={action.id === 'refresh' && isRefreshing}
                  >
                    <motion.div
                      animate={{ rotate: action.id === 'refresh' && isRefreshing ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                    >
                      <IconComponent className={`w-4 h-4 text-${action.color}-400 group-hover:text-${action.color}-300`} />
                    </motion.div>
                  </motion.button>
                );
              })}

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  className={`p-2 rounded-xl ${alerts.filter(a => !a.acknowledged).length > 0 ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-gray-700/30 hover:bg-gray-700/50'} transition-colors`}
                  onClick={() => setShowNotifications(!showNotifications)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className={`w-4 h-4 ${alerts.filter(a => !a.acknowledged).length > 0 ? 'text-red-400' : currentTheme.textSecondary}`} />
                  {alerts.filter(a => !a.acknowledged).length > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-full right-0 mt-2 w-80 ${currentTheme.card} rounded-xl shadow-xl border border-gray-700/50 py-4 z-50 max-h-96 overflow-y-auto`}
                    >
                      <div className="px-4 mb-3">
                        <h3 className={`font-semibold ${currentTheme.text}`}>Notifications</h3>
                        <p className={`text-sm ${currentTheme.textSecondary}`}>
                          {alerts.length} total, {alerts.filter(a => !a.acknowledged).length} unread
                        </p>
                      </div>

                      <div className="space-y-2">
                        {alerts.length === 0 ? (
                          <div className={`text-center py-8 ${currentTheme.textSecondary}`}>
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          alerts.map((alert) => (
                            <motion.div
                              key={alert.id}
                              className={`mx-2 p-3 rounded-lg border transition-colors ${alert.acknowledged
                                  ? 'bg-gray-700/20 border-gray-700/30'
                                  : alert.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : alert.type === 'warning'
                                      ? 'bg-yellow-500/10 border-yellow-500/30'
                                      : 'bg-blue-500/10 border-blue-500/30'
                                }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: alerts.indexOf(alert) * 0.1 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2">
                                  {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />}
                                  {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />}
                                  {alert.type === 'info' && <Info className="w-4 h-4 text-blue-400 mt-0.5" />}
                                  {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />}

                                  <div className="flex-1">
                                    <h4 className={`font-medium ${currentTheme.text} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                                      {alert.title}
                                    </h4>
                                    <p className={`text-sm ${currentTheme.textSecondary} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                                      {alert.message}
                                    </p>
                                    <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>
                                      {new Date(alert.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                  {!alert.acknowledged && (
                                    <motion.button
                                      className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                      onClick={() => acknowledgeAlert(alert.id)}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                    </motion.button>
                                  )}
                                  <motion.button
                                    className={`p-1 rounded ${currentTheme.textSecondary} hover:bg-red-500/20 transition-colors`}
                                    onClick={() => dismissAlert(alert.id)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <X className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <motion.button
                className={`p-2 rounded-xl ${currentTheme.card} border border-gray-700/50 hover:border-emerald-500/50 transition-colors`}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'light' ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </motion.button>

              {/* Settings */}
              <motion.button
                className={`p-2 rounded-xl ${currentTheme.card} border border-gray-700/50 hover:border-emerald-500/50 transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4" />
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

      {/* Click Outside Handler */}
      {(showNotifications || showDashboardSelector) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowDashboardSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default DashLayout;
