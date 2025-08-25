import { NextRequest, NextResponse } from 'next/server';

/**
 * Enterprise Business Logic API
 * Critical business endpoints for RomAI enterprise operations
 */

interface BusinessRequest {
    query: string;
    domain?: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    language?: 'ro' | 'en';
}

interface BusinessAnalysisResponse {
    analysis: {
        businessLogic: string;
        recommendations: string[];
        riskAssessment: {
            level: 'low' | 'medium' | 'high';
            factors: string[];
        };
        implementationStrategy: {
            phases: string[];
            timeline: string;
            resources: string[];
        };
    };
    metadata: {
        processingTime: number;
        timestamp: string;
        language: string;
    };
}

interface ComplianceRequest {
    businessArea: string;
    regulations?: string[];
    country?: string;
}

interface ComplianceResponse {
    compliance: {
        status: 'compliant' | 'partial' | 'non-compliant';
        requirements: string[];
        gaps: string[];
        recommendations: string[];
    };
    regulations: {
        applicable: string[];
        priority: string[];
    };
    metadata: {
        auditDate: string;
        version: string;
    };
}

// Business logic patterns database
const BUSINESS_PATTERNS = {
    fintech: {
        keywords: ['banking', 'payment', 'financial', 'investment', 'crypto', 'lending'],
        logic: 'Implementarea soluțiilor financiare sigure cu focus pe compliance și securitate',
        risks: ['regulatory', 'security', 'market_volatility'],
        recommendations: [
            'Implementați autentificare cu mai mulți factori',
            'Asigurați conformitatea GDPR și PCI DSS',
            'Dezvoltați API-uri securizate pentru tranzacții'
        ]
    },
    ecommerce: {
        keywords: ['shop', 'store', 'product', 'cart', 'payment', 'order'],
        logic: 'Dezvoltarea platformelor de comerț electronic scalabile și user-friendly',
        risks: ['competition', 'user_experience', 'inventory_management'],
        recommendations: [
            'Optimizați experiența utilizatorului pe mobile',
            'Implementați sistem de recomandări AI',
            'Integrați multiple modalități de plată'
        ]
    },
    healthcare: {
        keywords: ['medical', 'patient', 'health', 'diagnosis', 'treatment', 'hospital'],
        logic: 'Soluții medicale digitale cu accent pe confidențialitate și acuratețe',
        risks: ['privacy', 'accuracy', 'regulatory_compliance'],
        recommendations: [
            'Respectați standardele HIPAA/GDPR',
            'Implementați criptare end-to-end',
            'Validați toate datele medicale'
        ]
    },
    manufacturing: {
        keywords: ['production', 'factory', 'automation', 'quality', 'supply', 'logistics'],
        logic: 'Digitalizarea proceselor de producție pentru eficiență maximă',
        risks: ['operational_downtime', 'quality_control', 'supply_chain'],
        recommendations: [
            'Implementați IoT pentru monitorizare în timp real',
            'Dezvoltați sisteme predictive de mentenanță',
            'Automatizați controlul calității'
        ]
    }
};

const REGULATORY_FRAMEWORKS = {
    'gdpr': {
        name: 'General Data Protection Regulation',
        scope: 'EU data protection',
        requirements: [
            'Consimțământ explicit pentru procesarea datelor',
            'Dreptul la ștergerea datelor',
            'Notificarea breșelor în 72 ore',
            'Numirea DPO pentru organizații mari'
        ]
    },
    'pci_dss': {
        name: 'Payment Card Industry Data Security Standard',
        scope: 'Payment card data security',
        requirements: [
            'Criptarea datelor cardurilor',
            'Testare regulată a sistemelor de securitate',
            'Restricționarea accesului la date cardholder',
            'Monitorizarea accesului la rețea'
        ]
    },
    'iso_27001': {
        name: 'Information Security Management',
        scope: 'Information security management systems',
        requirements: [
            'Evaluarea riscurilor de securitate',
            'Implementarea controalelor de securitate',
            'Auditare regulată',
            'Formare în securitate pentru personal'
        ]
    }
};

function analyzeBusinessLogic(query: string, domain?: string): BusinessAnalysisResponse {
    const startTime = performance.now();
    const lowerQuery = query.toLowerCase();

    // Detect domain if not provided
    let detectedDomain = domain;
    if (!detectedDomain) {
        for (const [domainKey, pattern] of Object.entries(BUSINESS_PATTERNS)) {
            if (pattern.keywords.some(keyword => lowerQuery.includes(keyword))) {
                detectedDomain = domainKey;
                break;
            }
        }
    }

    const pattern = BUSINESS_PATTERNS[detectedDomain as keyof typeof BUSINESS_PATTERNS] || BUSINESS_PATTERNS.ecommerce;

    // Generate risk assessment
    const riskLevel = lowerQuery.includes('complex') || lowerQuery.includes('enterprise') ? 'high' :
        lowerQuery.includes('integration') || lowerQuery.includes('scale') ? 'medium' : 'low';

    // Generate implementation strategy
    const phases = [
        'Analiza și planificare (2-4 săptămâni)',
        'Dezvoltare MVP (4-8 săptămâni)',
        'Testing și validare (2-3 săptămâni)',
        'Deployment și monitorizare (1-2 săptămâni)'
    ];

    const resources = [
        'Senior Developer',
        'DevOps Engineer',
        'QA Engineer',
        domain && domain.includes('security') ? 'Security Engineer' : 'Business Analyst'
    ].filter(Boolean);

    const processingTime = performance.now() - startTime;

    return {
        analysis: {
            businessLogic: pattern.logic,
            recommendations: pattern.recommendations,
            riskAssessment: {
                level: riskLevel as 'low' | 'medium' | 'high',
                factors: pattern.risks
            },
            implementationStrategy: {
                phases,
                timeline: '8-16 săptămâni',
                resources
            }
        },
        metadata: {
            processingTime,
            timestamp: new Date().toISOString(),
            language: 'ro'
        }
    };
}

function checkCompliance(businessArea: string, regulations: string[] = []): ComplianceResponse {
    const applicableRegulations: string[] = [];
    const requirements: string[] = [];

    // Auto-detect applicable regulations
    if (businessArea.toLowerCase().includes('payment') || businessArea.toLowerCase().includes('financial')) {
        applicableRegulations.push('gdpr', 'pci_dss');
    }
    if (businessArea.toLowerCase().includes('data') || businessArea.toLowerCase().includes('personal')) {
        applicableRegulations.push('gdpr');
    }
    if (businessArea.toLowerCase().includes('security') || businessArea.toLowerCase().includes('enterprise')) {
        applicableRegulations.push('iso_27001');
    }

    // Add user-specified regulations
    regulations.forEach(reg => {
        if (!applicableRegulations.includes(reg)) {
            applicableRegulations.push(reg);
        }
    });

    // Collect requirements
    applicableRegulations.forEach(reg => {
        const framework = REGULATORY_FRAMEWORKS[reg as keyof typeof REGULATORY_FRAMEWORKS];
        if (framework) {
            requirements.push(...framework.requirements);
        }
    });

    return {
        compliance: {
            status: 'partial',
            requirements,
            gaps: [
                'Necesită auditare detaliată pentru conformitate completă',
                'Documentația de compliance trebuie actualizată'
            ],
            recommendations: [
                'Efectuați o evaluare completă de conformitate',
                'Implementați proceduri de monitorizare continuă',
                'Formați echipa în cerințele de compliance'
            ]
        },
        regulations: {
            applicable: applicableRegulations,
            priority: applicableRegulations.slice(0, 2)
        },
        metadata: {
            auditDate: new Date().toISOString(),
            version: '1.0.0'
        }
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'analyze_business_logic':
                const businessRequest = data as BusinessRequest;
                if (!businessRequest.query) {
                    return NextResponse.json(
                        { error: 'Query is required for business logic analysis' },
                        { status: 400 }
                    );
                }
                const businessAnalysis = analyzeBusinessLogic(businessRequest.query, businessRequest.domain);
                return NextResponse.json(businessAnalysis);

            case 'check_compliance':
                const complianceRequest = data as ComplianceRequest;
                if (!complianceRequest.businessArea) {
                    return NextResponse.json(
                        { error: 'Business area is required for compliance check' },
                        { status: 400 }
                    );
                }
                const complianceCheck = checkCompliance(complianceRequest.businessArea, complianceRequest.regulations);
                return NextResponse.json(complianceCheck);

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Supported actions: analyze_business_logic, check_compliance' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Enterprise business logic error:', error);
        return NextResponse.json(
            { error: 'Failed to process business request', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'RomAI Enterprise Business Logic API',
            version: '1.0.0',
            capabilities: {
                businessLogicAnalysis: true,
                complianceChecking: true,
                riskAssessment: true,
                implementationPlanning: true,
                multiLanguageSupport: true
            },
            supportedDomains: Object.keys(BUSINESS_PATTERNS),
            supportedRegulations: Object.keys(REGULATORY_FRAMEWORKS),
            actions: [
                'analyze_business_logic',
                'check_compliance'
            ],
            endpoints: {
                'POST /api/enterprise/business': 'Business logic analysis and compliance checking',
                'GET /api/enterprise/business': 'Health check and capabilities'
            }
        });

    } catch (error) {
        console.error('Enterprise business API health check error:', error);
        return NextResponse.json(
            { error: 'Health check failed' },
            { status: 500 }
        );
    }
}
