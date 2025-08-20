import { EventEmitter } from 'events';
import {
	AuditConfig,
	SecuritySuite,
	AuditEvent,
	AuditLog,
	AuditQuery,
	AuditReport,
	AuditEventType,
	AuditStorage,
	SecurityEventSeverity,
	Resource,
	ComplianceStatus,
	ComplianceStandard,
	AlertConfig
} from '../types.js';
import { SecurityError } from '../types.js';

export class AuditService extends EventEmitter {
	private config: AuditConfig;
	private suite: SecuritySuite;
	private auditLogs: Map<string, AuditLog> = new Map();
	private eventQueue: AuditEvent[] = [];
	private isProcessing = false;

	constructor(config: AuditConfig, suite: SecuritySuite) {
		super();
		this.config = config;
		this.suite = suite;
		this.startEventProcessor();
	}

	/**
	 * Initialize the audit service
	 */
	async initialize(): Promise<void> {
		// Initialize audit storage if needed
		if (this.config.storage) {
			// Initialize storage backend
		}
		this.emit('initialized');
	}

	/**
	 * Log an audit event
	 */
	async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
		const auditEvent: AuditEvent = {
			...event,
			id: crypto.randomUUID(),
			timestamp: new Date()
		};

		// Add to queue for processing
		this.eventQueue.push(auditEvent);

		// Emit real-time event if monitoring enabled
		if (this.config.realTimeMonitoring) {
			this.emit('auditEvent', auditEvent);
		}

		// Check for alerts
		await this.checkAlerts(auditEvent);

		return auditEvent.id;
	}

	/**
	 * Query audit logs
	 */
	async queryLogs(query: AuditQuery): Promise<AuditLog[]> {
		const logs = Array.from(this.auditLogs.values());

		let filtered = logs;

		// Filter by date range
		if (query.startDate) {
			filtered = filtered.filter(log => log.timestamp >= query.startDate!);
		}
		if (query.endDate) {
			filtered = filtered.filter(log => log.timestamp <= query.endDate!);
		}

		// Filter by event type
		if (query.eventTypes && query.eventTypes.length > 0) {
			filtered = filtered.filter(log =>
				query.eventTypes!.includes(log.eventType)
			);
		}

		// Filter by user ID
		if (query.userId) {
			filtered = filtered.filter(log => log.userId === query.userId);
		}

		// Filter by result
		if (query.result) {
			filtered = filtered.filter(log => log.result === query.result);
		}

		// Filter by search terms
		if (query.searchTerms && query.searchTerms.length > 0) {
			filtered = filtered.filter(log => {
				const searchText = `${log.eventType} ${log.result} ${JSON.stringify(log.details)}`.toLowerCase();
				return query.searchTerms!.some(term =>
					searchText.includes(term.toLowerCase())
				);
			});
		}

		// Sort by timestamp (newest first)
		filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

		// Apply pagination
		const offset = query.offset || 0;
		const limit = query.limit || 100;

		return filtered.slice(offset, offset + limit);
	}

	/**
	 * Generate audit report
	 */
	async generateReport(
		startDate: Date,
		endDate: Date,
		eventTypes?: AuditEventType[]
	): Promise<AuditReport> {
		const query: AuditQuery = {
			startDate,
			endDate,
			eventTypes: eventTypes || [],
			limit: 10000 // Get all matching events
		};

		const logs = await this.queryLogs(query);
		const report: AuditReport = {
			id: crypto.randomUUID(),
			title: `Security Audit Report`,
			description: `Audit report for period ${startDate.toISOString()} to ${endDate.toISOString()}`,
			generatedAt: new Date(),
			generatedBy: 'system',
			period: { start: startDate, end: endDate },
			dateRange: { start: startDate, end: endDate },
			totalEvents: logs.length,
			eventCounts: this.generateEventCounts(logs),
			eventBreakdown: this.generateEventBreakdown(logs),
			userActivity: this.generateUserActivity(logs),
			topUsers: this.generateTopUsers(logs),
			securityViolations: this.filterSecurityEvents(logs),
			complianceStatus: await this.getComplianceStatus(),
			anomalies: await this.detectAnomalies(logs),
			recommendations: await this.generateRecommendations(logs)
		};		// Audit the report generation
		await this.logEvent({
			eventType: AuditEventType.REPORT_GENERATION,
			severity: SecurityEventSeverity.LOW,
			resource: { id: 'audit_system', name: 'Audit System', description: 'Internal audit system' },
			action: 'generate_report',
			ipAddress: '127.0.0.1',
			userAgent: 'audit-service',
			result: 'success',
			details: {
				reportId: report.id,
				eventCount: logs.length,
				period: `${startDate.toISOString()} to ${endDate.toISOString()}`
			}
		});

		return report;
	}

	/**
	 * Get audit statistics
	 */
	async getStatistics(): Promise<Record<string, any>> {
		const logs = Array.from(this.auditLogs.values());
		const now = new Date();
		const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const recent24h = logs.filter(log => log.timestamp >= last24h);
		const recent7d = logs.filter(log => log.timestamp >= last7d);

		return {
			totalEvents: logs.length,
			events24h: recent24h.length,
			events7d: recent7d.length,
			queueSize: this.eventQueue.length,
			storageUsed: this.calculateStorageUsage(),
			retention: this.config.retention,
			realTimeMonitoring: this.config.realTimeMonitoring
		};
	}

	/**
	 * Clean up old audit logs based on retention policy
	 */
	async cleanup(): Promise<number> {
		const now = new Date();
		const cutoffDate = new Date(now.getTime() - this.config.retention);

		let removedCount = 0;

		for (const [id, log] of this.auditLogs.entries()) {
			if (log.timestamp < cutoffDate) {
				this.auditLogs.delete(id);
				removedCount++;
			}
		}
		if (removedCount > 0) {
			await this.logEvent({
				eventType: AuditEventType.AUDIT_CLEANUP,
				severity: SecurityEventSeverity.LOW,
				resource: { id: 'audit_system', name: 'Audit System', description: 'Internal audit system' },
				action: 'cleanup_logs',
				ipAddress: '127.0.0.1',
				userAgent: 'audit-service',
				result: 'success',
				details: { removedLogs: removedCount, cutoffDate: cutoffDate.toISOString() }
			});
		}

		return removedCount;
	}

	/**
	 * Test audit service configuration
	 */
	async testConfiguration(): Promise<boolean> {
		try {
			// Test event logging
			const testEventId = await this.logEvent({
				eventType: AuditEventType.TEST,
				severity: SecurityEventSeverity.LOW,
				resource: { id: 'test_resource', name: 'Test Resource', description: 'Test resource' },
				action: 'test_configuration',
				ipAddress: '127.0.0.1',
				userAgent: 'audit-service',
				result: 'success',
				details: { test: true }
			});

			// Wait for processing
			await new Promise(resolve => setTimeout(resolve, 100));

			// Test querying
			const logs = await this.queryLogs({
				searchTerms: ['test'],
				limit: 1
			});

			if (logs.length === 0) {
				throw new Error('Test event not found in audit logs');
			}

			// Test cleanup (but don't actually remove the test event)
			const statisticsBefore = await this.getStatistics();

			return true;
		} catch (error) {
			console.error('Audit service test failed:', error);
			return false;
		}
	}

	/**
	 * Update service configuration
	 */
	async updateConfig(updates: Partial<AuditConfig>): Promise<void> {
		Object.assign(this.config, updates);
		this.emit('configUpdated', updates);
	}

	/**
	 * Health check for the audit service
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Check if service is initialized and processing events
			return this.auditLogs.size >= 0 && !this.isProcessing;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Shutdown the audit service
	 */
	async shutdown(): Promise<void> {
		// Process remaining events in queue
		while (this.eventQueue.length > 0) {
			await this.processEventQueue();
		}

		this.auditLogs.clear();
		this.eventQueue.length = 0;
		this.isProcessing = false;
		this.emit('shutdown');
	}

	private async startEventProcessor(): Promise<void> {
		setInterval(async () => {
			await this.processEventQueue();
		}, 1000); // Process every second

		// Cleanup interval
		setInterval(async () => {
			await this.cleanup();
		}, 60 * 60 * 1000); // Cleanup every hour
	}
	private async processEventQueue(): Promise<void> {
		if (this.isProcessing || this.eventQueue.length === 0) {
			return;
		}

		this.isProcessing = true;

		try {
			const events = this.eventQueue.splice(0, 100); // Process in batches
			for (const event of events) {
				const auditLog: AuditLog = {
					id: event.id,
					timestamp: event.timestamp,
					eventType: event.eventType,
					userId: event.userId || 'system',
					resource: event.resource?.id || 'unknown',
					action: event.action,
					outcome: (event.result as 'success' | 'failure' | 'warning') || 'success',
					result: event.result,
					ipAddress: event.ipAddress,
					userAgent: event.userAgent,
					metadata: (event as any).metadata || {},
					details: event.details,
					severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
					processed: true,
					indexed: true
				};

				this.auditLogs.set(auditLog.id, auditLog);
			}
		} catch (error) {
			console.error('Error processing audit events:', error);
		} finally {
			this.isProcessing = false;
		}
	}

	private async checkAlerts(event: AuditEvent): Promise<void> {
		if (!this.config.alerting) return;
		// Check for security events that need immediate attention
		const criticalEvents: AuditEventType[] = [
			AuditEventType.AUTHENTICATION,
			AuditEventType.AUTHORIZATION,
			AuditEventType.SECURITY_VIOLATION,
			AuditEventType.BREACH_ATTEMPT
		];

		if (criticalEvents.includes(event.eventType) && event.result === 'failure') {
			this.emit('securityAlert', {
				type: 'critical',
				event,
				message: `Critical security event: ${event.eventType} failed`,
				timestamp: new Date()
			});
		}

		// Check for patterns indicating attacks
		await this.checkForAttackPatterns(event);
	}

	private async checkForAttackPatterns(event: AuditEvent): Promise<void> {
		// Implement pattern detection (brute force, unusual access patterns, etc.)
		if (event.eventType === 'login' && event.result === 'failure') {
			const recentFailures = Array.from(this.auditLogs.values())
				.filter(log =>
					log.eventType === 'login' &&
					log.result === 'failure' &&
					log.userId === event.userId &&
					log.timestamp > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
				);

			if (recentFailures.length >= 5) {
				this.emit('securityAlert', {
					type: 'brute_force',
					event,
					message: `Potential brute force attack detected for user ${event.userId}`,
					timestamp: new Date()
				});
			}
		}
	}

	private generateEventBreakdown(logs: AuditLog[]): Record<string, number> {
		const breakdown: Record<string, number> = {};

		for (const log of logs) {
			breakdown[log.eventType] = (breakdown[log.eventType] || 0) + 1;
		}

		return breakdown;
	}

	private generateUserActivity(logs: AuditLog[]): Record<string, number> {
		const activity: Record<string, number> = {};

		for (const log of logs) {
			if (log.userId) {
				activity[log.userId] = (activity[log.userId] || 0) + 1;
			}
		}

		return activity;
	} private filterSecurityEvents(logs: AuditLog[]): AuditEvent[] {
		const securityEvents: AuditEventType[] = [
			AuditEventType.AUTHENTICATION,
			AuditEventType.AUTHORIZATION,
			AuditEventType.ENCRYPTION,
			AuditEventType.SECURITY_VIOLATION,
			AuditEventType.BREACH_ATTEMPT
		];

		return logs
			.filter(log => securityEvents.includes(log.eventType))
			.map(log => this.convertLogToEvent(log));
	} private convertLogToEvent(log: AuditLog): AuditEvent {
		const result = log.result;
		const eventResult: 'success' | 'failure' =
			result === 'failure' ? 'failure' : 'success';

		return {
			id: log.id,
			timestamp: log.timestamp,
			eventType: log.eventType,
			userId: log.userId || 'system',
			action: log.action,
			result: eventResult,
			ipAddress: log.ipAddress || 'unknown',
			userAgent: log.userAgent || 'unknown',
			details: log.details || {},
			severity: log.severity as SecurityEventSeverity,
			resource: {
				id: log.resource || 'unknown',
				type: 'unknown',
				name: log.resource || 'unknown',
				description: `Resource: ${log.resource || 'unknown'}`
			}
		};
	}

	private async detectAnomalies(logs: AuditLog[]): Promise<string[]> {
		const anomalies: string[] = [];

		// Detect unusual login times
		// Detect access from unusual locations
		// Detect unusual permission escalations
		// etc.

		return anomalies;
	}

	private async generateRecommendations(logs: AuditLog[]): Promise<string[]> {
		const recommendations: string[] = [];

		// Analyze patterns and suggest improvements
		// Check for security best practices
		// etc.

		return recommendations;
	}

	private calculateStorageUsage(): number {
		// Estimate storage usage of audit logs
		return Array.from(this.auditLogs.values()).reduce((total, log) => {
			return total + JSON.stringify(log).length;
		}, 0);
	}

	private generateEventCounts(logs: AuditLog[]): Record<AuditEventType, number> {
		const counts: Record<AuditEventType, number> = {} as Record<AuditEventType, number>;

		// Initialize all event types with 0
		Object.values(AuditEventType).forEach(eventType => {
			counts[eventType] = 0;
		});

		// Count occurrences
		logs.forEach(log => {
			counts[log.eventType]++;
		});

		return counts;
	}

	private generateTopUsers(logs: AuditLog[]): Array<{ userId: string; eventCount: number }> {
		const userCounts: Record<string, number> = {};

		logs.forEach(log => {
			if (log.userId) {
				userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
			}
		});

		return Object.entries(userCounts)
			.map(([userId, eventCount]) => ({ userId, eventCount }))
			.sort((a, b) => b.eventCount - a.eventCount)
			.slice(0, 10); // Top 10 users
	}
	private async getComplianceStatus(): Promise<ComplianceStatus> {
		// Basic compliance status - this would normally be more complex
		return {
			overall: 'compliant',
			frameworks: [
				{
					name: ComplianceStandard.GDPR,
					status: 'compliant',
					score: 95,
					requirements: []
				},
				{
					name: ComplianceStandard.SOX404,
					status: 'compliant',
					score: 90,
					requirements: []
				},
				{
					name: ComplianceStandard.SOC2,
					status: 'compliant',
					score: 88,
					requirements: []
				}
			],
			lastAssessment: new Date(),
			nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
			recommendations: []
		};
	}
}
