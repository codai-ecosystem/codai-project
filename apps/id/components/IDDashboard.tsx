'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Key,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  Brain,
  Zap,
  Clock,
  MapPin,
  Star,
  Award,
  Plus,
  Search,
  Filter,
  Bell,
  Download,
  Upload
} from 'lucide-react';

import { IDService } from '../lib/IDService';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
    biometricEnabled: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    trustedDevices: any[];
    loginHistory: any[];
  };
  reputation: {
    score: number;
    level: string;
    badges: any[];
  };
  subscription: {
    plan: string;
    status: string;
  };
  aiInsights: {
    riskScore: number;
    accountHealth: number;
    securityRecommendations: string[];
  };
  lastLogin: Date;
}

interface IDMetrics {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  loginAttempts: number;
  successfulLogins: number;
  blockedAttempts: number;
  averageReputationScore: number;
  biometricAdoption: number;
  twoFactorAdoption: number;
  securityIncidents: number;
}

const IDDashboard: React.FC = () => {
  const [idService] = useState(() => IDService.getInstance());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<IDMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'analytics' | 'settings'>('overview');
  const [securityAnalytics, setSecurityAnalytics] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, userData] = await Promise.all([
        idService.getIDMetrics(),
        idService.getUserProfile('user-001') // Load admin user
      ]);

      setMetrics(metricsData);
      setCurrentUser(userData);

      if (userData) {
        const analytics = await idService.getSecurityAnalytics(userData.id);
        setSecurityAnalytics(analytics);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-400';
    if (riskScore >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (riskScore: number) => {
    if (riskScore >= 70) return 'bg-red-400/20';
    if (riskScore >= 40) return 'bg-yellow-400/20';
    return 'bg-green-400/20';
  };

  const getVerificationLevel = (user: UserProfile) => {
    let level = 0;
    if (user.verification.emailVerified) level++;
    if (user.verification.phoneVerified) level++;
    if (user.verification.identityVerified) level++;
    if (user.verification.biometricEnabled) level++;
    return level;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  ID
                </h1>
                <p className="text-gray-300 text-sm">Identity & Authentication</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600/50 hover:bg-blue-600/70 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Metrics Grid */}
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: 'Total Users',
                      value: metrics.totalUsers.toLocaleString(),
                      icon: Users,
                      color: 'from-blue-500 to-blue-600',
                      change: '+5.2%'
                    },
                    {
                      label: 'Active Users',
                      value: metrics.activeUsers.toLocaleString(),
                      icon: UserCheck,
                      color: 'from-green-500 to-green-600',
                      change: '+12.3%'
                    },
                    {
                      label: 'Success Rate',
                      value: `${Math.round((metrics.successfulLogins / Math.max(1, metrics.loginAttempts)) * 100)}%`,
                      icon: CheckCircle,
                      color: 'from-indigo-500 to-indigo-600',
                      change: '+2.1%'
                    },
                    {
                      label: 'Security Score',
                      value: `${Math.round(100 - (metrics.securityIncidents / Math.max(1, metrics.totalUsers)) * 10)}%`,
                      icon: Shield,
                      color: 'from-purple-500 to-purple-600',
                      change: '+0.8%'
                    }
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                          <metric.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-green-400 text-sm font-medium">{metric.change}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                      <p className="text-gray-400 text-sm">{metric.label}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Current User Profile */}
              {currentUser && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {currentUser.displayName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">{currentUser.displayName}</h2>
                        <p className="text-gray-400">{currentUser.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${currentUser.subscription.plan === 'enterprise'
                              ? 'bg-purple-400/20 text-purple-400'
                              : 'bg-blue-400/20 text-blue-400'
                            }`}>
                            {currentUser.subscription.plan.toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Last login: {formatDate(currentUser.lastLogin)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Verification Level</span>
                          <span className="text-sm text-white">{getVerificationLevel(currentUser)}/4</span>
                        </div>
                        <div className="flex space-x-1">
                          {[
                            { verified: currentUser.verification.emailVerified, icon: '@', label: 'Email' },
                            { verified: currentUser.verification.phoneVerified, icon: '📱', label: 'Phone' },
                            { verified: currentUser.verification.identityVerified, icon: '🆔', label: 'ID' },
                            { verified: currentUser.verification.biometricEnabled, icon: '👆', label: 'Biometric' }
                          ].map((item, index) => (
                            <div
                              key={index}
                              className={`flex-1 h-2 rounded-full ${item.verified ? 'bg-green-400' : 'bg-gray-600'
                                }`}
                              title={item.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Account Health</span>
                          <span className="text-sm text-white">{currentUser.aiInsights.accountHealth}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${currentUser.aiInsights.accountHealth}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Risk Score</span>
                          <span className={`text-sm ${getRiskColor(currentUser.aiInsights.riskScore)}`}>
                            {currentUser.aiInsights.riskScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${currentUser.aiInsights.riskScore >= 70 ? 'bg-red-500' :
                                currentUser.aiInsights.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            style={{ width: `${currentUser.aiInsights.riskScore}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Reputation</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white">{currentUser.reputation.score}/100</span>
                          </div>
                          <span className="text-sm text-gray-400">{currentUser.reputation.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Security Insights */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center space-x-3 mb-6">
                      <Brain className="w-6 h-6 text-blue-400" />
                      <h2 className="text-xl font-semibold text-white">AI Security Insights</h2>
                    </div>

                    {securityAnalytics && (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${securityAnalytics.riskAssessment.level === 'low'
                            ? 'bg-green-400/10 border-green-400/30'
                            : securityAnalytics.riskAssessment.level === 'medium'
                              ? 'bg-yellow-400/10 border-yellow-400/30'
                              : 'bg-red-400/10 border-red-400/30'
                          }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">Risk Assessment</span>
                            <span className={`text-sm uppercase ${getRiskColor(securityAnalytics.riskAssessment.score)}`}>
                              {securityAnalytics.riskAssessment.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            Score: {securityAnalytics.riskAssessment.score}/100
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-white mb-3">Recommendations</h4>
                          <div className="space-y-2">
                            {currentUser.aiInsights.securityRecommendations.slice(0, 3).map((rec, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-300">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-white mb-3">Login Patterns</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Daily Logins</span>
                              <p className="text-white">{securityAnalytics.loginPatterns.averageLoginsPerDay.toFixed(1)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Active Hours</span>
                              <p className="text-white">{securityAnalytics.loginPatterns.mostActiveHours.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Fingerprint className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="font-semibold text-white">Biometric Auth</h3>
                      <p className="text-sm text-gray-400">{metrics?.biometricAdoption.toFixed(1)}% adoption</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${metrics?.biometricAdoption || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-8 h-8 text-green-400" />
                    <div>
                      <h3 className="font-semibold text-white">Two-Factor Auth</h3>
                      <p className="text-sm text-gray-400">{metrics?.twoFactorAdoption.toFixed(1)}% adoption</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${metrics?.twoFactorAdoption || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <UserCheck className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="font-semibold text-white">Verified Users</h3>
                      <p className="text-sm text-gray-400">{((metrics?.verifiedUsers || 0) / Math.max(1, metrics?.totalUsers || 1) * 100).toFixed(1)}% verified</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${((metrics?.verifiedUsers || 0) / Math.max(1, metrics?.totalUsers || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">This section is under development</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default IDDashboard;
