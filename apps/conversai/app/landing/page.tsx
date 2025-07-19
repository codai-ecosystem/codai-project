'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Code, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.8, 1.2, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-indigo-400 bg-clip-text text-transparent">
                CONVERSAI
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="px-4 py-2 text-green-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-indigo-600 rounded-lg hover:from-green-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-green-400 via-indigo-400 to-indigo-400 bg-clip-text text-transparent">
                Conversation Intelligence
              </span>
              <br />
              <span className="text-white">Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Advanced conversation AI platform with natural language processing and intelligent chat capabilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-green-500 to-indigo-600 rounded-xl hover:from-green-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span className="text-lg font-semibold">Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => window.location.href = '#features'}
                className="px-8 py-4 border border-gray-600 rounded-xl hover:border-green-400 hover:bg-green-400/10 transition-all duration-300"
              >
                <span className="text-lg">Learn More</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose CONVERSAI?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of Communication with our comprehensive platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Code className="w-8 h-8" />,
              title: 'Natural Language',
              description: 'Advanced NLP for human-like conversation understanding and responses'
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Multi-language Support',
              description: 'Global communication with real-time translation and localization'
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: 'Context Awareness',
              description: 'Intelligent context retention for meaningful long-form conversations'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-green-600/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Communication Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using CONVERSAI to achieve better results faster.
          </p>
          <button
            onClick={handleGetStarted}
            className="group px-8 py-4 bg-gradient-to-r from-green-500 to-indigo-600 rounded-xl hover:from-green-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <span className="text-lg font-semibold">Start Building Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800">
        <div className="text-center text-gray-400">
          <p>&copy; 2025 CONVERSAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}