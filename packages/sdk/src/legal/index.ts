import type { CodaiConfig } from '../types';
import { HttpUtils, ErrorUtils, ValidationUtils } from '../utils';

// Legal interfaces for legai.ro integration
export interface LegalDocument {
  id: string;
  type: 'contract' | 'agreement' | 'policy' | 'terms' | 'license' | 'invoice' | 'receipt' | 'other';
  title: string;
  description?: string;
  content: string;
  templateId?: string;
  language: string;
  jurisdiction: string;
  status: 'draft' | 'review' | 'approved' | 'active' | 'expired' | 'terminated';
  parties: Array<{
    id: string;
    name: string;
    role: 'client' | 'vendor' | 'witness' | 'notary' | 'other';
    email?: string;
    address?: string;
    signature?: {
      data: string;
      timestamp: Date;
      ip?: string;
      verified: boolean;
    };
  }>;
  metadata: {
    version: number;
    effectiveDate?: Date;
    expirationDate?: Date;
    renewalTerms?: string;
    governingLaw?: string;
    disputeResolution?: string;
    amendments?: Array<{
      id: string;
      description: string;
      date: Date;
      amendedBy: string;
    }>;
  };
  tags: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: LegalDocument['type'];
  content: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'address' | 'select' | 'multiselect';
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: string;
  }>;
  language: string;
  jurisdiction: string;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalConsultation {
  id: string;
  clientId: string;
  lawyerId?: string;
  type: 'contract_review' | 'legal_advice' | 'document_drafting' | 'compliance_check' | 'dispute_resolution';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  documents: string[]; // Document IDs
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  deadline?: Date;
  requirements: string[];
  responses: Array<{
    id: string;
    lawyerId: string;
    message: string;
    attachments?: string[];
    quotedPrice?: number;
    estimatedTime?: string;
    createdAt: Date;
  }>;
  selectedResponse?: string;
  feedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  jurisdiction: string;
  applicableTo: string[]; // Business types, industries, etc.
  requirements: Array<{
    id: string;
    description: string;
    mandatory: boolean;
    deadline?: Date;
    evidence?: string[];
  }>;
  penalties: Array<{
    type: 'fine' | 'suspension' | 'revocation' | 'other';
    description: string;
    amount?: number;
    currency?: string;
  }>;
  resources: Array<{
    title: string;
    url: string;
    type: 'guide' | 'form' | 'regulation' | 'case_study';
  }>;
  lastUpdated: Date;
  effectiveDate: Date;
  isActive: boolean;
}

export interface ComplianceCheck {
  id: string;
  entityId: string;
  entityType: 'business' | 'individual' | 'organization';
  rules: string[]; // Rule IDs
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results: Array<{
    ruleId: string;
    status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
    score: number; // 0-100
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
      deadline?: Date;
    }>;
    evidence?: string[];
  }>;
  overallScore: number;
  recommendations: string[];
  nextReviewDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface Lawyer {
  id: string;
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    title?: string;
    bio: string;
    photo?: string;
    experience: number; // Years
    languages: string[];
    timeZone: string;
  };
  credentials: {
    barNumber: string;
    barState: string;
    lawSchool: string;
    graduationYear: number;
    certifications: Array<{
      name: string;
      issuer: string;
      year: number;
      expirationYear?: number;
    }>;
    verified: boolean;
  };
  specializations: string[];
  jurisdictions: string[];
  pricing: {
    hourlyRate?: number;
    fixedRates?: Array<{
      service: string;
      price: number;
    }>;
    currency: string;
    consultationFee?: number;
  };
  availability: {
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
    timeSlots: Array<{
      date: Date;
      startTime: string;
      endTime: string;
      available: boolean;
    }>;
  };
  ratings: {
    average: number;
    count: number;
    distribution: Record<string, number>;
  };
  statistics: {
    casesCompleted: number;
    responseTime: number; // Average in hours
    clientSatisfaction: number;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  clientId: string;
  lawyerId: string;
  type: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'in_trial' | 'settled' | 'closed' | 'appealed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  documents: string[];
  timeline: Array<{
    id: string;
    event: string;
    description: string;
    date: Date;
    documents?: string[];
    createdBy: string;
  }>;
  billing: {
    totalAmount: number;
    paidAmount: number;
    currency: string;
    invoices: string[];
  };
  nextHearing?: Date;
  courtInfo?: {
    name: string;
    address: string;
    judge?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Legal service for CODAI ecosystem (legai.ro integration)
export class LegalService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.legal || 'https://legai.ro/api'
    );
  }

  // Document Management
  /**
   * Create legal document
   */
  async createDocument(
    documentData: Omit<LegalDocument, 'id' | 'metadata' | 'createdAt' | 'updatedAt'>
  ): Promise<LegalDocument> {
    try {
      ValidationUtils.validateRequired(documentData, [
        'type', 'title', 'content', 'language', 'jurisdiction', 'createdBy'
      ]);

      const response = await this.httpClient.post('/documents', documentData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create document',
        'DOCUMENT_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get document
   */
  async getDocument(documentId: string): Promise<LegalDocument> {
    try {
      const response = await this.httpClient.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get document',
        'DOCUMENT_GET_FAILED',
        error
      );
    }
  }

  /**
   * Update document
   */
  async updateDocument(
    documentId: string,
    updates: Partial<LegalDocument>
  ): Promise<LegalDocument> {
    try {
      const response = await this.httpClient.patch(`/documents/${documentId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update document',
        'DOCUMENT_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * List user documents
   */
  async listDocuments(
    userId: string,
    options?: {
      type?: LegalDocument['type'];
      status?: LegalDocument['status'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    documents: LegalDocument[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.type) params.append('type', options.type);
      if (options?.status) params.append('status', options.status);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await this.httpClient.get(
        `/users/${userId}/documents?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list documents',
        'DOCUMENT_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Sign document
   */
  async signDocument(
    documentId: string,
    partyId: string,
    signatureData: string,
    metadata?: Record<string, any>
  ): Promise<LegalDocument> {
    try {
      const response = await this.httpClient.post(`/documents/${documentId}/sign`, {
        partyId,
        signatureData,
        metadata
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to sign document',
        'DOCUMENT_SIGN_FAILED',
        error
      );
    }
  }

  // Template Management
  /**
   * Get templates
   */
  async getTemplates(options?: {
    category?: string;
    type?: LegalDocument['type'];
    language?: string;
    jurisdiction?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    templates: LegalTemplate[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.type) params.append('type', options.type);
      if (options?.language) params.append('language', options.language);
      if (options?.jurisdiction) params.append('jurisdiction', options.jurisdiction);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await this.httpClient.get(`/templates?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get templates',
        'TEMPLATE_GET_FAILED',
        error
      );
    }
  }

  /**
   * Create document from template
   */
  async createFromTemplate(
    templateId: string,
    fieldValues: Record<string, any>,
    documentData: Partial<LegalDocument>
  ): Promise<LegalDocument> {
    try {
      const response = await this.httpClient.post(`/templates/${templateId}/create`, {
        fieldValues,
        documentData
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create document from template',
        'TEMPLATE_CREATE_FAILED',
        error
      );
    }
  }

  // Legal Consultation
  /**
   * Create consultation request
   */
  async createConsultation(
    consultationData: Omit<LegalConsultation, 'id' | 'responses' | 'createdAt' | 'updatedAt'>
  ): Promise<LegalConsultation> {
    try {
      ValidationUtils.validateRequired(consultationData, [
        'clientId', 'type', 'subject', 'description'
      ]);

      const response = await this.httpClient.post('/consultations', consultationData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create consultation',
        'CONSULTATION_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get consultation
   */
  async getConsultation(consultationId: string): Promise<LegalConsultation> {
    try {
      const response = await this.httpClient.get(`/consultations/${consultationId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get consultation',
        'CONSULTATION_GET_FAILED',
        error
      );
    }
  }

  /**
   * Respond to consultation (for lawyers)
   */
  async respondToConsultation(
    consultationId: string,
    response: {
      message: string;
      attachments?: string[];
      quotedPrice?: number;
      estimatedTime?: string;
    }
  ): Promise<LegalConsultation> {
    try {
      ValidationUtils.validateRequired(response, ['message']);

      const httpResponse = await this.httpClient.post(
        `/consultations/${consultationId}/respond`,
        response
      );
      return httpResponse.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to respond to consultation',
        'CONSULTATION_RESPOND_FAILED',
        error
      );
    }
  }

  // Compliance Management
  /**
   * Get compliance rules
   */
  async getComplianceRules(options?: {
    jurisdiction?: string;
    category?: string;
    applicableTo?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{
    rules: ComplianceRule[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const response = await this.httpClient.post('/compliance/rules', options || {});
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get compliance rules',
        'COMPLIANCE_RULES_FAILED',
        error
      );
    }
  }

  /**
   * Run compliance check
   */
  async runComplianceCheck(
    entityId: string,
    entityType: ComplianceCheck['entityType'],
    ruleIds: string[]
  ): Promise<ComplianceCheck> {
    try {
      ValidationUtils.validateRequired({ entityId, entityType, ruleIds }, [
        'entityId', 'entityType', 'ruleIds'
      ]);

      const response = await this.httpClient.post('/compliance/check', {
        entityId,
        entityType,
        rules: ruleIds
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to run compliance check',
        'COMPLIANCE_CHECK_FAILED',
        error
      );
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(entityId: string): Promise<{
    overallScore: number;
    status: 'compliant' | 'non_compliant' | 'partial';
    checks: ComplianceCheck[];
    criticalIssues: number;
    upcomingDeadlines: Array<{
      ruleId: string;
      requirement: string;
      deadline: Date;
    }>;
  }> {
    try {
      const response = await this.httpClient.get(`/compliance/status/${entityId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get compliance status',
        'COMPLIANCE_STATUS_FAILED',
        error
      );
    }
  }

  // Lawyer Management
  /**
   * Search lawyers
   */
  async searchLawyers(criteria: {
    specializations?: string[];
    jurisdictions?: string[];
    languages?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
    availability?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    lawyers: Lawyer[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const response = await this.httpClient.post('/lawyers/search', criteria);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to search lawyers',
        'LAWYER_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Get lawyer profile
   */
  async getLawyer(lawyerId: string): Promise<Lawyer> {
    try {
      const response = await this.httpClient.get(`/lawyers/${lawyerId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get lawyer',
        'LAWYER_GET_FAILED',
        error
      );
    }
  }

  /**
   * Book lawyer consultation
   */
  async bookConsultation(
    lawyerId: string,
    booking: {
      date: Date;
      startTime: string;
      duration: number; // minutes
      type: 'phone' | 'video' | 'in_person';
      subject: string;
      description?: string;
    }
  ): Promise<{
    id: string;
    bookingDetails: any;
    paymentRequired: boolean;
    paymentAmount?: number;
  }> {
    try {
      ValidationUtils.validateRequired(booking, [
        'date', 'startTime', 'duration', 'type', 'subject'
      ]);

      const response = await this.httpClient.post(`/lawyers/${lawyerId}/book`, booking);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to book consultation',
        'CONSULTATION_BOOK_FAILED',
        error
      );
    }
  }

  // Case Management
  /**
   * Create legal case
   */
  async createCase(
    caseData: Omit<LegalCase, 'id' | 'caseNumber' | 'timeline' | 'billing' | 'createdAt' | 'updatedAt'>
  ): Promise<LegalCase> {
    try {
      ValidationUtils.validateRequired(caseData, [
        'clientId', 'lawyerId', 'type', 'title', 'description'
      ]);

      const response = await this.httpClient.post('/cases', caseData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create case',
        'CASE_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get case
   */
  async getCase(caseId: string): Promise<LegalCase> {
    try {
      const response = await this.httpClient.get(`/cases/${caseId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get case',
        'CASE_GET_FAILED',
        error
      );
    }
  }

  /**
   * Add case timeline event
   */
  async addCaseEvent(
    caseId: string,
    event: {
      event: string;
      description: string;
      date?: Date;
      documents?: string[];
    }
  ): Promise<LegalCase> {
    try {
      ValidationUtils.validateRequired(event, ['event', 'description']);

      const response = await this.httpClient.post(`/cases/${caseId}/events`, event);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to add case event',
        'CASE_EVENT_FAILED',
        error
      );
    }
  }

  /**
   * Generate legal report
   */
  async generateReport(
    type: 'document_summary' | 'compliance_report' | 'case_summary' | 'billing_statement',
    entityId: string,
    options?: {
      timeRange?: { start: Date; end: Date };
      format?: 'pdf' | 'docx' | 'html';
      includeAttachments?: boolean;
    }
  ): Promise<Blob> {
    try {
      const response = await this.httpClient.post('/reports', {
        type,
        entityId,
        options
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to generate report',
        'REPORT_GENERATION_FAILED',
        error
      );
    }
  }
}
