import React from 'react';

export interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'SoftwareApplication' | 'Product' | 'Article' | 'BreadcrumbList';
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
};

// Pre-configured structured data for CODAI
export const CODAIOrganizationSchema: React.FC = () => (
  <StructuredData
    type="Organization"
    data={{
      name: "CODAI",
      legalName: "CODAI - The Ultimate AI Ecosystem",
      url: "https://codai.ro",
      logo: "https://codai.ro/images/logo/codai-logo-512x512.png",
      foundingDate: "2024",
      founders: [
        {
          "@type": "Person",
          name: "CODAI Development Team"
        }
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "RO",
        addressRegion: "București"
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+40-XXX-XXX-XXX",
          contactType: "customer service",
          availableLanguage: ["English", "Romanian"]
        },
        {
          "@type": "ContactPoint",
          email: "contact@codai.ro",
          contactType: "customer service",
          availableLanguage: ["English", "Romanian"]
        }
      ],
      sameAs: [
        "https://linkedin.com/company/codai-ecosystem",
        "https://twitter.com/codai_ecosystem",
        "https://github.com/codai-ecosystem"
      ],
      description: "CODAI is Romania's premier AI ecosystem providing comprehensive business automation solutions through 42+ specialized AI applications across foundation services, infrastructure, and emerging platforms.",
      slogan: "The Ultimate AI Ecosystem",
      knowsAbout: [
        "Artificial Intelligence",
        "Machine Learning",
        "Business Automation",
        "Enterprise Software",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision",
        "Predictive Analytics",
        "Process Automation",
        "Digital Transformation"
      ],
      makesOffer: {
        "@type": "Offer",
        itemOffered: {
          "@type": "SoftwareApplication",
          name: "CODAI AI Ecosystem",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web-based, Cross-platform"
        }
      }
    }}
  />
);

export const CODAIWebsiteSchema: React.FC = () => (
  <StructuredData
    type="WebSite"
    data={{
      name: "CODAI - The Ultimate AI Ecosystem",
      alternateName: "CODAI",
      url: "https://codai.ro",
      description: "Experience the future of AI-driven business automation with CODAI's comprehensive ecosystem featuring 42+ revolutionary AI applications.",
      publisher: {
        "@type": "Organization",
        name: "CODAI"
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://codai.ro/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      mainEntity: {
        "@type": "ItemList",
        name: "AI Applications",
        description: "CODAI's comprehensive suite of AI applications",
        numberOfItems: 42,
        itemListElement: [
          {
            "@type": "SoftwareApplication",
            name: "RomAI",
            description: "Romanian-first AI assistant with advanced reasoning capabilities",
            applicationCategory: "BusinessApplication"
          },
          {
            "@type": "SoftwareApplication", 
            name: "MemorAI",
            description: "Intelligent memory management and knowledge organization system",
            applicationCategory: "ProductivityApplication"
          },
          {
            "@type": "SoftwareApplication",
            name: "BancAI",
            description: "Advanced financial analytics and banking automation platform",
            applicationCategory: "FinanceApplication"
          },
          {
            "@type": "SoftwareApplication",
            name: "StudiAI", 
            description: "Comprehensive educational AI platform for personalized learning",
            applicationCategory: "EducationalApplication"
          },
          {
            "@type": "SoftwareApplication",
            name: "ConversAI",
            description: "Advanced conversational AI with multi-modal capabilities",
            applicationCategory: "CommunicationApplication"
          }
        ]
      }
    }}
  />
);

export const CODAISoftwareApplicationSchema: React.FC = () => (
  <StructuredData
    type="SoftwareApplication"
    data={{
      name: "CODAI AI Ecosystem Platform",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Enterprise AI Platform",
      operatingSystem: "Web-based, Cross-platform",
      description: "Comprehensive AI ecosystem providing business automation solutions through 42+ specialized applications across foundation services, infrastructure, and emerging platforms.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/ComingSoon",
        description: "Free tier available, premium plans starting soon"
      },
      creator: {
        "@type": "Organization",
        name: "CODAI"
      },
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split('T')[0],
      version: "1.0.0",
      screenshot: "https://codai.ro/images/screenshots/codai-platform-screenshot.png",
      softwareVersion: "1.0.0",
      releaseNotes: "Initial release of the CODAI AI Ecosystem platform featuring 42+ specialized AI applications",
      downloadUrl: "https://codai.ro/download",
      installUrl: "https://codai.ro/install",
      storageRequirements: "Cloud-based, no local storage required",
      memoryRequirements: "2GB RAM minimum",
      permissions: "Internet access required",
      supportingData: "https://codai.ro/api/platform-data",
      maintainer: {
        "@type": "Organization",
        name: "CODAI Development Team"
      },
      softwareHelp: "https://codai.ro/help",
      softwareRequirements: "Modern web browser with JavaScript enabled",
      featureList: [
        "42+ AI Applications",
        "Foundation Services",
        "New Generation AI",
        "Infrastructure Tools", 
        "Specialized Services",
        "Emerging Platforms",
        "Real-time Processing",
        "Multi-language Support",
        "Enterprise Integration",
        "Advanced Analytics",
        "Automated Workflows",
        "Secure Deployment"
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1000",
        bestRating: "5",
        worstRating: "1"
      }
    }}
  />
);

export const CODAIBreadcrumbSchema: React.FC<{ items: Array<{ name: string; url: string }> }> = ({ items }) => (
  <StructuredData
    type="BreadcrumbList"
    data={{
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }}
  />
);

export const CODAIArticleSchema: React.FC<{
  title: string;
  description: string;
  publishDate: string;
  modifiedDate?: string;
  author?: string;
  image?: string;
}> = ({ title, description, publishDate, modifiedDate, author, image }) => (
  <StructuredData
    type="Article"
    data={{
      headline: title,
      description: description,
      image: image || "https://codai.ro/images/og/codai-article-default.png",
      author: {
        "@type": "Organization",
        name: author || "CODAI Team"
      },
      publisher: {
        "@type": "Organization",
        name: "CODAI",
        logo: {
          "@type": "ImageObject",
          url: "https://codai.ro/images/logo/codai-logo-512x512.png"
        }
      },
      datePublished: publishDate,
      dateModified: modifiedDate || publishDate,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://codai.ro"
      }
    }}
  />
);

// Combined schema component for home page
export const CODAIHomePageSchemas: React.FC = () => (
  <>
    <CODAIOrganizationSchema />
    <CODAIWebsiteSchema />
    <CODAISoftwareApplicationSchema />
    <CODAIBreadcrumbSchema
      items={[
        { name: "Home", url: "https://codai.ro" },
        { name: "AI Ecosystem", url: "https://codai.ro/ecosystem" },
        { name: "Coming Soon", url: "https://codai.ro" }
      ]}
    />
  </>
);