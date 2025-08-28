import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export const DynamicMetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords = [],
  image = '/images/og/codai-ecosystem-og-image.png',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'CODAI Development Team',
  section,
  tags = []
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  
  const baseUrl = 'https://codai.ro';
  const currentUrl = url || `${baseUrl}${router.asPath}`;
  const currentLang = i18n.language || 'en';
  
  const defaultTitle = 'CODAI - The Ultimate AI Ecosystem';
  const defaultDescription = 'Experience the future of AI-driven business automation with CODAI\'s comprehensive ecosystem featuring 42+ revolutionary AI applications.';
  
  const finalTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = [
    ...keywords,
    'CODAI', 'AI ecosystem', 'artificial intelligence', 'business automation',
    'machine learning', 'deep learning', 'enterprise AI', 'Romanian AI innovation'
  ];

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="language" content={currentLang} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Language Alternates */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${router.asPath}`} />
      <link rel="alternate" hrefLang="ro" href={`${baseUrl}/ro${router.asPath}`} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="CODAI - The Ultimate AI Ecosystem" />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:locale" content={currentLang === 'ro' ? 'ro_RO' : 'en_US'} />
      <meta property="og:locale:alternate" content={currentLang === 'ro' ? 'en_US' : 'ro_RO'} />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@codai_ecosystem" />
      <meta name="twitter:creator" content="@codai_ecosystem" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />
      <meta name="twitter:image:alt" content={finalTitle} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no, address=no, email=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="CODAI" />
      <meta name="application-name" content="CODAI" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="msapplication-TileImage" content="/icons/mstile-144x144.png" />
      <meta name="theme-color" content="#6366f1" />
      <meta name="color-scheme" content="dark light" />
      
      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.codai.ro" />
      <link rel="preconnect" href="https://cdn.codai.ro" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//api.codai.ro" />
      <link rel="dns-prefetch" href="//cdn.codai.ro" />
      <link rel="dns-prefetch" href="//analytics.google.com" />
      
      {/* Favicons and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
      <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-touch-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-touch-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
      <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#6366f1" />
      
      {/* PWA Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* RSS and Atom Feeds */}
      <link rel="alternate" type="application/rss+xml" title="CODAI Blog RSS Feed" href="/blog/rss.xml" />
      <link rel="alternate" type="application/atom+xml" title="CODAI Blog Atom Feed" href="/blog/atom.xml" />
      
      {/* Search Engine Verification */}
      {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
      )}
      {process.env.NEXT_PUBLIC_BING_VERIFICATION && (
        <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION} />
      )}
      {process.env.NEXT_PUBLIC_YANDEX_VERIFICATION && (
        <meta name="yandex-verification" content={process.env.NEXT_PUBLIC_YANDEX_VERIFICATION} />
      )}
      {process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION && (
        <meta name="facebook-domain-verification" content={process.env.NEXT_PUBLIC_FACEBOOK_VERIFICATION} />
      )}
    </Head>
  );
};

// Hook for dynamic meta tag management
export const useDynamicMeta = (metaProps: MetaTagsProps) => {
  return <DynamicMetaTags {...metaProps} />;
};

// Pre-configured meta tag components for common pages
export const HomePageMeta: React.FC = () => (
  <DynamicMetaTags
    title="Revolutionary AI Ecosystem Coming Soon"
    description="Experience the future of AI-driven business automation with CODAI's comprehensive ecosystem featuring 42+ revolutionary AI applications across foundation services, infrastructure, and emerging platforms."
    keywords={[
      'AI ecosystem', 'coming soon', 'artificial intelligence platform', 
      'business automation', 'Romanian AI innovation', 'enterprise AI solutions'
    ]}
    type="website"
    section="Home"
    tags={['ai-ecosystem', 'business-automation', 'enterprise-ai']}
  />
);

export const ProjectsPageMeta: React.FC = () => (
  <DynamicMetaTags
    title="42+ AI Applications & Projects"
    description="Explore CODAI's comprehensive portfolio of AI applications organized across 5 specialized categories: Foundation Services, New Generation AI, Infrastructure, Specialized Services, and Emerging Platforms."
    keywords={[
      'AI applications', 'machine learning projects', 'AI tools', 
      'foundation services', 'specialized AI', 'emerging platforms'
    ]}
    type="website"
    section="Projects"
    tags={['ai-applications', 'machine-learning', 'ai-tools']}
  />
);

export const EcosystemPageMeta: React.FC = () => (
  <DynamicMetaTags
    title="AI Ecosystem Overview & Architecture"
    description="Discover how CODAI's integrated AI ecosystem connects 42+ applications through intelligent orchestration, shared infrastructure, and unified data flows."
    keywords={[
      'AI ecosystem architecture', 'integrated AI platform', 'AI orchestration', 
      'unified AI services', 'enterprise AI infrastructure'
    ]}
    type="website"
    section="Ecosystem"
    tags={['ai-ecosystem', 'architecture', 'integration']}
  />
);