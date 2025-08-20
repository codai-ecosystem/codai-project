#!/usr/bin/env node

/**
 * RomAI AGI - Day 5 Romanian Intelligence Enhancement Demo
 * Comprehensive demonstration of enhanced Romanian cultural, linguistic, and business intelligence
 */

import { RomAIAGI } from '../dist/index.js';

console.log('🧠 RomAI AGI - Day 5 Romanian Intelligence Enhancement Demo\n');

async function demonstrateRomanianIntelligence() {
  try {
    // Initialize RomAI AGI
    console.log('🚀 Initializing RomAI AGI...');
    const agi = new RomAIAGI({
      database: { url: 'memory://romanian-agi' },
      romanian: { enhanced: true, cultural: true },
      memory: { persistent: true, cultural: true }
    });

    await agi.initialize();
    console.log('✅ RomAI AGI initialized successfully\n');

    // === Cultural Intelligence Demonstrations ===
    console.log('🏛️ === ROMANIAN CULTURAL INTELLIGENCE DEMO ===\n');

    // Test 1: Cultural Context Analysis
    console.log('📝 Test 1: Cultural Context Analysis');
    const businessText = 'Bună ziua, domnule director. Vă mulțumesc pentru timpul acordat și sper să ajungem la o înțelegere care să ne satisfacă pe amândoi.';

    const culturalAnalysis = await agi.getCulturalIntelligence().analyzeCulturalContext(businessText, {
      region: 'Muntenia',
      socialSetting: 'business',
      participants: ['director', 'business_partner']
    });

    console.log('Input:', businessText);
    console.log('Cultural Markers:', culturalAnalysis.culturalMarkers.length);
    console.log('Social Cues:', culturalAnalysis.socialCues.length);
    console.log('Confidence:', culturalAnalysis.confidence.toFixed(3));
    console.log('Cultural Insights:', culturalAnalysis.culturalInsights);
    console.log('Recommendations:', culturalAnalysis.recommendations);
    console.log('');

    // Test 2: Cultural Guidance for Business Meeting
    console.log('📝 Test 2: Cultural Guidance for Business Meeting');
    const meetingGuidance = await agi.getCulturalIntelligence().getCulturalGuidance(
      'First business meeting with Romanian partners',
      {
        region: 'Transilvania',
        socialSetting: 'business',
        participants: ['foreign_investor', 'romanian_ceo'],
        occasion: 'partnership_negotiation'
      }
    );

    console.log('Scenario: First business meeting with Romanian partners');
    console.log('Recommendations Count:', meetingGuidance.recommendations.length);
    console.log('Cultural Norms:', meetingGuidance.culturalNorms.slice(0, 3));
    console.log('Potential Issues:', meetingGuidance.potentialIssues.length);
    console.log('Confidence:', meetingGuidance.confidence.toFixed(3));
    console.log('');

    // Test 3: Regional Cultural Variations
    console.log('📝 Test 3: Regional Cultural Variations');
    const transylvanianGuidance = await agi.getCulturalIntelligence().getContextualGuidance(
      'formal business presentation',
      'Transilvania',
      'business'
    );

    console.log('Region: Transilvania');
    console.log('Recommendations:', transylvanianGuidance.recommendations.length);
    console.log('Confidence:', transylvanianGuidance.confidence.toFixed(3));
    console.log('');

    // === Language Processing Demonstrations ===
    console.log('📝 === ROMANIAN LANGUAGE PROCESSING DEMO ===\n');

    // Test 4: Advanced Text Analysis
    console.log('📝 Test 4: Advanced Romanian Text Analysis');
    const romanianText = 'Familia este fundamentul societății românești, iar respectul pentru bătrâni și tradițiile strămoșești reprezintă valori esențiale ale culturii noastre.';

    const languageAnalysis = await agi.getLanguageProcessor().processText(romanianText);

    console.log('Input:', romanianText);
    console.log('Tokens:', languageAnalysis.tokens.length);
    console.log('Grammar Complexity:', languageAnalysis.grammar.complexity);
    console.log('Semantic Concepts:', languageAnalysis.semantics.concepts.slice(0, 3));
    console.log('Formality:', languageAnalysis.pragmatics.formality);
    console.log('Cultural Markers:', languageAnalysis.culturalContext.culturalMarkers.length);
    console.log('Sentiment:', languageAnalysis.sentiment.polarity, '(' + languageAnalysis.sentiment.intensity.toFixed(2) + ')');
    console.log('Processing Confidence:', languageAnalysis.confidence.toFixed(3));
    console.log('');

    // Test 5: Translation with Cultural Context
    console.log('📝 Test 5: Translation with Cultural Context');
    const formalRomanianText = 'Vă rog să îmi acordați o întrevedere pentru a discuta despre proiectul nostru comun.';

    const translation = await agi.getLanguageProcessor().translateToEnglish(formalRomanianText, true);

    console.log('Romanian:', formalRomanianText);
    console.log('English:', translation.translatedText);
    console.log('Formality:', translation.formality);
    console.log('Cultural Notes:', translation.culturalNotes);
    console.log('Translation Confidence:', translation.confidence.toFixed(3));
    console.log('');

    // Test 6: Formality Conversion
    console.log('📝 Test 6: Formality Conversion');
    const informalText = 'Salut! Hai să ne vedem mâine să vorbim despre treabă.';

    const formalVariant = await agi.getLanguageProcessor().generateFormalVariant(informalText);

    console.log('Informal:', informalText);
    console.log('Formal Version:', formalVariant);
    console.log('');

    // Test 7: Dialect Detection
    console.log('📝 Test 7: Dialect Detection');
    const dialectText = 'Măi frate, ăsta e fain tare!';

    const dialectAnalysis = await agi.getLanguageProcessor().detectDialect(dialectText);

    console.log('Text:', dialectText);
    console.log('Detected Dialect:', dialectAnalysis.dialect);
    console.log('Confidence:', dialectAnalysis.confidence.toFixed(3));
    console.log('Characteristics:', dialectAnalysis.characteristics);
    console.log('Regional Origin:', dialectAnalysis.regionalOrigin);
    console.log('');

    // === Business Intelligence Demonstrations ===
    console.log('🏢 === ROMANIAN BUSINESS INTELLIGENCE DEMO ===\n');

    // Test 8: Market Analysis
    console.log('📝 Test 8: Romanian Market Analysis');
    const marketAnalysis = await agi.getBusinessIntelligence().analyzeMarket('technology');

    console.log('Sector: Technology');
    console.log('Market Size:', marketAnalysis.marketSize);
    console.log('Growth:', marketAnalysis.growth);
    console.log('Competition Level:', marketAnalysis.competition);
    console.log('Opportunities:', marketAnalysis.opportunities.length);
    console.log('Analysis Confidence:', marketAnalysis.confidence.toFixed(3));
    console.log('');

    // Test 9: Business Opportunity Assessment
    console.log('📝 Test 9: Business Opportunity Assessment');
    const opportunityProposal = 'AI-powered fintech solution for Romanian banking sector with focus on rural areas';

    const opportunityAnalysis = await agi.getBusinessIntelligence().analyzeBusinessOpportunity(opportunityProposal);

    console.log('Proposal:', opportunityProposal);
    console.log('Viability:', opportunityAnalysis.viability);
    console.log('Market Fit:', opportunityAnalysis.marketFit);
    console.log('Regulatory Compliance:', opportunityAnalysis.regulatoryCompliance);
    console.log('Recommendations:', opportunityAnalysis.recommendations.length);
    console.log('Assessment Confidence:', opportunityAnalysis.confidence.toFixed(3));
    console.log('');

    // Test 10: Regulatory Information
    console.log('📝 Test 10: Regulatory Information');
    const regulations = await agi.getBusinessIntelligence().getRegulationsForSector('fintech');

    console.log('Sector: Fintech');
    console.log('Relevant Regulations:', regulations.length);
    if (regulations.length > 0) {
      console.log('Example Regulation:', regulations[0].name);
      console.log('Applicability:', regulations[0].applicability);
      console.log('Compliance:', regulations[0].compliance);
    }
    console.log('');

    // === Integration Testing ===
    console.log('🔗 === INTEGRATION TESTING ===\n');

    // Test 11: Cross-component Analysis
    console.log('📝 Test 11: Cross-component Romanian Intelligence Analysis');
    const complexScenario = 'Negociem un parteneriat strategic cu o companie din Cluj-Napoca pentru dezvoltarea unei platforme digitale inovatoare.';

    // Get cultural context
    const culturalContext = await agi.getCulturalIntelligence().analyzeCulturalContext(complexScenario, {
      region: 'Transilvania',
      socialSetting: 'business',
      participants: ['foreign_company', 'local_company']
    });

    // Get language analysis
    const languageContext = await agi.getLanguageProcessor().processText(complexScenario);

    // Get business context
    const businessContext = await agi.getBusinessIntelligence().analyzeBusinessOpportunity(complexScenario);

    console.log('Scenario:', complexScenario);
    console.log('Cultural Confidence:', culturalContext.confidence.toFixed(3));
    console.log('Language Confidence:', languageContext.confidence.toFixed(3));
    console.log('Business Confidence:', businessContext.confidence.toFixed(3));

    const avgConfidence = (culturalContext.confidence + languageContext.confidence + businessContext.confidence) / 3;
    console.log('Integrated Intelligence Confidence:', avgConfidence.toFixed(3));
    console.log('');

    // === Performance Summary ===
    console.log('📊 === DAY 5 PERFORMANCE SUMMARY ===\n');

    const performanceMetrics = {
      culturalIntelligence: {
        contextAnalysis: culturalAnalysis.confidence,
        guidanceGeneration: meetingGuidance.confidence,
        regionalAdaptation: transylvanianGuidance.confidence
      },
      languageProcessing: {
        textAnalysis: languageAnalysis.confidence,
        translation: translation.confidence,
        dialectDetection: dialectAnalysis.confidence
      },
      businessIntelligence: {
        marketAnalysis: marketAnalysis.confidence,
        opportunityAssessment: opportunityAnalysis.confidence
      },
      integration: {
        crossComponentAnalysis: avgConfidence
      }
    };

    console.log('🏛️ Cultural Intelligence:');
    console.log('  - Context Analysis:', (performanceMetrics.culturalIntelligence.contextAnalysis * 100).toFixed(1) + '%');
    console.log('  - Guidance Generation:', (performanceMetrics.culturalIntelligence.guidanceGeneration * 100).toFixed(1) + '%');
    console.log('  - Regional Adaptation:', (performanceMetrics.culturalIntelligence.regionalAdaptation * 100).toFixed(1) + '%');

    console.log('📝 Language Processing:');
    console.log('  - Text Analysis:', (performanceMetrics.languageProcessing.textAnalysis * 100).toFixed(1) + '%');
    console.log('  - Translation Quality:', (performanceMetrics.languageProcessing.translation * 100).toFixed(1) + '%');
    console.log('  - Dialect Detection:', (performanceMetrics.languageProcessing.dialectDetection * 100).toFixed(1) + '%');

    console.log('🏢 Business Intelligence:');
    console.log('  - Market Analysis:', (performanceMetrics.businessIntelligence.marketAnalysis * 100).toFixed(1) + '%');
    console.log('  - Opportunity Assessment:', (performanceMetrics.businessIntelligence.opportunityAssessment * 100).toFixed(1) + '%');

    console.log('🔗 System Integration:');
    console.log('  - Cross-component Analysis:', (performanceMetrics.integration.crossComponentAnalysis * 100).toFixed(1) + '%');

    // Calculate overall Romanian Intelligence score
    const culturalAvg = Object.values(performanceMetrics.culturalIntelligence).reduce((a, b) => a + b, 0) / 3;
    const languageAvg = Object.values(performanceMetrics.languageProcessing).reduce((a, b) => a + b, 0) / 3;
    const businessAvg = Object.values(performanceMetrics.businessIntelligence).reduce((a, b) => a + b, 0) / 2;
    const integrationAvg = performanceMetrics.integration.crossComponentAnalysis;

    const overallScore = (culturalAvg + languageAvg + businessAvg + integrationAvg) / 4;

    console.log('\n🎯 Overall Romanian Intelligence Score:', (overallScore * 100).toFixed(1) + '%');

    if (overallScore >= 0.8) {
      console.log('✅ EXCELLENT: World-class Romanian intelligence capabilities achieved!');
    } else if (overallScore >= 0.7) {
      console.log('✅ GOOD: Strong Romanian intelligence with room for enhancement');
    } else {
      console.log('⚠️ DEVELOPING: Romanian intelligence foundation established');
    }

    console.log('\n🏆 Day 5 Romanian Intelligence Enhancement - Demo Complete! 🏆');

    return {
      success: true,
      overallScore: overallScore,
      culturalIntelligence: culturalAvg,
      languageProcessing: languageAvg,
      businessIntelligence: businessAvg,
      systemIntegration: integrationAvg
    };

  } catch (error) {
    console.error('❌ Error during Romanian intelligence demonstration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the demo
demonstrateRomanianIntelligence()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Day 5 Demo completed successfully');
      console.log('📈 Performance achieved:', (result.overallScore * 100).toFixed(1) + '% Romanian intelligence');
    } else {
      console.log('\n❌ Day 5 Demo failed');
      console.log('Error:', result.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Demo execution failed:', error);
    process.exit(1);
  });
