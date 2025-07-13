/**
 * Production optimization utilities for the METU Template
 * Includes compression, caching, and performance monitoring
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Handler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Compression middleware for API routes
 */
export function withCompression(handler: Handler) {
  return async (req: NextRequest) => {
    const response = await handler(req);

    // Add compression headers for supported content types
    if (response instanceof NextResponse) {
      const contentType = response.headers.get('content-type');

      if (contentType != null && shouldCompress(contentType)) {
        response.headers.set('Content-Encoding', 'gzip');
        response.headers.set('Vary', 'Accept-Encoding');
      }
    }

    return response;
  };
}

/**
 * Check if content type should be compressed
 */
function shouldCompress(contentType: string): boolean {
  const compressibleTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'image/svg+xml',
  ];

  return compressibleTypes.some(type => contentType.includes(type));
}

/**
 * Cache control headers for different content types
 */
export const cacheHeaders = {
  // Static assets (1 year)
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000',
  },

  // Images (1 month)
  images: {
    'Cache-Control': 'public, max-age=2592000',
    'CDN-Cache-Control': 'public, max-age=2592000',
  },

  // API responses (5 minutes)
  api: {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    'CDN-Cache-Control': 'public, max-age=300',
  },

  // Pages (1 hour)
  pages: {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    'CDN-Cache-Control': 'public, max-age=3600',
  },

  // No cache
  noCache: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
};

/**
 * Security headers for production
 */
export const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // HSTS (if using HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * Content Security Policy
 */
export function getCSPHeader(nonce?: string): string {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"} *.vercel-analytics.com *.vercel-insights.com`,
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob: *.firebase.com *.googleapis.com *.vercel.com",
    "connect-src 'self' *.firebase.com *.googleapis.com *.vercel.com *.vercel-analytics.com vitals.vercel-analytics.com",
    "frame-src 'self' *.firebase.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ];

  return csp.join('; ');
}

/**
 * Performance monitoring for production
 */
export class PerformanceMonitor {
  private static readonly metrics: Map<string, number[]> = new Map();

  static startTimer(label: string): () => number {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      return duration;
    };
  }

  static recordMetric(label: string, value: number): void {
    const existing = this.metrics.get(label) || [];
    existing.push(value);

    // Keep only last 100 measurements
    if (existing.length > 100) {
      existing.shift();
    }

    this.metrics.set(label, existing);
  }

  static getMetrics(
    label: string
  ): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  static getAllMetrics(): Record<
    string,
    ReturnType<typeof PerformanceMonitor.getMetrics>
  > {
    const result: Record<
      string,
      ReturnType<typeof PerformanceMonitor.getMetrics>
    > = {};

    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }

    return result;
  }
}

/**
 * Error reporting for production
 */
interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: Date;
  url?: string;
  userAgent?: string;
}

export class ErrorReporter {
  private static readonly errors: ErrorReport[] = [];

  static reportError(
    error: Error,
    context?: { url?: string; userAgent?: string }
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      timestamp: new Date(),
    };

    if (error.stack) {
      errorReport.stack = error.stack;
    }

    if (context?.url) {
      errorReport.url = context.url;
    }

    if (context?.userAgent) {
      errorReport.userAgent = context.userAgent;
    }

    this.errors.push(errorReport);

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }

    // In production, you might want to send this to an error tracking service
    if (process.env['NODE_ENV'] === 'production') {
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        context,
      });
    }
  }

  static getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors.length = 0;
  }
}

/**
 * Resource optimization utilities
 */
export const resourceOptimization = {
  /**
   * Preload critical resources
   */
  getPreloadHeaders(
    resources: Array<{ href: string; as: string; type?: string }>
  ): string {
    return resources
      .map(resource => {
        const type = resource.type ? `; type=${resource.type}` : '';
        return `<${resource.href}>; rel=preload; as=${resource.as}${type}`;
      })
      .join(', ');
  },

  /**
   * Generate critical CSS
   */
  extractCriticalCSS(html: string, css: string): string {
    // Simple implementation - in production you might use a more sophisticated tool
    const usedSelectors = new Set<string>();

    // Extract class names from HTML
    const classMatches = html.match(/class="([^"]+)"/g);
    if (classMatches != null) {
      for (const match of classMatches) {
        const classMatch = match.match(/class="([^"]+)"/);
        if (classMatch?.[1]) {
          const classes = classMatch[1].split(' ');
          for (const cls of classes) usedSelectors.add(`.${cls}`);
        }
      }
    }
    // Extract used CSS rules
    const cssRules = css.split('}').map(rule => `${rule.trim()}}`);
    const criticalCSS = cssRules.filter(rule => {
      const selectorPart = rule.split('{')[0];
      if (!selectorPart) return false;

      const selector = selectorPart.trim();
      return Array.from(usedSelectors).some(
        used =>
          selector.includes(used) || selector === 'html' || selector === 'body'
      );
    });

    return criticalCSS.join('\n');
  },

  /**
   * Image optimization suggestions
   */
  getImageOptimizations(src: string): {
    webp: string;
    avif: string;
    srcSet: string;
    sizes: string;
  } {
    const basePath = src.replace(/\.[^.]+$/, '');
    const ext = src.split('.').pop();

    return {
      webp: `${basePath}.webp`,
      avif: `${basePath}.avif`,
      srcSet: [
        `${basePath}-400w.${ext} 400w`,
        `${basePath}-800w.${ext} 800w`,
        `${basePath}-1200w.${ext} 1200w`,
      ].join(', '),
      sizes: '(max-width: 400px) 100vw, (max-width: 800px) 50vw, 33vw',
    };
  },
};

interface BundleChunk {
  name: string;
  size: number;
}

interface BundleAnalysisResult {
  recommendations: string[];
  totalSize: number;
  gzippedSize: number;
  largestChunks: BundleChunk[];
}

/**
 * Bundle analysis utilities
 */
export const bundleAnalysis = {
  /**
   * Analyze bundle size and suggest optimizations
   */ analyzeBundleSize(bundleStats: {
    chunks?: unknown[];
    modules?: unknown[];
    size?: number;
    gzippedSize?: number;
  }): BundleAnalysisResult {
    const recommendations: string[] = [];
    const chunks = bundleStats.chunks ?? [];

    // Find large chunks
    const largestChunks: BundleChunk[] = chunks
      .map((chunk: unknown) => ({
        name: (chunk as { name?: string }).name ?? 'unnamed',
        size: (chunk as { size?: number }).size || 0,
      }))
      .sort((a: BundleChunk, b: BundleChunk) => b.size - a.size)
      .slice(0, 5);

    // Generate recommendations
    if (largestChunks.some((chunk: BundleChunk) => chunk.size > 500000)) {
      recommendations.push('Consider code splitting for large chunks');
    }
    if (
      bundleStats.modules?.some((mod: unknown) =>
        (mod as { name?: string }).name?.includes('lodash')
      )
    ) {
      recommendations.push('Use lodash-es or individual lodash imports');
    }

    if (
      bundleStats.modules?.some((mod: unknown) =>
        (mod as { name?: string }).name?.includes('moment')
      )
    ) {
      recommendations.push(
        'Consider replacing moment.js with date-fns or day.js'
      );
    }

    return {
      recommendations,
      totalSize: bundleStats.size ?? 0,
      gzippedSize: bundleStats.gzippedSize ?? 0,
      largestChunks,
    };
  },

  /**
   * Generate bundle analysis report
   */
  generateReport(analysis: BundleAnalysisResult): string {
    const report = [
      '# Bundle Analysis Report',
      '',
      `**Total Size:** ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB`,
      `**Gzipped Size:** ${(analysis.gzippedSize / 1024 / 1024).toFixed(2)} MB`,
      '',
      '## Largest Chunks',
      '',
      ...analysis.largestChunks.map(
        (chunk: BundleChunk) =>
          `- ${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB`
      ),
      '',
      '## Recommendations',
      '',
      ...analysis.recommendations.map((rec: string) => `- ${rec}`),
    ];

    return report.join('\n');
  },
};

const productionUtils = {
  withCompression,
  cacheHeaders,
  securityHeaders,
  getCSPHeader,
  PerformanceMonitor,
  ErrorReporter,
  resourceOptimization,
  bundleAnalysis,
};

export default productionUtils;
