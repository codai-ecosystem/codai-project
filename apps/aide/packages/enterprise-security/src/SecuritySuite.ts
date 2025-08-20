import { EventEmitter } from 'events';
import { SecurityConfig, SecurityContext, User, SecurityAlert, AuditEvent, SecurityReport } from './types';
import { AuthenticationService } from './services/AuthenticationService';
import { AuthorizationService } from './services/AuthorizationService';
import { EncryptionService } from './services/EncryptionService';
import { AuditService } from './services/AuditService';
import { ComplianceService } from './services/ComplianceService';
import { SessionManager } from './managers/SessionManager';
import { SecurityMonitor } from './monitoring/SecurityMonitor';
import { ThreatDetector } from './detection/ThreatDetector';
import { IncidentResponder } from './incident/IncidentResponder';

/**
 * Enterprise Security Suite - Comprehensive security management system
 *
 * Features:
 * - Multi-factor authentication and authorization
 * - Role-based access control (RBAC)
 * - Real-time threat detection and monitoring
 * - Compliance management (GDPR, SOX, ISO27001)
 * - Advanced encryption and key management
 * - Comprehensive audit logging and reporting
 * - Incident response and security alerting
 * - SSO integration and identity federation
 */
export class SecuritySuite extends EventEmitter {
	private readonly config: SecurityConfig;
	private readonly authService: AuthenticationService;
	private readonly authzService: AuthorizationService;
	private readonly encryptionService: EncryptionService;
	private readonly auditService: AuditService;
	private readonly complianceService: ComplianceService;
	private readonly sessionManager: SessionManager;
	private readonly securityMonitor: SecurityMonitor;
	private readonly threatDetector: ThreatDetector;
	private readonly incidentResponder: IncidentResponder;
	private isInitialized = false;

	constructor(config: SecurityConfig) {
		super();
		this.config = config;
		// Initialize core services
		this.authService = new AuthenticationService(config.authentication, this);
		this.authzService = new AuthorizationService(config.authorization, this);
		this.encryptionService = new EncryptionService(config.encryption, this);
		this.auditService = new AuditService(config.audit, this);
		this.complianceService = new ComplianceService(config.compliance);
		this.sessionManager = new SessionManager(config.session);
		this.securityMonitor = new SecurityMonitor(this);
		this.threatDetector = new ThreatDetector(config.threatDetection);
		this.incidentResponder = new IncidentResponder(config.incidentResponse);
	}

	/**
	 * Initialize the security suite
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) {
			return;
		}

		try {
			// Initialize services in order
			await this.encryptionService.initialize();
			await this.authService.initialize();
			await this.authzService.initialize();
			await this.auditService.initialize();
			await this.complianceService.initialize();
			await this.sessionManager.initialize();
			await this.securityMonitor.initialize();
			await this.threatDetector.initialize();
			await this.incidentResponder.initialize();

			this.isInitialized = true;
			this.emit('initialized');
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}

	/**
	 * Authenticate a user
	 */
	async authenticate(credentials: any, context: Partial<SecurityContext>): Promise<User> {
		this.ensureInitialized();
		return this.authService.authenticate(credentials, context);
	}

	/**
	 * Authorize access to a resource
	 */
	async authorize(context: SecurityContext, resource: string, action: string): Promise<boolean> {
		this.ensureInitialized();
		return this.authzService.authorize(context, resource, action);
	}
	/**
	 * Create a secure session
	 */
	async createSession(user: User, context: Partial<SecurityContext>): Promise<string> {
		this.ensureInitialized();
		const userAgent = context.userAgent || 'unknown';
		const ipAddress = context.ipAddress || 'unknown';
		return this.sessionManager.createSession(user, ipAddress, userAgent);
	}	/**
	 * Validate and retrieve session
	 */
	async validateSession(sessionId: string): Promise<SecurityContext | null> {
		this.ensureInitialized();
		const result = await this.sessionManager.validateSession(sessionId);
		return result.valid && result.session ? {
			user: result.session.user,
			session: {
				id: sessionId,
				userId: result.session.userId,
				isActive: true,
				createdAt: result.session.createdAt,
				lastAccessedAt: result.session.lastAccessedAt,
				expiresAt: result.session.expiresAt,
				ipAddress: result.session.ipAddress,
				userAgent: result.session.userAgent
			},
			permissions: result.session.permissions.map(perm => ({
				id: perm,
				name: perm,
				description: `Permission for ${perm}`
			})),
			resources: [],
			ipAddress: result.session.ipAddress,
			userAgent: result.session.userAgent,
			timestamp: new Date()
		} : null;
	}
	/**
	 * Encrypt sensitive data
	 */
	async encrypt(data: string | Buffer): Promise<string> {
		this.ensureInitialized();
		return this.encryptionService.encryptData(data);
	}

	/**
	 * Decrypt sensitive data
	 */
	async decrypt(encryptedData: string): Promise<string> {
		this.ensureInitialized();
		const decrypted = await this.encryptionService.decryptData(encryptedData);
		return decrypted.toString();
	}
	/**
	 * Log audit event
	 */
	async audit(event: Partial<AuditEvent>): Promise<void> {
		this.ensureInitialized();
		// Ensure required fields are present with defaults
		const auditEvent = {
			...event,
			ipAddress: event.ipAddress || 'unknown',
			userAgent: event.userAgent || 'unknown',
			action: event.action || 'unknown',
			result: event.result || 'success'
		} as Omit<AuditEvent, 'timestamp' | 'id'>;
		await this.auditService.logEvent(auditEvent);
	}
	/**
	 * Generate security report
	 */
	async generateReport(type: string, startDate: Date, endDate: Date): Promise<SecurityReport> {
		this.ensureInitialized();
		// Use security monitor for report generation
		return this.securityMonitor.generateSecurityReport(startDate, endDate) as Promise<SecurityReport>;
	}

	/**
	 * Get active security alerts
	 */
	async getActiveAlerts(): Promise<SecurityAlert[]> {
		this.ensureInitialized();
		return this.securityMonitor.getAlerts();
	}

	/**
	 * Handle security incident
	 */
	async handleIncident(incident: any): Promise<void> {
		this.ensureInitialized();
		// Use incident responder's primary methods
		await this.incidentResponder.executeResponsePlan(incident.id, incident.severity || 'medium');
	}

	/**
	 * Get security metrics
	 */
	async getMetrics(timeRange?: { start: Date; end: Date }): Promise<any> {
		this.ensureInitialized();
		return this.securityMonitor.getMetrics();
	}
	/**
	 * Update security configuration
	 */
	async updateConfig(updates: Partial<SecurityConfig>): Promise<void> {
		this.ensureInitialized();

		// Merge configuration updates
		Object.assign(this.config, updates);

		// Notify services of configuration changes (only if config exists)
		if (updates.authentication) {
			await this.authService.updateConfig(updates.authentication);
		}
		if (updates.authorization) {
			await this.authzService.updateConfig(updates.authorization);
		}
		if (updates.encryption) {
			await this.encryptionService.updateConfig(updates.encryption);
		}
		if (updates.audit) {
			await this.auditService.updateConfig(updates.audit);
		}
		if (updates.compliance) {
			await this.complianceService.updateConfig(updates.compliance);
		}

		this.emit('configUpdated', updates);
	}

	/**
	 * Perform security health check
	 */
	async healthCheck(): Promise<{
		status: 'healthy' | 'degraded' | 'critical';
		services: Record<string, boolean>;
		issues: string[];
	}> {
		this.ensureInitialized(); const services = {
			authentication: await this.authService.healthCheck(),
			authorization: await this.authzService.healthCheck(),
			encryption: await this.encryptionService.healthCheck(),
			audit: await this.auditService.healthCheck(),
			compliance: await this.complianceService.healthCheck(),
			session: await this.sessionManager.healthCheck(),
			monitoring: (await this.securityMonitor.healthCheck() as any).status === 'healthy',
			threatDetection: await this.threatDetector.healthCheck(),
			incidentResponse: await this.incidentResponder.healthCheck()
		};

		const healthyServices = Object.values(services).filter(healthy => healthy).length;
		const totalServices = Object.keys(services).length;
		const issues: string[] = [];

		let status: 'healthy' | 'degraded' | 'critical';
		if (healthyServices === totalServices) {
			status = 'healthy';
		} else if (healthyServices >= totalServices * 0.7) {
			status = 'degraded';
			issues.push(`${totalServices - healthyServices} services are not healthy`);
		} else {
			status = 'critical';
			issues.push(`Only ${healthyServices}/${totalServices} services are healthy`);
		}

		return { status, services, issues };
	}

	/**
	 * Shutdown the security suite
	 */
	async shutdown(): Promise<void> {
		if (!this.isInitialized) {
			return;
		}

		try {
			await this.incidentResponder.shutdown();
			await this.threatDetector.shutdown();
			await this.securityMonitor.shutdown();
			await this.sessionManager.shutdown();
			await this.complianceService.shutdown();
			await this.auditService.shutdown();
			await this.encryptionService.shutdown();
			await this.authzService.shutdown();
			await this.authService.shutdown();

			this.isInitialized = false;
			this.emit('shutdown');
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}

	// Getters for service access
	get authentication(): AuthenticationService {
		return this.authService;
	}

	get authorization(): AuthorizationService {
		return this.authzService;
	}

	get encryption(): EncryptionService {
		return this.encryptionService;
	}

	get auditing(): AuditService {
		return this.auditService;
	}

	get compliance(): ComplianceService {
		return this.complianceService;
	}

	get sessions(): SessionManager {
		return this.sessionManager;
	}

	get monitoring(): SecurityMonitor {
		return this.securityMonitor;
	}

	get threatDetection(): ThreatDetector {
		return this.threatDetector;
	}

	get incidentResponse(): IncidentResponder {
		return this.incidentResponder;
	}

	private ensureInitialized(): void {
		if (!this.isInitialized) {
			throw new Error('SecuritySuite must be initialized before use');
		}
	}
}

// Default configuration factory
export function createDefaultSecurityConfig(): SecurityConfig {
	return {
		authentication: {
			strategy: 'local' as any,
			passwordPolicy: {
				minLength: 12,
				maxLength: 128,
				requireUppercase: true,
				requireLowercase: true,
				requireNumbers: true,
				requireSpecialChars: true,
				preventReuse: 12,
				expiryDays: 90
			},
			tokenExpiry: 15 * 60, // 15 minutes
			refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
			maxLoginAttempts: 5,
			lockoutDuration: 15 * 60, // 15 minutes
			enableMFA: true,
			requireEmailVerification: true
		},
		authorization: {
			rbac: {
				enabled: true,
				roles: [],
				inheritance: true,
				strictMode: true
			},
			permissions: {
				defaultDeny: true,
				granular: true,
				contextual: true,
				temporal: false
			},
			resources: {
				hierarchical: true,
				wildcardSupport: true,
				inheritance: true
			},
			enforcement: {
				strict: true,
				logging: true,
				realTime: true
			}
		},
		encryption: {
			algorithm: 'aes-256-gcm',
			keyRotationInterval: 90 * 24 * 60 * 60, // 90 days
			saltRounds: 12,
			jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
			dataEncryption: true,
			transportEncryption: true
		},
		audit: {
			enabled: true,
			retention: 365 * 24 * 60 * 60, // 1 year
			storage: {
				type: 'database',
				config: {},
				encryption: true,
				compression: true
			},
			events: [] as any[],
			realTimeMonitoring: true,
			alerting: {
				channels: [],
				thresholds: [],
				rules: []
			}
		}, compliance: {
			standards: [] as any[],
			enabledStandards: [] as any[],
			dataResidency: ['US', 'EU'],
			gdprCompliance: true,
			sox404Compliance: false,
			iso27001Compliance: true,
			reportingInterval: 30 * 24 * 60 * 60, // 30 days
			assessmentFrequency: 90 // 90 days
		},
		session: {
			secure: true,
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			rolling: true,
			regenerateOnAuth: true
		},
		rateLimit: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			maxRequests: 100,
			skipSuccessfulRequests: false,
			skipFailedRequests: false,
			standardHeaders: true,
			legacyHeaders: false
		},
		mfa: {
			enabled: true,
			requiredForRoles: ['admin'],
			methods: [] as any[],
			backupCodes: true,
			gracePeriod: 7 * 24 * 60 * 60 // 7 days
		},
		sso: {
			enabled: false,
			providers: [],
			autoProvisioning: false,
			attributeMapping: {
				username: 'username',
				email: 'email',
				firstName: 'firstName',
				lastName: 'lastName',
				roles: 'roles',
				groups: 'groups'
			},
			logoutUrl: '/logout'
		}, threatDetection: {
			enabled: true,
			realTimeAnalysis: true,
			realTimeMonitoring: true,
			scanInterval: 60000, // 1 minute
			patterns: [],
			anomalyThreshold: 0.8,
			updateInterval: 3600000, // 1 hour
			alertOnDetection: true,
			autoResponse: false
		},
		incidentResponse: {
			enabled: true,
			autoResponse: true,
			escalationRules: [],
			responsePlans: [],
			teams: [],
			notificationChannels: [],
			maxResponseTime: 3600, // 1 hour
			retentionPeriod: 365 * 24 * 60 * 60, // 1 year
			escalationCheckInterval: 300 // 5 minutes
		}
	};
}
