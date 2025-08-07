'use client';

import React, { useState } from 'react';
import {
  Plus,
  Play,
  Save,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  Code2,
  Database,
  Globe,
  Settings,
  Eye,
  Edit3,
  Trash2,
  ChevronRight,
  ChevronDown,
  FileText,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Server,
  Key,
  Lock,
  Unlock,
  ExternalLink,
  BookOpen,
  TestTube
} from 'lucide-react';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'active' | 'draft' | 'deprecated';
  responseTime: number;
  successRate: number;
  lastTested: Date;
  authentication: 'none' | 'api-key' | 'bearer' | 'oauth';
  tags: string[];
  version: string;
}

interface APICollection {
  id: string;
  name: string;
  description: string;
  endpoints: APIEndpoint[];
  isExpanded: boolean;
}

const collections: APICollection[] = [
  {
    id: '1',
    name: 'User Management',
    description: 'APIs for user authentication and profile management',
    isExpanded: true,
    endpoints: [
      {
        id: '1-1',
        name: 'User Login',
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate user with email and password',
        status: 'active',
        responseTime: 245,
        successRate: 99.2,
        lastTested: new Date(Date.now() - 2 * 60 * 60 * 1000),
        authentication: 'none',
        tags: ['auth', 'login'],
        version: 'v1'
      },
      {
        id: '1-2',
        name: 'Get User Profile',
        method: 'GET',
        path: '/api/users/profile',
        description: 'Retrieve authenticated user profile information',
        status: 'active',
        responseTime: 156,
        successRate: 98.8,
        lastTested: new Date(Date.now() - 1 * 60 * 60 * 1000),
        authentication: 'bearer',
        tags: ['users', 'profile'],
        version: 'v1'
      },
      {
        id: '1-3',
        name: 'Update User Profile',
        method: 'PUT',
        path: '/api/users/profile',
        description: 'Update user profile information',
        status: 'active',
        responseTime: 289,
        successRate: 97.5,
        lastTested: new Date(Date.now() - 30 * 60 * 1000),
        authentication: 'bearer',
        tags: ['users', 'profile', 'update'],
        version: 'v1'
      }
    ]
  },
  {
    id: '2',
    name: 'Project Management',
    description: 'APIs for project and workspace management',
    isExpanded: false,
    endpoints: [
      {
        id: '2-1',
        name: 'List Projects',
        method: 'GET',
        path: '/api/projects',
        description: 'Get list of user projects with pagination',
        status: 'active',
        responseTime: 178,
        successRate: 99.5,
        lastTested: new Date(Date.now() - 15 * 60 * 1000),
        authentication: 'bearer',
        tags: ['projects', 'list'],
        version: 'v1'
      },
      {
        id: '2-2',
        name: 'Create Project',
        method: 'POST',
        path: '/api/projects',
        description: 'Create a new project',
        status: 'active',
        responseTime: 345,
        successRate: 98.1,
        lastTested: new Date(Date.now() - 45 * 60 * 1000),
        authentication: 'bearer',
        tags: ['projects', 'create'],
        version: 'v1'
      }
    ]
  },
  {
    id: '3',
    name: 'AI Services',
    description: 'APIs for AI and machine learning services',
    isExpanded: false,
    endpoints: [
      {
        id: '3-1',
        name: 'Code Generation',
        method: 'POST',
        path: '/api/ai/generate-code',
        description: 'Generate code based on natural language description',
        status: 'draft',
        responseTime: 1245,
        successRate: 94.3,
        lastTested: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        authentication: 'api-key',
        tags: ['ai', 'code-generation'],
        version: 'v2'
      }
    ]
  }
];

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
const authTypes = ['none', 'api-key', 'bearer', 'oauth'] as const;

export default function APIBuilderPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    method: 'GET' as const,
    path: '',
    description: '',
    authentication: 'none' as const,
    tags: ''
  });

  const filteredCollections = collections.map(collection => ({
    ...collection,
    endpoints: collection.endpoints.filter(endpoint => {
      const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = selectedMethod === 'all' || endpoint.method === selectedMethod;
      const matchesStatus = selectedStatus === 'all' || endpoint.status === selectedStatus;
      return matchesSearch && matchesMethod && matchesStatus;
    })
  })).filter(collection => collection.endpoints.length > 0);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const testAPI = async (endpoint: APIEndpoint) => {
    setIsTestingAPI(true);
    setTestResults(null);

    // Simulate API testing
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        responseTime: endpoint.responseTime,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '99'
        },
        body: {
          success: true,
          data: {
            message: 'API test successful',
            timestamp: new Date().toISOString()
          }
        }
      };

      setTestResults(mockResponse);
      setIsTestingAPI(false);
    }, 2000);
  };

  const createEndpoint = () => {
    // Logic to create new endpoint
    console.log('Creating endpoint:', newEndpoint);
    setShowCreateModal(false);
    setNewEndpoint({
      name: '',
      method: 'GET',
      path: '',
      description: '',
      authentication: 'none',
      tags: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-80">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">API Builder</h1>
              <p className="text-gray-600 mt-2">Design, test, and manage your API endpoints</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Endpoint</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Endpoints</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collections.reduce((sum, col) => sum + col.endpoints.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">248ms</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">98.2%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active APIs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {collections.reduce((sum, col) =>
                    sum + col.endpoints.filter(ep => ep.status === 'active').length, 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-6">
          {/* API Explorer */}
          <div className="flex-1">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search endpoints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    />
                  </div>

                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Methods</option>
                    {httpMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* API Collections */}
            <div className="space-y-4">
              {filteredCollections.map((collection) => (
                <div key={collection.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-gray-600">
                          {collection.isExpanded ?
                            <ChevronDown className="w-5 h-5" /> :
                            <ChevronRight className="w-5 h-5" />
                          }
                        </button>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{collection.name}</h3>
                          <p className="text-sm text-gray-600">{collection.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{collection.endpoints.length} endpoints</span>
                    </div>
                  </div>

                  {collection.isExpanded && (
                    <div className="divide-y divide-gray-200">
                      {collection.endpoints.map((endpoint) => (
                        <div
                          key={endpoint.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedEndpoint(endpoint)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                                    {endpoint.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 font-mono">{endpoint.path}</p>
                                <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="text-center">
                                <div className="font-medium">{endpoint.responseTime}ms</div>
                                <div className="text-xs">Response</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{endpoint.successRate}%</div>
                                <div className="text-xs">Success</div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testAPI(endpoint);
                                }}
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                              >
                                <TestTube className="w-3 h-3" />
                                <span>Test</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {endpoint.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Details Sidebar */}
          <div className="w-96">
            {selectedEndpoint ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">API Details</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEndpoint.status)}`}>
                        {selectedEndpoint.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{selectedEndpoint.name}</h4>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                      {selectedEndpoint.path}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">{selectedEndpoint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Response Time</p>
                      <p className="font-medium">{selectedEndpoint.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</p>
                      <p className="font-medium">{selectedEndpoint.successRate}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Authentication</p>
                    <div className="flex items-center space-x-2">
                      {selectedEndpoint.authentication === 'none' ?
                        <Unlock className="w-4 h-4 text-gray-400" /> :
                        <Lock className="w-4 h-4 text-green-600" />
                      }
                      <span className="text-sm capitalize">{selectedEndpoint.authentication.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedEndpoint.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => testAPI(selectedEndpoint)}
                      disabled={isTestingAPI}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isTestingAPI ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{isTestingAPI ? 'Testing...' : 'Test API'}</span>
                    </button>
                  </div>

                  {testResults && (
                    <div className="pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Test Results</h5>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`font-medium ${testResults.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                            {testResults.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Response Time</span>
                          <span className="font-medium">{testResults.responseTime}ms</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(testResults.body, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an API</h3>
                <p className="text-gray-600">Choose an endpoint to view details and test functionality</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
