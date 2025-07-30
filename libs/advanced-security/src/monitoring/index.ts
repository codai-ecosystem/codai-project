/**
 * CODAI Security Monitoring & Analytics System
 * Real-time security monitoring, threat detection, and incident response
 */

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  MFA_SUCCESS = 'MFA_SUCCESS',
  MFA_FAILURE = 'MFA_FAILURE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT',
  MALWARE_DETECTED = 'MALWARE_DETECTED',
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  FILE_ACCESS_VIOLATION = 'FILE_ACCESS_VIOLATION',
  NETWORK_INTRUSION = 'NETWORK_INTRUSION'
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ThreatPattern {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  severity: SecuritySeverity;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecuritySeverity, number>;
  activeThreats: number;
  resolvedThreats: number;
  averageResponseTime: number;
  topAttackers: Array<{ ip: string; attempts: number }>;
  topTargets: Array<{ userId: string; attacks: number }>;
  securityScore: number;
  recommendations: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  eventTypes: SecurityEventType[];
  conditions: AlertCondition[];
  severity: SecuritySeverity;
  enabled: boolean;
  notificationChannels: NotificationChannel[];
  cooldownPeriod: number; // minutes
  lastTriggered?: Date;
}

export interface AlertCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'matches';
  value: any;
  timeWindow?: number; // minutes
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'slack';
  target: string;
  enabled: boolean;
}

export interface SecurityReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident';
  period: { start: Date; end: Date };
  metrics: SecurityMetrics;
  incidents: SecurityEvent[];
  recommendations: string[];
  trends: Array<{ date: Date; value: number; metric: string }>;
  generatedAt: Date;
  generatedBy: string;
}

export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private threatPatterns: ThreatPattern[] = [];
  private alertRules: AlertRule[] = [];
  private activeAlerts: Map<string, Date> = new Map();

  constructor() {
    this.initializeThreatPatterns();
    this.initializeAlertRules();
  }

  /**
   * Log a security event
   */
  logEvent(
    type: SecurityEventType,
    source: string,
    details: Record<string, any> = {},
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity: this.calculateSeverity(type, details),
      source,
      userId: userId || 'unknown',
      sessionId: sessionId || 'unknown',
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      details,
      resolved: false
    };

    this.events.push(event);
    this.analyzeEvent(event);
    this.checkAlertRules(event);

    return event;
  }

  /**
   * Analyze event for threats and anomalies
   */
  private analyzeEvent(event: SecurityEvent): void {
    // Check for brute force attacks
    if (event.type === SecurityEventType.LOGIN_FAILURE) {
      this.checkBruteForceAttack(event);
    }

    // Check for suspicious patterns
    this.checkThreatPatterns(event);

    // Check for anomalies
    this.checkAnomalies(event);

    // Update security metrics
    this.updateMetrics(event);
  }

  /**
   * Check for brute force attacks
   */
  private checkBruteForceAttack(event: SecurityEvent): void {
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    const threshold = 10;
    const now = Date.now();

    const recentFailures = this.events.filter(e =>
      e.type === SecurityEventType.LOGIN_FAILURE &&
      e.ipAddress === event.ipAddress &&
      (now - e.timestamp.getTime()) <= timeWindow
    );

    if (recentFailures.length >= threshold) {
      this.logEvent(
        SecurityEventType.BRUTE_FORCE_ATTEMPT,
        'SecurityMonitor',
        {
          targetIp: event.ipAddress,
          attempts: recentFailures.length,
          timeWindow: '15 minutes'
        }
      );
    }
  }

  /**
   * Check event against threat patterns
   */
  private checkThreatPatterns(event: SecurityEvent): void {
    for (const pattern of this.threatPatterns) {
      if (!pattern.enabled) continue;

      for (const patternRegex of pattern.patterns) {
        const regex = new RegExp(patternRegex, 'i');
        const eventData = JSON.stringify(event.details);

        if (regex.test(eventData)) {
          this.logEvent(
            SecurityEventType.SUSPICIOUS_ACTIVITY,
            'ThreatDetection',
            {
              threatPattern: pattern.name,
              matchedPattern: patternRegex,
              originalEvent: event.id
            },
            event.userId,
            event.sessionId,
            event.ipAddress
          );
          break;
        }
      }
    }
  }

  /**
   * Check for anomalies using statistical analysis
   */
  private checkAnomalies(event: SecurityEvent): void {
    // Check for unusual login times
    if (event.type === SecurityEventType.LOGIN_SUCCESS && event.userId) {
      this.checkUnusualLoginTime(event);
    }

    // Check for unusual locations
    if (event.ipAddress) {
      this.checkUnusualLocation(event);
    }
  }

  /**
   * Check for unusual login times
   */
  private checkUnusualLoginTime(event: SecurityEvent): void {
    const hour = event.timestamp.getHours();
    const userEvents = this.events.filter(e =>
      e.userId === event.userId &&
      e.type === SecurityEventType.LOGIN_SUCCESS &&
      e.id !== event.id
    );

    if (userEvents.length < 10) return; // Need enough data

    const loginHours = userEvents.map(e => e.timestamp.getHours());
    const avgHour = loginHours.reduce((a, b) => a + b, 0) / loginHours.length;
    const hourDiff = Math.abs(hour - avgHour);

    if (hourDiff > 6) { // More than 6 hours difference
      this.logEvent(
        SecurityEventType.ANOMALY_DETECTED,
        'AnomalyDetection',
        {
          anomalyType: 'unusual_login_time',
          currentHour: hour,
          averageHour: Math.round(avgHour),
          deviation: hourDiff
        },
        event.userId,
        event.sessionId,
        event.ipAddress
      );
    }
  }

  /**
   * Check for unusual locations (simplified IP-based)
   */
  private checkUnusualLocation(event: SecurityEvent): void {
    if (!event.userId) return;

    const userEvents = this.events.filter(e =>
      e.userId === event.userId &&
      e.ipAddress &&
      e.id !== event.id
    );

    const knownIPs = new Set(userEvents.map(e => e.ipAddress));

    if (knownIPs.size > 0 && !knownIPs.has(event.ipAddress)) {
      this.logEvent(
        SecurityEventType.ANOMALY_DETECTED,
        'AnomalyDetection',
        {
          anomalyType: 'unusual_location',
          newIP: event.ipAddress,
          knownIPs: Array.from(knownIPs)
        },
        event.userId,
        event.sessionId,
        event.ipAddress
      );
    }
  }

  /**
   * Check alert rules and trigger notifications
   */
  private checkAlertRules(event: SecurityEvent): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled || !rule.eventTypes.includes(event.type)) {
        continue;
      }

      // Check cooldown period
      const lastTriggered = this.activeAlerts.get(rule.id);
      if (lastTriggered) {
        const cooldownMs = rule.cooldownPeriod * 60 * 1000;
        if (Date.now() - lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      // Check conditions
      if (this.evaluateAlertConditions(rule.conditions, event)) {
        this.triggerAlert(rule, event);
      }
    }
  }

  /**
   * Evaluate alert conditions
   */
  private evaluateAlertConditions(conditions: AlertCondition[], event: SecurityEvent): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(event, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  /**
   * Get field value from event
   */
  private getFieldValue(event: SecurityEvent, field: string): any {
    const parts = field.split('.');
    let value: any = event;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'eq': return fieldValue === expectedValue;
      case 'ne': return fieldValue !== expectedValue;
      case 'gt': return fieldValue > expectedValue;
      case 'lt': return fieldValue < expectedValue;
      case 'gte': return fieldValue >= expectedValue;
      case 'lte': return fieldValue <= expectedValue;
      case 'contains': return String(fieldValue).includes(String(expectedValue));
      case 'matches': return new RegExp(String(expectedValue)).test(String(fieldValue));
      default: return false;
    }
  }

  /**
   * Trigger alert and send notifications
   */
  private triggerAlert(rule: AlertRule, event: SecurityEvent): void {
    this.activeAlerts.set(rule.id, new Date());

    // Log alert event
    this.logEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      'AlertSystem',
      {
        alertRule: rule.name,
        triggeredBy: event.id,
        severity: rule.severity
      }
    );

    // Send notifications
    for (const channel of rule.notificationChannels) {
      if (channel.enabled) {
        this.sendNotification(channel, rule, event);
      }
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(
    channel: NotificationChannel,
    rule: AlertRule,
    event: SecurityEvent
  ): Promise<void> {
    const message = this.formatAlertMessage(rule, event);

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailNotification(channel.target, message);
          break;
        case 'sms':
          await this.sendSMSNotification(channel.target, message);
          break;
        case 'webhook':
          await this.sendWebhookNotification(channel.target, rule, event);
          break;
        case 'slack':
          await this.sendSlackNotification(channel.target, message);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${channel.type} notification:`, error);
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(rule: AlertRule, event: SecurityEvent): string {
    return `🚨 SECURITY ALERT: ${rule.name}
    
Severity: ${rule.severity}
Event: ${event.type}
Time: ${event.timestamp.toISOString()}
Source: ${event.source}
${event.userId ? `User: ${event.userId}` : ''}
${event.ipAddress ? `IP: ${event.ipAddress}` : ''}

Details: ${JSON.stringify(event.details, null, 2)}

Alert Rule: ${rule.description}`;
  }

  /**
   * Generate security metrics
   */
  generateMetrics(timeRange?: { start: Date; end: Date }): SecurityMetrics {
    const events = timeRange
      ? this.events.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      : this.events;

    const eventsByType = {} as Record<SecurityEventType, number>;
    const eventsBySeverity = {} as Record<SecuritySeverity, number>;

    // Initialize counters
    Object.values(SecurityEventType).forEach(type => {
      eventsByType[type] = 0;
    });
    Object.values(SecuritySeverity).forEach(severity => {
      eventsBySeverity[severity] = 0;
    });

    // Count events
    events.forEach(event => {
      eventsByType[event.type]++;
      eventsBySeverity[event.severity]++;
    });

    const activeThreats = events.filter(e => !e.resolved && e.severity !== SecuritySeverity.LOW).length;
    const resolvedThreats = events.filter(e => e.resolved).length;

    // Calculate security score (0-100)
    const securityScore = this.calculateSecurityScore(events);

    // Top attackers by IP
    const ipCounts = new Map<string, number>();
    events.forEach(event => {
      if (event.ipAddress && event.severity !== SecuritySeverity.LOW) {
        ipCounts.set(event.ipAddress, (ipCounts.get(event.ipAddress) || 0) + 1);
      }
    });

    const topAttackers = Array.from(ipCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([ip, attempts]) => ({ ip, attempts }));

    // Top targets by user
    const userCounts = new Map<string, number>();
    events.forEach(event => {
      if (event.userId && event.severity !== SecuritySeverity.LOW) {
        userCounts.set(event.userId, (userCounts.get(event.userId) || 0) + 1);
      }
    });

    const topTargets = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, attacks]) => ({ userId, attacks }));

    const recommendations = this.generateRecommendations(events);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      activeThreats,
      resolvedThreats,
      averageResponseTime: this.calculateAverageResponseTime(events),
      topAttackers,
      topTargets,
      securityScore,
      recommendations
    };
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(events: SecurityEvent[]): number {
    let score = 100;

    // Penalize for critical and high severity events
    const criticalEvents = events.filter(e => e.severity === SecuritySeverity.CRITICAL).length;
    const highEvents = events.filter(e => e.severity === SecuritySeverity.HIGH).length;

    score -= criticalEvents * 10;
    score -= highEvents * 5;

    // Bonus for resolved events
    const resolvedEvents = events.filter(e => e.resolved).length;
    const resolutionRate = events.length > 0 ? resolvedEvents / events.length : 1;
    score += resolutionRate * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(events: SecurityEvent[]): number {
    const resolvedEvents = events.filter(e => e.resolved && e.resolvedAt);

    if (resolvedEvents.length === 0) return 0;

    const totalTime = resolvedEvents.reduce((sum, event) => {
      const responseTime = event.resolvedAt!.getTime() - event.timestamp.getTime();
      return sum + responseTime;
    }, 0);

    return totalTime / resolvedEvents.length / (1000 * 60); // Convert to minutes
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(events: SecurityEvent[]): string[] {
    const recommendations: string[] = [];

    const bruteForceAttempts = events.filter(e => e.type === SecurityEventType.BRUTE_FORCE_ATTEMPT).length;
    if (bruteForceAttempts > 0) {
      recommendations.push('Consider implementing stronger rate limiting and account lockout policies');
    }

    const mfaFailures = events.filter(e => e.type === SecurityEventType.MFA_FAILURE).length;
    if (mfaFailures > 10) {
      recommendations.push('Review MFA configuration and user training');
    }

    const unresolved = events.filter(e => !e.resolved && e.severity !== SecuritySeverity.LOW).length;
    if (unresolved > 5) {
      recommendations.push('Prioritize resolving high-priority security incidents');
    }

    return recommendations;
  }

  /**
   * Resolve security event
   */
  resolveEvent(eventId: string, resolvedBy: string, notes?: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return false;

    event.resolved = true;
    event.resolvedAt = new Date();
    event.resolvedBy = resolvedBy;
    event.notes = notes || 'No additional notes provided';

    return true;
  }

  /**
   * Initialize default threat patterns
   */
  private initializeThreatPatterns(): void {
    this.threatPatterns = [
      {
        id: 'sql_injection',
        name: 'SQL Injection',
        description: 'Detects potential SQL injection attacks',
        patterns: [
          'union.*select',
          'drop.*table',
          'insert.*into',
          'delete.*from',
          '1=1',
          'or.*1.*=.*1'
        ],
        severity: SecuritySeverity.HIGH,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'xss_attack',
        name: 'XSS Attack',
        description: 'Detects potential XSS attacks',
        patterns: [
          '<script',
          'javascript:',
          'onerror=',
          'onload=',
          'alert\\(',
          'document\\.cookie'
        ],
        severity: SecuritySeverity.HIGH,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'path_traversal',
        name: 'Path Traversal',
        description: 'Detects directory traversal attempts',
        patterns: [
          '\\.\\./\\.\\.',
          '\\\\\\.\\.\\\\',
          '/etc/passwd',
          '/windows/system32'
        ],
        severity: SecuritySeverity.MEDIUM,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: 'brute_force',
        name: 'Brute Force Attack',
        description: 'Multiple failed login attempts',
        eventTypes: [SecurityEventType.BRUTE_FORCE_ATTEMPT],
        conditions: [],
        severity: SecuritySeverity.HIGH,
        enabled: true,
        notificationChannels: [
          { type: 'email', target: 'security@codai.com', enabled: true }
        ],
        cooldownPeriod: 30
      },
      {
        id: 'critical_events',
        name: 'Critical Security Events',
        description: 'Any critical severity security event',
        eventTypes: Object.values(SecurityEventType),
        conditions: [
          { field: 'severity', operator: 'eq', value: SecuritySeverity.CRITICAL }
        ],
        severity: SecuritySeverity.CRITICAL,
        enabled: true,
        notificationChannels: [
          { type: 'email', target: 'security@codai.com', enabled: true }
        ],
        cooldownPeriod: 5
      }
    ];
  }

  /**
   * Utility methods for event management
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSeverity(type: SecurityEventType, details: Record<string, any>): SecuritySeverity {
    switch (type) {
      case SecurityEventType.DATA_BREACH_ATTEMPT:
      case SecurityEventType.MALWARE_DETECTED:
      case SecurityEventType.PRIVILEGE_ESCALATION:
        return SecuritySeverity.CRITICAL;

      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
      case SecurityEventType.UNAUTHORIZED_ACCESS:
        return SecuritySeverity.HIGH;

      case SecurityEventType.SUSPICIOUS_ACTIVITY:
      case SecurityEventType.ANOMALY_DETECTED:
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return SecuritySeverity.MEDIUM;

      default:
        return SecuritySeverity.LOW;
    }
  }

  private updateMetrics(event: SecurityEvent): void {
    // Update real-time metrics
    // In production, this would update a metrics store
  }

  // Notification methods (mock implementations)
  private async sendEmailNotification(email: string, message: string): Promise<void> {
    console.log(`Email notification sent to ${email}: ${message}`);
  }

  private async sendSMSNotification(phone: string, message: string): Promise<void> {
    console.log(`SMS notification sent to ${phone}: ${message}`);
  }

  private async sendWebhookNotification(url: string, rule: AlertRule, event: SecurityEvent): Promise<void> {
    const payload = { rule, event, timestamp: new Date() };
    console.log(`Webhook notification sent to ${url}:`, payload);
  }

  private async sendSlackNotification(webhook: string, message: string): Promise<void> {
    console.log(`Slack notification sent: ${message}`);
  }
}

export default SecurityMonitor;
