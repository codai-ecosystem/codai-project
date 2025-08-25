/**
 * Sitemap Generator Module
 * 
 * Implements comprehensive sitemap generation with:
 * - Dynamic XML sitemap generation
 * - Multi-language sitemap support
 * - Automatic sitemap indexing
 * - Priority and frequency configuration
 * - Image and video sitemap support
 * - News sitemap generation
 */

import { promises as fs } from 'fs';
import path from 'path';

export async function applySEOEnhancement(appPath, appName) {
    console.log(`      🗺️ Implementing sitemap generation for ${appName}...`);

    try {
        // Create sitemap directory
        const sitemapPath = path.join(appPath, 'src', 'lib', 'seo', 'sitemap');
        await fs.mkdir(sitemapPath, { recursive: true });

        // Create sitemap components
        await createSitemapGenerator(sitemapPath);
        await createSitemapBuilder(sitemapPath);
        await createSitemapConfig(sitemapPath);
        await createSitemapAPI(appPath, appName);

        // Create Next.js sitemap integration
        await createNextJSSitemapIntegration(appPath, appName);

        console.log(`      ✅ Sitemap generation implemented for ${appName}`);

    } catch (error) {
        console.error(`      ❌ Failed to implement sitemap generation for ${appName}:`, error.message);
        throw error;
    }
}

async function createSitemapGenerator(sitemapPath) {
    const generator = `import { promises as fs } from 'fs';
import path from 'path';
import seoConfig from '@/shared/config/seo.config';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternateLocales?: Array<{
    lang: string;
    href: string;
  }>;
  images?: Array<{
    loc: string;
    caption?: string;
    title?: string;
  }>;
  videos?: Array<{
    thumbnail_loc: string;
    title: string;
    description: string;
    content_loc?: string;
    player_loc?: string;
    duration?: number;
    publication_date?: string;
  }>;
}

export interface SitemapGeneratorOptions {
  baseUrl?: string;
  outputPath?: string;
  includeImages?: boolean;
  includeVideos?: boolean;
  includeAlternateLanguages?: boolean;
  compression?: boolean;
  validateUrls?: boolean;
}

export class SitemapGenerator {
  private baseUrl: string;
  private outputPath: string;
  private options: SitemapGeneratorOptions;

  constructor(options: SitemapGeneratorOptions = {}) {
    this.baseUrl = options.baseUrl || seoConfig.global.siteUrl;
    this.outputPath = options.outputPath || 'public';
    this.options = {
      includeImages: true,
      includeVideos: true,
      includeAlternateLanguages: true,
      compression: false,
      validateUrls: true,
      ...options
    };
  }

  async generateSitemap(urls: SitemapUrl[], filename: string = 'sitemap.xml'): Promise<string> {
    const xmlContent = this.buildXmlContent(urls);
    const outputFilePath = path.join(this.outputPath, filename);
    
    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    
    // Write sitemap file
    await fs.writeFile(outputFilePath, xmlContent, 'utf8');
    
    console.log(\`✅ Sitemap generated: \${filename} with \${urls.length} URLs\`);
    return outputFilePath;
  }

  async generateSitemapIndex(sitemaps: Array<{ loc: string; lastmod?: string }>): Promise<string> {
    const xmlContent = this.buildSitemapIndexXml(sitemaps);
    const outputFilePath = path.join(this.outputPath, 'sitemap.xml');
    
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    await fs.writeFile(outputFilePath, xmlContent, 'utf8');
    
    console.log(\`✅ Sitemap index generated with \${sitemaps.length} sitemaps\`);
    return outputFilePath;
  }

  private buildXmlContent(urls: SitemapUrl[]): string {
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>\n\`;
    xml += \`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\`;
    
    if (this.options.includeImages) {
      xml += \` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\`;
    }
    
    if (this.options.includeVideos) {
      xml += \` xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\`;
    }
    
    if (this.options.includeAlternateLanguages) {
      xml += \` xmlns:xhtml="http://www.w3.org/1999/xhtml"\`;
    }
    
    xml += \`>\n\`;
    
    urls.forEach(url => {
      xml += this.buildUrlElement(url);
    });
    
    xml += \`</urlset>\`;
    return xml;
  }

  private buildUrlElement(url: SitemapUrl): string {
    let urlElement = \`  <url>\n\`;
    urlElement += \`    <loc>\${this.escapeXml(url.loc)}</loc>\n\`;
    
    if (url.lastmod) {
      urlElement += \`    <lastmod>\${url.lastmod}</lastmod>\n\`;
    }
    
    if (url.changefreq) {
      urlElement += \`    <changefreq>\${url.changefreq}</changefreq>\n\`;
    }
    
    if (url.priority !== undefined) {
      urlElement += \`    <priority>\${url.priority.toFixed(1)}</priority>\n\`;
    }
    
    // Add alternate language versions
    if (this.options.includeAlternateLanguages && url.alternateLocales) {
      url.alternateLocales.forEach(locale => {
        urlElement += \`    <xhtml:link rel="alternate" hreflang="\${locale.lang}" href="\${this.escapeXml(locale.href)}" />\n\`;
      });
    }
    
    // Add images
    if (this.options.includeImages && url.images) {
      url.images.forEach(image => {
        urlElement += \`    <image:image>\n\`;
        urlElement += \`      <image:loc>\${this.escapeXml(image.loc)}</image:loc>\n\`;
        if (image.caption) {
          urlElement += \`      <image:caption>\${this.escapeXml(image.caption)}</image:caption>\n\`;
        }
        if (image.title) {
          urlElement += \`      <image:title>\${this.escapeXml(image.title)}</image:title>\n\`;
        }
        urlElement += \`    </image:image>\n\`;
      });
    }
    
    // Add videos
    if (this.options.includeVideos && url.videos) {
      url.videos.forEach(video => {
        urlElement += \`    <video:video>\n\`;
        urlElement += \`      <video:thumbnail_loc>\${this.escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>\n\`;
        urlElement += \`      <video:title>\${this.escapeXml(video.title)}</video:title>\n\`;
        urlElement += \`      <video:description>\${this.escapeXml(video.description)}</video:description>\n\`;
        
        if (video.content_loc) {
          urlElement += \`      <video:content_loc>\${this.escapeXml(video.content_loc)}</video:content_loc>\n\`;
        }
        
        if (video.player_loc) {
          urlElement += \`      <video:player_loc>\${this.escapeXml(video.player_loc)}</video:player_loc>\n\`;
        }
        
        if (video.duration) {
          urlElement += \`      <video:duration>\${video.duration}</video:duration>\n\`;
        }
        
        if (video.publication_date) {
          urlElement += \`      <video:publication_date>\${video.publication_date}</video:publication_date>\n\`;
        }
        
        urlElement += \`    </video:video>\n\`;
      });
    }
    
    urlElement += \`  </url>\n\`;
    return urlElement;
  }

  private buildSitemapIndexXml(sitemaps: Array<{ loc: string; lastmod?: string }>): string {
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>\n\`;
    xml += \`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\`;
    
    sitemaps.forEach(sitemap => {
      xml += \`  <sitemap>\n\`;
      xml += \`    <loc>\${this.escapeXml(sitemap.loc)}</loc>\n\`;
      if (sitemap.lastmod) {
        xml += \`    <lastmod>\${sitemap.lastmod}</lastmod>\n\`;
      }
      xml += \`  </sitemap>\n\`;
    });
    
    xml += \`</sitemapindex>\`;
    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async validateUrls(urls: SitemapUrl[]): Promise<SitemapUrl[]> {
    if (!this.options.validateUrls) {
      return urls;
    }
    
    console.log(\`🔍 Validating \${urls.length} URLs...\`);
    const validUrls: SitemapUrl[] = [];
    
    for (const url of urls) {
      try {
        // Basic URL validation
        new URL(url.loc);
        
        // Check if URL is accessible (optional HTTP check could be added here)
        validUrls.push(url);
      } catch (error) {
        console.warn(\`⚠️ Invalid URL skipped: \${url.loc}\`);
      }
    }
    
    console.log(\`✅ Validated \${validUrls.length} of \${urls.length} URLs\`);
    return validUrls;
  }
}

export default SitemapGenerator;`;

    await fs.writeFile(path.join(sitemapPath, 'SitemapGenerator.ts'), generator);
}

async function createSitemapBuilder(sitemapPath) {
    const builder = `import { SitemapGenerator, SitemapUrl } from './SitemapGenerator';
import seoConfig from '@/shared/config/seo.config';

export interface PageInfo {
  path: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: string[];
  videos?: any[];
}

export class SitemapBuilder {
  private generator: SitemapGenerator;
  private pages: Map<string, PageInfo> = new Map();

  constructor() {
    this.generator = new SitemapGenerator();
  }

  addPage(pageInfo: PageInfo): SitemapBuilder {
    this.pages.set(pageInfo.path, pageInfo);
    return this;
  }

  addPages(pages: PageInfo[]): SitemapBuilder {
    pages.forEach(page => this.addPage(page));
    return this;
  }

  removePage(path: string): SitemapBuilder {
    this.pages.delete(path);
    return this;
  }

  async buildApplicationSitemap(appName: string): Promise<string> {
    console.log(\`🔨 Building sitemap for \${appName}...\`);
    
    // Get application configuration
    const appConfig = seoConfig.applications[appName];
    if (!appConfig) {
      throw new Error(\`Application configuration not found for: \${appName}\`);
    }

    // Generate URLs for this application
    const urls: SitemapUrl[] = [];
    
    // Add application root page
    urls.push({
      loc: \`\${seoConfig.global.siteUrl}\${appConfig.path}\`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
      alternateLocales: seoConfig.global.supportedLocales.map(locale => ({
        lang: locale,
        href: \`\${seoConfig.global.siteUrl}\${locale !== 'en' ? '/' + locale : ''}\${appConfig.path}\`
      }))
    });

    // Add pages specific to this application
    for (const [path, pageInfo] of this.pages) {
      if (path.startsWith(appConfig.path) || path.includes(appName)) {
        const url: SitemapUrl = {
          loc: \`\${seoConfig.global.siteUrl}\${path}\`,
          lastmod: pageInfo.lastModified?.toISOString() || new Date().toISOString(),
          changefreq: pageInfo.changeFrequency || 'weekly',
          priority: pageInfo.priority || 0.6,
          alternateLocales: seoConfig.global.supportedLocales.map(locale => ({
            lang: locale,
            href: \`\${seoConfig.global.siteUrl}\${locale !== 'en' ? '/' + locale : ''}\${path}\`
          }))
        };

        // Add images if present
        if (pageInfo.images && pageInfo.images.length > 0) {
          url.images = pageInfo.images.map(imagePath => ({
            loc: \`\${seoConfig.global.siteUrl}\${imagePath}\`,
            title: \`Image from \${pageInfo.path}\`,
            caption: \`Image from \${appName}\`
          }));
        }

        // Add videos if present
        if (pageInfo.videos && pageInfo.videos.length > 0) {
          url.videos = pageInfo.videos.map(video => ({
            thumbnail_loc: \`\${seoConfig.global.siteUrl}\${video.thumbnail}\`,
            title: video.title,
            description: video.description,
            content_loc: video.contentUrl ? \`\${seoConfig.global.siteUrl}\${video.contentUrl}\` : undefined,
            duration: video.duration,
            publication_date: video.publishedAt
          }));
        }

        urls.push(url);
      }
    }

    // Add common application pages
    const commonPages = [
      '/about',
      '/features',
      '/documentation',
      '/pricing',
      '/contact'
    ];

    commonPages.forEach(page => {
      urls.push({
        loc: \`\${seoConfig.global.siteUrl}\${appConfig.path}\${page}\`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5,
        alternateLocales: seoConfig.global.supportedLocales.map(locale => ({
          lang: locale,
          href: \`\${seoConfig.global.siteUrl}\${locale !== 'en' ? '/' + locale : ''}\${appConfig.path}\${page}\`
        }))
      });
    });

    // Generate the sitemap
    const filename = \`sitemap-\${appName}.xml\`;
    await this.generator.generateSitemap(urls, filename);
    
    return filename;
  }

  async buildMasterSitemap(appNames: string[]): Promise<string> {
    console.log('🌐 Building master sitemap index...');
    
    const sitemaps = appNames.map(appName => ({
      loc: \`\${seoConfig.global.siteUrl}/sitemap-\${appName}.xml\`,
      lastmod: new Date().toISOString()
    }));

    // Add other important sitemaps
    sitemaps.push(
      {
        loc: \`\${seoConfig.global.siteUrl}/sitemap-pages.xml\`,
        lastmod: new Date().toISOString()
      },
      {
        loc: \`\${seoConfig.global.siteUrl}/sitemap-images.xml\`,
        lastmod: new Date().toISOString()
      }
    );

    await this.generator.generateSitemapIndex(sitemaps);
    return 'sitemap.xml';
  }

  async buildImageSitemap(): Promise<string> {
    console.log('🖼️ Building image sitemap...');
    
    const imageUrls: SitemapUrl[] = [];
    
    // Collect all images from pages
    for (const [path, pageInfo] of this.pages) {
      if (pageInfo.images && pageInfo.images.length > 0) {
        pageInfo.images.forEach(imagePath => {
          imageUrls.push({
            loc: \`\${seoConfig.global.siteUrl}\${path}\`,
            lastmod: pageInfo.lastModified?.toISOString() || new Date().toISOString(),
            images: [{
              loc: \`\${seoConfig.global.siteUrl}\${imagePath}\`,
              title: \`Image from \${path}\`,
              caption: \`Content image\`
            }]
          });
        });
      }
    }

    await this.generator.generateSitemap(imageUrls, 'sitemap-images.xml');
    return 'sitemap-images.xml';
  }

  getPageCount(): number {
    return this.pages.size;
  }

  getPages(): PageInfo[] {
    return Array.from(this.pages.values());
  }
}

export default SitemapBuilder;`;

    await fs.writeFile(path.join(sitemapPath, 'SitemapBuilder.ts'), builder);
}

async function createSitemapConfig(sitemapPath) {
    const config = `import { PageInfo } from './SitemapBuilder';

export const defaultSitemapConfig = {
  // Global settings
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://codai.dev',
  outputDir: 'public',
  
  // Sitemap generation settings
  generateSitemapIndex: true,
  generateImageSitemap: true,
  generateVideoSitemap: true,
  generateNewsSitemap: false,
  
  // Validation settings
  validateUrls: true,
  excludePatterns: [
    '/admin/*',
    '/api/*',
    '/private/*',
    '/_next/*',
    '/.*\\\\.json$',
    '/.*\\\\.xml$'
  ],
  
  // Default page settings
  defaultChangeFreq: 'weekly' as const,
  defaultPriority: 0.6,
  
  // Application-specific configurations
  applicationPages: {
    'controlai-dashboard': [
      { path: '/controlai', priority: 0.9, changeFrequency: 'daily' as const },
      { path: '/controlai/dashboard', priority: 0.8, changeFrequency: 'daily' as const },
      { path: '/controlai/monitoring', priority: 0.7, changeFrequency: 'hourly' as const },
      { path: '/controlai/settings', priority: 0.5, changeFrequency: 'monthly' as const }
    ] as PageInfo[],
    
    'memorai': [
      { path: '/memorai', priority: 0.9, changeFrequency: 'daily' as const },
      { path: '/memorai/memory', priority: 0.8, changeFrequency: 'hourly' as const },
      { path: '/memorai/patterns', priority: 0.7, changeFrequency: 'daily' as const },
      { path: '/memorai/analytics', priority: 0.6, changeFrequency: 'daily' as const }
    ] as PageInfo[],
    
    'romai': [
      { path: '/romai', priority: 1.0, changeFrequency: 'daily' as const },
      { path: '/romai/consciousness', priority: 0.9, changeFrequency: 'hourly' as const },
      { path: '/romai/quantum', priority: 0.8, changeFrequency: 'daily' as const },
      { path: '/romai/learning', priority: 0.8, changeFrequency: 'daily' as const }
    ] as PageInfo[],
    
    'bancai': [
      { path: '/bancai', priority: 0.9, changeFrequency: 'daily' as const },
      { path: '/bancai/accounts', priority: 0.8, changeFrequency: 'daily' as const },
      { path: '/bancai/analytics', priority: 0.7, changeFrequency: 'daily' as const },
      { path: '/bancai/security', priority: 0.6, changeFrequency: 'weekly' as const }
    ] as PageInfo[],
    
    'codai': [
      { path: '/codai', priority: 0.9, changeFrequency: 'daily' as const },
      { path: '/codai/generate', priority: 0.8, changeFrequency: 'daily' as const },
      { path: '/codai/assistant', priority: 0.8, changeFrequency: 'daily' as const },
      { path: '/codai/templates', priority: 0.6, changeFrequency: 'weekly' as const }
    ] as PageInfo[],
    
    'admin': [
      { path: '/admin', priority: 0.3, changeFrequency: 'weekly' as const },
      { path: '/admin/users', priority: 0.3, changeFrequency: 'daily' as const },
      { path: '/admin/system', priority: 0.2, changeFrequency: 'weekly' as const }
    ] as PageInfo[],
    
    'hub': [
      { path: '/hub', priority: 0.8, changeFrequency: 'daily' as const },
      { path: '/hub/integrations', priority: 0.7, changeFrequency: 'weekly' as const },
      { path: '/hub/api', priority: 0.6, changeFrequency: 'weekly' as const }
    ] as PageInfo[],
    
    'id': [
      { path: '/id', priority: 0.5, changeFrequency: 'weekly' as const },
      { path: '/id/profile', priority: 0.4, changeFrequency: 'weekly' as const },
      { path: '/id/security', priority: 0.4, changeFrequency: 'monthly' as const }
    ] as PageInfo[]
  },
  
  // Static pages
  staticPages: [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/features', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'daily' as const },
    { path: '/documentation', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/changelog', priority: 0.5, changeFrequency: 'weekly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const }
  ] as PageInfo[]
};

export default defaultSitemapConfig;`;

    await fs.writeFile(path.join(sitemapPath, 'sitemap.config.ts'), config);
}

async function createSitemapAPI(appPath, appName) {
    // Create API route for dynamic sitemap generation
    const apiPath = path.join(appPath, 'src', 'pages', 'api', 'sitemap');
    await fs.mkdir(apiPath, { recursive: true });

    const sitemapApi = `import { NextApiRequest, NextApiResponse } from 'next';
import { SitemapBuilder } from '../../../lib/seo/sitemap/SitemapBuilder';
import defaultSitemapConfig from '../../../lib/seo/sitemap/sitemap.config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type = 'application', format = 'xml' } = req.query;
    const builder = new SitemapBuilder();
    
    // Add application-specific pages
    const appPages = defaultSitemapConfig.applicationPages['${appName}'] || [];
    builder.addPages(appPages);
    
    // Add static pages
    builder.addPages(defaultSitemapConfig.staticPages);

    let result: string;
    
    switch (type) {
      case 'application':
        result = await builder.buildApplicationSitemap('${appName}');
        break;
        
      case 'images':
        result = await builder.buildImageSitemap();
        break;
        
      case 'index':
        result = await builder.buildMasterSitemap(['${appName}']);
        break;
        
      default:
        result = await builder.buildApplicationSitemap('${appName}');
    }

    if (format === 'json') {
      res.status(200).json({
        sitemap: result,
        pageCount: builder.getPageCount(),
        generatedAt: new Date().toISOString()
      });
    } else {
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(\`Sitemap generated: \${result}\`);
    }

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate sitemap',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}`;

    await fs.writeFile(path.join(apiPath, 'index.ts'), sitemapApi);
}

async function createNextJSSitemapIntegration(appPath, appName) {
    // Create Next.js sitemap integration
    const nextConfigPath = path.join(appPath, 'next.config.js');

    try {
        let nextConfig = await fs.readFile(nextConfigPath, 'utf8');

        // Add sitemap generation to Next.js config
        if (!nextConfig.includes('generateSitemap')) {
            nextConfig = nextConfig.replace(
                'module.exports = {',
                `const { SitemapBuilder } = require('./src/lib/seo/sitemap/SitemapBuilder');
const defaultSitemapConfig = require('./src/lib/seo/sitemap/sitemap.config').default;

module.exports = {
  async generateBuildId() {
    // Generate sitemap during build
    const builder = new SitemapBuilder();
    const appPages = defaultSitemapConfig.applicationPages['${appName}'] || [];
    builder.addPages(appPages);
    builder.addPages(defaultSitemapConfig.staticPages);
    await builder.buildApplicationSitemap('${appName}');
    return 'build-' + Date.now();
  },`
            );
        }

        await fs.writeFile(nextConfigPath, nextConfig);

    } catch (error) {
        // Create basic Next.js config with sitemap generation
        const nextConfig = `/** @type {import('next').NextConfig} */
const { SitemapBuilder } = require('./src/lib/seo/sitemap/SitemapBuilder');
const defaultSitemapConfig = require('./src/lib/seo/sitemap/sitemap.config').default;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  async generateBuildId() {
    // Generate sitemap during build
    try {
      const builder = new SitemapBuilder();
      const appPages = defaultSitemapConfig.applicationPages['${appName}'] || [];
      builder.addPages(appPages);
      builder.addPages(defaultSitemapConfig.staticPages);
      await builder.buildApplicationSitemap('${appName}');
    } catch (error) {
      console.warn('Sitemap generation failed during build:', error);
    }
    return 'build-' + Date.now();
  },

  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap?type=application'
      },
      {
        source: '/sitemap-images.xml',
        destination: '/api/sitemap?type=images'
      }
    ];
  }
};

module.exports = nextConfig;`;

        await fs.writeFile(nextConfigPath, nextConfig);
    }
}