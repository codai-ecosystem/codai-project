import { AuthenticationSystem, DEFAULT_AUTH_CONFIG, type AuthenticationConfig } from './authentication.js';
import { SecurityMiddleware, DEFAULT_SECURITY_MIDDLEWARE_CONFIG, type SecurityMiddlewareConfig } from './middleware.js';
import { ComplianceFramework, DEFAULT_COMPLIANCE_CONFIG, type ComplianceConfig } from './compliance.js';
import { VulnerabilityScanner, DEFAULT_VULNERABILITY_SCAN_CONFIG, type VulnerabilityScanConfig } from './vulnerability-scanner.js';
import { SecurityValidationSystem } from './validation.js';

// Simple logger until @codai/logger is available
const logger = {
  debug: (msg: string, meta?: any) => console.debug(`[IntegratedSecuritySystem] ${msg}`, meta || ''),
  info: (msg: string, meta?: any) => console.info(`[IntegratedSecuritySystem] ${msg}`, meta || ''),
  warn: (msg: string, meta?: any) => console.warn(`[IntegratedSecuritySystem] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[IntegratedSecuritySystem] ${msg}`, meta || '')
};

export interface IntegratedSecurityConfig {
  authentication: AuthenticationConfig;
  middleware: SecurityMiddlewareConfig;
  compliance: ComplianceConfig;
  vulnerabilityScanning: VulnerabilityScanConfig;
  validation: {
    enableInputValidation: boolean;
    enableOutputSanitization: boolean;
    enableRateLimiting: boolean;
  };
  monitoring: {
    enableSecurityMetrics: boolean;
    enableAlerts: boolean;
    enableDashboard: boolean;
    metricsRetentionDays: number;
  };
  integrations: {
    enableSIEMIntegration: boolean;
    enableLogAggregation: boolean;
    enableThreatIntelligence: boolean;
    siemEndpoints: string[];
  };
}

export interface SecurityMetrics {
  timestamp: Date;
  authentication: {
    totalUsers: number;
    activeUsers: number;
    failedLogins: number;
    lockedAccounts: number;
    mfaEnabled: number;
  };
  middleware: {
    totalRequests: number;
    blockedRequests: number;
    rateLimitHits: number;
    securityViolations: number;
  };
  compliance: {
    totalDataSubjects: number;
    activeConsents: number;
    privacyRequests: number;
    complianceScore: number;
  };
  vulnerabilities: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    fixedVulnerabilities: number;
  };
  overall: {
    securityScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastScan: Date;
    incidentCount: number;
  };
}

export interface SecurityIncident {
  id: string;
  timestamp: Date;
  type: 'authentication_failure' | 'authorization_violation' | 'data_breach' | 'vulnerability_exploit' | 'compliance_violation' | 'security_scan_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  affectedResources: string[];
  mitigationStatus: 'open' | 'investigating' | 'mitigated' | 'resolved';
  responseActions: string[];
  metadata: Record<string, any>;
}

export interface SecurityReport {
  id: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: SecurityMetrics;
  incidents: SecurityIncident[];
  complianceStatus: {
    gdpr: 'compliant' | 'partial' | 'non_compliant';
    ccpa: 'compliant' | 'partial' | 'non_compliant';
    iso27001: 'compliant' | 'partial' | 'non_compliant';
    soc2: 'compliant' | 'partial' | 'non_compliant';
  };
  vulnerabilityTrends: {
    totalCount: number;
    newThisPeriod: number;
    fixedThisPeriod: number;
    averageTimeToFix: number; // days
  };
  recommendations: string[];
}

/**
 * Integrated Security System that orchestrates all security components:
 * - Authentication and authorization
 * - Security middleware and request validation
 * - Compliance framework and data protection
 * - Vulnerability scanning and remediation
 * - Security monitoring and incident response
 * - Centralized security reporting and analytics
 * - Integration with external security tools (SIEM, threat intelligence)
 */
export class IntegratedSecuritySystem {
  private readonly config: IntegratedSecurityConfig;
  private readonly authSystem: AuthenticationSystem;
  private readonly securityMiddleware: SecurityMiddleware;
  private readonly complianceFramework: ComplianceFramework;
  private readonly vulnerabilityScanner: VulnerabilityScanner;
  private readonly validationSystem: SecurityValidationSystem;
  
  private readonly securityMetrics: SecurityMetrics[] = [];
  private readonly securityIncidents: SecurityIncident[] = [];
  private readonly metricsCollectionInterval: NodeJS.Timeout;

  constructor(config?: Partial<IntegratedSecurityConfig>) {
    this.config = this.mergeConfigs(config);
    
    // Initialize all security components
    this.authSystem = new AuthenticationSystem(this.config.authentication);
    this.complianceFramework = new ComplianceFramework(this.config.compliance);
    this.vulnerabilityScanner = new VulnerabilityScanner(this.config.vulnerabilityScanning);
    this.validationSystem = new SecurityValidationSystem({
      maxInputLength: 10000,
      allowedDomains: ['cautai.ro', 'romcp.ro', 'localhost'],
      bannedPatterns: [],
      enableDOMPurification: true,
      enableSQLInjectionCheck: true,
      enableXSSCheck: true,
      enableCommandInjectionCheck: true,
      enablePathTraversalCheck: true
    });
    this.securityMiddleware = new SecurityMiddleware(this.config.middleware, this.authSystem);
    
    // Start monitoring
    this.metricsCollectionInterval = this.startMetricsCollection();
    
    logger.info('Integrated Security System initialized', {
      authEnabled: true,
      complianceEnabled: this.config.compliance.enableGDPR || this.config.compliance.enableCCPA,
      vulnerabilityScanningEnabled: this.config.vulnerabilityScanning.enableDependencyScanning,
      monitoringEnabled: this.config.monitoring.enableSecurityMetrics
    });
  }

  /**
   * Perform comprehensive security health check
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    components: {
      authentication: 'healthy' | 'warning' | 'critical';
      compliance: 'healthy' | 'warning' | 'critical';
      vulnerabilities: 'healthy' | 'warning' | 'critical';
      validation: 'healthy' | 'warning' | 'critical';
    };
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check authentication system
    const authStats = this.authSystem.getSecurityStats();
    const authStatus = this.assessAuthenticationHealth(authStats, issues, recommendations);
    
    // Check compliance framework
    const complianceStats = this.complianceFramework.getComplianceStats();
    const complianceStatus = this.assessComplianceHealth(complianceStats, issues, recommendations);
    
    // Check vulnerability scanner
    const vulnStats = this.vulnerabilityScanner.getVulnerabilityStats();
    const vulnStatus = this.assessVulnerabilityHealth(vulnStats, issues, recommendations);
    
    // Check validation system (always healthy in demo)
    const validationStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // Determine overall status
    const componentStatuses = [authStatus, complianceStatus, vulnStatus, validationStatus];
    const overallStatus = this.determineOverallStatus(componentStatuses);
    
    return {
      status: overallStatus,
      components: {
        authentication: authStatus,
        compliance: complianceStatus,
        vulnerabilities: vulnStatus,
        validation: validationStatus
      },
      issues,
      recommendations
    };
  }

  /**
   * Generate comprehensive security report
   */
  async generateSecurityReport(startDate: Date, endDate: Date): Promise<SecurityReport> {
    const reportId = crypto.randomUUID();
    
    // Collect metrics from all components
    const authStats = this.authSystem.getSecurityStats();
    const middlewareStats = this.securityMiddleware.getSecurityStats();
    const complianceStats = this.complianceFramework.getComplianceStats();
    const vulnStats = this.vulnerabilityScanner.getVulnerabilityStats();
    
    // Calculate overall security score
    const securityScore = this.calculateSecurityScore({
      authStats,
      complianceStats,
      vulnStats,
      middlewareStats
    });
    
    // Get incidents for the period
    const periodIncidents = this.securityIncidents.filter(
      incident => incident.timestamp >= startDate && incident.timestamp <= endDate
    );
    
    const report: SecurityReport = {
      id: reportId,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      summary: {
        timestamp: new Date(),
        authentication: {
          totalUsers: authStats.totalUsers,
          activeUsers: authStats.activeUsers,
          failedLogins: authStats.recentFailedLogins,
          lockedAccounts: authStats.lockedUsers,
          mfaEnabled: 0 // Would calculate from user data
        },
        middleware: {
          totalRequests: 0, // Would track in production
          blockedRequests: middlewareStats.blockedIPs,
          rateLimitHits: middlewareStats.activeRateLimits,
          securityViolations: middlewareStats.suspiciousIPs
        },
        compliance: {
          totalDataSubjects: complianceStats.totalDataSubjects,
          activeConsents: complianceStats.activeConsents,
          privacyRequests: complianceStats.pendingPrivacyRequests + complianceStats.completedPrivacyRequests,
          complianceScore: complianceStats.complianceScore
        },
        vulnerabilities: {
          totalVulnerabilities: vulnStats.totalVulnerabilities,
          criticalVulnerabilities: vulnStats.criticalCount,
          highVulnerabilities: vulnStats.highCount,
          fixedVulnerabilities: vulnStats.fixedCount
        },
        overall: {
          securityScore,
          riskLevel: this.calculateRiskLevel(securityScore, vulnStats),
          lastScan: new Date(), // Would track actual last scan
          incidentCount: periodIncidents.length
        }
      },
      incidents: periodIncidents,
      complianceStatus: {
        gdpr: complianceStats.complianceScore > 80 ? 'compliant' : 'partial',
        ccpa: 'compliant', // Would assess based on actual compliance
        iso27001: 'partial', // Would assess based on actual compliance
        soc2: 'partial' // Would assess based on actual compliance
      },
      vulnerabilityTrends: {
        totalCount: vulnStats.totalVulnerabilities,
        newThisPeriod: 0, // Would calculate from historical data
        fixedThisPeriod: 0, // Would calculate from historical data
        averageTimeToFix: 0 // Would calculate from historical data
      },
      recommendations: this.generateSecurityRecommendations({
        authStats,
        complianceStats,
        vulnStats,
        securityScore,
        incidents: periodIncidents
      })
    };
    
    logger.info('Security report generated', {
      reportId,
      period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
      securityScore,
      incidentCount: periodIncidents.length
    });
    
    return report;
  }

  /**
   * Record security incident
   */
  async recordSecurityIncident(incident: Omit<SecurityIncident, 'id' | 'timestamp'>): Promise<string> {
    const securityIncident: SecurityIncident = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...incident
    };
    
    this.securityIncidents.push(securityIncident);
    
    // Log high-severity incidents
    if (securityIncident.severity === 'critical' || securityIncident.severity === 'high') {
      logger.error('High-severity security incident recorded', {
        incidentId: securityIncident.id,
        type: securityIncident.type,
        severity: securityIncident.severity
      });
      
      // Would trigger alert notifications in production
      await this.triggerSecurityAlert(securityIncident);
    }
    
    return securityIncident.id;
  }

  /**
   * Get current security metrics
   */
  getCurrentSecurityMetrics(): SecurityMetrics {
    const authStats = this.authSystem.getSecurityStats();
    const middlewareStats = this.securityMiddleware.getSecurityStats();
    const complianceStats = this.complianceFramework.getComplianceStats();
    const vulnStats = this.vulnerabilityScanner.getVulnerabilityStats();
    
    const securityScore = this.calculateSecurityScore({
      authStats,
      complianceStats,
      vulnStats,
      middlewareStats
    });
    
    return {
      timestamp: new Date(),
      authentication: {
        totalUsers: authStats.totalUsers,
        activeUsers: authStats.activeUsers,
        failedLogins: authStats.recentFailedLogins,
        lockedAccounts: authStats.lockedUsers,
        mfaEnabled: 0
      },
      middleware: {
        totalRequests: 0,
        blockedRequests: middlewareStats.blockedIPs,
        rateLimitHits: middlewareStats.activeRateLimits,
        securityViolations: middlewareStats.suspiciousIPs
      },
      compliance: {
        totalDataSubjects: complianceStats.totalDataSubjects,
        activeConsents: complianceStats.activeConsents,
        privacyRequests: complianceStats.pendingPrivacyRequests + complianceStats.completedPrivacyRequests,
        complianceScore: complianceStats.complianceScore
      },
      vulnerabilities: {
        totalVulnerabilities: vulnStats.totalVulnerabilities,
        criticalVulnerabilities: vulnStats.criticalCount,
        highVulnerabilities: vulnStats.highCount,
        fixedVulnerabilities: vulnStats.fixedCount
      },
      overall: {
        securityScore,
        riskLevel: this.calculateRiskLevel(securityScore, vulnStats),
        lastScan: new Date(),
        incidentCount: this.securityIncidents.filter(
          i => i.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }
    };
  }

  /**
   * Get security system components for direct access
   */
  getComponents() {
    return {
      authentication: this.authSystem,
      middleware: this.securityMiddleware,
      compliance: this.complianceFramework,
      vulnerabilityScanner: this.vulnerabilityScanner,
      validation: this.validationSystem
    };
  }

  /**
   * Shutdown security system
   */
  async shutdown(): Promise<void> {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }
    
    logger.info('Integrated Security System shutdown complete');
  }

  /**
   * Merge default and custom configurations
   */
  private mergeConfigs(customConfig?: Partial<IntegratedSecurityConfig>): IntegratedSecurityConfig {
    const defaultConfig: IntegratedSecurityConfig = {
      authentication: DEFAULT_AUTH_CONFIG,
      middleware: DEFAULT_SECURITY_MIDDLEWARE_CONFIG,
      compliance: DEFAULT_COMPLIANCE_CONFIG,
      vulnerabilityScanning: DEFAULT_VULNERABILITY_SCAN_CONFIG,
      validation: {
        enableInputValidation: true,
        enableOutputSanitization: true,
        enableRateLimiting: true
      },
      monitoring: {
        enableSecurityMetrics: true,
        enableAlerts: true,
        enableDashboard: false,
        metricsRetentionDays: 90
      },
      integrations: {
        enableSIEMIntegration: false,
        enableLogAggregation: false,
        enableThreatIntelligence: false,
        siemEndpoints: []
      }
    };

    return {
      ...defaultConfig,
      ...customConfig,
      authentication: { ...defaultConfig.authentication, ...customConfig?.authentication },
      middleware: { ...defaultConfig.middleware, ...customConfig?.middleware },
      compliance: { ...defaultConfig.compliance, ...customConfig?.compliance },
      vulnerabilityScanning: { ...defaultConfig.vulnerabilityScanning, ...customConfig?.vulnerabilityScanning },
      validation: { ...defaultConfig.validation, ...customConfig?.validation },
      monitoring: { ...defaultConfig.monitoring, ...customConfig?.monitoring },
      integrations: { ...defaultConfig.integrations, ...customConfig?.integrations }
    };
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): NodeJS.Timeout {
    return setInterval(() => {
      if (this.config.monitoring.enableSecurityMetrics) {
        const metrics = this.getCurrentSecurityMetrics();
        this.securityMetrics.push(metrics);
        
        // Keep only recent metrics based on retention policy
        const cutoffDate = new Date(Date.now() - this.config.monitoring.metricsRetentionDays * 24 * 60 * 60 * 1000);
        const retainedMetrics = this.securityMetrics.filter(m => m.timestamp > cutoffDate);
        this.securityMetrics.length = 0;
        this.securityMetrics.push(...retainedMetrics);
      }
    }, 5 * 60 * 1000); // Collect metrics every 5 minutes
  }

  /**
   * Assess authentication system health
   */
  private assessAuthenticationHealth(
    stats: any,
    issues: string[],
    recommendations: string[]
  ): 'healthy' | 'warning' | 'critical' {
    if (stats.lockedUsers > stats.totalUsers * 0.1) {
      issues.push('High number of locked user accounts detected');
      recommendations.push('Review account lockout policies and investigate potential attacks');
      return 'critical';
    }
    
    if (stats.recentFailedLogins > 50) {
      issues.push('High number of failed login attempts');
      recommendations.push('Enable additional monitoring and consider implementing CAPTCHA');
      return 'warning';
    }
    
    return 'healthy';
  }

  /**
   * Assess compliance framework health
   */
  private assessComplianceHealth(
    stats: any,
    issues: string[],
    recommendations: string[]
  ): 'healthy' | 'warning' | 'critical' {
    if (stats.complianceScore < 70) {
      issues.push('Compliance score below acceptable threshold');
      recommendations.push('Address compliance violations and improve data protection measures');
      return 'critical';
    }
    
    if (stats.pendingPrivacyRequests > 10) {
      issues.push('High number of pending privacy requests');
      recommendations.push('Allocate resources to process privacy requests within required timeframes');
      return 'warning';
    }
    
    return 'healthy';
  }

  /**
   * Assess vulnerability scanner health
   */
  private assessVulnerabilityHealth(
    stats: any,
    issues: string[],
    recommendations: string[]
  ): 'healthy' | 'warning' | 'critical' {
    if (stats.criticalCount > 0) {
      issues.push(`${stats.criticalCount} critical vulnerabilities detected`);
      recommendations.push('Address critical vulnerabilities immediately');
      return 'critical';
    }
    
    if (stats.highCount > 5) {
      issues.push(`${stats.highCount} high-severity vulnerabilities detected`);
      recommendations.push('Plan remediation for high-severity vulnerabilities');
      return 'warning';
    }
    
    return 'healthy';
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(
    componentStatuses: Array<'healthy' | 'warning' | 'critical'>
  ): 'healthy' | 'warning' | 'critical' {
    if (componentStatuses.includes('critical')) return 'critical';
    if (componentStatuses.includes('warning')) return 'warning';
    return 'healthy';
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(data: {
    authStats: any;
    complianceStats: any;
    vulnStats: any;
    middlewareStats: any;
  }): number {
    let score = 100;
    
    // Authentication score (30% weight)
    const authScore = Math.max(0, 100 - (data.authStats.recentFailedLogins * 2) - (data.authStats.lockedUsers * 10));
    score = score * 0.3 + authScore * 0.3;
    
    // Compliance score (25% weight)
    score = score * 0.75 + data.complianceStats.complianceScore * 0.25;
    
    // Vulnerability score (35% weight)
    const vulnScore = Math.max(0, 100 - (data.vulnStats.criticalCount * 25) - (data.vulnStats.highCount * 10) - (data.vulnStats.mediumCount * 3));
    score = score * 0.65 + vulnScore * 0.35;
    
    // Middleware score (10% weight)
    const middlewareScore = Math.max(0, 100 - (data.middlewareStats.suspiciousIPs * 5));
    score = score * 0.9 + middlewareScore * 0.1;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Calculate risk level based on security score and vulnerabilities
   */
  private calculateRiskLevel(securityScore: number, vulnStats: any): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnStats.criticalCount > 0 || securityScore < 50) return 'critical';
    if (vulnStats.highCount > 3 || securityScore < 70) return 'high';
    if (vulnStats.mediumCount > 10 || securityScore < 85) return 'medium';
    return 'low';
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(data: {
    authStats: any;
    complianceStats: any;
    vulnStats: any;
    securityScore: number;
    incidents: SecurityIncident[];
  }): string[] {
    const recommendations: string[] = [];
    
    if (data.securityScore < 80) {
      recommendations.push('Overall security score needs improvement - review all security components');
    }
    
    if (data.vulnStats.criticalCount > 0) {
      recommendations.push('Address critical vulnerabilities immediately');
    }
    
    if (data.complianceStats.complianceScore < 85) {
      recommendations.push('Improve compliance framework implementation');
    }
    
    if (data.authStats.recentFailedLogins > 20) {
      recommendations.push('Review authentication security and consider implementing additional protections');
    }
    
    const criticalIncidents = data.incidents.filter(i => i.severity === 'critical');
    if (criticalIncidents.length > 0) {
      recommendations.push('Investigate and resolve critical security incidents');
    }
    
    return recommendations;
  }

  /**
   * Trigger security alert
   */
  private async triggerSecurityAlert(incident: SecurityIncident): Promise<void> {
    if (!this.config.monitoring.enableAlerts) return;
    
    // Would integrate with alerting systems in production
    logger.warn('Security alert triggered', {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity
    });
  }
}

// Export all security components for individual use
export {
  AuthenticationSystem,
  SecurityMiddleware,
  ComplianceFramework,
  VulnerabilityScanner,
  SecurityValidationSystem
};

// Export configurations
export {
  DEFAULT_AUTH_CONFIG,
  DEFAULT_SECURITY_MIDDLEWARE_CONFIG,
  DEFAULT_COMPLIANCE_CONFIG,
  DEFAULT_VULNERABILITY_SCAN_CONFIG
};