// Vitest setup file for STOCAI - Basic version without React Testing Library
import { vi } from 'vitest'

// Mock DOM APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// Mock fetch for API tests
globalThis.fetch = vi.fn()

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Setup STOCAI-specific mocks

// Mock financial data APIs
const mockFinancialAPI = {
  getStockData: vi.fn().mockResolvedValue({
    symbol: 'AAPL',
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    volume: 1000000
  }),
  getMarketData: vi.fn().mockResolvedValue({
    indices: {
      DOW: 35000,
      NASDAQ: 14000,
      SP500: 4500
    }
  }),
  getPortfolioData: vi.fn().mockResolvedValue({
    totalValue: 100000,
    dailyChange: 1500,
    positions: []
  })
}

// Mock chart libraries
vi.mock('recharts', () => ({
  LineChart: vi.fn(({ children }) => children),
  Line: vi.fn(),
  XAxis: vi.fn(),
  YAxis: vi.fn(),
  CartesianGrid: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  ResponsiveContainer: vi.fn(({ children }) => children),
  BarChart: vi.fn(({ children }) => children),
  Bar: vi.fn(),
  PieChart: vi.fn(({ children }) => children),
  Pie: vi.fn(),
  Cell: vi.fn()
}))

// Mock financial calculations
const mockFinancialCalculations = {
  calculateReturns: vi.fn((prices) => {
    if (!prices || prices.length < 2) return 0
    const firstPrice = prices[0]
    const lastPrice = prices[prices.length - 1]
    return ((lastPrice - firstPrice) / firstPrice) * 100
  }),
  calculateSharpeRatio: vi.fn((returns: number[], riskFreeRate = 0.02) => {
    const avgReturn = returns.reduce((a: number, b: number) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sq: number, n: number) => sq + Math.pow(n - avgReturn, 2), 0) / returns.length)
    return (avgReturn - riskFreeRate) / stdDev
  }),
  calculateVolatility: vi.fn((prices) => {
    if (!prices || prices.length < 2) return 0
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sq: number, n: number) => sq + Math.pow(n - avgReturn, 2), 0) / returns.length
    return Math.sqrt(variance) * Math.sqrt(252) // Annualized
  })
}

// Mock WebSocket for real-time data
const MockWebSocket = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}))

Object.defineProperty(globalThis, 'WebSocket', {
  value: MockWebSocket,
  writable: true
})

// Mock IndexedDB for local storage
const mockIndexedDB = {
  open: vi.fn().mockResolvedValue({
    transaction: vi.fn().mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        add: vi.fn().mockResolvedValue({}),
        get: vi.fn().mockResolvedValue({}),
        put: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue({})
      })
    }),
    close: vi.fn()
  }),
  deleteDatabase: vi.fn().mockResolvedValue({})
}

Object.defineProperty(globalThis, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
})

// Export mocks for use in tests
export {
  mockFinancialAPI,
  mockFinancialCalculations,
  mockIndexedDB
}
