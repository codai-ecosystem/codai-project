import { NextRequest, NextResponse } from 'next/server';

/**
 * Romanian Folklore Analysis API
 * Specialized endpoint for Romanian folklore processing
 */

interface FolkloreAnalysisRequest {
    text: string;
    category?: 'basme' | 'legende' | 'colinde' | 'obiceiuri' | 'all';
    region?: string;
}

interface FolkloreElement {
    name: string;
    type: 'character' | 'practice' | 'story' | 'song' | 'ritual';
    description: string;
    region?: string;
    significance: string;
    confidence: number;
}

interface FolkloreAnalysisResponse {
    elements: FolkloreElement[];
    summary: {
        totalElements: number;
        mostCommonType: string;
        culturalDepth: number;
        authenticity: number;
    };
    recommendations: string[];
    metadata: {
        category: string;
        processingTime: number;
        timestamp: string;
    };
}

// Comprehensive Romanian folklore database
const ROMANIAN_FOLKLORE = {
    characters: {
        'făt-frumos': {
            type: 'character' as const,
            description: 'Eroul principal din basmele românești, reprezintă curajul și dreptatea',
            significance: 'Simbolizează virtutea și triumful binelui asupra răului',
            confidence: 0.95
        },
        'ileana cosânzeana': {
            type: 'character' as const,
            description: 'Frumoasa prințesă din basme, simbolul frumuseții și purității',
            significance: 'Reprezentarea feminității ideale în folclorul românesc',
            confidence: 0.93
        },
        'zmeu': {
            type: 'character' as const,
            description: 'Ființa malefică cu puteri supranaturale din basmele românești',
            significance: 'Simbolizează forțele răului care trebuie înfrânte',
            confidence: 0.90
        },
        'căpcăun': {
            type: 'character' as const,
            description: 'Monstru antropofag din mitologia populară românească',
            significance: 'Reprezintă pericolele și temerile ancestrale',
            confidence: 0.88
        },
        'baba dochia': {
            type: 'character' as const,
            description: 'Personaj legendar asociat cu sosirea primăverii',
            significance: 'Simbolizează ciclurile naturii și trecerea timpului',
            confidence: 0.85
        }
    },
    stories: {
        'miorița': {
            type: 'story' as const,
            description: 'Balada populară despre un cioban care își prezice moartea',
            significance: 'Una dintre cele mai importante opere ale folclorului românesc',
            confidence: 0.98
        },
        'meșterul manole': {
            type: 'story' as const,
            description: 'Legenda despre meșterul care și-a zidit soția în mănăstire',
            significance: 'Simbolizează sacrificiul pentru artă și creație',
            confidence: 0.96
        }
    },
    practices: {
        'căluș': {
            type: 'practice' as const,
            description: 'Dans ritual terapeutic practicat în Oltenia',
            significance: 'Ritual de vindecare și purificare spirituală',
            confidence: 0.92
        },
        'paparudă': {
            type: 'practice' as const,
            description: 'Ritual de invocare a ploii în vremuri de secetă',
            significance: 'Exprimă relația omului cu natura și forțele cosmice',
            confidence: 0.89
        },
        'junii brașovului': {
            type: 'practice' as const,
            description: 'Tradiție sărbătorească din Brașov de Anul Nou',
            significance: 'Celebrarea identității culturale locale',
            confidence: 0.87
        }
    },
    songs: {
        'colindă': {
            type: 'song' as const,
            description: 'Cântece tradiționale de Crăciun cu caracter religios',
            significance: 'Păstrarea tradițiilor creștine în cultura populară',
            confidence: 0.94
        },
        'doină': {
            type: 'song' as const,
            description: 'Cântec liric popular cu caracter melancolic',
            significance: 'Exprimarea sentimentelor profunde ale sufletului românesc',
            confidence: 0.91
        }
    },
    rituals: {
        'marțișor': {
            type: 'ritual' as const,
            description: 'Tradiție de întâmpinare a primăverii cu șnur alb-roșu',
            significance: 'Simbolizează renașterea și speranța',
            confidence: 0.95
        },
        'sânziene': {
            type: 'ritual' as const,
            description: 'Sărbătoare tradițională legată de solstițiul de vară',
            significance: 'Celebrarea naturii și a fertilității',
            confidence: 0.88
        }
    }
};

function analyzeFolkloreContent(text: string, category: string): FolkloreAnalysisResponse {
    const startTime = performance.now();
    const lowerText = text.toLowerCase();
    const foundElements: FolkloreElement[] = [];

    // Search through all folklore categories
    const allFolklore = {
        ...ROMANIAN_FOLKLORE.characters,
        ...ROMANIAN_FOLKLORE.stories,
        ...ROMANIAN_FOLKLORE.practices,
        ...ROMANIAN_FOLKLORE.songs,
        ...ROMANIAN_FOLKLORE.rituals
    };

    // Find matching folklore elements
    Object.entries(allFolklore).forEach(([name, element]) => {
        if (lowerText.includes(name.toLowerCase()) ||
            lowerText.includes(element.description.toLowerCase().split(' ')[0])) {
            foundElements.push({
                name,
                ...element
            });
        }
    });

    // Calculate metrics
    const typeCount = foundElements.reduce((acc, element) => {
        acc[element.type] = (acc[element.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostCommonType = Object.entries(typeCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';

    const culturalDepth = Math.min(foundElements.length * 0.15, 1);
    const authenticity = foundElements.length > 0 ?
        foundElements.reduce((sum, el) => sum + el.confidence, 0) / foundElements.length : 0.3;

    // Generate recommendations
    const recommendations = [];
    if (foundElements.length === 0) {
        recommendations.push('Considerați includerea unor elemente de folclor românesc pentru autenticitate culturală');
    }
    if (foundElements.some(el => el.type === 'character')) {
        recommendations.push('Textul conține personaje folclorice semnificative');
    }
    if (foundElements.some(el => el.type === 'practice')) {
        recommendations.push('Sunt prezente practici tradiționale importante');
    }
    if (authenticity > 0.8) {
        recommendations.push('Conținutul prezintă un grad ridicat de autenticitate culturală');
    }

    const processingTime = performance.now() - startTime;

    return {
        elements: foundElements,
        summary: {
            totalElements: foundElements.length,
            mostCommonType,
            culturalDepth,
            authenticity
        },
        recommendations,
        metadata: {
            category,
            processingTime,
            timestamp: new Date().toISOString()
        }
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: FolkloreAnalysisRequest = await request.json();

        if (!body.text) {
            return NextResponse.json(
                { error: 'Text is required for folklore analysis' },
                { status: 400 }
            );
        }

        const category = body.category || 'all';
        const analysis = analyzeFolkloreContent(body.text, category);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error('Folklore analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze folklore content', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'Romanian Folklore Analysis API',
            version: '1.0.0',
            database: {
                characters: Object.keys(ROMANIAN_FOLKLORE.characters).length,
                stories: Object.keys(ROMANIAN_FOLKLORE.stories).length,
                practices: Object.keys(ROMANIAN_FOLKLORE.practices).length,
                songs: Object.keys(ROMANIAN_FOLKLORE.songs).length,
                rituals: Object.keys(ROMANIAN_FOLKLORE.rituals).length,
                total: Object.keys({
                    ...ROMANIAN_FOLKLORE.characters,
                    ...ROMANIAN_FOLKLORE.stories,
                    ...ROMANIAN_FOLKLORE.practices,
                    ...ROMANIAN_FOLKLORE.songs,
                    ...ROMANIAN_FOLKLORE.rituals
                }).length
            },
            categories: ['basme', 'legende', 'colinde', 'obiceiuri', 'all'],
            capabilities: {
                characterRecognition: true,
                storyAnalysis: true,
                practiceIdentification: true,
                songClassification: true,
                ritualDetection: true,
                authenticityScoring: true
            }
        });

    } catch (error) {
        console.error('Folklore API health check error:', error);
        return NextResponse.json(
            { error: 'Health check failed' },
            { status: 500 }
        );
    }
}
