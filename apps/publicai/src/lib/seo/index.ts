/**
 * SEO Optimization Utilities
 *
 * Comprehensive SEO tools for meta tags, Open Graph, structured data,
 * and performance optimization for better search engine rankings.
 */

import type { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

/**
 * Generate comprehensive metadata for Next.js pages
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    author,
    image,
    url,
    siteName = 'METU Template',
    locale = 'en_US',
    type = 'website',
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    noindex = false,
    nofollow = false,
  } = config;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    publisher: siteName,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale,
      type: type as 'website' | 'article',
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
      publishedTime,
      modifiedTime,
      section,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
      creator: author ? `@${author}` : undefined,
    },
    alternates: {
      canonical: url,
    },
    verification: {
      google: process.env['NEXT_PUBLIC_GOOGLE_VERIFICATION'],
      yandex: process.env['NEXT_PUBLIC_YANDEX_VERIFICATION'],
      yahoo: process.env['NEXT_PUBLIC_YAHOO_VERIFICATION'],
      other: {
        'msvalidate.01': process.env['NEXT_PUBLIC_BING_VERIFICATION'] ?? '',
      },
    },
  };

  return metadata;
}

/**
 * Generate JSON-LD structured data for websites
 */
export function generateWebsiteStructuredData(config: {
  name: string;
  url: string;
  description: string;
  logo?: string;
  sameAs?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    description: config.description,
    logo: config.logo,
    sameAs: config.sameAs,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate JSON-LD structured data for articles/blog posts
 */
export function generateArticleStructuredData(config: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  wordCount?: number;
  keywords?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.title,
    description: config.description,
    url: config.url,
    image: config.image,
    datePublished: config.datePublished,
    dateModified: config.dateModified ?? config.datePublished,
    author: {
      '@type': 'Person',
      name: config.author.name,
      url: config.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: config.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: config.publisher.logo,
      },
    },
    wordCount: config.wordCount,
    keywords: config.keywords,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': config.url,
    },
  };
}

/**
 * Generate JSON-LD structured data for organizations
 */
export function generateOrganizationStructuredData(config: {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    logo: config.logo,
    description: config.description,
    address: config.address
      ? {
          '@type': 'PostalAddress',
          ...config.address,
        }
      : undefined,
    contactPoint: config.contactPoint
      ? {
          '@type': 'ContactPoint',
          ...config.contactPoint,
        }
      : undefined,
    sameAs: config.sameAs,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * SEO performance utilities
 */
export class SEOAnalyzer {
  /**
   * Analyze page title for SEO best practices
   */
  static analyzeTitle(title: string): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check title length
    if (title.length < 30) {
      issues.push('Title is too short (< 30 characters)');
      suggestions.push('Expand title to 50-60 characters for better SEO');
      score -= 20;
    } else if (title.length > 60) {
      issues.push('Title is too long (> 60 characters)');
      suggestions.push('Shorten title to 50-60 characters to avoid truncation');
      score -= 15;
    }

    // Check for title case
    if (title === title.toUpperCase()) {
      issues.push('Title is all uppercase');
      suggestions.push('Use sentence case or title case instead');
      score -= 10;
    } // Check for keywords at the beginning
    const words = title.split(' ');
    if (
      words.length > 3 &&
      words[0] &&
      /^(the|a|an|and|or|but|in|on|at|to|for|of|with|by)$/i.test(words[0])
    ) {
      suggestions.push(
        'Consider starting with a keyword instead of stop words'
      );
      score -= 5;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze meta description for SEO best practices
   */
  static analyzeDescription(description: string): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check description length
    if (description.length < 120) {
      issues.push('Description is too short (< 120 characters)');
      suggestions.push('Expand description to 150-160 characters');
      score -= 20;
    } else if (description.length > 160) {
      issues.push('Description is too long (> 160 characters)');
      suggestions.push('Shorten description to 150-160 characters');
      score -= 15;
    }

    // Check for call-to-action
    const ctaWords = [
      'learn',
      'discover',
      'find',
      'get',
      'start',
      'try',
      'explore',
      'see',
      'read',
    ];
    const hasCallToAction = ctaWords.some(word =>
      description.toLowerCase().includes(word)
    );

    if (hasCallToAction == null) {
      suggestions.push('Consider adding a call-to-action word');
      score -= 10;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Generate SEO recommendations for a page
   */
  static generateRecommendations(config: SEOConfig): {
    overall: number;
    title: ReturnType<typeof SEOAnalyzer.analyzeTitle>;
    description: ReturnType<typeof SEOAnalyzer.analyzeDescription>;
    general: string[];
  } {
    const titleAnalysis = this.analyzeTitle(config.title);
    const descriptionAnalysis = this.analyzeDescription(config.description);
    const general: string[] = [];

    // General recommendations
    if (!config.keywords || config.keywords.length === 0) {
      general.push('Add relevant keywords for better search targeting');
    }

    if (!config.image) {
      general.push('Add an Open Graph image for better social media sharing');
    }

    if (!config.author) {
      general.push('Consider adding author information for credibility');
    }

    if (config.keywords != null && config.keywords.length > 10) {
      general.push('Limit keywords to 5-10 most relevant terms');
    }

    const overall = Math.round(
      (titleAnalysis.score + descriptionAnalysis.score) / 2
    );

    return {
      overall,
      title: titleAnalysis,
      description: descriptionAnalysis,
      general,
    };
  }
}

/**
 * Generate sitemap data for Next.js
 */
export function generateSitemapUrls(
  baseUrl: string,
  routes: Array<{
    path: string;
    lastModified?: string;
    changeFrequency?:
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never';
    priority?: number;
  }>
) {
  return routes.map(route => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.lastModified ?? new Date().toISOString(),
    changeFrequency: route.changeFrequency ?? 'monthly',
    priority: route.priority ?? 0.5,
  }));
}

/**
 * SEO-friendly URL slug generator
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\s\w-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract keywords from text content
 */
export function extractKeywords(text: string, maxKeywords = 10): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'this',
    'that',
    'these',
    'those',
    'i',
    'me',
    'my',
    'myself',
    'we',
    'our',
    'ours',
    'ourselves',
    'you',
    'your',
    'yours',
    'yourself',
    'yourselves',
    'he',
    'him',
    'his',
    'himself',
    'she',
    'her',
    'hers',
    'herself',
    'it',
    'its',
    'itself',
    'they',
    'them',
    'their',
    'theirs',
    'themselves',
    'what',
    'which',
    'who',
    'whom',
    'whose',
    'why',
    'when',
    'where',
    'how',
    'all',
    'any',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
  ]);

  // Extract words and count frequency
  const words = text
    .toLowerCase()
    .replace(/[^\s\w]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 != null && !stopWords.has(word));

  const wordCount = new Map<string, number>();
  for (const word of words) {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }

  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}
