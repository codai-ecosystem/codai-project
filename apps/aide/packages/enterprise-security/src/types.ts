// Enterprise Security Types
export interface SecurityConfig {
	authentication: AuthenticationConfig;
	authorization: AuthorizationConfig;
	encryption: EncryptionConfig;
	audit: AuditConfig;
	compliance: ComplianceConfig;
	session: SessionConfig;
	rateLimit: RateLimitConfig;
	mfa: MFAConfig;
	sso: SSOConfig;
	threatDetection: ThreatDetectionConfig;
	incidentResponse: IncidentResponseConfig;
}

export interface AuthenticationConfig {
	strategy: AuthStrategy;
	passwordPolicy: PasswordPolicy;
	tokenExpiry: number;
	refreshTokenExpiry: number;
	maxLoginAttempts: number;
	lockoutDuration: number;
	enableMFA: boolean;
	requireEmailVerification: boolean;
	jwtSecret?: string;
	saltRounds?: number;
}

export interface AuthorizationConfig {
	rbac: RBACConfig;
	permissions: PermissionConfig;
	resources: ResourceConfig;
	enforcement: EnforcementConfig;
}

export interface EncryptionConfig {
	algorithm: string;
	keyRotationInterval: number;
	saltRounds: number;
	jwtSecret: string;
	dataEncryption: boolean;
	transportEncryption: boolean;
	tokenExpiry?: string | number;
	refreshTokenExpiry?: string | number;
}

export interface AuditConfig {
	enabled: boolean;
	retention: number;
	storage: AuditStorage;
	events: AuditEventType[];
	realTimeMonitoring: boolean;
	alerting: AlertConfig;
}

export interface ComplianceConfig {
	standards: ComplianceStandard[];
	enabledStandards: ComplianceStandard[];
	dataResidency: string[];
	gdprCompliance: boolean;
	sox404Compliance: boolean;
	iso27001Compliance: boolean;
	reportingInterval: number;
	assessmentFrequency: number; // days
}

export interface SessionConfig {
	secure: boolean;
	httpOnly: boolean;
	sameSite: 'strict' | 'lax' | 'none';
	maxAge: number;
	rolling: boolean;
	regenerateOnAuth: boolean;
}

export interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
	skipSuccessfulRequests: boolean;
	skipFailedRequests: boolean;
	standardHeaders: boolean;
	legacyHeaders: boolean;
}

export interface MFAConfig {
	enabled: boolean;
	requiredForRoles: string[];
	methods: MFAMethod[];
	backupCodes: boolean;
	gracePeriod: number;
}

export interface SSOConfig {
	enabled: boolean;
	providers: SSOProvider[];
	autoProvisioning: boolean;
	attributeMapping: AttributeMapping;
	logoutUrl: string;
}

// Enums
export enum AuthStrategy {
	LOCAL = 'local',
	OAUTH2 = 'oauth2',
	SAML = 'saml',
	LDAP = 'ldap',
	OIDC = 'oidc'
}

export enum UserRole {
	ADMIN = 'admin',
	DEVELOPER = 'developer',
	VIEWER = 'viewer',
	AUDITOR = 'auditor',
	GUEST = 'guest'
}

export enum PermissionEnum {
	READ = 'read',
	WRITE = 'write',
	DELETE = 'delete',
	EXECUTE = 'execute',
	ADMIN = 'admin',
	AUDIT = 'audit'
}

export enum ResourceEnum {
	PROJECT = 'project',
	WORKSPACE = 'workspace',
	REPOSITORY = 'repository',
	DEPLOYMENT = 'deployment',
	SETTINGS = 'settings',
	USERS = 'users',
	LOGS = 'logs'
}

export enum AuditEventType {
	LOGIN = 'login',
	LOGOUT = 'logout',
	ACCESS_GRANTED = 'access_granted',
	ACCESS_DENIED = 'access_denied',
	DATA_MODIFIED = 'data_modified',
	PERMISSION_CHANGED = 'permission_changed',
	CONFIGURATION_CHANGED = 'configuration_changed',
	SECURITY_VIOLATION = 'security_violation',
	AUTHENTICATION = 'authentication',
	AUTHORIZATION = 'authorization',
	ENCRYPTION = 'encryption',
	BREACH_ATTEMPT = 'breach_attempt',
	REPORT_GENERATION = 'report_generation',
	AUDIT_CLEANUP = 'audit_cleanup',
	TEST = 'test'
}

export enum ThreatLevel {
	LOW = 0,
	MEDIUM = 1,
	HIGH = 2,
	CRITICAL = 3
}

// Risk Level enum for threat analysis
export enum RiskLevel {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical'
}

// Interface definitions for authorization
export interface Permission {
	id: string;
	name: string;
	description: string;
	category?: string;
	metadata?: Record<string, any>;
}

export interface Role {
	id: string;
	name: string;
	description: string;
	permissions: string[];
	inherits: string[];
	metadata?: Record<string, any>;
}

export interface Resource {
	id: string;
	name: string;
	description: string;
	type?: string;
	metadata?: Record<string, any>;
}

export enum ComplianceStandard {
	GDPR = 'gdpr',
	SOX404 = 'sox404',
	ISO27001 = 'iso27001',
	HIPAA = 'hipaa',
	PCI_DSS = 'pci_dss',
	SOC2 = 'soc2'
}

export enum SecurityEventSeverity {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical'
}

export enum MFAMethod {
	TOTP = 'totp',
	SMS = 'sms',
	EMAIL = 'email',
	BACKUP_CODES = 'backup_codes',
	HARDWARE_KEY = 'hardware_key'
}

// Additional types for SecurityMonitor
export interface SecuritySuite {
	on(event: string, listener: (...args: any[]) => void): this;
	emit(event: string, ...args: any[]): boolean;
}

export interface SecurityEvent {
	id: string;
	type: string;
	severity: SecurityEventSeverity;
	description?: string;
	source?: string;
	userId?: string;
	resourceId?: string;
	timestamp: Date;
	metadata?: Record<string, any>;
}

export interface SecurityMetrics {
	totalEvents: number;
	authenticationEvents: number;
	authorizationEvents: number;
	encryptionEvents: number;
	auditEvents: number;
	failedLoginAttempts: number;
	successfulLogins: number;
	suspiciousActivities: number;
	dataAccessAttempts: number;
	privilegeEscalations: number;
	securityViolations: number;
	activeConnections: number;
	blockedRequests: number;
	encryptionOperations: number;
	keyRotations: number;
	complianceViolations: number;
	averageResponseTime: number;
	systemLoad: number;
	memoryUsage: number;
	diskUsage: number;
	networkTraffic: number;
	lastUpdated: Date;
}

export interface MonitoringConfig {
	monitoringInterval: number;
	alertThresholds: {
		failedLoginAttempts: number;
		suspiciousActivity: number;
		dataExfiltration: number;
		privilegeEscalation: number;
	};
	metricsRetention: number;
	realTimeAlerts: boolean;
	dashboardEnabled: boolean;
}

// Interfaces
export interface User {
	id: string;
	username: string;
	email: string;
	password?: string;
	roles: UserRole[];
	permissions: Permission[];
	mfaEnabled: boolean;
	mfaSecret?: string | undefined;
	lastLoginAt?: Date;
	failedLoginAttempts: number;
	isLocked: boolean;
	lockedUntil?: Date | undefined;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	attributes?: Record<string, any>;
}

export interface SecurityContext {
	user: User;
	session: SessionInfo;
	permissions: Permission[];
	resources: string[];
	ipAddress: string;
	userAgent: string;
	timestamp: Date;
	request?: Record<string, any>;
	attributes?: Record<string, any>;
}

export interface SessionInfo {
	id: string;
	userId: string;
	isActive: boolean;
	createdAt: Date;
	lastAccessedAt: Date;
	expiresAt: Date;
	ipAddress: string;
	userAgent: string;
}

export interface AuditEvent {
	id: string;
	userId?: string;
	eventType: AuditEventType;
	severity: SecurityEventSeverity;
	resource: Resource;
	resourceId?: string;
	action: string;
	result: 'success' | 'failure';
	details: Record<string, any>;
	ipAddress: string;
	userAgent: string;
	timestamp: Date;
}

export interface SecurityAlert {
	id: string;
	type: string;
	severity: SecurityEventSeverity | ThreatLevel;
	title: string;
	description: string;
	timestamp: Date;
	source: string;
	data?: Record<string, any>;
	userId?: string;
	resolved?: boolean;
	resolvedBy?: string;
	resolvedAt?: Date;
}

export interface PasswordPolicy {
	minLength: number;
	maxLength: number;
	requireUppercase: boolean;
	requireLowercase: boolean;
	requireNumbers: boolean;
	requireSpecialChars: boolean;
	preventReuse: number;
	expiryDays: number;
}

export interface RBACConfig {
	enabled: boolean;
	roles: RoleDefinition[];
	inheritance: boolean;
	strictMode: boolean;
}

export interface RoleDefinition {
	name: string;
	description: string;
	permissions: Permission[];
	resources: string[];
	inherits?: string[];
}

export interface PermissionConfig {
	defaultDeny: boolean;
	granular: boolean;
	contextual: boolean;
	temporal: boolean;
}

export interface ResourceConfig {
	hierarchical: boolean;
	wildcardSupport: boolean;
	inheritance: boolean;
}

export interface EnforcementConfig {
	strict: boolean;
	logging: boolean;
	realTime: boolean;
}

export interface AuditStorage {
	type: 'database' | 'file' | 'cloud';
	config: Record<string, any>;
	encryption: boolean;
	compression: boolean;
}

export interface AlertConfig {
	channels: AlertChannel[];
	thresholds: AlertThreshold[];
	rules: AlertRule[];
}

export interface AlertChannel {
	type: 'email' | 'slack' | 'webhook' | 'sms';
	config: Record<string, any>;
	enabled: boolean;
}

export interface AlertThreshold {
	event: AuditEventType;
	count: number;
	timeWindow: number;
	severity: SecurityEventSeverity;
}

export interface AlertRule {
	name: string;
	condition: string;
	action: string;
	enabled: boolean;
}

export interface SSOProvider {
	name: string;
	type: 'saml' | 'oauth2' | 'oidc';
	config: Record<string, any>;
	enabled: boolean;
}

export interface AttributeMapping {
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: string;
	groups: string;
}

export interface SecurityReport {
	id: string;
	type: string;
	period: {
		start: Date;
		end: Date;
	};
	summary: SecuritySummary;
	events: AuditEvent[];
	recommendations: SecurityRecommendation[];
	generatedAt: Date;
}

export interface SecuritySummary {
	totalEvents: number;
	securityViolations: number;
	failedLogins: number;
	suspiciousActivity: number;
	complianceScore: number;
	riskLevel: SecurityEventSeverity;
}

export interface SecurityRecommendation {
	type: string;
	severity: SecurityEventSeverity;
	title: string;
	description: string;
	actionItems: string[];
	priority: number;
}

// Additional Authentication Types
export interface AuthCredentials {
	username?: string;
	email?: string;
	password: string;
	mfaToken?: string;
	rememberMe?: boolean;
	metadata?: Record<string, any>;
}

export interface AuthResult {
	success: boolean;
	user?: User;
	token?: string;
	refreshToken?: string;
	expiresAt?: Date;
	permissions?: Permission[];
	roles?: UserRole[];
	mfaRequired?: boolean;
	errorCode?: string;
	errorMessage?: string;
}

export interface ComplianceStatus {
	overall: 'compliant' | 'non-compliant' | 'partial';
	frameworks: Array<{
		name: string;
		status: 'compliant' | 'non-compliant' | 'partial';
		score: number;
		requirements: Array<{
			id: string;
			name: string;
			status: 'met' | 'not-met' | 'partial';
			description: string;
		}>;
	}>;
	lastAssessment: Date;
	nextAssessment: Date;
	recommendations: string[];
}

// Export SecuritySuite class type for consistency
export interface SecuritySuiteInterface {
	authenticate(credentials: AuthCredentials): Promise<AuthResult>;
	authorize(permission: Permission, context?: SecurityContext): Promise<boolean>;
	encrypt(data: any): Promise<string>;
	decrypt(encryptedData: string): Promise<any>;
	logEvent(event: Partial<AuditEvent>): void;
}

// Audit Log related types
export interface AuditLog {
	id: string;
	timestamp: Date;
	eventType: AuditEventType;
	userId?: string;
	resource?: string;
	action: string;
	outcome: 'success' | 'failure' | 'warning';
	result?: 'success' | 'failure' | 'warning';
	ipAddress?: string;
	userAgent?: string;
	metadata?: Record<string, any>;
	details?: Record<string, any>;
	processed?: boolean;
	severity: 'low' | 'medium' | 'high' | 'critical';
	indexed?: boolean;
}

export interface AuditQuery {
	dateRange?: {
		start: Date;
		end: Date;
	};
	startDate?: Date;
	endDate?: Date;
	eventTypes?: AuditEventType[];
	userId?: string;
	resource?: string;
	outcome?: 'success' | 'failure' | 'warning';
	result?: 'success' | 'failure' | 'warning';
	severity?: 'low' | 'medium' | 'high' | 'critical';
	searchTerms?: string[];
	limit?: number;
	offset?: number;
}

export interface AuditReport {
	id: string;
	title: string;
	description: string;
	period: {
		start: Date;
		end: Date;
	};
	dateRange: {
		start: Date;
		end: Date;
	};
	totalEvents: number;
	eventCounts: Record<AuditEventType, number>;
	eventBreakdown?: Record<string, any>;
	userActivity?: Record<string, any>;
	topUsers: Array<{
		userId: string;
		eventCount: number;
	}>; securityViolations: AuditEvent[];
	complianceStatus: ComplianceStatus;
	anomalies: any[]; // Detected anomalies in audit logs
	recommendations: string[];
	generatedAt: Date;
	generatedBy: string;
}

// Session validation and management types
export interface SessionValidationResult {
	valid: boolean;
	session?: SessionInfo;
	error?: string;
}

export interface SessionStats {
	total: number;
	active: number;
	byUser: Record<string, number>;
	oldestSession?: Date;
	newestSession?: Date;
}

// Error types
export class SecurityError extends Error {
	constructor(
		message: string,
		public code: string,
		public severity: SecurityEventSeverity = SecurityEventSeverity.MEDIUM
	) {
		super(message);
		this.name = 'SecurityError';
	}
}

export class AuthenticationError extends SecurityError {
	constructor(message: string) {
		super(message, 'AUTH_ERROR', SecurityEventSeverity.HIGH);
		this.name = 'AuthenticationError';
	}
}

export class AuthorizationError extends SecurityError {
	constructor(message: string) {
		super(message, 'AUTHZ_ERROR', SecurityEventSeverity.HIGH);
		this.name = 'AuthorizationError';
	}
}

export class RateLimitError extends SecurityError {
	constructor(message: string) {
		super(message, 'RATE_LIMIT_ERROR', SecurityEventSeverity.MEDIUM);
		this.name = 'RateLimitError';
	}
}

export class ComplianceError extends SecurityError {
	constructor(message: string) {
		super(message, 'COMPLIANCE_ERROR', SecurityEventSeverity.HIGH);
		this.name = 'ComplianceError';
	}
}

// Threat Detection Types
export interface ThreatDetectionConfig {
	enabled: boolean;
	realTimeAnalysis: boolean;
	realTimeMonitoring: boolean;
	scanInterval: number;
	patterns: ThreatSignature[];
	anomalyThreshold: number;
	mlModelsPath?: string;
	updateInterval: number;
	alertOnDetection: boolean;
	autoResponse: boolean;
}

export interface ThreatAlert {
	id: string;
	eventId?: string;
	type: string;
	title: string;
	threatLevel: RiskLevel;
	severity: ThreatLevel;
	timestamp: Date;
	detectedAt: Date;
	source: string;
	description: string;
	indicators: string[];
	affectedResources: string[];
	recommendedActions: string[];
	confidence: number;
	status: 'active' | 'resolved' | 'investigating';
	assignedTo?: string | null;
	metadata?: Record<string, any>;
}

export interface ThreatSignature {
	id: string;
	name: string;
	description: string;
	pattern: string | RegExp;
	severity: ThreatLevel;
	category: string;
	confidence: number;
	tags: string[];
	enabled: boolean;
	lastUpdated: Date;
	metadata?: Record<string, any>;
}

export interface ThreatAnalysisResult {
	eventId?: string;
	threatLevel: RiskLevel;
	threatDetected: boolean;
	confidence: number;
	severity: ThreatLevel;
	threatType: string;
	description: string;
	indicators: string[];
	recommendedActions: string[];
	detectedThreats: string[];
	timestamp: Date;
	metadata?: Record<string, any>; analysisDetails: {
		signatureMatches: any[];
		anomalyScore: number;
		behavioralAnalysis: any;
		contextualFactors?: any[];
	};
}

export interface AnomalyDetectionResult {
	isAnomaly: boolean;
	score: number;
	anomalyScore: number;
	baseline: number;
	threshold: number;
	deviationMetrics: Record<string, number>;
	timestamp: Date;
	description: string;
	category: string;
	severity: ThreatLevel;
	factors: string[];
}

export interface RiskAssessment {
	score: number;
	level: ThreatLevel;
	factors: string[];
	recommendations: string[];
	lastCalculated: Date;
}

// Incident Response Types
export interface IncidentResponseConfig {
	enabled: boolean;
	autoResponse: boolean;
	escalationRules: EscalationRule[];
	responsePlans: ResponsePlan[];
	teams: ResponseTeam[];
	notificationChannels: string[];
	maxResponseTime: number;
	retentionPeriod: number;
	escalationCheckInterval: number;
}

export interface SecurityIncident {
	id: string;
	title: string;
	description: string;
	severity: IncidentSeverity;
	status: IncidentStatus;
	category: string;
	source: string;
	priority?: number;
	detectedAt: Date;
	createdAt: Date;
	updatedAt: Date;
	reportedBy: string;
	discoveredBy?: string;
	assignedTo?: string;
	affectedSystems: string[];
	timeline: IncidentTimelineEntry[];
	actions: ResponseAction[];
	evidence: Evidence[];
	impact: ImpactAssessment;
	resolution?: string;
	resolvedAt?: Date;
	communicationLog?: any[];
	investigationNotes: Array<{
		id: string;
		content: string;
		author: string;
		timestamp: Date;
		investigator?: string;
		note?: string;
	}>;
	resolutionSummary?: {
		rootCause: string;
		lessonsLearned: string[];
	};
	containmentActions: string[];
	lessonsLearned: string[];
	metadata?: Record<string, any>;
}

export enum IncidentSeverity {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high',
	CRITICAL = 'critical'
}

export enum IncidentStatus {
	NEW = 'new',
	OPEN = 'open',
	IN_PROGRESS = 'in_progress',
	INVESTIGATING = 'investigating',
	CONTAINMENT = 'containment',
	ERADICATION = 'eradication',
	RECOVERY = 'recovery',
	RESOLVED = 'resolved',
	CLOSED = 'closed'
}

export interface ResponseAction {
	id: string;
	name: string;
	type: string;
	description: string;
	assignedTo: string;
	status: 'pending' | 'in_progress' | 'completed' | 'failed';
	priority: number;
	estimatedTime: number;
	actualTime?: number;
	startedAt?: Date;
	completedAt?: Date;
	results?: string;
	result?: string;
	automated?: boolean;
	timeout?: number;
	executedAt?: Date;
	executedBy?: string;
	message?: string;
	parameters?: Record<string, any>;
	dependencies?: string[];
	metadata?: Record<string, any>;
}

export interface ResponsePlan {
	id: string;
	name: string;
	description: string;
	severity: IncidentSeverity;
	category: string;
	triggerConditions: string[];
	actions: ResponseAction[];
	escalationPath: string[];
	contactList: string[];
	documentation: string[];
	lastUpdated: Date;
	enabled: boolean;
}

export interface IncidentReport {
	id: string;
	incidentId: string;
	title: string;
	summary: string;
	timeline: IncidentTimelineEntry[];
	impact: ImpactAssessment;
	rootCause: string;
	lessons: string[];
	recommendations: string[];
	generatedAt: Date;
	generatedBy: string;
	reviewed: boolean;
	reviewedBy?: string;
	reviewedAt?: Date;
}

export interface EscalationRule {
	id: string;
	name: string;
	conditions: string[];
	condition?: {
		type: string;
		threshold: number;
		metric: string;
		severity?: IncidentSeverity[];
		statusIn?: IncidentStatus[];
		timeThreshold?: number;
	};
	targetSeverity: IncidentSeverity;
	escalateTo: string[];
	timeThreshold: number;
	enabled: boolean;
	action: {
		type: string;
		targets: string[];
		message: string;
	};
	metadata?: Record<string, any>;
}

export interface ResponseTeam {
	id: string;
	name: string;
	description: string;
	members: TeamMember[];
	specialization: string[];
	availableHours: string;
	contactMethods: ContactMethod[];
	escalationLevel: number;
}

export interface TeamMember {
	id: string;
	name: string;
	role: string;
	email: string;
	phone?: string;
	skills: string[];
	availability: string;
}

export interface ContactMethod {
	type: 'email' | 'phone' | 'slack' | 'teams' | 'pager';
	value: string;
	priority: number;
}

export interface IncidentTimelineEntry {
	timestamp: Date;
	action: string;
	description: string;
	performedBy: string;
	actor: string;
	type: 'detection' | 'analysis' | 'containment' | 'communication' | 'resolution';
	details?: string;
	metadata?: Record<string, any>;
}

export interface Evidence {
	id: string;
	type: string;
	description: string;
	collectedAt: Date;
	collectedBy: string;
	source: string;
	hash?: string;
	location: string;
	metadata?: Record<string, any>;
}

export interface ImpactAssessment {
	scope: 'local' | 'department' | 'organization' | 'external';
	affectedSystems: number;
	affectedUsers: number;
	dataCompromised: boolean;
	serviceDisruption: boolean;
	reputationDamage: 'none' | 'low' | 'medium' | 'high';
	financialImpact: number;
	complianceViolation: boolean;
	estimatedCost: number;
}

// Additional exported types for AuthorizationService
export interface PolicyResult {
	allowed: boolean;
	reason?: string;
	conditions?: string[];
}

export interface AccessRequest {
	userId: string;
	resourceId: string;
	action: string;
	context?: Record<string, any>;
	attributes?: Record<string, any>;
	timestamp?: Date;
	user: {
		id: string;
		roles?: string[];
		attributes?: Record<string, any>;
	};
	resource: string;
}

export type PermissionMatrix = Map<string, Set<string>>;

// Additional types for session management
export interface SessionInfo {
	id: string;
	isActive: boolean;
	data?: any;
}

// Additional types for AuditService
export interface AuditLogQuery {
	startDate?: Date;
	endDate?: Date;
	eventType?: AuditEventType;
	userId?: string;
	limit?: number;
	offset?: number;
}
