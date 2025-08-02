'use client'

import { useState } from 'react'
import {
  Calculator,
  TrendingUp,
  Shield,
  CreditCard,
  BarChart3,
  DollarSign,
  Bot,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react'

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Financial Analysis AI",
      description: "Advanced portfolio analysis, risk assessment, and market predictions powered by AI",
      details: "Real-time market analysis, portfolio optimization, and investment insights"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Automated Loan Processing",
      description: "Streamline loan approval with AI-powered credit scoring and risk evaluation",
      details: "Instant credit decisions, risk profiling, and compliance checking"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Fraud Detection",
      description: "Real-time transaction monitoring and fraud prevention using machine learning",
      details: "24/7 monitoring, anomaly detection, and automated risk alerts"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Investment Advisory",
      description: "AI-powered investment recommendations and portfolio optimization",
      details: "Personalized strategies, market timing, and risk management"
    }
  ]

  const stats = [
    { label: "Financial Institutions", value: "500+", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Fraud Detection Rate", value: "99.8%", icon: <Shield className="h-5 w-5" /> },
    { label: "Processing Time Reduction", value: "85%", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Cost Savings", value: "$2M+", icon: <Calculator className="h-5 w-5" /> }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-bancai-600 p-2 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">BancAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-bancai-600 transition-colors">Features</a>
              <a href="#solutions" className="text-gray-600 hover:text-bancai-600 transition-colors">Solutions</a>
              <a href="#pricing" className="text-gray-600 hover:text-bancai-600 transition-colors">Pricing</a>
              <a href="/api/health" className="text-gray-600 hover:text-bancai-600 transition-colors">API</a>
              <button className="bg-bancai-600 hover:bg-bancai-700 text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-bancai-600 via-bancai-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-yellow-300 mr-2" />
              <span className="bg-yellow-300 text-bancai-800 px-3 py-1 rounded-full text-sm font-semibold">
                AI-Powered Financial Solutions
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="text-yellow-300"> Financial Operations</span>
              <br />with AI
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Advanced artificial intelligence solutions for banking, fintech, and financial institutions.
              Automate processes, reduce risk, and enhance decision-making.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-bancai-800 font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105 flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-bancai-700 font-semibold px-8 py-4 rounded-lg transition-all">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-bancai-100 p-3 rounded-full text-bancai-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features for Financial Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive suite of AI-powered tools designed specifically for the financial industry
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${activeFeature === index
                      ? 'bg-bancai-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-900 hover:shadow-md'
                    }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${activeFeature === index ? 'bg-white text-bancai-600' : 'bg-bancai-100 text-bancai-600'
                      }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className={activeFeature === index ? 'text-blue-100' : 'text-gray-600'}>
                        {feature.description}
                      </p>
                      {activeFeature === index && (
                        <div className="mt-3 text-sm text-blue-100">
                          {feature.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <div className="bg-bancai-100 p-4 rounded-full inline-block mb-4">
                  {features[activeFeature].icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {features[activeFeature].title}
                </h3>
                <p className="text-gray-600">
                  {features[activeFeature].details}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-bancai-600 mr-2" />
                  Real-time processing and analysis
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-bancai-600 mr-2" />
                  Enterprise-grade security and compliance
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-bancai-600 mr-2" />
                  Seamless API integration
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-bancai-600 mr-2" />
                  24/7 monitoring and support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bancai-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Financial Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of financial institutions already using BancAI to enhance their operations and reduce risk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-yellow-400 hover:bg-yellow-500 text-bancai-800 font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-bancai-700 font-semibold px-8 py-4 rounded-lg transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-bancai-600 p-2 rounded-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">BancAI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Advanced AI solutions for the financial industry. Empowering banks and fintech companies
                with cutting-edge artificial intelligence technology.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 BancAI. Part of CODAI Ecosystem. All rights reserved.
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Financial Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Loan Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fraud Detection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Advisory</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/api/health" className="hover:text-white transition-colors">API Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="https://codai.ro" className="hover:text-white transition-colors">CODAI Platform</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
