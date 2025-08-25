import { NextRequest, NextResponse } from 'next/server';

/**
 * Romanian Cultural Analysis API
 * Implements comprehensive cultural intelligence processing
 */

interface CulturalAnalysisRequest {
    text: string;
    analysisType: 'folklore' | 'traditions' | 'literary' | 'comprehensive';
    context?: string;
}

interface CulturalAnalysisResponse {
    analysis: {
        culturalAuthenticity: number;
        culturalElements: string[];
        folkloreReferences: string[];
        traditionalPractices: string[];
        literaryContext: string;
        culturalSignificance: string;
        confidence: number;
    };
    metadata: {
        analysisType: string;
        processingTime: number;
        timestamp: string;
    };
}

// Romanian cultural keywords and patterns
const ROMANIAN_CULTURAL_PATTERNS = {
    folklore: [
        'miorița', 'meșterul manole', 'făt-frumos', 'ileana cosânzeana',
        'zmeu', 'căpcăun', 'iedeni', 'sânziana', 'drăgaica', 'moș crăciun',
        'baba dochia', 'marțișor', 'junii brașovului', 'căluș', 'hora'
    ],
    traditions: [
        'paști', 'crăciun', 'bobotează', 'sf. gheorghe', 'sf. maria',
        'înviere', 'paște', 'colindă', 'plugușor', 'sorcova', 'capra',
        'ursul', 'cerbul', 'paparudă', 'călușarii', 'joc', 'hora'
    ],
    cultural: [
        'românesc', 'tradițional', 'popular', 'autohton', 'strămoșesc',
        'folcloric', 'ancestral', 'cultural', 'național', 'patrimonial',
        'identitar', 'specific', 'caracteristic', 'reprezentativ'
    ],
    literary: [
        'eminescu', 'creangă', 'sadoveanu', 'rebreanu', 'caragiale',
        'arghezi', 'blaga', 'bacovia', 'barbu', 'sorescu', 'stănescu'
    ]
};

function analyzeCulturalContent(text: string, analysisType: string): CulturalAnalysisResponse['analysis'] {
    const startTime = performance.now();

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Detect cultural elements
    const folkloreMatches = ROMANIAN_CULTURAL_PATTERNS.folklore.filter(pattern =>
        lowerText.includes(pattern.toLowerCase())
    );

    const traditionMatches = ROMANIAN_CULTURAL_PATTERNS.traditions.filter(pattern =>
        lowerText.includes(pattern.toLowerCase())
    );

    const culturalMatches = ROMANIAN_CULTURAL_PATTERNS.cultural.filter(pattern =>
        lowerText.includes(pattern.toLowerCase())
    );

    const literaryMatches = ROMANIAN_CULTURAL_PATTERNS.literary.filter(pattern =>
        lowerText.includes(pattern.toLowerCase())
    );

    // Calculate cultural authenticity score
    const totalMatches = folkloreMatches.length + traditionMatches.length +
        culturalMatches.length + literaryMatches.length;
    const textLength = words.length;
    const density = totalMatches / Math.max(textLength, 1);
    const culturalAuthenticity = Math.min(density * 10, 1); // Normalize to 0-1

    // Generate cultural significance analysis
    let culturalSignificance = "Analiza relevantă cultural";
    if (folkloreMatches.length > 0) {
        culturalSignificance += ". Conține elemente de folclor românesc";
    }
    if (traditionMatches.length > 0) {
        culturalSignificance += ". Include tradiții românești";
    }
    if (literaryMatches.length > 0) {
        culturalSignificance += ". Prezintă referințe literare";
    }

    // Literary context based on matches
    let literaryContext = "Context literar general";
    if (literaryMatches.includes('eminescu')) {
        literaryContext = "Context romantic, influența eminesciană";
    } else if (literaryMatches.includes('creangă')) {
        literaryContext = "Povești populare, tradiție orală";
    } else if (literaryMatches.includes('caragiale')) {
        literaryContext = "Satiră socială, teatru românesc";
    }

    const endTime = performance.now();

    return {
        culturalAuthenticity,
        culturalElements: [...folkloreMatches, ...traditionMatches, ...culturalMatches].slice(0, 10),
        folkloreReferences: folkloreMatches,
        traditionalPractices: traditionMatches,
        literaryContext,
        culturalSignificance,
        confidence: Math.min(0.85 + (totalMatches * 0.05), 0.98) // Higher confidence with more matches
    };
}

export async function POST(request: NextRequest) {
    try {
        const startTime = performance.now();
        const body: CulturalAnalysisRequest = await request.json();

        if (!body.text) {
            return NextResponse.json(
                { error: 'Text is required for cultural analysis' },
                { status: 400 }
            );
        }

        const analysis = analyzeCulturalContent(body.text, body.analysisType);
        const processingTime = performance.now() - startTime;

        const response: CulturalAnalysisResponse = {
            analysis,
            metadata: {
                analysisType: body.analysisType,
                processingTime,
                timestamp: new Date().toISOString()
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Cultural analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze cultural content', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'comprehensive';

        return NextResponse.json({
            status: 'healthy',
            service: 'Romanian Cultural Analysis API',
            version: '1.0.0',
            availableTypes: ['folklore', 'traditions', 'literary', 'comprehensive'],
            currentType: type,
            capabilities: {
                folkloreAnalysis: true,
                traditionRecognition: true,
                literaryContext: true,
                culturalAuthenticity: true
            },
            patterns: {
                folklore: ROMANIAN_CULTURAL_PATTERNS.folklore.length,
                traditions: ROMANIAN_CULTURAL_PATTERNS.traditions.length,
                cultural: ROMANIAN_CULTURAL_PATTERNS.cultural.length,
                literary: ROMANIAN_CULTURAL_PATTERNS.literary.length
            }
        });

    } catch (error) {
        console.error('Cultural API health check error:', error);
        return NextResponse.json(
            { error: 'Health check failed' },
            { status: 500 }
        );
    }
}
