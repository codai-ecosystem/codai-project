'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Star,
  Eye,
  Clock,
  Users,
  Calendar,
  Tag,
  Download,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Folder,
  FileText,
  Code2,
  Bug,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  GitPullRequest,
  Shield
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  watchers: number;
  forks: number;
  issues: number;
  pullRequests: number;
  lastCommit: Date;
  visibility: 'public' | 'private';
  status: 'active' | 'archived' | 'template';
  size: string;
  license?: string;
  topics: string[];
  collaborators: number;
  branches: number;
  commits: number;
}

const repositories: Repository[] = [
  {
    id: '1',
    name: 'codai-frontend',
    description: 'Main frontend application for CODAI development platform',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 245,
    watchers: 18,
    forks: 32,
    issues: 12,
    pullRequests: 5,
    lastCommit: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    visibility: 'public',
    status: 'active',
    size: '45.2 MB',
    license: 'MIT',
    topics: ['react', 'nextjs', 'typescript', 'ai', 'development'],
    collaborators: 8,
    branches: 12,
    commits: 1847
  },
  {
    id: '2',
    name: 'codai-api',
    description: 'RESTful API backend for CODAI platform services',
    language: 'Node.js',
    languageColor: '#339933',
    stars: 189,
    watchers: 15,
    forks: 28,
    issues: 8,
    pullRequests: 3,
    lastCommit: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    visibility: 'public',
    status: 'active',
    size: '23.8 MB',
    license: 'MIT',
    topics: ['nodejs', 'api', 'express', 'mongodb', 'microservices'],
    collaborators: 6,
    branches: 8,
    commits: 1234
  },
  {
    id: '3',
    name: 'ai-ml-models',
    description: 'Machine learning models and AI algorithms for code analysis',
    language: 'Python',
    languageColor: '#3776ab',
    stars: 156,
    watchers: 22,
    forks: 41,
    issues: 15,
    pullRequests: 7,
    lastCommit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    visibility: 'private',
    status: 'active',
    size: '78.5 MB',
    license: 'Apache-2.0',
    topics: ['python', 'machine-learning', 'tensorflow', 'ai', 'nlp'],
    collaborators: 4,
    branches: 15,
    commits: 892
  },
  {
    id: '4',
    name: 'codai-mobile',
    description: 'Mobile companion app for CODAI development platform',
    language: 'React Native',
    languageColor: '#61dafb',
    stars: 98,
    watchers: 12,
    forks: 19,
    issues: 6,
    pullRequests: 2,
    lastCommit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    visibility: 'public',
    status: 'active',
    size: '12.4 MB',
    topics: ['react-native', 'mobile', 'ios', 'android', 'expo'],
    collaborators: 3,
    branches: 6,
    commits: 445
  },
  {
    id: '5',
    name: 'legacy-codebase',
    description: 'Legacy codebase archive for historical reference',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    stars: 23,
    watchers: 5,
    forks: 8,
    issues: 0,
    pullRequests: 0,
    lastCommit: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
    visibility: 'private',
    status: 'archived',
    size: '67.9 MB',
    topics: ['legacy', 'javascript', 'archive'],
    collaborators: 2,
    branches: 3,
    commits: 2156
  }
];

const languageStats = [
  { name: 'TypeScript', percentage: 45, color: '#3178c6' },
  { name: 'JavaScript', percentage: 25, color: '#f1e05a' },
  { name: 'Python', percentage: 20, color: '#3776ab' },
  { name: 'Go', percentage: 10, color: '#00add8' }
];

export default function RepositoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || repo.language === selectedLanguage;
    const matchesStatus = selectedStatus === 'all' || repo.status === selectedStatus;
    return matchesSearch && matchesLanguage && matchesStatus;
  });

  const sortedRepositories = [...filteredRepositories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stars':
        return b.stars - a.stars;
      case 'updated':
        return b.lastCommit.getTime() - a.lastCommit.getTime();
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 30) {
      return `${days}d ago`;
    } else {
      const months = Math.floor(days / 30);
      return `${months}mo ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-80">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
              <p className="text-gray-600 mt-2">Manage your code repositories and projects</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Repository</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Repositories</p>
                <p className="text-2xl font-bold text-gray-900">{repositories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Stars</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repositories.reduce((sum, repo) => sum + repo.stars, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repositories.reduce((sum, repo) => sum + repo.issues, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pull Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repositories.reduce((sum, repo) => sum + repo.pullRequests, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GitPullRequest className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Language Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
          <div className="space-y-4">
            {languageStats.map((lang) => (
              <div key={lang.name} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600">{lang.name}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: lang.color,
                      width: `${lang.percentage}%`
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-8">{lang.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Languages</option>
                <option value="TypeScript">TypeScript</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Node.js">Node.js</option>
                <option value="React Native">React Native</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="template">Template</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="updated">Last Updated</option>
                <option value="name">Name</option>
                <option value="stars">Stars</option>
                <option value="size">Size</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repository List */}
        <div className="space-y-4">
          {sortedRepositories.map((repo) => (
            <div key={repo.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                      {repo.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${repo.visibility === 'public'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {repo.visibility}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${repo.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : repo.status === 'archived'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                      {repo.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{repo.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: repo.languageColor }}
                      />
                      <span>{repo.language}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{repo.stars}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <GitBranch className="w-4 h-4" />
                      <span>{repo.forks}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Bug className="w-4 h-4" />
                      <span>{repo.issues} issues</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <GitPullRequest className="w-4 h-4" />
                      <span>{repo.pullRequests} PRs</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Updated {getTimeAgo(repo.lastCommit)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Download className="w-4 h-4" />
                      <span>{repo.size}</span>
                    </div>
                  </div>

                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {repo.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedRepositories.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
