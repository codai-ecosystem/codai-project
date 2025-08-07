'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Bell, AlertCircle, CheckCircle, XCircle,
  Clock, Calendar, Settings, Filter, Search, RefreshCw,
  Plus, Edit, Trash2, Copy, Share2, Download, Upload,
  Play, Pause, Square, Eye, EyeOff, MoreHorizontal,
  User, Users, Mail, Phone, MessageSquare, Slack,
  ArrowUp, ArrowDown, ArrowRight, ChevronDown, ChevronRight,
  Target, Award, Star, Heart, Bookmark, Tag, Hash,
  Server, Database, Monitor, Network, HardDrive, Cpu,
  Shield, Lock, Unlock, Key, Zap, Activity, TrendingUp,
  BarChart3, LineChart, PieChart, List, Grid3X3,
  Send, Archive, FolderOpen, ExternalLink, Link,
  Info, HelpCircle, FileText, Code, Terminal
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  source: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  tags: string[];
  metadata?: Record<string, any>;
  escalationLevel: number;
  assignedTo?: string;
  notificationsSent: number;
  relatedIncidents: string[];
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  timeWindow: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  services: string[];
  environments: string[];
  notifications: NotificationChannel[];
  escalationPolicy: string;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
  suppressionRules?: SuppressionRule[];
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  target: string;
  enabled: boolean;
  template?: string;
}

interface SuppressionRule {
  id: string;
  condition: string;
  duration: string;
  reason: string;
}

interface EscalationPolicy {
  id: string;
  name: string;
  steps: EscalationStep[];
  enabled: boolean;
}

interface EscalationStep {
  level: number;
  delay: string;
  recipients: string[];
  channels: NotificationChannel[];
}

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'active' | 'rules' | 'history' | 'config'>('active');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  useEffect(() => {
    loadAlertsData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAlertsData();
      }, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAlertsData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sample Alerts Data
    const sampleAlerts: Alert[] = [
      {
        id: '1',
        title: 'High Error Rate Detected',
        description: 'Payment service error rate exceeds 5% threshold',
        severity: 'critical',
        status: 'active',
        source: 'payment-service',
        service: 'payment-service',
        environment: 'production',
        createdAt: '2024-01-25T14:25:00Z',
        updatedAt: '2024-01-25T14:30:00Z',
        count: 1,
        firstOccurrence: '2024-01-25T14:25:00Z',
        lastOccurrence: '2024-01-25T14:30:00Z',
        tags: ['error-rate', 'payment', 'threshold'],
        metadata: {
          currentErrorRate: 8.5,
          threshold: 5.0,
          affectedTransactions: 247,
          estimatedRevenueLoss: 12450
        },
        escalationLevel: 1,
        notificationsSent: 3,
        relatedIncidents: ['INC-2024-001']
      },
      {
        id: '2',
        title: 'Database Connection Pool Exhausted',
        description: 'All database connections are in use, new requests are being queued',
        severity: 'high',
        status: 'acknowledged',
        source: 'database-service',
        service: 'database-service',
        environment: 'production',
        createdAt: '2024-01-25T14:15:00Z',
        updatedAt: '2024-01-25T14:20:00Z',
        acknowledgedBy: 'john.doe@company.com',
        acknowledgedAt: '2024-01-25T14:18:00Z',
        count: 3,
        firstOccurrence: '2024-01-25T13:45:00Z',
        lastOccurrence: '2024-01-25T14:20:00Z',
        tags: ['database', 'connection-pool', 'performance'],
        metadata: {
          maxConnections: 100,
          activeConnections: 100,
          queueLength: 15,
          avgWaitTime: 2.3
        },
        escalationLevel: 0,
        assignedTo: 'john.doe@company.com',
        notificationsSent: 2,
        relatedIncidents: []
      },
      {
        id: '3',
        title: 'Slow API Response Time',
        description: 'Authentication service response time exceeded 2 seconds',
        severity: 'medium',
        status: 'active',
        source: 'auth-service',
        service: 'auth-service',
        environment: 'production',
        createdAt: '2024-01-25T14:10:00Z',
        updatedAt: '2024-01-25T14:28:00Z',
        count: 5,
        firstOccurrence: '2024-01-25T13:30:00Z',
        lastOccurrence: '2024-01-25T14:28:00Z',
        tags: ['performance', 'response-time', 'authentication'],
        metadata: {
          currentResponseTime: 2.8,
          threshold: 2.0,
          affectedRequests: 1250,
          p95ResponseTime: 3.2
        },
        escalationLevel: 0,
        notificationsSent: 1,
        relatedIncidents: []
      },
      {
        id: '4',
        title: 'Disk Space Low',
        description: 'Application server disk usage is above 85%',
        severity: 'medium',
        status: 'resolved',
        source: 'monitoring-system',
        service: 'app-server',
        environment: 'production',
        createdAt: '2024-01-25T13:45:00Z',
        updatedAt: '2024-01-25T14:15:00Z',
        resolvedAt: '2024-01-25T14:15:00Z',
        count: 1,
        firstOccurrence: '2024-01-25T13:45:00Z',
        lastOccurrence: '2024-01-25T13:45:00Z',
        tags: ['disk-space', 'infrastructure', 'capacity'],
        metadata: {
          currentUsage: 87,
          threshold: 85,
          availableSpace: '15GB',
          totalSpace: '120GB'
        },
        escalationLevel: 0,
        notificationsSent: 1,
        relatedIncidents: []
      },
      {
        id: '5',
        title: 'SSL Certificate Expiring Soon',
        description: 'SSL certificate for api.company.com expires in 7 days',
        severity: 'low',
        status: 'active',
        source: 'ssl-monitor',
        service: 'api-gateway',
        environment: 'production',
        createdAt: '2024-01-25T12:00:00Z',
        updatedAt: '2024-01-25T12:00:00Z',
        count: 1,
        firstOccurrence: '2024-01-25T12:00:00Z',
        lastOccurrence: '2024-01-25T12:00:00Z',
        tags: ['ssl', 'certificate', 'expiration'],
        metadata: {
          domain: 'api.company.com',
          expirationDate: '2024-02-01T12:00:00Z',
          daysUntilExpiration: 7,
          issuer: 'Let\'s Encrypt'
        },
        escalationLevel: 0,
        notificationsSent: 1,
        relatedIncidents: []
      }
    ];

    // Sample Alert Rules
    const sampleAlertRules: AlertRule[] = [
      {
        id: '1',
        name: 'High Error Rate',
        description: 'Trigger when error rate exceeds 5% over 5 minutes',
        condition: 'error_rate > 5',
        threshold: 5,
        timeWindow: '5m',
        severity: 'critical',
        enabled: true,
        services: ['payment-service', 'auth-service'],
        environments: ['production'],
        notifications: [
          { type: 'email', target: 'alerts@company.com', enabled: true },
          { type: 'slack', target: '#alerts', enabled: true },
          { type: 'pagerduty', target: 'payment-team', enabled: true }
        ],
        escalationPolicy: 'default-escalation',
        createdBy: 'admin@company.com',
        createdAt: '2024-01-20T10:00:00Z',
        lastTriggered: '2024-01-25T14:25:00Z',
        triggerCount: 15
      },
      {
        id: '2',
        name: 'Database Connection Pool',
        description: 'Alert when connection pool usage exceeds 90%',
        condition: 'connection_pool_usage > 90',
        threshold: 90,
        timeWindow: '2m',
        severity: 'high',
        enabled: true,
        services: ['database-service'],
        environments: ['production', 'staging'],
        notifications: [
          { type: 'email', target: 'db-team@company.com', enabled: true },
          { type: 'slack', target: '#database-alerts', enabled: true }
        ],
        escalationPolicy: 'database-escalation',
        createdBy: 'dba@company.com',
        createdAt: '2024-01-18T15:30:00Z',
        lastTriggered: '2024-01-25T14:15:00Z',
        triggerCount: 8
      },
      {
        id: '3',
        name: 'Response Time Threshold',
        description: 'Alert when API response time exceeds 2 seconds',
        condition: 'avg_response_time > 2000',
        threshold: 2000,
        timeWindow: '3m',
        severity: 'medium',
        enabled: true,
        services: ['auth-service', 'api-gateway'],
        environments: ['production'],
        notifications: [
          { type: 'email', target: 'api-team@company.com', enabled: true }
        ],
        escalationPolicy: 'api-escalation',
        createdBy: 'api-lead@company.com',
        createdAt: '2024-01-22T09:15:00Z',
        lastTriggered: '2024-01-25T14:10:00Z',
        triggerCount: 22
      },
      {
        id: '4',
        name: 'Disk Space Monitor',
        description: 'Alert when disk usage exceeds 85%',
        condition: 'disk_usage > 85',
        threshold: 85,
        timeWindow: '1m',
        severity: 'medium',
        enabled: true,
        services: ['app-server', 'database-server'],
        environments: ['production', 'staging'],
        notifications: [
          { type: 'email', target: 'infrastructure@company.com', enabled: true },
          { type: 'slack', target: '#infrastructure', enabled: true }
        ],
        escalationPolicy: 'infrastructure-escalation',
        createdBy: 'infra@company.com',
        createdAt: '2024-01-19T14:20:00Z',
        lastTriggered: '2024-01-25T13:45:00Z',
        triggerCount: 5
      }
    ];

    setAlerts(sampleAlerts);
    setAlertRules(sampleAlertRules);
    setLoading(false);
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'suppressed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return AlertCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return Bell;
      default: return Info;
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'active': return XCircle;
      case 'acknowledged': return Clock;
      case 'resolved': return CheckCircle;
      case 'suppressed': return Eye;
      default: return Info;
    }
  };

  const toggleAlertSelection = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const selectAllAlerts = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id));
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged', 
            acknowledgedBy: 'current-user@company.com',
            acknowledgedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved', 
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const bulkAcknowledge = () => {
    setAlerts(prev => prev.map(alert => 
      selectedAlerts.includes(alert.id) && alert.status === 'active'
        ? { 
            ...alert, 
            status: 'acknowledged', 
            acknowledgedBy: 'current-user@company.com',
            acknowledgedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : alert
    ));
    setSelectedAlerts([]);
  };

  const bulkResolve = () => {
    setAlerts(prev => prev.map(alert => 
      selectedAlerts.includes(alert.id) && (alert.status === 'active' || alert.status === 'acknowledged')
        ? { 
            ...alert, 
            status: 'resolved', 
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : alert
    ));
    setSelectedAlerts([]);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesService = filterService === 'all' || alert.service === filterService;

    return matchesSearch && matchesSeverity && matchesStatus && matchesService;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const aValue = a[sortBy as keyof Alert];
    const bValue = b[sortBy as keyof Alert];

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const uniqueServices = Array.from(new Set(alerts.map(alert => alert.service)));
  const activeCriticalAlerts = alerts.filter(alert => alert.status === 'active' && alert.severity === 'critical').length;
  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged').length;
  const resolvedToday = alerts.filter(alert => 
    alert.status === 'resolved' && 
    new Date(alert.resolvedAt || '').toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Alert Management
                  </h1>
                  <p className="text-sm text-gray-600">Monitor, configure, and manage system alerts</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">{activeCriticalAlerts}</p>
                  <p className="text-xs text-gray-600">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">{activeAlerts}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-600">{acknowledgedAlerts}</p>
                  <p className="text-xs text-gray-600">Acknowledged</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{resolvedToday}</p>
                  <p className="text-xs text-gray-600">Resolved Today</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="text-sm">{autoRefresh ? 'Live' : 'Paused'}</span>
              </button>
              
              <button 
                onClick={loadAlertsData}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowCreateRule(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Rule</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1">
            {[
              { id: 'active', label: 'Active Alerts', icon: AlertTriangle },
              { id: 'rules', label: 'Alert Rules', icon: Settings },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'config', label: 'Configuration', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === tab.id
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Search and Filters for Active Alerts */}
      {selectedTab === 'active' && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100/50 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 w-80"
                />
              </div>

              {/* Quick Filters */}
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="suppressed">Suppressed</option>
              </select>

              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
              >
                <option value="all">All Services</option>
                {uniqueServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border border-gray-200 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'bg-white/70 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
              >
                <option value="createdAt">Created</option>
                <option value="severity">Severity</option>
                <option value="status">Status</option>
                <option value="service">Service</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white/70"
              >
                <ArrowUp className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTab === 'active' && selectedAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-blue-100/50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {selectedAlerts.length} alert{selectedAlerts.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={bulkAcknowledge}
                className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors flex items-center space-x-1"
              >
                <Clock className="w-3 h-3" />
                <span>Acknowledge</span>
              </button>
              <button
                onClick={bulkResolve}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Resolve</span>
              </button>
              <button
                onClick={() => setSelectedAlerts([])}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="p-6">
        {selectedTab === 'active' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50">
            <div className="p-6 border-b border-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.length === sortedAlerts.length}
                    onChange={selectAllAlerts}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Alerts ({sortedAlerts.length})
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : sortedAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                  <p className="text-gray-600 mb-4">All systems are running smoothly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAlerts.map((alert, index) => {
                    const isSelected = selectedAlerts.includes(alert.id);
                    const isExpanded = expandedAlert === alert.id;
                    const SeverityIcon = getSeverityIcon(alert.severity);
                    const StatusIcon = getStatusIcon(alert.status);
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-xl transition-all ${
                          isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white/50 hover:shadow-md'
                        } ${alert.severity === 'critical' ? 'border-l-4 border-l-red-500' : 
                             alert.severity === 'high' ? 'border-l-4 border-l-orange-500' :
                             alert.severity === 'medium' ? 'border-l-4 border-l-yellow-500' :
                             'border-l-4 border-l-blue-500'}`}
                      >
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAlertSelection(alert.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                                  <SeverityIcon className="w-4 h-4 mr-1" />
                                  {alert.severity.toUpperCase()}
                                </span>
                                
                                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(alert.status)}`}>
                                  <StatusIcon className="w-4 h-4 mr-1" />
                                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                                </span>
                                
                                <span className="text-sm text-gray-500">
                                  {new Date(alert.createdAt).toLocaleString()}
                                </span>
                                
                                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {alert.service}
                                </span>
                                
                                <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                  {alert.environment}
                                </span>
                              </div>
                              
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                              <p className="text-gray-700 mb-3">{alert.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  <span>Count: {alert.count}</span>
                                  <span>Source: {alert.source}</span>
                                  {alert.assignedTo && <span>Assigned: {alert.assignedTo}</span>}
                                  <span>Notifications: {alert.notificationsSent}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {alert.status === 'active' && (
                                    <>
                                      <button
                                        onClick={() => acknowledgeAlert(alert.id)}
                                        className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                                      >
                                        Acknowledge
                                      </button>
                                      <button
                                        onClick={() => resolveAlert(alert.id)}
                                        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      >
                                        Resolve
                                      </button>
                                    </>
                                  )}
                                  {alert.status === 'acknowledged' && (
                                    <button
                                      onClick={() => resolveAlert(alert.id)}
                                      className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                    >
                                      Resolve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              {alert.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {alert.tags.map((tag) => (
                                    <span 
                                      key={tag}
                                      className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Expanded Metadata */}
                              {isExpanded && alert.metadata && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                                >
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Details</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">First Occurrence:</span>
                                      <p className="text-gray-600">{new Date(alert.firstOccurrence).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Last Occurrence:</span>
                                      <p className="text-gray-600">{new Date(alert.lastOccurrence).toLocaleString()}</p>
                                    </div>
                                    {alert.acknowledgedBy && (
                                      <div>
                                        <span className="font-medium">Acknowledged By:</span>
                                        <p className="text-gray-600">{alert.acknowledgedBy}</p>
                                      </div>
                                    )}
                                    {alert.escalationLevel > 0 && (
                                      <div>
                                        <span className="font-medium">Escalation Level:</span>
                                        <p className="text-gray-600">{alert.escalationLevel}</p>
                                      </div>
                                    )}
                                  </div>
                                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                                    <>
                                      <h4 className="text-sm font-medium text-gray-900 mt-4 mb-2">Metadata</h4>
                                      <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-auto">
                                        {JSON.stringify(alert.metadata, null, 2)}
                                      </pre>
                                    </>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alert Rules Tab */}
        {selectedTab === 'rules' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50">
            <div className="p-6 border-b border-blue-100/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Alert Rules ({alertRules.length})
                </h2>
                <button 
                  onClick={() => setShowCreateRule(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Rule</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {alertRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 bg-white/50 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            rule.enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(rule.severity)}`}>
                            {rule.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{rule.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Condition:</span>
                            <p className="text-gray-600">{rule.condition}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Time Window:</span>
                            <p className="text-gray-600">{rule.timeWindow}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Triggers:</span>
                            <p className="text-gray-600">{rule.triggerCount}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Last Triggered:</span>
                            <p className="text-gray-600">
                              {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {rule.services.map((service) => (
                            <span 
                              key={service}
                              className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-md"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content can be added here */}
        {selectedTab === 'history' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert History</h2>
            <p className="text-gray-600">Historical alert data and analytics will be displayed here.</p>
          </div>
        )}

        {selectedTab === 'config' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Configuration</h2>
            <p className="text-gray-600">Global alert settings and notification configurations.</p>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-blue-100/50 mt-12">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="font-semibold text-gray-900">Incident Response</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Streamlined alert management with automated escalation and response workflows.
              </p>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                View Playbooks →
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Smart Rules</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Intelligent alert rules with machine learning and adaptive thresholds.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Create Rules →
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Multi-Channel Notifications</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Flexible notification delivery across email, Slack, SMS, and webhooks.
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Configure Channels →
              </button>
            </div>
          </div>
          
          <div className="border-t border-blue-100/50 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2024 LogAI Professional Alert Management by CODAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
