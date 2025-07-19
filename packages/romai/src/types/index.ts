export interface RomanianMarketIntelligence {
  id: string;
  category: 'economic' | 'regulatory' | 'business' | 'political' | 'social' | 'technological';
  title: string;
  summary: string;
  content: string;
  sources: IntelligenceSource[];
  confidence: number; // 0-1 scale
  importance: 'low' | 'medium' | 'high' | 'critical';
  region?: RomanianRegion;
  sector?: BusinessSector;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface IntelligenceSource {
  name: string;
  url?: string;
  type: 'government' | 'media' | 'business' | 'academic' | 'industry' | 'other';
  reliability: number; // 0-1 scale
  date: Date;
}

export interface RomanianRegion {
  code: string; // RO-AB, RO-AR, etc.
  name: string;
  type: 'county' | 'development_region' | 'city' | 'commune';
  population?: number;
  economicIndicators?: RegionEconomicData;
}

export interface RegionEconomicData {
  gdpPerCapita?: number;
  unemploymentRate?: number;
  averageIncome?: number;
  mainIndustries: string[];
  businessCount?: number;
  lastUpdated: Date;
}

export interface BusinessSector {
  code: string; // NACE code
  name: string;
  nameRo: string;
  parent?: string;
  level: number;
  description?: string;
}

export interface LegalCompliance {
  id: string;
  lawId: string;
  title: string;
  titleRo: string;
  category: 'business' | 'tax' | 'labor' | 'environment' | 'gdpr' | 'other';
  description: string;
  requirements: ComplianceRequirement[];
  penalties: CompliancePenalty[];
  effectiveDate: Date;
  lastUpdated: Date;
  applicableTo: BusinessCriteria[];
  status: 'active' | 'proposed' | 'repealed' | 'amended';
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  descriptionRo: string;
  mandatory: boolean;
  deadline?: Date;
  frequency?: 'once' | 'annual' | 'quarterly' | 'monthly' | 'weekly';
  documentRequired?: string[];
  authority: string;
}

export interface CompliancePenalty {
  type: 'fine' | 'suspension' | 'warning' | 'closure';
  minAmount?: number;
  maxAmount?: number;
  currency: 'RON' | 'EUR';
  description: string;
  descriptionRo: string;
}

export interface BusinessCriteria {
  type: 'size' | 'sector' | 'region' | 'revenue' | 'employees' | 'activity';
  value: any;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in';
}

export interface LanguageAnalysis {
  text: string;
  language: 'ro' | 'en' | 'mixed' | 'other';
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
  entities: LanguageEntity[];
  topics: string[];
  readabilityScore: number; // 0-100
  formalityLevel: 'informal' | 'neutral' | 'formal' | 'official';
}

export interface LanguageEntity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'law' | 'regulation' | 'currency' | 'date' | 'other';
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata?: Record<string, any>;
}

export interface CulturalContext {
  topic: string;
  region?: RomanianRegion;
  context: string;
  culturalFactors: CulturalFactor[];
  businessImplications: string[];
  recommendations: string[];
  sources: IntelligenceSource[];
  lastUpdated: Date;
}

export interface CulturalFactor {
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'social' | 'religious' | 'economic' | 'political' | 'historical';
}

export interface TranslationRequest {
  id: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: 'business' | 'legal' | 'technical' | 'marketing' | 'general';
  formalityLevel?: 'informal' | 'neutral' | 'formal' | 'official';
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: TranslationResult;
  createdAt: Date;
  completedAt?: Date;
}

export interface TranslationResult {
  translatedText: string;
  confidence: number;
  alternatives?: string[];
  culturalNotes?: string[];
  businessContext?: string[];
  warnings?: string[];
}

export interface RegulatoryUpdate {
  id: string;
  title: string;
  titleRo: string;
  category: LegalCompliance['category'];
  summary: string;
  summaryRo: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effectiveDate: Date;
  publishedDate: Date;
  authority: string;
  officialUrl?: string;
  affectedSectors: BusinessSector[];
  affectedRegions: RomanianRegion[];
  changes: RegulatoryChange[];
  businessImpact: string;
  complianceActions: string[];
}

export interface RegulatoryChange {
  type: 'new' | 'amendment' | 'repeal' | 'clarification';
  section: string;
  oldText?: string;
  newText?: string;
  description: string;
  descriptionRo: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  category: 'market_size' | 'trends' | 'competition' | 'opportunities' | 'risks';
  sector: BusinessSector;
  region?: RomanianRegion;
  timeframe: 'current' | 'short_term' | 'medium_term' | 'long_term';
  data: MarketData[];
  analysis: string;
  conclusions: string[];
  recommendations: string[];
  confidence: number;
  sources: IntelligenceSource[];
  createdAt: Date;
  validUntil: Date;
}

export interface MarketData {
  metric: string;
  value: number;
  unit: string;
  period: string;
  change?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  forecast?: {
    value: number;
    timeframe: string;
    confidence: number;
  };
}

export interface RomaiSearchOptions {
  query?: string;
  categories?: string[];
  regions?: string[];
  sectors?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  importance?: ('low' | 'medium' | 'high' | 'critical')[];
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'importance';
  sortOrder?: 'asc' | 'desc';
}

export interface RomaiAnalyticsReport {
  period: {
    from: Date;
    to: Date;
  };
  totalIntelligence: number;
  byCategory: Array<{ category: string; count: number }>;
  byImportance: Array<{ importance: string; count: number }>;
  byRegion: Array<{ region: string; count: number }>;
  bySector: Array<{ sector: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  trendsAnalysis: TrendAnalysis[];
  generatedAt: Date;
}

export interface TrendAnalysis {
  topic: string;
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number; // 0-1 scale
  duration: string; // e.g., "3 months", "1 year"
  description: string;
}

export interface LocalizationService {
  translateContent(
    content: string, 
    targetLanguage: 'ro' | 'en', 
    options?: {
      context?: string;
      formality?: string;
      preserveFormatting?: boolean;
    }
  ): Promise<TranslationResult>;
  
  analyzeLanguage(text: string): Promise<LanguageAnalysis>;
  getCulturalContext(topic: string, region?: string): Promise<CulturalContext>;
  validateBusinessName(name: string): Promise<{
    isValid: boolean;
    suggestions: string[];
    culturalConsiderations: string[];
  }>;
}
