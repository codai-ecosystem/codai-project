import { z } from 'zod';
import { generateObject } from 'ai';
import { AI_PROVIDERS } from './index';

// Security Vulnerability Assessment
export interface SecurityScanRequest {
  codebase?: {
    files: Array<{
      path: string;
      content: string;
      language: string;
    }>;
    dependencies: Record<string, string>;
  };
  infrastructure?: {
    dockerfiles: string[];
    kubernetesManifests: string[];
    networkPolicies: string[];
    secrets: string[];
  };
  runtime?: {
    logs: string[];
    networkTraffic: Array<{
      source: string;
      destination: string;
      port: number;
      protocol: string;
    }>;
    processes: Array<{
      name: string;
      user: string;
      permissions: string[];
    }>;
  };
}

export interface SecurityVulnerability {
  id: string;
  type: 'code' | 'dependency' | 'infrastructure' | 'runtime' | 'configuration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  cveId?: string;
  cvssScore?: number;
  exploitability: 'low' | 'medium' | 'high';
  impact: string;
  remediation: {
    steps: string[];
    effort: 'low' | 'medium' | 'high';
    priority: number;
  };
  references: string[];
}

export interface SecurityAssessmentResponse {
  vulnerabilities: SecurityVulnerability[];
  riskScore: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: Array<{
    category: string;
    priority: number;
    description: string;
    implementation: string;
  }>;
  compliance: Array<{
    framework: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001';
    status: 'compliant' | 'partial' | 'non-compliant';
    issues: string[];
    recommendations: string[];
  }>;
}

const securityAssessmentSchema = z.object({
  vulnerabilities: z.array(z.object({
    id: z.string(),
    type: z.enum(['code', 'dependency', 'infrastructure', 'runtime', 'configuration']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    cveId: z.string().optional(),
    cvssScore: z.number().min(0).max(10).optional(),
    exploitability: z.enum(['low', 'medium', 'high']),
    impact: z.string(),
    remediation: z.object({
      steps: z.array(z.string()),
      effort: z.enum(['low', 'medium', 'high']),
      priority: z.number().min(1).max(10),
    }),
    references: z.array(z.string()),
  })),
  riskScore: z.number().min(0).max(100),
  summary: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
  }),
  recommendations: z.array(z.object({
    category: z.string(),
    priority: z.number().min(1).max(10),
    description: z.string(),
    implementation: z.string(),
  })),
  compliance: z.array(z.object({
    framework: z.enum(['SOC2', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO27001']),
    status: z.enum(['compliant', 'partial', 'non-compliant']),
    issues: z.array(z.string()),
    recommendations: z.array(z.string()),
  })),
});

export async function performSecurityAssessment(
  request: SecurityScanRequest,
  provider: keyof typeof AI_PROVIDERS.anthropic = 'claude-3-5-sonnet'
): Promise<SecurityAssessmentResponse> {
  const model = AI_PROVIDERS.anthropic[provider];

  const codebaseJson = request.codebase ? JSON.stringify(request.codebase, null, 2) : null;
  const infraJson = request.infrastructure ? JSON.stringify(request.infrastructure, null, 2) : null;
  const runtimeJson = request.runtime ? JSON.stringify(request.runtime, null, 2) : null;

  const result = await generateObject({
    model,
    schema: securityAssessmentSchema,
    system: `You are a cybersecurity expert with extensive knowledge of application security, infrastructure security, and compliance frameworks. Perform comprehensive security assessments to identify vulnerabilities and provide actionable remediation guidance.`,
    prompt: `Perform a comprehensive security assessment on the following system:

${codebaseJson ? `Codebase Analysis:
${codebaseJson}` : ''}

${infraJson ? `Infrastructure Configuration:
${infraJson}` : ''}

${runtimeJson ? `Runtime Environment:
${runtimeJson}` : ''}

Analyze for:
1. Code vulnerabilities (OWASP Top 10, injection attacks, XSS, etc.)
2. Dependency vulnerabilities (known CVEs, outdated packages)
3. Infrastructure misconfigurations (Docker, Kubernetes, network policies)
4. Runtime security issues (privilege escalation, exposed services)
5. Compliance framework adherence (SOC2, GDPR, HIPAA, PCI-DSS, ISO27001)

Provide:
- Detailed vulnerability assessment with severity and exploitability
- Risk scoring and impact analysis
- Prioritized remediation steps
- Compliance status and recommendations
- Security best practices implementation guide

Consider:
- CVSS scoring for known vulnerabilities
- Attack vectors and threat modeling
- Defense in depth strategies
- Zero-trust security principles
- Compliance requirements and audit trails`,
  });

  return result.object as SecurityAssessmentResponse;
}

// Threat Detection & Response
export interface ThreatDetectionRequest {
  logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error' | 'debug';
    source: string;
    message: string;
    metadata?: Record<string, any>;
  }>;
  networkActivity: Array<{
    timestamp: number;
    sourceIp: string;
    destinationIp: string;
    port: number;
    protocol: string;
    bytes: number;
    flags?: string[];
  }>;
  userActivity: Array<{
    timestamp: number;
    userId: string;
    action: string;
    resource: string;
    userAgent?: string;
    ip?: string;
  }>;
  timeWindow: number; // minutes
}

export interface ThreatDetectionResponse {
  threats: Array<{
    id: string;
    type: 'brute_force' | 'ddos' | 'injection' | 'anomalous_access' | 'data_exfiltration' | 'malware';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
    indicators: string[];
    timeline: Array<{
      timestamp: number;
      event: string;
    }>;
    affectedAssets: string[];
    recommendedActions: string[];
  }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  insights: string[];
  mitigationSteps: string[];
}

const threatDetectionSchema = z.object({
  threats: z.array(z.object({
    id: z.string(),
    type: z.enum(['brute_force', 'ddos', 'injection', 'anomalous_access', 'data_exfiltration', 'malware']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    confidence: z.number().min(0).max(1),
    description: z.string(),
    indicators: z.array(z.string()),
    timeline: z.array(z.object({
      timestamp: z.number(),
      event: z.string(),
    })),
    affectedAssets: z.array(z.string()),
    recommendedActions: z.array(z.string()),
  })),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  insights: z.array(z.string()),
  mitigationSteps: z.array(z.string()),
});

export async function detectThreats(
  request: ThreatDetectionRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o'
): Promise<ThreatDetectionResponse> {
  const model = AI_PROVIDERS.openai[provider];

  const logsJson = JSON.stringify(request.logs, null, 2);
  const networkJson = JSON.stringify(request.networkActivity, null, 2);
  const userJson = JSON.stringify(request.userActivity, null, 2);

  const result = await generateObject({
    model,
    schema: threatDetectionSchema,
    system: `You are a cybersecurity threat analyst with expertise in threat hunting, incident response, and behavioral analysis. Analyze system activity to detect potential security threats and provide actionable response recommendations.`,
    prompt: `Analyze the following system activity for potential security threats:

Time Window: ${request.timeWindow} minutes

System Logs:
${logsJson}

Network Activity:
${networkJson}

User Activity:
${userJson}

Detect and analyze:
1. Brute force attacks and credential stuffing
2. DDoS and volumetric attacks
3. Injection attacks (SQL, XSS, command injection)
4. Anomalous user access patterns
5. Data exfiltration attempts
6. Malware indicators and C&C communication

For each threat:
- Provide unique ID and classification
- Assess severity and confidence levels
- Detail indicators of compromise (IoCs)
- Create attack timeline
- Identify affected assets
- Recommend immediate response actions

Consider:
- Attack patterns and TTPs (Tactics, Techniques, Procedures)
- MITRE ATT&CK framework mapping
- False positive reduction
- Context-aware threat scoring
- Incident containment strategies`,
  });

  return result.object as ThreatDetectionResponse;
}

// Automated Incident Response
export interface IncidentRequest {
  threat: ThreatDetectionResponse['threats'][0];
  context: {
    environment: 'development' | 'staging' | 'production';
    criticalAssets: string[];
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    complianceRequirements: string[];
  };
  capabilities: {
    canBlockIPs: boolean;
    canDisableAccounts: boolean;
    canIsolateHosts: boolean;
    canNotifyTeams: boolean;
    canCreateBackups: boolean;
  };
}

export async function generateIncidentResponse(
  request: IncidentRequest,
  provider: keyof typeof AI_PROVIDERS.anthropic = 'claude-3-5-sonnet'
): Promise<{
  playbook: Array<{
    step: number;
    phase: 'identification' | 'containment' | 'eradication' | 'recovery' | 'lessons_learned';
    action: string;
    description: string;
    automated: boolean;
    timeline: string;
    owner: string;
    dependencies?: string[];
  }>;
  immediateActions: string[];
  communicationPlan: Array<{
    audience: string;
    message: string;
    channel: string;
    timing: string;
  }>;
  forensicSteps: string[];
  recoveryPlan: string[];
}> {
  const model = AI_PROVIDERS.anthropic[provider];

  const responseSchema = z.object({
    playbook: z.array(z.object({
      step: z.number(),
      phase: z.enum(['identification', 'containment', 'eradication', 'recovery', 'lessons_learned']),
      action: z.string(),
      description: z.string(),
      automated: z.boolean(),
      timeline: z.string(),
      owner: z.string(),
      dependencies: z.array(z.string()).optional(),
    })),
    immediateActions: z.array(z.string()),
    communicationPlan: z.array(z.object({
      audience: z.string(),
      message: z.string(),
      channel: z.string(),
      timing: z.string(),
    })),
    forensicSteps: z.array(z.string()),
    recoveryPlan: z.array(z.string()),
  });

  const threatJson = JSON.stringify(request.threat, null, 2);
  const contextJson = JSON.stringify(request.context, null, 2);
  const capabilitiesJson = JSON.stringify(request.capabilities, null, 2);

  const result = await generateObject({
    model,
    schema: responseSchema,
    system: `You are an incident response expert with deep knowledge of cybersecurity frameworks (NIST, SANS), forensics, and business continuity. Create comprehensive incident response plans that balance security, business operations, and compliance requirements.`,
    prompt: `Create an incident response plan for the following security threat:

Threat Details:
${threatJson}

Context:
${contextJson}

Available Capabilities:
${capabilitiesJson}

Generate a comprehensive incident response plan including:

1. Step-by-step playbook following NIST Incident Response Framework:
   - Identification: Confirm and classify the incident
   - Containment: Immediate and long-term containment strategies
   - Eradication: Remove threat and vulnerabilities
   - Recovery: Restore systems and monitor for recurrence
   - Lessons Learned: Document and improve processes

2. Immediate actions to minimize impact
3. Communication plan for stakeholders
4. Forensic preservation and investigation steps
5. Recovery and business continuity procedures

Consider:
- Business impact and operational requirements
- Compliance and legal obligations
- Available automation capabilities
- Resource constraints and expertise levels
- Evidence preservation for potential legal action
- Stakeholder communication and transparency`,
  });

  return result.object as any;
}

// Compliance Validation
export interface ComplianceValidationRequest {
  framework: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001';
  evidence: Array<{
    control: string;
    description: string;
    implementation: string;
    evidence: string[];
    responsible: string;
    testDate?: string;
    status: 'implemented' | 'partial' | 'planned' | 'not_applicable';
  }>;
  scope: {
    systems: string[];
    dataTypes: string[];
    processes: string[];
  };
}

export async function validateCompliance(
  request: ComplianceValidationRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o-mini'
): Promise<{
  assessment: {
    overallStatus: 'compliant' | 'partial' | 'non-compliant';
    score: number;
    lastUpdated: string;
  };
  controlResults: Array<{
    controlId: string;
    requirement: string;
    status: 'pass' | 'fail' | 'partial' | 'not_tested';
    findings: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }>;
  gaps: Array<{
    area: string;
    description: string;
    priority: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  recommendations: string[];
}> {
  const model = AI_PROVIDERS.openai[provider];

  const complianceSchema = z.object({
    assessment: z.object({
      overallStatus: z.enum(['compliant', 'partial', 'non-compliant']),
      score: z.number().min(0).max(100),
      lastUpdated: z.string(),
    }),
    controlResults: z.array(z.object({
      controlId: z.string(),
      requirement: z.string(),
      status: z.enum(['pass', 'fail', 'partial', 'not_tested']),
      findings: z.array(z.string()),
      recommendations: z.array(z.string()),
      riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    })),
    gaps: z.array(z.object({
      area: z.string(),
      description: z.string(),
      priority: z.number().min(1).max(10),
      effort: z.enum(['low', 'medium', 'high']),
      timeline: z.string(),
    })),
    recommendations: z.array(z.string()),
  });

  const evidenceJson = JSON.stringify(request.evidence, null, 2);
  const scopeJson = JSON.stringify(request.scope, null, 2);

  const result = await generateObject({
    model,
    schema: complianceSchema,
    system: `You are a compliance expert with deep knowledge of ${request.framework} requirements and audit procedures. Assess compliance status and provide actionable recommendations for achieving and maintaining compliance.`,
    prompt: `Validate compliance with ${request.framework} framework:

Evidence and Controls:
${evidenceJson}

Scope:
${scopeJson}

Perform comprehensive compliance validation:

1. Assess each control against ${request.framework} requirements
2. Evaluate evidence adequacy and implementation effectiveness
3. Identify compliance gaps and risks
4. Provide prioritized recommendations for remediation
5. Generate overall compliance score and status

Consider:
- Specific ${request.framework} control objectives and requirements
- Evidence quality and audit trail adequacy
- Implementation maturity and effectiveness
- Risk-based prioritization of gaps
- Practical implementation timelines and effort estimates
- Continuous monitoring and maintenance requirements

Provide detailed findings for each control with specific recommendations for improvement.`,
  });

  return result.object as any;
}
