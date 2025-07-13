import type { CodaiConfig } from '../types';
import { HttpUtils, ErrorUtils, ValidationUtils } from '../utils';

// Identity interfaces for identitai.ro integration
export interface Identity {
  id: string;
  userId: string;
  type: 'personal' | 'business' | 'government' | 'organization';
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'suspended';
  level: 'basic' | 'standard' | 'premium' | 'enterprise';

  personal?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    placeOfBirth?: string;
    nationality: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  };

  business?: {
    legalName: string;
    tradeName?: string;
    registrationNumber: string;
    taxId: string;
    industry: string;
    businessType: 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc' | 'other';
    incorporationDate: Date;
    employeeCount?: number;
    annualRevenue?: number;
  };

  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isVerified: boolean;
    verifiedAt?: Date;
  };

  contact: {
    email: string;
    emailVerified: boolean;
    phone: string;
    phoneVerified: boolean;
    alternateEmail?: string;
    alternatePhone?: string;
  };

  documents: IdentityDocument[];
  biometrics?: {
    faceId?: string;
    fingerprintId?: string;
    voiceId?: string;
    verified: boolean;
    verifiedAt?: Date;
  };

  verification: {
    method: 'manual' | 'automated' | 'hybrid';
    provider?: string;
    score: number; // 0-100
    checks: VerificationCheck[];
    lastVerified: Date;
    expiresAt?: Date;
  };

  compliance: {
    kycCompleted: boolean;
    amlCleared: boolean;
    sanctionsChecked: boolean;
    pepStatus: 'not_checked' | 'clear' | 'flagged';
    riskLevel: 'low' | 'medium' | 'high' | 'very_high';
    lastComplianceCheck: Date;
  };

  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentityDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'birth_certificate' |
  'business_license' | 'incorporation_cert' | 'tax_document' | 'utility_bill' | 'other';
  country: string;
  number: string;
  issuedDate: Date;
  expiryDate?: Date;
  issuingAuthority: string;

  images: Array<{
    id: string;
    type: 'front' | 'back' | 'selfie' | 'full_document';
    url: string;
    verified: boolean;
    metadata: {
      quality: number;
      confidence: number;
      extractedData?: Record<string, any>;
    };
  }>;

  extractedData: Record<string, any>;
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    score: number;
    checks: string[];
    verifiedAt?: Date;
    rejectionReason?: string;
  };

  uploadedAt: Date;
}

export interface VerificationCheck {
  type: 'document_verification' | 'address_verification' | 'phone_verification' |
  'email_verification' | 'biometric_verification' | 'database_check' |
  'sanctions_check' | 'pep_check' | 'aml_check';
  status: 'pending' | 'passed' | 'failed' | 'manual_review';
  score: number;
  details: Record<string, any>;
  provider?: string;
  performedAt: Date;
}

export interface VerificationSession {
  id: string;
  userId: string;
  type: 'full_verification' | 'document_only' | 'biometric_only' | 'address_only';
  status: 'started' | 'in_progress' | 'completed' | 'failed' | 'expired';

  steps: Array<{
    type: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
    data?: Record<string, any>;
    completedAt?: Date;
  }>;

  configuration: {
    requiredDocuments: string[];
    biometricsRequired: boolean;
    addressVerificationRequired: boolean;
    complianceChecks: string[];
    autoApprove: boolean;
    manualReviewThreshold: number;
  };

  result?: {
    approved: boolean;
    score: number;
    reasons: string[];
    recommendations: string[];
  };

  expiresAt: Date;
  startedAt: Date;
  completedAt?: Date;
}

export interface TrustScore {
  userId: string;
  overall: number; // 0-1000

  components: {
    identity: number;
    activity: number;
    reputation: number;
    compliance: number;
    social: number;
  };

  factors: Array<{
    type: string;
    value: number;
    weight: number;
    contribution: number;
    description: string;
  }>;

  history: Array<{
    date: Date;
    score: number;
    change: number;
    reason: string;
  }>;

  calculatedAt: Date;
  nextUpdate: Date;
}

export interface IdentityReport {
  id: string;
  userId: string;
  type: 'verification_report' | 'compliance_report' | 'risk_assessment' | 'audit_report';

  data: {
    summary: Record<string, any>;
    details: Record<string, any>;
    recommendations: string[];
    riskFactors: Array<{
      type: string;
      level: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      mitigation: string;
    }>;
  };

  format: 'json' | 'pdf' | 'html';
  generatedBy: string;
  generatedAt: Date;
  validUntil?: Date;
}

export interface BiometricTemplate {
  id: string;
  userId: string;
  type: 'face' | 'fingerprint' | 'voice' | 'iris';
  template: string; // Encrypted biometric template
  quality: number;
  confidence: number;

  metadata: {
    captureDevice?: string;
    algorithm: string;
    version: string;
    environmentalFactors?: Record<string, any>;
  };

  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
}

export interface AccessCredential {
  id: string;
  userId: string;
  type: 'api_key' | 'certificate' | 'token' | 'badge' | 'card';
  name: string;
  description?: string;

  data: {
    publicKey?: string;
    certificate?: string;
    token?: string;
    cardId?: string;
    permissions: string[];
    restrictions: Record<string, any>;
  };

  status: 'active' | 'inactive' | 'suspended' | 'revoked';
  issuedBy: string;
  issuedAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
}

// Identity service for CODAI ecosystem (identitai.ro integration)
export class IdentityService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.identity || 'https://identitai.ro/api'
    );
  }

  // Identity Management
  /**
   * Create identity profile
   */
  async createIdentity(
    identityData: Omit<Identity, 'id' | 'verification' | 'compliance' | 'createdAt' | 'updatedAt'>
  ): Promise<Identity> {
    try {
      ValidationUtils.validateRequired(identityData, [
        'userId', 'type', 'address', 'contact'
      ]);

      const response = await this.httpClient.post('/identities', identityData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create identity',
        'IDENTITY_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get identity profile
   */
  async getIdentity(identityId: string): Promise<Identity> {
    try {
      const response = await this.httpClient.get(`/identities/${identityId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get identity',
        'IDENTITY_GET_FAILED',
        error
      );
    }
  }

  /**
   * Update identity profile
   */
  async updateIdentity(
    identityId: string,
    updates: Partial<Identity>
  ): Promise<Identity> {
    try {
      const response = await this.httpClient.patch(`/identities/${identityId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update identity',
        'IDENTITY_UPDATE_FAILED',
        error
      );
    }
  }

  // Document Management
  /**
   * Upload identity document
   */
  async uploadDocument(
    identityId: string,
    documentData: {
      type: IdentityDocument['type'];
      country: string;
      images: Array<{
        type: 'front' | 'back' | 'selfie' | 'full_document';
        data: string; // Base64 or URL
      }>;
      metadata?: Record<string, any>;
    }
  ): Promise<IdentityDocument> {
    try {
      ValidationUtils.validateRequired(documentData, ['type', 'country', 'images']);

      const response = await this.httpClient.post(
        `/identities/${identityId}/documents`,
        documentData
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to upload document',
        'DOCUMENT_UPLOAD_FAILED',
        error
      );
    }
  }

  /**
   * Verify document
   */
  async verifyDocument(
    documentId: string,
    options?: {
      performOCR?: boolean;
      checkAuthenticity?: boolean;
      faceMatch?: boolean;
      livenessCheck?: boolean;
    }
  ): Promise<IdentityDocument> {
    try {
      const response = await this.httpClient.post(`/documents/${documentId}/verify`, options);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to verify document',
        'DOCUMENT_VERIFY_FAILED',
        error
      );
    }
  }

  // Verification Sessions
  /**
   * Start verification session
   */
  async startVerification(
    userId: string,
    sessionConfig: {
      type: VerificationSession['type'];
      requiredDocuments?: string[];
      biometricsRequired?: boolean;
      addressVerificationRequired?: boolean;
      complianceChecks?: string[];
      autoApprove?: boolean;
    }
  ): Promise<VerificationSession> {
    try {
      ValidationUtils.validateRequired(sessionConfig, ['type']);

      const response = await this.httpClient.post('/verification/sessions', {
        userId,
        configuration: sessionConfig
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to start verification',
        'VERIFICATION_START_FAILED',
        error
      );
    }
  }

  /**
   * Get verification session
   */
  async getVerificationSession(sessionId: string): Promise<VerificationSession> {
    try {
      const response = await this.httpClient.get(`/verification/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get verification session',
        'VERIFICATION_SESSION_FAILED',
        error
      );
    }
  }

  /**
   * Complete verification step
   */
  async completeVerificationStep(
    sessionId: string,
    stepType: string,
    data: Record<string, any>
  ): Promise<VerificationSession> {
    try {
      const response = await this.httpClient.post(
        `/verification/sessions/${sessionId}/steps/${stepType}`,
        data
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to complete verification step',
        'VERIFICATION_STEP_FAILED',
        error
      );
    }
  }

  // Biometric Management
  /**
   * Enroll biometric template
   */
  async enrollBiometric(
    userId: string,
    biometricData: {
      type: BiometricTemplate['type'];
      data: string; // Biometric data
      metadata?: Record<string, any>;
    }
  ): Promise<BiometricTemplate> {
    try {
      ValidationUtils.validateRequired(biometricData, ['type', 'data']);

      const response = await this.httpClient.post(`/users/${userId}/biometrics`, biometricData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to enroll biometric',
        'BIOMETRIC_ENROLL_FAILED',
        error
      );
    }
  }

  /**
   * Verify biometric
   */
  async verifyBiometric(
    userId: string,
    type: BiometricTemplate['type'],
    data: string
  ): Promise<{
    verified: boolean;
    confidence: number;
    templateId: string;
    metadata: Record<string, any>;
  }> {
    try {
      const response = await this.httpClient.post(`/users/${userId}/biometrics/verify`, {
        type,
        data
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to verify biometric',
        'BIOMETRIC_VERIFY_FAILED',
        error
      );
    }
  }

  // Trust Score
  /**
   * Get trust score
   */
  async getTrustScore(userId: string): Promise<TrustScore> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/trust-score`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get trust score',
        'TRUST_SCORE_FAILED',
        error
      );
    }
  }

  /**
   * Calculate trust score
   */
  async calculateTrustScore(
    userId: string,
    factors?: string[]
  ): Promise<TrustScore> {
    try {
      const response = await this.httpClient.post(`/users/${userId}/trust-score/calculate`, {
        factors
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to calculate trust score',
        'TRUST_SCORE_CALCULATE_FAILED',
        error
      );
    }
  }

  // Compliance Checks
  /**
   * Run KYC check
   */
  async runKYCCheck(
    identityId: string,
    level: 'basic' | 'standard' | 'enhanced' = 'standard'
  ): Promise<{
    passed: boolean;
    score: number;
    checks: VerificationCheck[];
    recommendations: string[];
  }> {
    try {
      const response = await this.httpClient.post(`/identities/${identityId}/kyc`, { level });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to run KYC check',
        'KYC_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Run AML screening
   */
  async runAMLScreening(
    identityId: string,
    databases?: string[]
  ): Promise<{
    cleared: boolean;
    matches: Array<{
      type: 'sanctions' | 'pep' | 'adverse_media' | 'watchlist';
      confidence: number;
      details: Record<string, any>;
    }>;
    riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  }> {
    try {
      const response = await this.httpClient.post(`/identities/${identityId}/aml`, {
        databases
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to run AML screening',
        'AML_SCREENING_FAILED',
        error
      );
    }
  }

  // Credential Management
  /**
   * Issue access credential
   */
  async issueCredential(
    userId: string,
    credentialData: Omit<AccessCredential, 'id' | 'status' | 'issuedAt' | 'lastUsed' | 'usageCount'>
  ): Promise<AccessCredential> {
    try {
      ValidationUtils.validateRequired(credentialData, [
        'type', 'name', 'data', 'issuedBy'
      ]);

      const response = await this.httpClient.post(`/users/${userId}/credentials`, credentialData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to issue credential',
        'CREDENTIAL_ISSUE_FAILED',
        error
      );
    }
  }

  /**
   * Revoke credential
   */
  async revokeCredential(credentialId: string, reason?: string): Promise<void> {
    try {
      await this.httpClient.post(`/credentials/${credentialId}/revoke`, { reason });
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to revoke credential',
        'CREDENTIAL_REVOKE_FAILED',
        error
      );
    }
  }

  /**
   * Verify credential
   */
  async verifyCredential(
    credentialId: string,
    challenge?: string
  ): Promise<{
    valid: boolean;
    status: AccessCredential['status'];
    permissions: string[];
    expiresAt?: Date;
    metadata: Record<string, any>;
  }> {
    try {
      const response = await this.httpClient.post(`/credentials/${credentialId}/verify`, {
        challenge
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to verify credential',
        'CREDENTIAL_VERIFY_FAILED',
        error
      );
    }
  }

  // Reporting
  /**
   * Generate identity report
   */
  async generateReport(
    userId: string,
    reportType: IdentityReport['type'],
    options?: {
      format?: 'json' | 'pdf' | 'html';
      includeHistory?: boolean;
      includeBiometrics?: boolean;
      timeRange?: { start: Date; end: Date };
    }
  ): Promise<IdentityReport> {
    try {
      const response = await this.httpClient.post(`/users/${userId}/reports`, {
        type: reportType,
        options
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to generate report',
        'REPORT_GENERATE_FAILED',
        error
      );
    }
  }

  /**
   * Search identities (admin/compliance function)
   */
  async searchIdentities(criteria: {
    status?: Identity['status'];
    type?: Identity['type'];
    level?: Identity['level'];
    country?: string;
    riskLevel?: string;
    verificationScore?: { min: number; max: number };
    dateRange?: { start: Date; end: Date };
    limit?: number;
    offset?: number;
  }): Promise<{
    identities: Identity[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const response = await this.httpClient.post('/identities/search', criteria);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to search identities',
        'IDENTITY_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Bulk verification status update
   */
  async bulkUpdateStatus(
    identityIds: string[],
    status: Identity['status'],
    reason?: string
  ): Promise<{
    successful: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    try {
      const response = await this.httpClient.post('/identities/bulk-update', {
        identityIds,
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to bulk update status',
        'BULK_UPDATE_FAILED',
        error
      );
    }
  }
}
