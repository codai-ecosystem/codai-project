/**
 * Analytics Integrator Module
 * 
 * Implements comprehensive analytics integration with:
 * - Google Analytics 4 integration
 * - Google Search Console integration
 * - Performance analytics tracking
 * - SEO metrics monitoring
 * - Custom event tracking
 * - Privacy-compliant analytics
 */

import { promises as fs } from 'fs';
import path from 'path';

export async function applySEOEnhancement(appPath, appName) {
    console.log(`      📊 Implementing analytics integration for ${appName}...`);

    try {
        // Create analytics directory
        const analyticsPath = path.join(appPath, 'src', 'lib', 'seo', 'analytics');
        await fs.mkdir(analyticsPath, { recursive: true });

        // Create analytics components
        await createGoogleAnalytics(analyticsPath);
        await createSearchConsoleIntegration(analyticsPath);
        await createPerformanceAnalytics(analyticsPath);
        await createSEOMetricsTracker(analyticsPath);
        await createEventTracker(analyticsPath);

        // Create analytics hooks
        await createAnalyticsHooks(analyticsPath);

        // Create privacy-compliant analytics
        await createPrivacyCompliantAnalytics(analyticsPath);

        console.log(`      ✅ Analytics integration implemented for ${appName}`);

    } catch (error) {
        console.error(`      ❌ Failed to implement analytics integration for ${appName}:`, error.message);
        throw error;
    }
}

async function createGoogleAnalytics(analyticsPath) {
    const ga = `import { useEffect } from 'react';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export class GoogleAnalytics {
  private measurementId: string;
  private isInitialized = false;

  constructor(measurementId?: string) {
    this.measurementId = measurementId || GA_MEASUREMENT_ID || '';
  }

  init(): void {
    if (!this.measurementId || this.isInitialized) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = \`https://www.googletagmanager.com/gtag/js?id=\${this.measurementId}\`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    this.isInitialized = true;
    console.log('📊 Google Analytics initialized');
  }

  trackPageView(url: string, title?: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href
    });
  }

  trackEvent(event: GAEvent): void {
    if (!this.isInitialized) return;

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters
    });
  }

  trackConversion(conversionId: string, value?: number, currency = 'USD'): void {
    if (!this.isInitialized) return;

    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: currency
    });
  }

  trackTiming(category: string, variable: string, value: number, label?: string): void {
    if (!this.isInitialized) return;

    window.gtag('event', 'timing_complete', {
      name: variable,
      value: value,
      event_category: category,
      event_label: label
    });
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      user_properties: properties
    });
  }

  setDimensions(dimensions: Record<string, string>): void {
    if (!this.isInitialized) return;

    Object.entries(dimensions).forEach(([key, value]) => {
      window.gtag('config', this.measurementId, {
        [key]: value
      });
    });
  }
}

export const useGoogleAnalytics = () => {
  const router = useRouter();
  const ga = new GoogleAnalytics();

  useEffect(() => {
    ga.init();
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return ga;
};

export default GoogleAnalytics;`;

    await fs.writeFile(path.join(analyticsPath, 'GoogleAnalytics.ts'), ga);
}

async function createSearchConsoleIntegration(analyticsPath) {
    const searchConsole = `export interface SearchConsoleData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  page?: string;
  country?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  date?: string;
}

export interface SearchConsoleMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  averagePosition: number;
  queries: SearchConsoleData[];
  pages: SearchConsoleData[];
}

export class SearchConsoleIntegration {
  private apiKey: string;
  private siteUrl: string;

  constructor(apiKey?: string, siteUrl?: string) {
    this.apiKey = apiKey || process.env.SEARCH_CONSOLE_API_KEY || '';
    this.siteUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';
  }

  async getSearchAnalytics(
    startDate: string,
    endDate: string,
    dimensions: string[] = ['query']
  ): Promise<SearchConsoleMetrics | null> {
    if (!this.apiKey || !this.siteUrl) {
      console.warn('Search Console API key or site URL not configured');
      return null;
    }

    try {
      const response = await fetch(
        \`https://www.googleapis.com/webmasters/v3/sites/\${encodeURIComponent(this.siteUrl)}/searchAnalytics/query?key=\${this.apiKey}\`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions,
            rowLimit: 1000,
            startRow: 0
          })
        }
      );

      if (!response.ok) {
        throw new Error(\`Search Console API error: \${response.statusText}\`);
      }

      const data = await response.json();
      return this.transformSearchConsoleData(data);

    } catch (error) {
      console.error('Failed to fetch Search Console data:', error);
      return null;
    }
  }

  private transformSearchConsoleData(data: any): SearchConsoleMetrics {
    const rows = data.rows || [];
    
    const totalClicks = rows.reduce((sum: number, row: any) => sum + row.clicks, 0);
    const totalImpressions = rows.reduce((sum: number, row: any) => sum + row.impressions, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averagePosition = rows.length > 0 
      ? rows.reduce((sum: number, row: any) => sum + row.position, 0) / rows.length 
      : 0;

    return {
      totalClicks,
      totalImpressions,
      averageCTR,
      averagePosition,
      queries: rows.map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr * 100,
        position: row.position
      })),
      pages: []
    };
  }

  async getTopQueries(days = 30): Promise<SearchConsoleData[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const metrics = await this.getSearchAnalytics(startDate, endDate, ['query']);
    return metrics?.queries.slice(0, 50) || [];
  }

  async getTopPages(days = 30): Promise<SearchConsoleData[]> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const metrics = await this.getSearchAnalytics(startDate, endDate, ['page']);
    return metrics?.pages.slice(0, 50) || [];
  }

  generateSEOInsights(metrics: SearchConsoleMetrics): string[] {
    const insights: string[] = [];

    // CTR insights
    if (metrics.averageCTR < 2) {
      insights.push('⚠️ Low average CTR. Consider improving meta descriptions and titles.');
    } else if (metrics.averageCTR > 5) {
      insights.push('✅ Good average CTR. Your meta descriptions are engaging.');
    }

    // Position insights
    if (metrics.averagePosition > 10) {
      insights.push('⚠️ Average position beyond page 1. Focus on improving content quality and SEO.');
    } else if (metrics.averagePosition < 5) {
      insights.push('✅ Excellent average position. Your SEO strategy is working well.');
    }

    // Query insights
    const lowCTRQueries = metrics.queries.filter(q => q.ctr < 2 && q.impressions > 100);
    if (lowCTRQueries.length > 0) {
      insights.push(\`⚠️ \${lowCTRQueries.length} high-impression queries with low CTR need optimization.\`);
    }

    const highPositionQueries = metrics.queries.filter(q => q.position < 5 && q.clicks > 10);
    if (highPositionQueries.length > 0) {
      insights.push(\`✅ \${highPositionQueries.length} queries ranking in top 5 positions.\`);
    }

    return insights;
  }
}

export default SearchConsoleIntegration;`;

    await fs.writeFile(path.join(analyticsPath, 'SearchConsoleIntegration.ts'), searchConsole);
}

async function createPerformanceAnalytics(analyticsPath) {
    const perfAnalytics = `export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connectionType?: string;
}

export class PerformanceAnalytics {
  private metrics: PerformanceMetric[] = [];
  private analyticsEndpoint?: string;

  constructor(analyticsEndpoint?: string) {
    this.analyticsEndpoint = analyticsEndpoint || process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  }

  startTracking(): void {
    console.log('🚀 Starting performance analytics tracking...');
    
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track custom performance metrics
    this.trackCustomMetrics();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track resource loading
    this.trackResourceLoading();
  }

  private trackCoreWebVitals(): void {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.handleMetric.bind(this));
      getFID(this.handleMetric.bind(this));
      getFCP(this.handleMetric.bind(this));
      getLCP(this.handleMetric.bind(this));
      getTTFB(this.handleMetric.bind(this));
    });
  }

  private handleMetric = (metric: any): void => {
    const perfMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.href,
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType()
    };

    this.metrics.push(perfMetric);
    this.sendToAnalytics(perfMetric);
  };

  private trackCustomMetrics(): void {
    // Track Time to Interactive
    this.measureTimeToInteractive();
    
    // Track Bundle Size Impact
    this.measureBundleLoadTime();
    
    // Track API Response Times
    this.trackAPIPerformance();
  }

  private measureTimeToInteractive(): void {
    let tti: number;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' && entry.name === 'tti') {
          tti = entry.duration;
          this.recordMetric('TTI', tti);
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Calculate TTI when page becomes interactive
    document.addEventListener('DOMContentLoaded', () => {
      requestIdleCallback(() => {
        performance.mark('tti-start');
        setTimeout(() => {
          performance.mark('tti-end');
          performance.measure('tti', 'tti-start', 'tti-end');
        }, 0);
      });
    });
  }

  private measureBundleLoadTime(): void {
    window.addEventListener('load', () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const bundleLoadTime = navigationEntry.loadEventEnd - navigationEntry.responseStart;
        this.recordMetric('BundleLoadTime', bundleLoadTime);
      }
    });
  }

  private trackAPIPerformance(): void {
    // Intercept fetch requests to track API performance
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (url.includes('/api/')) {
          this.recordMetric('APIResponseTime', duration, url);
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.recordMetric('APIErrorTime', duration, url);
        throw error;
      }
    };
  }

  private trackUserInteractions(): void {
    // Track click interactions
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      
      requestIdleCallback(() => {
        const endTime = performance.now();
        const interactionTime = endTime - startTime;
        this.recordMetric('ClickInteractionTime', interactionTime);
      });
    });

    // Track input interactions
    document.addEventListener('input', (event) => {
      const startTime = performance.now();
      
      requestIdleCallback(() => {
        const endTime = performance.now();
        const interactionTime = endTime - startTime;
        this.recordMetric('InputInteractionTime', interactionTime);
      });
    });
  }

  private trackResourceLoading(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      entries.forEach((entry) => {
        const loadTime = entry.responseEnd - entry.startTime;
        
        if (entry.initiatorType === 'img') {
          this.recordMetric('ImageLoadTime', loadTime, entry.name);
        } else if (entry.initiatorType === 'script') {
          this.recordMetric('ScriptLoadTime', loadTime, entry.name);
        } else if (entry.initiatorType === 'css') {
          this.recordMetric('CSSLoadTime', loadTime, entry.name);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private recordMetric(name: string, value: number, url?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: url || window.location.href,
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType()
    };

    this.metrics.push(metric);
    this.sendToAnalytics(metric);
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getConnectionType(): string | undefined {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || connection?.type;
  }

  private async sendToAnalytics(metric: PerformanceMetric): Promise<void> {
    if (!this.analyticsEndpoint) return;

    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  generatePerformanceReport(): string {
    const report = {
      coreWebVitals: {
        LCP: this.getAverageMetric('LCP'),
        FID: this.getAverageMetric('FID'),
        CLS: this.getAverageMetric('CLS'),
        FCP: this.getAverageMetric('FCP'),
        TTFB: this.getAverageMetric('TTFB')
      },
      customMetrics: {
        TTI: this.getAverageMetric('TTI'),
        BundleLoadTime: this.getAverageMetric('BundleLoadTime'),
        APIResponseTime: this.getAverageMetric('APIResponseTime')
      },
      resourceMetrics: {
        ImageLoadTime: this.getAverageMetric('ImageLoadTime'),
        ScriptLoadTime: this.getAverageMetric('ScriptLoadTime'),
        CSSLoadTime: this.getAverageMetric('CSSLoadTime')
      }
    };

    return JSON.stringify(report, null, 2);
  }
}

export default PerformanceAnalytics;`;

    await fs.writeFile(path.join(analyticsPath, 'PerformanceAnalytics.ts'), perfAnalytics);
}

async function createSEOMetricsTracker(analyticsPath) {
    const seoMetrics = `export interface SEOMetric {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  h1Count: number;
  h2Count: number;
  imageCount: number;
  imagesWithAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  readabilityScore: number;
  loadTime: number;
  mobileScore: number;
  desktopScore: number;
  timestamp: number;
}

export class SEOMetricsTracker {
  private currentMetrics: SEOMetric | null = null;

  async analyzeCurrentPage(): Promise<SEOMetric> {
    console.log('🔍 Analyzing current page SEO metrics...');
    
    const metrics: SEOMetric = {
      url: window.location.href,
      title: document.title,
      description: this.getMetaDescription(),
      keywords: this.getMetaKeywords(),
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      imageCount: document.querySelectorAll('img').length,
      imagesWithAlt: document.querySelectorAll('img[alt]').length,
      internalLinks: this.getInternalLinksCount(),
      externalLinks: this.getExternalLinksCount(),
      wordCount: this.getWordCount(),
      readabilityScore: this.calculateReadabilityScore(),
      loadTime: this.getPageLoadTime(),
      mobileScore: await this.getMobileScore(),
      desktopScore: await this.getDesktopScore(),
      timestamp: Date.now()
    };

    this.currentMetrics = metrics;
    return metrics;
  }

  private getMetaDescription(): string {
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    return metaDesc?.content || '';
  }

  private getMetaKeywords(): string[] {
    const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    return metaKeywords?.content.split(',').map(k => k.trim()) || [];
  }

  private getInternalLinksCount(): number {
    const links = document.querySelectorAll('a[href]');
    let count = 0;
    
    links.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      if (href.startsWith(window.location.origin) || href.startsWith('/')) {
        count++;
      }
    });
    
    return count;
  }

  private getExternalLinksCount(): number {
    const links = document.querySelectorAll('a[href]');
    let count = 0;
    
    links.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
        count++;
      }
    });
    
    return count;
  }

  private getWordCount(): number {
    const textContent = document.body.innerText || '';
    return textContent.split(/\\s+/).filter(word => word.length > 0).length;
  }

  private calculateReadabilityScore(): number {
    const text = document.body.innerText || '';
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    if (sentences.length === 0 || words.length === 0) return 0;

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\\s+/);
    let syllableCount = 0;

    words.forEach(word => {
      // Remove punctuation
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g);
      let wordSyllables = vowelGroups ? vowelGroups.length : 0;

      // Adjust for silent e
      if (word.endsWith('e') && wordSyllables > 1) {
        wordSyllables--;
      }

      // Minimum of 1 syllable per word
      syllableCount += Math.max(1, wordSyllables);
    });

    return syllableCount;
  }

  private getPageLoadTime(): number {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.navigationStart : 0;
  }

  private async getMobileScore(): Promise<number> {
    // Simulate mobile score based on page performance and mobile-friendly features
    const hasViewportMeta = !!document.querySelector('meta[name="viewport"]');
    const hasResponsiveImages = document.querySelectorAll('img[srcset]').length > 0;
    const hasTouchFriendlyLinks = this.checkTouchFriendlyLinks();
    
    let score = 60; // Base score
    if (hasViewportMeta) score += 15;
    if (hasResponsiveImages) score += 10;
    if (hasTouchFriendlyLinks) score += 15;
    
    return Math.min(100, score);
  }

  private async getDesktopScore(): Promise<number> {
    // Simulate desktop score based on performance metrics
    const loadTime = this.getPageLoadTime();
    let score = 90; // Base score for desktop
    
    if (loadTime > 3000) score -= 20;
    else if (loadTime > 1500) score -= 10;
    
    return Math.max(0, score);
  }

  private checkTouchFriendlyLinks(): boolean {
    const links = document.querySelectorAll('a, button');
    let touchFriendlyCount = 0;
    
    links.forEach(link => {
      const rect = link.getBoundingClientRect();
      if (rect.height >= 44 && rect.width >= 44) {
        touchFriendlyCount++;
      }
    });
    
    return touchFriendlyCount / links.length > 0.8;
  }

  generateSEORecommendations(metrics?: SEOMetric): string[] {
    const m = metrics || this.currentMetrics;
    if (!m) return ['Run analyzeCurrentPage() first'];

    const recommendations: string[] = [];

    // Title optimization
    if (!m.title || m.title.length < 30) {
      recommendations.push('📝 Title is too short. Aim for 30-60 characters.');
    } else if (m.title.length > 60) {
      recommendations.push('📝 Title is too long. Keep it under 60 characters.');
    }

    // Description optimization
    if (!m.description) {
      recommendations.push('📄 Missing meta description. Add a compelling 150-160 character description.');
    } else if (m.description.length < 120) {
      recommendations.push('📄 Meta description is too short. Aim for 150-160 characters.');
    } else if (m.description.length > 160) {
      recommendations.push('📄 Meta description is too long. Keep it under 160 characters.');
    }

    // Heading structure
    if (m.h1Count === 0) {
      recommendations.push('🏷️ Missing H1 tag. Add one primary heading per page.');
    } else if (m.h1Count > 1) {
      recommendations.push('🏷️ Multiple H1 tags found. Use only one H1 per page.');
    }

    if (m.h2Count === 0) {
      recommendations.push('🏷️ No H2 tags found. Use H2 tags to structure your content.');
    }

    // Image optimization
    if (m.imageCount > 0 && m.imagesWithAlt / m.imageCount < 0.9) {
      recommendations.push('🖼️ Some images are missing alt text. Add descriptive alt text for accessibility.');
    }

    // Content length
    if (m.wordCount < 300) {
      recommendations.push('📝 Content is too short. Aim for at least 300 words for better SEO.');
    }

    // Readability
    if (m.readabilityScore < 60) {
      recommendations.push('📚 Content readability is poor. Use shorter sentences and simpler words.');
    }

    // Performance
    if (m.loadTime > 3000) {
      recommendations.push('⚡ Page load time is slow. Optimize images and reduce JavaScript.');
    }

    // Mobile optimization
    if (m.mobileScore < 80) {
      recommendations.push('📱 Mobile experience needs improvement. Add responsive design and touch-friendly elements.');
    }

    // Link building
    if (m.internalLinks < 3) {
      recommendations.push('🔗 Add more internal links to improve site navigation and SEO.');
    }

    return recommendations;
  }

  exportMetrics(): string {
    if (!this.currentMetrics) return '';
    return JSON.stringify(this.currentMetrics, null, 2);
  }
}

export default SEOMetricsTracker;`;

    await fs.writeFile(path.join(analyticsPath, 'SEOMetricsTracker.ts'), seoMetrics);
}

async function createEventTracker(analyticsPath) {
    const eventTracker = `export interface TrackingEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
  timestamp: number;
  user_agent: string;
  url: string;
}

export class EventTracker {
  private events: TrackingEvent[] = [];
  private googleAnalytics?: any;
  private analyticsEndpoint?: string;

  constructor(googleAnalytics?: any, analyticsEndpoint?: string) {
    this.googleAnalytics = googleAnalytics;
    this.analyticsEndpoint = analyticsEndpoint;
    this.initializeEventTracking();
  }

  private initializeEventTracking(): void {
    console.log('🎯 Initializing event tracking...');
    
    // Track page interactions
    this.trackPageInteractions();
    
    // Track form interactions
    this.trackFormInteractions();
    
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track file downloads
    this.trackFileDownloads();
    
    // Track external links
    this.trackExternalLinks();
  }

  trackEvent(category: string, action: string, label?: string, value?: number, customParams?: Record<string, any>): void {
    const event: TrackingEvent = {
      category,
      action,
      label,
      value,
      custom_parameters: customParams,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      url: window.location.href
    };

    this.events.push(event);

    // Send to Google Analytics if available
    if (this.googleAnalytics) {
      this.googleAnalytics.trackEvent({
        category,
        action,
        label,
        value,
        custom_parameters: customParams
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(event);

    console.log('📊 Event tracked:', event);
  }

  private trackPageInteractions(): void {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      
      if (tagName === 'button') {
        this.trackEvent('UI', 'Button Click', target.textContent?.trim());
      } else if (tagName === 'a') {
        const href = (target as HTMLAnchorElement).href;
        if (href.includes('#')) {
          this.trackEvent('Navigation', 'Anchor Click', href);
        }
      } else if (target.closest('.cta')) {
        this.trackEvent('Conversion', 'CTA Click', target.textContent?.trim());
      }
    });

    // Track hover events on key elements
    document.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('track-hover')) {
        this.trackEvent('Engagement', 'Element Hover', target.getAttribute('data-track-label'));
      }
    }, true);
  }

  private trackFormInteractions(): void {
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const formName = form.name || form.id || 'unnamed_form';
      
      this.trackEvent('Form', 'Submit', formName);
    });

    // Track form field interactions
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
        const fieldName = (target as HTMLInputElement).name || (target as HTMLInputElement).id;
        this.trackEvent('Form', 'Field Focus', fieldName);
      }
    });

    // Track form validation errors
    document.addEventListener('invalid', (e) => {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name || target.id;
      this.trackEvent('Form', 'Validation Error', fieldName);
    }, true);
  }

  private trackScrollDepth(): void {
    let scrollDepthTracked = new Set<number>();
    const scrollDepthThresholds = [25, 50, 75, 90, 100];

    const trackScrollDepth = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

      scrollDepthThresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !scrollDepthTracked.has(threshold)) {
          this.trackEvent('Engagement', 'Scroll Depth', \`\${threshold}%\`, threshold);
          scrollDepthTracked.add(threshold);
        }
      });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          trackScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  private trackFileDownloads(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;
      
      if (link && link.href) {
        const href = link.href.toLowerCase();
        const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar'];
        
        const isDownload = fileExtensions.some(ext => href.includes(ext));
        if (isDownload || link.hasAttribute('download')) {
          const fileName = link.href.split('/').pop() || 'unknown';
          this.trackEvent('Download', 'File Download', fileName);
        }
      }
    });
  }

  private trackExternalLinks(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;
      
      if (link && link.href) {
        const linkHost = new URL(link.href).hostname;
        const currentHost = window.location.hostname;
        
        if (linkHost !== currentHost && link.href.startsWith('http')) {
          this.trackEvent('External Link', 'Click', linkHost);
        }
      }
    });
  }

  // Specific tracking methods for SEO-related events
  trackSEOEvent(action: string, label?: string, value?: number): void {
    this.trackEvent('SEO', action, label, value);
  }

  trackSearchQuery(query: string, results: number): void {
    this.trackEvent('Search', 'Query', query, results);
  }

  trackPageView(page: string, title?: string): void {
    this.trackEvent('Page View', 'View', page, undefined, { page_title: title });
  }

  trackConversion(type: string, value?: number): void {
    this.trackEvent('Conversion', type, undefined, value);
  }

  trackPerformanceMetric(metric: string, value: number): void {
    this.trackEvent('Performance', metric, undefined, value);
  }

  trackUserEngagement(action: string, timeSpent?: number): void {
    this.trackEvent('Engagement', action, undefined, timeSpent);
  }

  private async sendToCustomEndpoint(event: TrackingEvent): Promise<void> {
    if (!this.analyticsEndpoint) return;

    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send event to custom endpoint:', error);
    }
  }

  getEvents(): TrackingEvent[] {
    return [...this.events];
  }

  getEventsByCategory(category: string): TrackingEvent[] {
    return this.events.filter(event => event.category === category);
  }

  getEventAnalytics(): Record<string, number> {
    const analytics: Record<string, number> = {};
    
    this.events.forEach(event => {
      const key = \`\${event.category}:\${event.action}\`;
      analytics[key] = (analytics[key] || 0) + 1;
    });
    
    return analytics;
  }

  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

export default EventTracker;`;

    await fs.writeFile(path.join(analyticsPath, 'EventTracker.ts'), eventTracker);
}

async function createAnalyticsHooks(analyticsPath) {
    const hooks = `import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GoogleAnalytics } from './GoogleAnalytics';
import { EventTracker } from './EventTracker';
import { SEOMetricsTracker } from './SEOMetricsTracker';
import { PerformanceAnalytics } from './PerformanceAnalytics';

export function useAnalytics() {
  const router = useRouter();
  const [analytics] = useState(() => ({
    ga: new GoogleAnalytics(),
    eventTracker: new EventTracker(),
    seoTracker: new SEOMetricsTracker(),
    performanceTracker: new PerformanceAnalytics()
  }));

  useEffect(() => {
    // Initialize analytics
    analytics.ga.init();
    analytics.performanceTracker.startTracking();

    // Track initial page view
    analytics.ga.trackPageView(router.asPath);
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analytics.ga.trackPageView(url);
      analytics.eventTracker.trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return analytics;
}

export function useEventTracking() {
  const { eventTracker } = useAnalytics();

  const trackEvent = useCallback((category: string, action: string, label?: string, value?: number) => {
    eventTracker.trackEvent(category, action, label, value);
  }, [eventTracker]);

  const trackConversion = useCallback((type: string, value?: number) => {
    eventTracker.trackConversion(type, value);
  }, [eventTracker]);

  const trackSearch = useCallback((query: string, results: number) => {
    eventTracker.trackSearchQuery(query, results);
  }, [eventTracker]);

  return { trackEvent, trackConversion, trackSearch };
}

export function useSEOTracking() {
  const { seoTracker } = useAnalytics();
  const [seoMetrics, setSeoMetrics] = useState(null);

  const analyzePage = useCallback(async () => {
    const metrics = await seoTracker.analyzeCurrentPage();
    setSeoMetrics(metrics);
    return metrics;
  }, [seoTracker]);

  const getRecommendations = useCallback(() => {
    return seoTracker.generateSEORecommendations();
  }, [seoTracker]);

  return { seoMetrics, analyzePage, getRecommendations };
}

export default { useAnalytics, useEventTracking, useSEOTracking };`;

    await fs.writeFile(path.join(analyticsPath, 'hooks.ts'), hooks);
}

async function createPrivacyCompliantAnalytics(analyticsPath) {
    const privacy = `export interface PrivacySettings {
  allowAnalytics: boolean;
  allowMarketing: boolean;
  allowFunctional: boolean;
  allowPerformance: boolean;
}

export class PrivacyCompliantAnalytics {
  private settings: PrivacySettings;
  private cookiePrefix = 'codai_consent_';

  constructor() {
    this.settings = this.loadPrivacySettings();
  }

  private loadPrivacySettings(): PrivacySettings {
    try {
      const stored = localStorage.getItem('privacy_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load privacy settings:', error);
    }

    // Default settings (most restrictive)
    return {
      allowAnalytics: false,
      allowMarketing: false,
      allowFunctional: true,
      allowPerformance: false
    };
  }

  updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    this.settings = { ...this.settings, ...settings };
    
    try {
      localStorage.setItem('privacy_settings', JSON.stringify(this.settings));
      this.setCookieConsent();
      this.applySettings();
    } catch (error) {
      console.warn('Failed to save privacy settings:', error);
    }
  }

  private setCookieConsent(): void {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const expiresStr = expires.toUTCString();

    Object.entries(this.settings).forEach(([key, value]) => {
      document.cookie = \`\${this.cookiePrefix}\${key}=\${value}; expires=\${expiresStr}; path=/; SameSite=Strict\`;
    });
  }

  private applySettings(): void {
    // Disable/enable Google Analytics based on consent
    if (this.settings.allowAnalytics) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    // Marketing consent
    if (this.settings.allowMarketing) {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted'
      });
    } else {
      window.gtag?.('consent', 'update', {
        ad_storage: 'denied'
      });
    }

    // Performance monitoring consent
    if (!this.settings.allowPerformance) {
      // Disable performance tracking
      window.dispatchEvent(new CustomEvent('disable-performance-tracking'));
    }
  }

  canTrack(category: 'analytics' | 'marketing' | 'functional' | 'performance'): boolean {
    switch (category) {
      case 'analytics':
        return this.settings.allowAnalytics;
      case 'marketing':
        return this.settings.allowMarketing;
      case 'functional':
        return this.settings.allowFunctional;
      case 'performance':
        return this.settings.allowPerformance;
      default:
        return false;
    }
  }

  getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  hasConsent(): boolean {
    try {
      const stored = localStorage.getItem('privacy_settings');
      return !!stored;
    } catch {
      return false;
    }
  }

  anonymizeData(data: any): any {
    if (!this.settings.allowAnalytics) {
      // Remove or hash PII
      const anonymized = { ...data };
      delete anonymized.user_id;
      delete anonymized.email;
      delete anonymized.ip_address;
      
      // Hash the user agent
      if (anonymized.user_agent) {
        anonymized.user_agent = this.hashString(anonymized.user_agent);
      }
      
      return anonymized;
    }
    
    return data;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  generateConsentBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.innerHTML = \`
      <div style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #1a1a1a;
        color: white;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
      ">
        <div style="max-width: 1200px; margin: 0 auto;">
          <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4;">
            We use cookies and similar technologies to improve your experience, analyze site usage, and provide personalized content. 
            <a href="/privacy" style="color: #0066cc; text-decoration: underline;">Learn more</a>
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="accept-all" style="
              background: #0066cc;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Accept All</button>
            <button id="essential-only" style="
              background: #666;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Essential Only</button>
            <button id="customize" style="
              background: transparent;
              color: white;
              border: 1px solid #666;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Customize</button>
          </div>
        </div>
      </div>
    \`;

    // Add event listeners
    banner.querySelector('#accept-all')?.addEventListener('click', () => {
      this.updatePrivacySettings({
        allowAnalytics: true,
        allowMarketing: true,
        allowFunctional: true,
        allowPerformance: true
      });
      banner.remove();
    });

    banner.querySelector('#essential-only')?.addEventListener('click', () => {
      this.updatePrivacySettings({
        allowAnalytics: false,
        allowMarketing: false,
        allowFunctional: true,
        allowPerformance: false
      });
      banner.remove();
    });

    banner.querySelector('#customize')?.addEventListener('click', () => {
      this.showCustomizeModal();
      banner.remove();
    });

    return banner;
  }

  private showCustomizeModal(): void {
    // Create and show privacy customization modal
    console.log('Privacy customization modal would be shown here');
  }

  showConsentBannerIfNeeded(): void {
    if (!this.hasConsent()) {
      const banner = this.generateConsentBanner();
      document.body.appendChild(banner);
    }
  }
}

export default PrivacyCompliantAnalytics;`;

    await fs.writeFile(path.join(analyticsPath, 'PrivacyCompliantAnalytics.ts'), privacy);
}