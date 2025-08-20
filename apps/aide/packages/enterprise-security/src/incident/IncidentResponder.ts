import { EventEmitter } from 'events';
import {
	IncidentResponseConfig,
	SecurityIncident,
	IncidentSeverity,
	IncidentStatus,
	ResponseAction,
	ResponsePlan,
	IncidentReport,
	ThreatAlert,
	EscalationRule,
	ResponseTeam,
	ImpactAssessment
} from '../types';

/**
 * Automated incident response service with customizable playbooks
 */
export class IncidentResponder extends EventEmitter {
	private config: IncidentResponseConfig;
	private activeIncidents: Map<string, SecurityIncident> = new Map();
	private responsePlans: Map<string, ResponsePlan> = new Map();
	private escalationRules: EscalationRule[] = [];
	private responseTeams: Map<string, ResponseTeam> = new Map();
	private isActive: boolean = false;

	constructor(config: IncidentResponseConfig) {
		super();
		this.config = config;
		this.initializeDefaultPlans();
		this.initializeEscalationRules();
		this.initializeResponseTeams();
	}

	/**
	 * Initialize incident response system
	 */
	public async initialize(): Promise<void> {
		try {
			await this.loadResponsePlans();
			await this.startIncidentMonitoring();
			this.isActive = true;
			this.emit('initialized');
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}
	/**
	 * Create incident from threat alert
	 */	public async createIncident(alert: ThreatAlert): Promise<SecurityIncident> {
		const incident: SecurityIncident = {
			id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			title: alert.title,
			description: alert.description,
			severity: this.mapThreatLevelToSeverity(alert.threatLevel),
			status: IncidentStatus.OPEN,
			priority: this.calculatePriority(alert),
			category: this.categorizeIncident(alert),
			source: 'ThreatDetector',
			detectedAt: new Date(),
			reportedBy: 'System',
			createdAt: new Date(),
			updatedAt: new Date(),
			discoveredBy: 'ThreatDetector',
			assignedTo: 'security-team',
			affectedSystems: alert.affectedResources || [],
			containmentActions: [],
			investigationNotes: [],
			actions: [],
			evidence: [{
				id: `evidence-${alert.id}`,
				type: 'threat_alert',
				description: 'Original threat alert',
				collectedAt: new Date(),
				collectedBy: 'ThreatDetector',
				source: 'threat_detection_system',
				location: 'security_logs',
				metadata: alert
			}], impact: {
				scope: 'local',
				affectedSystems: 1,
				affectedUsers: 0,
				dataCompromised: false,
				serviceDisruption: false,
				reputationDamage: 'low',
				financialImpact: 0,
				complianceViolation: false,
				estimatedCost: 0
			},
			lessonsLearned: [],
			timeline: [{
				timestamp: new Date(),
				action: 'Incident Created',
				description: 'New security incident created from threat alert',
				performedBy: 'System',
				actor: 'System',
				type: 'detection',
				details: `Created from threat alert ${alert.id}`
			}], communicationLog: [],
			metadata: {
				sourceAlert: alert.id,
				detectionMethod: 'automated',
				correlatedEvents: []
			}
		};

		this.activeIncidents.set(incident.id, incident);
		this.emit('incidentCreated', incident);

		// Automatically start response based on severity
		await this.initiateAutomaticResponse(incident);

		return incident;
	}

	/**
	 * Execute response plan for incident
	 */
	public async executeResponsePlan(
		incidentId: string,
		planId?: string
	): Promise<ResponseAction[]> {
		const incident = this.activeIncidents.get(incidentId);
		if (!incident) {
			throw new Error(`Incident not found: ${incidentId}`);
		}

		// Select appropriate response plan
		const plan = planId
			? this.responsePlans.get(planId)
			: this.selectResponsePlan(incident);

		if (!plan) {
			throw new Error(`No suitable response plan found for incident ${incidentId}`);
		}

		const executedActions: ResponseAction[] = [];

		try {
			// Execute response actions in sequence
			for (const action of plan.actions) {
				if (this.shouldExecuteAction(action, incident)) {
					const result = await this.executeAction(action, incident);
					executedActions.push(result);					// Update incident timeline
					incident.timeline.push({
						timestamp: new Date(),
						action: action.name,
						description: `Executed ${action.name}`,
						performedBy: 'IncidentResponder',
						actor: 'IncidentResponder',
						type: 'containment',
						details: result.result || 'Action executed successfully'
					});
				}
			}

			// Update incident status
			incident.status = IncidentStatus.IN_PROGRESS;
			incident.updatedAt = new Date();

			this.emit('responseExecuted', incident, executedActions);
			return executedActions;
		} catch (error) {
			this.emit('error', error);
			throw error;
		}
	}

	/**
	 * Escalate incident based on rules
	 */
	public async escalateIncident(incidentId: string): Promise<void> {
		const incident = this.activeIncidents.get(incidentId);
		if (!incident) {
			throw new Error(`Incident not found: ${incidentId}`);
		}

		const applicableRules = this.escalationRules.filter(rule =>
			this.matchesEscalationRule(rule, incident)
		);

		for (const rule of applicableRules) {
			await this.executeEscalation(rule, incident);
		}

		incident.updatedAt = new Date();
		this.emit('incidentEscalated', incident);
	}

	/**
	 * Update incident status
	 */
	public async updateIncidentStatus(
		incidentId: string,
		status: IncidentStatus,
		notes?: string
	): Promise<void> {
		const incident = this.activeIncidents.get(incidentId);
		if (!incident) {
			throw new Error(`Incident not found: ${incidentId}`);
		}

		const oldStatus = incident.status;
		incident.status = status;
		incident.updatedAt = new Date();
		// Add timeline entry
		incident.timeline.push({
			timestamp: new Date(),
			action: `Status changed from ${oldStatus} to ${status}`,
			description: `Status updated from ${oldStatus} to ${status}`,
			performedBy: 'System',
			actor: 'System',
			type: 'analysis',
			details: notes || 'Status updated'
		});

		// If incident is resolved, perform cleanup
		if (status === IncidentStatus.RESOLVED || status === IncidentStatus.CLOSED) {
			await this.closeIncident(incident);
		}

		this.emit('incidentStatusUpdated', incident, oldStatus, status);
	}

	/**
	 * Add investigation notes to incident
	 */
	public async addInvestigationNote(
		incidentId: string,
		note: string,
		investigator: string
	): Promise<void> {
		const incident = this.activeIncidents.get(incidentId);
		if (!incident) {
			throw new Error(`Incident not found: ${incidentId}`);
		}
		incident.investigationNotes.push({
			id: `note-${Date.now()}`,
			content: note,
			author: investigator,
			timestamp: new Date(),
			investigator,
			note
		});

		incident.timeline.push({
			timestamp: new Date(),
			action: 'Investigation Note Added',
			description: 'Investigation note added',
			performedBy: investigator,
			actor: investigator,
			type: 'analysis',
			details: note
		});

		incident.updatedAt = new Date();
		this.emit('investigationNoteAdded', incident, note);
	}

	/**
	 * Generate incident report
	 */
	public async generateIncidentReport(incidentId: string): Promise<IncidentReport> {
		const incident = this.activeIncidents.get(incidentId);
		if (!incident) {
			throw new Error(`Incident not found: ${incidentId}`);
		}
		const report: IncidentReport = {
			id: `report-${incidentId}`,
			incidentId,
			title: `Incident Report: ${incident.title}`,
			summary: this.generateIncidentSummary(incident),
			timeline: incident.timeline,
			impact: this.calculateIncidentImpact(incident),
			rootCause: incident.resolutionSummary?.rootCause || 'Under investigation',
			lessons: incident.lessonsLearned,
			recommendations: this.generateRecommendations(incident),
			generatedAt: new Date(), generatedBy: 'IncidentResponder',
			reviewed: false
		};

		this.emit('reportGenerated', report);
		return report;
	}

	/**
	 * Get active incidents
	 */
	public getActiveIncidents(): SecurityIncident[] {
		return Array.from(this.activeIncidents.values())
			.filter(incident =>
				incident.status !== IncidentStatus.RESOLVED &&
				incident.status !== IncidentStatus.CLOSED
			);
	}

	/**
	 * Get incident by ID
	 */
	public getIncident(incidentId: string): SecurityIncident | undefined {
		return this.activeIncidents.get(incidentId);
	}

	/**
	 * Update configuration
	 */
	public async updateConfig(newConfig: Partial<IncidentResponseConfig>): Promise<void> {
		this.config = { ...this.config, ...newConfig };
		this.emit('configUpdated', this.config);
	}

	/**
	 * Health check
	 */
	public async healthCheck(): Promise<boolean> {
		try {
			return this.isActive && this.responsePlans.size > 0;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Shutdown incident responder
	 */
	public async shutdown(): Promise<void> {
		this.isActive = false;
		this.removeAllListeners();
		this.emit('shutdown');
	}

	// Private methods

	private initializeDefaultPlans(): void {
		const defaultPlans: ResponsePlan[] = [{
			id: 'security-breach',
			name: 'Security Breach Response',
			description: 'Standard response for security breaches',
			severity: IncidentSeverity.HIGH,
			category: 'security_breach',
			triggerConditions: ['threat_detected', 'breach_confirmed'],
			actions: [
				{
					id: 'isolate-systems',
					name: 'Isolate Affected Systems',
					type: 'containment',
					description: 'Isolate compromised systems from network',
					assignedTo: 'security-team',
					status: 'pending',
					priority: 1,
					estimatedTime: 300,
					automated: true,
					timeout: 300,
					parameters: {},
					dependencies: []
				},
				{
					id: 'collect-evidence',
					name: 'Collect Digital Evidence',
					type: 'investigation',
					description: 'Preserve digital evidence for analysis',
					assignedTo: 'forensics-team',
					status: 'pending',
					priority: 2,
					estimatedTime: 600,
					automated: true,
					timeout: 600,
					parameters: {},
					dependencies: ['isolate-systems']
				},
				{
					id: 'notify-stakeholders',
					name: 'Notify Stakeholders',
					type: 'communication',
					description: 'Inform relevant stakeholders of the incident',
					assignedTo: 'communications-team',
					status: 'pending',
					priority: 3,
					estimatedTime: 900,
					automated: false,
					timeout: 900,
					parameters: {},
					dependencies: []
				}
			],
			escalationPath: ['security-lead', 'ciso', 'ceo'],
			contactList: ['security-team', 'it-team', 'legal'],
			documentation: ['incident-response-playbook'],
			lastUpdated: new Date(),
			enabled: true
		}
		];

		for (const plan of defaultPlans) {
			this.responsePlans.set(plan.id, plan);
		}
	}

	private initializeEscalationRules(): void {
		this.escalationRules = [
			{
				id: 'severity-escalation',
				name: 'High Severity Auto-Escalation',
				conditions: ['severity_high', 'time_threshold_exceeded'],
				condition: {
					type: 'severity_based',
					threshold: 4,
					metric: 'severity_level',
					severity: [IncidentSeverity.HIGH, IncidentSeverity.CRITICAL],
					timeThreshold: 3600000, // 1 hour
					statusIn: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS]
				},
				targetSeverity: IncidentSeverity.CRITICAL,
				escalateTo: ['security-manager', 'ciso'],
				timeThreshold: 3600000,
				enabled: true,
				action: {
					type: 'notify',
					targets: ['security-manager', 'ciso'],
					message: 'High severity incident requires immediate attention'
				}
			}
		];
	}

	private initializeResponseTeams(): void {
		this.responseTeams.set('security', {
			id: 'security',
			name: 'Security Team',
			description: 'Primary security incident response team',
			members: [
				{
					id: 'security-analyst-1',
					name: 'Security Analyst 1',
					role: 'Security Analyst',
					email: 'analyst1@company.com',
					phone: '+1-555-SEC-001',
					skills: ['threat-analysis', 'forensics'],
					availability: '24/7'
				},
				{
					id: 'security-analyst-2',
					name: 'Security Analyst 2',
					role: 'Security Analyst',
					email: 'analyst2@company.com',
					phone: '+1-555-SEC-002',
					skills: ['incident-response', 'malware-analysis'],
					availability: '24/7'
				}
			], specialization: ['threat-analysis', 'forensics', 'incident-response'],
			availableHours: '24/7',
			contactMethods: [
				{ type: 'email', value: 'security@company.com', priority: 1 },
				{ type: 'phone', value: '+1-555-SECURITY', priority: 2 }
			],
			escalationLevel: 1
		});

		this.responseTeams.set('it', {
			id: 'it',
			name: 'IT Operations',
			description: 'IT operations and infrastructure team',
			members: [
				{
					id: 'it-admin-1',
					name: 'IT Administrator 1',
					role: 'System Administrator',
					email: 'admin1@company.com',
					phone: '+1-555-IT-001',
					skills: ['system-administration', 'network-management'],
					availability: 'business-hours'
				},
				{
					id: 'it-admin-2',
					name: 'IT Administrator 2',
					role: 'Network Administrator',
					email: 'admin2@company.com',
					phone: '+1-555-IT-002',
					skills: ['network-management', 'recovery'],
					availability: 'business-hours'
				}], specialization: ['system-administration', 'network-management', 'recovery'],
			availableHours: 'business-hours',
			contactMethods: [
				{ type: 'email', value: 'it@company.com', priority: 1 },
				{ type: 'phone', value: '+1-555-SUPPORT', priority: 2 }
			],
			escalationLevel: 2
		});
	}

	private async loadResponsePlans(): Promise<void> {
		// In a real implementation, this would load from external storage
		this.emit('responsePlansLoaded', this.responsePlans.size);
	}

	private async startIncidentMonitoring(): Promise<void> {
		// Monitor for incident updates and escalations
		setInterval(() => {
			this.checkForEscalations();
		}, this.config.escalationCheckInterval || 300000); // 5 minutes
	}

	private mapThreatLevelToSeverity(threatLevel: string): IncidentSeverity {
		switch (threatLevel.toLowerCase()) {
			case 'critical': return IncidentSeverity.CRITICAL;
			case 'high': return IncidentSeverity.HIGH;
			case 'medium': return IncidentSeverity.MEDIUM;
			case 'low': return IncidentSeverity.LOW;
			default: return IncidentSeverity.MEDIUM;
		}
	}

	private calculatePriority(alert: ThreatAlert): number {
		// Priority scoring based on threat level and affected resources
		let priority = 3; // Default medium priority

		switch (alert.threatLevel) {
			case 'critical': priority = 1; break;
			case 'high': priority = 2; break;
			case 'medium': priority = 3; break;
			case 'low': priority = 4; break;
		}

		// Adjust based on affected resources
		if (alert.affectedResources && alert.affectedResources.length > 5) {
			priority = Math.max(1, priority - 1);
		}

		return priority;
	}

	private categorizeIncident(alert: ThreatAlert): string {
		// Simple categorization based on alert metadata
		if (alert.metadata?.signatureMatches?.some((match: string) => match.includes('injection'))) {
			return 'injection_attack';
		}
		if (alert.metadata?.signatureMatches?.some((match: string) => match.includes('xss'))) {
			return 'xss_attack';
		}
		if (alert.metadata?.signatureMatches?.some((match: string) => match.includes('brute'))) {
			return 'brute_force';
		}
		return 'general_security';
	}

	private async initiateAutomaticResponse(incident: SecurityIncident): Promise<void> {
		if (this.config.autoResponse &&
			(incident.severity === IncidentSeverity.HIGH || incident.severity === IncidentSeverity.CRITICAL)) {

			await this.executeResponsePlan(incident.id);
		}
	}

	private selectResponsePlan(incident: SecurityIncident): ResponsePlan | undefined {
		// Select best matching response plan
		for (const plan of this.responsePlans.values()) {
			if (plan.severity === incident.severity && plan.category === incident.category) {
				return plan;
			}
		}

		// Fallback to generic plan
		return Array.from(this.responsePlans.values())[0];
	}

	private shouldExecuteAction(action: any, incident: SecurityIncident): boolean {
		// Check if action should be executed based on conditions
		return action.automated || this.config.autoResponse;
	}

	private async executeAction(action: any, incident: SecurityIncident): Promise<ResponseAction> {
		const result: ResponseAction = {
			id: action.id,
			name: action.name,
			type: action.type,
			description: action.description || `Execute ${action.name}`,
			assignedTo: action.assignedTo || 'IncidentResponder',
			status: 'completed',
			priority: action.priority || 1,
			estimatedTime: action.estimatedTime || 300,
			executedAt: new Date(),
			executedBy: 'IncidentResponder',
			result: `Action ${action.name} executed successfully`,
			metadata: {}
		};

		// Simulate action execution
		await new Promise(resolve => setTimeout(resolve, 100));

		return result;
	}
	private matchesEscalationRule(rule: EscalationRule, incident: SecurityIncident): boolean {
		// Check if incident matches escalation rule conditions
		const condition = rule.condition;

		if (!condition) {
			return false;
		}

		if (condition.severity && !condition.severity.includes(incident.severity)) {
			return false;
		}

		if (condition.statusIn && !condition.statusIn.includes(incident.status)) {
			return false;
		}

		if (condition.timeThreshold) {
			const incidentAge = Date.now() - incident.createdAt.getTime();
			if (incidentAge < condition.timeThreshold) {
				return false;
			}
		}

		return true;
	}

	private async executeEscalation(rule: EscalationRule, incident: SecurityIncident): Promise<void> {
		// Execute escalation action
		if (rule.action.type === 'notify') {
			// Send notifications
			this.emit('escalationNotification', {
				rule,
				incident,
				targets: rule.action.targets,
				message: rule.action.message
			});
		}
		// Add to incident timeline
		incident.timeline.push({
			timestamp: new Date(),
			action: `Escalation: ${rule.name}`,
			description: `Incident escalated via rule: ${rule.name}`,
			performedBy: 'IncidentResponder',
			actor: 'IncidentResponder',
			type: 'communication',
			details: rule.action.message || 'Incident escalated'
		});
	}

	private async closeIncident(incident: SecurityIncident): Promise<void> {		// Perform incident closure tasks
		incident.timeline.push({
			timestamp: new Date(),
			action: 'Incident Closed',
			description: 'Incident resolution completed',
			performedBy: 'IncidentResponder',
			actor: 'IncidentResponder',
			type: 'resolution',
			details: 'Incident resolution completed'
		});

		this.emit('incidentClosed', incident);
	}

	private generateIncidentSummary(incident: SecurityIncident): string {
		return `Security incident ${incident.id} - ${incident.title}. ` +
			`Severity: ${incident.severity}, Status: ${incident.status}. ` +
			`Created: ${incident.createdAt.toISOString()}. ` +
			`Affected systems: ${incident.affectedSystems.length}.`;
	}
	private calculateIncidentImpact(incident: SecurityIncident): ImpactAssessment {
		const systemCount = incident.affectedSystems.length;
		const scope = systemCount > 20 ? 'organization' : systemCount > 5 ? 'department' : 'local';
		const reputationDamage = incident.severity === IncidentSeverity.CRITICAL ? 'high' :
			incident.severity === IncidentSeverity.HIGH ? 'medium' : 'low';

		return {
			scope: scope as 'local' | 'department' | 'organization' | 'external',
			affectedSystems: systemCount,
			affectedUsers: systemCount * 10, // Estimate
			dataCompromised: incident.category.includes('breach') || incident.category.includes('leak'),
			serviceDisruption: incident.severity !== IncidentSeverity.LOW,
			reputationDamage: reputationDamage as 'none' | 'low' | 'medium' | 'high',
			financialImpact: systemCount * 1000, // Estimate in dollars
			complianceViolation: incident.category.includes('compliance'),
			estimatedCost: systemCount * 5000 // Estimate total cost
		};
	}

	private generateRecommendations(incident: SecurityIncident): string[] {
		const recommendations: string[] = [];

		switch (incident.category) {
			case 'injection_attack':
				recommendations.push(
					'Implement input validation',
					'Use parameterized queries',
					'Regular security code reviews'
				);
				break;
			case 'brute_force':
				recommendations.push(
					'Implement account lockout policies',
					'Use multi-factor authentication',
					'Monitor login attempts'
				);
				break;
			default:
				recommendations.push(
					'Review security controls',
					'Update monitoring rules',
					'Conduct security training'
				);
		}

		return recommendations;
	}

	private calculateResponseTime(incident: SecurityIncident): number {
		// Calculate time from creation to first response action
		const firstResponse = incident.timeline.find(entry =>
			entry.action !== 'Incident Created'
		);

		if (firstResponse) {
			return firstResponse.timestamp.getTime() - incident.createdAt.getTime();
		}

		return 0;
	}

	private calculateResolutionTime(incident: SecurityIncident): number {
		// Calculate time from creation to resolution
		if (incident.status === IncidentStatus.RESOLVED || incident.status === IncidentStatus.CLOSED) {
			return incident.updatedAt.getTime() - incident.createdAt.getTime();
		}

		return 0;
	}

	private countEscalations(incident: SecurityIncident): number {
		return incident.timeline.filter(entry =>
			entry.action.startsWith('Escalation:')
		).length;
	}

	private checkForEscalations(): void {
		for (const incident of this.activeIncidents.values()) {
			if (incident.status === IncidentStatus.OPEN || incident.status === IncidentStatus.IN_PROGRESS) {
				const applicableRules = this.escalationRules.filter(rule =>
					this.matchesEscalationRule(rule, incident)
				);

				for (const rule of applicableRules) {
					this.executeEscalation(rule, incident);
				}
			}
		}
	}
}
