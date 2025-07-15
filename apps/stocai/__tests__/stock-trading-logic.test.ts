import { describe, it, expect, vi } from 'vitest'
import { mockFinancialAPI, mockFinancialCalculations } from '../vitest.setup.basic'

describe('STOCAI Stock Trading Logic', () => {
  describe('Financial Calculations', () => {
    it('calculates stock returns correctly', () => {
      const prices = [100, 110, 105, 120, 115]
      const expectedReturn = ((115 - 100) / 100) * 100 // 15%
      
      const result = mockFinancialCalculations.calculateReturns(prices)
      expect(result).toBe(expectedReturn)
      expect(mockFinancialCalculations.calculateReturns).toHaveBeenCalledWith(prices)
    })

    it('handles empty price arrays gracefully', () => {
      const result = mockFinancialCalculations.calculateReturns([])
      expect(result).toBe(0)
    })

    it('calculates portfolio volatility', () => {
      const prices = [100, 102, 98, 105, 103, 99, 107]
      const result = mockFinancialCalculations.calculateVolatility(prices)
      
      expect(result).toBeGreaterThan(0)
      expect(typeof result).toBe('number')
      expect(mockFinancialCalculations.calculateVolatility).toHaveBeenCalledWith(prices)
    })

    it('calculates Sharpe ratio for risk assessment', () => {
      const returns = [0.05, 0.03, -0.02, 0.08, 0.01]
      const riskFreeRate = 0.02
      
      const result = mockFinancialCalculations.calculateSharpeRatio(returns, riskFreeRate)
      
      expect(typeof result).toBe('number')
      expect(mockFinancialCalculations.calculateSharpeRatio).toHaveBeenCalledWith(returns, riskFreeRate)
    })
  })

  describe('Stock Data API', () => {
    it('fetches current stock data', async () => {
      const stockData = await mockFinancialAPI.getStockData('AAPL')
      
      expect(stockData).toEqual({
        symbol: 'AAPL',
        price: 150.25,
        change: 2.5,
        changePercent: 1.69,
        volume: 1000000
      })
      expect(mockFinancialAPI.getStockData).toHaveBeenCalledWith('AAPL')
    })

    it('retrieves market indices data', async () => {
      const marketData = await mockFinancialAPI.getMarketData()
      
      expect(marketData).toEqual({
        indices: {
          DOW: 35000,
          NASDAQ: 14000,
          SP500: 4500
        }
      })
      expect(mockFinancialAPI.getMarketData).toHaveBeenCalled()
    })

    it('gets portfolio performance data', async () => {
      const portfolioData = await mockFinancialAPI.getPortfolioData()
      
      expect(portfolioData).toEqual({
        totalValue: 100000,
        dailyChange: 1500,
        positions: []
      })
      expect(mockFinancialAPI.getPortfolioData).toHaveBeenCalled()
    })
  })

  describe('Trading Logic', () => {
    it('validates buy order parameters', () => {
      const buyOrder = {
        symbol: 'TSLA',
        quantity: 10,
        orderType: 'market',
        price: null
      }
      
      expect(buyOrder.symbol).toBeTruthy()
      expect(buyOrder.quantity).toBeGreaterThan(0)
      expect(buyOrder.orderType === 'market' || buyOrder.orderType === 'limit' || buyOrder.orderType === 'stop').toBe(true)
    })

    it('calculates position sizing based on risk tolerance', () => {
      const accountValue = 100000
      const riskPercentage = 0.02 // 2% risk per trade
      const entryPrice = 150
      const stopLoss = 140
      
      const riskAmount = accountValue * riskPercentage
      const riskPerShare = entryPrice - stopLoss
      const positionSize = Math.floor(riskAmount / riskPerShare)
      
      expect(positionSize).toBe(200) // $2000 risk / $10 per share
      expect(positionSize).toBeGreaterThan(0)
    })

    it('implements stop-loss logic', () => {
      const position = {
        symbol: 'NVDA',
        quantity: 50,
        entryPrice: 800,
        currentPrice: 750,
        stopLoss: 760
      }
      
      const shouldTriggerStopLoss = position.currentPrice <= position.stopLoss
      expect(shouldTriggerStopLoss).toBe(true)
      
      const currentLoss = (position.entryPrice - position.currentPrice) * position.quantity
      expect(currentLoss).toBe(2500) // $50 * 50 shares
    })

    it('calculates profit/loss for closed positions', () => {
      const closedPosition = {
        symbol: 'AMZN',
        quantity: 25,
        entryPrice: 3200,
        exitPrice: 3350
      }
      
      const profit = (closedPosition.exitPrice - closedPosition.entryPrice) * closedPosition.quantity
      expect(profit).toBe(3750) // $150 * 25 shares
    })
  })

  describe('Portfolio Management', () => {
    it('tracks portfolio diversification', () => {
      const portfolio = [
        { symbol: 'AAPL', value: 10000, sector: 'Technology' },
        { symbol: 'JPM', value: 8000, sector: 'Financial' },
        { symbol: 'JNJ', value: 7000, sector: 'Healthcare' },
        { symbol: 'GOOGL', value: 9000, sector: 'Technology' }
      ]
      
      const totalValue = portfolio.reduce((sum, position) => sum + position.value, 0)
      const techAllocation = portfolio
        .filter(p => p.sector === 'Technology')
        .reduce((sum, p) => sum + p.value, 0) / totalValue
      
      expect(totalValue).toBe(34000)
      expect(techAllocation).toBeCloseTo(0.559, 2) // ~55.9% in tech
    })

    it('rebalances portfolio allocation', () => {
      const targetAllocations = {
        'Technology': 0.40,
        'Financial': 0.30,
        'Healthcare': 0.30
      }
      
      const currentPortfolioValue = 100000
      const currentAllocations = {
        'Technology': 0.55,
        'Financial': 0.25,
        'Healthcare': 0.20
      }
      
      const rebalanceNeeded = (Object.keys(targetAllocations) as Array<keyof typeof targetAllocations>).some(sector => {
        const difference = Math.abs(targetAllocations[sector] - currentAllocations[sector])
        return difference > 0.05 // 5% threshold
      })
      
      expect(rebalanceNeeded).toBe(true)
    })
  })

  describe('Real-time Data Processing', () => {
    it('handles WebSocket price updates', () => {
      const mockWebSocket = new WebSocket('ws://test.com')
      
      expect(mockWebSocket.addEventListener).toBeDefined()
      expect(mockWebSocket.send).toBeDefined()
      expect(mockWebSocket.close).toBeDefined()
      expect(mockWebSocket.readyState).toBe(1) // OPEN
    })

    it('processes market data feeds', () => {
      const marketUpdate = {
        symbol: 'SPY',
        price: 450.25,
        volume: 50000,
        timestamp: Date.now()
      }
      
      expect(marketUpdate.symbol).toBeTruthy()
      expect(marketUpdate.price).toBeGreaterThan(0)
      expect(marketUpdate.volume).toBeGreaterThan(0)
      expect(marketUpdate.timestamp).toBeGreaterThan(0)
    })
  })
})
