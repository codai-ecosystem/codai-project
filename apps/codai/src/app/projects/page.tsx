'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Code2,
  GitBranch,
  Calendar,
  Users,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Folder,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed' | 'Paused' | 'Planning';
  progress: number;
  language: string;
  framework: string;
  lastUpdated: string;
  team: number;
  starred: boolean;
  commits: number;
  branches: number;
  issues: number;
  color: string;
}

const projects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Modern e-commerce platform with AI-powered recommendations',
    status: 'Active',
    progress: 78,
    language: 'TypeScript',
    framework: 'Next.js',
    lastUpdated: '2 hours ago',
    team: 5,
    starred: true,
    commits: 247,
    branches: 8,
    issues: 12,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication',
    status: 'Active',
    progress: 92,
    language: 'React Native',
    framework: 'Expo',
    lastUpdated: '1 day ago',
    team: 6,
    starred: false,
    commits: 189,
    branches: 5,
    issues: 3,
    color: 'bg-green-500'
  },
  {
    id: '3',
    name: 'AI Chatbot Service',
    description: 'Intelligent customer service chatbot with NLP capabilities',
    status: 'Active',
    progress: 45,
    language: 'Python',
    framework: 'FastAPI',
    lastUpdated: '3 hours ago',
    team: 3,
    starred: true,
    commits: 156,
    branches: 12,
    issues: 18,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics dashboard for business intelligence',
    status: 'Completed',
    progress: 100,
    language: 'Vue.js',
    framework: 'Nuxt.js',
    lastUpdated: '1 week ago',
    team: 4,
    starred: false,
    commits: 312,
    branches: 3,
    issues: 0,
    color: 'bg-orange-500'
  },
  {
    id: '5',
    name: 'Blockchain Wallet',
    description: 'Secure cryptocurrency wallet with multi-chain support',
    status: 'Planning',
    progress: 15,
    language: 'Rust',
    framework: 'Tauri',
    lastUpdated: '2 days ago',
    team: 2,
    starred: false,
    commits: 23,
    branches: 2,
    issues: 5,
    color: 'bg-indigo-500'
  },
  {
    id: '6',
    name: 'IoT Management System',
    description: 'Comprehensive IoT device management and monitoring platform',
    status: 'Paused',
    progress: 65,
    language: 'Go',
    framework: 'Gin',
    lastUpdated: '1 month ago',
    team: 3,
    starred: true,
    commits: 198,
    branches: 6,
    issues: 9,
    color: 'bg-red-500'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Completed': 'bg-blue-100 text-blue-800',
  'Paused': 'bg-yellow-100 text-yellow-800',
  'Planning': 'bg-purple-100 text-purple-800'
};

const statusIcons = {
  'Active': CheckCircle,
  'Completed': CheckCircle,
  'Paused': AlertCircle,
  'Planning': Clock
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-80">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">Manage and track your development projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
            <option value="Planning">Planning</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="w-5 h-5 flex flex-col space-y-1">
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
                <div className="h-0.5 bg-current rounded"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const StatusIcon = statusIcons[project.status];
              return (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${project.color} rounded-lg flex items-center justify-center`}>
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Star className={`w-4 h-4 ${project.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {project.status}
                    </span>
                    <span className="text-xs text-gray-500">{project.progress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{project.language}</span>
                    <span>{project.framework}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-3 h-3" />
                        <span>{project.commits}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{project.team}</span>
                      </div>
                    </div>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{project.lastUpdated}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Project</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Progress</th>
                    <th className="text-left p-4 font-medium text-gray-900">Technology</th>
                    <th className="text-left p-4 font-medium text-gray-900">Team</th>
                    <th className="text-left p-4 font-medium text-gray-900">Last Updated</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => {
                    const StatusIcon = statusIcons[project.status];
                    return (
                      <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${project.color} rounded-lg flex items-center justify-center`}>
                              <Code2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{project.name}</h4>
                              <p className="text-sm text-gray-600">{project.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {project.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.language}</div>
                            <div className="text-xs text-gray-600">{project.framework}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{project.team}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600">{project.lastUpdated}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <Folder className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Active').length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.status === 'Completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Commits</p>
                <p className="text-2xl font-bold text-gray-900">{projects.reduce((sum, p) => sum + p.commits, 0)}</p>
              </div>
              <GitBranch className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
