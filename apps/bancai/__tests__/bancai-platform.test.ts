import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TradingPortfolioService } from '../services/TradingPortfolioService'

// Mock the Azure OpenAI service
vi.mock('@codai/azure-openai', () => ({
  AzureOpenAIService: vi.fn().mockImplementation(() => ({
    generateCompletion: vi.fn().mockResolvedValue('Mocked AI response'),
    healthCheck: vi.fn().mockResolvedValue(true)
  }))
}))

describe('BANCAI Platform Tests', () => {
  let tradingService: TradingPortfolioService

  beforeEach(() => {
    tradingService = new TradingPortfolioService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('TradingPortfolioService', () => {
    describe('getPortfolioAnalytics', () => {
      it('should return comprehensive portfolio analytics', async () => {
        const userId = 'user123'
        const response = await tradingService.getPortfolioAnalytics(userId)

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.analytics).toBeDefined()

        const analytics = response.analytics
        expect(analytics.overview).toBeDefined()
        expect(analytics.overview.totalValue).toBeGreaterThan(0)
        expect(analytics.overview.dailyChange).toBeDefined()
        expect(analytics.overview.totalReturn).toBeDefined()

        expect(analytics.positions).toBeDefined()
        expect(Array.isArray(analytics.positions)).toBe(true)

        expect(analytics.performance).toBeDefined()
        expect(analytics.performance.monthlyReturns).toBeDefined()
        expect(analytics.performance.volatility).toBeDefined()
        expect(analytics.performance.sharpeRatio).toBeDefined()

        expect(analytics.riskMetrics).toBeDefined()
        expect(analytics.riskMetrics.valueAtRisk).toBeDefined()
        expect(analytics.riskMetrics.beta).toBeDefined()
        expect(analytics.riskMetrics.riskScore).toBeGreaterThanOrEqual(1)
        expect(analytics.riskMetrics.riskScore).toBeLessThanOrEqual(10)
      })

      it('should handle empty portfolio', async () => {
        const analytics = await tradingService.getPortfolioAnalytics('empty_user')

        expect(analytics.overview.totalValue).toBe(0)
        expect(analytics.positions).toHaveLength(0)
        expect(analytics.performance.monthlyReturns).toHaveLength(0)
      })

      it('should calculate correct Romanian market exposure', async () => {
        const analytics = await tradingService.getPortfolioAnalytics('user123')

        const romanianStocks = analytics.positions.filter(p =>
          ['BRD', 'TLV', 'SNP', 'FP', 'SNG'].includes(p.symbol)
        )

        expect(romanianStocks.length).toBeGreaterThan(0)

        const totalRomanianValue = romanianStocks.reduce((sum, pos) => sum + pos.marketValue, 0)
        const romanianExposure = (totalRomanianValue / analytics.overview.totalValue) * 100

        expect(romanianExposure).toBeGreaterThan(0)
        expect(romanianExposure).toBeLessThanOrEqual(100)
      })
    })

    describe('generateTradingSignals', () => {
      it('should generate valid trading signals', async () => {
        const signals = await tradingService.generateTradingSignals()

        expect(signals).toBeDefined()
        expect(Array.isArray(signals)).toBe(true)
        expect(signals.length).toBeGreaterThan(0)

        signals.forEach(signal => {
          expect(signal.symbol).toBeDefined()
          expect(signal.action).toMatch(/^(BUY|SELL|HOLD)$/)
          expect(signal.confidence).toBeGreaterThanOrEqual(0)
          expect(signal.confidence).toBeLessThanOrEqual(100)
          expect(signal.reasoning).toBeDefined()
          expect(signal.targetPrice).toBeGreaterThan(0)
          expect(signal.stopLoss).toBeGreaterThan(0)
          expect(signal.timeHorizon).toMatch(/^(short|medium|long)$/)
          expect(signal.riskLevel).toMatch(/^(low|medium|high)$/)
        })
      })

      it('should include Romanian market signals', async () => {
        const signals = await tradingService.generateTradingSignals()

        const romanianSignals = signals.filter(s =>
          ['BRD', 'TLV', 'SNP', 'FP', 'SNG'].includes(s.symbol)
        )

        expect(romanianSignals.length).toBeGreaterThan(0)
      })

      it('should provide conservative signals for banking stocks', async () => {
        const signals = await tradingService.generateTradingSignals()

        const bankingSignals = signals.filter(s =>
          ['BRD', 'TLV'].includes(s.symbol)
        )

        bankingSignals.forEach(signal => {
          // Banking stocks should have more conservative risk levels
          expect(['low', 'medium']).toContain(signal.riskLevel)
        })
      })
    })

    describe('performRiskAssessment', () => {
      it('should perform comprehensive risk assessment', async () => {
        const userId = 'user123'
        const assessment = await tradingService.performRiskAssessment(userId)

        expect(assessment).toBeDefined()
        expect(assessment.overallRisk).toMatch(/^(low|medium|high|very_high)$/)
        expect(assessment.riskScore).toBeGreaterThanOrEqual(1)
        expect(assessment.riskScore).toBeLessThanOrEqual(10)

        expect(assessment.factors).toBeDefined()
        expect(Array.isArray(assessment.factors)).toBe(true)

        expect(assessment.recommendations).toBeDefined()
        expect(Array.isArray(assessment.recommendations)).toBe(true)

        expect(assessment.scenarios).toBeDefined()
        expect(assessment.scenarios.best).toBeDefined()
        expect(assessment.scenarios.worst).toBeDefined()
        expect(assessment.scenarios.expected).toBeDefined()
      })

      it('should identify concentration risk', async () => {
        const assessment = await tradingService.performRiskAssessment('concentrated_user')

        const concentrationFactor = assessment.factors.find(f =>
          f.factor.toLowerCase().includes('concentration') ||
          f.factor.toLowerCase().includes('diversification')
        )

        expect(concentrationFactor).toBeDefined()
      })

      it('should assess Romanian market risk', async () => {
        const assessment = await tradingService.performRiskAssessment('user123')

        const marketRiskFactor = assessment.factors.find(f =>
          f.factor.toLowerCase().includes('market') ||
          f.factor.toLowerCase().includes('romanian')
        )

        expect(marketRiskFactor).toBeDefined()
      })
    })

    describe('generateInvestmentRecommendations', () => {
      it('should generate personalized investment recommendations', async () => {
        const userId = 'user123'
        const recommendations = await tradingService.generateInvestmentRecommendations(userId)

        expect(recommendations).toBeDefined()
        expect(Array.isArray(recommendations)).toBe(true)
        expect(recommendations.length).toBeGreaterThan(0)

        recommendations.forEach(rec => {
          expect(rec.symbol).toBeDefined()
          expect(rec.action).toMatch(/^(BUY|SELL|REBALANCE)$/)
          expect(rec.reasoning).toBeDefined()
          expect(rec.priority).toMatch(/^(low|medium|high)$/)
          expect(rec.expectedReturn).toBeGreaterThan(0)
          expect(rec.riskLevel).toMatch(/^(low|medium|high)$/)
          expect(rec.investmentAmount).toBeGreaterThan(0)
          expect(rec.timeframe).toBeDefined()
        })
      })

      it('should include diversification recommendations', async () => {
        const recommendations = await tradingService.generateInvestmentRecommendations('user123')

        const diversificationRec = recommendations.find(r =>
          r.reasoning.toLowerCase().includes('diversificare') ||
          r.reasoning.toLowerCase().includes('diversification')
        )

        expect(diversificationRec).toBeDefined()
      })

      it('should consider user risk tolerance', async () => {
        const conservativeRecs = await tradingService.generateInvestmentRecommendations('conservative_user')
        const aggressiveRecs = await tradingService.generateInvestmentRecommendations('aggressive_user')

        // Conservative user should get more low-risk recommendations
        const conservativeLowRisk = conservativeRecs.filter(r => r.riskLevel === 'low')
        const aggressiveLowRisk = aggressiveRecs.filter(r => r.riskLevel === 'low')

        expect(conservativeLowRisk.length).toBeGreaterThan(aggressiveLowRisk.length)
      })
    })
  })

  describe('Banking Integration Tests', () => {
    it('should handle Romanian banking holidays', () => {
      const romanianHolidays = [
        '2024-01-01', // New Year
        '2024-01-06', // Epiphany
        '2024-05-01', // Labor Day
        '2024-08-15', // Assumption
        '2024-11-30', // St. Andrew
        '2024-12-01', // National Day
        '2024-12-25', // Christmas
        '2024-12-26'  // Christmas
      ]

      romanianHolidays.forEach(holiday => {
        const date = new Date(holiday)
        const isHoliday = tradingService.isRomanianBankingHoliday(date)
        expect(isHoliday).toBe(true)
      })
    })

    it('should handle Romanian trading hours', () => {
      // BVB trading hours: 10:00 - 17:30 Romania time
      const tradingStart = new Date('2024-01-15T10:00:00+02:00')
      const tradingEnd = new Date('2024-01-15T17:30:00+02:00')
      const afterHours = new Date('2024-01-15T18:00:00+02:00')

      expect(tradingService.isRomanianTradingHours(tradingStart)).toBe(true)
      expect(tradingService.isRomanianTradingHours(tradingEnd)).toBe(true)
      expect(tradingService.isRomanianTradingHours(afterHours)).toBe(false)
    })

    it('should validate Romanian stock symbols', () => {
      const validSymbols = ['BRD', 'TLV', 'SNP', 'FP', 'SNG', 'BVB', 'EL', 'ALR']
      const invalidSymbols = ['INVALID', 'TEST', 'XYZ']

      validSymbols.forEach(symbol => {
        expect(tradingService.isValidRomanianStock(symbol)).toBe(true)
      })

      invalidSymbols.forEach(symbol => {
        expect(tradingService.isValidRomanianStock(symbol)).toBe(false)
      })
    })
  })

  describe('Performance Tests', () => {
    it('should handle large portfolios efficiently', async () => {
      const startTime = Date.now()
      await tradingService.getPortfolioAnalytics('large_portfolio_user')
      const endTime = Date.now()

      // Should complete within 2 seconds for large portfolios
      expect(endTime - startTime).toBeLessThan(2000)
    })

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        tradingService.getPortfolioAnalytics(`user${i}`)
      )

      const startTime = Date.now()
      const results = await Promise.all(promises)
      const endTime = Date.now()

      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result.overview.totalValue).toBeGreaterThanOrEqual(0)
      })

      // All requests should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000)
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const result = await tradingService.getPortfolioAnalytics('invalid_user')

      expect(result).toBeDefined()
      expect(result.overview.totalValue).toBe(0)
      expect(result.positions).toHaveLength(0)
    })

    it('should handle network failures gracefully', async () => {
      // Mock network failure
      vi.spyOn(tradingService, 'fetchMarketData').mockRejectedValue(new Error('Network error'))

      await expect(
        tradingService.generateTradingSignals()
      ).rejects.toThrow('Network error')
    })

    it('should validate input parameters', async () => {
      await expect(
        tradingService.getPortfolioAnalytics('')
      ).rejects.toThrow('User ID is required')

      await expect(
        tradingService.getPortfolioAnalytics(null as any)
      ).rejects.toThrow('User ID is required')
    })
  })

  describe('Security Tests', () => {
    it('should not expose sensitive data in logs', async () => {
      const consoleSpy = vi.spyOn(console, 'log')

      await tradingService.getPortfolioAnalytics('user123')

      const logCalls = consoleSpy.mock.calls.flat().join(' ')

      // Should not log sensitive information
      expect(logCalls).not.toContain('password')
      expect(logCalls).not.toContain('secret')
      expect(logCalls).not.toContain('key')
      expect(logCalls).not.toContain('token')

      consoleSpy.mockRestore()
    })

    it('should sanitize user input', async () => {
      const maliciousInput = '<script>alert("xss")</script>'

      await expect(
        tradingService.getPortfolioAnalytics(maliciousInput)
      ).rejects.toThrow('Invalid user ID format')
    })

    it('should implement rate limiting', async () => {
      // Simulate rapid requests
      const promises = Array.from({ length: 100 }, () =>
        tradingService.generateTradingSignals()
      )

      // Some requests should be rate limited
      const results = await Promise.allSettled(promises)
      const rateLimitedRequests = results.filter(r =>
        r.status === 'rejected' &&
        r.reason.message?.includes('rate limit')
      )

      expect(rateLimitedRequests.length).toBeGreaterThan(0)
    })
  })

  describe('Compliance Tests', () => {
    it('should maintain audit trail', async () => {
      const userId = 'user123'
      await tradingService.getPortfolioAnalytics(userId)

      // Check if audit log was created
      const auditEntry = await tradingService.getAuditLog(userId)
      expect(auditEntry).toBeDefined()
      expect(auditEntry.action).toBe('portfolio_view')
      expect(auditEntry.userId).toBe(userId)
      expect(auditEntry.timestamp).toBeDefined()
    })

    it('should enforce data retention policies', async () => {
      // Test that old data is properly archived/deleted
      const oldDate = new Date('2020-01-01')
      const hasOldData = await tradingService.hasDataOlderThan(oldDate)

      // Should not have data older than retention period (typically 7 years for banking)
      expect(hasOldData).toBe(false)
    })

    it('should validate regulatory compliance', async () => {
      const complianceCheck = await tradingService.checkCompliance()

      expect(complianceCheck.gdprCompliant).toBe(true)
      expect(complianceCheck.bnrCompliant).toBe(true)
      expect(complianceCheck.mifidCompliant).toBe(true)
      expect(complianceCheck.lastAudit).toBeDefined()
    })
  })

  describe('Romanian Market Specific Tests', () => {
    it('should handle RON currency calculations', () => {
      const amount = 1000
      const usdToRon = 4.5

      const converted = tradingService.convertToRON(amount, 'USD', usdToRon)
      expect(converted).toBe(4500)
    })

    it('should apply Romanian tax rules', () => {
      const profit = 10000 // RON
      const tax = tradingService.calculateRomanianCapitalGainsTax(profit)

      // Romanian capital gains tax is typically 10%
      expect(tax).toBe(1000)
    })

    it('should handle Romanian market sectors', () => {
      const sectors = tradingService.getRomanianMarketSectors()

      expect(sectors).toContain('Banking')
      expect(sectors).toContain('Energy')
      expect(sectors).toContain('Telecommunications')
      expect(sectors).toContain('Utilities')
    })
  })
})

// Helper function to add methods to the mock service
declare module '../services/TradingPortfolioService' {
  interface TradingPortfolioService {
    isRomanianBankingHoliday(date: Date): boolean
    isRomanianTradingHours(date: Date): boolean
    isValidRomanianStock(symbol: string): boolean
    fetchMarketData(): Promise<any>
    getAuditLog(userId: string): Promise<any>
    hasDataOlderThan(date: Date): Promise<boolean>
    checkCompliance(): Promise<any>
    convertToRON(amount: number, currency: string, rate: number): number
    calculateRomanianCapitalGainsTax(profit: number): number
    getRomanianMarketSectors(): string[]
  }
}
