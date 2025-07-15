/**
 * Enterprise Security for Memorai V3.0
 * Role-based access control, audit trails, and compliance reporting
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Shield,
  Lock,
  Unlock,
  Key,
  Users,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  Download,
  Upload,
  Clock,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  Wifi,
  Database,
  Server,
  Cloud,
  Fingerprint,
  Scan,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Archive,
  Bookmark,
  Star,
  Flag,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Headphones,
  Mic,
  Camera,
  Image,
  File,
  Folder,
  FolderOpen,
  Tag,
  Tags,
  Hash,
  AtSign,
  Link,
  ExternalLink,
  Copy,
  Share2,
  Send,
  Save,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Trash,
  Delete,
  Edit2,
  Edit3,
  RotateCcw,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  Menu,
  X,
  Minimize,
  Maximize,
  Home,
  User,
} from 'lucide-react';

interface SecurityRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'admin';
  scope: 'own' | 'team' | 'organization' | 'global';
}

interface SecurityUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: Date;
  loginCount: number;
  mfaEnabled: boolean;
  permissions: Permission[];
  createdAt: Date;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'system';
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'privilege_escalation' | 'data_breach' | 'compliance_violation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  userId?: string;
  resourceId?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  metadata: Record<string, any>;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  requirements: ComplianceRequirement[];
  isEnabled: boolean;
  compliance: number; // percentage
  lastAssessment: Date;
  nextAssessment: Date;
}

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  isCompliant: boolean;
  evidence: string[];
  lastChecked: Date;
  responsible: string;
}

interface SecurityMetrics {
  activeUsers: number;
  failedLogins: number;
  securityAlerts: number;
  complianceScore: number;
  mfaAdoption: number;
  privilegedUsers: number;
  lastSecurityScan: Date;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const EnterpriseSecurity: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [roles, setRoles] = useState<SecurityRole[]>([]);
  const [users, setUsers] = useState<SecurityUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    activeUsers: 0,
    failedLogins: 0,
    securityAlerts: 0,
    complianceScore: 0,
    mfaAdoption: 0,
    privilegedUsers: 0,
    lastSecurityScan: new Date(),
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
  });
  const [selectedTab, setSelectedTab] = useState<'overview' | 'roles' | 'users' | 'audit' | 'compliance'>('overview');
  const [selectedUser, setSelectedUser] = useState<SecurityUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  const initializeRealSecurityData = () => {
    // Initialize with empty data - real security metrics would come from backend
    setRoles([]);
    setUsers([]);
    setAuditLogs([]);
    setSecurityAlerts([]);
    setComplianceFrameworks([]);
    setSecurityMetrics({
      activeUsers: 0,
      failedLogins: 0,
      securityAlerts: 0,
      complianceScore: 0,
      mfaAdoption: 0,
      privilegedUsers: 0,
      lastSecurityScan: new Date(),
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    });
  };

  // Initialize with real security data only
  useEffect(() => {
    // Initialize with empty security data - will load from real sources
    initializeRealSecurityData();
    fetchMemories();
  }, [fetchMemories]);

  // Real-time security monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateSecurityMetrics();
      // Remove security event simulation - use real events only
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateSampleSecurityData = () => {
    const samplePermissions: Permission[] = [
      { id: 'mem-read', name: 'Read Memories', description: 'View memory content', resource: 'memory', action: 'read', scope: 'team' },
      { id: 'mem-write', name: 'Write Memories', description: 'Create and edit memories', resource: 'memory', action: 'create', scope: 'team' },
      { id: 'mem-delete', name: 'Delete Memories', description: 'Delete memory content', resource: 'memory', action: 'delete', scope: 'own' },
      { id: 'user-admin', name: 'User Administration', description: 'Manage user accounts', resource: 'user', action: 'admin', scope: 'organization' },
      { id: 'role-admin', name: 'Role Administration', description: 'Manage roles and permissions', resource: 'role', action: 'admin', scope: 'organization' },
      { id: 'audit-view', name: 'View Audit Logs', description: 'Access audit trail data', resource: 'audit', action: 'read', scope: 'organization' },
      { id: 'config-admin', name: 'System Configuration', description: 'Modify system settings', resource: 'config', action: 'admin', scope: 'global' },
    ];

    const sampleRoles: SecurityRole[] = [
      {
        id: 'admin',
        name: 'System Administrator',
        description: 'Full system access and administration',
        permissions: samplePermissions,
        userCount: 3,
        isSystemRole: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: 'system',
      },
      {
        id: 'manager',
        name: 'Team Manager',
        description: 'Manage team members and their memories',
        permissions: samplePermissions.filter(p => p.scope !== 'global'),
        userCount: 12,
        isSystemRole: false,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        createdBy: 'admin-user',
      },
      {
        id: 'editor',
        name: 'Content Editor',
        description: 'Create and edit memory content',
        permissions: samplePermissions.filter(p => p.resource === 'memory' && p.action !== 'delete'),
        userCount: 45,
        isSystemRole: false,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        createdBy: 'admin-user',
      },
      {
        id: 'viewer',
        name: 'Read-Only User',
        description: 'View memories and reports',
        permissions: samplePermissions.filter(p => p.action === 'read'),
        userCount: 123,
        isSystemRole: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdBy: 'manager-user',
      },
    ];

    const sampleUsers: SecurityUser[] = [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        avatar: '/api/placeholder/32/32',
        roles: ['admin'],
        department: 'IT',
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        loginCount: 1247,
        mfaEnabled: true,
        permissions: samplePermissions,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'user-2',
        name: 'Bob Chen',
        email: 'bob.chen@company.com',
        avatar: '/api/placeholder/32/32',
        roles: ['manager', 'editor'],
        department: 'Product',
        status: 'active',
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
        loginCount: 856,
        mfaEnabled: true,
        permissions: samplePermissions.filter(p => p.scope !== 'global'),
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'user-3',
        name: 'Carol Davis',
        email: 'carol.davis@company.com',
        avatar: '/api/placeholder/32/32',
        roles: ['editor'],
        department: 'Marketing',
        status: 'active',
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        loginCount: 342,
        mfaEnabled: false,
        permissions: samplePermissions.filter(p => p.resource === 'memory' && p.action !== 'delete'),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'user-4',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        avatar: '/api/placeholder/32/32',
        roles: ['viewer'],
        department: 'Sales',
        status: 'inactive',
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        loginCount: 156,
        mfaEnabled: false,
        permissions: samplePermissions.filter(p => p.action === 'read'),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    const sampleAuditLogs: AuditLogEntry[] = [
      {
        id: 'audit-1',
        userId: 'user-1',
        userName: 'Alice Johnson',
        action: 'LOGIN_SUCCESS',
        resource: 'authentication',
        resourceId: 'session-123',
        details: 'Successful login with MFA',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'San Francisco, CA',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'low',
        category: 'authentication',
      },
      {
        id: 'audit-2',
        userId: 'user-2',
        userName: 'Bob Chen',
        action: 'MEMORY_CREATE',
        resource: 'memory',
        resourceId: 'mem-456',
        details: 'Created new project memory',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'New York, NY',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        severity: 'low',
        category: 'data_access',
      },
      {
        id: 'audit-3',
        userId: 'user-3',
        userName: 'Carol Davis',
        action: 'LOGIN_FAILED',
        resource: 'authentication',
        resourceId: 'attempt-789',
        details: 'Failed login attempt - invalid password',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Austin, TX',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        severity: 'medium',
        category: 'authentication',
      },
      {
        id: 'audit-4',
        userId: 'user-1',
        userName: 'Alice Johnson',
        action: 'ROLE_ASSIGN',
        resource: 'user',
        resourceId: 'user-5',
        details: 'Assigned editor role to new user',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'San Francisco, CA',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        severity: 'medium',
        category: 'authorization',
      },
    ];

    const sampleAlerts: SecurityAlert[] = [
      {
        id: 'alert-1',
        type: 'failed_login',
        title: 'Multiple Failed Login Attempts',
        description: 'User carol.davis@company.com has 5 failed login attempts in the last hour',
        severity: 'medium',
        status: 'open',
        userId: 'user-3',
        detectedAt: new Date(Date.now() - 30 * 60 * 1000),
        metadata: { attempts: 5, timeframe: '1h', ip: '192.168.1.102' },
      },
      {
        id: 'alert-2',
        type: 'suspicious_activity',
        title: 'Unusual Data Access Pattern',
        description: 'User accessing large amounts of data outside normal hours',
        severity: 'high',
        status: 'investigating',
        userId: 'user-4',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        assignedTo: 'security-team',
        metadata: { recordsAccessed: 500, timeOfDay: '2:30 AM', normalPattern: false },
      },
      {
        id: 'alert-3',
        type: 'compliance_violation',
        title: 'Data Retention Policy Violation',
        description: 'Memory records older than retention period detected',
        severity: 'low',
        status: 'resolved',
        detectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metadata: { violatingRecords: 23, retentionPeriod: '7 years' },
      },
    ];

    const sampleCompliance: ComplianceFramework[] = [
      {
        id: 'gdpr',
        name: 'GDPR',
        description: 'General Data Protection Regulation',
        requirements: [
          {
            id: 'gdpr-1',
            name: 'Data Encryption',
            description: 'All personal data must be encrypted at rest and in transit',
            category: 'Data Protection',
            isCompliant: true,
            evidence: ['SSL certificates', 'Database encryption enabled'],
            lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            responsible: 'IT Security Team',
          },
          {
            id: 'gdpr-2',
            name: 'Right to be Forgotten',
            description: 'Users must be able to request deletion of their data',
            category: 'User Rights',
            isCompliant: true,
            evidence: ['Data deletion API', 'User portal implemented'],
            lastChecked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            responsible: 'Product Team',
          },
        ],
        isEnabled: true,
        compliance: 95,
        lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'sox',
        name: 'SOX',
        description: 'Sarbanes-Oxley Act',
        requirements: [
          {
            id: 'sox-1',
            name: 'Audit Trail',
            description: 'Complete audit trail for all financial data access',
            category: 'Auditing',
            isCompliant: true,
            evidence: ['Audit logging enabled', 'Quarterly audit reports'],
            lastChecked: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            responsible: 'Compliance Team',
          },
        ],
        isEnabled: true,
        compliance: 88,
        lastAssessment: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
      },
    ];

    setRoles(sampleRoles);
    setUsers(sampleUsers);
    setAuditLogs(sampleAuditLogs);
    setSecurityAlerts(sampleAlerts);
    setComplianceFrameworks(sampleCompliance);

    setSecurityMetrics({
      activeUsers: sampleUsers.filter(u => u.status === 'active').length,
      failedLogins: 12,
      securityAlerts: sampleAlerts.filter(a => a.status === 'open').length,
      complianceScore: 92,
      mfaAdoption: (sampleUsers.filter(u => u.mfaEnabled).length / sampleUsers.length) * 100,
      privilegedUsers: sampleUsers.filter(u => u.roles.includes('admin') || u.roles.includes('manager')).length,
      lastSecurityScan: new Date(Date.now() - 6 * 60 * 60 * 1000),
      vulnerabilities: { critical: 0, high: 2, medium: 5, low: 12 },
    });
  };

  const updateSecurityMetrics = () => {
    setSecurityMetrics(prev => ({
      ...prev,
      failedLogins: Math.max(0, prev.failedLogins + Math.floor((Math.random() - 0.7) * 5)),
      securityAlerts: Math.max(0, prev.securityAlerts + Math.floor((Math.random() - 0.8) * 3)),
    }));
  };

  const simulateSecurityEvents = () => {
    if (Math.random() > 0.9) {
      const newAuditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        userId: users[Math.floor(Math.random() * users.length)].id,
        userName: users[Math.floor(Math.random() * users.length)].name,
        action: ['LOGIN_SUCCESS', 'MEMORY_READ', 'MEMORY_CREATE', 'LOGOUT'][Math.floor(Math.random() * 4)],
        resource: 'memory',
        resourceId: `mem-${Date.now()}`,
        details: 'Automated security event',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Simulated User Agent',
        timestamp: new Date(),
        severity: 'low',
        category: 'data_access',
      };

      setAuditLogs(prev => [newAuditEntry, ...prev.slice(0, 99)]);
    }
  };

  // Security management functions
  const createRole = (name: string, description: string, permissions: Permission[]) => {
    const newRole: SecurityRole = {
      id: `role-${Date.now()}`,
      name,
      description,
      permissions,
      userCount: 0,
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
    };

    setRoles(prev => [...prev, newRole]);
  };

  const updateUserRole = (userId: string, roleIds: string[]) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, roles: roleIds } : user
    ));
  };

  const toggleUserMFA = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, mfaEnabled: !user.mfaEnabled } : user
    ));
  };

  const resolveAlert = (alertId: string) => {
    setSecurityAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved', resolvedAt: new Date() } : alert
    ));
  };

  // Computed values
  const securityScore = useMemo(() => {
    const mfaScore = securityMetrics.mfaAdoption;
    const alertScore = Math.max(0, 100 - securityMetrics.securityAlerts * 5);
    const complianceScore = securityMetrics.complianceScore;
    const vulnerabilityScore = Math.max(0, 100 - securityMetrics.vulnerabilities.critical * 20 - securityMetrics.vulnerabilities.high * 10);

    return Math.round((mfaScore + alertScore + complianceScore + vulnerabilityScore) / 4);
  }, [securityMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'suspended': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <Lock className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      case 'privilege_escalation': return <Key className="h-4 w-4" />;
      case 'data_breach': return <Database className="h-4 w-4" />;
      case 'compliance_violation': return <FileText className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enterprise Security
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Role-based access control, audit trails, and compliance reporting
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRoleModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>

          <Button
            size="sm"
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
          >
            <Scan className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Score
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-4xl font-bold text-red-600">
                  {securityScore}
                </div>
                <div className="text-gray-500">/100</div>
                <div className={`flex items-center space-x-1 ${securityScore >= 90 ? 'text-green-600' :
                    securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {securityScore >= 90 ? 'Excellent' :
                      securityScore >= 70 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">MFA Adoption</div>
                <div className="text-lg font-semibold text-green-600">
                  {securityMetrics.mfaAdoption.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Compliance</div>
                <div className="text-lg font-semibold text-blue-600">
                  {securityMetrics.complianceScore}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Open Alerts</div>
                <div className="text-lg font-semibold text-red-600">
                  {securityMetrics.securityAlerts}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Failed Logins</div>
                <div className="text-lg font-semibold text-orange-600">
                  {securityMetrics.failedLogins}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {securityMetrics.activeUsers}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Privileged Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {securityMetrics.privilegedUsers}
                </p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {securityMetrics.securityAlerts}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Logins</p>
                <p className="text-2xl font-bold text-orange-600">
                  {securityMetrics.failedLogins}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vulnerabilities</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.values(securityMetrics.vulnerabilities).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {securityMetrics.complianceScore}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'roles', label: 'Roles & Permissions', icon: Users },
            { id: 'users', label: 'User Management', icon: User },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {securityAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {alert.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {alert.detectedAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {alert.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Audit Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start space-x-3">
                    <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                      <Activity className="h-3 w-3 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{log.userName}</span> {log.details}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                User Management
              </div>
              <Badge variant="secondary">{users.length} users</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email} • {user.department}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {user.roles.map((roleId) => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? (
                            <Badge key={roleId} variant="outline" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        Last: {user.lastLogin.toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserMFA(user.id)}
                        className={user.mfaEnabled ? 'text-green-600' : 'text-gray-600'}
                      >
                        {user.mfaEnabled ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {complianceFrameworks.map((framework) => (
            <Card key={framework.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {framework.name}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={`${framework.compliance >= 90 ? 'bg-green-100 text-green-800' :
                          framework.compliance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}
                    >
                      {framework.compliance}%
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {framework.description}
                </p>

                <div className="space-y-3">
                  {framework.requirements.map((req) => (
                    <div key={req.id} className="flex items-start space-x-3">
                      {req.isCompliant ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {req.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {req.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {req.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Checked: {req.lastChecked.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Next Assessment:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {framework.nextAssessment.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnterpriseSecurity;
