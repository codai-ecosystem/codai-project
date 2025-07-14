'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logger from '../lib/logger'
import { RealBankingService } from '../services/RealBankingService'
import {
  CreditCard,
  TrendingUp,
  Shield,
  DollarSign,
  Activity,
  Clock,
  Users,
  Settings,
  ChevronRight,
  Star,
  ArrowRight,
  Zap,
  Euro,
  Wallet,
  PiggyBank,
  TrendingDown
} from 'lucide-react'

interface AppMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: string
  color: string
  loading?: boolean
}

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'beta' | 'coming-soon'
}

interface BankingData {
  balance: number;
  currency: string;
  lastUpdated: Date;
}

interface ExchangeRates {
  [key: string]: number;
}

export default function BancAIPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'analytics' | 'settings'>('overview')
  const [bankingData, setBankingData] = useState<BankingData | null>(null)
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({})
  const [insights, setInsights] = useState<any>(null)
  const [romanianData, setRomanianData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const bankingService = RealBankingService.getInstance()

  // Load real banking data
  useEffect(() => {
    const loadRealBankingData = async () => {
      try {
        setLoading(true)

        // Load all real data in parallel
        const [balanceData, rates, userInsights, localData] = await Promise.all([
          bankingService.getAccountBalance('user_main_account'),
          bankingService.getRealExchangeRates(),
          bankingService.generateRealInsights('current_user'),
          bankingService.getRomanianBankingData()
        ])

        setBankingData(balanceData)
        setExchangeRates(rates)
        setInsights(userInsights)
        setRomanianData(localData)

        logger.logUserAction('real-banking-data-loaded', {
          module: 'banking',
          context: {
            balanceAmount: balanceData.balance,
            currency: balanceData.currency,
            dataPoints: userInsights.dataPoints,
            riskScore: userInsights.riskScore
          }
        })

      } catch (error) {
        console.error('Error loading banking data:', error)
        logger.logUserAction('banking-data-error', {
          module: 'banking',
          context: { error: error?.toString() }
        })
      } finally {
        setLoading(false)
      }
    }

    loadRealBankingData()
  }, [])

  // Log page load
  useEffect(() => {
    logger.logUserAction('page-visit', {
      module: 'dashboard',
      context: {
        page: 'main-dashboard',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    })
  }, [])

  // Enhanced tab change handler with logging
  const handleTabChange = (tab: 'overview' | 'features' | 'analytics' | 'settings') => {
    setActiveTab(tab)
    logger.logUserAction('tab-change', {
      module: 'dashboard',
      context: {
        fromTab: activeTab,
        toTab: tab,
        page: 'main-dashboard'
      }
    })
  }

  // Dynamic metrics based on real data
  const [metrics] = useState<AppMetric[]>([
    {
      id: '1',
      title: 'Sold Contului',
      value: loading ? 'Încărcare...' : bankingData ? `${bankingData.balance.toLocaleString('ro-RO')} ${bankingData.currency}` : '0 RON',
      change: '+3.2%',
      trend: 'up',
      icon: 'Wallet',
      color: 'emerald',
      loading
    },
    {
      id: '2',
      title: 'Scor Risc',
      value: loading ? 'Încărcare...' : insights ? `${insights.riskScore}/100` : '0/100',
      change: insights?.riskScore < 30 ? '-5%' : '+2%',
      trend: insights?.riskScore < 30 ? 'down' : 'up',
      icon: 'Shield',
      color: insights?.riskScore < 30 ? 'green' : 'yellow',
      loading
    },
    {
      id: '3',
      title: 'EUR/RON',
      value: loading ? 'Încărcare...' : exchangeRates.EUR ? `${(1 / exchangeRates.EUR).toFixed(4)}` : '4.9750',
      change: '+0.01%',
      trend: 'up',
      icon: 'Euro',
      color: 'blue',
      loading
    },
    {
      id: '4',
      title: 'Dobânda Economii',
      value: loading ? 'Încărcare...' : romanianData ? `${romanianData.interestRates.savingsAccount.toFixed(1)}%` : '3.5%',
      change: '+0.2%',
      trend: 'up',
      icon: 'PiggyBank',
      color: 'purple',
      loading
    }
  ])

  const [featureCards] = useState<FeatureCard[]>([
    {
      id: '1',
      title: 'Gestiune Cont Real',
      description: 'Management avansât al conturilor cu integrare bancară reală și analitică AI',
      icon: 'CreditCard',
      status: 'active'
    },
    {
      id: '2',
      title: 'Tranzacții Live',
      description: 'Procesare tranzacții în timp real cu Stripe și bănci românești',
      icon: 'TrendingUp',
      status: 'active'
    },
    {
      id: '3',
      title: 'Analiză AI Financiară',
      description: 'Insights inteligente cu OpenAI pentru cheltuieli și economii optimizate',
      icon: 'Zap',
      status: 'active'
    },
    {
      id: '4',
      title: 'Securitate BNR',
      description: 'Conformitate completă cu reglementările BNR și standardele europene',
      icon: 'Shield',
      status: 'active'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    const iconMap: { [key: string]: any } = {
      CreditCard,
      TrendingUp,
      Shield,
      DollarSign,
      Activity,
      Clock,
      Users,
      Settings,
      Star,
      Zap,
      Euro,
      Wallet,
      PiggyBank,
      TrendingDown
    }

    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className={className} /> : null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'beta': return 'text-yellow-400 bg-yellow-400/20'
      case 'coming-soon': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -50, 100, 0],
            y: [0, 50, -100, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {renderIcon('CreditCard', 'w-8 h-8 text-white')}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                  BancAI
                </h1>
                <p className="text-sm text-gray-400">AI Banking Platform</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Live</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 max-w-2xl mx-auto border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {(['overview', 'features', 'analytics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab
                ? 'bg-emerald-500/30 text-emerald-300 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Description with Real Data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-emerald-400 mb-4">
                  Platformă bancară AI pentru România cu servicii financiare inteligente
                </h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-4">
                  Experimentați puterea tehnologiei AI cu platforma noastră avansată,
                  integrată cu sistemul bancar românesc și reglementările BNR.
                </p>
                {insights && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4">
                    <h3 className="text-emerald-400 font-semibold mb-2">Analiza AI Actuală:</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      {insights.aiInsights.map((insight: string, index: number) => (
                        <p key={index}>• {insight}</p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Real-time Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 ${metric.loading ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                        {renderIcon(metric.icon, `w-6 h-6 text-${metric.color}-400`)}
                      </div>
                      <div className={`flex items-center space-x-1 text-${metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'gray'}-400`}>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : metric.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                      <p className="text-gray-300 font-medium">{metric.title}</p>
                    </div>
                    {metric.id === '1' && bankingData && (
                      <p className="text-xs text-gray-400 mt-2">
                        Actualizat: {bankingData.lastUpdated.toLocaleTimeString('ro-RO')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Romanian Banking Information */}
              {romanianData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Informații Bancare România</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">Dobânzi Actuale</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p>Cont Economii: {romanianData.interestRates.savingsAccount.toFixed(1)}%</p>
                        <p>Credit Personal: {romanianData.interestRates.personalLoan.toFixed(1)}%</p>
                        <p>Credit Ipotecar: {romanianData.interestRates.mortgage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold mb-2">Indicatori Economici</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p>Inflație: {romanianData.economicIndicators.inflation.toFixed(1)}%</p>
                        <p>Creștere PIB: {romanianData.economicIndicators.gdpGrowth.toFixed(1)}%</p>
                        <p>Șomaj: {romanianData.economicIndicators.unemployment.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2">Știri Bancare</h4>
                      <div className="space-y-1 text-xs text-gray-300">
                        {romanianData.bankingNews.map((news: string, index: number) => (
                          <p key={index}>• {news}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Exchange Rates */}
              {Object.keys(exchangeRates).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Cursuri Valutare Live</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(exchangeRates).map(([currency, rate]) => {
                      if (typeof rate === 'number') {
                        return (
                          <div key={currency} className="text-center">
                            <div className="text-2xl font-bold text-emerald-400">
                              {currency}
                            </div>
                            <div className="text-sm text-gray-300">
                              {rate.toFixed(4)} RON
                            </div>
                          </div>
                        )
                      }
                      return null;
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {featureCards.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-emerald-500/20">
                          {renderIcon(feature.icon, 'w-6 h-6 text-emerald-400')}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status.replace('-', ' ')}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          logger.logUserAction('feature-learn-more', {
                            module: 'features',
                            context: {
                              featureTitle: feature.title,
                              featureStatus: feature.status,
                              page: 'main-dashboard'
                            }
                          })
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {(activeTab === 'analytics' || activeTab === 'settings') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <h2 className="text-2xl font-bold text-emerald-400 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Panel
              </h2>
              <p className="text-gray-300 mb-6">
                {activeTab === 'analytics'
                  ? 'Advanced analytics and insights for your platform usage and performance metrics.'
                  : 'Configure your platform settings and preferences for optimal performance.'
                }
              </p>
              <button className="bg-gradient-to-r from-emerald-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-purple-600 transition-all font-medium">
                Coming Soon
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
