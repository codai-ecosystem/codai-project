/**
 * @fileoverview Features Section Component
 * @author Cautai Team
 * @version 1.0.0
 */

'use client';

import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Intelligent Search',
    description: 'Advanced semantic search with natural language understanding and contextual relevance.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: SparklesIcon,
    title: 'AI Composition',
    description: 'Automatically compose comprehensive answers from multiple sources with AI-powered synthesis.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BoltIcon,
    title: 'Lightning Fast',
    description: 'Sub-second response times with advanced caching and optimized search algorithms.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Privacy First',
    description: 'End-to-end encryption, no tracking, and complete user privacy protection.',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: GlobeAltIcon,
    title: 'Multi-Language',
    description: 'Support for English and Romanian with plans for additional languages.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: CogIcon,
    title: 'Developer APIs',
    description: 'MCP protocol support, CLI tools, VS Code extension, and REST APIs for integration.',
    color: 'from-red-500 to-pink-500'
  }
];

export function Features() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Why Choose Cautai?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Experience the next generation of search technology with features designed 
            for both human users and AI agents.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24 bg-white dark:bg-gray-900 rounded-2xl p-8 lg:p-12 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                &lt;1s
              </div>
              <p className="text-gray-600 dark:text-gray-300">Average Response Time</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                99.9%
              </div>
              <p className="text-gray-600 dark:text-gray-300">Search Accuracy</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                24/7
              </div>
              <p className="text-gray-600 dark:text-gray-300">Availability</p>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                100%
              </div>
              <p className="text-gray-600 dark:text-gray-300">Privacy Protected</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to experience the future of search?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users and developers who are already using Cautai 
            to discover information faster and more intelligently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Start Searching
            </button>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
              View Documentation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}