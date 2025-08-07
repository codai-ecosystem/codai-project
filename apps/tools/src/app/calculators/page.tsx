'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, Percent, DollarSign, TrendingUp, PieChart, BarChart3,
  Calendar, Clock, Ruler, Thermometer, Zap, Fuel, Home, Car,
  Download, Upload, Copy, Save, Trash2, Eye, EyeOff, Grid, LayoutList,
  Search, Star, History, Settings, RefreshCw, Plus, Edit3, Check, X,
  Hash, Equal, Minus, ArrowRight, ChevronDown, Filter, Target,
  AlertCircle, CheckCircle, Info, Sparkles, Globe, RotateCcw,
  Activity, Archive, Award, Book, Bookmark, Brain, Building,
  FileText, Heart, Layers, MapPin, Monitor, Package, Shield
} from 'lucide-react'

// TypeScript Interfaces
interface CalculatorTool {
  id: string
  name: string
  description: string
  category: string
  icon: any
  usage: number
  rating: number
  lastUsed: string
  featured: boolean
  formula?: string
  examples: string[]
}

interface CalculatorMetrics {
  totalCalculators: number
  activeUsers: string
  calculationsToday: string
  avgCalculationTime: string
  accuracy: number
  popularCategory: string
}

interface CalculationHistory {
  id: string
  calculator: string
  input: string
  result: string
  timestamp: string
  saved: boolean
}

interface CalculatorCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
}

interface ActiveCalculator {
  id: string
  display: string
  memory: number
  operation: string | null
  previousValue: number | null
  waitingForNewValue: boolean
  history: string[]
}

export default function CalculatorsPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeCalculatorId, setActiveCalculatorId] = useState<string | null>('basic-calculator')
  const [showHistory, setShowHistory] = useState(false)
  const [calculator, setCalculator] = useState<ActiveCalculator>({
    id: 'basic-calculator',
    display: '0',
    memory: 0,
    operation: null,
    previousValue: null,
    waitingForNewValue: false,
    history: []
  })

  // Mock Data
  const calculatorMetrics: CalculatorMetrics = {
    totalCalculators: 12,
    activeUsers: '4,892',
    calculationsToday: '23,567',
    avgCalculationTime: '0.8s',
    accuracy: 99.9,
    popularCategory: 'Financial'
  }

  const categories: CalculatorCategory[] = [
    {
      id: 'basic',
      name: 'Basic Math',
      count: 3,
      icon: Calculator,
      color: 'text-blue-600',
      description: 'Essential mathematical calculations'
    },
    {
      id: 'financial',
      name: 'Financial',
      count: 3,
      icon: DollarSign,
      color: 'text-green-600',
      description: 'Financial and investment calculations'
    },
    {
      id: 'conversion',
      name: 'Unit Conversion',
      count: 3,
      icon: RefreshCw,
      color: 'text-purple-600',
      description: 'Convert between different units'
    },
    {
      id: 'specialty',
      name: 'Specialty',
      count: 3,
      icon: Brain,
      color: 'text-orange-600',
      description: 'Specialized scientific calculations'
    }
  ]

  const calculatorTools: CalculatorTool[] = [
    {
      id: 'basic-calculator',
      name: 'Basic Calculator',
      description: 'Standard calculator with basic arithmetic operations',
      category: 'basic',
      icon: Calculator,
      usage: 8945,
      rating: 4.9,
      lastUsed: '1 min ago',
      featured: true,
      examples: ['25 + 75 = 100', '144 ÷ 12 = 12', '15 × 8 = 120']
    },
    {
      id: 'scientific-calculator',
      name: 'Scientific Calculator',
      description: 'Advanced calculator with scientific functions and constants',
      category: 'basic',
      icon: Hash,
      usage: 5672,
      rating: 4.8,
      lastUsed: '3 mins ago',
      featured: true,
      formula: 'sin(x), cos(x), log(x), π, e',
      examples: ['sin(30°) = 0.5', 'log₁₀(100) = 2', 'π × r² = area']
    },
    {
      id: 'percentage-calculator',
      name: 'Percentage Calculator',
      description: 'Calculate percentages, percentage change, and ratios',
      category: 'basic',
      icon: Percent,
      usage: 4234,
      rating: 4.7,
      lastUsed: '5 mins ago',
      featured: false,
      formula: '(part/whole) × 100 = percentage',
      examples: ['25% of 200 = 50', '150 is 75% of 200', '20% increase: 100 → 120']
    },
    {
      id: 'loan-calculator',
      name: 'Loan Calculator',
      description: 'Calculate monthly payments, total interest, and amortization',
      category: 'financial',
      icon: Home,
      usage: 6789,
      rating: 4.8,
      lastUsed: '2 mins ago',
      featured: true,
      formula: 'M = P[r(1+r)ⁿ]/[(1+r)ⁿ-1]',
      examples: ['$300k loan @ 4.5% = $1,520/mo', '$50k car @ 6% = $483/mo']
    },
    {
      id: 'investment-calculator',
      name: 'Investment Calculator',
      description: 'Calculate compound interest, ROI, and investment growth',
      category: 'financial',
      icon: TrendingUp,
      usage: 5234,
      rating: 4.6,
      lastUsed: '4 mins ago',
      featured: true,
      formula: 'A = P(1 + r/n)ⁿᵗ',
      examples: ['$10k @ 7% × 10yrs = $19,672', '$500/mo × 20yrs = $245,971']
    },
    {
      id: 'tax-calculator',
      name: 'Tax Calculator',
      description: 'Calculate income tax, deductions, and take-home pay',
      category: 'financial',
      icon: FileText,
      usage: 3456,
      rating: 4.5,
      lastUsed: '8 mins ago',
      featured: false,
      formula: 'Tax = (Income - Deductions) × Rate',
      examples: ['$75k income = $12,500 tax', '22% bracket × $60k = $13,200']
    },
    {
      id: 'unit-converter',
      name: 'Unit Converter',
      description: 'Convert length, weight, temperature, and volume units',
      category: 'conversion',
      icon: Ruler,
      usage: 7234,
      rating: 4.7,
      lastUsed: '6 mins ago',
      featured: true,
      examples: ['100°F = 37.8°C', '5 miles = 8.05 km', '1 gallon = 3.785 liters']
    },
    {
      id: 'currency-converter',
      name: 'Currency Converter',
      description: 'Real-time currency exchange rates and conversion',
      category: 'conversion',
      icon: Globe,
      usage: 4567,
      rating: 4.6,
      lastUsed: '7 mins ago',
      featured: false,
      examples: ['$100 USD = €85.50 EUR', '£50 GBP = $62.35 USD', '¥1000 JPY = $6.78 USD']
    },
    {
      id: 'time-converter',
      name: 'Time Zone Converter',
      description: 'Convert time between different time zones worldwide',
      category: 'conversion',
      icon: Clock,
      usage: 2345,
      rating: 4.4,
      lastUsed: '12 mins ago',
      featured: false,
      examples: ['3 PM EST = 8 PM GMT', '9 AM PST = 6 PM CET', '12 PM UTC = 7 AM PST']
    },
    {
      id: 'bmi-calculator',
      name: 'BMI Calculator',
      description: 'Calculate Body Mass Index and health recommendations',
      category: 'specialty',
      icon: Heart,
      usage: 3789,
      rating: 4.5,
      lastUsed: '9 mins ago',
      featured: false,
      formula: 'BMI = weight(kg) / height(m)²',
      examples: ['70kg, 175cm = BMI 22.9', '150lbs, 5\'6" = BMI 24.2']
    },
    {
      id: 'grade-calculator',
      name: 'Grade Calculator',
      description: 'Calculate GPA, weighted grades, and academic performance',
      category: 'specialty',
      icon: Book,
      usage: 2567,
      rating: 4.3,
      lastUsed: '15 mins ago',
      featured: false,
      formula: 'GPA = Σ(Grade Points × Credits) / Total Credits',
      examples: ['A=4.0, B=3.0, C=2.0', '3.75 GPA = Magna Cum Laude']
    },
    {
      id: 'calorie-calculator',
      name: 'Calorie Calculator',
      description: 'Calculate daily caloric needs and macro nutrients',
      category: 'specialty',
      icon: Activity,
      usage: 4123,
      rating: 4.4,
      lastUsed: '11 mins ago',
      featured: false,
      formula: 'BMR × Activity Level = Daily Calories',
      examples: ['Male, 30yrs, 180lbs = 2,400 cal/day', 'Female, 25yrs, 140lbs = 1,800 cal/day']
    }
  ]

  const calculationHistory: CalculationHistory[] = [
    {
      id: '1',
      calculator: 'Basic Calculator',
      input: '1,250 + 875',
      result: '2,125',
      timestamp: '2 mins ago',
      saved: true
    },
    {
      id: '2',
      calculator: 'Loan Calculator',
      input: '$350k @ 4.2% × 30yr',
      result: '$1,712/month',
      timestamp: '8 mins ago',
      saved: false
    },
    {
      id: '3',
      calculator: 'Unit Converter',
      input: '85°F to Celsius',
      result: '29.4°C',
      timestamp: '15 mins ago',
      saved: true
    },
    {
      id: '4',
      calculator: 'Investment Calculator',
      input: '$500/mo × 25yrs @ 8%',
      result: '$394,772',
      timestamp: '22 mins ago',
      saved: true
    }
  ]

  // Filter tools based on search and category
  const filteredTools = calculatorTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculator Logic
  const inputNumber = (num: string) => {
    if (calculator.waitingForNewValue) {
      setCalculator(prev => ({
        ...prev,
        display: num,
        waitingForNewValue: false
      }))
    } else {
      setCalculator(prev => ({
        ...prev,
        display: prev.display === '0' ? num : prev.display + num
      }))
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calculator.display)

    if (calculator.previousValue === null) {
      setCalculator(prev => ({
        ...prev,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForNewValue: true
      }))
    } else if (calculator.operation) {
      const currentValue = calculator.previousValue || 0
      const newValue = calculate(currentValue, inputValue, calculator.operation)

      setCalculator(prev => ({
        ...prev,
        display: String(newValue),
        previousValue: newValue,
        operation: nextOperation,
        waitingForNewValue: true,
        history: [...prev.history, `${currentValue} ${calculator.operation} ${inputValue} = ${newValue}`]
      }))
    }
  }

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '×':
        return firstValue * secondValue
      case '÷':
        return firstValue / secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = parseFloat(calculator.display)

    if (calculator.previousValue !== null && calculator.operation) {
      const newValue = calculate(calculator.previousValue, inputValue, calculator.operation)
      
      setCalculator(prev => ({
        ...prev,
        display: String(newValue),
        previousValue: null,
        operation: null,
        waitingForNewValue: true,
        history: [...prev.history, `${calculator.previousValue} ${calculator.operation} ${inputValue} = ${newValue}`]
      }))
    }
  }

  const clearCalculator = () => {
    setCalculator(prev => ({
      ...prev,
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false
    }))
  }

  const clearAllCalculator = () => {
    setCalculator({
      id: 'basic-calculator',
      display: '0',
      memory: 0,
      operation: null,
      previousValue: null,
      waitingForNewValue: false,
      history: []
    })
  }

  // Switch active calculator
  const switchCalculator = (toolId: string) => {
    setActiveCalculatorId(toolId)
    if (toolId !== 'basic-calculator') {
      // Switch to specialized calculator interface
      setCalculator(prev => ({
        ...prev,
        id: toolId,
        display: '0'
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Enhanced Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Calculators</h1>
                      <p className="text-green-100 text-lg">Advanced Mathematical & Utility Calculator Suite</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{calculatorMetrics.totalCalculators}</div>
                        <div className="text-green-100 text-sm">Calculators</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{calculatorMetrics.calculationsToday}</div>
                        <div className="text-green-100 text-sm">Calculations</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{calculatorMetrics.accuracy}%</div>
                        <div className="text-green-100 text-sm">Accuracy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interactive Calculator Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Interactive Calculator</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      showHistory ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    History
                  </button>
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg: {calculatorMetrics.avgCalculationTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calculator Display */}
                <div className="lg:col-span-2">
                  <div className="bg-black rounded-xl p-6 mb-4">
                    <div className="text-right">
                      <div className="text-4xl font-mono text-green-400 mb-2">
                        {calculator.display}
                      </div>
                      {calculator.operation && calculator.previousValue !== null && (
                        <div className="text-sm text-gray-400 font-mono">
                          {calculator.previousValue} {calculator.operation}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Calculator Buttons */}
                  <div className="grid grid-cols-4 gap-3">
                    {/* Row 1 */}
                    <button
                      onClick={clearAllCalculator}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      AC
                    </button>
                    <button
                      onClick={clearCalculator}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      C
                    </button>
                    <button
                      onClick={() => setCalculator(prev => ({ ...prev, display: prev.display.slice(0, -1) || '0' }))}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      ⌫
                    </button>
                    <button
                      onClick={() => inputOperation('÷')}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      ÷
                    </button>
                    
                    {/* Row 2 */}
                    <button
                      onClick={() => inputNumber('7')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      7
                    </button>
                    <button
                      onClick={() => inputNumber('8')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      8
                    </button>
                    <button
                      onClick={() => inputNumber('9')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      9
                    </button>
                    <button
                      onClick={() => inputOperation('×')}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      ×
                    </button>
                    
                    {/* Row 3 */}
                    <button
                      onClick={() => inputNumber('4')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      4
                    </button>
                    <button
                      onClick={() => inputNumber('5')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      5
                    </button>
                    <button
                      onClick={() => inputNumber('6')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      6
                    </button>
                    <button
                      onClick={() => inputOperation('-')}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      −
                    </button>
                    
                    {/* Row 4 */}
                    <button
                      onClick={() => inputNumber('1')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      1
                    </button>
                    <button
                      onClick={() => inputNumber('2')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      2
                    </button>
                    <button
                      onClick={() => inputNumber('3')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      3
                    </button>
                    <button
                      onClick={() => inputOperation('+')}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      +
                    </button>
                    
                    {/* Row 5 */}
                    <button
                      onClick={() => inputNumber('0')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors col-span-2"
                    >
                      0
                    </button>
                    <button
                      onClick={() => inputNumber('.')}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      .
                    </button>
                    <button
                      onClick={performCalculation}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 font-semibold transition-colors"
                    >
                      =
                    </button>
                  </div>
                </div>
                
                {/* Calculator History */}
                <div className="space-y-4">
                  {showHistory && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Calculation History</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {calculator.history.slice(-10).reverse().map((calc, index) => (
                          <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                            {calc}
                          </div>
                        ))}
                        {calculator.history.length === 0 && (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No calculations yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Calculations</span>
                        <span className="font-semibold">{calculator.history.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Memory</span>
                        <span className="font-semibold">{calculator.memory}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mode</span>
                        <span className="font-semibold">Standard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search calculators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex bg-white/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Categories Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {categories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
                      selectedCategory === category.id 
                        ? 'bg-green-500 text-white border-green-600 shadow-lg' 
                        : 'bg-white/70 backdrop-blur-sm border-white/50 hover:border-green-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className={`h-8 w-8 ${
                        selectedCategory === category.id ? 'text-white' : category.color
                      }`} />
                      <div className={`text-right ${
                        selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="text-2xl font-bold">{category.count}</div>
                        <div className={`text-sm ${
                          selectedCategory === category.id ? 'text-green-100' : 'text-gray-600'
                        }`}>Calculators</div>
                      </div>
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${
                      selectedCategory === category.id ? 'text-green-100' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Calculator Tools Grid */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Available Calculators</h3>
                    <div className="text-sm text-gray-600">{filteredTools.length} calculators</div>
                  </div>
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTools.map((tool, index) => {
                        const IconComponent = tool.icon
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="group p-6 bg-white/50 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-200">
                                  <IconComponent className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                    {tool.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span className="text-xs text-gray-600">{tool.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-600">{tool.usage} uses</span>
                                  </div>
                                </div>
                              </div>
                              {tool.featured && (
                                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                                  Featured
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                            
                            {tool.formula && (
                              <div className="bg-gray-100 rounded-lg p-2 mb-3">
                                <code className="text-xs text-gray-700">{tool.formula}</code>
                              </div>
                            )}
                            
                            <div className="space-y-1 mb-4">
                              <div className="text-xs text-gray-500 font-medium">Examples:</div>
                              {tool.examples.slice(0, 2).map((example, idx) => (
                                <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                  {example}
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Last used: {tool.lastUsed}</span>
                              <button
                                onClick={() => switchCalculator(tool.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                                  activeCalculatorId === tool.id
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                }`}
                              >
                                {activeCalculatorId === tool.id ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <Calculator className="h-4 w-4" />
                                    Use
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTools.map((tool, index) => {
                        const IconComponent = tool.icon
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                                <p className="text-sm text-gray-600">{tool.description}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">{tool.rating}</span>
                                  </div>
                                  <span className="text-xs text-gray-600">{tool.usage} uses</span>
                                  {tool.formula && (
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tool.formula}</code>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => switchCalculator(tool.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                activeCalculatorId === tool.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                              }`}
                            >
                              {activeCalculatorId === tool.id ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Calculator className="h-4 w-4" />
                                  Use
                                </>
                              )}
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Calculations & Stats */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Calculations</h3>
                    <RefreshCw className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {calculationHistory.map((calc, index) => (
                      <motion.div
                        key={calc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-4 bg-white/50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{calc.calculator}</h4>
                          <div className="flex items-center gap-2">
                            {calc.saved && (
                              <Bookmark className="h-3 w-3 text-blue-500 fill-current" />
                            )}
                            <span className="text-xs text-gray-500">{calc.timestamp}</span>
                          </div>
                        </div>
                        
                        <div className="font-mono text-sm">
                          <div className="text-gray-600">{calc.input}</div>
                          <div className="text-green-600 font-semibold">= {calc.result}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Calculator Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Calculator Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-lg font-semibold text-gray-900">{calculatorMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Time</span>
                      <span className="text-lg font-semibold text-gray-900">{calculatorMetrics.avgCalculationTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accuracy</span>
                      <span className="text-lg font-semibold text-green-600">{calculatorMetrics.accuracy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Popular Category</span>
                      <span className="text-lg font-semibold text-emerald-600">{calculatorMetrics.popularCategory}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Modern Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Brain className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Calculations</h3>
                <p className="text-blue-100 text-sm mb-4">
                  AI-powered mathematical operations with intelligent suggestions and error detection.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Explore AI
                </button>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Financial Planning</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Comprehensive financial calculators for loans, investments, and retirement planning.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Plan Finances
                </button>
              </div>

              <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Globe className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Global Conversions</h3>
                <p className="text-teal-100 text-sm mb-4">
                  Real-time currency exchange, unit conversions, and international calculations.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Convert Units
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
