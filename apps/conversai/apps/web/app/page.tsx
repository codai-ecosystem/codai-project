'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Header, MetricCard, FeatureCard } from '@codai/shared-ui';
import { MessageCircle, Users, Activity, TrendingUp, Send, Search, Bell, Archive, Trash2, Star } from 'lucide-react';

export default function ConversAIPage() {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const conversationMetrics = [
    {
      title: t('conversai.metrics.conversations'),
      value: "1,247",
      change: "+12.3%",
      trend: "up" as const,
      icon: MessageCircle,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: t('conversai.metrics.messages'),
      value: "23.5K",
      change: "+8.1%",
      trend: "up" as const,
      icon: Send,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: t('conversai.metrics.users'),
      value: "892",
      change: "+15.7%",
      trend: "up" as const,
      icon: Users,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: t('conversai.metrics.satisfaction'),
      value: "94.2%",
      change: "+2.1%",
      trend: "up" as const,
      icon: TrendingUp,
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  const platformFeatures = [
    {
      title: t('conversai.features.aiChat.title'),
      description: t('conversai.features.aiChat.description'),
      icon: MessageCircle,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: t('conversai.features.realtime.title'),
      description: t('conversai.features.realtime.description'),
      icon: Activity,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: t('conversai.features.analytics.title'),
      description: t('conversai.features.analytics.description'),
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: t('conversai.features.automation.title'),
      description: t('conversai.features.automation.description'),
      icon: Archive,
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen conversai-gradient">
      <Header
        title={t('conversai.title')}
        subtitle={t('conversai.subtitle')}
      />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 conversai-glass border-r border-white/20 min-h-screen p-4"
        >
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full conversai-btn-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              {t('conversai.chat.newChat')}
            </motion.button>

            <nav className="space-y-2">
              {[
                { label: 'Primite', count: 12, icon: Bell },
                { label: 'Trimise', icon: Send },
                { label: 'Marcate', icon: Star },
                { label: 'Arhivate', icon: Archive },
                { label: 'Șters', icon: Trash2 }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-2 px-3 rounded-lg conversai-nav-item"
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {item.count}
                    </span>
                  )}
                </motion.div>
              ))}
            </nav>

            <div className="mt-6 p-3 conversai-glass rounded-lg">
              <div className="text-center text-slate-600 text-sm mb-2">Time</div>
              <div className="text-center font-mono text-lg text-slate-800">
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Hero Section */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold conversai-gradient-text mb-4">
              {t('conversai.hero.title')}
            </h1>
            <p className="text-xl text-slate-600 mb-6 max-w-3xl">
              {t('conversai.hero.description')}
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('conversai.chat.placeholder')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 conversai-glass rounded-xl border border-white/30 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>
          </motion.section>

          {/* Metrics Grid */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {conversationMetrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MetricCard {...metric} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {t('conversai.features.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Action Buttons */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="conversai-btn-primary"
            >
              Accesează Dashboard-ul
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="conversai-btn-secondary"
            >
              Compune primul email
            </motion.button>
          </motion.section>

          {/* Quick Stats */}
          <motion.section
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="conversai-glass rounded-2xl p-6 border border-white/30"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistici Rapide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "12", label: "Inbox", color: "text-blue-600" },
                { value: "8", label: "Trimise", color: "text-green-600" },
                { value: "3", label: "Importante", color: "text-purple-600" },
                { value: "24", label: "Total", color: "text-slate-600" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="conversai-glass border-t border-white/20 px-6 py-4 mt-8"
      >
        <div className="text-center text-sm text-slate-600">
          <p className="mb-1">ConversAI - Parte din ecosistemul CODAI</p>
          <p>© 2025 CODAI - Email profesional cu inteligență artificială</p>
        </div>
      </motion.footer>
    </div>
  );
}
