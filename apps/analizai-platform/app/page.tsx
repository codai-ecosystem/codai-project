'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Brain,
  TrendingUp,
  Database,
  Target,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Award,
  PieChart,
  Clock,
  Shield,
  Users,
  DollarSign,
  LineChart,
  Filter,
  Download,
  Settings,
  Eye,
  Globe,
  Lightbulb,
  Heart
} from 'lucide-react'

export default function AnalizAIHomepage() {
  const [activeFeature, setActiveFeature] = useState<keyof typeof features>('data-analytics')

  const features = {
    'data-analytics': {
      title: 'AI-Powered Data Analytics',
      description: 'Transform raw data into actionable insights with advanced AI algorithms that identify patterns, trends, and opportunities.',
      icon: BarChart3,
      benefits: ['Real-time processing', 'Pattern recognition', 'Predictive analytics', 'Automated insights'],
      demo: 'Discover hidden patterns in your data with intelligent analysis that reveals business opportunities.'
    },
    'business-intelligence': {
      title: 'Advanced Business Intelligence',
      description: 'Comprehensive BI platform with interactive dashboards, KPI tracking, and strategic performance monitoring.',
      icon: TrendingUp,
      benefits: ['Interactive dashboards', 'KPI monitoring', 'Performance tracking', 'Strategic insights'],
      demo: 'Monitor your business performance with dynamic dashboards and intelligent KPI analysis.'
    },
    'predictive-modeling': {
      title: 'Predictive Modeling & Forecasting',
      description: 'Advanced machine learning models that predict future trends, customer behavior, and market dynamics.',
      icon: Brain,
      benefits: ['Future forecasting', 'Risk assessment', 'Trend prediction', 'Scenario planning'],
      demo: 'Predict future business outcomes with sophisticated AI models and scenario analysis.'
    },
    'reporting-automation': {
      title: 'Automated Reporting & Insights',
      description: 'Intelligent report generation with natural language insights and automated distribution to stakeholders.',
      icon: Database,
      benefits: ['Automated generation', 'Natural language insights', 'Scheduled distribution', 'Custom templates'],
      demo: 'Generate comprehensive reports automatically with AI-powered insights and recommendations.'
    }
  }

  const stats = [
    { label: 'Businesses Analyzed', value: '10K+', icon: Users },
    { label: 'Data Points Processed', value: '100M+', icon: Database },
    { label: 'Insights Generated', value: '1M+', icon: Lightbulb },
    { label: 'ROI Improvement', value: '300%', icon: DollarSign }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Chief Data Officer at TechCorp',
      content: 'AnalizAI transformed our data strategy. We now make decisions 10x faster with crystal-clear insights.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'VP Analytics at RetailGiant',
      content: 'The predictive modeling capabilities helped us increase revenue by 45% in just 6 months.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Business Intelligence Director',
      content: 'Best analytics platform we have ever used. The AI insights are incredibly accurate and actionable.',
      rating: 5
    }
  ]

  const useCases = [
    {
      title: 'Retail Analytics',
      description: 'Customer behavior analysis, inventory optimization, and sales forecasting',
      icon: DollarSign,
      metrics: ['40% increase in sales', '25% reduction in inventory costs', '60% better customer retention']
    },
    {
      title: 'Financial Services',
      description: 'Risk assessment, fraud detection, and portfolio optimization',
      icon: Shield,
      metrics: ['90% fraud detection accuracy', '35% risk reduction', '50% faster processing']
    },
    {
      title: 'Manufacturing',
      description: 'Production optimization, quality control, and predictive maintenance',
      icon: Settings,
      metrics: ['30% efficiency improvement', '50% reduction in downtime', '20% cost savings']
    },
    {
      title: 'Healthcare',
      description: 'Patient outcome prediction, resource optimization, and operational efficiency',
      icon: Heart,
      metrics: ['25% better patient outcomes', '40% resource optimization', '60% operational efficiency']
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-cyan-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold analizai-text-gradient">AnalizAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-cyan-600 font-medium">Features</a>
              <a href="#solutions" className="text-gray-700 hover:text-cyan-600 font-medium">Solutions</a>
              <a href="#pricing" className="text-gray-700 hover:text-cyan-600 font-medium">Pricing</a>
              <a href="#contact" className="text-gray-700 hover:text-cyan-600 font-medium">Contact</a>
              <button className="analizai-button">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="analizai-text-gradient">
                Transform Data Into
              </span>
              <br />
              <span className="text-gray-900">Business Intelligence</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Harness the power of AI to unlock hidden insights, predict future trends,
              and make data-driven decisions that drive extraordinary business growth.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button className="analizai-button text-lg px-8 py-4 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Start Analytics Journey</span>
              </button>
              <button className="border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>View Live Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-cyan-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Advanced Analytics Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of business analytics with AI-powered insights
              that revolutionize how you understand and grow your business.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Selector */}
            <div className="space-y-4">
              {Object.entries(features).map(([key, feature]) => (
                <motion.div
                  key={key}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${activeFeature === key
                      ? 'analizai-card border-cyan-300 shadow-lg'
                      : 'bg-white/70 border border-gray-200 hover:shadow-md'
                    }`}
                  onClick={() => setActiveFeature(key as keyof typeof features)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${activeFeature === key ? 'bg-cyan-600' : 'bg-gray-100'
                      }`}>
                      <feature.icon className={`w-6 h-6 ${activeFeature === key ? 'text-white' : 'text-gray-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {activeFeature === key && (
                    <motion.div
                      className="mt-4 space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Feature Demo */}
            <motion.div
              key={activeFeature}
              className="analizai-card p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center mb-6">
                <div className="p-4 bg-cyan-100 rounded-xl mr-4">
                  {React.createElement(features[activeFeature].icon, {
                    className: "w-8 h-8 text-cyan-600"
                  })}
                </div>
                <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
              </div>

              <p className="text-lg text-gray-700 mb-6">
                {features[activeFeature].demo}
              </p>

              <div className="bg-gradient-to-br from-cyan-50 to-purple-50 p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-cyan-600">Live Analytics Demo</span>
                  <Clock className="w-4 h-4 text-cyan-600" />
                </div>

                {/* Mock Analytics Chart */}
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Revenue Analytics</span>
                    <span className="text-sm text-green-600">↑ 24.5%</span>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-cyan-100 to-purple-100 rounded flex items-end justify-around p-2">
                    {[65, 78, 82, 95, 88, 92, 105].map((height, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t w-8"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button className="analizai-button w-full flex items-center justify-center space-x-2">
                <span>Try {features[activeFeature].title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Industry Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AnalizAI delivers specialized analytics solutions across industries,
              driving measurable results and competitive advantages.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                className="analizai-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-4 bg-cyan-100 rounded-xl w-fit mx-auto mb-4">
                  <useCase.icon className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{useCase.title}</h3>
                <p className="text-gray-600 mb-6">{useCase.description}</p>

                <div className="space-y-2">
                  {useCase.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how organizations worldwide are transforming their businesses with AnalizAI's
              advanced analytics and AI-powered insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="analizai-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations that trust AnalizAI for their most critical
              business decisions. Start your analytics transformation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-cyan-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Start Free Trial</span>
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-cyan-600 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Schedule Demo</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AnalizAI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transform your business with AI-powered analytics and data-driven insights.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">Business Intelligence</a></li>
                <li><a href="#" className="hover:text-white">Predictive Modeling</a></li>
                <li><a href="#" className="hover:text-white">Reporting</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Retail</a></li>
                <li><a href="#" className="hover:text-white">Financial Services</a></li>
                <li><a href="#" className="hover:text-white">Manufacturing</a></li>
                <li><a href="#" className="hover:text-white">Healthcare</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 AnalizAI. All rights reserved. | Advanced Business Analytics AI Platform</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
