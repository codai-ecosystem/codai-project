'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Home,
  Users,
  Key,
  Activity,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Fingerprint,
  Eye,
  Lock,
  UserCheck,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Globe,
  Clock,
  Award
} from 'lucide-react';

interface IDLayoutProps {
  children: ReactNode;
}

const IDLayout: React.FC<IDLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/', active: true },
    { icon: Users, label: 'User Management', href: '/users' },
    { icon: Shield, label: 'Security Center', href: '/security' },
    { icon: Key, label: 'Authentication', href: '/auth' },
    { icon: Fingerprint, label: 'Biometrics', href: '/biometrics' },
    { icon: Eye, label: 'Monitoring', href: '/monitoring' },
    { icon: Activity, label: 'Audit Logs', href: '/audit' },
    { icon: TrendingUp, label: 'Analytics', href: '/analytics' },
    { icon: Brain, label: 'AI Insights', href: '/ai-insights' },
    { icon: Settings, label: 'Settings', href: '/settings' }
  ];

  const securityFeatures = [
    { icon: Fingerprint, label: 'Biometric Auth', status: 'active' },
    { icon: Key, label: 'Two-Factor Auth', status: 'active' },
    { icon: Eye, label: 'Behavioral Analysis', status: 'monitoring' },
    { icon: Brain, label: 'AI Risk Detection', status: 'active' }
  ];

  const recentSecurityEvents = [
    {
      id: 1,
      type: 'login_success',
      message: 'Successful biometric login from trusted device',
      time: '2 minutes ago',
      icon: CheckCircle,
      severity: 'low'
    },
    {
      id: 2,
      type: 'new_device',
      message: 'New device detected for user alex.johnson@company.com',
      time: '15 minutes ago',
      icon: AlertTriangle,
      severity: 'medium'
    },
    {
      id: 3,
      type: 'password_change',
      message: 'Password updated for high-privilege account',
      time: '1 hour ago',
      icon: Lock,
      severity: 'low'
    },
    {
      id: 4,
      type: 'ai_alert',
      message: 'AI detected unusual login pattern for 3 users',
      time: '2 hours ago',
      icon: Brain,
      severity: 'high'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'monitoring': return 'text-blue-400 bg-blue-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 bg-black/30 backdrop-blur-xl border-r border-white/10 z-50 lg:relative lg:translate-x-0 lg:block"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
              >
                <Shield className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ID
                </h1>
                <p className="text-xs text-gray-400">Identity & Authentication</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Security Status */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Security Features</h3>
          <div className="space-y-2">
            {securityFeatures.map((feature) => (
              <motion.div
                key={feature.label}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <feature.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">{feature.label}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(feature.status)}`}>
                  {feature.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 flex-1">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <motion.li key={item.label}>
                <motion.a
                  href={item.href}
                  whileHover={{ x: 4 }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${item.active
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                    }`} />
                  <span className="font-medium">{item.label}</span>
                  {item.active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                    />
                  )}
                </motion.a>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Recent Security Events */}
        <div className="p-6 border-t border-white/10">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Events</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentSecurityEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${event.severity === 'high' ? 'bg-red-600/20' :
                    event.severity === 'medium' ? 'bg-yellow-600/20' : 'bg-blue-600/20'
                  }`}>
                  <event.icon className={`w-4 h-4 ${getSeverityColor(event.severity)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-relaxed">{event.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="lg:ml-80 flex-1">
        {/* Top Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>

                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users, events, or security logs..."
                      className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 w-96 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Security Status */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-green-600/20 px-3 py-2 rounded-lg border border-green-500/30"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Secure</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </motion.button>

                {/* AI Status */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-blue-600/20 px-3 py-2 rounded-lg border border-blue-500/30"
                >
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">AI Monitor</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </motion.div>

                {/* User Menu */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">SA</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">Security Admin</p>
                    <p className="text-xs text-gray-400">admin@id.com</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">ID v1.0.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">AI-Powered Identity Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Enterprise Security</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Security Docs</a>
              <a href="#" className="hover:text-white transition-colors">Compliance</a>
              <a href="#" className="hover:text-white transition-colors">API Reference</a>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-green-400">All Systems Secure</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default IDLayout;
