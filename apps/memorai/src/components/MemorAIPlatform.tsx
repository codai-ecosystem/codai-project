import React from 'react'
/**
 * MemorAI - Intelligent Memory Management Platform
 * Full-featured memory management with AI-powered search, analytics, 
 * collaboration, and intelligent insights
 */

'use client';

// import { useAuth } from '../lib/auth';
// TODO: Fix useAuth import once auth system is properly configured
const useAuth = () => ({ 
  user: { name: 'Test User', email: 'test@example.com' } as any, 
  isLoading: false, 
  error: null,
  authState: { isAuthenticated: true, user: { name: 'Test User', email: 'test@example.com' } as any, isLoading: false },
  logout: () => {},
  hasRole: () => false,
  isAdmin: false
});
import { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Plus,
  Filter,
  BarChart3,
  Tags,
  Star,
  Clock,
  Users,
  Archive,
  Zap,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Link,
  Hash,
  Calendar,
  Globe,
  Lock,
  Unlock,
  ChevronDown,
  MoreHorizontal,
  Sparkles,
  Activity,
  Database,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Map,
  Heart
} from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'idea' | 'task' | 'reference' | 'project' | 'learning';
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  isFavorite: boolean;
  collaborators: string[];
  attachments: string[];
  linkedMemories: string[];
  aiScore: number;
  accessCount: number;
  status: 'active' | 'archived' | 'deleted';
}

interface SearchAnalytics {
  totalSearches: number;
  avgResponseTime: number;
  popularQueries: string[];
  searchAccuracy: number;
}

interface MemoryAnalytics {
  totalMemories: number;
  todaysMemories: number;
  weeklyGrowth: number;
  categoriesCount: number;
  tagsCount: number;
  avgAiScore: number;
}

export default function MemorAIPlatform() {
  const { authState, logout, hasRole, isAdmin } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Mock data - in production, this would come from APIs
  const [memoryAnalytics] = useState<MemoryAnalytics>({
    totalMemories: 1247,
    todaysMemories: 12,
    weeklyGrowth: 8.5,
    categoriesCount: 24,
    tagsCount: 156,
    avgAiScore: 87.3
  });

  const [searchAnalytics] = useState<SearchAnalytics>({
    totalSearches: 3456,
    avgResponseTime: 29,
    popularQueries: ['project ideas', 'AI research', 'meeting notes', 'code snippets', 'learning resources'],
    searchAccuracy: 94.7
  });

  useEffect(() => {
    // Mock memory data
    setMemories([
      {
        id: 'mem-1',
        title: 'AI Research Notes - Transformer Architecture',
        content: 'Detailed notes on transformer architecture, attention mechanisms, and practical implementations...',
        type: 'learning',
        tags: ['AI', 'Machine Learning', 'Transformers', 'Research'],
        category: 'Technology',
        priority: 'high',
        createdAt: '2025-08-06T10:00:00Z',
        updatedAt: '2025-08-06T14:30:00Z',
        isPrivate: false,
        isFavorite: true,
        collaborators: ['user-2', 'user-3'],
        attachments: ['transformer-diagram.png', 'paper.pdf'],
        linkedMemories: ['mem-5', 'mem-12'],
        aiScore: 95,
        accessCount: 34,
        status: 'active'
      },
      {
        id: 'mem-2',
        title: 'Project Brainstorm - Next-Gen Banking App',
        content: 'Ideas for revolutionary banking features including AI-powered insights, voice commands...',
        type: 'idea',
        tags: ['Banking', 'Fintech', 'UI/UX', 'Innovation'],
        category: 'Business',
        priority: 'medium',
        createdAt: '2025-08-05T16:20:00Z',
        updatedAt: '2025-08-06T09:15:00Z',
        isPrivate: true,
        isFavorite: false,
        collaborators: ['user-4'],
        attachments: ['mockups.figma'],
        linkedMemories: ['mem-8'],
        aiScore: 82,
        accessCount: 12,
        status: 'active'
      },
      {
        id: 'mem-3',
        title: 'Weekly Team Meeting - Q3 Planning',
        content: 'Meeting notes covering Q3 objectives, resource allocation, timeline discussions...',
        type: 'note',
        tags: ['Meeting', 'Planning', 'Q3', 'Team'],
        category: 'Work',
        priority: 'medium',
        createdAt: '2025-08-05T11:00:00Z',
        updatedAt: '2025-08-05T11:45:00Z',
        isPrivate: false,
        isFavorite: false,
        collaborators: [],
        attachments: ['agenda.pdf'],
        linkedMemories: ['mem-15'],
        aiScore: 78,
        accessCount: 8,
        status: 'active'
      },
      {
        id: 'mem-4',
        title: 'Code Snippet - React Hook for Authentication',
        content: 'Custom React hook for handling authentication state, token management, and auto-refresh...',
        type: 'reference',
        tags: ['React', 'Authentication', 'JavaScript', 'Hooks'],
        category: 'Development',
        priority: 'low',
        createdAt: '2025-08-04T13:30:00Z',
        updatedAt: '2025-08-04T13:30:00Z',
        isPrivate: false,
        isFavorite: true,
        collaborators: [],
        attachments: [],
        linkedMemories: ['mem-20'],
        aiScore: 91,
        accessCount: 45,
        status: 'active'
      },
      {
        id: 'mem-5',
        title: 'Learning Path - Deep Learning Fundamentals',
        content: 'Structured learning path covering neural networks, deep learning frameworks, practical projects...',
        type: 'learning',
        tags: ['Deep Learning', 'Education', 'Neural Networks', 'PyTorch'],
        category: 'Education',
        priority: 'high',
        createdAt: '2025-08-03T09:00:00Z',
        updatedAt: '2025-08-06T12:00:00Z',
        isPrivate: false,
        isFavorite: true,
        collaborators: ['user-6'],
        attachments: ['curriculum.pdf', 'resources.md'],
        linkedMemories: ['mem-1'],
        aiScore: 89,
        accessCount: 23,
        status: 'active'
      }
    ]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MemorAI Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-12 w-12 text-purple-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">MemorAI</h1>
            </div>
            <p className="text-gray-600 mb-8">Intelligent memory management platform with AI-powered insights</p>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-6">
              <h3 className="font-semibold text-purple-900 mb-3">🧠 Memory Features</h3>
              <ul className="text-sm text-purple-700 space-y-2 text-left">
                <li>• AI-powered search across all your memories</li>
                <li>• Intelligent categorization and tagging</li>
                <li>• Real-time collaboration and sharing</li>
                <li>• Advanced analytics and insights</li>
                <li>• Multi-format content support</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.href = 'http://localhost:4004/auth/signin?returnTo=' + encodeURIComponent(window.location.href)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In to MemorAI
            </button>

            <div className="mt-4 text-sm text-gray-500">
              Secure access via CODAI Identity
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'idea': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'task': return <Target className="h-4 w-4 text-green-500" />;
      case 'reference': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'project': return <Map className="h-4 w-4 text-orange-500" />;
      case 'learning': return <Brain className="h-4 w-4 text-indigo-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-200 bg-red-50 text-red-900';
      case 'high': return 'border-orange-200 bg-orange-50 text-orange-900';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-900';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-900';
      default: return 'border-gray-200 bg-gray-50 text-gray-900';
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' ||
      memory.type === selectedFilter ||
      (selectedFilter === 'favorites' && memory.isFavorite) ||
      (selectedFilter === 'private' && memory.isPrivate);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MemorAI</h1>
                <p className="text-xs text-gray-600">Intelligent Memory</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {[
                { key: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
                { key: 'memories', name: 'Memories', icon: <Brain className="h-4 w-4" /> },
                { key: 'search', name: 'Search', icon: <Search className="h-4 w-4" /> },
                { key: 'analytics', name: 'Analytics', icon: <TrendingUp className="h-4 w-4" /> },
                { key: 'collaboration', name: 'Collaboration', icon: <Users className="h-4 w-4" /> },
                { key: 'insights', name: 'AI Insights', icon: <Sparkles className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Memory</span>
                </button>
              </div>
              <p className="text-gray-600">Your intelligent memory dashboard with AI-powered insights and analytics</p>
            </div>

            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Memories</p>
                    <p className="text-2xl font-bold text-gray-900">{memoryAnalytics.totalMemories.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+{memoryAnalytics.weeklyGrowth}%</span>
                  <span className="text-gray-500 ml-1">this week</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Memories</p>
                    <p className="text-2xl font-bold text-gray-900">{memoryAnalytics.todaysMemories}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-500 font-medium">Updated</span>
                  <span className="text-gray-500 ml-1">2 hours ago</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Score Average</p>
                    <p className="text-2xl font-bold text-gray-900">{memoryAnalytics.avgAiScore}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Activity className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">Excellent</span>
                  <span className="text-gray-500 ml-1">quality</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Search Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">{searchAnalytics.searchAccuracy}%</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Search className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Zap className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-orange-500 font-medium">{searchAnalytics.avgResponseTime}ms</span>
                  <span className="text-gray-500 ml-1">avg response</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('memories')}
                  className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-center"
                >
                  <Plus className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-purple-900">New Memory</span>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-center"
                >
                  <Search className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-blue-900">Smart Search</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-center"
                >
                  <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-900">Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('collaboration')}
                  className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors text-center"
                >
                  <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-orange-900">Collaborate</span>
                </button>
              </div>
            </div>

            {/* Recent Memories and Popular Searches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Memories */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Memories</h3>
                  <button
                    onClick={() => setActiveTab('memories')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {memories.slice(0, 4).map((memory) => (
                    <div key={memory.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-shrink-0 pt-1">
                        {getTypeIcon(memory.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">{memory.title}</h4>
                          {memory.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{memory.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {memory.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(memory.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Popular Searches</h3>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Search Now
                  </button>
                </div>
                <div className="space-y-3">
                  {searchAnalytics.popularQueries.map((query, index) => (
                    <div key={query} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900">{query}</span>
                      </div>
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">Total Searches Today</span>
                    <span className="text-blue-900 font-bold">{searchAnalytics.totalSearches.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-grow md:mr-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search memories, tags, content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="note">Notes</option>
                    <option value="idea">Ideas</option>
                    <option value="task">Tasks</option>
                    <option value="reference">References</option>
                    <option value="project">Projects</option>
                    <option value="learning">Learning</option>
                    <option value="favorites">Favorites</option>
                    <option value="private">Private</option>
                  </select>
                  <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus className="h-5 w-5" />
                    <span>New Memory</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Memories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.map((memory) => (
                <div key={memory.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(memory.type)}
                      <span className="text-sm font-medium text-gray-600 capitalize">{memory.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {memory.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      {memory.isPrivate ? <Lock className="h-4 w-4 text-gray-400" /> : <Globe className="h-4 w-4 text-green-500" />}
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{memory.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{memory.content}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {memory.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {memory.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{memory.tags.length - 3} more</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{memory.accessCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Sparkles className="h-4 w-4" />
                        <span>{memory.aiScore}%</span>
                      </div>
                    </div>
                    <span>{new Date(memory.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(memory.priority)}`}>
                      {memory.priority}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-purple-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMemories.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-12 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No memories found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or create a new memory to get started.</p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Create Your First Memory
                </button>
              </div>
            )}
          </div>
        )}

        {/* Other tabs would be implemented similarly with full memory management features */}
        {activeTab !== 'dashboard' && activeTab !== 'memories' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced {activeTab} features with AI-powered intelligence and comprehensive analytics.
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 MemorAI. All rights reserved. | AI-Powered Memory Management
            </div>
            <div className="text-sm text-gray-600">
              Intelligent Insights • {user?.email}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

