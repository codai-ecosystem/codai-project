'use client';

import { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { BalanceCard, TransactionList, InsightCard } from '@/components/financial';
import PortfolioManager from '@/components/investment/PortfolioManager';
import TradingInterface from '@/components/trading/TradingInterface';
import RiskManagement from '@/components/risk/RiskManagement';
import OptionsTrading from '@/components/options/OptionsTrading';

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  financialSummary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    netWorth: number;
  };
  accountSummary: {
    totalAccounts: number;
    checkingBalance: number;
    savingsBalance: number;
    creditUtilization: number;
  };
  insights: {
    total: number;
    categories: Record<string, number>;
    recent: number;
  };
  spendingByCategory: Record<string, number>;
  savingsGoals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    targetDate: string;
  }>;
  aiRecommendations: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    impact: string;
  }>;
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadDashboard();
  }, []);

  const checkAuthAndLoadDashboard = async () => {
    try {
      // Check authentication status
      const authResponse = await fetch('/api/auth/me');
      
      if (!authResponse.ok) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const authData = await authResponse.json();
      setIsAuthenticated(true);

      // Load dashboard data
      const dashboardResponse = await fetch('/api/dashboard');
      
      if (!dashboardResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const data = await dashboardResponse.json();
      setDashboardData(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@bancai.ro',
          password: 'demo123'
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        setError('Sign in failed');
      }
    } catch (err) {
      setError('Sign in failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to BancAI
            </h1>
            <p className="text-gray-600 mb-6">
              AI-Powered Financial Platform for Modern Banking
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                🚧 Demo Environment - Codai Ecosystem Integration
              </p>
            </div>
            <Button onClick={handleSignIn} className="w-full">
              Demo Sign In
            </Button>
            {error && (
              <ErrorMessage message={error} className="mt-4" />
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BancAI Dashboard</h1>
              <p className="text-gray-600">Welcome back, {dashboardData.user.name}</p>
            </div>
            <div className="text-sm text-gray-500">
              Service: bancai.ro | Priority: 2
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <BalanceCard
            title="Total Balance"
            amount={dashboardData.financialSummary.totalBalance}
            change={+2.4}
            positive={true}
          />
          <BalanceCard
            title="Monthly Income"
            amount={dashboardData.financialSummary.monthlyIncome}
            change={0}
            positive={null}
          />
          <BalanceCard
            title="Monthly Expenses"
            amount={dashboardData.financialSummary.monthlyExpenses}
            change={-5.2}
            positive={false}
          />
          <BalanceCard
            title="Savings Rate"
            amount={dashboardData.financialSummary.savingsRate * 100}
            suffix="%"
            change={+1.8}
            positive={true}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Summary & Spending */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Summary */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Checking</p>
                    <p className="text-xl font-semibold">${dashboardData.accountSummary.checkingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Savings</p>
                    <p className="text-xl font-semibold">${dashboardData.accountSummary.savingsBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Spending by Category */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
                <div className="space-y-3">
                  {Object.entries(dashboardData.spendingByCategory).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{category}</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - AI Insights & Recommendations */}
          <div className="space-y-8">
            {/* AI Insights Summary */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Insights</span>
                    <span className="font-medium">{dashboardData.insights.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent</span>
                    <span className="font-medium">{dashboardData.insights.recent}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Insights
                </Button>
              </div>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h2>
                <div className="space-y-4">
                  {dashboardData.aiRecommendations.slice(0, 2).map((recommendation) => (
                    <InsightCard
                      key={recommendation.id}
                      title={recommendation.title}
                      description={recommendation.description}
                      type={recommendation.type}
                      impact={recommendation.impact}
                    />
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Recommendations
                </Button>
              </div>
            </Card>

            {/* Savings Goals */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Savings Goals</h2>
                <div className="space-y-4">
                  {dashboardData.savingsGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{goal.name}</span>
                        <span className="text-gray-500">
                          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${goal.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Codai Ecosystem Integration</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>MemorAI: Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>LogAI: Authenticated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>CodAI: Integrating</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Advanced Financial Features */}
        <div className="mt-8 space-y-8">
          {/* Portfolio Management */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Management</h2>
              <PortfolioManager />
            </div>
          </Card>

          {/* Trading Interface */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Trading Interface</h2>
              <TradingInterface />
            </div>
          </Card>

          {/* Options Trading */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Options Trading</h2>
              <OptionsTrading />
            </div>
          </Card>

          {/* Risk Management */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Management</h2>
              <RiskManagement />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
