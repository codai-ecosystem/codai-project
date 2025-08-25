import { NextRequest, NextResponse } from 'next/server';

/**
 * Romanian Traditions Analysis API
 * Specialized endpoint for Romanian traditions processing
 */

interface TraditionsAnalysisRequest {
    text: string;
    category?: 'sărbători' | 'obiceiuri' | 'costume' | 'gastronomie' | 'artizanat' | 'all';
    region?: string;
}

interface TraditionElement {
    name: string;
    type: 'holiday' | 'custom' | 'costume' | 'food' | 'craft' | 'ceremony';
    description: string;
    region?: string;
    season?: string;
    significance: string;
    confidence: number;
}

interface TraditionsAnalysisResponse {
    elements: TraditionElement[];
    summary: {
        totalElements: number;
        seasonalDistribution: Record<string, number>;
        regionalPresence: Record<string, number>;
        authenticity: number;
        traditionalDepth: number;
    };
    recommendations: string[];
    metadata: {
        category: string;
        processingTime: number;
        timestamp: string;
    };
}

// Comprehensive Romanian traditions database
const ROMANIAN_TRADITIONS = {
    holidays: {
        'crăciun': {
            type: 'holiday' as const,
            description: 'Sărbătoarea Nașterii Domnului, cea mai importantă sărbătoare creștină',
            season: 'iarnă',
            significance: 'Celebrarea nașterii lui Iisus Hristos și a unității familiale',
            confidence: 0.98
        },
        'paște': {
            type: 'holiday' as const,
            description: 'Sărbătoarea Învierii Domnului, cea mai mare sărbătoare creștină',
            season: 'primăvară',
            significance: 'Celebrarea învierii lui Iisus și a renașterii spirituale',
            confidence: 0.98
        },
        'sfântul ion': {
            type: 'holiday' as const,
            description: 'Sărbătoarea Sfântului Ioan Botezătorul, 7 ianuarie',
            season: 'iarnă',
            significance: 'Tradiții legate de botez și purificare',
            confidence: 0.92
        },
        'dragobete': {
            type: 'holiday' as const,
            description: 'Sărbătoarea tradițională a iubirii românești, 24 februarie',
            season: 'iarnă',
            significance: 'Celebrarea iubirii și a fertilității',
            confidence: 0.89
        }
    },
    customs: {
        'colindatul': {
            type: 'custom' as const,
            description: 'Tradiția de a merge cu colinda în perioada sărbătorilor de iarnă',
            season: 'iarnă',
            significance: 'Păstrarea tradițiilor religioase și consolidarea comunității',
            confidence: 0.95
        },
        'paparudă': {
            type: 'custom' as const,
            description: 'Ritual pentru chemarea ploii în perioadele de secetă',
            season: 'vară',
            significance: 'Încercarea de influențare a naturii prin ritual',
            confidence: 0.87
        },
        'plugușorul': {
            type: 'custom' as const,
            description: 'Tradiție de Anul Nou pentru fertilitatea pământului',
            season: 'iarnă',
            significance: 'Urări pentru roade bogate și prosperitate',
            confidence: 0.93
        },
        'șezătoarea': {
            type: 'custom' as const,
            description: 'Întruniri comunitare de lucru și socializare în lungile seri de iarnă',
            season: 'iarnă',
            significance: 'Păstrarea tradițiilor și consolidarea legăturilor sociale',
            confidence: 0.91
        }
    },
    costumes: {
        'ie': {
            type: 'costume' as const,
            description: 'Bluza tradițională românească cu broderii specifice fiecărei regiuni',
            significance: 'Simbol al identității culturale românești',
            confidence: 0.96
        },
        'cioareci': {
            type: 'costume' as const,
            description: 'Pantaloni tradițional români purtați de bărbați',
            significance: 'Element vestimentar specific culturii pastorale',
            confidence: 0.88
        },
        'catrinţă': {
            type: 'costume' as const,
            description: 'Fustă tradițională românească din postav',
            significance: 'Vestimentație festivă feminină',
            confidence: 0.85
        },
        'opreg': {
            type: 'costume' as const,
            description: 'Șorț tradițional purtat peste fustă',
            significance: 'Element decorativ și funcțional al costumului popular',
            confidence: 0.83
        }
    },
    foods: {
        'cozonac': {
            type: 'food' as const,
            description: 'Pâine dulce festivă pentru sărbătorile de Paște și Crăciun',
            season: 'toate',
            significance: 'Simbol al abundenței și al sărbătorii',
            confidence: 0.94
        },
        'sarmale': {
            type: 'food' as const,
            description: 'Frunze de varză umplute cu carne și orez',
            season: 'toate',
            significance: 'Mâncare festivă de familie și comunitate',
            confidence: 0.96
        },
        'mici': {
            type: 'food' as const,
            description: 'Cârnați scurți grătar, specialitate culinară românească',
            season: 'vară',
            significance: 'Mâncare socială pentru întâlniri informale',
            confidence: 0.92
        },
        'papanași': {
            type: 'food' as const,
            description: 'Desert tradițional cu brânză dulce, smântână și dulceață',
            season: 'toate',
            significance: 'Desert festiv pentru sărbători și evenimente speciale',
            confidence: 0.89
        }
    },
    crafts: {
        'olărit': {
            type: 'craft' as const,
            description: 'Meșteșugul de modelare și ardere a lutul',
            significance: 'Artă tradițională cu utilitate practică și decorativă',
            confidence: 0.91
        },
        'țesut': {
            type: 'craft' as const,
            description: 'Arta tradițională de țesere a materialelor textile',
            significance: 'Producția de vestminte și obiecte casnice',
            confidence: 0.93
        },
        'sculptură în lemn': {
            type: 'craft' as const,
            description: 'Artă decorativă de sculptare a lemnului',
            significance: 'Ornamentare arhitecturală și obiecte casnice',
            confidence: 0.87
        },
        'împletitul': {
            type: 'craft' as const,
            description: 'Meșteșugul de împletire a nuielelor și paiului',
            significance: 'Producția de coșuri și obiecte utilitare',
            confidence: 0.84
        }
    },
    ceremonies: {
        'nuntă': {
            type: 'ceremony' as const,
            description: 'Ceremonia tradițională de căsătorie cu ritualuri specifice',
            significance: 'Trecerea la statutul de familie și continuitatea generațiilor',
            confidence: 0.97
        },
        'botez': {
            type: 'ceremony' as const,
            description: 'Ceremonia religioasă de primire în comunitatea creștină',
            significance: 'Inițierea spirituală și protecția divină',
            confidence: 0.95
        },
        'înmormântare': {
            type: 'ceremony' as const,
            description: 'Ritualurile tradiționale de comememorare a morților',
            significance: 'Respectul pentru morți și continuitatea memoriei',
            confidence: 0.92
        }
    }
};

function analyzeTraditionsContent(text: string, category: string): TraditionsAnalysisResponse {
    const startTime = performance.now();
    const lowerText = text.toLowerCase();
    const foundElements: TraditionElement[] = [];

    // Search through all tradition categories
    const allTraditions = {
        ...ROMANIAN_TRADITIONS.holidays,
        ...ROMANIAN_TRADITIONS.customs,
        ...ROMANIAN_TRADITIONS.costumes,
        ...ROMANIAN_TRADITIONS.foods,
        ...ROMANIAN_TRADITIONS.crafts,
        ...ROMANIAN_TRADITIONS.ceremonies
    };

    // Find matching tradition elements
    Object.entries(allTraditions).forEach(([name, element]) => {
        if (lowerText.includes(name.toLowerCase()) ||
            lowerText.includes(element.description.toLowerCase().split(' ')[0])) {
            foundElements.push({
                name,
                ...element
            });
        }
    });

    // Calculate seasonal distribution
    const seasonalDistribution = foundElements.reduce((acc, element) => {
        const season = element.season || 'necunoscut';
        acc[season] = (acc[season] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate regional presence (simplified)
    const regionalPresence = foundElements.reduce((acc, element) => {
        const region = element.region || 'național';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Calculate metrics
    const authenticity = foundElements.length > 0 ?
        foundElements.reduce((sum, el) => sum + el.confidence, 0) / foundElements.length : 0.3;

    const traditionalDepth = Math.min(foundElements.length * 0.12, 1);

    // Generate recommendations
    const recommendations = [];
    if (foundElements.length === 0) {
        recommendations.push('Considerați includerea unor tradițiile românești pentru îmbogățirea conținutului cultural');
    }
    if (foundElements.some(el => el.type === 'holiday')) {
        recommendations.push('Conținutul include sărbători tradiționale importante');
    }
    if (foundElements.some(el => el.type === 'food')) {
        recommendations.push('Sunt prezente elemente culinare tradiționale');
    }
    if (foundElements.some(el => el.type === 'craft')) {
        recommendations.push('Textul conține referințe la meșteșuguri tradiționale');
    }
    if (authenticity > 0.85) {
        recommendations.push('Conținutul demonstrează o cunoaștere profundă a tradițiilor românești');
    }

    const processingTime = performance.now() - startTime;

    return {
        elements: foundElements,
        summary: {
            totalElements: foundElements.length,
            seasonalDistribution,
            regionalPresence,
            authenticity,
            traditionalDepth
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
        const body: TraditionsAnalysisRequest = await request.json();

        if (!body.text) {
            return NextResponse.json(
                { error: 'Text is required for traditions analysis' },
                { status: 400 }
            );
        }

        const category = body.category || 'all';
        const analysis = analyzeTraditionsContent(body.text, category);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error('Traditions analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze traditions content', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        return NextResponse.json({
            status: 'healthy',
            service: 'Romanian Traditions Analysis API',
            version: '1.0.0',
            database: {
                holidays: Object.keys(ROMANIAN_TRADITIONS.holidays).length,
                customs: Object.keys(ROMANIAN_TRADITIONS.customs).length,
                costumes: Object.keys(ROMANIAN_TRADITIONS.costumes).length,
                foods: Object.keys(ROMANIAN_TRADITIONS.foods).length,
                crafts: Object.keys(ROMANIAN_TRADITIONS.crafts).length,
                ceremonies: Object.keys(ROMANIAN_TRADITIONS.ceremonies).length,
                total: Object.keys({
                    ...ROMANIAN_TRADITIONS.holidays,
                    ...ROMANIAN_TRADITIONS.customs,
                    ...ROMANIAN_TRADITIONS.costumes,
                    ...ROMANIAN_TRADITIONS.foods,
                    ...ROMANIAN_TRADITIONS.crafts,
                    ...ROMANIAN_TRADITIONS.ceremonies
                }).length
            },
            categories: ['sărbători', 'obiceiuri', 'costume', 'gastronomie', 'artizanat', 'all'],
            capabilities: {
                holidayRecognition: true,
                customAnalysis: true,
                costumeIdentification: true,
                foodClassification: true,
                craftDetection: true,
                ceremonyAnalysis: true,
                seasonalMapping: true,
                regionalMapping: true,
                authenticityScoring: true
            }
        });

    } catch (error) {
        console.error('Traditions API health check error:', error);
        return NextResponse.json(
            { error: 'Health check failed' },
            { status: 500 }
        );
    }
}
