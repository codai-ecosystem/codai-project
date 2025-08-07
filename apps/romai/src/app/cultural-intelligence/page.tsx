'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Flag, 
  Crown,
  Star,
  MapPin,
  Calendar,
  Music,
  BookOpen,
  Users,
  Home,
  Utensils,
  Sparkles,
  Globe,
  Award,
  Target,
  TrendingUp,
  Brain,
  Search,
  Filter,
  Download,
  Share,
  Eye,
  Clock,
  Info,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  ImageIcon,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Mountain,
  Trees,
  Waves,
  Sun,
  Moon,
  Flower,
  Leaf
} from 'lucide-react';

interface CulturalCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  items_count: number;
  accuracy: number;
  color: string;
  examples: string[];
}

interface CulturalItem {
  id: string;
  name: string;
  category: string;
  description: string;
  cultural_significance: number;
  regional_relevance: string[];
  historical_period: string;
  usage_frequency: number;
  confidence_score: number;
  examples: string[];
  audio_pronunciation?: string;
  visual_representation?: string;
  related_items: string[];
}

interface RegionalData {
  region: string;
  cultural_density: number;
  traditions_count: number;
  language_variants: number;
  significance_score: number;
  coordinates: [number, number];
}

interface CulturalMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  description: string;
  historical_data: number[];
}

export default function CulturalIntelligence() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const culturalMetrics: CulturalMetric[] = [
    {
      name: 'Cultural Understanding',
      value: 96.8,
      unit: '%',
      trend: 'up',
      icon: Heart,
      description: 'Overall Romanian cultural context comprehension',
      historical_data: [94.2, 95.1, 95.8, 96.3, 96.8]
    },
    {
      name: 'Tradition Recognition',
      value: 94.5,
      unit: '%',
      trend: 'up',
      icon: Crown,
      description: 'Accuracy in identifying Romanian traditions and customs',
      historical_data: [92.1, 93.2, 93.8, 94.1, 94.5]
    },
    {
      name: 'Regional Variations',
      value: 91.7,
      unit: '%',
      trend: 'stable',
      icon: MapPin,
      description: 'Understanding of regional cultural differences',
      historical_data: [90.8, 91.2, 91.5, 91.6, 91.7]
    },
    {
      name: 'Historical Context',
      value: 93.4,
      unit: '%',
      trend: 'up',
      icon: Calendar,
      description: 'Comprehension of historical cultural significance',
      historical_data: [91.7, 92.3, 92.8, 93.1, 93.4]
    },
    {
      name: 'Cultural Adaptation',
      value: 1.2,
      unit: 'ms',
      trend: 'down',
      icon: Zap,
      description: 'Speed of cultural context adaptation',
      historical_data: [1.8, 1.6, 1.4, 1.3, 1.2]
    },
    {
      name: 'Expression Library',
      value: 12847,
      unit: 'items',
      trend: 'up',
      icon: BookOpen,
      description: 'Total cultural expressions and phrases documented',
      historical_data: [11200, 11800, 12200, 12500, 12847]
    }
  ];

  const culturalCategories: CulturalCategory[] = [
    {
      id: 'traditions',
      name: 'Traditions & Customs',
      icon: Crown,
      description: 'Romanian cultural traditions, customs, and ceremonial practices',
      items_count: 2847,
      accuracy: 96.2,
      color: 'from-red-500 to-red-600',
      examples: [
        'Mărțișor (Spring celebration)',
        'Hora (Traditional dance)',
        'Colinde (Christmas carols)',
        'Wedding ceremonies'
      ]
    },
    {
      id: 'language',
      name: 'Language & Expressions',
      icon: BookOpen,
      description: 'Idiomatic expressions, proverbs, and linguistic nuances',
      items_count: 4923,
      accuracy: 97.8,
      color: 'from-yellow-500 to-yellow-600',
      examples: [
        'Proverbs and sayings',
        'Regional dialects',
        'Colloquial expressions',
        'Traditional poetry'
      ]
    },
    {
      id: 'cuisine',
      name: 'Culinary Heritage',
      icon: Utensils,
      description: 'Traditional Romanian cuisine, recipes, and food culture',
      items_count: 1654,
      accuracy: 94.7,
      color: 'from-orange-500 to-orange-600',
      examples: [
        'Mămăligă (Polenta)',
        'Ciorbă de burtă',
        'Cozonac (Easter bread)',
        'Regional specialties'
      ]
    },
    {
      id: 'music_arts',
      name: 'Music & Arts',
      icon: Music,
      description: 'Folk music, traditional arts, and cultural performances',
      items_count: 2193,
      accuracy: 93.5,
      color: 'from-red-600 to-red-700',
      examples: [
        'Doina (Folk songs)',
        'Traditional instruments',
        'Folk art patterns',
        'Dance choreography'
      ]
    },
    {
      id: 'history',
      name: 'Historical Context',
      icon: Calendar,
      description: 'Historical events, figures, and cultural evolution',
      items_count: 1785,
      accuracy: 95.1,
      color: 'from-yellow-600 to-yellow-700',
      examples: [
        'Medieval traditions',
        'Historical figures',
        'Cultural evolution',
        'Regional history'
      ]
    },
    {
      id: 'geography',
      name: 'Cultural Geography',
      icon: Mountain,
      description: 'Regional variations and geographical cultural influences',
      items_count: 1456,
      accuracy: 92.8,
      color: 'from-orange-600 to-orange-700',
      examples: [
        'Carpathian influences',
        'Danube traditions',
        'Rural vs urban culture',
        'Border region variations'
      ]
    }
  ];

  const regionalData: RegionalData[] = [
    { region: 'Transilvania', cultural_density: 96.8, traditions_count: 347, language_variants: 23, significance_score: 98.2, coordinates: [46.0, 24.0] },
    { region: 'Muntenia', cultural_density: 94.5, traditions_count: 298, language_variants: 18, significance_score: 95.7, coordinates: [44.5, 25.5] },
    { region: 'Moldova', cultural_density: 93.2, traditions_count: 312, language_variants: 21, significance_score: 94.8, coordinates: [47.0, 27.0] },
    { region: 'Oltenia', cultural_density: 91.7, traditions_count: 278, language_variants: 16, significance_score: 92.3, coordinates: [44.0, 23.5] },
    { region: 'Dobrogea', cultural_density: 89.4, traditions_count: 189, language_variants: 14, significance_score: 88.9, coordinates: [44.0, 28.0] },
    { region: 'Banat', cultural_density: 90.8, traditions_count: 234, language_variants: 19, significance_score: 91.6, coordinates: [45.5, 21.5] },
    { region: 'Crișana', cultural_density: 88.6, traditions_count: 198, language_variants: 15, significance_score: 89.7, coordinates: [46.5, 22.0] },
    { region: 'Maramureș', cultural_density: 95.3, traditions_count: 287, language_variants: 20, significance_score: 96.1, coordinates: [47.5, 24.0] }
  ];

  const featuredCulturalItems: CulturalItem[] = [
    {
      id: '1',
      name: 'Mărțișor',
      category: 'traditions',
      description: 'Traditional celebration marking the beginning of spring, celebrated on March 1st',
      cultural_significance: 98.5,
      regional_relevance: ['All regions'],
      historical_period: 'Ancient Dacian',
      usage_frequency: 96.7,
      confidence_score: 99.1,
      examples: [
        'Giving red and white threaded trinkets',
        'Wearing mărțișor for the entire month',
        'Traditional wishes for health and happiness'
      ],
      related_items: ['Spring traditions', 'Dacian heritage', 'Romanian folklore']
    },
    {
      id: '2',
      name: 'Hora',
      category: 'music_arts',
      description: 'Traditional Romanian circle dance performed at celebrations',
      cultural_significance: 97.2,
      regional_relevance: ['Transilvania', 'Muntenia', 'Moldova'],
      historical_period: 'Medieval',
      usage_frequency: 89.4,
      confidence_score: 96.8,
      examples: [
        'Wedding celebrations',
        'Village festivals',
        'Traditional music accompaniment'
      ],
      related_items: ['Folk music', 'Wedding traditions', 'Community celebrations']
    },
    {
      id: '3',
      name: 'Mămăligă',
      category: 'cuisine',
      description: 'Traditional cornmeal dish, considered a staple of Romanian cuisine',
      cultural_significance: 95.8,
      regional_relevance: ['All regions'],
      historical_period: '18th century',
      usage_frequency: 92.3,
      confidence_score: 98.2,
      examples: [
        'Served with cheese and sour cream',
        'Accompanied by traditional stews',
        'Regional preparation variations'
      ],
      related_items: ['Traditional cuisine', 'Rural traditions', 'Agricultural heritage']
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Cultural Overview', icon: Heart },
    { id: 'categories', label: 'Cultural Categories', icon: Crown },
    { id: 'regional', label: 'Regional Analysis', icon: MapPin },
    { id: 'expressions', label: 'Cultural Expressions', icon: BookOpen },
    { id: 'analytics', label: 'Cultural Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Cultural Insights', icon: Brain }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRegionColor = (density: number) => {
    if (density >= 95) return 'bg-red-600';
    if (density >= 90) return 'bg-red-500';
    if (density >= 85) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Enhanced Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-b border-red-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Cultural Intelligence
                </h1>
                <p className="text-sm text-gray-600">Romanian Cultural Understanding & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">96.8% Understanding</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">12,847 Expressions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">8 Regions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabbed Navigation */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-red-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selectedTab === 'overview' && (
            <>
              {/* Cultural Intelligence Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {culturalMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.name}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                        </div>
                        {getTrendIcon(metric.trend)}
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-bold text-gray-900">
                            {metric.name === 'Expression Library' ? metric.value.toLocaleString() : metric.value}
                          </span>
                          <span className="text-lg text-gray-600">{metric.unit}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{metric.description}</p>
                      
                      {metric.name.includes('%') && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                            style={{ width: `${metric.value}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Featured Cultural Items */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Featured Cultural Elements</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {featuredCulturalItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {item.cultural_significance.toFixed(1)}%
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Cultural Significance</span>
                          <span className="font-medium">{item.cultural_significance.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Usage Frequency</span>
                          <span className="font-medium">{item.usage_frequency.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Historical Period</span>
                          <span className="font-medium">{item.historical_period}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Examples:</p>
                        {item.examples.slice(0, 2).map((example, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-gray-700">{example}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cultural Categories Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Cultural Categories Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {culturalCategories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <motion.div
                        key={category.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">{category.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Items</p>
                            <p className="font-semibold">{category.items_count.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Accuracy</p>
                            <p className="font-semibold">{category.accuracy}%</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'categories' && (
            <>
              {/* Detailed Cultural Categories */}
              <div className="space-y-8">
                {culturalCategories.map((category, categoryIndex) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: categoryIndex * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{category.accuracy}%</p>
                          <p className="text-sm text-gray-600">Accuracy</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-1">Total Items</h4>
                          <p className="text-2xl font-bold text-red-700">{category.items_count.toLocaleString()}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-yellow-900 mb-1">Accuracy</h4>
                          <p className="text-2xl font-bold text-yellow-700">{category.accuracy}%</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-1">Recognition</h4>
                          <p className="text-2xl font-bold text-orange-700">{(category.accuracy - 2.1).toFixed(1)}%</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-1">Usage Rate</h4>
                          <p className="text-2xl font-bold text-red-700">{(category.accuracy - 1.5).toFixed(1)}%</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Examples</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {category.examples.map((example, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-gray-700">{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {selectedTab === 'regional' && (
            <>
              {/* Regional Cultural Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Cultural Density Map</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Simulated Map Visualization */}
                  <div className="bg-gradient-to-br from-red-100 to-yellow-100 rounded-lg p-6 border border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Romania Cultural Heat Map</h4>
                    <div className="relative h-64 bg-gradient-to-br from-red-200 to-yellow-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-red-600 mx-auto mb-2" />
                        <p className="text-red-800 font-semibold">Interactive Map</p>
                        <p className="text-red-600 text-sm">Cultural density visualization</p>
                      </div>
                    </div>
                  </div>

                  {/* Regional Statistics */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Regional Statistics</h4>
                    {regionalData.map((region, index) => (
                      <motion.div
                        key={region.region}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-gray-900">{region.region}</h5>
                          <div className={`w-3 h-3 rounded-full ${getRegionColor(region.cultural_density)}`}></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Cultural Density</p>
                            <p className="font-semibold">{region.cultural_density}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Traditions</p>
                            <p className="font-semibold">{region.traditions_count}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Language Variants</p>
                            <p className="font-semibold">{region.language_variants}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Significance</p>
                            <p className="font-semibold">{region.significance_score}%</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${region.cultural_density}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${region.cultural_density}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Other tabs content will be implemented in subsequent updates */}
          {!['overview', 'categories', 'regional'].includes(selectedTab) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-red-200/50 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(tab => tab.id === selectedTab)?.label} Features
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced {tabs.find(tab => tab.id === selectedTab)?.label.toLowerCase()} capabilities coming soon.
              </p>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto">
                {React.createElement(tabs.find(tab => tab.id === selectedTab)?.icon || Heart, { 
                  className: "w-8 h-8 text-white" 
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="bg-white/80 backdrop-blur-sm border-t border-red-200/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
              <Heart className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-red-900 mb-2">Cultural Understanding</h3>
              <p className="text-red-700 text-sm">Deep comprehension of Romanian cultural nuances, traditions, and regional variations with 96.8% accuracy.</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <Crown className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-yellow-900 mb-2">Rich Heritage</h3>
              <p className="text-yellow-700 text-sm">Comprehensive database of 12,847 cultural expressions, traditions, and customs from all Romanian regions.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <MapPin className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">Regional Expertise</h3>
              <p className="text-orange-700 text-sm">Detailed analysis of cultural variations across all 8 Romanian regions with historical and contemporary context.</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
