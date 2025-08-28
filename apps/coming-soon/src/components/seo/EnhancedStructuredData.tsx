import { codaiProjects, getProjectsByTier } from '@/data/projects'

interface StructuredDataProps {
    type: 'home' | 'projects' | 'about' | 'contact'
}

export default function EnhancedStructuredData({ type }: StructuredDataProps) {
    const getStructuredData = () => {
        const baseUrl = 'https://codai.ro'
        const currentDate = new Date().toISOString()

        switch (type) {
            case 'home':
                return {
                    '@context': 'https://schema.org',
                    '@graph': [
                        // Organization Schema
                        {
                            '@type': 'Organization',
                            '@id': `${baseUrl}/#organization`,
                            name: 'CODAI',
                            alternateName: 'CODAI Ecosystem',
                            description: 'The Ultimate AI Ecosystem with 42+ specialized applications for comprehensive business automation and digital transformation.',
                            url: baseUrl,
                            logo: {
                                '@type': 'ImageObject',
                                '@id': `${baseUrl}/#logo`,
                                url: `${baseUrl}/images/brand/codai-logo-og.png`,
                                caption: 'CODAI Logo',
                                width: 512,
                                height: 512
                            },
                            image: {
                                '@id': `${baseUrl}/#logo`
                            },
                            foundingDate: '2024',
                            foundingLocation: {
                                '@type': 'Place',
                                name: 'Romania',
                                address: {
                                    '@type': 'PostalAddress',
                                    addressCountry: 'RO',
                                    addressLocality: 'Bucharest'
                                }
                            },
                            areaServed: [
                                {
                                    '@type': 'Country',
                                    name: 'Romania'
                                },
                                {
                                    '@type': 'Continent',
                                    name: 'Europe'
                                },
                                {
                                    '@type': 'Place',
                                    name: 'Global'
                                }
                            ],
                            knowsAbout: [
                                'Artificial Intelligence',
                                'Machine Learning',
                                'Business Automation',
                                'Enterprise Software',
                                'Digital Transformation',
                                'Romanian AI Innovation',
                                'Natural Language Processing',
                                'Computer Vision',
                                'Deep Learning',
                                'Neural Networks'
                            ],
                            memberOf: [
                                {
                                    '@type': 'Organization',
                                    name: 'European AI Alliance',
                                    url: 'https://digital-strategy.ec.europa.eu/en/policies/european-ai-alliance'
                                }
                            ],
                            sameAs: [
                                'https://linkedin.com/company/codai-ecosystem',
                                'https://github.com/codai-ecosystem',
                                'https://twitter.com/codai_ecosystem'
                            ],
                            contactPoint: [
                                {
                                    '@type': 'ContactPoint',
                                    contactType: 'customer support',
                                    email: 'contact@codai.dev',
                                    availableLanguage: ['en', 'ro']
                                },
                                {
                                    '@type': 'ContactPoint',
                                    contactType: 'technical support',
                                    email: 'support@codai.dev',
                                    availableLanguage: ['en', 'ro']
                                },
                                {
                                    '@type': 'ContactPoint',
                                    contactType: 'sales',
                                    email: 'enterprise@codai.dev',
                                    availableLanguage: ['en', 'ro']
                                }
                            ]
                        },

                        // WebSite Schema
                        {
                            '@type': 'WebSite',
                            '@id': `${baseUrl}/#website`,
                            name: 'CODAI - The Ultimate AI Ecosystem',
                            description: 'Revolutionary AI ecosystem with 42+ specialized applications for comprehensive business automation.',
                            url: baseUrl,
                            publisher: {
                                '@id': `${baseUrl}/#organization`
                            },
                            potentialAction: [
                                {
                                    '@type': 'SearchAction',
                                    target: {
                                        '@type': 'EntryPoint',
                                        urlTemplate: `${baseUrl}/search?q={search_term_string}`
                                    },
                                    'query-input': 'required name=search_term_string'
                                }
                            ],
                            inLanguage: ['en-US', 'ro-RO']
                        },

                        // WebPage Schema for Homepage
                        {
                            '@type': 'WebPage',
                            '@id': `${baseUrl}/#webpage`,
                            url: baseUrl,
                            name: 'CODAI - Revolutionary AI Ecosystem Coming Soon',
                            description: 'Experience the future of AI-driven business automation with 42+ specialized applications launching soon.',
                            isPartOf: {
                                '@id': `${baseUrl}/#website`
                            },
                            about: {
                                '@id': `${baseUrl}/#organization`
                            },
                            datePublished: '2025-01-01T00:00:00Z',
                            dateModified: currentDate,
                            breadcrumb: {
                                '@type': 'BreadcrumbList',
                                itemListElement: [
                                    {
                                        '@type': 'ListItem',
                                        position: 1,
                                        name: 'Home',
                                        item: baseUrl
                                    }
                                ]
                            },
                            mainEntity: {
                                '@id': `${baseUrl}/#organization`
                            }
                        },

                        // SoftwareApplication Schema for CODAI Platform
                        {
                            '@type': 'SoftwareApplication',
                            '@id': `${baseUrl}/#software`,
                            name: 'CODAI Platform',
                            applicationCategory: 'BusinessApplication',
                            applicationSubCategory: 'Artificial Intelligence Platform',
                            description: 'Comprehensive AI ecosystem with 42+ specialized applications for business automation, digital transformation, and enterprise intelligence.',
                            operatingSystem: ['Web Browser', 'Windows', 'macOS', 'Linux', 'iOS', 'Android'],
                            url: baseUrl,
                            publisher: {
                                '@id': `${baseUrl}/#organization`
                            },
                            offers: [
                                {
                                    '@type': 'Offer',
                                    name: 'CODAI Foundation Tier',
                                    description: 'Core AI services including RomAI, MemorAI, and BancAI',
                                    category: 'Foundation Services',
                                    availability: 'https://schema.org/ComingSoon',
                                    priceSpecification: {
                                        '@type': 'PriceSpecification',
                                        price: '0',
                                        priceCurrency: 'EUR',
                                        description: 'Free tier available'
                                    }
                                },
                                {
                                    '@type': 'Offer',
                                    name: 'CODAI Enterprise',
                                    description: 'Complete enterprise AI solution with all 42+ applications',
                                    category: 'Enterprise Solution',
                                    availability: 'https://schema.org/ComingSoon',
                                    eligibilityToWorkFrom: 'Anywhere'
                                }
                            ],
                            featureList: [
                                'Natural Language Processing',
                                'Computer Vision',
                                'Machine Learning Models',
                                'Business Process Automation',
                                'Predictive Analytics',
                                'Real-time Data Processing',
                                'Multi-language Support',
                                'GDPR Compliance',
                                'Enterprise Security',
                                'API Integration',
                                'Cloud Deployment',
                                'On-premise Installation'
                            ],
                            screenshot: `${baseUrl}/images/screenshots/codai-platform-overview.png`,
                            softwareVersion: '1.0.0',
                            releaseNotes: 'Initial release featuring 42+ specialized AI applications',
                            downloadUrl: baseUrl,
                            installUrl: baseUrl,
                            storageRequirements: '1GB',
                            memoryRequirements: '4GB RAM',
                            processorRequirements: 'Modern multi-core processor',
                            supportingData: {
                                '@type': 'DataFeed',
                                name: 'CODAI Platform Analytics',
                                description: 'Real-time performance and usage analytics'
                            }
                        },

                        // FAQPage Schema
                        {
                            '@type': 'FAQPage',
                            '@id': `${baseUrl}/#faq`,
                            mainEntity: [
                                {
                                    '@type': 'Question',
                                    name: 'What is CODAI?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'CODAI is a comprehensive AI ecosystem featuring 42+ specialized applications designed for business automation, digital transformation, and enterprise intelligence. Our platform combines Romanian innovation with global AI excellence.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    name: 'How many AI applications does CODAI include?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'CODAI includes 42+ specialized AI applications organized across 5 categories: Foundation Services (8 apps), New Generation AI (10 apps), AI Infrastructure (8 apps), Specialized AI Services (10 apps), and Emerging AI Platforms (6+ apps).'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    name: 'When will CODAI be available?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'CODAI is launching in 2025. Early access programs and beta testing opportunities will be announced through our newsletter and social media channels.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    name: 'Is CODAI suitable for enterprises?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'Yes, CODAI is specifically designed for enterprise use with SOC 2 certification, ISO 27001 compliance, GDPR compliance, and enterprise-grade security features. We offer comprehensive deployment options including cloud, hybrid, and on-premise installations.'
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    name: 'What makes CODAI different from other AI platforms?',
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: 'CODAI stands out through its comprehensive ecosystem approach with 42+ specialized applications, Romanian AI innovation excellence, enterprise-grade security, multi-language support, and seamless integration capabilities across all business functions.'
                                    }
                                }
                            ]
                        }
                    ]
                }

            case 'projects':
                const tierData = [1, 2, 3, 4, 5].map(tier => ({
                    tier,
                    projects: getProjectsByTier(tier),
                    count: getProjectsByTier(tier).length
                }))

                return {
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    '@id': `${baseUrl}/projects`,
                    name: 'CODAI AI Applications & Projects',
                    description: 'Comprehensive overview of 42+ AI applications across 5 specialized categories.',
                    url: `${baseUrl}/projects`,
                    mainEntity: {
                        '@type': 'ItemList',
                        name: 'CODAI AI Applications',
                        description: 'Complete collection of CODAI\'s specialized AI applications',
                        numberOfItems: codaiProjects.length,
                        itemListOrder: 'https://schema.org/ItemListOrderAscending',
                        itemListElement: codaiProjects.slice(0, 20).map((project, index) => ({
                            '@type': 'ListItem',
                            position: index + 1,
                            item: {
                                '@type': 'SoftwareApplication',
                                name: project.name,
                                description: project.description,
                                applicationCategory: 'BusinessApplication',
                                applicationSubCategory: project.category,
                                url: `${baseUrl}/projects#${project.name.toLowerCase().replace(/\s+/g, '-')}`,
                                publisher: {
                                    '@id': `${baseUrl}/#organization`
                                },
                                offers: {
                                    '@type': 'Offer',
                                    availability: 'https://schema.org/ComingSoon',
                                    category: `Tier ${project.tier}`
                                }
                            }
                        }))
                    },
                    breadcrumb: {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: baseUrl
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: 'Projects',
                                item: `${baseUrl}/projects`
                            }
                        ]
                    }
                }

            case 'about':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    '@id': `${baseUrl}/about`,
                    name: 'About CODAI - Romanian AI Innovation Excellence',
                    description: 'Learn about CODAI\'s mission, vision, and commitment to revolutionizing business automation through comprehensive AI solutions.',
                    url: `${baseUrl}/about`,
                    mainEntity: {
                        '@id': `${baseUrl}/#organization`
                    },
                    about: [
                        {
                            '@type': 'Thing',
                            name: 'Artificial Intelligence Innovation',
                            description: 'CODAI\'s approach to revolutionary AI development and deployment'
                        },
                        {
                            '@type': 'Thing',
                            name: 'Romanian Technology Excellence',
                            description: 'Romania\'s contribution to global AI advancement through CODAI'
                        },
                        {
                            '@type': 'Thing',
                            name: 'Business Automation',
                            description: 'Comprehensive solutions for enterprise digital transformation'
                        }
                    ]
                }

            case 'contact':
                return {
                    '@context': 'https://schema.org',
                    '@type': 'ContactPage',
                    '@id': `${baseUrl}/contact`,
                    name: 'Contact CODAI - Get in Touch',
                    description: 'Connect with CODAI for enterprise inquiries, partnerships, and early access programs.',
                    url: `${baseUrl}/contact`,
                    mainEntity: {
                        '@type': 'Organization',
                        '@id': `${baseUrl}/#organization`
                    }
                }

            default:
                return {}
        }
    }

    const structuredData = getStructuredData()

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData, null, 0)
            }}
        />
    )
}