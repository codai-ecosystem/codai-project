import { EventEmitter } from 'events';
import {
	ComplianceConfig,
	ComplianceStandard,
	ComplianceStatus,
	AuditEvent,
	AuditEventType,
	SecurityEventSeverity
} from '../types.js';

export interface ComplianceFramework {
	name: string;
	version: string;
	requirements: ComplianceRequirement[];
	assessmentCriteria: AssessmentCriteria[];
}

export interface ComplianceRequirement {
	id: string;
	name: string;
	description: string;
	category: string;
	controls: string[];
	mandatory: boolean;
	evidenceRequired: string[];
}

export interface AssessmentCriteria {
	requirementId: string;
	testProcedure: string;
	expectedEvidence: string[];
	automatedCheck?: boolean;
	checkFunction?: () => Promise<boolean>;
}

export interface ComplianceViolation {
	id: string;
	requirementId: string;
	severity: SecurityEventSeverity;
	description: string;
	evidence: string[];
	detectedAt: Date;
	resolved: boolean;
	resolvedAt?: Date;
	remediation: string[];
}

export class ComplianceService extends EventEmitter {
	private config: ComplianceConfig;
	private frameworks: Map<ComplianceStandard, ComplianceFramework> = new Map();
	private violations: ComplianceViolation[] = [];
	private lastAssessment?: Date;

	constructor(config: ComplianceConfig) {
		super();
		this.config = config;
		this.initializeFrameworks();
	}

	async initialize(): Promise<void> {
		// Initialize compliance frameworks and load historical data
		await this.loadFrameworks();
		await this.loadViolations();

		this.emit('compliance_initialized', {
			frameworks: Array.from(this.frameworks.keys()),
			config: this.config
		});
	}

	/**
	 * Run compliance assessment for specified standards
	 */
	async runAssessment(standards?: ComplianceStandard[]): Promise<ComplianceStatus> {
		const targetStandards = standards || this.config.enabledStandards;
		const assessment: ComplianceStatus = {
			overall: 'compliant',
			frameworks: [],
			lastAssessment: new Date(),
			nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
			recommendations: []
		};

		for (const standard of targetStandards) {
			const framework = this.frameworks.get(standard);
			if (!framework) continue;

			const frameworkResult = await this.assessFramework(framework);
			assessment.frameworks.push(frameworkResult);

			if (frameworkResult.status === 'non-compliant') {
				assessment.overall = 'non-compliant';
			} else if (frameworkResult.status === 'partial' && assessment.overall === 'compliant') {
				assessment.overall = 'partial';
			}
		}

		this.lastAssessment = assessment.lastAssessment;

		this.emit('assessment_completed', {
			status: assessment,
			timestamp: new Date()
		});

		return assessment;
	}

	/**
	 * Get current compliance status
	 */
	async getComplianceStatus(): Promise<ComplianceStatus> {
		if (!this.lastAssessment || this.isAssessmentStale()) {
			return await this.runAssessment();
		}

		// Return cached status if recent
		return this.getCachedStatus();
	}

	/**
	 * Report a compliance violation
	 */
	async reportViolation(violation: Omit<ComplianceViolation, 'id' | 'detectedAt' | 'resolved'>): Promise<string> {
		const newViolation: ComplianceViolation = {
			...violation,
			id: this.generateViolationId(),
			detectedAt: new Date(),
			resolved: false
		};

		this.violations.push(newViolation);

		this.emit('violation_detected', {
			violation: newViolation,
			timestamp: new Date()
		});

		return newViolation.id;
	}

	/**
	 * Resolve a compliance violation
	 */
	async resolveViolation(violationId: string, resolution: string): Promise<boolean> {
		const violation = this.violations.find(v => v.id === violationId);
		if (!violation) return false;

		violation.resolved = true;
		violation.resolvedAt = new Date();

		this.emit('violation_resolved', {
			violationId,
			resolution,
			timestamp: new Date()
		});

		return true;
	}

	/**
	 * Get compliance violations
	 */
	getViolations(filters?: {
		resolved?: boolean;
		severity?: SecurityEventSeverity;
		standard?: ComplianceStandard;
	}): ComplianceViolation[] {
		let filtered = this.violations;

		if (filters?.resolved !== undefined) {
			filtered = filtered.filter(v => v.resolved === filters.resolved);
		}

		if (filters?.severity) {
			filtered = filtered.filter(v => v.severity === filters.severity);
		}

		return filtered;
	}

	/**
	 * Update compliance configuration
	 */
	async updateConfig(updates: Partial<ComplianceConfig>): Promise<void> {
		this.config = { ...this.config, ...updates };

		this.emit('config_updated', {
			config: this.config,
			timestamp: new Date()
		});
	}

	/**
	 * Perform health check
	 */
	async healthCheck(): Promise<boolean> {
		try {
			// Check if frameworks are loaded
			if (this.frameworks.size === 0) return false;

			// Check if we can run a basic assessment
			const testAssessment = await this.runBasicHealthAssessment();
			return testAssessment;
		} catch {
			return false;
		}
	}

	/**
	 * Shutdown compliance service
	 */
	async shutdown(): Promise<void> {
		this.frameworks.clear();
		this.violations = [];
		this.removeAllListeners();
	}

	// Private methods

	private initializeFrameworks(): void {
		// Initialize built-in compliance frameworks
		this.frameworks.set(ComplianceStandard.GDPR, this.createGDPRFramework());
		this.frameworks.set(ComplianceStandard.SOX404, this.createSOXFramework());
		this.frameworks.set(ComplianceStandard.ISO27001, this.createISO27001Framework());
		this.frameworks.set(ComplianceStandard.SOC2, this.createSOC2Framework());
	}

	private async loadFrameworks(): Promise<void> {
		// Load custom frameworks from configuration
		// This could load from database or external files
	}

	private async loadViolations(): Promise<void> {
		// Load historical violations from storage
		// This could load from database or audit logs
	}

	private async assessFramework(framework: ComplianceFramework): Promise<{
		name: string;
		status: 'compliant' | 'non-compliant' | 'partial';
		score: number;
		requirements: Array<{
			id: string;
			name: string;
			status: 'met' | 'not-met' | 'partial';
			description: string;
		}>;
	}> {
		const requirements = [];
		let metCount = 0;
		let partialCount = 0;

		for (const requirement of framework.requirements) {
			const status = await this.assessRequirement(requirement);
			requirements.push({
				id: requirement.id,
				name: requirement.name,
				status,
				description: requirement.description
			});

			if (status === 'met') metCount++;
			else if (status === 'partial') partialCount++;
		}

		const totalRequirements = framework.requirements.length;
		const score = (metCount + partialCount * 0.5) / totalRequirements;

		let overallStatus: 'compliant' | 'non-compliant' | 'partial';
		if (score >= 0.95) overallStatus = 'compliant';
		else if (score >= 0.7) overallStatus = 'partial';
		else overallStatus = 'non-compliant';

		return {
			name: framework.name,
			status: overallStatus,
			score: Math.round(score * 100),
			requirements
		};
	}

	private async assessRequirement(requirement: ComplianceRequirement): Promise<'met' | 'not-met' | 'partial'> {
		// Simplified assessment logic
		// In real implementation, this would check actual controls and evidence

		// Check for automated assessments
		const criteria = this.getAssessmentCriteria(requirement.id);
		if (criteria?.automatedCheck && criteria.checkFunction) {
			try {
				const result = await criteria.checkFunction();
				return result ? 'met' : 'not-met';
			} catch {
				return 'not-met';
			}
		}

		// Default to partial compliance for manual requirements
		return 'partial';
	}

	private getAssessmentCriteria(requirementId: string): AssessmentCriteria | undefined {
		// Get assessment criteria for a requirement
		// This would typically be loaded from the framework definition
		return undefined;
	}

	private isAssessmentStale(): boolean {
		if (!this.lastAssessment) return true;
		const stalePeriod = this.config.assessmentFrequency || 30; // days
		const staleThreshold = new Date(Date.now() - stalePeriod * 24 * 60 * 60 * 1000);
		return this.lastAssessment < staleThreshold;
	}

	private getCachedStatus(): ComplianceStatus {
		// Return the last assessment results
		// This would typically be loaded from cache or database
		return {
			overall: 'partial',
			frameworks: [],
			lastAssessment: this.lastAssessment!,
			nextAssessment: new Date(this.lastAssessment!.getTime() + 30 * 24 * 60 * 60 * 1000),
			recommendations: ['Run full compliance assessment', 'Review security policies']
		};
	}

	private async runBasicHealthAssessment(): Promise<boolean> {
		// Run a minimal assessment to verify the service is working
		try {
			const gdprFramework = this.frameworks.get(ComplianceStandard.GDPR);
			return gdprFramework !== undefined;
		} catch {
			return false;
		}
	}

	private generateViolationId(): string {
		return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	// Framework creation methods

	private createGDPRFramework(): ComplianceFramework {
		return {
			name: 'GDPR (General Data Protection Regulation)',
			version: '2018',
			requirements: [
				{
					id: 'gdpr_consent',
					name: 'Lawful Basis for Processing',
					description: 'Data processing must have a lawful basis',
					category: 'data_processing',
					controls: ['consent_management', 'data_inventory'],
					mandatory: true,
					evidenceRequired: ['consent_records', 'privacy_policy']
				},
				{
					id: 'gdpr_rights',
					name: 'Data Subject Rights',
					description: 'Implement mechanisms for data subject rights',
					category: 'individual_rights',
					controls: ['access_request', 'deletion_request', 'portability'],
					mandatory: true,
					evidenceRequired: ['rights_procedure', 'response_tracking']
				}
			],
			assessmentCriteria: []
		};
	}

	private createSOXFramework(): ComplianceFramework {
		return {
			name: 'SOX 404 (Sarbanes-Oxley)',
			version: '2002',
			requirements: [
				{
					id: 'sox_controls',
					name: 'Internal Controls',
					description: 'Establish internal controls over financial reporting',
					category: 'financial_controls',
					controls: ['access_controls', 'segregation_duties'],
					mandatory: true,
					evidenceRequired: ['control_documentation', 'testing_results']
				}
			],
			assessmentCriteria: []
		};
	}

	private createISO27001Framework(): ComplianceFramework {
		return {
			name: 'ISO 27001',
			version: '2013',
			requirements: [
				{
					id: 'iso_isms',
					name: 'Information Security Management System',
					description: 'Establish, implement, maintain ISMS',
					category: 'management_system',
					controls: ['security_policy', 'risk_management'],
					mandatory: true,
					evidenceRequired: ['isms_documentation', 'risk_assessment']
				}
			],
			assessmentCriteria: []
		};
	}

	private createSOC2Framework(): ComplianceFramework {
		return {
			name: 'SOC 2',
			version: '2017',
			requirements: [
				{
					id: 'soc2_security',
					name: 'Security Principle',
					description: 'Protect against unauthorized access',
					category: 'security',
					controls: ['access_controls', 'logical_security'],
					mandatory: true,
					evidenceRequired: ['security_policies', 'access_reviews']
				}
			],
			assessmentCriteria: []
		};
	}
}
