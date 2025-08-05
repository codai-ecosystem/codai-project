'use client';

import { useState, useEffect } from 'react';
import {
  useSystemStatus,
  useRealTimeMetrics,
  formatRelativeTime
} from '../components/ui';
import { StatusIndicator, MetricCard, ProgressBar, LoadingSpinner } from '../components/ui/components';
import AGITrainingDashboard from '../components/AGITrainingDashboard';

export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const systemStatus = useSystemStatus();
  const realTimeMetrics = useRealTimeMetrics();

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : systemDark;

    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RomAI
                </h1>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <StatusIndicator status={systemStatus.status} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {systemStatus.status === 'operational' ? 'Toate sistemele funcționează' : 'Verificare sisteme...'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                data-testid="theme-toggle"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                v2.1.0 | Production
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: '🏠 Dashboard', testId: 'nav-dashboard' },
              { id: 'chat', label: '💬 Romanian AI Chat', testId: 'nav-chat' },
              { id: 'analytics', label: '📊 Analytics', testId: 'nav-analytics' },
              { id: 'agi-training', label: '🧠 AGI Training', testId: 'nav-agi-training' },
              { id: 'settings', label: '⚙️ Settings', testId: 'nav-settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                data-testid={tab.testId}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'dashboard' && <DashboardView metrics={realTimeMetrics} systemStatus={systemStatus} />}
        {selectedTab === 'chat' && <ChatView />}
        {selectedTab === 'analytics' && <AnalyticsView />}
        {selectedTab === 'agi-training' && <AGITrainingView />}
        {selectedTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ metrics, systemStatus }: {
  metrics: ReturnType<typeof useRealTimeMetrics>,
  systemStatus: ReturnType<typeof useSystemStatus>
}) {
  // Mock data for Romanian regions
  const romanianRegions = [
    { region: 'București', percentage: 35, users: 127, growth: '+12%' },
    { region: 'Cluj-Napoca', percentage: 22, users: 89, growth: '+8%' },
    { region: 'Timișoara', percentage: 18, users: 67, growth: '+15%' },
    { region: 'Iași', percentage: 15, users: 54, growth: '+5%' },
    { region: 'Constanța', percentage: 10, users: 38, growth: '+20%' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Bine ai venit la RomAI! 🇷🇴</h2>
            <p className="text-blue-100 text-lg">
              Sistemul de inteligență artificială pentru România
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                🔥 {metrics.activeUsers.toLocaleString()} utilizatori activi
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                ⚡ {metrics.queriesPerMinute}/min
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-6xl">🧠</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🚀</span>
          Status Sistem
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Actualizat: {formatRelativeTime(systemStatus.lastChecked)}
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stats-section">
        <div className="stat-item">
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            change="+12% față de ieri"
            icon="👥"
            trend="up"
          />
        </div>
        <div className="stat-item">
          <MetricCard
            title="Queries/Minute"
            value={metrics.queriesPerMinute}
            change="Live updates"
            icon="⚡"
            trend="neutral"
          />
        </div>
        <div className="stat-item">
          <MetricCard
            title="Total Romanian Queries"
            value={metrics.totalQueries}
            change="+18% această săptămână"
            icon="🇷🇴"
            trend="up"
          />
        </div>
        <div className="stat-item">
          <MetricCard
            title="Success Rate"
            value={metrics.successRate}
            change="+0.2% îmbunătățire"
            icon="💚"
            trend="up"
            format="percentage"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{systemStatus.responseTime}ms</span>
              </div>
              <ProgressBar value={(500 - systemStatus.responseTime) / 5} color="green" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span
                  className="text-sm font-medium text-gray-900 dark:text-white"
                  data-testid="uptime-percentage"
                >
                  {systemStatus.uptime.toFixed(2)}%
                </span>
              </div>
              <ProgressBar value={systemStatus.uptime} color="green" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                <span
                  className="text-sm font-medium text-gray-900 dark:text-white"
                  data-testid="memory-percentage"
                >
                  67%
                </span>
              </div>
              <ProgressBar value={67} color="blue" />
            </div>
          </div>
        </div>

        {/* Romanian Regional Data */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🇷🇴 Utilizatori pe Regiuni
          </h3>
          <div className="space-y-3">
            {romanianRegions.map((item) => (
              <div key={item.region} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{item.region}</span>
                    <span className="text-gray-600 dark:text-gray-400">{item.users} utilizatori</span>
                  </div>
                  <ProgressBar value={item.percentage} color="blue" />
                </div>
                <span className="ml-4 text-sm text-green-600 dark:text-green-400 font-medium">
                  {item.growth}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat View Component
function ChatView() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: number;
    type: 'ai' | 'user';
    message: string;
    timestamp: Date;
  }>>([
    {
      id: 1,
      type: 'ai',
      message: 'Bună ziua! Sunt RomAI, asistentul tău AI pentru limba română. Cu ce vă pot ajuta astăzi?',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newUserMessage = {
      id: chatHistory.length + 1,
      type: 'user' as const,
      message: message.trim(),
      timestamp: new Date()
    };

    const aiResponse = {
      id: chatHistory.length + 2,
      type: 'ai' as const,
      message: `Am înțeles întrebarea dumneavoastră: "${message}". Aceasta este o demonstrație a capacităților RomAI pentru procesarea limbii române.`,
      timestamp: new Date()
    };

    setChatHistory([...chatHistory, newUserMessage, aiResponse]);
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            🤖 Romanian AI Assistant
            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
              Online
            </span>
          </h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                  }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString('ro-RO')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Scrieți mesajul dumneavoastră în română..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              data-testid="chat-input"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              data-testid="chat-send-button"
            >
              Trimite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const timeRanges = [
    { value: '1h', label: 'Ultima oră' },
    { value: '24h', label: 'Ultimele 24h' },
    { value: '7d', label: 'Ultima săptămână' },
    { value: '30d', label: 'Ultima lună' }
  ];

  // Simulate loading when changing time range
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [timeRange]);

  return (
    <div className="space-y-6 animate-fade-in-up analytics-section">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Analytics & Performance</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 loading-spinner">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics data...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Queries</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234,567</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+15% vs perioada anterioară</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Romanian Language Accuracy</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">97.4%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+0.3% îmbunătățire</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Average Response Time</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">245ms</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">-12ms îmbunătățire</p>
            </div>
          </div>

          {/* Advanced Analytics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🧠 AI Model Performance
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { name: 'RomAI-GPT-4', accuracy: '97.4%', usage: 85, color: 'blue' },
                { name: 'RomAI-BERT', accuracy: '94.2%', usage: 60, color: 'green' },
                { name: 'RomAI-T5', accuracy: '91.8%', usage: 45, color: 'purple' }
              ].map((model) => (
                <div key={model.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{model.accuracy}</span>
                  </div>
                  <ProgressBar value={model.usage} color={model.color as any} />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Usage</span>
                    <span className="text-sm text-gray-900 dark:text-white">{model.usage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Romanian Language Features */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🇷🇴 Romanian Language Capabilities
            </h3>
            <div className="space-y-4">
              {[
                { feature: 'Text Translation', desc: 'RO ↔ EN translation', accuracy: '98%', icon: '🔄' },
                { feature: 'Cultural Context', desc: 'Romanian cultural analysis', accuracy: '95%', icon: '🏛️' },
                { feature: 'Grammar Check', desc: 'Romanian grammar validation', accuracy: '97%', icon: '✍️' },
                { feature: 'Sentiment Analysis', desc: 'Romanian text sentiment', accuracy: '94%', icon: '😊' },
                { feature: 'Regional Dialects', desc: 'Moldovan, Banat, Maramureș', accuracy: '89%', icon: '🗺️' }
              ].map((item) => (
                <div key={item.feature} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.feature}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {item.accuracy}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// AGI Training View Component
function AGITrainingView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">🧠 AGI Training Dashboard</h2>
        <div className="flex items-center space-x-2">
          <StatusIndicator status="operational" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Training Active</span>
        </div>
      </div>

      <AGITrainingDashboard />
    </div>
  );
}

// Settings View Component
function SettingsView() {
  const [language, setLanguage] = useState('ro');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="max-w-2xl space-y-6 settings-panel">
      <h2 className="text-2xl font-bold gradient-text">⚙️ Settings / Setări</h2>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Language Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interface Language / Limba interfeței
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive system and update notifications</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto-save</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save your work</p>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSave ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About / Despre</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Version:</strong> 2.1.0</p>
          <p><strong>Environment:</strong> Production</p>
          <p><strong>Romanian Language Model:</strong> RomAI-GPT-4</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('ro-RO')}</p>
        </div>
      </div>
    </div>
  );
}