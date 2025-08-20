import { EventEmitter } from 'events';
import {
	SecuritySuite,
	SecurityAlert,
	SecurityMetrics,
	ThreatLevel,
	MonitoringConfig,
	SecurityEvent,
	SecurityEventSeverity
} from '../types.js';

/**
 * Real-time security monitoring and alerting system
 *
 * Features:
 * - Real-time threat detection and monitoring
 * - Automated security alerting and notifications
 * - Performance and security metrics collection
 * - Anomaly detection and behavioral analysis
 * - Security dashboard and reporting
 * - Integration with SIEM systems
 */
export class SecurityMonitor extends EventEmitter {
	private suite: SecuritySuite;
	private metrics!: SecurityMetrics;
	private alerts: SecurityAlert[] = [];
	private isMonitoring = false;
	private monitoringInterval?: NodeJS.Timeout | undefined;
	private readonly config: MonitoringConfig;

	constructor(suite: SecuritySuite) {
		super();
		this.suite = suite;
		this.config = {
			monitoringInterval: 60000, // 1 minute
			alertThresholds: {
				failedLoginAttempts: 5,
				suspiciousActivity: 10,
				dataExfiltration: 3,
				privilegeEscalation: 1
			},
			metricsRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
			realTimeAlerts: true,
			dashboardEnabled: true
		};

		this.initializeMetrics();
		this.setupEventListeners();
	}

	/**
	 * Initialize the security monitor
	 */
	async initialize(): Promise<void> {
		try {
			await this.startMonitoring();
			this.emit('initialized');
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}

	/**
	 * Start real-time monitoring
	 */
	async startMonitoring(): Promise<void> {
		if (this.isMonitoring) {
			return;
		}

		this.isMonitoring = true;
		this.monitoringInterval = setInterval(() => {
			this.collectMetrics();
			this.analyzeThreats();
			this.checkAlertThresholds();
		}, this.config.monitoringInterval);

		this.emit('monitoringStarted');
	}

	/**
	 * Stop monitoring
	 */
	async stopMonitoring(): Promise<void> {
		if (!this.isMonitoring) {
			return;
		}

		this.isMonitoring = false;
		if (this.monitoringInterval) {
			clearInterval(this.monitoringInterval);
			this.monitoringInterval = undefined;
		}

		this.emit('monitoringStopped');
	}

	/**
	 * Record a security event
	 */
	async recordEvent(event: SecurityEvent): Promise<void> {
		// Update metrics
		this.updateMetrics(event);
		// Check for immediate threats
		const threatLevel = this.assessThreatLevel(event);
		if (threatLevel >= ThreatLevel.HIGH) {
			await this.createAlert({
				id: crypto.randomUUID(),
				type: event.type,
				severity: threatLevel,
				title: `Security Event: ${event.type}`,
				description: event.description || `Security event detected: ${event.type}`,
				timestamp: new Date(),
				source: event.source || 'SecurityMonitor',
				data: event.metadata || {}
			});
		}

		this.emit('securityEvent', event);
	}
	/**
	 * Create and process a security alert
	 */
	async createAlert(alert: SecurityAlert): Promise<void> {
		this.alerts.push(alert);

		// Emit alert for real-time processing
		this.emit('securityAlert', alert);
		// Trigger automated response if needed
		if (this.getSeverityLevel(alert.severity) >= ThreatLevel.CRITICAL) {
			this.emit('criticalAlert', alert);
		}
	}	/**
	 * Get severity level as number for comparison
	 */
	private getSeverityLevel(severity: ThreatLevel | SecurityEventSeverity): number {
		if (typeof severity === 'number') {
			return severity;
		}
		// Convert string severity to numeric value for comparison
		switch (severity) {
			case SecurityEventSeverity.LOW:
				return 0;
			case SecurityEventSeverity.MEDIUM:
				return 1;
			case SecurityEventSeverity.HIGH:
				return 2;
			case SecurityEventSeverity.CRITICAL:
				return 3;
			default:
				return 0;
		}
	}

	/**
	 * Get current security metrics
	 */
	getMetrics(): SecurityMetrics {
		return { ...this.metrics };
	}
	/**
	 * Get active security alerts
	 */
	getAlerts(severity?: ThreatLevel): SecurityAlert[] {
		if (severity !== undefined) {
			return this.alerts.filter(alert => this.getSeverityLevel(alert.severity) >= severity);
		}
		return [...this.alerts];
	}

	/**
	 * Clear resolved alerts
	 */
	clearAlerts(alertIds: string[]): void {
		this.alerts = this.alerts.filter(alert => !alertIds.includes(alert.id));
		this.emit('alertsCleared', alertIds);
	}

	/**
	 * Generate security report
	 */
	generateSecurityReport(startDate: Date, endDate: Date): object {
		const alertsInPeriod = this.alerts.filter(
			alert => alert.timestamp >= startDate && alert.timestamp <= endDate
		);

		return {
			period: { startDate, endDate },
			metrics: this.metrics,
			alertSummary: {
				total: alertsInPeriod.length,
				bySeverity: this.groupAlertsBySeverity(alertsInPeriod),
				byType: this.groupAlertsByType(alertsInPeriod)
			},
			topThreats: this.getTopThreats(alertsInPeriod),
			recommendations: this.generateRecommendations()
		};
	}

	/**
	 * Health check for monitoring system
	 */
	async healthCheck(): Promise<object> {
		return {
			status: this.isMonitoring ? 'healthy' : 'stopped',
			metricsCollected: this.metrics.totalEvents,
			activeAlerts: this.alerts.length,
			lastUpdate: new Date(),
			uptime: process.uptime()
		};
	}

	/**
	 * Shutdown the monitor
	 */
	async shutdown(): Promise<void> {
		await this.stopMonitoring();
		this.removeAllListeners();
	}

	// Private methods

	private initializeMetrics(): void {
		this.metrics = {
			totalEvents: 0,
			authenticationEvents: 0,
			authorizationEvents: 0,
			encryptionEvents: 0,
			auditEvents: 0,
			failedLoginAttempts: 0,
			successfulLogins: 0,
			suspiciousActivities: 0,
			dataAccessAttempts: 0,
			privilegeEscalations: 0,
			securityViolations: 0,
			activeConnections: 0,
			blockedRequests: 0,
			encryptionOperations: 0,
			keyRotations: 0,
			complianceViolations: 0,
			averageResponseTime: 0,
			systemLoad: 0,
			memoryUsage: 0,
			diskUsage: 0,
			networkTraffic: 0,
			lastUpdated: new Date()
		};
	}

	private setupEventListeners(): void {
		// Listen to suite events for monitoring
		this.suite.on('authenticationEvent', (event) => this.recordEvent(event));
		this.suite.on('authorizationEvent', (event) => this.recordEvent(event));
		this.suite.on('encryptionEvent', (event) => this.recordEvent(event));
		this.suite.on('auditEvent', (event) => this.recordEvent(event));
		this.suite.on('securityViolation', (event) => this.recordEvent(event));
	}

	private collectMetrics(): void {
		// Update system metrics
		this.metrics.systemLoad = process.cpuUsage().system / 1000000; // Convert to seconds
		this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
		this.metrics.lastUpdated = new Date();
	}

	private analyzeThreats(): void {
		// Implement threat analysis logic
		// This would typically use machine learning or rule-based analysis
	}

	private checkAlertThresholds(): void {
		const thresholds = this.config.alertThresholds;

		// Check failed login attempts
		if (this.metrics.failedLoginAttempts >= thresholds.failedLoginAttempts) {
			this.createAlert({
				id: crypto.randomUUID(),
				type: 'authentication',
				severity: ThreatLevel.HIGH,
				title: 'High Failed Login Attempts',
				description: `${this.metrics.failedLoginAttempts} failed login attempts detected`,
				timestamp: new Date(),
				source: 'SecurityMonitor',
				data: { count: this.metrics.failedLoginAttempts }
			});
		}

		// Check suspicious activities
		if (this.metrics.suspiciousActivities >= thresholds.suspiciousActivity) {
			this.createAlert({
				id: crypto.randomUUID(),
				type: 'behavioral',
				severity: ThreatLevel.MEDIUM,
				title: 'Suspicious Activity Detected',
				description: `${this.metrics.suspiciousActivities} suspicious activities detected`,
				timestamp: new Date(),
				source: 'SecurityMonitor',
				data: { count: this.metrics.suspiciousActivities }
			});
		}
	}

	private updateMetrics(event: SecurityEvent): void {
		this.metrics.totalEvents++;

		switch (event.type) {
			case 'authentication':
				this.metrics.authenticationEvents++;
				if (event.metadata?.success === false) {
					this.metrics.failedLoginAttempts++;
				} else {
					this.metrics.successfulLogins++;
				}
				break;
			case 'authorization':
				this.metrics.authorizationEvents++;
				break;
			case 'encryption':
				this.metrics.encryptionEvents++;
				this.metrics.encryptionOperations++;
				break;
			case 'audit':
				this.metrics.auditEvents++;
				break;
			case 'suspicious':
				this.metrics.suspiciousActivities++;
				break;
			case 'privilege_escalation':
				this.metrics.privilegeEscalations++;
				break;
			case 'data_access':
				this.metrics.dataAccessAttempts++;
				break;
			case 'violation':
				this.metrics.securityViolations++;
				break;
		}
	}

	private assessThreatLevel(event: SecurityEvent): ThreatLevel {
		// Implement threat level assessment logic
		switch (event.type) {
			case 'privilege_escalation':
			case 'data_exfiltration':
				return ThreatLevel.CRITICAL;
			case 'authentication_failure':
			case 'suspicious':
				return ThreatLevel.HIGH;
			case 'authorization_failure':
				return ThreatLevel.MEDIUM;
			default:
				return ThreatLevel.LOW;
		}
	}
	private groupAlertsBySeverity(alerts: SecurityAlert[]): Record<string, number> {
		const groups: Record<string, number> = {};
		for (const alert of alerts) {
			const severityKey = typeof alert.severity === 'number'
				? ThreatLevel[alert.severity as ThreatLevel] || alert.severity.toString()
				: alert.severity;
			groups[severityKey] = (groups[severityKey] || 0) + 1;
		}
		return groups;
	}

	private groupAlertsByType(alerts: SecurityAlert[]): Record<string, number> {
		const groups: Record<string, number> = {};
		for (const alert of alerts) {
			groups[alert.type] = (groups[alert.type] || 0) + 1;
		}
		return groups;
	}
	private getTopThreats(alerts: SecurityAlert[]): Array<{ type: string; count: number; severity: string }> {
		const threatMap = new Map<string, { count: number; maxSeverity: number }>();

		for (const alert of alerts) {
			// Convert severity to numeric value for comparison
			const severityValue = typeof alert.severity === 'string' ?
				this.severityToNumber(alert.severity as SecurityEventSeverity) :
				alert.severity as number;

			const existing = threatMap.get(alert.type);
			if (existing) {
				existing.count++;
				existing.maxSeverity = Math.max(existing.maxSeverity, severityValue);
			} else {
				threatMap.set(alert.type, { count: 1, maxSeverity: severityValue });
			}
		}

		return Array.from(threatMap.entries())
			.map(([type, data]) => ({
				type,
				count: data.count,
				severity: data.maxSeverity >= 3 ? 'CRITICAL' :
					data.maxSeverity >= 2 ? 'HIGH' :
						data.maxSeverity >= 1 ? 'MEDIUM' : 'LOW'
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}

	private severityToNumber(severity: SecurityEventSeverity): number {
		switch (severity) {
			case SecurityEventSeverity.LOW: return 0;
			case SecurityEventSeverity.MEDIUM: return 1;
			case SecurityEventSeverity.HIGH: return 2;
			case SecurityEventSeverity.CRITICAL: return 3;
			default: return 0;
		}
	}

	private generateRecommendations(): string[] {
		const recommendations: string[] = [];

		if (this.metrics.failedLoginAttempts > 10) {
			recommendations.push('Consider implementing rate limiting for login attempts');
		}

		if (this.metrics.privilegeEscalations > 0) {
			recommendations.push('Review user permissions and implement principle of least privilege');
		}

		if (this.metrics.securityViolations > 5) {
			recommendations.push('Strengthen security policies and user training');
		}

		return recommendations;
	}
}
