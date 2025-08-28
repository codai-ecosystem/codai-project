/**
 * @fileoverview Hero Section Component
 * @author Cautai Team
 * @version 1.0.0
 */

'use client';

import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Cautai
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-4">
              AI-First Search Engine
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Revolutionizing how agents and humans discover information with 
              intelligent search, semantic understanding, and AI-powered insights.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Try Cautai Now
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200">
              Learn More
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">🧠</div>
                <h3 className="text-lg font-semibold mt-2 text-gray-900 dark:text-white">AI-Powered</h3>
                <p className="text-gray-600 dark:text-gray-400">Advanced machine learning algorithms</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">⚡</div>
                <h3 className="text-lg font-semibold mt-2 text-gray-900 dark:text-white">Lightning Fast</h3>
                <p className="text-gray-600 dark:text-gray-400">Sub-second search responses</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">🔐</div>
                <h3 className="text-lg font-semibold mt-2 text-gray-900 dark:text-white">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-400">Privacy-first architecture</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}