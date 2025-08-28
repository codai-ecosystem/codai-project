/**
 * @fileoverview Search Interface Component with AI-powered features
 * @author Cautai Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, SparklesIcon, ClockIcon, LinkIcon } from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  domain: string;
  publishedAt?: string;
  score: number;
  citations: string[];
}

export function SearchInterface() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [composeMode, setComposeMode] = useState(false);
  const [composedAnswer, setComposedAnswer] = useState('');

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Mock search implementation - replace with actual API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: `Advanced techniques for "${searchQuery}"`,
          snippet: `Comprehensive guide covering best practices and advanced techniques for ${searchQuery}. This resource provides in-depth analysis and practical examples.`,
          url: 'https://example.com/advanced-techniques',
          domain: 'example.com',
          publishedAt: '2025-08-27',
          score: 0.95,
          citations: ['Technical Documentation', 'Best Practices Guide']
        },
        {
          id: '2',
          title: `Understanding ${searchQuery} fundamentals`,
          snippet: `Learn the core concepts and fundamental principles of ${searchQuery}. Perfect for beginners and experts alike.`,
          url: 'https://docs.example.com/fundamentals',
          domain: 'docs.example.com',
          publishedAt: '2025-08-26',
          score: 0.89,
          citations: ['Official Documentation', 'Tutorial Series']
        },
        {
          id: '3',
          title: `${searchQuery} implementation examples`,
          snippet: `Real-world implementation examples and code samples for ${searchQuery}. Includes performance tips and optimization strategies.`,
          url: 'https://github.com/example/samples',
          domain: 'github.com',
          publishedAt: '2025-08-25',
          score: 0.87,
          citations: ['Code Repository', 'Implementation Guide']
        }
      ];
      
      setResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  const handleCompose = async () => {
    if (results.length === 0) return;
    
    setComposeMode(true);
    
    // Mock compose implementation
    setTimeout(() => {
      const answer = `Based on my analysis of the search results for "${query}", here's a comprehensive overview:

${query} is a multifaceted topic that requires understanding both fundamental concepts and advanced implementation techniques. Here are the key insights:

**Core Concepts:**
${results[1]?.snippet || 'Core principles and fundamental understanding are essential.'}

**Advanced Techniques:**
${results[0]?.snippet || 'Advanced practices and optimization strategies are available.'}

**Practical Implementation:**
${results[2]?.snippet || 'Real-world examples and code samples provide practical guidance.'}

**Key Takeaways:**
1. Start with understanding the fundamentals
2. Apply advanced techniques for optimization
3. Use practical examples for implementation
4. Keep performance and best practices in mind

This information is synthesized from ${results.length} high-quality sources with an average confidence score of ${(results.reduce((sum, r) => sum + r.score, 0) / results.length * 100).toFixed(1)}%.`;

      setComposedAnswer(answer);
    }, 2000);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
      setComposedAnswer('');
      setComposeMode(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search Form */}
      <motion.form
        onSubmit={onSubmit}
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything... (e.g., 'machine learning algorithms')"
            className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </div>
          </button>
        </div>
      </motion.form>

      {/* Search Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Compose Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleCompose}
                disabled={composeMode}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>{composeMode ? 'Composing...' : 'Compose AI Answer'}</span>
              </button>
            </div>

            {/* Composed Answer */}
            {composedAnswer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    AI-Composed Answer
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                    {composedAnswer}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Search Results List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Results ({results.length})
              </h3>
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                    >
                      {result.title}
                    </a>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 ml-4">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                        {Math.round(result.score * 100)}% match
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {result.snippet}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <LinkIcon className="h-4 w-4" />
                        <span>{result.domain}</span>
                      </div>
                      {result.publishedAt && (
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{result.publishedAt}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.citations.slice(0, 2).map((citation, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs"
                        >
                          {citation}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {results.length === 0 && !isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Ready to Search
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Enter your search query above to get started with AI-powered search results and intelligent composition.
          </p>
        </motion.div>
      )}
    </div>
  );
}