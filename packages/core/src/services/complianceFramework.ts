import { multiTenantAuth, Tenant, User } from './multiTenantAuth';

// Express types for middleware (avoiding direct dependency)
interface Request {
  headers: Record<string, any>;
  query: Record<string, any>;
  body: any;
}

interface Response {
  status(code: number): Response;
  json(data: any): Response;
}

interface NextFunction {
  (): void;
}

// PCI DSS Compliance Service
export interface PCIDSSConfig {
  tenantId: string;
  merchantId: string;
  encryptionLevel: 'basic' | 'enhanced';
  tokenizationEnabled: boolean;
  auditLogRetention: number; // days
  complianceLevel: 1 | 2 | 3 | 4;
}

export interface SOXConfig {
  tenantId: string;
  financialReportingEnabled: boolean;
  auditTrailRequired: boolean;
  segregationOfDuties: boolean;
  approvalWorkflows: boolean;
  dataIntegrityChecks: boolean;
}

export interface KYCAMLConfig {
  tenantId: string;
  identityVerificationLevel: 'basic' | 'enhanced' | 'premium';
  documentVerificationRequired: boolean;
  biometricVerificationEnabled: boolean;
  riskScoringEnabled: boolean;
  sanctionScreeningEnabled: boolean;
  pepScreeningEnabled: boolean;
  transactionMonitoringThreshold: number;
}

export class ComplianceFrameworkService {
  private pciConfigs: Map<string, PCIDSSConfig> = new Map();
  private soxConfigs: Map<string, SOXConfig> = new Map();
  private kycAmlConfigs: Map<string, KYCAMLConfig> = new Map();
  private auditLogs: Map<string, any[]> = new Map();

  // PCI DSS Implementation
  async configurePCIDSS(config: PCIDSSConfig): Promise<boolean> {
    try {
      // Validate tenant exists and has appropriate plan
      const tenant = await multiTenantAuth.getTenant(config.tenantId);
      if (!tenant || !this.validatePCIEligibility(tenant)) {
        throw new Error('Tenant not eligible for PCI DSS compliance');
      }

      this.pciConfigs.set(config.tenantId, config);
      await this.logComplianceEvent(config.tenantId, 'PCI_DSS_CONFIGURED', config);
      return true;
    } catch (error) {
      console.error('PCI DSS configuration failed:', error);
      return false;
    }
  }

  async validatePCICompliance(tenantId: string): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const config = this.pciConfigs.get(tenantId);
    if (!config) {
      return {
        compliant: false,
        violations: ['PCI DSS not configured'],
        recommendations: ['Configure PCI DSS compliance settings'],
      };
    }

    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check encryption requirements
    if (config.encryptionLevel === 'basic' && config.complianceLevel >= 3) {
      violations.push('Enhanced encryption required for compliance level');
      recommendations.push('Upgrade to enhanced encryption');
    }

    // Check tokenization
    if (!config.tokenizationEnabled && config.complianceLevel >= 2) {
      violations.push('Tokenization required for compliance level');
      recommendations.push('Enable credit card tokenization');
    }

    // Check audit log retention
    if (config.auditLogRetention < 365 && config.complianceLevel >= 3) {
      violations.push('Audit log retention period too short');
      recommendations.push('Extend audit log retention to at least 365 days');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  // SOX Compliance Implementation
  async configureSOX(config: SOXConfig): Promise<boolean> {
    try {
      const tenant = await multiTenantAuth.getTenant(config.tenantId);
      if (!tenant || !this.validateSOXEligibility(tenant)) {
        throw new Error('Tenant not eligible for SOX compliance');
      }

      this.soxConfigs.set(config.tenantId, config);
      await this.logComplianceEvent(config.tenantId, 'SOX_CONFIGURED', config);
      return true;
    } catch (error) {
      console.error('SOX configuration failed:', error);
      return false;
    }
  }

  async validateSOXCompliance(tenantId: string): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    const config = this.soxConfigs.get(tenantId);
    if (!config) {
      return {
        compliant: false,
        violations: ['SOX compliance not configured'],
        recommendations: ['Configure SOX compliance framework'],
      };
    }

    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check segregation of duties
    if (!config.segregationOfDuties) {
      violations.push('Segregation of duties not implemented');
      recommendations.push('Implement role separation for financial processes');
    }

    // Check approval workflows
    if (!config.approvalWorkflows) {
      violations.push('Approval workflows not configured');
      recommendations.push('Set up approval workflows for financial transactions');
    }

    // Check data integrity
    if (!config.dataIntegrityChecks) {
      violations.push('Data integrity checks not enabled');
      recommendations.push('Enable automated data integrity validation');
    }

    return {
      compliant: violations.length === 0,
      violations,
      recommendations,
    };
  }

  // KYC/AML Implementation
  async configureKYCAML(config: KYCAMLConfig): Promise<boolean> {
    try {
      const tenant = await multiTenantAuth.getTenant(config.tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      this.kycAmlConfigs.set(config.tenantId, config);
      await this.logComplianceEvent(config.tenantId, 'KYC_AML_CONFIGURED', config);
      return true;
    } catch (error) {
      console.error('KYC/AML configuration failed:', error);
      return false;
    }
  }

  async performKYCVerification(tenantId: string, userData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    documentType: string;
    documentNumber: string;
    address: string;
    phoneNumber: string;
  }): Promise<{
    verified: boolean;
    riskScore: number;
    verificationLevel: string;
    requirements: string[];
  }> {
    const config = this.kycAmlConfigs.get(tenantId);
    if (!config) {
      throw new Error('KYC/AML not configured for tenant');
    }

    // Simulate identity verification process
    let riskScore = this.calculateRiskScore(userData);
    let verified = true;
    const requirements: string[] = [];

    // Apply verification level requirements
    if (config.identityVerificationLevel === 'enhanced' && !config.documentVerificationRequired) {
      verified = false;
      requirements.push('Document verification required');
    }

    if (config.identityVerificationLevel === 'premium' && !config.biometricVerificationEnabled) {
      verified = false;
      requirements.push('Biometric verification required');
    }

    // PEP and sanctions screening
    if (config.pepScreeningEnabled) {
      const pepCheck = await this.performPEPScreening(userData);
      if (pepCheck.isPEP) {
        riskScore += 30;
        requirements.push('Enhanced due diligence required for PEP');
      }
    }

    if (config.sanctionScreeningEnabled) {
      const sanctionCheck = await this.performSanctionScreening(userData);
      if (sanctionCheck.isListed) {
        verified = false;
        requirements.push('Customer is on sanctions list');
      }
    }

    await this.logComplianceEvent(tenantId, 'KYC_VERIFICATION_PERFORMED', {
      userData: { firstName: userData.firstName, lastName: userData.lastName },
      riskScore,
      verified,
    });

    return {
      verified,
      riskScore,
      verificationLevel: config.identityVerificationLevel,
      requirements,
    };
  }

  async monitorTransaction(tenantId: string, transaction: {
    amount: number;
    currency: string;
    fromAccount: string;
    toAccount: string;
    type: string;
  }): Promise<{
    flagged: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reasons: string[];
  }> {
    const config = this.kycAmlConfigs.get(tenantId);
    if (!config) {
      throw new Error('KYC/AML not configured for tenant');
    }

    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check threshold
    if (transaction.amount > config.transactionMonitoringThreshold) {
      reasons.push('Amount exceeds monitoring threshold');
      riskLevel = 'medium';
    }

    // Pattern analysis (simplified)
    if (transaction.amount > 10000) {
      reasons.push('Large transaction amount');
      riskLevel = 'high';
    }

    // Velocity checks (simplified)
    const recentTransactions = await this.getRecentTransactions(tenantId, transaction.fromAccount);
    if (recentTransactions.length > 5) {
      reasons.push('High transaction velocity');
      riskLevel = 'high';
    }

    const flagged = riskLevel === 'high' || reasons.length > 2;

    if (flagged) {
      await this.logComplianceEvent(tenantId, 'TRANSACTION_FLAGGED', {
        transaction,
        riskLevel,
        reasons,
      });
    }

    return { flagged, riskLevel, reasons };
  }

  // Express Middleware for Compliance
  createComplianceMiddleware(requiredCompliance: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenantId = this.extractTenantId(req);
        if (!tenantId) {
          return res.status(400).json({ error: 'Tenant ID required' });
        }

        // Check each required compliance
        for (const compliance of requiredCompliance) {
          const isCompliant = await multiTenantAuth.validateCompliance(tenantId, compliance);
          if (!isCompliant) {
            return res.status(403).json({
              error: `Tenant does not meet ${compliance} compliance requirements`,
            });
          }
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Compliance validation failed' });
      }
    };
  }

  // Audit and Reporting
  async generateComplianceReport(tenantId: string): Promise<any> {
    const tenant = await multiTenantAuth.getTenant(tenantId);
    if (!tenant) return null;

    const pciConfig = this.pciConfigs.get(tenantId);
    const soxConfig = this.soxConfigs.get(tenantId);
    const kycAmlConfig = this.kycAmlConfigs.get(tenantId);

    const [pciCompliance, soxCompliance] = await Promise.all([
      pciConfig ? this.validatePCICompliance(tenantId) : null,
      soxConfig ? this.validateSOXCompliance(tenantId) : null,
    ]);

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        complianceLevel: tenant.complianceLevel,
      },
      frameworks: {
        pciDss: {
          configured: !!pciConfig,
          compliance: pciCompliance,
        },
        sox: {
          configured: !!soxConfig,
          compliance: soxCompliance,
        },
        kycAml: {
          configured: !!kycAmlConfig,
        },
      },
      auditLogs: this.auditLogs.get(tenantId) || [],
      generatedAt: new Date(),
    };
  }

  // Private helper methods
  private validatePCIEligibility(tenant: Tenant): boolean {
    return tenant.plan === 'professional' || tenant.plan === 'enterprise';
  }

  private validateSOXEligibility(tenant: Tenant): boolean {
    return tenant.plan === 'enterprise';
  }

  private extractTenantId(req: Request): string | null {
    // Extract from header, subdomain, or JWT token
    return req.headers['x-tenant-id'] as string ||
      req.query.tenantId as string ||
      null;
  }

  private calculateRiskScore(userData: any): number {
    // Simplified risk scoring
    let score = 0;

    // Age factor
    const age = new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear();
    if (age < 18 || age > 80) score += 10;

    // Document type factor
    if (userData.documentType === 'passport') score -= 5;
    else if (userData.documentType === 'id_card') score += 0;
    else score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private async performPEPScreening(userData: any): Promise<{ isPEP: boolean; confidence: number }> {
    // Simplified PEP screening
    const pepNames = ['john doe', 'jane smith']; // Mock PEP list
    const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();

    return {
      isPEP: pepNames.includes(fullName),
      confidence: 0.95,
    };
  }

  private async performSanctionScreening(userData: any): Promise<{ isListed: boolean; lists: string[] }> {
    // Simplified sanctions screening
    const sanctionedNames = ['blocked person']; // Mock sanctions list
    const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();

    return {
      isListed: sanctionedNames.includes(fullName),
      lists: sanctionedNames.includes(fullName) ? ['OFAC'] : [],
    };
  }

  private async getRecentTransactions(tenantId: string, account: string): Promise<any[]> {
    // Mock recent transactions
    return [];
  }

  private async logComplianceEvent(tenantId: string, event: string, data: any): Promise<void> {
    const logs = this.auditLogs.get(tenantId) || [];
    logs.push({
      timestamp: new Date(),
      event,
      data,
      id: Math.random().toString(36),
    });
    this.auditLogs.set(tenantId, logs);
  }
}

export const complianceFramework = new ComplianceFrameworkService();
