// Comprehensive Admin Service for Administrative Panel & Management Platform
import { useState, useEffect } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator' | 'user'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
  permissions: string[]
  avatar?: string
  department?: string
  twoFactorEnabled: boolean
  loginAttempts: number
  lastPasswordChange: Date | null
}

export interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  systemUptime: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  networkTraffic: number
  errorRate: number
  responseTime: number
  dailyLogins: number
  weeklyLogins: number
  monthlyLogins: number
  revenue: number
  conversionRate: number
  churnRate: number
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: Record<string, any>
  success: boolean
}

export interface SystemAlert {
  id: string
  type: 'security' | 'performance' | 'system' | 'business'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
  metadata: Record<string, any>
}

export interface BackupInfo {
  id: string
  type: 'full' | 'incremental' | 'differential'
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  startTime: Date
  endTime?: Date
  size: number
  location: string
  checksum: string
  retentionDays: number
  createdBy: string
}

export interface SystemConfig {
  id: string
  category: string
  key: string
  value: any
  type: 'string' | 'number' | 'boolean' | 'json' | 'array'
  description: string
  isSecret: boolean
  isRequired: boolean
  validationRules?: Record<string, any>
  lastModified: Date
  modifiedBy: string
}

export interface AdminReport {
  id: string
  name: string
  type: 'users' | 'security' | 'performance' | 'business' | 'custom'
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand'
  format: 'pdf' | 'csv' | 'excel' | 'json'
  recipients: string[]
  parameters: Record<string, any>
  lastGenerated?: Date
  nextScheduled?: Date
  isActive: boolean
  createdBy: string
  createdAt: Date
}

class AdminService {
  private baseURL = '/api/admin'
  private users: Map<string, User> = new Map()
  private auditLogs: AuditLog[] = []
  private systemAlerts: SystemAlert[] = []
  private backups: BackupInfo[] = []
  private systemConfigs: Map<string, SystemConfig> = new Map()
  private reports: Map<string, AdminReport> = new Map()

  constructor() {
    this.initializeMockData()
    this.startRealTimeMonitoring()
  }

  private initializeMockData() {
    // Initialize mock users
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@codai.com',
        name: 'System Administrator',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date(),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        permissions: ['*'],
        department: 'IT',
        twoFactorEnabled: true,
        loginAttempts: 0,
        lastPasswordChange: new Date('2024-06-01')
      },
      {
        id: '2',
        email: 'john.doe@codai.com',
        name: 'John Doe',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000),
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date(),
        permissions: ['user:read', 'user:write', 'system:read'],
        department: 'Operations',
        twoFactorEnabled: true,
        loginAttempts: 0,
        lastPasswordChange: new Date('2024-05-15')
      },
      {
        id: '3',
        email: 'jane.smith@codai.com',
        name: 'Jane Smith',
        role: 'moderator',
        status: 'active',
        lastLogin: new Date(Date.now() - 7200000),
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date(),
        permissions: ['user:read', 'content:moderate'],
        department: 'Support',
        twoFactorEnabled: false,
        loginAttempts: 0,
        lastPasswordChange: new Date('2024-04-01')
      }
    ]

    mockUsers.forEach(user => this.users.set(user.id, user))

    // Initialize mock audit logs
    this.auditLogs = [
      {
        id: '1',
        userId: '1',
        userName: 'System Administrator',
        action: 'user_created',
        resource: 'users',
        resourceId: '3',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 3600000),
        severity: 'medium',
        details: { newUserEmail: 'jane.smith@codai.com' },
        success: true
      },
      {
        id: '2',
        userId: '2',
        userName: 'John Doe',
        action: 'login_failed',
        resource: 'auth',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 1800000),
        severity: 'high',
        details: { reason: 'invalid_password', attempts: 3 },
        success: false
      }
    ]

    // Initialize mock system alerts
    this.systemAlerts = [
      {
        id: '1',
        type: 'performance',
        severity: 'warning',
        title: 'High Memory Usage',
        message: 'System memory usage has exceeded 85%',
        timestamp: new Date(Date.now() - 900000),
        acknowledged: false,
        resolved: false,
        metadata: { memoryUsage: 87.3, threshold: 85 }
      },
      {
        id: '2',
        type: 'security',
        severity: 'critical',
        title: 'Multiple Failed Login Attempts',
        message: 'Detected multiple failed login attempts from IP 192.168.1.105',
        timestamp: new Date(Date.now() - 1800000),
        acknowledged: true,
        acknowledgedBy: 'admin@codai.com',
        acknowledgedAt: new Date(Date.now() - 1500000),
        resolved: false,
        metadata: { ipAddress: '192.168.1.105', attempts: 5 }
      }
    ]

    // Initialize mock backups
    this.backups = [
      {
        id: '1',
        type: 'full',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000),
        endTime: new Date(Date.now() - 82800000),
        size: 2147483648, // 2GB
        location: '/backups/full_2024_07_04.tar.gz',
        checksum: 'sha256:abc123...',
        retentionDays: 30,
        createdBy: 'system'
      },
      {
        id: '2',
        type: 'incremental',
        status: 'completed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3300000),
        size: 104857600, // 100MB
        location: '/backups/inc_2024_07_05.tar.gz',
        checksum: 'sha256:def456...',
        retentionDays: 7,
        createdBy: 'system'
      }
    ]

    // Initialize mock system configs
    const mockConfigs: SystemConfig[] = [
      {
        id: '1',
        category: 'security',
        key: 'password_min_length',
        value: 8,
        type: 'number',
        description: 'Minimum password length required',
        isSecret: false,
        isRequired: true,
        validationRules: { min: 6, max: 128 },
        lastModified: new Date(),
        modifiedBy: 'admin@codai.com'
      },
      {
        id: '2',
        category: 'email',
        key: 'smtp_server',
        value: 'smtp.codai.com',
        type: 'string',
        description: 'SMTP server for sending emails',
        isSecret: false,
        isRequired: true,
        lastModified: new Date(),
        modifiedBy: 'admin@codai.com'
      },
      {
        id: '3',
        category: 'api',
        key: 'rate_limit',
        value: 1000,
        type: 'number',
        description: 'API rate limit per hour',
        isSecret: false,
        isRequired: true,
        validationRules: { min: 100, max: 10000 },
        lastModified: new Date(),
        modifiedBy: 'admin@codai.com'
      }
    ]

    mockConfigs.forEach(config => this.systemConfigs.set(config.id, config))

    // Initialize mock reports
    const mockReports: AdminReport[] = [
      {
        id: '1',
        name: 'Daily User Activity Report',
        type: 'users',
        schedule: 'daily',
        format: 'pdf',
        recipients: ['admin@codai.com', 'manager@codai.com'],
        parameters: { includeInactive: false },
        lastGenerated: new Date(Date.now() - 86400000),
        nextScheduled: new Date(Date.now() + 3600000),
        isActive: true,
        createdBy: 'admin@codai.com',
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Weekly Security Audit',
        type: 'security',
        schedule: 'weekly',
        format: 'csv',
        recipients: ['security@codai.com'],
        parameters: { severityLevel: 'medium' },
        lastGenerated: new Date(Date.now() - 604800000),
        nextScheduled: new Date(Date.now() + 86400000),
        isActive: true,
        createdBy: 'admin@codai.com',
        createdAt: new Date('2024-01-01')
      }
    ]

    mockReports.forEach(report => this.reports.set(report.id, report))
  }

  private startRealTimeMonitoring() {
    // Simulate real-time monitoring
    setInterval(() => {
      this.updateSystemMetrics()
      this.checkSystemHealth()
    }, 30000) // Update every 30 seconds
  }

  private updateSystemMetrics() {
    // Simulate metric updates
    const now = Date.now()
    const variance = () => (Math.random() - 0.5) * 0.1

    // Update system metrics with some randomness
    this.systemMetrics = {
      ...this.systemMetrics,
      memoryUsage: Math.max(0, Math.min(100, 75 + variance() * 100)),
      cpuUsage: Math.max(0, Math.min(100, 45 + variance() * 100)),
      networkTraffic: Math.random() * 1000000,
      responseTime: 150 + variance() * 100
    }
  }

  private checkSystemHealth() {
    // Generate alerts based on system conditions
    if (this.systemMetrics.memoryUsage > 90) {
      this.generateAlert('performance', 'critical', 'Critical Memory Usage',
        `Memory usage at ${this.systemMetrics.memoryUsage.toFixed(1)}%`)
    }

    if (this.systemMetrics.cpuUsage > 95) {
      this.generateAlert('performance', 'critical', 'Critical CPU Usage',
        `CPU usage at ${this.systemMetrics.cpuUsage.toFixed(1)}%`)
    }
  }

  private generateAlert(type: SystemAlert['type'], severity: SystemAlert['severity'],
    title: string, message: string, metadata: Record<string, any> = {}) {
    const alert: SystemAlert = {
      id: Date.now().toString(),
      type,
      severity,
      title,
      message,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      metadata
    }

    this.systemAlerts.unshift(alert)

    // Keep only latest 100 alerts
    if (this.systemAlerts.length > 100) {
      this.systemAlerts = this.systemAlerts.slice(0, 100)
    }
  }

  private systemMetrics: SystemMetrics = {
    totalUsers: 1250,
    activeUsers: 892,
    systemUptime: 99.9,
    memoryUsage: 76.3,
    cpuUsage: 42.1,
    diskUsage: 68.7,
    networkTraffic: 547829,
    errorRate: 0.02,
    responseTime: 156,
    dailyLogins: 234,
    weeklyLogins: 1678,
    monthlyLogins: 7234,
    revenue: 125430.50,
    conversionRate: 3.2,
    churnRate: 1.8
  }

  // User Management
  async getUsers(filters?: {
    role?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    let users = Array.from(this.users.values())

    if (filters) {
      if (filters.role) {
        users = users.filter(user => user.role === filters.role)
      }
      if (filters.status) {
        users = users.filter(user => user.status === filters.status)
      }
      if (filters.search) {
        const search = filters.search.toLowerCase()
        users = users.filter(user =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
        )
      }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      users: users.slice(startIndex, endIndex),
      total: users.length,
      page,
      totalPages: Math.ceil(users.length / limit)
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.users.set(user.id, user)

    // Log the action
    this.logAuditEvent('user_created', 'users', user.id, {
      userEmail: user.email,
      userRole: user.role
    })

    return user
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    }

    this.users.set(id, updatedUser)

    // Log the action
    this.logAuditEvent('user_updated', 'users', id, { updates })

    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id)
    if (!user) return false

    this.users.delete(id)

    // Log the action
    this.logAuditEvent('user_deleted', 'users', id, {
      userEmail: user.email
    })

    return true
  }

  async suspendUser(id: string, reason: string): Promise<boolean> {
    const user = await this.updateUser(id, { status: 'suspended' })
    if (!user) return false

    this.logAuditEvent('user_suspended', 'users', id, { reason })
    return true
  }

  async activateUser(id: string): Promise<boolean> {
    const user = await this.updateUser(id, { status: 'active' })
    if (!user) return false

    this.logAuditEvent('user_activated', 'users', id, {})
    return true
  }

  // System Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    return { ...this.systemMetrics }
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    checks: Array<{ name: string; status: 'pass' | 'fail'; message?: string }>
  }> {
    const checks = [
      {
        name: 'Memory Usage',
        status: this.systemMetrics.memoryUsage < 85 ? 'pass' : 'fail' as const,
        message: this.systemMetrics.memoryUsage >= 85 ?
          `High memory usage: ${this.systemMetrics.memoryUsage.toFixed(1)}%` : undefined
      },
      {
        name: 'CPU Usage',
        status: this.systemMetrics.cpuUsage < 90 ? 'pass' : 'fail' as const,
        message: this.systemMetrics.cpuUsage >= 90 ?
          `High CPU usage: ${this.systemMetrics.cpuUsage.toFixed(1)}%` : undefined
      },
      {
        name: 'Disk Usage',
        status: this.systemMetrics.diskUsage < 85 ? 'pass' : 'fail' as const,
        message: this.systemMetrics.diskUsage >= 85 ?
          `High disk usage: ${this.systemMetrics.diskUsage.toFixed(1)}%` : undefined
      },
      {
        name: 'Error Rate',
        status: this.systemMetrics.errorRate < 0.05 ? 'pass' : 'fail' as const,
        message: this.systemMetrics.errorRate >= 0.05 ?
          `High error rate: ${(this.systemMetrics.errorRate * 100).toFixed(2)}%` : undefined
      }
    ]

    const failedChecks = checks.filter(check => check.status === 'fail')
    const status = failedChecks.length === 0 ? 'healthy' :
      failedChecks.length <= 1 ? 'warning' : 'critical'

    return { status, checks }
  }

  // Audit Logs
  async getAuditLogs(filters?: {
    userId?: string
    action?: string
    severity?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    let logs = [...this.auditLogs]

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId)
      }
      if (filters.action) {
        logs = logs.filter(log => log.action.includes(filters.action!))
      }
      if (filters.severity) {
        logs = logs.filter(log => log.severity === filters.severity)
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!)
      }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 50
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      logs: logs.slice(startIndex, endIndex),
      total: logs.length,
      page,
      totalPages: Math.ceil(logs.length / limit)
    }
  }

  private logAuditEvent(action: string, resource: string, resourceId?: string,
    details: Record<string, any> = {}, severity: AuditLog['severity'] = 'medium') {
    const log: AuditLog = {
      id: Date.now().toString(),
      userId: 'current-user-id', // In real implementation, get from auth context
      userName: 'Current User',
      action,
      resource,
      resourceId,
      ipAddress: '192.168.1.100', // In real implementation, get from request
      userAgent: navigator?.userAgent || 'Unknown',
      timestamp: new Date(),
      severity,
      details,
      success: true
    }

    this.auditLogs.unshift(log)

    // Keep only latest 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(0, 1000)
    }
  }

  // System Alerts
  async getSystemAlerts(filters?: {
    type?: string
    severity?: string
    acknowledged?: boolean
    resolved?: boolean
    page?: number
    limit?: number
  }): Promise<{ alerts: SystemAlert[]; total: number; page: number; totalPages: number }> {
    let alerts = [...this.systemAlerts]

    if (filters) {
      if (filters.type) {
        alerts = alerts.filter(alert => alert.type === filters.type)
      }
      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity)
      }
      if (filters.acknowledged !== undefined) {
        alerts = alerts.filter(alert => alert.acknowledged === filters.acknowledged)
      }
      if (filters.resolved !== undefined) {
        alerts = alerts.filter(alert => alert.resolved === filters.resolved)
      }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      alerts: alerts.slice(startIndex, endIndex),
      total: alerts.length,
      page,
      totalPages: Math.ceil(alerts.length / limit)
    }
  }

  async acknowledgeAlert(id: string): Promise<boolean> {
    const alertIndex = this.systemAlerts.findIndex(alert => alert.id === id)
    if (alertIndex === -1) return false

    this.systemAlerts[alertIndex] = {
      ...this.systemAlerts[alertIndex],
      acknowledged: true,
      acknowledgedBy: 'current-user@codai.com',
      acknowledgedAt: new Date()
    }

    this.logAuditEvent('alert_acknowledged', 'alerts', id, {})
    return true
  }

  async resolveAlert(id: string): Promise<boolean> {
    const alertIndex = this.systemAlerts.findIndex(alert => alert.id === id)
    if (alertIndex === -1) return false

    this.systemAlerts[alertIndex] = {
      ...this.systemAlerts[alertIndex],
      resolved: true,
      resolvedBy: 'current-user@codai.com',
      resolvedAt: new Date()
    }

    this.logAuditEvent('alert_resolved', 'alerts', id, {})
    return true
  }

  // Backup Management
  async getBackups(): Promise<BackupInfo[]> {
    return [...this.backups].sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  async createBackup(type: BackupInfo['type']): Promise<BackupInfo> {
    const backup: BackupInfo = {
      id: Date.now().toString(),
      type,
      status: 'running',
      startTime: new Date(),
      size: 0,
      location: `/backups/${type}_${new Date().toISOString().split('T')[0]}.tar.gz`,
      checksum: '',
      retentionDays: type === 'full' ? 30 : type === 'incremental' ? 7 : 14,
      createdBy: 'current-user@codai.com'
    }

    this.backups.unshift(backup)

    // Simulate backup completion
    setTimeout(() => {
      const index = this.backups.findIndex(b => b.id === backup.id)
      if (index !== -1) {
        this.backups[index] = {
          ...this.backups[index],
          status: 'completed',
          endTime: new Date(),
          size: Math.random() * 2147483648, // Random size up to 2GB
          checksum: `sha256:${Math.random().toString(36).substring(7)}`
        }
      }
    }, 5000)

    this.logAuditEvent('backup_created', 'backups', backup.id, { type })
    return backup
  }

  async deleteBackup(id: string): Promise<boolean> {
    const index = this.backups.findIndex(backup => backup.id === id)
    if (index === -1) return false

    this.backups.splice(index, 1)
    this.logAuditEvent('backup_deleted', 'backups', id, {})
    return true
  }

  // System Configuration
  async getSystemConfigs(category?: string): Promise<SystemConfig[]> {
    let configs = Array.from(this.systemConfigs.values())

    if (category) {
      configs = configs.filter(config => config.category === category)
    }

    return configs.sort((a, b) => a.category.localeCompare(b.category) || a.key.localeCompare(b.key))
  }

  async updateSystemConfig(id: string, value: any): Promise<SystemConfig | null> {
    const config = this.systemConfigs.get(id)
    if (!config) return null

    const updatedConfig: SystemConfig = {
      ...config,
      value,
      lastModified: new Date(),
      modifiedBy: 'current-user@codai.com'
    }

    this.systemConfigs.set(id, updatedConfig)

    this.logAuditEvent('config_updated', 'system_config', id, {
      oldValue: config.value,
      newValue: value
    })

    return updatedConfig
  }

  // Reports
  async getReports(): Promise<AdminReport[]> {
    return Array.from(this.reports.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  async generateReport(id: string): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    const report = this.reports.get(id)
    if (!report) {
      return { success: false, error: 'Report not found' }
    }

    // Simulate report generation
    const downloadUrl = `/api/admin/reports/${id}/download?timestamp=${Date.now()}`

    // Update last generated timestamp
    this.reports.set(id, {
      ...report,
      lastGenerated: new Date()
    })

    this.logAuditEvent('report_generated', 'reports', id, {
      reportName: report.name,
      format: report.format
    })

    return { success: true, downloadUrl }
  }

  async createReport(reportData: Omit<AdminReport, 'id' | 'createdAt' | 'createdBy'>): Promise<AdminReport> {
    const report: AdminReport = {
      ...reportData,
      id: Date.now().toString(),
      createdAt: new Date(),
      createdBy: 'current-user@codai.com'
    }

    this.reports.set(report.id, report)

    this.logAuditEvent('report_created', 'reports', report.id, {
      reportName: report.name,
      reportType: report.type
    })

    return report
  }

  async updateReport(id: string, updates: Partial<AdminReport>): Promise<AdminReport | null> {
    const report = this.reports.get(id)
    if (!report) return null

    const updatedReport: AdminReport = {
      ...report,
      ...updates
    }

    this.reports.set(id, updatedReport)

    this.logAuditEvent('report_updated', 'reports', id, { updates })

    return updatedReport
  }

  async deleteReport(id: string): Promise<boolean> {
    const report = this.reports.get(id)
    if (!report) return false

    this.reports.delete(id)

    this.logAuditEvent('report_deleted', 'reports', id, {
      reportName: report.name
    })

    return true
  }

  // Performance Analytics
  async getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    responseTime: Array<{ timestamp: Date; value: number }>
    throughput: Array<{ timestamp: Date; value: number }>
    errorRate: Array<{ timestamp: Date; value: number }>
    userSessions: Array<{ timestamp: Date; value: number }>
  }> {
    const now = new Date()
    const intervals = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
    const intervalMs = timeRange === '1h' ? 60000 : timeRange === '24h' ? 3600000 : 86400000

    const generateDataPoints = (baseValue: number, variance: number) => {
      return Array.from({ length: intervals }, (_, i) => ({
        timestamp: new Date(now.getTime() - (intervals - 1 - i) * intervalMs),
        value: Math.max(0, baseValue + (Math.random() - 0.5) * variance)
      }))
    }

    return {
      responseTime: generateDataPoints(150, 100),
      throughput: generateDataPoints(500, 200),
      errorRate: generateDataPoints(0.02, 0.05),
      userSessions: generateDataPoints(200, 100)
    }
  }

  // Security Analytics
  async getSecurityMetrics(): Promise<{
    failedLogins: number
    suspiciousActivities: number
    blockedIPs: number
    securityScans: number
    vulnerabilities: Array<{
      id: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      status: 'open' | 'investigating' | 'resolved'
      discoveredAt: Date
    }>
  }> {
    return {
      failedLogins: 23,
      suspiciousActivities: 7,
      blockedIPs: 12,
      securityScans: 156,
      vulnerabilities: [
        {
          id: '1',
          severity: 'medium',
          description: 'Outdated SSL certificate detected',
          status: 'investigating',
          discoveredAt: new Date(Date.now() - 86400000)
        },
        {
          id: '2',
          severity: 'low',
          description: 'Weak password policy in legacy system',
          status: 'open',
          discoveredAt: new Date(Date.now() - 172800000)
        }
      ]
    }
  }
}

export default new AdminService()
