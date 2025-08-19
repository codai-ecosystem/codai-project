'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Heart,
  Share2,
  PlayCircle,
  Star,
  BarChart3,
  MonitorPlay,
  Briefcase,
  GraduationCap,
  Palette,
  Camera,
  TrendingUp,
  Users
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  description: string;
  slides: number;
  downloads: number;
  rating: number;
  isPremium: boolean;
  tags: string[];
  author: string;
  updatedAt: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories: TemplateCategory[] = [
    { id: 'all', name: 'All Templates', icon: <Grid3X3 className="w-5 h-5" />, count: 247, color: 'bg-purple-100 text-purple-600' },
    { id: 'business', name: 'Business', icon: <Briefcase className="w-5 h-5" />, count: 89, color: 'bg-blue-100 text-blue-600' },
    { id: 'education', name: 'Education', icon: <GraduationCap className="w-5 h-5" />, count: 67, color: 'bg-green-100 text-green-600' },
    { id: 'creative', name: 'Creative', icon: <Palette className="w-5 h-5" />, count: 54, color: 'bg-pink-100 text-pink-600' },
    { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="w-5 h-5" />, count: 43, color: 'bg-orange-100 text-orange-600' },
    { id: 'photography', name: 'Photography', icon: <Camera className="w-5 h-5" />, count: 31, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const templates: Template[] = [
    {
      id: '1',
      name: 'Modern Business Presentation',
      category: 'business',
      preview: 'gradient-to-br from-blue-600 to-purple-600',
      description: 'Professional template for corporate presentations with charts and infographics',
      slides: 24,
      downloads: 15420,
      rating: 4.8,
      isPremium: false,
      tags: ['corporate', 'charts', 'professional'],
      author: 'Design Team',
      updatedAt: '2 days ago'
    },
    {
      id: '2',
      name: 'Educational Workshop',
      category: 'education',
      preview: 'gradient-to-br from-green-500 to-blue-500',
      description: 'Interactive template perfect for educational content and workshops',
      slides: 18,
      downloads: 8950,
      rating: 4.6,
      isPremium: true,
      tags: ['education', 'interactive', 'workshop'],
      author: 'EduDesign',
      updatedAt: '1 week ago'
    },
    {
      id: '3',
      name: 'Creative Portfolio',
      category: 'creative',
      preview: 'gradient-to-br from-pink-500 to-orange-500',
      description: 'Stunning visual template for showcasing creative work and portfolios',
      slides: 32,
      downloads: 12300,
      rating: 4.9,
      isPremium: true,
      tags: ['portfolio', 'creative', 'visual'],
      author: 'Creative Studio',
      updatedAt: '3 days ago'
    },
    {
      id: '4',
      name: 'Marketing Campaign',
      category: 'marketing',
      preview: 'gradient-to-br from-orange-500 to-red-500',
      description: 'Dynamic template for marketing campaigns and brand presentations',
      slides: 28,
      downloads: 9870,
      rating: 4.7,
      isPremium: false,
      tags: ['marketing', 'campaigns', 'branding'],
      author: 'Marketing Pro',
      updatedAt: '5 days ago'
    },
    {
      id: '5',
      name: 'Photography Showcase',
      category: 'photography',
      preview: 'gradient-to-br from-gray-700 to-gray-900',
      description: 'Elegant template designed specifically for photography portfolios',
      slides: 20,
      downloads: 6540,
      rating: 4.5,
      isPremium: true,
      tags: ['photography', 'portfolio', 'elegant'],
      author: 'Photo Pro',
      updatedAt: '1 week ago'
    },
    {
      id: '6',
      name: 'Startup Pitch Deck',
      category: 'business',
      preview: 'gradient-to-br from-purple-600 to-pink-600',
      description: 'Perfect template for startup pitches and investor presentations',
      slides: 16,
      downloads: 11200,
      rating: 4.8,
      isPremium: false,
      tags: ['startup', 'pitch', 'investors'],
      author: 'Startup Hub',
      updatedAt: '4 days ago'
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Presentation Templates
              </h1>
              <p className="text-gray-600 mt-1">
                Professional templates to jumpstart your presentations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Upload Template</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Overview', href: '/prezentai', current: false },
              { name: 'Presentations', href: '/prezentai/presentations', current: false },
              { name: 'Templates', href: '/prezentai/templates', current: true },
              { name: 'Media Library', href: '/prezentai/media', current: false },
              { name: 'Analytics', href: '/prezentai/analytics', current: false },
              { name: 'Settings', href: '/prezentai/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex lg:flex-row flex-col gap-8">

          {/* Category Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                        : 'hover:bg-purple-50 text-gray-700'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${selectedCategory === category.id ? 'bg-white/20' : category.color}`}>
                        {category.icon}
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-sm ${selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Templates Grid */}
          <div className="flex-1">

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 mb-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                    <option value="name">Name</option>
                  </select>

                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Templates Grid/List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {sortedTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`group ${viewMode === 'grid'
                      ? 'bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-purple-300'
                      : 'bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300'
                    }`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Template Preview */}
                      <div className="relative h-48 overflow-hidden">
                        <div className={`w-full h-full bg-${template.preview}`}>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors duration-200 flex items-center space-x-2">
                              <PlayCircle className="w-4 h-4" />
                              <span>Preview</span>
                            </button>
                          </div>
                        </div>
                        {template.isPremium && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            PRO
                          </div>
                        )}
                      </div>

                      {/* Template Details */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                            {template.name}
                          </h3>
                          <button className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>{template.slides} slides</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{template.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {template.downloads.toLocaleString()} downloads
                          </span>
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-md text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-200">
                              Use Template
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-6">
                      {/* Template Preview Thumbnail */}
                      <div className="relative w-24 h-16 flex-shrink-0">
                        <div className={`w-full h-full bg-${template.preview} rounded-lg`}></div>
                        {template.isPremium && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1 py-0.5 rounded-full text-xs font-semibold">
                            PRO
                          </div>
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-200">
                            {template.name}
                          </h3>
                          <div className="flex items-center space-x-1 ml-4">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{template.rating}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {template.description}
                        </p>

                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{template.slides} slides</span>
                          <span>{template.downloads.toLocaleString()} downloads</span>
                          <span>by {template.author}</span>
                          <span>{template.updatedAt}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                          <Heart className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200">
                          Use Template
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>

      {/* Modern Footer */ }
  <motion.footer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6 }}
    className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white mt-16"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-2xl font-bold mb-4">PrezentAI Templates</h3>
          <p className="text-purple-200 mb-6 max-w-md">
            Discover thousands of professional presentation templates designed to make your ideas shine.
            From business pitches to creative portfolios, find the perfect template for every occasion.
          </p>
          <div className="flex space-x-4">
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
              <Users className="w-5 h-5" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Popular Categories</h4>
          <ul className="space-y-2 text-purple-200">
            <li><a href="#" className="hover:text-white transition-colors duration-200">Business Presentations</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Educational Templates</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Creative Portfolios</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Marketing Campaigns</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Template Tools</h4>
          <ul className="space-y-2 text-purple-200">
            <li><a href="#" className="hover:text-white transition-colors duration-200">Template Builder</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Custom Themes</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Brand Guidelines</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Export Options</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-purple-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-purple-200 text-sm">
          © 2025 PrezentAI Templates. Crafted with precision for professional presentations.
        </p>
        <div className="mt-4 md:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            ✨ 247 Premium Templates Available
          </span>
        </div>
      </div>
    </div>
  </motion.footer>
    </div >
  );
}
