import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RomaiService } from '../../src/services/RomaiService';
import type { 
  RomaiConfig, 
  MarketIntelligenceRequest,
  MarketIntelligenceResponse,
  LegalComplianceRequest,
  LegalComplianceResponse,
  TranslationRequest,
  TranslationResponse,
  RomanianBusinessContext,
  RegulatoryUpdate,
  MarketAnalysis
} from '../../src/types';

// Mock Azure OpenAI and external services
vi.mock('@azure/openai', () => ({
  OpenAIApi: vi.fn().mockImplementation(() => ({
    createChatCompletion: vi.fn(),
    createEmbedding: vi.fn()
  }))
}));

describe('RomaiService - Advanced Romanian Intelligence Service', () => {
  let romaiService: RomaiService;
  let mockOpenAI: any;

  const testConfig: Partial<RomaiConfig> = {
    azure: {
      endpoint: 'https://test-azure.openai.azure.com',
      apiKey: 'test-api-key',
      deploymentName: 'gpt-4-romai'
    },
    romanian: {
      enableMarketIntelligence: true,
      enableLegalCompliance: true,
      enableCulturalContext: true
    },
    cache: {
      enabled: true,
      ttl: 3600
    }
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    romaiService = await RomaiService.create(testConfig);
    mockOpenAI = romaiService.openai;
  });

  afterEach(async () => {
    await romaiService?.shutdown();
  });

  describe('Romanian Market Intelligence', () => {
    const marketRequest: MarketIntelligenceRequest = {
      industry: 'fintech',
      region: 'bucharest',
      analysisType: 'competitive-landscape',
      timeframe: '2024-q1'
    };

    it('should analyze Romanian fintech market landscape', async () => {
      const mockResponse: MarketIntelligenceResponse = {
        marketSize: {
          value: 2.8,
          unit: 'billion_eur',
          growthRate: 15.3
        },
        keyPlayers: [
          { name: 'eMAG', marketShare: 25, category: 'e-commerce' },
          { name: 'Zitec', marketShare: 12, category: 'software-development' },
          { name: 'UiPath', marketShare: 8, category: 'rpa-automation' }
        ],
        opportunities: [
          'Digital banking expansion in rural areas',
          'AI-powered customer service for SMEs',
          'Blockchain for supply chain transparency'
        ],
        threats: [
          'EU regulatory changes (PSD2, GDPR)',
          'Competition from Western European players',
          'Economic uncertainty affecting investment'
        ],
        culturalFactors: [
          'High cash usage in rural areas requires gradual digital adoption',
          'Strong preference for face-to-face banking relationships',
          'Growing tech-savvy millennial population in urban centers'
        ]
      };

      mockOpenAI.createChatCompletion.mockResolvedValue({
        data: {
          choices: [{ message: { content: JSON.stringify(mockResponse) } }]
        }
      });

      const result = await romaiService.getMarketIntelligence(marketRequest);

      expect(result.marketSize.value).toBe(2.8);
      expect(result.keyPlayers).toHaveLength(3);
      expect(result.opportunities).toContain('Digital banking expansion in rural areas');
      expect(result.culturalFactors).toContain('High cash usage in rural areas requires gradual digital adoption');
    });

    it('should provide regional market insights for Cluj-Napoca tech hub', async () => {
      const clujRequest = {
        ...marketRequest,
        region: 'cluj-napoca',
        analysisType: 'tech-hub-analysis'
      };

      const mockClujResponse = {
        techEcosystem: {
          companies: 150,
          employees: 12000,
          averageSalary: 4500,
          currency: 'EUR'
        },
        strengths: [
          'Strong technical university presence',
          'Lower costs compared to Bucharest',
          'Growing international company presence'
        ],
        infrastructure: {
          fiberInternet: 95,
          coworkingSpaces: 25,
          techEvents: 40
        }
      };

      mockOpenAI.createChatCompletion.mockResolvedValue({
        data: {
          choices: [{ message: { content: JSON.stringify(mockClujResponse) } }]
        }
      });

      const result = await romaiService.getMarketIntelligence(clujRequest);

      expect(result.techEcosystem.companies).toBe(150);
      expect(result.strengths).toContain('Strong technical university presence');
    });

    it('should track Romanian startup ecosystem trends', async () => {
      const startupRequest = {
        ...marketRequest,
        analysisType: 'startup-ecosystem',
        sectors: ['fintech', 'healthtech', 'proptech']
      };

      const result = await romaiService.getStartupEcosystemAnalysis(startupRequest);

      expect(result.totalStartups).toBeGreaterThan(0);
      expect(result.fundingRounds).toBeDefined();
      expect(result.topInvestors).toContain('Early Game Ventures');
    });

    it('should analyze Romanian consumer behavior patterns', async () => {
      const consumerRequest = {
        demographic: 'millennials',
        region: 'bucharest',
        category: 'financial-services'
      };

      const result = await romaiService.getConsumerBehaviorAnalysis(consumerRequest);

      expect(result.digitalAdoption).toBeGreaterThan(70);
      expect(result.preferredChannels).toContain('mobile-app');
      expect(result.culturalPreferences).toContain('privacy-conscious');
    });
  });

  describe('Romanian Legal and Regulatory Compliance', () => {
    const complianceRequest: LegalComplianceRequest = {
      businessType: 'fintech',
      services: ['payment-processing', 'lending', 'digital-wallet'],
      targetMarket: 'romania',
      complianceFrameworks: ['gdpr', 'psd2', 'romanian-banking-law']
    };

    it('should provide GDPR compliance guidance for Romanian businesses', async () => {
      const mockGDPRResponse: LegalComplianceResponse = {
        requirements: [
          {
            framework: 'GDPR',
            requirement: 'Data Protection Officer appointment',
            mandatory: true,
            deadline: '2024-05-25',
            penalty: 'Up to 4% of annual turnover',
            romanianSpecifics: 'Must be registered with ANSPDCP (Romanian DPA)'
          },
          {
            framework: 'GDPR',
            requirement: 'Privacy Impact Assessment',
            mandatory: true,
            applicability: 'High-risk processing activities',
            romanianSpecifics: 'Template available from ANSPDCP website'
          }
        ],
        actionItems: [
          'Register DPO with ANSPDCP within 30 days',
          'Implement Romanian language privacy notices',
          'Establish data subject rights procedures'
        ],
        riskAssessment: {
          overall: 'medium',
          factors: [
            'Cross-border data transfers to EU/US',
            'Automated decision-making processes',
            'Large-scale personal data processing'
          ]
        }
      };

      mockOpenAI.createChatCompletion.mockResolvedValue({
        data: {
          choices: [{ message: { content: JSON.stringify(mockGDPRResponse) } }]
        }
      });

      const result = await romaiService.getLegalComplianceGuidance(complianceRequest);

      expect(result.requirements).toHaveLength(2);
      expect(result.requirements[0].romanianSpecifics).toContain('ANSPDCP');
      expect(result.actionItems).toContain('Register DPO with ANSPDCP within 30 days');
    });

    it('should analyze Romanian banking regulations for fintech', async () => {
      const bankingRequest = {
        ...complianceRequest,
        specific: 'romanian-banking-law',
        operations: ['credit-scoring', 'loan-origination', 'payment-processing']
      };

      const result = await romaiService.getRomanianBankingCompliance(bankingRequest);

      expect(result.nbr_requirements).toBeDefined();
      expect(result.licensing_requirements).toContain('NBR approval');
      expect(result.capital_requirements).toBeGreaterThan(0);
    });

    it('should track regulatory updates from Romanian authorities', async () => {
      const updates = await romaiService.getRegulatoryUpdates({
        authorities: ['NBR', 'ANSPDCP', 'ASF'],
        timeframe: 'last-30-days',
        relevantTo: ['fintech', 'data-protection']
      });

      expect(updates).toBeInstanceOf(Array);
      updates.forEach(update => {
        expect(update.authority).toMatch(/NBR|ANSPDCP|ASF/);
        expect(update.date).toBeInstanceOf(Date);
        expect(update.impact).toMatch(/low|medium|high/);
      });
    });

    it('should provide tax compliance guidance for Romanian tech companies', async () => {
      const taxRequest = {
        companyType: 'micro-enterprise',
        revenue: 50000,
        employees: 5,
        activities: ['software-development', 'digital-services']
      };

      const result = await romaiService.getTaxComplianceGuidance(taxRequest);

      expect(result.applicableTaxes).toContain('1% micro-enterprise tax');
      expect(result.vatThreshold).toBe(300000);
      expect(result.digitalServicesTax).toBeDefined();
    });
  });

  describe('Romanian Language and Cultural Context', () => {
    const translationRequest: TranslationRequest = {
      text: 'Privacy Policy and Terms of Service',
      sourceLanguage: 'en',
      targetLanguage: 'ro',
      domain: 'legal-fintech',
      formalityLevel: 'formal'
    };

    it('should provide culturally appropriate Romanian translations', async () => {
      const mockTranslation: TranslationResponse = {
        translatedText: 'Politica de Confidențialitate și Termeni și Condiții',
        confidence: 0.95,
        culturalNotes: [
          'Use formal address forms (dumneavoastră) for legal documents',
          'Romanian consumers expect detailed explanations of data usage',
          'Include references to Romanian legal framework (GDPR implementation)'
        ],
        legalConsiderations: [
          'Must comply with Romanian Consumer Protection Law',
          'Required disclaimers for financial services',
          'Mandatory cooling-off period disclosures'
        ],
        alternatives: [
          {
            text: 'Politica privind Protecția Datelor și Termenii de Utilizare',
            note: 'More explicit about data protection, preferred for fintech'
          }
        ]
      };

      mockOpenAI.createChatCompletion.mockResolvedValue({
        data: {
          choices: [{ message: { content: JSON.stringify(mockTranslation) } }]
        }
      });

      const result = await romaiService.translateWithContext(translationRequest);

      expect(result.translatedText).toBe('Politica de Confidențialitate și Termeni și Condiții');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.culturalNotes).toContain('Use formal address forms (dumneavoastră) for legal documents');
    });

    it('should provide Romanian business etiquette guidance', async () => {
      const etiquetteRequest = {
        context: 'fintech-b2b-sales',
        audience: 'romanian-enterprise-clients',
        situation: 'initial-meeting'
      };

      const result = await romaiService.getBusinessEtiquetteGuidance(etiquetteRequest);

      expect(result.greetingProtocol).toContain('formal handshake');
      expect(result.communicationStyle).toContain('relationship-building');
      expect(result.culturalSensitivities).toContain('respect for hierarchy');
    });

    it('should analyze Romanian consumer trust factors for fintech', async () => {
      const trustRequest = {
        industry: 'fintech',
        targetDemographic: 'romanian-adults-25-45',
        context: 'digital-banking-adoption'
      };

      const result = await romaiService.getTrustFactorAnalysis(trustRequest);

      expect(result.trustDrivers).toContain('Romanian bank partnerships');
      expect(result.trustBarriers).toContain('data security concerns');
      expect(result.recommendedApproach).toContain('transparent communication');
    });

    it('should provide localized UX recommendations for Romanian users', async () => {
      const uxRequest = {
        productType: 'mobile-banking-app',
        targetUsers: 'romanian-millennials',
        platforms: ['ios', 'android']
      };

      const result = await romaiService.getLocalizedUXRecommendations(uxRequest);

      expect(result.languagePreferences.primary).toBe('romanian');
      expect(result.designPreferences).toContain('clean and minimalist');
      expect(result.functionalRequirements).toContain('SMS authentication');
    });
  });

  describe('Market Research and Analytics', () => {
    it('should generate comprehensive Romanian market entry strategy', async () => {
      const entryRequest = {
        company: 'international-fintech',
        targetMarket: 'romania',
        products: ['digital-payments', 'personal-finance-management'],
        timeline: '12-months'
      };

      const result = await romaiService.generateMarketEntryStrategy(entryRequest);

      expect(result.phases).toHaveLength(4);
      expect(result.recommendedPartnerships).toContain('Romanian banks');
      expect(result.regulatoryTimeline).toBeDefined();
      expect(result.budgetEstimate).toBeGreaterThan(0);
    });

    it('should analyze competitive landscape for Romanian fintech', async () => {
      const competitorRequest = {
        sector: 'digital-lending',
        includeInternational: true,
        analysisDepth: 'comprehensive'
      };

      const result = await romaiService.getCompetitorAnalysis(competitorRequest);

      expect(result.localCompetitors).toBeDefined();
      expect(result.internationalThreats).toBeDefined();
      expect(result.marketGaps).toBeInstanceOf(Array);
    });

    it('should provide Romanian investor landscape analysis', async () => {
      const investorRequest = {
        sector: 'fintech',
        stage: 'series-a',
        ticketSize: '2-5-million-eur'
      };

      const result = await romaiService.getInvestorLandscapeAnalysis(investorRequest);

      expect(result.activeInvestors).toContain('Early Game Ventures');
      expect(result.averageTicketSize).toBeGreaterThan(0);
      expect(result.investmentCriteria).toBeDefined();
    });
  });

  describe('Caching and Performance', () => {
    it('should cache market intelligence responses', async () => {
      const cacheKey = 'market-intelligence:fintech:bucharest:2024-q1';
      
      // First call should hit API
      await romaiService.getMarketIntelligence(marketRequest);
      expect(mockOpenAI.createChatCompletion).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      await romaiService.getMarketIntelligence(marketRequest);
      expect(mockOpenAI.createChatCompletion).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should invalidate cache for regulatory updates', async () => {
      const regulatoryCache = await romaiService.getCachedRegulatoryUpdates();
      
      // Simulate new regulation
      await romaiService.invalidateRegulatoryCache();
      
      const freshUpdates = await romaiService.getRegulatoryUpdates({
        authorities: ['NBR'],
        timeframe: 'last-7-days'
      });
      
      expect(freshUpdates).not.toEqual(regulatoryCache);
    });

    it('should handle high-volume translation requests efficiently', async () => {
      const translations = Array.from({ length: 100 }, (_, i) => ({
        text: `Legal term ${i}`,
        sourceLanguage: 'en',
        targetLanguage: 'ro',
        domain: 'legal'
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        translations.map(req => romaiService.translateWithContext(req))
      );
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle Azure OpenAI service failures gracefully', async () => {
      mockOpenAI.createChatCompletion.mockRejectedValue(new Error('Azure service unavailable'));

      const fallbackResponse = await romaiService.getMarketIntelligence(marketRequest);

      expect(fallbackResponse.source).toBe('cached-data');
      expect(fallbackResponse.disclaimer).toContain('limited availability');
    });

    it('should validate Romanian-specific business context', async () => {
      const invalidRequest = {
        ...marketRequest,
        region: 'invalid-region',
        industry: 'non-existent-industry'
      };

      await expect(
        romaiService.getMarketIntelligence(invalidRequest)
      ).rejects.toThrow('Invalid Romanian region or industry specified');
    });

    it('should handle rate limiting from regulatory APIs', async () => {
      // Mock rate limit error
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';

      const retryableSpy = vi.fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue([{ authority: 'NBR', update: 'Test update' }]);

      romaiService.fetchRegulatoryData = retryableSpy;

      const result = await romaiService.getRegulatoryUpdates({
        authorities: ['NBR'],
        timeframe: 'last-30-days'
      });

      expect(retryableSpy).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(1);
    });
  });

  describe('Integration and Data Sources', () => {
    it('should integrate with Romanian National Bank (NBR) APIs', async () => {
      const nbrIntegration = await romaiService.connectToNBRData();
      
      expect(nbrIntegration.status).toBe('connected');
      expect(nbrIntegration.lastSync).toBeInstanceOf(Date);
    });

    it('should sync with Romanian business registry data', async () => {
      const registrySync = await romaiService.syncBusinessRegistryData();
      
      expect(registrySync.companiesUpdated).toBeGreaterThan(0);
      expect(registrySync.lastUpdate).toBeInstanceOf(Date);
    });

    it('should monitor Romanian tech news and trends', async () => {
      const newsAnalysis = await romaiService.getTechNewsAnalysis({
        sources: ['startupcafe.ro', 'zf.ro', 'financialintelligence.ro'],
        timeframe: 'last-7-days',
        topics: ['fintech', 'ai', 'blockchain']
      });

      expect(newsAnalysis.articles).toBeGreaterThan(0);
      expect(newsAnalysis.sentiment).toMatch(/positive|neutral|negative/);
      expect(newsAnalysis.trends).toBeInstanceOf(Array);
    });
  });
});
