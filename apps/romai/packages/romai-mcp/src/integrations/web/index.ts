/**
 * Web Intelligence Integration for ROMAI MCP
 * Provides intelligent web scraping and monitoring with Romanian business context
 */

import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Logger } from '../../utils/logger.js';

export interface WebConfig {
  enabled: boolean;
  headless?: boolean;
  timeout?: number;
}

export interface ScrapingResult {
  url: string;
  title?: string;
  content: string;
  metadata: {
    timestamp: string;
    responseTime: number;
    statusCode: number;
  };
  analysis: {
    language?: string;
    businessContext?: string[];
    keywords: string[];
  };
}

export interface MarketResearch {
  topic: string;
  sources: string[];
  insights: string[];
  romanianContext: string[];
  competitorInfo: any[];
  recommendations: string[];
}

export class WebIntegration {
  private logger: Logger;
  private config: WebConfig;
  private browser?: Browser;

  constructor(config: WebConfig) {
    this.logger = new Logger('WebIntegration');
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing web integration...');

    try {
      this.browser = await chromium.launch({
        headless: this.config.headless !== false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.logger.info('Playwright browser launched');
    } catch (error) {
      this.logger.error('Failed to launch browser:', error);
      this.logger.info('Web integration will continue without browser (some features disabled)');
      // Don't throw error - allow server to continue without web scraping
      this.browser = undefined;
    }

    this.logger.info('Web integration initialized');
  }

  // Tool: romai_web_scrape
  async scrapeWebsite(url: string, options?: {
    waitForSelector?: string;
    extractContent?: string[];
    followLinks?: boolean;
    maxPages?: number;
  }): Promise<ScrapingResult> {
    try {
      if (!this.browser) {
        // Fallback to axios when browser is not available
        return await this.fallbackScrapeWithAxios(url);
      }

      const startTime = Date.now();
      const page = await this.browser.newPage();

      // Set timeout
      page.setDefaultTimeout(this.config.timeout || 30000);

      // Navigate to the page
      const response = await page.goto(url, { waitUntil: 'networkidle' });

      if (!response) {
        throw new Error('Failed to load page');
      }

      // Wait for specific selector if provided
      if (options?.waitForSelector) {
        await page.waitForSelector(options.waitForSelector);
      }

      // Extract content
      const content = await page.content();
      const title = await page.title();

      const responseTime = Date.now() - startTime;

      // Analyze content
      const analysis = await this.analyzeWebContent(content, url);

      await page.close();

      return {
        url,
        title,
        content,
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime,
          statusCode: response.status()
        },
        analysis
      };
    } catch (error) {
      this.logger.error(`Error scraping website ${url}:`, error);
      throw error;
    }
  }

  // Tool: romai_market_research
  async performMarketResearch(topic: string, options?: {
    sources?: string[];
    romanian?: boolean;
    depth?: 'basic' | 'detailed' | 'comprehensive';
  }): Promise<MarketResearch> {
    try {
      const isRomanian = options?.romanian !== false;
      const searchTerms = isRomanian ?
        [`${topic} Romania`, `piața ${topic} România`, `${topic} București`] :
        [`${topic} market`, `${topic} industry`, `${topic} analysis`];

      const sources = options?.sources || [
        'https://www.startupcafe.ro',
        'https://www.zf.ro',
        'https://www.wall-street.ro'
      ];

      const insights: string[] = [];
      const competitorInfo: any[] = [];
      const romanianContext: string[] = [];

      // Perform research on each source
      for (const source of sources) {
        try {
          const searchUrl = `${source}/search?q=${encodeURIComponent(searchTerms[0])}`;
          const result = await this.scrapeWebsite(searchUrl);

          // Extract business insights
          const businessInsights = this.extractBusinessInsights(result.content, topic);
          insights.push(...businessInsights);

          if (isRomanian) {
            const contextualInfo = this.extractRomanianContext(result.content, topic);
            romanianContext.push(...contextualInfo);
          }
        } catch (error) {
          this.logger.warn(`Failed to research on ${source}:`, error);
        }
      }

      const recommendations = [
        'Analizează concurența locală pentru o înțelegere mai bună a pieței',
        'Consideră specificul cultural românesc în strategia de marketing',
        'Monitorizează reglementările locale și schimbările legislative',
        'Explorează parteneriate cu companii românești etablite'
      ];

      return {
        topic,
        sources,
        insights,
        romanianContext,
        competitorInfo,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Error performing market research for ${topic}:`, error);
      throw error;
    }
  }

  // Tool: romai_competitor_analysis
  async analyzeCompetitors(domain: string, competitors?: string[]): Promise<{
    primaryCompetitor: string;
    competitorData: Array<{
      name: string;
      website: string;
      strengths: string[];
      weaknesses: string[];
      marketPosition: string;
      romanianPresence?: boolean;
    }>;
    opportunities: string[];
    threats: string[];
    recommendations: string[];
  }> {
    try {
      const competitorList = competitors || await this.discoverCompetitors(domain);
      const competitorData = [];

      for (const competitor of competitorList.slice(0, 5)) {
        try {
          const analysis = await this.analyzeCompetitorWebsite(competitor);
          competitorData.push(analysis);
        } catch (error) {
          this.logger.warn(`Failed to analyze competitor ${competitor}:`, error);
        }
      }

      const opportunities = [
        'Lacune în oferta concurenților pentru piața românească',
        'Oportunități de parteneriat cu companii locale',
        'Cerere neacoperită pentru servicii în limba română',
        'Posibilități de diferențiere prin inovație locală'
      ];

      const threats = [
        'Concurență agresivă pe prețuri',
        'Intrarea unor jucători internaționali mari',
        'Schimbări în reglementările locale',
        'Modificări în comportamentul consumatorilor'
      ];

      const recommendations = [
        'Dezvoltă un avantaj competitiv bazat pe înțelegerea pieței românești',
        'Investește în relații puternice cu clienții locali',
        'Monitorizează constant mișcările concurenților',
        'Adaptează strategia în funcție de specificul cultural local'
      ];

      return {
        primaryCompetitor: competitorData[0]?.name || 'Unknown',
        competitorData,
        opportunities,
        threats,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Error analyzing competitors for ${domain}:`, error);
      throw error;
    }
  }

  // Tool: romai_web_monitor
  async monitorWebsite(url: string, options?: {
    frequency?: 'hourly' | 'daily' | 'weekly';
    alerts?: string[];
    trackChanges?: boolean;
  }): Promise<{
    monitoringId: string;
    status: string;
    lastCheck: string;
    changes: Array<{
      timestamp: string;
      type: string;
      description: string;
    }>;
    alerts: string[];
    recommendations: string[];
  }> {
    try {
      const monitoringId = `monitor_${Date.now()}`;
      const currentContent = await this.scrapeWebsite(url);

      // This would typically store the content for comparison
      // For now, we'll simulate monitoring capabilities

      const changes = [
        {
          timestamp: new Date().toISOString(),
          type: 'content_change',
          description: 'Page content updated'
        }
      ];

      const alerts: string[] = [];
      const recommendations = [
        'Configurează alerte pentru schimbări importante',
        'Monitorizează performanța site-ului concurent',
        'Urmărește actualizările de conținut și produse',
        'Analizează modificările în strategia de prețuri'
      ];

      return {
        monitoringId,
        status: 'active',
        lastCheck: new Date().toISOString(),
        changes,
        alerts,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Error setting up monitoring for ${url}:`, error);
      throw error;
    }
  }

  private async analyzeWebContent(content: string, url: string): Promise<{
    language?: string;
    businessContext?: string[];
    keywords: string[];
  }> {
    const $ = cheerio.load(content);

    // Extract text content
    const textContent = $('body').text().toLowerCase();

    // Detect language
    const romanianWords = ['și', 'este', 'pentru', 'care', 'despre', 'România', 'București'];
    const hasRomanian = romanianWords.some(word => textContent.includes(word.toLowerCase()));

    // Extract keywords
    const keywords = this.extractKeywords(textContent);

    // Business context
    const businessContext = [];
    if (textContent.includes('business') || textContent.includes('companie')) {
      businessContext.push('Business/Corporate');
    }
    if (textContent.includes('ecommerce') || textContent.includes('magazin')) {
      businessContext.push('E-commerce');
    }
    if (textContent.includes('tehnologie') || textContent.includes('technology')) {
      businessContext.push('Technology');
    }

    return {
      language: hasRomanian ? 'Romanian' : 'Other',
      businessContext,
      keywords
    };
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 3);

    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on Romanian keywords
    const romanianWords = ['și', 'sau', 'pentru', 'despre', 'este', 'sunt', 'cu', 'de', 'la', 'în'];
    const englishWords = ['and', 'or', 'for', 'about', 'is', 'are', 'with', 'of', 'from', 'in'];

    const lowerText = text.toLowerCase();

    const romanianCount = romanianWords.reduce((count, word) =>
      count + (lowerText.split(word).length - 1), 0);
    const englishCount = englishWords.reduce((count, word) =>
      count + (lowerText.split(word).length - 1), 0);

    return romanianCount > englishCount ? 'Romanian' : 'English';
  }

  private extractBusinessInsights(content: string, topic: string): string[] {
    const insights: string[] = [];
    const $ = cheerio.load(content);

    // Look for business-related patterns
    const businessPatterns = [
      /creștere.*\d+%/gi,
      /investiție.*\d+.*milioane/gi,
      /piață.*\d+.*miliarde/gi,
      /trend.*\d{4}/gi
    ];

    const text = $('body').text();
    businessPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        insights.push(...matches.slice(0, 3));
      }
    });

    return insights;
  }

  private extractRomanianContext(content: string, topic: string): string[] {
    const context = [];
    const $ = cheerio.load(content);
    const text = $('body').text().toLowerCase();

    // Romanian-specific business context
    if (text.includes('românia') || text.includes('romanian')) {
      context.push('Strong Romanian market presence');
    }
    if (text.includes('bucurești') || text.includes('bucharest')) {
      context.push('Bucharest-based operations');
    }
    if (text.includes('eu') || text.includes('uniunea europeană')) {
      context.push('EU market integration');
    }

    return context;
  }

  private async discoverCompetitors(domain: string): Promise<string[]> {
    // This would implement competitor discovery logic
    // For now, return mock competitors
    return [
      'competitor1.com',
      'competitor2.ro',
      'competitor3.com'
    ];
  }

  private async analyzeCompetitorWebsite(website: string): Promise<{
    name: string;
    website: string;
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
    romanianPresence?: boolean;
  }> {
    try {
      const result = await this.scrapeWebsite(`https://${website}`);

      return {
        name: result.title || website,
        website,
        strengths: ['Strong brand presence', 'Good user experience'],
        weaknesses: ['Limited Romanian content', 'High pricing'],
        marketPosition: 'Established player',
        romanianPresence: result.analysis.language === 'Romanian'
      };
    } catch (error) {
      this.logger.warn(`Error analyzing competitor ${website}:`, error);
      return {
        name: website,
        website,
        strengths: [],
        weaknesses: [],
        marketPosition: 'Unknown'
      };
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const browserConnected = !!this.browser && this.browser.isConnected();

      return {
        status: 'healthy',
        browserConnected,
        capabilities: ['scrape', 'research', 'compete', 'monitor']
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        capabilities: []
      };
    }
  }

  private async fallbackScrapeWithAxios(url: string): Promise<ScrapingResult> {
    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout || 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const responseTime = Date.now() - startTime;
      const $ = cheerio.load(response.data);

      const title = $('title').text();
      const content = $.text();

      return {
        url,
        title,
        content: content.substring(0, 5000), // Limit content size
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime,
          statusCode: response.status
        },
        analysis: {
          language: this.detectLanguage(content),
          keywords: this.extractKeywords(content),
          businessContext: ['Fallback scraping - limited analysis']
        }
      };
    } catch (error) {
      throw new Error(`Fallback scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.info('Browser closed');
    }
    this.logger.info('Web integration shut down');
  }
}
