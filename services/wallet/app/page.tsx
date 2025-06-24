/**
 * Wallet Main Dashboard
 * Comprehensive programmable wallet platform for multi-chain DeFi
 */

'use client';

import { useState } from 'react';
import WalletManagement from '../components/wallet/WalletManagement';
import DeFiIntegration from '../components/defi/DeFiIntegration';
import PortfolioAnalytics from '../components/analytics/PortfolioAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Wallet,
  TrendingUp,
  Zap,
  BarChart3,
  Shield,
  Settings,
  Bell,
  ChevronRight
} from 'lucide-react';

export default function WalletDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'defi' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
                <p className="text-sm text-gray-600">Programmable Multi-Chain Wallet Platform</p>
              </div>
              <Badge className="ml-4 bg-purple-100 text-purple-800">
                Priority 2 • Enterprise Ready
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'wallets', label: 'Wallets', icon: Wallet },
              { id: 'defi', label: 'DeFi', icon: Zap },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome to Your Programmable Wallet
                  </h2>
                  <p className="text-lg opacity-90 mb-4">
                    Advanced multi-chain wallet with DeFi integration, yield optimization, and comprehensive analytics.
                  </p>
                  <div className="flex items-center space-x-4 text-sm opacity-80">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Bank-Grade Security</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      <span>Multi-Chain Support</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>AI-Powered Analytics</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">Domain</p>
                  <p className="font-medium">wallet.bancai.ro</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Portfolio Value</p>
                      <p className="text-2xl font-bold">$47,234</p>
                      <p className="text-sm text-green-600">+2.3% today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Yield</p>
                      <p className="text-2xl font-bold">$1,234</p>
                      <p className="text-sm text-green-600">6.8% APY</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Active Positions</p>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-gray-600">Across 4 chains</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Monthly Return</p>
                      <p className="text-2xl font-bold">+12.4%</p>
                      <p className="text-sm text-green-600">Above target</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('wallets')}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5" />
                      <span>Multi-Chain Wallets</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </CardTitle>
                  <CardDescription>
                    Manage wallets across Ethereum, Polygon, BSC, and more with unified interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active Wallets:</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Balance:</span>
                      <span className="font-medium">$47,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transactions:</span>
                      <span className="font-medium">245</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('defi')}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>DeFi Integration</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </CardTitle>
                  <CardDescription>
                    Access lending, yield farming, and liquidity provision across protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active Positions:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Yield:</span>
                      <span className="font-medium text-green-600">$1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average APY:</span>
                      <span className="font-medium">6.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analytics')}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Portfolio Analytics</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </CardTitle>
                  <CardDescription>
                    Advanced analytics, performance tracking, and AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Portfolio Score:</span>
                      <span className="font-medium">8.2/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>30d Return:</span>
                      <span className="font-medium text-green-600">+12.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <span className="font-medium">Medium</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Status */}
            <Card>
              <CardHeader>
                <CardTitle>Codai Ecosystem Integration</CardTitle>
                <CardDescription>
                  Real-time status of Wallet integration with other Codai services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>BancAI: Trading Ready</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>MemorAI: Connected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>LogAI: Authenticated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>FabricAI: API Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>CODAI: Orchestrating</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'wallets' && <WalletManagement />}
        {activeTab === 'defi' && <DeFiIntegration />}
        {activeTab === 'analytics' && <PortfolioAnalytics />}
      </main>
    </div>
  );
}
