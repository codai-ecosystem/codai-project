/**
 * CODAI Security Compliance Framework
 * Multi-framework compliance system for GDPR, HIPAA, SOX, PCI DSS, and custom standards
 */

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  requirements: ComplianceRequirement[];
  enabled: boolean;
  lastAssessment?: Date;
  complianceScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  category: string;
  title: string;
  description: string;
  severity: ComplianceSeverity;
  controls: ComplianceControl[];
  status: ComplianceStatus;
  lastChecked?: Date;
  evidence?: string[];
  exceptions?: ComplianceException[];
  remediation?: string;
  dueDate?: Date;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  type: ControlType;
  automated: boolean;
  frequency: ControlFrequency;
  implementation: string;
  validation: ControlValidation;
  lastExecuted?: Date;
  nextExecution?: Date;
  status: ControlStatus;
  evidence?: string[];
}

export interface ComplianceException {
  id: string;
  requirementId: string;
  reason: string;
  approvedBy: string;
  approvedAt: Date;
  expiresAt: Date;
  riskAssessment: string;
  compensatingControls: string[];
}

export interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  assessmentType: 'self' | 'internal' | 'external';
  assessor: string;
  startDate: Date;
  endDate?: Date;
  status: AssessmentStatus;
  findings: ComplianceFinding[];
  overallScore: number;
  recommendations: string[];
  executiveSummary: string;
  attachments?: string[];
}

export interface ComplianceFinding {
  id: string;
  requirementId: string;
  severity: ComplianceSeverity;
  finding: string;
  evidence: string[];
  recommendation: string;
  remediation?: string;
  remediationDueDate?: Date;
  assignedTo?: string;
  status: FindingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceReport {
  id: string;
  type: ReportType;
  frameworks: string[];
  period: { start: Date; end: Date };
  overallScore: number;
  frameworkScores: Record<string, number>;
  summary: ComplianceSummary;
  findings: ComplianceFinding[];
  recommendations: string[];
  trends: ComplianceTrend[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ComplianceSummary {
  totalRequirements: number;
  compliantRequirements: number;
  nonCompliantRequirements: number;
  partiallyCompliantRequirements: number;
  exemptRequirements: number;
  overDueRemediation: number;
  highRiskFindings: number;
  mediumRiskFindings: number;
  lowRiskFindings: number;
}

export interface ComplianceTrend {
  date: Date;
  framework: string;
  score: number;
  findings: number;
  remediated: number;
}

export enum ComplianceSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NOT_ASSESSED = 'NOT_ASSESSED',
  EXEMPT = 'EXEMPT'
}

export enum ControlType {
  PREVENTIVE = 'PREVENTIVE',
  DETECTIVE = 'DETECTIVE',
  CORRECTIVE = 'CORRECTIVE',
  COMPENSATING = 'COMPENSATING'
}

export enum ControlFrequency {
  CONTINUOUS = 'CONTINUOUS',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ON_DEMAND = 'ON_DEMAND'
}

export enum ControlStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FAILED = 'FAILED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'
}

export enum AssessmentStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum FindingStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  ACCEPTED_RISK = 'ACCEPTED_RISK',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export enum ReportType {
  EXECUTIVE = 'EXECUTIVE',
  DETAILED = 'DETAILED',
  TECHNICAL = 'TECHNICAL',
  REMEDIATION = 'REMEDIATION'
}

export interface ControlValidation {
  method: 'automated' | 'manual' | 'hybrid';
  criteria: string;
  acceptanceCriteria: string[];
  testProcedure: string;
  expectedResult: string;
}

export class ComplianceManager {
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private assessments: ComplianceAssessment[] = [];
  private findings: ComplianceFinding[] = [];

  constructor() {
    this.initializeFrameworks();
  }

  /**
   * Initialize compliance frameworks
   */
  private initializeFrameworks(): void {
    // GDPR Framework
    const gdpr = this.createGDPRFramework();
    this.frameworks.set(gdpr.id, gdpr);

    // HIPAA Framework
    const hipaa = this.createHIPAAFramework();
    this.frameworks.set(hipaa.id, hipaa);

    // SOX Framework
    const sox = this.createSOXFramework();
    this.frameworks.set(sox.id, sox);

    // PCI DSS Framework
    const pciDss = this.createPCIDSSFramework();
    this.frameworks.set(pciDss.id, pciDss);

    // ISO 27001 Framework
    const iso27001 = this.createISO27001Framework();
    this.frameworks.set(iso27001.id, iso27001);
  }

  /**
   * Create GDPR compliance framework
   */
  private createGDPRFramework(): ComplianceFramework {
    return {
      id: 'gdpr',
      name: 'General Data Protection Regulation',
      description: 'EU data protection regulation',
      version: '2018',
      enabled: true,
      requirements: [
        {
          id: 'gdpr_art_6',
          frameworkId: 'gdpr',
          category: 'Lawful Basis',
          title: 'Article 6 - Lawfulness of processing',
          description: 'Processing shall be lawful only if and to the extent that at least one of the lawful bases applies',
          severity: ComplianceSeverity.HIGH,
          status: ComplianceStatus.NOT_ASSESSED,
          controls: [
            {
              id: 'gdpr_consent_mgmt',
              name: 'Consent Management',
              description: 'System to capture and manage user consent',
              type: ControlType.PREVENTIVE,
              automated: true,
              frequency: ControlFrequency.CONTINUOUS,
              implementation: 'Consent management system with audit trail',
              status: ControlStatus.NOT_IMPLEMENTED,
              validation: {
                method: 'automated',
                criteria: 'Consent records are properly stored and accessible',
                acceptanceCriteria: [
                  'All consent is explicitly captured',
                  'Consent can be withdrawn',
                  'Audit trail exists for all consent changes'
                ],
                testProcedure: 'Automated validation of consent database',
                expectedResult: 'All consent records meet GDPR requirements'
              }
            }
          ]
        },
        {
          id: 'gdpr_art_17',
          frameworkId: 'gdpr',
          category: 'Individual Rights',
          title: 'Article 17 - Right to erasure',
          description: 'The data subject shall have the right to obtain from the controller the erasure of personal data',
          severity: ComplianceSeverity.HIGH,
          status: ComplianceStatus.NOT_ASSESSED,
          controls: [
            {
              id: 'gdpr_data_deletion',
              name: 'Data Deletion Process',
              description: 'Automated process to delete personal data upon request',
              type: ControlType.CORRECTIVE,
              automated: true,
              frequency: ControlFrequency.ON_DEMAND,
              implementation: 'API endpoint for data deletion with verification',
              status: ControlStatus.NOT_IMPLEMENTED,
              validation: {
                method: 'automated',
                criteria: 'Personal data can be completely removed from all systems',
                acceptanceCriteria: [
                  'Data is removed within 30 days',
                  'All backups are updated',
                  'Confirmation is provided to data subject'
                ],
                testProcedure: 'Automated test of deletion process',
                expectedResult: 'No personal data remains after deletion request'
              }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create HIPAA compliance framework
   */
  private createHIPAAFramework(): ComplianceFramework {
    return {
      id: 'hipaa',
      name: 'Health Insurance Portability and Accountability Act',
      description: 'US healthcare data protection regulation',
      version: '2013',
      enabled: true,
      requirements: [
        {
          id: 'hipaa_164_308',
          frameworkId: 'hipaa',
          category: 'Administrative Safeguards',
          title: '164.308 - Administrative Safeguards',
          description: 'Assigned security responsibility and access management',
          severity: ComplianceSeverity.HIGH,
          status: ComplianceStatus.NOT_ASSESSED,
          controls: [
            {
              id: 'hipaa_access_control',
              name: 'Access Control Management',
              description: 'Unique user identification, emergency access, and automatic logoff',
              type: ControlType.PREVENTIVE,
              automated: true,
              frequency: ControlFrequency.CONTINUOUS,
              implementation: 'Identity and access management system',
              status: ControlStatus.NOT_IMPLEMENTED,
              validation: {
                method: 'automated',
                criteria: 'All users have unique identifiers and appropriate access',
                acceptanceCriteria: [
                  'Unique user identification exists',
                  'Emergency access procedures are documented',
                  'Automatic logoff is implemented'
                ],
                testProcedure: 'Review access control logs and configurations',
                expectedResult: 'Access controls meet HIPAA requirements'
              }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create SOX compliance framework
   */
  private createSOXFramework(): ComplianceFramework {
    return {
      id: 'sox',
      name: 'Sarbanes-Oxley Act',
      description: 'US financial reporting regulation',
      version: '2002',
      enabled: true,
      requirements: [
        {
          id: 'sox_302',
          frameworkId: 'sox',
          category: 'Financial Reporting',
          title: 'Section 302 - Corporate Responsibility',
          description: 'CEO and CFO certification of financial reports',
          severity: ComplianceSeverity.CRITICAL,
          status: ComplianceStatus.NOT_ASSESSED,
          controls: [
            {
              id: 'sox_financial_controls',
              name: 'Financial Reporting Controls',
              description: 'Controls over financial data accuracy and completeness',
              type: ControlType.DETECTIVE,
              automated: false,
              frequency: ControlFrequency.QUARTERLY,
              implementation: 'Manual review and certification process',
              status: ControlStatus.NOT_IMPLEMENTED,
              validation: {
                method: 'manual',
                criteria: 'Financial data is accurate and complete',
                acceptanceCriteria: [
                  'All financial transactions are recorded',
                  'Data integrity is maintained',
                  'Executive certification is obtained'
                ],
                testProcedure: 'Manual review of financial controls',
                expectedResult: 'Financial reporting meets SOX requirements'
              }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create PCI DSS compliance framework
   */
  private createPCIDSSFramework(): ComplianceFramework {
    return {
      id: 'pci_dss',
      name: 'Payment Card Industry Data Security Standard',
      description: 'Credit card data protection standard',
      version: '4.0',
      enabled: true,
      requirements: [
        {
          id: 'pci_req_1',
          frameworkId: 'pci_dss',
          category: 'Network Security',
          title: 'Requirement 1 - Install and maintain firewall configuration',
          description: 'Firewalls are computer devices that control computer traffic',
          severity: ComplianceSeverity.HIGH,
          status: ComplianceStatus.NOT_ASSESSED,
          controls: [
            {
              id: 'pci_firewall_config',
              name: 'Firewall Configuration',
              description: 'Properly configured firewall with documented rules',
              type: ControlType.PREVENTIVE,
              automated: true,
              frequency: ControlFrequency.CONTINUOUS,
              implementation: 'Network firewall with automated monitoring',
              status: ControlStatus.NOT_IMPLEMENTED,
              validation: {
                method: 'automated',
                criteria: 'Firewall rules are properly configured and monitored',
                acceptanceCriteria: [
                  'Default deny policy is implemented',
                  'Rules are documented and approved',
                  'Regular review process exists'
                ],
                testProcedure: 'Automated firewall configuration scan',
                expectedResult: 'Firewall configuration meets PCI DSS requirements'
              }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Create ISO 27001 compliance framework
   */
  private createISO27001Framework(): ComplianceFramework {
    return {
      id: 'iso_27001',
      name: 'ISO/IEC 27001',
      description: 'Information security management systems',
      version: '2013',
      enabled: true,
      requirements: [
        {
          id: 'iso_a_9_1_1',
          frameworkId: 'iso_27001',
          category: 'Access Control',
          title: 'A.9.1.1 - Access control policy',
          description: 'An access control policy shall be established, documented and reviewed',
          severity: ComplianceSeverity.HIGH,
          status: ComplianceStatus.NOT_ASSESSED,
          controls: [
            {
              id: 'iso_access_policy',
              name: 'Access Control Policy',
              description: 'Documented access control policy with regular reviews',
              type: ControlType.PREVENTIVE,
              automated: false,
              frequency: ControlFrequency.ANNUALLY,
              implementation: 'Written policy with management approval',
              status: ControlStatus.NOT_IMPLEMENTED,
              validation: {
                method: 'manual',
                criteria: 'Access control policy exists and is current',
                acceptanceCriteria: [
                  'Policy is documented',
                  'Policy is approved by management',
                  'Policy is reviewed annually'
                ],
                testProcedure: 'Document review and interview',
                expectedResult: 'Access control policy meets ISO 27001 requirements'
              }
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Conduct compliance assessment
   */
  async conductAssessment(
    frameworkId: string,
    assessmentType: 'self' | 'internal' | 'external',
    assessor: string
  ): Promise<ComplianceAssessment> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error(`Framework ${frameworkId} not found`);
    }

    const assessment: ComplianceAssessment = {
      id: this.generateAssessmentId(),
      frameworkId,
      assessmentType,
      assessor,
      startDate: new Date(),
      status: AssessmentStatus.IN_PROGRESS,
      findings: [],
      overallScore: 0,
      recommendations: [],
      executiveSummary: ''
    };

    // Assess each requirement
    for (const requirement of framework.requirements) {
      const findings = await this.assessRequirement(requirement, assessment.id);
      assessment.findings.push(...findings);
    }

    // Calculate overall score
    assessment.overallScore = this.calculateAssessmentScore(assessment.findings);
    assessment.endDate = new Date();
    assessment.status = AssessmentStatus.COMPLETED;
    assessment.executiveSummary = this.generateExecutiveSummary(assessment);
    assessment.recommendations = this.generateRecommendations(assessment.findings);

    this.assessments.push(assessment);
    this.findings.push(...assessment.findings);

    return assessment;
  }

  /**
   * Assess individual requirement
   */
  private async assessRequirement(
    requirement: ComplianceRequirement,
    assessmentId: string
  ): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    for (const control of requirement.controls) {
      const finding = await this.assessControl(control, requirement, assessmentId);
      if (finding) {
        findings.push(finding);
      }
    }

    return findings;
  }

  /**
   * Assess individual control
   */
  private async assessControl(
    control: ComplianceControl,
    requirement: ComplianceRequirement,
    assessmentId: string
  ): Promise<ComplianceFinding | null> {
    // Simulate control assessment
    const isCompliant = control.status === ControlStatus.ACTIVE;

    if (!isCompliant) {
      return {
        id: this.generateFindingId(),
        requirementId: requirement.id,
        severity: this.mapRequirementSeverityToFindingSeverity(requirement.severity),
        finding: `Control "${control.name}" is not properly implemented`,
        evidence: [`Control status: ${control.status}`],
        recommendation: this.generateControlRecommendation(control),
        status: FindingStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * Calculate assessment score
   */
  private calculateAssessmentScore(findings: ComplianceFinding[]): number {
    if (findings.length === 0) return 100;

    let totalDeductions = 0;
    findings.forEach(finding => {
      switch (finding.severity) {
        case ComplianceSeverity.CRITICAL:
          totalDeductions += 25;
          break;
        case ComplianceSeverity.HIGH:
          totalDeductions += 15;
          break;
        case ComplianceSeverity.MEDIUM:
          totalDeductions += 10;
          break;
        case ComplianceSeverity.LOW:
          totalDeductions += 5;
          break;
      }
    });

    return Math.max(0, 100 - totalDeductions);
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(assessment: ComplianceAssessment): string {
    const framework = this.frameworks.get(assessment.frameworkId);
    const criticalFindings = assessment.findings.filter(f => f.severity === ComplianceSeverity.CRITICAL).length;
    const highFindings = assessment.findings.filter(f => f.severity === ComplianceSeverity.HIGH).length;

    return `
Assessment of ${framework?.name} completed on ${assessment.endDate?.toDateString()}.
Overall Compliance Score: ${assessment.overallScore}%

Key Findings:
- ${criticalFindings} critical findings requiring immediate attention
- ${highFindings} high-priority findings requiring remediation
- ${assessment.findings.length} total findings identified

${assessment.overallScore >= 80 ? 'The organization demonstrates strong compliance posture.' :
        assessment.overallScore >= 60 ? 'The organization has moderate compliance gaps that need attention.' :
          'The organization has significant compliance gaps requiring immediate remediation.'}
    `.trim();
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations: string[] = [];

    const criticalFindings = findings.filter(f => f.severity === ComplianceSeverity.CRITICAL);
    if (criticalFindings.length > 0) {
      recommendations.push('Immediately address all critical compliance findings to reduce organizational risk');
    }

    const highFindings = findings.filter(f => f.severity === ComplianceSeverity.HIGH);
    if (highFindings.length > 0) {
      recommendations.push('Develop remediation plan for high-priority findings within 30 days');
    }

    if (findings.length > 10) {
      recommendations.push('Consider engaging external compliance consultant for comprehensive review');
    }

    recommendations.push('Implement continuous compliance monitoring to prevent future gaps');
    recommendations.push('Provide compliance training to relevant staff members');

    return recommendations;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(
    type: ReportType,
    frameworks: string[],
    period: { start: Date; end: Date }
  ): ComplianceReport {
    const relevantFindings = this.findings.filter(f =>
      frameworks.includes(this.getFrameworkIdByRequirement(f.requirementId)) &&
      f.createdAt >= period.start &&
      f.createdAt <= period.end
    );

    const summary = this.generateComplianceSummary(frameworks, relevantFindings);
    const overallScore = this.calculateOverallScore(frameworks);
    const frameworkScores = this.calculateFrameworkScores(frameworks);

    return {
      id: this.generateReportId(),
      type,
      frameworks,
      period,
      overallScore,
      frameworkScores,
      summary,
      findings: relevantFindings,
      recommendations: this.generateRecommendations(relevantFindings),
      trends: this.generateComplianceTrends(frameworks, period),
      generatedAt: new Date(),
      generatedBy: 'ComplianceManager'
    };
  }

  /**
   * Generate compliance summary
   */
  private generateComplianceSummary(
    frameworks: string[],
    findings: ComplianceFinding[]
  ): ComplianceSummary {
    const totalRequirements = frameworks.reduce((total, frameworkId) => {
      const framework = this.frameworks.get(frameworkId);
      return total + (framework?.requirements.length || 0);
    }, 0);

    const nonCompliantRequirements = new Set(findings.map(f => f.requirementId)).size;

    return {
      totalRequirements,
      compliantRequirements: totalRequirements - nonCompliantRequirements,
      nonCompliantRequirements,
      partiallyCompliantRequirements: 0, // Simplified for this example
      exemptRequirements: 0,
      overDueRemediation: findings.filter(f =>
        f.remediationDueDate && f.remediationDueDate < new Date()
      ).length,
      highRiskFindings: findings.filter(f => f.severity === ComplianceSeverity.HIGH).length,
      mediumRiskFindings: findings.filter(f => f.severity === ComplianceSeverity.MEDIUM).length,
      lowRiskFindings: findings.filter(f => f.severity === ComplianceSeverity.LOW).length
    };
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(frameworks: string[]): number {
    if (frameworks.length === 0) return 0;

    const scores = frameworks.map(frameworkId => {
      const framework = this.frameworks.get(frameworkId);
      return framework?.complianceScore || 0;
    });

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Calculate framework-specific scores
   */
  private calculateFrameworkScores(frameworks: string[]): Record<string, number> {
    const scores: Record<string, number> = {};

    frameworks.forEach(frameworkId => {
      const framework = this.frameworks.get(frameworkId);
      scores[frameworkId] = framework?.complianceScore || 0;
    });

    return scores;
  }

  /**
   * Generate compliance trends
   */
  private generateComplianceTrends(
    frameworks: string[],
    period: { start: Date; end: Date }
  ): ComplianceTrend[] {
    // Simplified trend generation
    const trends: ComplianceTrend[] = [];
    const days = Math.ceil((period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24));

    frameworks.forEach(frameworkId => {
      for (let i = 0; i < days; i += 7) { // Weekly trends
        const date = new Date(period.start.getTime() + (i * 24 * 60 * 60 * 1000));
        trends.push({
          date,
          framework: frameworkId,
          score: Math.floor(Math.random() * 20) + 80, // Mock data
          findings: Math.floor(Math.random() * 5),
          remediated: Math.floor(Math.random() * 3)
        });
      }
    });

    return trends;
  }

  /**
   * Utility methods
   */
  private generateAssessmentId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFindingId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapRequirementSeverityToFindingSeverity(severity: ComplianceSeverity): ComplianceSeverity {
    return severity; // Direct mapping in this case
  }

  private generateControlRecommendation(control: ComplianceControl): string {
    switch (control.status) {
      case ControlStatus.NOT_IMPLEMENTED:
        return `Implement the "${control.name}" control according to the specified requirements`;
      case ControlStatus.FAILED:
        return `Review and fix the "${control.name}" control implementation`;
      case ControlStatus.INACTIVE:
        return `Activate the "${control.name}" control and ensure it operates as intended`;
      default:
        return `Review the "${control.name}" control to ensure proper operation`;
    }
  }

  private getFrameworkIdByRequirement(requirementId: string): string {
    for (const [frameworkId, framework] of this.frameworks) {
      if (framework.requirements.some(req => req.id === requirementId)) {
        return frameworkId;
      }
    }
    return '';
  }

  /**
   * Public methods for compliance management
   */

  getFramework(frameworkId: string): ComplianceFramework | undefined {
    return this.frameworks.get(frameworkId);
  }

  getAllFrameworks(): ComplianceFramework[] {
    return Array.from(this.frameworks.values());
  }

  getAssessment(assessmentId: string): ComplianceAssessment | undefined {
    return this.assessments.find(a => a.id === assessmentId);
  }

  getAllAssessments(): ComplianceAssessment[] {
    return this.assessments;
  }

  getFinding(findingId: string): ComplianceFinding | undefined {
    return this.findings.find(f => f.id === findingId);
  }

  getAllFindings(): ComplianceFinding[] {
    return this.findings;
  }

  updateFindingStatus(findingId: string, status: FindingStatus, assignedTo?: string): boolean {
    const finding = this.getFinding(findingId);
    if (!finding) return false;

    finding.status = status;
    finding.updatedAt = new Date();
    if (assignedTo) finding.assignedTo = assignedTo;

    return true;
  }

  addComplianceException(
    requirementId: string,
    reason: string,
    approvedBy: string,
    expiresAt: Date,
    riskAssessment: string,
    compensatingControls: string[]
  ): ComplianceException {
    const exception: ComplianceException = {
      id: `exception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requirementId,
      reason,
      approvedBy,
      approvedAt: new Date(),
      expiresAt,
      riskAssessment,
      compensatingControls
    };

    // Add exception to requirement
    for (const framework of this.frameworks.values()) {
      const requirement = framework.requirements.find(req => req.id === requirementId);
      if (requirement) {
        requirement.exceptions = requirement.exceptions || [];
        requirement.exceptions.push(exception);
        break;
      }
    }

    return exception;
  }
}

export default ComplianceManager;
