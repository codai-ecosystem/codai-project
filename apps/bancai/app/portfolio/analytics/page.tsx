'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TradingPortfolioService, Portfolio, TradingSignal, MarketData } from '../../../services/TradingPortfolioService'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Shield,
  AlertTriangle,
  Star,
  Activity,
  Zap,
  Brain,
  Calculator,
  Settings
} from 'lucide-react'

const PortfolioAnalytics = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [riskAssessment, setRiskAssessment] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const tradingService = new TradingPortfolioService()

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)

      // Simulate portfolio data loading
      const portfolioData: Portfolio = {
        id: 'portfolio_1',
        userId: 'user_123',
        name: 'Portofoliul Principal',
        totalValue: 185750,
        currency: 'RON',
        positions: [
          {
            id: '1',
            portfolioId: 'portfolio_1',
            symbol: 'BRD',
            name: 'BRD Groupe Societe Generale',
            quantity: 1500,
            averageCost: 16.20,
            currentPrice: 17.85,
            marketValue: 26775,
            unrealizedPL: 2475,
            unrealizedPLPercent: 10.18,
            weight: 0.144,
            lastUpdated: new Date(),
            sector: 'Financial Services',
            exchange: 'BVB'
          },
          {
            id: '2',
            portfolioId: 'portfolio_1',
            symbol: 'TLV',
            name: 'Banca Transilvania',
            quantity: 2000,
            averageCost: 22.50,
            currentPrice: 24.10,
            marketValue: 48200,
            unrealizedPL: 3200,
            unrealizedPLPercent: 7.11,
            weight: 0.259,
            lastUpdated: new Date(),
            sector: 'Financial Services',
            exchange: 'BVB'
          },
          {
            id: '3',
            portfolioId: 'portfolio_1',
            symbol: 'SNP',
            name: 'OMV Petrom',
            quantity: 5000,
            averageCost: 0.68,
            currentPrice: 0.74,
            marketValue: 3700,
            unrealizedPL: 300,
            unrealizedPLPercent: 8.82,
            weight: 0.020,
            lastUpdated: new Date(),
            sector: 'Energy',
            exchange: 'BVB'
          }
        ],
        performance: {
          totalReturn: 12500,
          totalReturnPercent: 7.22,
          dayChange: 520,
          dayChangePercent: 0.28,
          weekChange: 1850,
          monthChange: 4200,
          yearChange: 12500,
          sharpeRatio: 1.68,
          volatility: 0.15,
          maxDrawdown: -0.08,
          alpha: 0.12,
          beta: 0.98
        },
        riskProfile: {
          riskScore: 68,
          riskLevel: 'Moderate',
          diversificationScore: 75,
          concentrationRisk: 0.18,
          volatilityRisk: 0.15,
          liquidityRisk: 0.04,
          recommendations: [
            'Considerați diversificarea prin adăugarea de acțiuni din sectorul tehnologic',
            'Monitorizați concentrația în serviciile financiare (40% din portofoliu)',
            'Evaluați oportunități în obligațiuni guvernamentale pentru stabilitate'
          ]
        },
        createdAt: new Date('2023-06-15'),
        lastUpdated: new Date()
      }

      setPortfolio(portfolioData)

      // Load analytics
      const analyticsResult = await tradingService.getPortfolioAnalytics('portfolio_1')
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.analytics)
      }

      // Load trading signals
      const signalsResult = await tradingService.generateTradingSignals(['BRD', 'TLV', 'SNP', 'FP', 'EL'])
      if (signalsResult.success) {
        setSignals(signalsResult.signals || [])
      }

      // Load risk assessment
      const riskResult = await tradingService.performRiskAssessment('portfolio_1')
      if (riskResult.success) {
        setRiskAssessment(riskResult.riskAssessment)
      }

      // Load investment recommendations
      const recResult = await tradingService.generateInvestmentRecommendations('user_123', 'moderate', ['growth', 'income'])
      if (recResult.success) {
        setRecommendations(recResult.recommendations)
      }

    } catch (error) {
      console.error('Error loading portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'RON') => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Conservative': return 'text-green-500'
      case 'Moderate': return 'text-yellow-500'
      case 'Aggressive': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-500 bg-green-500/20'
      case 'SELL': return 'text-red-500 bg-red-500/20'
      case 'HOLD': return 'text-yellow-500 bg-yellow-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Încărcare analiză portofoliu...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">Analiză Portofoliu</h1>
              <p className="text-gray-400 mt-1">Analitică avansată și recomandări AI pentru investiții</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {portfolio && formatCurrency(portfolio.totalValue)}
                </div>
                <div className={`text-sm ${(portfolio?.performance.dayChange || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio && formatPercent(portfolio.performance.dayChangePercent)} astăzi
                </div>
              </div>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 border border-white/10">
          {[
            { id: 'overview', name: 'Prezentare Generală', icon: PieChart },
            { id: 'performance', name: 'Performanță', icon: TrendingUp },
            { id: 'risk', name: 'Analiză Risc', icon: Shield },
            { id: 'signals', name: 'Semnale Trading', icon: Zap },
            { id: 'recommendations', name: 'Recomandări AI', icon: Brain }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-emerald-500/30 text-emerald-300 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'overview' && portfolio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                  <span className={`text-sm ${portfolio.performance.totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(portfolio.performance.totalReturnPercent)}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(portfolio.totalValue)}
                </div>
                <div className="text-gray-400 text-sm">Valoare Totală</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <span className="text-sm text-green-400">+{portfolio.performance.sharpeRatio}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(portfolio.performance.totalReturn)}
                </div>
                <div className="text-gray-400 text-sm">Profit Total</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8 text-yellow-400" />
                  <span className={`text-sm ${getRiskColor(portfolio.riskProfile.riskLevel)}`}>
                    {portfolio.riskProfile.riskLevel}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolio.riskProfile.riskScore}/100
                </div>
                <div className="text-gray-400 text-sm">Scor Risc</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-purple-400">{portfolio.riskProfile.diversificationScore}%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {portfolio.positions.length}
                </div>
                <div className="text-gray-400 text-sm">Poziții Active</div>
              </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Poziții Portofoliu</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-gray-400">Simbol</th>
                      <th className="text-left py-3 text-gray-400">Nume</th>
                      <th className="text-right py-3 text-gray-400">Cantitate</th>
                      <th className="text-right py-3 text-gray-400">Preț Mediu</th>
                      <th className="text-right py-3 text-gray-400">Preț Curent</th>
                      <th className="text-right py-3 text-gray-400">Valoare</th>
                      <th className="text-right py-3 text-gray-400">P&L</th>
                      <th className="text-right py-3 text-gray-400">Pondere</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.positions.map((position) => (
                      <tr key={position.id} className="border-b border-white/5">
                        <td className="py-4">
                          <div className="font-semibold text-white">{position.symbol}</div>
                          <div className="text-sm text-gray-400">{position.exchange}</div>
                        </td>
                        <td className="py-4">
                          <div className="text-white">{position.name}</div>
                          <div className="text-sm text-gray-400">{position.sector}</div>
                        </td>
                        <td className="py-4 text-right text-white">{position.quantity.toLocaleString()}</td>
                        <td className="py-4 text-right text-white">{formatCurrency(position.averageCost)}</td>
                        <td className="py-4 text-right text-white">{formatCurrency(position.currentPrice)}</td>
                        <td className="py-4 text-right text-white">{formatCurrency(position.marketValue)}</td>
                        <td className={`py-4 text-right ${position.unrealizedPL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(position.unrealizedPL)}
                          <div className="text-sm">({formatPercent(position.unrealizedPLPercent)})</div>
                        </td>
                        <td className="py-4 text-right text-white">{(position.weight * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'signals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white">Semnale Trading AI</h3>
            <div className="grid gap-6">
              {signals.map((signal, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-xl font-bold text-white">{signal.symbol}</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalColor(signal.action)}`}>
                        {signal.action}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">{signal.confidence}%</div>
                      <div className="text-sm text-gray-400">Încredere</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Preț Țintă</div>
                      <div className="text-white font-semibold">{formatCurrency(signal.targetPrice)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Stop Loss</div>
                      <div className="text-white font-semibold">{formatCurrency(signal.stopLoss)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Risc</div>
                      <div className="text-white font-semibold">{signal.riskLevel}/10</div>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">{signal.reasoning}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'risk' && riskAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white">Analiză Detaliată de Risc</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">Risc General</h4>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{riskAssessment.overallRisk}/100</div>
                <div className="text-gray-400 text-sm">Scor risc portofoliu</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="w-6 h-6 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Concentrare</h4>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{(riskAssessment.concentrationRisk * 100).toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Risc concentrare</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-red-400" />
                  <h4 className="text-lg font-semibold text-white">Volatilitate</h4>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{(riskAssessment.volatilityRisk * 100).toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Volatilitate anualizată</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Analiză de Scenariu</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-green-400 text-lg font-semibold">Piață Bullish</div>
                  <div className="text-white text-xl">{formatCurrency(riskAssessment.scenarioAnalysis.bullMarket)}</div>
                  <div className="text-gray-400 text-sm">+25% piață</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-lg font-semibold">Piață Bearish</div>
                  <div className="text-white text-xl">{formatCurrency(riskAssessment.scenarioAnalysis.bearMarket)}</div>
                  <div className="text-gray-400 text-sm">-25% piață</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 text-lg font-semibold">Criză</div>
                  <div className="text-white text-xl">{formatCurrency(riskAssessment.scenarioAnalysis.crisis)}</div>
                  <div className="text-gray-400 text-sm">-40% piață</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && recommendations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white">Recomandări Investiționale AI</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Acțiuni Recomandate</h4>
                </div>
                <div className="space-y-3">
                  {recommendations.aiRecommendations.recommendedAssets.map((asset: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white font-medium">{asset}</span>
                      <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                  <h4 className="text-lg font-semibold text-white">Alocare Sugerată</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Acțiuni</span>
                    <span className="text-white font-semibold">{(recommendations.aiRecommendations.allocationSuggestion.stocks * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Obligațiuni</span>
                    <span className="text-white font-semibold">{(recommendations.aiRecommendations.allocationSuggestion.bonds * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Plan de Acțiune</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h5 className="text-emerald-400 font-semibold mb-2">Acțiuni Imediate</h5>
                  <ul className="space-y-2">
                    {recommendations.actionPlan.immediateActions.map((action: string, index: number) => (
                      <li key={index} className="text-gray-300 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-yellow-400 font-semibold mb-2">Termen Scurt</h5>
                  <ul className="space-y-2">
                    {recommendations.actionPlan.shortTerm.map((action: string, index: number) => (
                      <li key={index} className="text-gray-300 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-purple-400 font-semibold mb-2">Termen Lung</h5>
                  <ul className="space-y-2">
                    {recommendations.actionPlan.longTerm.map((action: string, index: number) => (
                      <li key={index} className="text-gray-300 text-sm">• {action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PortfolioAnalytics
