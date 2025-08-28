import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://codai.ro';
  const currentDate = new Date();
  const lastModified = currentDate.toISOString();

  // Main pages
  const mainPages = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/ecosystem`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/press`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/investors`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }
  ];

  // Project category pages
  const categoryPages = [
    {
      url: `${baseUrl}/projects/foundation-services`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/new-generation`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/infrastructure`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/specialized-services`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects/emerging-platforms`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ];

  // Individual project pages (based on our 42+ projects)
  const projectSlugs = [
    // Foundation Services
    'romai', 'memorai', 'bancai', 'studiai', 'conversai', 'controlai', 'creatai', 'deepai', 'expertai',

    // New Generation
    'financeai', 'gameai', 'healthai', 'legalai', 'marketai', 'mediaai', 'projectai', 'salesai', 'secureai',

    // Infrastructure  
    'socialai', 'travelai', 'voiceai', 'workflowai', 'analyticsai', 'cloudai', 'edgeai', 'federatedai',

    // Specialized Services
    'quantumai', 'blockchainai', 'iotai', 'roboticsai', 'autonomousai', 'biomedicai', 'climateai', 'energyai',

    // Emerging Platforms
    'metaverseai', 'neuralinterfaceai', 'spatialai', 'holographicai', 'cognitivearchai', 'consciousnessai',
    'syntheticai', 'hybridai', 'evolutionaryai', 'transcendentai'
  ];

  const projectPages = projectSlugs.map(slug => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Language alternate pages
  const languagePages = [
    {
      url: `${baseUrl}/ro`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ro/ecosystem`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ro/projects`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }
  ];

  // Documentation pages
  const docPages = [
    {
      url: `${baseUrl}/docs`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/docs/api`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/getting-started`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/docs/integration`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/docs/security`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }
  ];

  // Legal pages
  const legalPages = [
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/gdpr`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    }
  ];

  return [
    ...mainPages,
    ...categoryPages,
    ...projectPages,
    ...languagePages,
    ...docPages,
    ...legalPages
  ];
}