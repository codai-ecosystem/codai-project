/**
 * RomAI Client for CODAI SDK
 * Manages Romanian AI services, market intelligence, and localization
 */

import type {
  CODAIConfig,
  ApiResponse,
  ServiceHealth,
  PaginationParams,
  PaginatedResponse
} from '../types/common';
import type {
  RomAIQuery,
  RomAIResponse,
  RomAIAnalytics
} from '../types/services';
import { BaseClient } from './BaseClient';

export class RomAIClient extends BaseClient {
  constructor(config: CODAIConfig) {
    super(config.endpoints.romai, config);
  }

  /**
   * Get RomAI service health status
   */
  async health(): Promise<ApiResponse<ServiceHealth>> {
    return this.request<ServiceHealth>({
      method: 'GET',
      url: '/health'
    });
  }

  /**
   * Get RomAI status
   */
  async getStatus(): Promise<ApiResponse<{
    status: 'active' | 'maintenance' | 'degraded';
    services: {
      ai: boolean;
      translation: boolean;
      market: boolean;
      regulatory: boolean;
    };
    models: {
      romanian: string;
      english: string;
      translation: string;
    };
    regions: string[];
    uptime: number;
  }>> {
    return this.request({
      method: 'GET',
      url: '/status'
    });
  }

  // AI Intelligence Services

  /**
   * Ask RomAI a question
   */
  async ask(query: RomAIQuery): Promise<ApiResponse<RomAIResponse>> {
    return this.request<RomAIResponse>({
      method: 'POST',
      url: '/ai/ask',
      data: query
    });
  }

  /**
   * Get AI test response
   */
  async testAI(): Promise<ApiResponse<{
    message: string;
    capabilities: string[];
    models: string[];
    languages: string[];
    regions: string[];
  }>> {
    return this.request({
      method: 'GET',
      url: '/ai/test'
    });
  }

  /**
   * Analyze Romanian text
   */
  async analyzeText(text: string, options?: {
    includeSentiment?: boolean;
    includeEntities?: boolean;
    includeTopics?: boolean;
    includeCulturalContext?: boolean;
  }): Promise<ApiResponse<{
    text: string;
    language: 'ro' | 'en';
    sentiment?: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
    entities?: Array<{
      text: string;
      type: string;
      confidence: number;
      start: number;
      end: number;
    }>;
    topics?: Array<{
      topic: string;
      confidence: number;
    }>;
    culturalContext?: {
      region: string;
      context: string;
      relevance: number;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/ai/analyze',
      data: { text, options }
    });
  }

  // Translation Services

  /**
   * Translate text
   */
  async translate(
    text: string,
    targetLanguage: 'ro' | 'en',
    options?: {
      sourceLanguage?: 'ro' | 'en' | 'auto';
      formality?: 'formal' | 'informal';
      domain?: 'general' | 'business' | 'legal' | 'technical' | 'medical';
      preserveFormatting?: boolean;
    }
  ): Promise<ApiResponse<{
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
    alternatives?: string[];
    metadata: {
      formality: string;
      domain: string;
      processingTime: number;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/translation/translate',
      data: { text, targetLanguage, options }
    });
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    texts: string[],
    targetLanguage: 'ro' | 'en',
    options?: {
      sourceLanguage?: 'ro' | 'en' | 'auto';
      formality?: 'formal' | 'informal';
      domain?: 'general' | 'business' | 'legal' | 'technical' | 'medical';
    }
  ): Promise<ApiResponse<{
    translations: Array<{
      original: string;
      translated: string;
      confidence: number;
    }>;
    totalProcessingTime: number;
    averageConfidence: number;
  }>> {
    return this.request({
      method: 'POST',
      url: '/translation/batch',
      data: { texts, targetLanguage, options }
    });
  }

  /**
   * Detect language
   */
  async detectLanguage(text: string): Promise<ApiResponse<{
    detectedLanguage: string;
    confidence: number;
    alternatives: Array<{
      language: string;
      confidence: number;
    }>;
  }>> {
    return this.request({
      method: 'POST',
      url: '/translation/detect',
      data: { text }
    });
  }

  // Market Intelligence

  /**
   * Get Romanian market insights
   */
  async getMarketInsights(options?: {
    industry?: string;
    region?: string;
    timeframe?: '1m' | '3m' | '6m' | '1y';
    type?: 'trends' | 'opportunities' | 'risks' | 'all';
  }): Promise<ApiResponse<{
    insights: Array<{
      type: 'trend' | 'opportunity' | 'risk' | 'analysis';
      title: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      confidence: number;
      region: string;
      industry?: string;
      timeframe: string;
      sources: string[];
      created: string;
    }>;
    summary: {
      totalInsights: number;
      byType: Record<string, number>;
      topRegions: string[];
      confidence: number;
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/market/insights',
      params: options
    });
  }

  /**
   * Get regulatory information
   */
  async getRegulatoryInfo(query: {
    domain: string;
    type?: 'law' | 'regulation' | 'compliance' | 'requirement';
    region?: string;
  }): Promise<ApiResponse<{
    regulations: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      domain: string;
      region: string;
      status: 'active' | 'proposed' | 'repealed';
      lastUpdated: string;
      source: string;
      requirements: string[];
      penalties?: string[];
    }>;
    compliance: {
      required: string[];
      recommended: string[];
      deadlines: Array<{
        requirement: string;
        deadline: string;
        priority: 'low' | 'medium' | 'high';
      }>;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/regulatory/info',
      data: query
    });
  }

  /**
   * Get business recommendations
   */
  async getBusinessRecommendations(context: {
    businessType: string;
    industry: string;
    size: 'startup' | 'sme' | 'enterprise';
    region: string;
    goals?: string[];
  }): Promise<ApiResponse<{
    recommendations: Array<{
      category: 'strategy' | 'operations' | 'marketing' | 'finance' | 'legal';
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      timeline: string;
      resources: string[];
      risks: string[];
    }>;
    culturalInsights: Array<{
      aspect: string;
      description: string;
      recommendation: string;
      importance: number;
    }>;
  }>> {
    return this.request({
      method: 'POST',
      url: '/business/recommendations',
      data: context
    });
  }

  // Regional Data

  /**
   * Get Romanian regional data
   */
  async getRegionalData(options?: {
    region?: string;
    type?: 'demographic' | 'economic' | 'cultural' | 'business';
    metrics?: string[];
  }): Promise<ApiResponse<{
    regions: Array<{
      name: string;
      code: string;
      population: number;
      area: number;
      gdp?: number;
      unemployment?: number;
      majorCities: string[];
      industries: string[];
      languages: string[];
      culturalNotes: string[];
      businessClimate: {
        score: number;
        factors: Record<string, number>;
        opportunities: string[];
        challenges: string[];
      };
    }>;
    summary: {
      totalRegions: number;
      totalPopulation: number;
      majorIndustries: string[];
      businessOpportunities: string[];
    };
  }>> {
    return this.request({
      method: 'GET',
      url: '/regional/data',
      params: options
    });
  }

  /**
   * Get cultural insights
   */
  async getCulturalInsights(topic: string, region?: string): Promise<ApiResponse<{
    insights: Array<{
      aspect: string;
      description: string;
      importance: 'low' | 'medium' | 'high';
      businessRelevance: string;
      examples: string[];
      doAndDonts: {
        dos: string[];
        donts: string[];
      };
    }>;
    context: {
      topic: string;
      region: string;
      relevantFestivals: string[];
      businessEtiquette: string[];
      communicationStyle: string;
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/cultural/insights',
      data: { topic, region }
    });
  }

  // Analytics and Reporting

  /**
   * Get RomAI analytics
   */
  async getAnalytics(): Promise<ApiResponse<RomAIAnalytics>> {
    return this.request<RomAIAnalytics>({
      method: 'GET',
      url: '/analytics'
    });
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(period?: '24h' | '7d' | '30d' | '90d'): Promise<ApiResponse<{
    period: string;
    queries: {
      total: number;
      byLanguage: { ro: number; en: number };
      byType: Record<string, number>;
      byRegion: Record<string, number>;
    };
    translations: {
      total: number;
      byDirection: { roToEn: number; enToRo: number };
      averageLength: number;
      averageConfidence: number;
    };
    market: {
      insights: number;
      regions: number;
      industries: number;
    };
    performance: {
      averageResponseTime: number;
      successRate: number;
      errorRate: number;
    };
    topQueries: Array<{
      query: string;
      count: number;
      language: string;
    }>;
  }>> {
    return this.request({
      method: 'GET',
      url: '/analytics/usage',
      params: { period }
    });
  }

  /**
   * Generate custom report
   */
  async generateReport(config: {
    type: 'market' | 'regulatory' | 'cultural' | 'business' | 'comprehensive';
    regions?: string[];
    industries?: string[];
    languages?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    format: 'json' | 'pdf' | 'docx' | 'xlsx';
    includeCharts?: boolean;
    includeRecommendations?: boolean;
  }): Promise<ApiResponse<{
    reportId: string;
    status: 'generating' | 'ready' | 'failed';
    downloadUrl?: string;
    estimatedCompletion?: string;
    pages?: number;
    format: string;
  }>> {
    return this.request({
      method: 'POST',
      url: '/reports/generate',
      data: config
    });
  }

  /**
   * Get report status
   */
  async getReportStatus(reportId: string): Promise<ApiResponse<{
    id: string;
    status: 'generating' | 'ready' | 'failed';
    progress: number;
    downloadUrl?: string;
    created: string;
    completed?: string;
    error?: string;
  }>> {
    return this.request({
      method: 'GET',
      url: `/reports/${reportId}/status`
    });
  }

  // Localization Services

  /**
   * Validate Romanian text
   */
  async validateRomanianText(text: string): Promise<ApiResponse<{
    isValid: boolean;
    errors: Array<{
      type: 'spelling' | 'grammar' | 'diacritics' | 'style';
      message: string;
      position: { start: number; end: number };
      suggestions: string[];
    }>;
    statistics: {
      characters: number;
      words: number;
      sentences: number;
      readabilityScore: number;
    };
    suggestions: {
      formalityLevel: 'formal' | 'informal';
      improvements: string[];
    };
  }>> {
    return this.request({
      method: 'POST',
      url: '/localization/validate',
      data: { text }
    });
  }

  /**
   * Convert to Romanian formatting
   */
  async formatForRomania(data: {
    dates?: string[];
    numbers?: number[];
    currencies?: Array<{ amount: number; currency: string }>;
    addresses?: Array<{
      street: string;
      city: string;
      county: string;
      postalCode: string;
    }>;
    phones?: string[];
  }): Promise<ApiResponse<{
    dates: string[];
    numbers: string[];
    currencies: string[];
    addresses: Array<{
      formatted: string;
      components: Record<string, string>;
    }>;
    phones: Array<{
      formatted: string;
      international: string;
      valid: boolean;
    }>;
  }>> {
    return this.request({
      method: 'POST',
      url: '/localization/format',
      data
    });
  }
}
