import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Activity, Brain, MessageSquare, BarChart3 } from 'lucide-react';
import { useRomaiApi } from '../lib/api';
import type { IntelligenceRequest } from '@/types';

interface DashboardStats {
  totalIntelligence: number;
  activeChats: number;
  successRate: number;
  uptime: string;
}

interface SystemHealth {
  status: string;
  timestamp: string;
  details: Record<string, any>;
}

const Home: NextPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalIntelligence: 0,
    activeChats: 0,
    successRate: 0,
    uptime: '0h 0m',
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingAI, setIsTestingAI] = useState(false);

  const api = useRomaiApi();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check system health
      const health = await api.healthCheck();
      setSystemHealth(health);

      // Authenticate and load stats
      await api.authenticate();

      // Simulate stats (in a real app, these would come from analytics endpoints)
      setStats({
        totalIntelligence: 1247,
        activeChats: 43,
        successRate: 97.8,
        uptime: '24h 15m',
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const testAIConnection = async () => {
    if (!testQuery.trim()) return;

    setIsTestingAI(true);
    setTestResponse(null);

    try {
      const request: IntelligenceRequest = {
        query: testQuery,
        language: 'ro',
        domain: 'general',
      };

      const response = await api.processIntelligence(request);
      setTestResponse(response.response);
    } catch (err) {
      console.error('AI test failed:', err);
      setTestResponse(`Error: ${err instanceof Error ? err.message : 'Test failed'}`);
    } finally {
      setIsTestingAI(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  const statCards = [
    {
      title: 'Total Intelligence',
      value: stats.totalIntelligence.toLocaleString(),
      icon: Brain,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Chats',
      value: stats.activeChats.toString(),
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: BarChart3,
      color: 'bg-orange-500',
      change: '+2.3%',
    },
    {
      title: 'System Uptime',
      value: stats.uptime,
      icon: Activity,
      color: 'bg-purple-500',
      change: '99.9%',
    },
  ];

  return (
    <>
      <Head>
        <title>ROMAI Dashboard - Central Intelligence</title>
        <meta name="description" content="Romanian AI Central Intelligence System Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CpuChipIcon className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ROMAI
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Central Intelligence Dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {darkMode ? (
                      <SunIcon className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <MoonIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400">{error}</span>
                  <button
                    onClick={loadDashboardData}
                    className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

            {/* System Health Status */}
            {systemHealth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {systemHealth.status === 'healthy' ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        System Status: {systemHealth.status.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last checked: {new Date(systemHealth.timestamp).toLocaleString('ro-RO')}
                      </p>
                    </div>
                  </div>
                  {systemHealth.details && Object.keys(systemHealth.details).length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Azure: {systemHealth.details.azure || 'connected'}</div>
                      <div>Model: {systemHealth.details.model || 'gpt-4o'}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bine ai venit la ROMAI
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Sistemul Central de Inteligență Artificială Românesc
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Intelligence Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Intelligence Center
                  </h3>
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Accesează și gestionează capabilitățile de inteligență artificială.
                </p>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Deschide Intelligence Center
                </button>
              </div>

              {/* Chat Interface */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chat Interface
                  </h3>
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Interacționează direct cu sistemul ROMAI prin chat.
                </p>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Începe Conversația
                </button>
              </div>
            </motion.div>

            {/* AI Testing Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Test AI Intelligence
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="test-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Întreabă ROMAI ceva:
                  </label>
                  <input
                    id="test-query"
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Ex: Ce este inteligența artificială?"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && testAIConnection()}
                  />
                </div>
                <button
                  onClick={testAIConnection}
                  disabled={!testQuery.trim() || isTestingAI}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isTestingAI ? 'Se procesează...' : 'Testează AI'}
                </button>
                {testResponse && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Răspuns ROMAI:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {testResponse}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    API Server: {systemHealth?.status === 'healthy' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${api.isAuthenticated() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Authentication: {api.isAuthenticated() ? 'Connected' : 'Not Authenticated'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${systemHealth?.details?.azure === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Azure OpenAI: {systemHealth?.details?.azure || 'Unknown'}
                  </span>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;
