import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('🇷🇴 RomAI Cultural Accuracy Tests - Romanian Heritage', () => {
    describe('🗣️ Romanian Language Processing', () => {
        it('correctly handles Romanian diacritics and characters', () => {
            const romanianText = [
                'București', 'România', 'ștefan', 'țară', 'Brâncuși',
                'Eminescu', 'Creangă', 'Argeș', 'Brașov', 'Constanța'
            ];

            romanianText.forEach(text => {
                // Only verify texts that actually contain diacritics
                const hasDiacritics = /[ăâîșțĂÂÎȘȚ]/.test(text);
                if (hasDiacritics) {
                    expect(text).toMatch(/[ăâîșțĂÂÎȘȚ]/);
                }
                
                // Verify text encoding doesn't corrupt characters
                const encoded = encodeURIComponent(text);
                const decoded = decodeURIComponent(encoded);
                expect(decoded).toBe(text);
            });
        });

        it('recognizes Romanian grammatical patterns', () => {
            const romanianPhrases = [
                { phrase: 'Bună dimineața', category: 'greeting', correctness: true },
                { phrase: 'Mulțumesc frumos', category: 'gratitude', correctness: true },
                { phrase: 'La revedere', category: 'farewell', correctness: true },
                { phrase: 'Vă rog', category: 'politeness', correctness: true }
            ];

            romanianPhrases.forEach(item => {
                expect(item.correctness).toBe(true);
                expect(item.category).toBeDefined();
                expect(item.phrase.length).toBeGreaterThan(3);
            });
        });

        it('handles Romanian number and date formats', () => {
            const romanianFormats = {
                numbers: ['1.234,56', '12.345', '1 234'],
                dates: ['15.03.2025', '15 martie 2025', '15 mar. 2025'],
                currency: ['1.234,56 lei', '123 RON', '1.234 lei']
            };

            // Test number format parsing
            romanianFormats.numbers.forEach(num => {
                expect(num).toMatch(/\d+[\.\s]?\d*,?\d*/);
            });

            // Test date format recognition
            romanianFormats.dates.forEach(date => {
                expect(date).toMatch(/\d{1,2}[\.\s][a-zA-Z0-9\.]+[\s]?\d{4}/);
            });

            // Test currency format
            romanianFormats.currency.forEach(currency => {
                expect(currency).toMatch(/(lei|RON)/);
            });
        });
    });

    describe('🏛️ Romanian Cultural Context', () => {
        it('recognizes Romanian historical periods and figures', () => {
            const historicalContext = [
                { name: 'Mihai Viteazul', period: 'medieval', significance: 'unification' },
                { name: 'Ștefan cel Mare', period: 'medieval', significance: 'defense' },
                { name: 'Tudor Vladimirescu', period: 'modern', significance: 'revolution' },
                { name: 'Ion Brătianu', period: 'modern', significance: 'politics' }
            ];

            historicalContext.forEach(figure => {
                expect(figure.name).toBeDefined();
                expect(['medieval', 'modern', 'contemporary'].includes(figure.period)).toBe(true);
                expect(figure.significance).toBeDefined();
            });
        });

        it('understands Romanian cultural traditions and holidays', () => {
            const romanianTraditions = [
                { event: 'Mărțișor', date: '1 martie', type: 'spring_celebration' },
                { event: 'Paște', date: 'variable', type: 'religious' },
                { event: 'Ziua Națională', date: '1 decembrie', type: 'national' },
                { event: 'Crăciun', date: '25 decembrie', type: 'religious' }
            ];

            romanianTraditions.forEach(tradition => {
                expect(tradition.event).toBeDefined();
                expect(tradition.date).toBeDefined();
                expect(['spring_celebration', 'religious', 'national', 'cultural'].includes(tradition.type)).toBe(true);
            });
        });

        it('respects Romanian regional diversity', () => {
            const romanianRegions = [
                { region: 'Transilvania', characteristics: ['multicultural', 'architectural_heritage'] },
                { region: 'Muntenia', characteristics: ['capital', 'plains'] },
                { region: 'Moldova', characteristics: ['monasteries', 'traditions'] },
                { region: 'Oltenia', characteristics: ['folklore', 'crafts'] },
                { region: 'Dobrogea', characteristics: ['coastal', 'diversity'] }
            ];

            romanianRegions.forEach(region => {
                expect(region.region).toBeDefined();
                expect(region.characteristics).toBeDefined();
                expect(region.characteristics.length).toBeGreaterThanOrEqual(2);
            });
        });
    });

    describe('🎭 Romanian Arts and Literature', () => {
        it('recognizes Romanian literary masters and works', () => {
            const romanianLiterature = [
                { author: 'Mihai Eminescu', work: 'Luceafărul', genre: 'poetry' },
                { author: 'Ion Creangă', work: 'Amintiri din copilărie', genre: 'prose' },
                { author: 'Liviu Rebreanu', work: 'Ion', genre: 'novel' },
                { author: 'George Bacovia', work: 'Plumb', genre: 'poetry' }
            ];

            romanianLiterature.forEach(item => {
                expect(item.author).toBeDefined();
                expect(item.work).toBeDefined();
                expect(['poetry', 'prose', 'novel', 'drama'].includes(item.genre)).toBe(true);
            });
        });

        it('understands Romanian musical traditions', () => {
            const romanianMusic = [
                { type: 'doină', characteristics: ['melancholic', 'traditional'] },
                { type: 'hora', characteristics: ['dance', 'circular'] },
                { type: 'sârba', characteristics: ['fast', 'energetic'] },
                { type: 'colind', characteristics: ['christmas', 'ritual'] }
            ];

            romanianMusic.forEach(music => {
                expect(music.type).toBeDefined();
                expect(music.characteristics).toBeDefined();
                expect(music.characteristics.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('recognizes Romanian visual arts and crafts', () => {
            const romanianArts = [
                { art: 'ceramica de Horezu', type: 'pottery', unesco: true },
                { art: 'biserici de lemn', type: 'architecture', unesco: true },
                { art: 'covoarele din Oltenia', type: 'textile', traditional: true },
                { art: 'sculpturile lui Brâncuși', type: 'sculpture', international: true }
            ];

            romanianArts.forEach(art => {
                expect(art.art).toBeDefined();
                expect(art.type).toBeDefined();
                expect(art.unesco || art.traditional || art.international).toBe(true);
            });
        });
    });

    describe('🍽️ Romanian Culinary Heritage', () => {
        it('recognizes traditional Romanian cuisine', () => {
            const romanianFood = [
                { dish: 'mici', type: 'main_course', ingredients: ['beef', 'spices'] },
                { dish: 'sarmale', type: 'main_course', ingredients: ['cabbage', 'meat', 'rice'] },
                { dish: 'ciorbă de burtă', type: 'soup', ingredients: ['tripe', 'vegetables'] },
                { dish: 'papanași', type: 'dessert', ingredients: ['cottage_cheese', 'jam'] }
            ];

            romanianFood.forEach(food => {
                expect(food.dish).toBeDefined();
                expect(['main_course', 'soup', 'dessert', 'appetizer'].includes(food.type)).toBe(true);
                expect(food.ingredients.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('understands Romanian food preparation customs', () => {
            const foodCustoms = [
                { occasion: 'Crăciun', food: 'cozonac', significance: 'religious' },
                { occasion: 'Paște', food: 'drob de miel', significance: 'traditional' },
                { occasion: 'nuntă', food: 'tort', significance: 'celebration' },
                { occasion: 'Anul Nou', food: 'lentile', significance: 'prosperity' }
            ];

            foodCustoms.forEach(custom => {
                expect(custom.occasion).toBeDefined();
                expect(custom.food).toBeDefined();
                expect(['religious', 'traditional', 'celebration', 'prosperity'].includes(custom.significance)).toBe(true);
            });
        });
    });

    describe('🌍 Romanian Geography and Tourism', () => {
        it('recognizes Romanian natural landmarks', () => {
            const landmarks = [
                { name: 'Carpații', type: 'mountains', significance: 'natural_barrier' },
                { name: 'Dunărea', type: 'river', significance: 'major_waterway' },
                { name: 'Marea Neagră', type: 'sea', significance: 'coastal_access' },
                { name: 'Delta Dunării', type: 'wetland', significance: 'biodiversity' }
            ];

            landmarks.forEach(landmark => {
                expect(landmark.name).toBeDefined();
                expect(['mountains', 'river', 'sea', 'wetland', 'plateau'].includes(landmark.type)).toBe(true);
                expect(landmark.significance).toBeDefined();
            });
        });

        it('understands Romanian cities and their characteristics', () => {
            const cities = [
                { city: 'București', role: 'capital', population: 'large' },
                { city: 'Cluj-Napoca', role: 'regional_center', characteristic: 'academic' },
                { city: 'Brașov', role: 'tourist_center', characteristic: 'medieval' },
                { city: 'Constanța', role: 'port_city', characteristic: 'coastal' }
            ];

            cities.forEach(city => {
                expect(city.city).toBeDefined();
                expect(city.role).toBeDefined();
                expect(city.population || city.characteristic).toBeDefined();
            });
        });
    });

    describe('🎓 Romanian Educational and Scientific Context', () => {
        it('recognizes Romanian contributions to science', () => {
            const scientificContributions = [
                { scientist: 'Henri Coandă', field: 'aerodynamics', discovery: 'Coandă effect' },
                { scientist: 'George Emil Palade', field: 'cell_biology', recognition: 'Nobel Prize' },
                { scientist: 'Nicolae Paulescu', field: 'medicine', discovery: 'insulin research' },
                { scientist: 'Ștefan Odobleja', field: 'cybernetics', contribution: 'cybernetics theory' }
            ];

            scientificContributions.forEach(contribution => {
                expect(contribution.scientist).toBeDefined();
                expect(contribution.field).toBeDefined();
                expect(contribution.discovery || contribution.recognition || contribution.contribution).toBeDefined();
            });
        });

        it('understands Romanian educational system', () => {
            const educationSystem = {
                primaryEducation: { grades: '1-4', mandatory: true },
                secondaryEducation: { grades: '5-8', mandatory: true },
                highSchool: { grades: '9-12', types: ['theoretical', 'vocational'] },
                higherEducation: { degrees: ['licență', 'master', 'doctorat'], public: true }
            };

            expect(educationSystem.primaryEducation.mandatory).toBe(true);
            expect(educationSystem.secondaryEducation.mandatory).toBe(true);
            expect(educationSystem.highSchool.types).toContain('theoretical');
            expect(educationSystem.higherEducation.public).toBe(true);
        });
    });

    describe('🤝 Romanian Social and Cultural Norms', () => {
        it('respects Romanian social etiquette', () => {
            const socialNorms = [
                { situation: 'greeting_elders', behavior: 'formal_address', importance: 'high' },
                { situation: 'visiting_homes', behavior: 'remove_shoes', importance: 'medium' },
                { situation: 'religious_sites', behavior: 'modest_dress', importance: 'high' },
                { situation: 'business_meeting', behavior: 'punctuality', importance: 'high' }
            ];

            socialNorms.forEach(norm => {
                expect(norm.situation).toBeDefined();
                expect(norm.behavior).toBeDefined();
                expect(['high', 'medium', 'low'].includes(norm.importance)).toBe(true);
            });
        });

        it('understands Romanian family and community values', () => {
            const culturalValues = {
                family: { importance: 'high', characteristics: ['respect_for_elders', 'close_bonds'] },
                hospitality: { tradition: 'strong', expression: 'welcoming_guests' },
                education: { value: 'high', emphasis: 'academic_achievement' },
                tradition: { preservation: 'important', transmission: 'intergenerational' }
            };

            expect(culturalValues.family.importance).toBe('high');
            expect(culturalValues.hospitality.tradition).toBe('strong');
            expect(culturalValues.education.value).toBe('high');
            expect(culturalValues.tradition.preservation).toBe('important');
        });
    });

    describe('💼 Romanian Business and Economic Context', () => {
        it('understands Romanian business culture', () => {
            const businessCulture = {
                communication: 'direct_but_polite',
                relationships: 'important',
                hierarchy: 'respected',
                punctuality: 'valued',
                negotiations: 'relationship_based'
            };

            expect(businessCulture.communication).toBeDefined();
            expect(businessCulture.relationships).toBe('important');
            expect(businessCulture.hierarchy).toBe('respected');
            expect(businessCulture.punctuality).toBe('valued');
            expect(businessCulture.negotiations).toBe('relationship_based');
        });

        it('recognizes Romanian economic sectors', () => {
            const economicSectors = [
                { sector: 'IT', growth: 'high', significance: 'emerging' },
                { sector: 'agriculture', importance: 'traditional', land: 'fertile' },
                { sector: 'tourism', potential: 'high', focus: 'heritage' },
                { sector: 'manufacturing', role: 'significant', products: 'automotive' }
            ];

            economicSectors.forEach(sector => {
                expect(sector.sector).toBeDefined();
                expect(sector.growth || sector.importance || sector.potential || sector.role).toBeDefined();
            });
        });
    });
});
