/**
 * Compliance Management Module - Phase 4 Week 2
 * Enterprise compliance automation and audit management
 */

export interface ComplianceFramework {
    id: string;
    name: string;
    version: string;
    description: string;
    requirements: ComplianceRequirement[];
    lastAssessment?: Date;
    status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_assessed';
    score: number; // 0-100
}

export interface ComplianceRequirement {
    id: string;
    framework: string;
    section: string;
    title: string;
    description: string;
    category: 'access_control' | 'data_protection' | 'audit' | 'incident_response' | 'governance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
    evidence: ComplianceEvidence[];
    lastAssessed: Date;
    nextReview: Date;
    responsible: string;
    remediation?: string;
}

export interface ComplianceEvidence {
    id: string;
    type: 'document' | 'configuration' | 'log' | 'screenshot' | 'code' | 'policy';
    title: string;
    description: string;
    url?: string;
    content?: string;
    hash?: string; // For integrity verification
    collectedAt: Date;
    validUntil?: Date;
}

export interface AuditLog {
    id: string;
    timestamp: Date;
    userId?: string;
    action: string;
    resource: string;
    outcome: 'success' | 'failure' | 'warning';
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    riskLevel: 'low' | 'medium' | 'high';
    complianceRelevant: boolean;
    framework?: string;
    requirementId?: string;
}

export interface ComplianceReport {
    id: string;
    framework: string;
    generatedAt: Date;
    period: { from: Date; to: Date };
    status: 'compliant' | 'non_compliant' | 'in_progress';
    overallScore: number;
    requirements: {
        total: number;
        compliant: number;
        nonCompliant: number;
        partial: number;
        notApplicable: number;
    };
    findings: ComplianceFinding[];
    recommendations: string[];
    nextAssessment: Date;
}

export interface ComplianceFinding {
    id: string;
    requirementId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    recommendation: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    priority: number;
}

export interface DataProtectionMetrics {
    dataProcessingActivities: number;
    dataSubjects: number;
    consentRecords: number;
    dataBreaches: number;
    retentionPoliciesEnforced: number;
    encryptionCoverage: number; // percentage
    accessRequests: number;
    deletionRequests: number;
}

export class ComplianceManager {
    private frameworks: Map<string, ComplianceFramework>;
    private auditLogs: AuditLog[] = [];
    private complianceReports: ComplianceReport[] = [];
    private dataProtectionMetrics: DataProtectionMetrics;

    constructor() {
        this.frameworks = new Map();
        this.dataProtectionMetrics = this.initializeDataProtectionMetrics();
        this.initializeFrameworks();
    }

    private initializeDataProtectionMetrics(): DataProtectionMetrics {
        return {
            dataProcessingActivities: 0,
            dataSubjects: 0,
            consentRecords: 0,
            dataBreaches: 0,
            retentionPoliciesEnforced: 0,
            encryptionCoverage: 95, // 95% encryption coverage
            accessRequests: 0,
            deletionRequests: 0
        };
    }

    private initializeFrameworks(): void {
        // GDPR Framework
        const gdprFramework: ComplianceFramework = {
            id: 'gdpr-2018',
            name: 'General Data Protection Regulation',
            version: '2018',
            description: 'EU data protection regulation',
            requirements: this.createGDPRRequirements(),
            status: 'in_progress',
            score: 85
        };

        // SOC 2 Framework
        const soc2Framework: ComplianceFramework = {
            id: 'soc2-2017',
            name: 'SOC 2 Type II',
            version: '2017',
            description: 'Service Organization Control 2',
            requirements: this.createSOC2Requirements(),
            status: 'in_progress',
            score: 90
        };

        // ISO 27001 Framework
        const iso27001Framework: ComplianceFramework = {
            id: 'iso27001-2013',
            name: 'ISO/IEC 27001:2013',
            version: '2013',
            description: 'Information Security Management System',
            requirements: this.createISO27001Requirements(),
            status: 'in_progress',
            score: 88
        };

        this.frameworks.set(gdprFramework.id, gdprFramework);
        this.frameworks.set(soc2Framework.id, soc2Framework);
        this.frameworks.set(iso27001Framework.id, iso27001Framework);
    }

    private createGDPRRequirements(): ComplianceRequirement[] {
        return [
            {
                id: 'gdpr-7.1',
                framework: 'gdpr-2018',
                section: 'Article 7',
                title: 'Conditions for consent',
                description: 'Consent must be freely given, specific, informed and unambiguous',
                category: 'data_protection',
                severity: 'high',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                responsible: 'Data Protection Officer'
            },
            {
                id: 'gdpr-17.1',
                framework: 'gdpr-2018',
                section: 'Article 17',
                title: 'Right to erasure',
                description: 'Data subjects have the right to obtain erasure of personal data',
                category: 'data_protection',
                severity: 'high',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                responsible: 'Data Protection Officer'
            },
            {
                id: 'gdpr-32.1',
                framework: 'gdpr-2018',
                section: 'Article 32',
                title: 'Security of processing',
                description: 'Appropriate technical and organisational measures to ensure security',
                category: 'data_protection',
                severity: 'critical',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
                responsible: 'Information Security Officer'
            },
            {
                id: 'gdpr-33.1',
                framework: 'gdpr-2018',
                section: 'Article 33',
                title: 'Notification of personal data breach',
                description: 'Breach notification to supervisory authority within 72 hours',
                category: 'incident_response',
                severity: 'critical',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                responsible: 'Data Protection Officer'
            }
        ];
    }

    private createSOC2Requirements(): ComplianceRequirement[] {
        return [
            {
                id: 'soc2-cc6.1',
                framework: 'soc2-2017',
                section: 'CC6.1',
                title: 'Logical and Physical Access Controls',
                description: 'Logical and physical access controls are designed and implemented',
                category: 'access_control',
                severity: 'high',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                responsible: 'Security Administrator'
            },
            {
                id: 'soc2-cc6.7',
                framework: 'soc2-2017',
                section: 'CC6.7',
                title: 'System Monitoring',
                description: 'System is monitored to detect potential security violations',
                category: 'audit',
                severity: 'high',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                responsible: 'Security Operations Center'
            },
            {
                id: 'soc2-cc7.1',
                framework: 'soc2-2017',
                section: 'CC7.1',
                title: 'System Capacity',
                description: 'System capacity is monitored and managed',
                category: 'governance',
                severity: 'medium',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
                responsible: 'Operations Team'
            }
        ];
    }

    private createISO27001Requirements(): ComplianceRequirement[] {
        return [
            {
                id: 'iso27001-a9.1.1',
                framework: 'iso27001-2013',
                section: 'A.9.1.1',
                title: 'Access control policy',
                description: 'Access control policy established, documented and reviewed',
                category: 'access_control',
                severity: 'high',
                status: 'compliant',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Annual
                responsible: 'Information Security Manager'
            },
            {
                id: 'iso27001-a12.6.1',
                framework: 'iso27001-2013',
                section: 'A.12.6.1',
                title: 'Management of technical vulnerabilities',
                description: 'Information about technical vulnerabilities is obtained and managed',
                category: 'governance',
                severity: 'high',
                status: 'partial',
                evidence: [],
                lastAssessed: new Date(),
                nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                responsible: 'Vulnerability Management Team',
                remediation: 'Implement automated vulnerability scanning and patch management'
            }
        ];
    }

    /**
     * Log compliance-relevant action
     */
    public logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): void {
        const auditLog: AuditLog = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            ...event
        };

        this.auditLogs.push(auditLog);

        // Update metrics based on event
        this.updateMetricsFromAuditLog(auditLog);

        // Keep only last 10000 logs for performance
        if (this.auditLogs.length > 10000) {
            this.auditLogs = this.auditLogs.slice(-10000);
        }
    }

    private updateMetricsFromAuditLog(log: AuditLog): void {
        if (log.action === 'data_processing') {
            this.dataProtectionMetrics.dataProcessingActivities++;
        } else if (log.action === 'consent_granted') {
            this.dataProtectionMetrics.consentRecords++;
        } else if (log.action === 'data_breach') {
            this.dataProtectionMetrics.dataBreaches++;
        } else if (log.action === 'data_access_request') {
            this.dataProtectionMetrics.accessRequests++;
        } else if (log.action === 'data_deletion_request') {
            this.dataProtectionMetrics.deletionRequests++;
        }
    }

    /**
     * Assess compliance for a specific framework
     */
    public async assessCompliance(frameworkId: string): Promise<ComplianceReport> {
        const framework = this.frameworks.get(frameworkId);
        if (!framework) {
            throw new Error(`Framework ${frameworkId} not found`);
        }

        const requirements = framework.requirements;
        const findings: ComplianceFinding[] = [];

        // Count requirement statuses
        const statusCounts = {
            total: requirements.length,
            compliant: 0,
            nonCompliant: 0,
            partial: 0,
            notApplicable: 0
        };

        // Assess each requirement
        requirements.forEach(req => {
            switch (req.status) {
                case 'compliant':
                    statusCounts.compliant++;
                    break;
                case 'non_compliant':
                    statusCounts.nonCompliant++;
                    findings.push(this.createFinding(req, 'non_compliant'));
                    break;
                case 'partial':
                    statusCounts.partial++;
                    findings.push(this.createFinding(req, 'partial'));
                    break;
                case 'not_applicable':
                    statusCounts.notApplicable++;
                    break;
            }
        });

        // Calculate overall score
        const weightedScore = (statusCounts.compliant * 100 + statusCounts.partial * 50) /
            (statusCounts.total - statusCounts.notApplicable);

        let overallStatus: 'compliant' | 'non_compliant' | 'in_progress';
        if (weightedScore >= 95) {
            overallStatus = 'compliant';
        } else if (weightedScore >= 70) {
            overallStatus = 'in_progress';
        } else {
            overallStatus = 'non_compliant';
        }

        // Generate recommendations
        const recommendations = this.generateRecommendations(findings);

        const report: ComplianceReport = {
            id: crypto.randomUUID(),
            framework: frameworkId,
            generatedAt: new Date(),
            period: {
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                to: new Date()
            },
            status: overallStatus,
            overallScore: Math.round(weightedScore),
            requirements: statusCounts,
            findings,
            recommendations,
            nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        };

        this.complianceReports.push(report);
        framework.lastAssessment = new Date();
        framework.status = overallStatus;
        framework.score = Math.round(weightedScore);

        return report;
    }

    private createFinding(requirement: ComplianceRequirement, type: 'non_compliant' | 'partial'): ComplianceFinding {
        return {
            id: crypto.randomUUID(),
            requirementId: requirement.id,
            severity: requirement.severity,
            title: `${requirement.section}: ${requirement.title}`,
            description: type === 'non_compliant'
                ? `Requirement not met: ${requirement.description}`
                : `Requirement partially met: ${requirement.description}`,
            impact: this.getImpactDescription(requirement.severity),
            recommendation: requirement.remediation || 'Review and implement necessary controls',
            effort: this.getEffortEstimate(requirement.severity),
            timeline: this.getTimelineEstimate(requirement.severity),
            priority: this.getPriority(requirement.severity)
        };
    }

    private getImpactDescription(severity: string): string {
        switch (severity) {
            case 'critical': return 'High regulatory risk, potential fines and legal action';
            case 'high': return 'Moderate regulatory risk, potential compliance violations';
            case 'medium': return 'Low regulatory risk, best practice deviation';
            case 'low': return 'Minimal risk, documentation or process improvement needed';
            default: return 'Unknown impact';
        }
    }

    private getEffortEstimate(severity: string): 'low' | 'medium' | 'high' {
        switch (severity) {
            case 'critical':
            case 'high':
                return 'high';
            case 'medium':
                return 'medium';
            case 'low':
            default:
                return 'low';
        }
    }

    private getTimelineEstimate(severity: string): string {
        switch (severity) {
            case 'critical': return 'Immediate (1-7 days)';
            case 'high': return 'Urgent (1-4 weeks)';
            case 'medium': return 'Moderate (1-3 months)';
            case 'low': return 'Planned (3-6 months)';
            default: return 'To be determined';
        }
    }

    private getPriority(severity: string): number {
        switch (severity) {
            case 'critical': return 1;
            case 'high': return 2;
            case 'medium': return 3;
            case 'low': return 4;
            default: return 5;
        }
    }

    private generateRecommendations(findings: ComplianceFinding[]): string[] {
        const recommendations: string[] = [];

        // Analyze findings patterns
        const severityCount = findings.reduce((acc, finding) => {
            acc[finding.severity] = (acc[finding.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        if (severityCount.critical > 0) {
            recommendations.push('Address critical compliance gaps immediately to avoid regulatory penalties');
        }

        if (severityCount.high > 2) {
            recommendations.push('Develop a comprehensive remediation plan for high-severity findings');
        }

        if (findings.length > 10) {
            recommendations.push('Consider engaging external compliance experts for assessment and remediation');
        }

        // Framework-specific recommendations
        const frameworks = [...new Set(findings.map(f => f.requirementId.split('-')[0]))];

        if (frameworks.includes('gdpr')) {
            recommendations.push('Ensure data protection impact assessments are current and comprehensive');
        }

        if (frameworks.includes('soc2')) {
            recommendations.push('Review and update security monitoring and incident response procedures');
        }

        if (frameworks.includes('iso27001')) {
            recommendations.push('Conduct regular risk assessments and update security policies');
        }

        return recommendations;
    }

    /**
     * Get compliance dashboard data
     */
    public getComplianceDashboard(): {
        overallStatus: string;
        frameworks: Array<{
            id: string;
            name: string;
            status: string;
            score: number;
            lastAssessment?: Date;
        }>;
        recentFindings: ComplianceFinding[];
        auditMetrics: {
            totalLogs: number;
            criticalEvents: number;
            complianceRelevantEvents: number;
            lastWeekEvents: number;
        };
        dataProtectionMetrics: DataProtectionMetrics;
        upcomingReviews: Array<{
            requirementId: string;
            title: string;
            framework: string;
            nextReview: Date;
        }>;
    } {
        // Calculate overall status
        const frameworks = Array.from(this.frameworks.values());
        const avgScore = frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length;

        let overallStatus: string;
        if (avgScore >= 95) overallStatus = 'Excellent';
        else if (avgScore >= 85) overallStatus = 'Good';
        else if (avgScore >= 70) overallStatus = 'Needs Improvement';
        else overallStatus = 'Critical';

        // Recent findings from last report
        const lastReport = this.complianceReports[this.complianceReports.length - 1];
        const recentFindings = lastReport ? lastReport.findings.slice(0, 5) : [];

        // Audit metrics
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const auditMetrics = {
            totalLogs: this.auditLogs.length,
            criticalEvents: this.auditLogs.filter(log => log.riskLevel === 'high').length,
            complianceRelevantEvents: this.auditLogs.filter(log => log.complianceRelevant).length,
            lastWeekEvents: this.auditLogs.filter(log => log.timestamp >= oneWeekAgo).length
        };

        // Upcoming reviews
        const upcomingReviews: Array<{
            requirementId: string;
            title: string;
            framework: string;
            nextReview: Date;
        }> = [];

        frameworks.forEach(framework => {
            framework.requirements.forEach(req => {
                if (req.nextReview <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) { // Next 30 days
                    upcomingReviews.push({
                        requirementId: req.id,
                        title: req.title,
                        framework: framework.name,
                        nextReview: req.nextReview
                    });
                }
            });
        });

        upcomingReviews.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

        return {
            overallStatus,
            frameworks: frameworks.map(f => ({
                id: f.id,
                name: f.name,
                status: f.status,
                score: f.score,
                lastAssessment: f.lastAssessment
            })),
            recentFindings,
            auditMetrics,
            dataProtectionMetrics: this.dataProtectionMetrics,
            upcomingReviews: upcomingReviews.slice(0, 10)
        };
    }

    /**
     * Generate compliance certificate
     */
    public generateComplianceCertificate(frameworkId: string): {
        certificateId: string;
        framework: string;
        organization: string;
        issuedDate: Date;
        validUntil: Date;
        status: 'valid' | 'expired' | 'revoked';
        score: number;
        attestation: string;
    } {
        const framework = this.frameworks.get(frameworkId);
        if (!framework || framework.status !== 'compliant') {
            throw new Error('Framework not compliant or not found');
        }

        return {
            certificateId: crypto.randomUUID(),
            framework: framework.name,
            organization: 'MemorAI Platform',
            issuedDate: new Date(),
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            status: 'valid',
            score: framework.score,
            attestation: `This certificate attests that MemorAI Platform has demonstrated compliance with ${framework.name} requirements with a score of ${framework.score}%.`
        };
    }
}
