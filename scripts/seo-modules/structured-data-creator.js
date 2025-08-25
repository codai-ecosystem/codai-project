/**
 * Structured Data Creator Module
 * 
 * Implements comprehensive structured data (JSON-LD) with:
 * - Organization schema
 * - Software application schema
 * - Article and blog post schemas
 * - Breadcrumb navigation
 * - FAQ and Q&A schemas
 * - Product and service schemas
 */

import { promises as fs } from 'fs';
import path from 'path';

export async function applySEOEnhancement(appPath, appName) {
    console.log(`      📊 Implementing structured data for ${appName}...`);

    try {
        // Create structured data directory
        const structuredDataPath = path.join(appPath, 'src', 'components', 'seo', 'structured-data');
        await fs.mkdir(structuredDataPath, { recursive: true });

        // Create structured data components
        await createSchemaOrganization(structuredDataPath);
        await createSchemaSoftwareApplication(structuredDataPath);
        await createSchemaArticle(structuredDataPath);
        await createSchemaBreadcrumb(structuredDataPath);
        await createSchemaFAQ(structuredDataPath);
        await createSchemaProduct(structuredDataPath);
        await createStructuredDataManager(structuredDataPath);

        // Create structured data hooks
        await createStructuredDataHook(structuredDataPath);

        console.log(`      ✅ Structured data implemented for ${appName}`);

    } catch (error) {
        console.error(`      ❌ Failed to implement structured data for ${appName}:`, error.message);
        throw error;
    }
}

async function createSchemaOrganization(structuredDataPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import seoConfig from '@/shared/config/seo.config';

interface SchemaOrganizationProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
  sameAs?: string[];
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

export const SchemaOrganization: React.FC<SchemaOrganizationProps> = ({
  name,
  url,
  logo,
  description,
  contactPoint,
  sameAs,
  address
}) => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name || seoConfig.schemas.organization.name,
    url: url || seoConfig.schemas.organization.url,
    logo: logo || seoConfig.schemas.organization.logo,
    description: description || seoConfig.global.defaultDescription,
    sameAs: sameAs || seoConfig.schemas.organization.sameAs,
    ...(contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: contactPoint.telephone,
        email: contactPoint.email,
        contactType: contactPoint.contactType || 'customer service'
      }
    }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress,
        addressLocality: address.addressLocality,
        addressRegion: address.addressRegion,
        postalCode: address.postalCode,
        addressCountry: address.addressCountry
      }
    })
  };
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema, null, 2)
        }}
      />
    </Head>
  );
};

export default SchemaOrganization;`;

    await fs.writeFile(path.join(structuredDataPath, 'SchemaOrganization.tsx'), component);
}

async function createSchemaSoftwareApplication(structuredDataPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import seoConfig from '@/shared/config/seo.config';

interface SchemaSoftwareApplicationProps {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  price?: string;
  priceCurrency?: string;
  author?: {
    name: string;
    url?: string;
  };
  version?: string;
  releaseNotes?: string;
  screenshot?: string[];
  featureList?: string[];
  requirements?: string;
}

export const SchemaSoftwareApplication: React.FC<SchemaSoftwareApplicationProps> = ({
  name,
  description,
  url,
  applicationCategory,
  operatingSystem,
  price,
  priceCurrency,
  author,
  version,
  releaseNotes,
  screenshot,
  featureList,
  requirements
}) => {
  const router = useRouter();
  
  // Get current application configuration
  const currentApp = Object.keys(seoConfig.applications).find(app => 
    router.pathname.startsWith(seoConfig.applications[app].path)
  );
  const appConfig = currentApp ? seoConfig.applications[currentApp] : null;
  
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name || appConfig?.title || seoConfig.global.defaultTitle,
    description: description || appConfig?.description || seoConfig.global.defaultDescription,
    url: url || \`\${seoConfig.global.siteUrl}\${router.asPath}\`,
    applicationCategory: applicationCategory || seoConfig.schemas.software.applicationCategory,
    operatingSystem: operatingSystem || seoConfig.schemas.software.operatingSystem,
    offers: {
      '@type': 'Offer',
      price: price || seoConfig.schemas.software.offers.price,
      priceCurrency: priceCurrency || seoConfig.schemas.software.offers.priceCurrency
    },
    author: author || {
      '@type': 'Organization',
      name: seoConfig.schemas.organization.name,
      url: seoConfig.schemas.organization.url
    },
    ...(version && { version }),
    ...(releaseNotes && { releaseNotes }),
    ...(screenshot && { screenshot }),
    ...(featureList && { featureList }),
    ...(requirements && { requirements })
  };
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema, null, 2)
        }}
      />
    </Head>
  );
};

export default SchemaSoftwareApplication;`;

    await fs.writeFile(path.join(structuredDataPath, 'SchemaSoftwareApplication.tsx'), component);
}

async function createSchemaArticle(structuredDataPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import seoConfig from '@/shared/config/seo.config';

interface SchemaArticleProps {
  headline?: string;
  description?: string;
  image?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
  };
  datePublished?: string;
  dateModified?: string;
  wordCount?: number;
  articleSection?: string;
  keywords?: string[];
  inLanguage?: string;
}

export const SchemaArticle: React.FC<SchemaArticleProps> = ({
  headline,
  description,
  image,
  author,
  publisher,
  datePublished,
  dateModified,
  wordCount,
  articleSection,
  keywords,
  inLanguage
}) => {
  const router = useRouter();
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline || 'Article',
    description: description || seoConfig.global.defaultDescription,
    image: image ? \`\${seoConfig.global.siteUrl}\${image}\` : \`\${seoConfig.global.siteUrl}\${seoConfig.global.defaultImage}\`,
    url: \`\${seoConfig.global.siteUrl}\${router.asPath}\`,
    author: author || {
      '@type': 'Organization',
      name: seoConfig.schemas.organization.name,
      url: seoConfig.schemas.organization.url
    },
    publisher: publisher || {
      '@type': 'Organization',
      name: seoConfig.schemas.organization.name,
      logo: {
        '@type': 'ImageObject',
        url: seoConfig.schemas.organization.logo
      }
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    ...(wordCount && { wordCount }),
    ...(articleSection && { articleSection }),
    ...(keywords && { keywords }),
    inLanguage: inLanguage || seoConfig.global.defaultLocale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': \`\${seoConfig.global.siteUrl}\${router.asPath}\`
    }
  };
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema, null, 2)
        }}
      />
    </Head>
  );
};

export default SchemaArticle;`;

    await fs.writeFile(path.join(structuredDataPath, 'SchemaArticle.tsx'), component);
}

async function createSchemaBreadcrumb(structuredDataPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import seoConfig from '@/shared/config/seo.config';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SchemaBreadcrumbProps {
  items?: BreadcrumbItem[];
}

export const SchemaBreadcrumb: React.FC<SchemaBreadcrumbProps> = ({ items }) => {
  const router = useRouter();
  
  // Generate breadcrumbs from router if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;
    
    const pathSegments = router.asPath.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', url: seoConfig.global.siteUrl }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += \`/\${segment}\`;
      
      // Get application name from configuration
      const appConfig = Object.entries(seoConfig.applications).find(([key, config]) => 
        config.path === currentPath
      );
      
      const name = appConfig ? appConfig[1].title : 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        name,
        url: \`\${seoConfig.global.siteUrl}\${currentPath}\`
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = generateBreadcrumbs();
  
  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for home page only
  }
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2)
        }}
      />
    </Head>
  );
};

export default SchemaBreadcrumb;`;

    await fs.writeFile(path.join(structuredDataPath, 'SchemaBreadcrumb.tsx'), component);
}

async function createSchemaFAQ(structuredDataPath) {
    const component = `import React from 'react';
import Head from 'next/head';

interface FAQItem {
  question: string;
  answer: string;
}

interface SchemaFAQProps {
  faqs: FAQItem[];
}

export const SchemaFAQ: React.FC<SchemaFAQProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }
  
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema, null, 2)
        }}
      />
    </Head>
  );
};

export default SchemaFAQ;`;

    await fs.writeFile(path.join(structuredDataPath, 'SchemaFAQ.tsx'), component);
}

async function createSchemaProduct(structuredDataPath) {
    const component = `import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import seoConfig from '@/shared/config/seo.config';

interface ProductOffer {
  price: string;
  priceCurrency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  validFrom?: string;
  validThrough?: string;
}

interface ProductReview {
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: number;
}

interface SchemaProductProps {
  name?: string;
  description?: string;
  image?: string[];
  brand?: string;
  sku?: string;
  mpn?: string;
  category?: string;
  offers?: ProductOffer;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  reviews?: ProductReview[];
  additionalProperty?: Array<{
    name: string;
    value: string;
  }>;
}

export const SchemaProduct: React.FC<SchemaProductProps> = ({
  name,
  description,
  image,
  brand,
  sku,
  mpn,
  category,
  offers,
  aggregateRating,
  reviews,
  additionalProperty
}) => {
  const router = useRouter();
  
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name || 'Product',
    description: description || seoConfig.global.defaultDescription,
    image: image?.map(img => \`\${seoConfig.global.siteUrl}\${img}\`) || [\`\${seoConfig.global.siteUrl}\${seoConfig.global.defaultImage}\`],
    brand: brand || seoConfig.schemas.organization.name,
    url: \`\${seoConfig.global.siteUrl}\${router.asPath}\`,
    ...(sku && { sku }),
    ...(mpn && { mpn }),
    ...(category && { category }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
        availability: \`https://schema.org/\${offers.availability}\`,
        url: \`\${seoConfig.global.siteUrl}\${router.asPath}\`,
        seller: {
          '@type': 'Organization',
          name: seoConfig.schemas.organization.name
        },
        ...(offers.validFrom && { validFrom: offers.validFrom }),
        ...(offers.validThrough && { validThrough: offers.validThrough })
      }
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount
      }
    }),
    ...(reviews && {
      review: reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author
        },
        datePublished: review.datePublished,
        reviewBody: review.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.reviewRating
        }
      }))
    }),
    ...(additionalProperty && { additionalProperty })
  };
  
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema, null, 2)
        }}
      />
    </Head>
  );
};

export default SchemaProduct;`;

    await fs.writeFile(path.join(structuredDataPath, 'SchemaProduct.tsx'), component);
}

async function createStructuredDataManager(structuredDataPath) {
    const component = `import React from 'react';
import { SchemaOrganization } from './SchemaOrganization';
import { SchemaSoftwareApplication } from './SchemaSoftwareApplication';
import { SchemaArticle } from './SchemaArticle';
import { SchemaBreadcrumb } from './SchemaBreadcrumb';
import { SchemaFAQ } from './SchemaFAQ';
import { SchemaProduct } from './SchemaProduct';

interface StructuredDataManagerProps {
  type: 'organization' | 'software' | 'article' | 'breadcrumb' | 'faq' | 'product';
  data: any;
}

export const StructuredDataManager: React.FC<StructuredDataManagerProps> = ({ type, data }) => {
  switch (type) {
    case 'organization':
      return <SchemaOrganization {...data} />;
    case 'software':
      return <SchemaSoftwareApplication {...data} />;
    case 'article':
      return <SchemaArticle {...data} />;
    case 'breadcrumb':
      return <SchemaBreadcrumb {...data} />;
    case 'faq':
      return <SchemaFAQ {...data} />;
    case 'product':
      return <SchemaProduct {...data} />;
    default:
      return null;
  }
};

export default StructuredDataManager;`;

    await fs.writeFile(path.join(structuredDataPath, 'StructuredDataManager.tsx'), component);
}

async function createStructuredDataHook(structuredDataPath) {
    const hook = `import { useMemo } from 'react';
import { useRouter } from 'next/router';
import seoConfig from '@/shared/config/seo.config';

export function useStructuredData(type: string, data: any = {}) {
  const router = useRouter();
  
  return useMemo(() => {
    const baseUrl = seoConfig.global.siteUrl;
    const currentUrl = \`\${baseUrl}\${router.asPath}\`;
    
    // Get current application configuration
    const currentApp = Object.keys(seoConfig.applications).find(app => 
      router.pathname.startsWith(seoConfig.applications[app].path)
    );
    const appConfig = currentApp ? seoConfig.applications[currentApp] : null;
    
    switch (type) {
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: seoConfig.schemas.organization.name,
          url: seoConfig.schemas.organization.url,
          logo: seoConfig.schemas.organization.logo,
          sameAs: seoConfig.schemas.organization.sameAs,
          ...data
        };
        
      case 'software':
        return {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: appConfig?.title || seoConfig.global.defaultTitle,
          description: appConfig?.description || seoConfig.global.defaultDescription,
          url: currentUrl,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
          },
          author: {
            '@type': 'Organization',
            name: seoConfig.schemas.organization.name,
            url: seoConfig.schemas.organization.url
          },
          ...data
        };
        
      case 'breadcrumb':
        const pathSegments = router.asPath.split('/').filter(Boolean);
        const breadcrumbs = [
          { name: 'Home', url: baseUrl }
        ];
        
        let currentPath = '';
        pathSegments.forEach((segment) => {
          currentPath += \`/\${segment}\`;
          const appConfig = Object.entries(seoConfig.applications).find(([key, config]) => 
            config.path === currentPath
          );
          const name = appConfig ? appConfig[1].title : 
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          breadcrumbs.push({ name, url: \`\${baseUrl}\${currentPath}\` });
        });
        
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
          })),
          ...data
        };
        
      default:
        return data;
    }
  }, [type, data, router.asPath, router.pathname]);
}

export default useStructuredData;`;

    await fs.writeFile(path.join(structuredDataPath, 'useStructuredData.ts'), hook);
}