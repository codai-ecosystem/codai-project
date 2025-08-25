/**
 * Meta Tags Manager Module
 * 
 * Implements comprehensive meta tags management with:
 * - Dynamic meta tags generation
 * - Open Graph optimization
 * - Twitter Card integration
 * - Canonical URL management
 * - Viewport optimization
 * - SEO-friendly meta components
 */

import { promises as fs } from 'fs';
import path from 'path';

export async function applySEOEnhancement(appPath, appName) {
    console.log(`      🏷️ Implementing meta tags management for ${appName}...`);

    try {
        // Create SEO components directory
        const seoComponentsPath = path.join(appPath, 'src', 'components', 'seo');
        await fs.mkdir(seoComponentsPath, { recursive: true });

        // Create meta tags manager component
        await createMetaTagsManager(seoComponentsPath);

        // Create SEO head component
        await createSEOHead(seoComponentsPath);

        // Create Open Graph component
        await createOpenGraph(seoComponentsPath);

        // Create Twitter Card component
        await createTwitterCard(seoComponentsPath);

        // Create canonical URL manager
        await createCanonicalManager(seoComponentsPath);

        // Create meta tags hook
        await createMetaTagsHook(seoComponentsPath);

        // Update layout with SEO components
        await updateLayoutWithSEO(appPath, appName);

        console.log(`      ✅ Meta tags management implemented for ${appName}`);

    } catch (error) {
        console.error(`      ❌ Failed to implement meta tags for ${appName}:`, error.message);
        throw error;
    }
}

async function createMetaTagsManager(seoPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import seoConfig from '@/shared/config/seo.config';

interface MetaTagsManagerProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export const MetaTagsManager: React.FC<MetaTagsManagerProps> = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  locale,
  alternateLocales,
  noindex = false,
  nofollow = false,
  canonical
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  // Get current application configuration
  const currentApp = Object.keys(seoConfig.applications).find(app => 
    router.pathname.startsWith(seoConfig.applications[app].path)
  );
  const appConfig = currentApp ? seoConfig.applications[currentApp] : null;
  
  // Construct final values with fallbacks
  const finalTitle = title || appConfig?.title || seoConfig.global.defaultTitle;
  const finalDescription = description || appConfig?.description || seoConfig.global.defaultDescription;
  const finalKeywords = keywords.length > 0 ? keywords : 
    [...(appConfig?.keywords || []), ...seoConfig.global.defaultKeywords];
  const finalImage = image || seoConfig.global.defaultImage;
  const finalUrl = url || \`\${seoConfig.global.siteUrl}\${router.asPath}\`;
  const finalLocale = locale || i18n.language || seoConfig.global.defaultLocale;
  const finalCanonical = canonical || finalUrl;
  
  // Format title with template
  const formattedTitle = finalTitle === seoConfig.global.defaultTitle 
    ? finalTitle 
    : seoConfig.global.titleTemplate.replace('%s', finalTitle);
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Robots Meta */}
      <meta 
        name="robots" 
        content={\`\${noindex ? 'noindex' : 'index'},\${nofollow ? 'nofollow' : 'follow'}\`} 
      />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content={finalLocale} />
      <link rel="alternate" hrefLang="x-default" href={seoConfig.global.siteUrl} />
      {seoConfig.global.supportedLocales.map(loc => (
        <link 
          key={loc}
          rel="alternate" 
          hrefLang={loc} 
          href={\`\${seoConfig.global.siteUrl}/\${loc !== 'en' ? loc + '/' : ''}\${router.asPath}\`} 
        />
      ))}
      
      {/* Author and Publication */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta name="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta name="article:modified_time" content={modifiedTime} />}
      
      {/* Theme and Brand */}
      <meta name="theme-color" content="#0066cc" />
      <meta name="msapplication-navbutton-color" content="#0066cc" />
      <meta name="apple-mobile-web-app-status-bar-style" content="#0066cc" />
      
      {/* Security */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
    </Head>
  );
};

export default MetaTagsManager;`;

    await fs.writeFile(path.join(seoPath, 'MetaTagsManager.tsx'), component);
}

async function createSEOHead(seoPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { MetaTagsManager } from './MetaTagsManager';
import { OpenGraph } from './OpenGraph';
import { TwitterCard } from './TwitterCard';
import { CanonicalManager } from './CanonicalManager';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  structuredData?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = (props) => {
  const { structuredData, ...metaProps } = props;
  
  return (
    <>
      <MetaTagsManager {...metaProps} />
      <OpenGraph {...metaProps} />
      <TwitterCard {...metaProps} />
      <CanonicalManager canonical={props.canonical} />
      
      {/* Structured Data */}
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData, null, 2)
            }}
          />
        </Head>
      )}
      
      {/* DNS Prefetch and Preconnect */}
      <Head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Resource Hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </Head>
    </>
  );
};

export default SEOHead;`;

    await fs.writeFile(path.join(seoPath, 'SEOHead.tsx'), component);
}

async function createOpenGraph(seoPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import seoConfig from '@/shared/config/seo.config';

interface OpenGraphProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const OpenGraph: React.FC<OpenGraphProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName,
  locale,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  // Get application configuration
  const currentApp = Object.keys(seoConfig.applications).find(app => 
    router.pathname.startsWith(seoConfig.applications[app].path)
  );
  const appConfig = currentApp ? seoConfig.applications[currentApp] : null;
  
  // Construct values with fallbacks
  const ogTitle = title || appConfig?.title || seoConfig.global.defaultTitle;
  const ogDescription = description || appConfig?.description || seoConfig.global.defaultDescription;
  const ogImage = image ? \`\${seoConfig.global.siteUrl}\${image}\` : 
    \`\${seoConfig.global.siteUrl}\${seoConfig.global.defaultImage}\`;
  const ogUrl = url || \`\${seoConfig.global.siteUrl}\${router.asPath}\`;
  const ogSiteName = siteName || seoConfig.global.organizationName;
  const ogLocale = locale || i18n.language || seoConfig.global.defaultLocale;
  
  return (
    <Head>
      {/* Open Graph Basic */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:locale" content={ogLocale.replace('-', '_')} />
      
      {/* Additional Open Graph Properties */}
      <meta property="og:image:alt" content={\`\${ogTitle} - \${ogSiteName}\`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      
      {/* Article-specific properties */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Alternate locales */}
      {seoConfig.global.supportedLocales
        .filter(loc => loc !== ogLocale)
        .map(loc => (
          <meta 
            key={loc}
            property="og:locale:alternate" 
            content={loc.replace('-', '_')} 
          />
        ))
      }
      
      {/* Facebook App ID (if available) */}
      {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && (
        <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID} />
      )}
    </Head>
  );
};

export default OpenGraph;`;

    await fs.writeFile(path.join(seoPath, 'OpenGraph.tsx'), component);
}

async function createTwitterCard(seoPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import seoConfig from '@/shared/config/seo.config';

interface TwitterCardProps {
  title?: string;
  description?: string;
  image?: string;
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  imageAlt?: string;
}

export const TwitterCard: React.FC<TwitterCardProps> = ({
  title,
  description,
  image,
  card = 'summary_large_image',
  site,
  creator,
  imageAlt
}) => {
  const router = useRouter();
  
  // Get application configuration
  const currentApp = Object.keys(seoConfig.applications).find(app => 
    router.pathname.startsWith(seoConfig.applications[app].path)
  );
  const appConfig = currentApp ? seoConfig.applications[currentApp] : null;
  
  // Construct values with fallbacks
  const twitterTitle = title || appConfig?.title || seoConfig.global.defaultTitle;
  const twitterDescription = description || appConfig?.description || seoConfig.global.defaultDescription;
  const twitterImage = image ? \`\${seoConfig.global.siteUrl}\${image}\` : 
    \`\${seoConfig.global.siteUrl}\${seoConfig.global.defaultImage}\`;
  const twitterSite = site || seoConfig.global.twitterHandle;
  const twitterImageAlt = imageAlt || \`\${twitterTitle} - \${seoConfig.global.organizationName}\`;
  
  return (
    <Head>
      {/* Twitter Card Basic */}
      <meta name="twitter:card" content={card} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:image:alt" content={twitterImageAlt} />
      
      {/* Twitter Site and Creator */}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {creator && <meta name="twitter:creator" content={creator} />}
      
      {/* Large Image Card Specific */}
      {card === 'summary_large_image' && (
        <>
          <meta name="twitter:image:width" content="1200" />
          <meta name="twitter:image:height" content="630" />
        </>
      )}
      
      {/* App Card Specific */}
      {card === 'app' && (
        <>
          {/* iOS */}
          {process.env.NEXT_PUBLIC_IOS_APP_ID && (
            <>
              <meta name="twitter:app:id:iphone" content={process.env.NEXT_PUBLIC_IOS_APP_ID} />
              <meta name="twitter:app:id:ipad" content={process.env.NEXT_PUBLIC_IOS_APP_ID} />
              <meta name="twitter:app:url:iphone" content={\`codai://\${router.asPath}\`} />
              <meta name="twitter:app:url:ipad" content={\`codai://\${router.asPath}\`} />
            </>
          )}
          
          {/* Android */}
          {process.env.NEXT_PUBLIC_ANDROID_APP_ID && (
            <>
              <meta name="twitter:app:id:googleplay" content={process.env.NEXT_PUBLIC_ANDROID_APP_ID} />
              <meta name="twitter:app:url:googleplay" content={\`codai://\${router.asPath}\`} />
            </>
          )}
        </>
      )}
    </Head>
  );
};

export default TwitterCard;`;

    await fs.writeFile(path.join(seoPath, 'TwitterCard.tsx'), component);
}

async function createCanonicalManager(seoPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import seoConfig from '@/shared/config/seo.config';

interface CanonicalManagerProps {
  canonical?: string;
  noindex?: boolean;
}

export const CanonicalManager: React.FC<CanonicalManagerProps> = ({
  canonical,
  noindex = false
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  // Construct canonical URL
  const getCanonicalUrl = () => {
    if (canonical) {
      return canonical.startsWith('http') ? canonical : \`\${seoConfig.global.siteUrl}\${canonical}\`;
    }
    
    // Remove query parameters and hash for canonical URL
    const cleanPath = router.asPath.split('?')[0].split('#')[0];
    
    // Handle localized paths
    const isDefaultLocale = i18n.language === seoConfig.global.defaultLocale;
    const localePath = isDefaultLocale ? cleanPath : \`/\${i18n.language}\${cleanPath}\`;
    
    return \`\${seoConfig.global.siteUrl}\${localePath}\`;
  };
  
  const canonicalUrl = getCanonicalUrl();
  
  return (
    <Head>
      {/* Canonical URL */}
      {!noindex && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Hreflang for internationalization */}
      {!noindex && (
        <>
          <link rel="alternate" hrefLang="x-default" href={seoConfig.global.siteUrl} />
          {seoConfig.global.supportedLocales.map(locale => {
            const isDefault = locale === seoConfig.global.defaultLocale;
            const cleanPath = router.asPath.split('?')[0].split('#')[0];
            const localizedPath = isDefault ? cleanPath : \`/\${locale}\${cleanPath}\`;
            const fullUrl = \`\${seoConfig.global.siteUrl}\${localizedPath}\`;
            
            return (
              <link 
                key={locale}
                rel="alternate" 
                hrefLang={locale} 
                href={fullUrl}
              />
            );
          })}
        </>
      )}
      
      {/* Prevent parameter-based duplicate content */}
      {router.query && Object.keys(router.query).length > 0 && !noindex && (
        <link rel="canonical" href={canonicalUrl} />
      )}
    </Head>
  );
};

export default CanonicalManager;`;

    await fs.writeFile(path.join(seoPath, 'CanonicalManager.tsx'), component);
}

async function createMetaTagsHook(seoPath) {
    const hook = `import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import seoConfig from '@/shared/config/seo.config';

interface UseMetaTagsOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

interface MetaTagsResult {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
  canonical: string;
  locale: string;
  formattedTitle: string;
  alternateLocales: Array<{ locale: string; url: string }>;
  robotsDirective: string;
}

export function useMetaTags(options: UseMetaTagsOptions = {}): MetaTagsResult {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    // Get current application configuration
    const currentApp = Object.keys(seoConfig.applications).find(app => 
      router.pathname.startsWith(seoConfig.applications[app].path)
    );
    const appConfig = currentApp ? seoConfig.applications[currentApp] : null;
    
    // Construct values with fallbacks
    const title = options.title || appConfig?.title || seoConfig.global.defaultTitle;
    const description = options.description || appConfig?.description || seoConfig.global.defaultDescription;
    const keywords = options.keywords?.length 
      ? options.keywords 
      : [...(appConfig?.keywords || []), ...seoConfig.global.defaultKeywords];
    const image = options.image || seoConfig.global.defaultImage;
    const locale = options.locale || i18n.language || seoConfig.global.defaultLocale;
    
    // URL construction
    const cleanPath = router.asPath.split('?')[0].split('#')[0];
    const url = options.url || \`\${seoConfig.global.siteUrl}\${cleanPath}\`;
    const canonical = url;
    
    // Title formatting
    const formattedTitle = title === seoConfig.global.defaultTitle 
      ? title 
      : seoConfig.global.titleTemplate.replace('%s', title);
    
    // Alternate locales
    const alternateLocales = seoConfig.global.supportedLocales.map(loc => ({
      locale: loc,
      url: \`\${seoConfig.global.siteUrl}\${loc !== seoConfig.global.defaultLocale ? '/' + loc : ''}\${cleanPath}\`
    }));
    
    // Robots directive
    const robotsDirective = \`\${options.noindex ? 'noindex' : 'index'},\${options.nofollow ? 'nofollow' : 'follow'}\`;
    
    return {
      title,
      description,
      keywords,
      image,
      url,
      canonical,
      locale,
      formattedTitle,
      alternateLocales,
      robotsDirective
    };
  }, [router.pathname, router.asPath, i18n.language, options]);
}

export default useMetaTags;`;

    await fs.writeFile(path.join(seoPath, 'useMetaTags.ts'), hook);
}

async function updateLayoutWithSEO(appPath, appName) {
    const layoutPath = path.join(appPath, 'src', 'components', 'layout', 'Layout.tsx');

    try {
        await fs.access(layoutPath);
        // Layout exists, read and update it
        let layoutContent = await fs.readFile(layoutPath, 'utf8');

        // Add SEO import if not present
        if (!layoutContent.includes('import { SEOHead }')) {
            layoutContent = `import { SEOHead } from '../seo/SEOHead';\n${layoutContent}`;
        }

        // Add SEOHead to layout if not present
        if (!layoutContent.includes('<SEOHead')) {
            layoutContent = layoutContent.replace(
                '<Head>',
                `<SEOHead 
        title={seoProps?.title}
        description={seoProps?.description}
        keywords={seoProps?.keywords}
        image={seoProps?.image}
        canonical={seoProps?.canonical}
        noindex={seoProps?.noindex}
        structuredData={seoProps?.structuredData}
      />
      <Head>`
            );
        }

        await fs.writeFile(layoutPath, layoutContent);

    } catch (error) {
        // Layout doesn't exist, create a basic one with SEO
        const layoutContent = `import React from 'react';
import { SEOHead } from '../seo/SEOHead';

interface LayoutProps {
  children: React.ReactNode;
  seoProps?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    canonical?: string;
    noindex?: boolean;
    structuredData?: object;
  };
}

export const Layout: React.FC<LayoutProps> = ({ children, seoProps }) => {
  return (
    <>
      <SEOHead 
        title={seoProps?.title}
        description={seoProps?.description}
        keywords={seoProps?.keywords}
        image={seoProps?.image}
        canonical={seoProps?.canonical}
        noindex={seoProps?.noindex}
        structuredData={seoProps?.structuredData}
      />
      {children}
    </>
  );
};

export default Layout;`;

        const layoutDir = path.dirname(layoutPath);
        await fs.mkdir(layoutDir, { recursive: true });
        await fs.writeFile(layoutPath, layoutContent);
    }
}