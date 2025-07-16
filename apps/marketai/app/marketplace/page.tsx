'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Download,
  TrendingUp,
  Users,
  ShoppingCart,
  CreditCard,
  Shield,
  Award,
  ChevronRight,
  Grid,
  List,
  SlidersHorizontal,
  Heart,
  Share2,
  Eye,
  Check,
  Zap,
  DollarSign
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
  verified: boolean;
  qualityScore: number;
  thumbnail?: string;
}

interface SearchFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  verified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const CATEGORIES = [
  'All Categories',
  'Productivity',
  'Development',
  'Design',
  'Marketing',
  'Analytics',
  'Communication',
  'Finance',
  'Education',
  'Entertainment',
  'Utilities'
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Free', min: 0, max: 0 },
  { label: 'Under $10', min: 0.01, max: 10 },
  { label: '$10 - $50', min: 10, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: Infinity },
];

export default function MarketplaceAI() {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [purchasingAgent, setPurchasingAgent] = useState<string | null>(null);

  // Mock data for the marketplace
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'AI Content Generator Pro',
      description: 'Advanced AI agent for generating high-quality blog posts, social media content, and marketing copy with brand voice consistency and SEO optimization.',
      price: 29.99,
      rating: 4.8,
      downloads: 1542,
      category: 'Marketing',
      tags: ['ai', 'content', 'marketing', 'automation', 'copywriting', 'seo'],
      author: { id: 'author1', name: 'Sarah Johnson', verified: true },
      verified: true,
      qualityScore: 95,
    },
    {
      id: '2',
      name: 'Code Review Guardian',
      description: 'Intelligent code review assistant that identifies security vulnerabilities, performance issues, and maintains coding standards across multiple programming languages.',
      price: 49.99,
      rating: 4.6,
      downloads: 892,
      category: 'Development',
      tags: ['code', 'review', 'security', 'quality', 'automation', 'ci-cd'],
      author: { id: 'author2', name: 'Michael Chen', verified: true },
      verified: true,
      qualityScore: 88,
    },
    {
      id: '3',
      name: 'Data Visualization Studio',
      description: 'Create stunning interactive charts, graphs, and dashboards from complex datasets with AI-powered insights and real-time data processing.',
      price: 39.99,
      rating: 4.7,
      downloads: 1205,
      category: 'Analytics',
      tags: ['data', 'visualization', 'charts', 'dashboard', 'insights', 'business-intelligence'],
      author: { id: 'author3', name: 'Emily Rodriguez', verified: false },
      verified: false,
      qualityScore: 82,
    },
    {
      id: '4',
      name: 'Design System Architect',
      description: 'Build consistent design systems and component libraries with automated style guides, documentation generation, and design token management.',
      price: 79.99,
      rating: 4.9,
      downloads: 624,
      category: 'Design',
      tags: ['design', 'system', 'components', 'ui', 'documentation', 'tokens'],
      author: { id: 'author4', name: 'David Kim', verified: true },
      verified: true,
      qualityScore: 96,
    },
    {
      id: '5',
      name: 'Email Marketing Optimizer',
      description: 'AI-powered email campaign optimization with A/B testing, personalization, deliverability enhancement, and automated follow-up sequences.',
      price: 59.99,
      rating: 4.5,
      downloads: 743,
      category: 'Marketing',
      tags: ['email', 'marketing', 'optimization', 'personalization', 'automation', 'ab-testing'],
      author: { id: 'author5', name: 'Lisa Thompson', verified: true },
      verified: true,
      qualityScore: 85,
    },
    {
      id: '6',
      name: 'Security Audit Bot',
      description: 'Comprehensive security scanning and vulnerability assessment for web applications, APIs, and cloud infrastructure with real-time threat detection.',
      price: 89.99,
      rating: 4.4,
      downloads: 456,
      category: 'Development',
      tags: ['security', 'audit', 'vulnerability', 'scanning', 'protection', 'compliance'],
      author: { id: 'author6', name: 'James Wilson', verified: true },
      verified: true,
      qualityScore: 91,
    },
    {
      id: '7',
      name: 'Social Media Manager',
      description: 'Automate your social media presence with intelligent post scheduling, engagement analysis, and content optimization across all major platforms.',
      price: 24.99,
      rating: 4.3,
      downloads: 1876,
      category: 'Marketing',
      tags: ['social-media', 'automation', 'scheduling', 'engagement', 'analytics', 'content'],
      author: { id: 'author7', name: 'Anna Cooper', verified: true },
      verified: true,
      qualityScore: 78,
    },
    {
      id: '8',
      name: 'Financial Analytics Engine',
      description: 'Advanced financial modeling and risk analysis with real-time market data integration, portfolio optimization, and predictive insights.',
      price: 149.99,
      rating: 4.7,
      downloads: 312,
      category: 'Finance',
      tags: ['finance', 'analytics', 'risk', 'portfolio', 'modeling', 'trading'],
      author: { id: 'author8', name: 'Robert Chang', verified: true },
      verified: true,
      qualityScore: 93,
    },
  ];

  useEffect(() => {
    // Simulate API call to load agents
    setTimeout(() => {
      setAgents(mockAgents);
      setFilteredAgents(mockAgents);
      setFeaturedAgents(mockAgents.filter(agent => agent.rating >= 4.7).slice(0, 3));
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    let filtered = [...agents];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.tags.some(tag => tag.toLowerCase().includes(query)) ||
        agent.category.toLowerCase().includes(query) ||
        agent.author.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(agent => agent.category === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(agent =>
        agent.price >= filters.priceRange!.min &&
        agent.price <= filters.priceRange!.max
      );
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(agent => agent.rating >= filters.rating!);
    }

    // Apply verified filter
    if (filters.verified !== undefined) {
      filtered = filtered.filter(agent => agent.verified === filters.verified);
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        switch (filters.sortBy) {
          case 'price':
            aVal = a.price;
            bVal = b.price;
            break;
          case 'rating':
            aVal = a.rating;
            bVal = b.rating;
            break;
          case 'downloads':
            aVal = a.downloads;
            bVal = b.downloads;
            break;
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    setFilteredAgents(filtered);
  }, [searchQuery, filters, agents]);

  const handlePurchase = async (agent: Agent) => {
    setPurchasingAgent(agent.id);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Implement real Stripe payment integration
      console.log('Purchasing agent:', agent.name, 'for $', agent.price);
      alert(`Successfully purchased ${agent.name}! Check your email for download instructions.`);

      // Update download count (in real app, this would be handled by the backend)
      setAgents(prev => prev.map(a =>
        a.id === agent.id ? { ...a, downloads: a.downloads + 1 } : a
      ));
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasingAgent(null);
    }
  };

  const renderAgentCard = (agent: Agent) => (
    <motion.div
      key={agent.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex items-center space-x-6 p-6' : 'p-6'
        }`}
    >
      {/* Thumbnail */}
      <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'w-full h-48'} bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden`}>
        <div className="text-3xl font-bold text-blue-600">{agent.name.charAt(0)}</div>
        {agent.verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className={viewMode === 'list' ? 'flex-1' : ''}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900 mb-1 hover:text-blue-600 cursor-pointer transition-colors">
              {agent.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">by {agent.author.name}</span>
              {agent.author.verified && (
                <Shield className="w-4 h-4 text-blue-500" title="Verified Author" />
              )}
              {agent.verified && (
                <Award className="w-4 h-4 text-green-500" title="Verified Agent" />
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <Heart className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <Share2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className={`text-gray-600 mb-4 leading-relaxed ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {agent.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.tags.slice(0, viewMode === 'list' ? 3 : 6).map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 text-xs rounded-full cursor-pointer transition-colors"
            >
              #{tag}
            </span>
          ))}
          {agent.tags.length > (viewMode === 'list' ? 3 : 6) && (
            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{agent.tags.length - (viewMode === 'list' ? 3 : 6)} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 mb-6 text-sm">
          <div className="flex items-center space-x-1 text-yellow-600">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{agent.rating}</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-600">
            <Download className="w-4 h-4" />
            <span className="font-medium">{agent.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1 text-green-600">
            <Zap className="w-4 h-4" />
            <span className="font-medium">{agent.qualityScore}%</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-gray-900">
              {agent.price === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                <span>${agent.price.toFixed(2)}</span>
              )}
            </div>
            {agent.price > 0 && (
              <span className="text-sm text-gray-500">one-time</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedAgent(agent)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => handlePurchase(agent)}
              disabled={purchasingAgent === agent.id}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 relative overflow-hidden"
            >
              {purchasingAgent === agent.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{agent.price === 0 ? 'Download' : 'Purchase'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading MarketAI</h3>
          <p className="text-gray-600">Discovering the best AI agents for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">MarketAI</h1>
                  <p className="text-sm text-gray-600">AI Agent Marketplace</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Sell Agents
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                My Library
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              The World's Largest
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                AI Agent Marketplace
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            >
              Discover, purchase, and deploy verified AI agents for every use case.
              Built by developers, for developers.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto relative mb-8"
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for AI agents, categories, or use cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/20 focus:outline-none text-lg shadow-xl"
              />
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1,247+</div>
                <div className="text-blue-200">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">25,492+</div>
                <div className="text-blue-200">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1,892+</div>
                <div className="text-blue-200">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98.7%</div>
                <div className="text-blue-200">Satisfaction</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Featured Agents</h3>
                <p className="text-gray-600">Handpicked by our team for exceptional quality</p>
              </div>
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredAgents.map(agent => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{agent.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{agent.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">${agent.price}</span>
                    <button
                      onClick={() => handlePurchase(agent)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Purchase
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <select
                  value={filters.category || 'All Categories'}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value === 'All Categories' ? undefined : e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                <select
                  value={filters.priceRange ? `${filters.priceRange.min}-${filters.priceRange.max}` : 'all'}
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setFilters({ ...filters, priceRange: undefined });
                    } else {
                      const range = PRICE_RANGES.find(r => `${r.min}-${r.max}` === e.target.value);
                      if (range) {
                        setFilters({ ...filters, priceRange: { min: range.min, max: range.max } });
                      }
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {PRICE_RANGES.map(range => (
                    <option key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating</label>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Verified Filter */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified || false}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked || undefined })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium">Verified Only</span>
                  <Shield className="ml-2 w-4 h-4 text-green-500" />
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All Agents'}
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {filteredAgents.length} agents
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                {/* Sort */}
                <select
                  value={`${filters.sortBy || 'rating'}-${filters.sortOrder || 'desc'}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="rating-desc">Highest Rated</option>
                  <option value="downloads-desc">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className={`${viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6'
                : 'space-y-6'
              }`}>
              {filteredAgents.map(agent => renderAgentCard(agent))}
            </div>

            {/* Empty State */}
            {filteredAgents.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No agents found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any agents matching your criteria. Try adjusting your search terms or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({});
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {selectedAgent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedAgent.name}</h2>
                    <p className="text-gray-600 flex items-center space-x-2">
                      <span>by {selectedAgent.author.name}</span>
                      {selectedAgent.author.verified && <Shield className="w-4 h-4 text-blue-500" />}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-6 flex items-center justify-center">
                    <div className="text-8xl font-bold text-blue-600">{selectedAgent.name.charAt(0)}</div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{selectedAgent.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedAgent.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {selectedAgent.price === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${selectedAgent.price.toFixed(2)}`
                        )}
                      </div>
                      {selectedAgent.price > 0 && (
                        <div className="text-sm text-gray-500">one-time purchase</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-yellow-600 mb-1">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-bold">{selectedAgent.rating}</span>
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                          <Download className="w-4 h-4" />
                          <span className="font-bold">{selectedAgent.downloads.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500">Downloads</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          handlePurchase(selectedAgent);
                          setSelectedAgent(null);
                        }}
                        disabled={purchasingAgent === selectedAgent.id}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                      >
                        {purchasingAgent === selectedAgent.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            <span>{selectedAgent.price === 0 ? 'Download Free' : 'Purchase Now'}</span>
                          </>
                        )}
                      </button>
                      <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Add to Wishlist
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Agent Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium">{selectedAgent.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Score</span>
                        <span className="font-medium text-green-600">{selectedAgent.qualityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verification</span>
                        <span className={`font-medium ${selectedAgent.verified ? 'text-green-600' : 'text-gray-500'}`}>
                          {selectedAgent.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
