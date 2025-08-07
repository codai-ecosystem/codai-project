'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Clock,
  User,
  Shield,
  Key,
  Database,
  Server,
  Globe,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Activity,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Settings,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Fingerprint,
  CreditCard,
  Mail,
  Phone,
  MoreVertical,
  ChevronDown,
  ArrowUpDown,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Zap,
  Target,
  Archive,
  Flag,
  Tag
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  userEmail: string;
  userRole: string;
  action: string;
  actionType: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'access' | 'security' | 'system';
  resource: string;
  resourceType: 'user' | 'system' | 'data' | 'security' | 'config' | 'auth' | 'api' | 'file';
  description: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  device: string;
  status: 'success' | 'failed' | 'warning' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: {
    sessionId?: string;
    requestId?: string;
    duration?: number;
    changes?: any;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    context?: any;
  };
  tags: string[];
  compliance: {
    gdpr?: boolean;
    sox?: boolean;
    hipaa?: boolean;
    pci?: boolean;
  };
}

interface AuditFilter {
  dateRange: {
    start: string;
    end: string;
  };
  users: string[];
  actions: string[];
  resources: string[];
  severity: string[];
  status: string[];
  tags: string[];
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  criticalEvents: number;
  failedActions: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
  topUsers: { username: string; count: number }[];
  complianceScore: number;
}

export default function AuditLogs() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<AuditFilter>({
    dateRange: {
      start: '2024-08-05',
      end: '2024-08-06'
    },
    users: [],
    actions: [],
    resources: [],
    severity: [],
    status: [],
    tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Mock audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-08-06T10:30:15Z',
      userId: 'u1',
      username: 'admin',
      userEmail: 'admin@codai.com',
      userRole: 'master_admin',
      action: 'User Login',
      actionType: 'login',
      resource: 'Authentication System',
      resourceType: 'auth',
      description: 'Successful login from new location',
      ipAddress: '192.168.1.100',
      location: 'Bucharest, Romania',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      device: 'Desktop',
      status: 'success',
      severity: 'low',
      metadata: {
        sessionId: 'sess_12345',
        duration: 1200,
        context: { loginMethod: '2FA', newLocation: true }
      },
      tags: ['authentication', 'security'],
      compliance: { gdpr: true, sox: true }
    },
    {
      id: '2',
      timestamp: '2024-08-06T10:25:42Z',
      userId: 'u2',
      username: 'security_admin',
      userEmail: 'security@codai.com',
      userRole: 'admin',
      action: 'Security Policy Update',
      actionType: 'update',
      resource: 'Password Policy',
      resourceType: 'security',
      description: 'Updated password complexity requirements',
      ipAddress: '10.0.1.50',
      location: 'Cluj, Romania',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      device: 'Desktop',
      status: 'success',
      severity: 'medium',
      metadata: {
        sessionId: 'sess_12346',
        changes: { minLength: { old: 8, new: 12 }, requireSymbols: { old: false, new: true } },
        reason: 'Enhanced security compliance'
      },
      tags: ['security', 'policy', 'compliance'],
      compliance: { gdpr: true, sox: true, pci: true }
    },
    {
      id: '3',
      timestamp: '2024-08-06T10:20:18Z',
      userId: 'u3',
      username: 'data_admin',
      userEmail: 'data@codai.com',
      userRole: 'admin',
      action: 'Data Export',
      actionType: 'read',
      resource: 'User Database',
      resourceType: 'data',
      description: 'Exported user analytics data for compliance report',
      ipAddress: '192.168.1.75',
      location: 'Timisoara, Romania',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      device: 'Desktop',
      status: 'success',
      severity: 'high',
      metadata: {
        sessionId: 'sess_12347',
        requestId: 'req_98765',
        context: { exportType: 'compliance', recordCount: 1247, format: 'CSV' }
      },
      tags: ['data', 'export', 'compliance', 'gdpr'],
      compliance: { gdpr: true, hipaa: true }
    },
    {
      id: '4',
      timestamp: '2024-08-06T10:15:33Z',
      userId: 'u4',
      username: 'user_manager',
      userEmail: 'manager@codai.com',
      userRole: 'moderator',
      action: 'User Account Suspension',
      actionType: 'update',
      resource: 'User Account (ID: 5678)',
      resourceType: 'user',
      description: 'Suspended user account due to policy violation',
      ipAddress: '172.16.0.10',
      location: 'Iasi, Romania',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      device: 'Mobile',
      status: 'success',
      severity: 'high',
      metadata: {
        sessionId: 'sess_12348',
        changes: { status: { old: 'active', new: 'suspended' } },
        reason: 'Multiple policy violations detected',
        context: { violations: ['spam', 'inappropriate_content'], reviewerId: 'u4' }
      },
      tags: ['user_management', 'security', 'policy_violation'],
      compliance: { gdpr: true }
    },
    {
      id: '5',
      timestamp: '2024-08-06T10:10:22Z',
      userId: 'system',
      username: 'SYSTEM',
      userEmail: 'system@codai.com',
      userRole: 'system',
      action: 'Database Backup',
      actionType: 'system',
      resource: 'Main Database',
      resourceType: 'data',
      description: 'Automated daily database backup completed',
      ipAddress: '127.0.0.1',
      location: 'Server Location',
      userAgent: 'System Process',
      device: 'Server',
      status: 'success',
      severity: 'low',
      metadata: {
        duration: 3600,
        context: { backupSize: '2.5GB', location: 'backup_server_01', retention: '30days' }
      },
      tags: ['system', 'backup', 'automated'],
      compliance: { gdpr: true, sox: true, hipaa: true }
    },
    {
      id: '6',
      timestamp: '2024-08-06T10:05:11Z',
      userId: 'u5',
      username: 'api_user',
      userEmail: 'api@codai.com',
      userRole: 'user',
      action: 'API Rate Limit Exceeded',
      actionType: 'access',
      resource: 'REST API',
      resourceType: 'api',
      description: 'API rate limit exceeded, request blocked',
      ipAddress: '203.45.67.89',
      location: 'Unknown',
      userAgent: 'API Client v2.1.0',
      device: 'API',
      status: 'failed',
      severity: 'medium',
      metadata: {
        requestId: 'req_98766',
        context: { endpoint: '/api/users', limit: 1000, attempts: 1001, blockDuration: '1hour' }
      },
      tags: ['api', 'rate_limiting', 'security'],
      compliance: { sox: true }
    },
    {
      id: '7',
      timestamp: '2024-08-06T10:00:45Z',
      userId: 'u6',
      username: 'config_admin',
      userEmail: 'config@codai.com',
      userRole: 'admin',
      action: 'System Configuration Change',
      actionType: 'update',
      resource: 'Application Settings',
      resourceType: 'config',
      description: 'Updated security timeout settings',
      ipAddress: '192.168.1.200',
      location: 'Constanta, Romania',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      device: 'Desktop',
      status: 'success',
      severity: 'medium',
      metadata: {
        sessionId: 'sess_12349',
        changes: { sessionTimeout: { old: 3600, new: 1800 }, idleTimeout: { old: 1800, new: 900 } },
        reason: 'Enhanced security posture'
      },
      tags: ['configuration', 'security', 'timeout'],
      compliance: { sox: true, pci: true }
    },
    {
      id: '8',
      timestamp: '2024-08-06T09:55:37Z',
      userId: 'u7',
      username: 'guest_user',
      userEmail: 'guest@example.com',
      userRole: 'user',
      action: 'Failed Login Attempt',
      actionType: 'login',
      resource: 'Authentication System',
      resourceType: 'auth',
      description: 'Failed login attempt with invalid credentials',
      ipAddress: '45.123.45.67',
      location: 'Unknown',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      device: 'Desktop',
      status: 'failed',
      severity: 'medium',
      metadata: {
        context: { failureReason: 'invalid_password', attemptNumber: 3, remainingAttempts: 2 }
      },
      tags: ['authentication', 'security', 'failed_login'],
      compliance: { gdpr: true }
    }
  ]);

  // Mock audit statistics
  const [auditStats, setAuditStats] = useState<AuditStats>({
    totalLogs: 15487,
    todayLogs: 234,
    criticalEvents: 3,
    failedActions: 12,
    uniqueUsers: 67,
    topActions: [
      { action: 'User Login', count: 145 },
      { action: 'Data Access', count: 89 },
      { action: 'Configuration Change', count: 34 },
      { action: 'User Management', count: 23 },
      { action: 'Security Event', count: 12 }
    ],
    topUsers: [
      { username: 'admin', count: 45 },
      { username: 'security_admin', count: 28 },
      { username: 'data_admin', count: 19 },
      { username: 'user_manager', count: 15 },
      { username: 'config_admin', count: 12 }
    ],
    complianceScore: 94.2
  });

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
      case 'logout':
        return <Key className="w-4 h-4" />;
      case 'create':
        return <UserPlus className="w-4 h-4" />;
      case 'update':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'read':
      case 'access':
        return <Eye className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'system':
        return <Server className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'api':
        return <Database className="w-4 h-4" />;
      case 'server':
        return <Server className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Failed to refresh audit logs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportLogs = () => {
    console.log('Exporting audit logs...');
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aValue = a[sortBy as keyof AuditLog];
    const bValue = b[sortBy as keyof AuditLog];
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  return (
    <div className="lg:pl-64">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive audit trail and compliance monitoring
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
            
            <button
              onClick={exportLogs}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.totalLogs.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Logs</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.todayLogs}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.criticalEvents}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Actions</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.failedActions}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.uniqueUsers}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">{auditStats.complianceScore}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Actions</option>
                    <option value="login">Login/Logout</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Resources</option>
                    <option value="user">User Management</option>
                    <option value="system">System</option>
                    <option value="security">Security</option>
                    <option value="data">Data</option>
                    <option value="auth">Authentication</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLogs(paginatedLogs.map(log => log.id));
                        } else {
                          setSelectedLogs([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedLogs.includes(log.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLogs([...selectedLogs, log.id]);
                          } else {
                            setSelectedLogs(selectedLogs.filter(id => id !== log.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(log.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{log.username}</div>
                          <div className="text-sm text-gray-500">{log.userRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-1 rounded mr-2 ${getSeverityColor(log.severity)}`}>
                          {getActionTypeIcon(log.actionType)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.action}</div>
                          <div className="text-sm text-gray-500">{log.actionType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resource}</div>
                      <div className="text-sm text-gray-500">{log.resourceType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedLogs.length)}</span> of{' '}
                  <span className="font-medium">{sortedLogs.length}</span> results
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Actions</h3>
            <div className="space-y-3">
              {auditStats.topActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{action.action}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(action.count / auditStats.topActions[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{action.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
            <div className="space-y-3">
              {auditStats.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{user.username}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(user.count / auditStats.topUsers[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Log Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timestamp:</span>
                        <span className="text-gray-900 font-medium">{formatDate(selectedLog.timestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">User:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Role:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.userRole}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Action:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.action}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resource:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.resource}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Context Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">IP Address:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.ipAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Device:</span>
                        <span className="text-gray-900 font-medium">{selectedLog.device}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium ${selectedLog.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedLog.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Severity:</span>
                        <span className={`font-medium ${
                          selectedLog.severity === 'critical' ? 'text-red-600' :
                          selectedLog.severity === 'high' ? 'text-orange-600' :
                          selectedLog.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {selectedLog.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Description</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedLog.description}</p>
                </div>
                
                {selectedLog.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Metadata</h4>
                    <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tags & Compliance</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedLog.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedLog.compliance).map(([key, value]) => (
                      value && (
                        <span key={key} className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded">
                          {key.toUpperCase()}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
