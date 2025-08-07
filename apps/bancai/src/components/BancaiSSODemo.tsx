import React from 'react'
/**
 * BancAI Platform - Secure Banking Application with Integrated Authentication
 * Cross-app authentication system with advanced banking features
 */

'use client';

import { useAuth, AppConfig, NavigationManager } from '../lib/auth';
import { useState } from 'react';
import {
  Shield,
  User,
  Settings,
  LogOut,
  Crown,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  Lock,
  CheckCircle,
  AlertTriangle,
  PieChart,
  BarChart3,
  Wallet
} from 'lucide-react';

export default function BancaiSSODemo() {
  const { authState, logout, hasRole, hasAnyRole, isAdmin, canAccess, hasBankingAccess } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing BancAI Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <CreditCard className="h-12 w-12 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">BancAI Platform</h1>
            </div>
            <p className="text-gray-600 mb-8">Secure AI-powered banking platform with enterprise authentication</p>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
              <h3 className="font-semibold text-green-900 mb-3">🏦 Banking Features</h3>
              <ul className="text-sm text-green-700 space-y-2 text-left">
                <li>• Secure account management</li>
                <li>• Real-time transaction monitoring</li>
                <li>• AI-powered financial insights</li>
                <li>• Multi-level security protocols</li>
                <li>• Cross-platform integration</li>
              </ul>
            </div>

            <button
              onClick={() => NavigationManager.redirectToAuth(window.location.href)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In to BancAI Platform
            </button>

            <div className="mt-4 text-sm text-gray-500">
              Secure authentication via CODAI Identity
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banking access check
  if (!hasBankingAccess()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Banking Access Required</h1>
          <p className="text-gray-600 mb-6">Your account does not have banking privileges. Please contact your administrator for access.</p>
          <button
            onClick={logout}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'master_admin':
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 'ai_admin':
        return <Shield className="h-5 w-5 text-blue-500" />
      case 'admin':
        return <Shield className="h-5 w-5 text-green-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  };

  const navigation = AppConfig.getNavigation('bancai');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BancAI Platform</h1>
                <p className="text-xs text-gray-600">Secure Banking</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.slice(0, 6).map((app) => (
                <a
                  key={app.key}
                  href={app.url}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${app.active
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {app.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                {getRoleIcon(user?.role || 'customer')}
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome to BancAI, {user?.name}!</h2>
              <div className="flex items-center space-x-2">
                {getRoleIcon(user?.role || 'customer')}
                <span className="text-sm font-medium text-gray-600">{user?.role?.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
            <p className="text-gray-600">Your secure AI-powered banking platform is ready. Manage your finances with advanced security and intelligent insights.</p>
          </div>

          {/* Banking Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Balance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Primary Account</h3>
                  <p className="text-2xl font-bold text-green-600">$24,586.42</p>
                  <p className="text-sm text-green-500">+2.4% this month</p>
                </div>
              </div>
            </div>

            {/* Savings Account */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Savings Account</h3>
                  <p className="text-2xl font-bold text-blue-600">$85,234.18</p>
                  <p className="text-sm text-blue-500">4.2% APY</p>
                </div>
              </div>
            </div>

            {/* Credit Score */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Credit Score</h3>
                  <p className="text-2xl font-bold text-purple-600">742</p>
                  <p className="text-sm text-purple-500">Excellent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Services */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-center">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">Transfer Money</span>
              </button>
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-center">
                <CreditCard className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">Pay Bills</span>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-center">
                <PieChart className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">View Reports</span>
              </button>
              <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-center">
                <Settings className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Settings</span>
              </button>
            </div>
          </div>

          {/* Security Features */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg border border-green-200 p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-900">Banking Security Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Authentication</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>User: {user?.email}</p>
                  <p>Role: {user?.role}</p>
                  <p>Banking Access: ✅</p>
                </div>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Security Level</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Enhanced
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>Multi-factor auth: ✅</p>
                  <p>Transaction monitoring: ✅</p>
                  <p>Device verification: ✅</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          {isAdmin() && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-6">
              <div className="flex items-center mb-4">
                <Crown className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-900">Banking Admin Controls</h3>
              </div>
              <p className="text-yellow-800 mb-4">You have administrative access to banking platform features.</p>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                  User Management
                </button>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Banking Settings
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Security Audit
                </button>
              </div>
            </div>
          )}

          {/* Cross-App Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 CODAI Ecosystem</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {navigation.map((app) => (
                <a
                  key={app.key}
                  href={app.url}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${app.active
                      ? 'bg-green-50 border-green-200 text-green-900'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{app.icon}</div>
                    <div className="text-xs font-medium">{app.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 BancAI Platform. All rights reserved.
            </div>
            <div className="text-sm text-gray-600">
              Authenticated as {user?.email}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

