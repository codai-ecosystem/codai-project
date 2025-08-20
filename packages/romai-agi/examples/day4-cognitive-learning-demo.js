/**
 * RomAI AGI - Day 4 Cognitive Engine & Learning Integration Demo
 * Tests advanced reasoning capabilities and memory-integrated learning
 */

import { RomAIAGI } from '../dist/index.js';

async function runDay4CognitiveDemo() {
  console.log('🧠 RomAI AGI - Day 4 Cognitive Engine & Learning Demo\n');

  try {
    // Initialize RomAI AGI with Day 4 enhancements
    console.log('1️⃣ Initializing RomAI AGI with Day 4 cognitive enhancements...');

    const initialConfig = {
      memory: {
        maxSize: 3000,
        persistentStorage: true
      },
      learning: {
        enabled: true,
        adaptiveRate: 0.15
      },
      romanian: {
        enabled: true,
        culturalContext: true
      },
      quantum: {
        enabled: true,
        processors: 4
      }
    };

    const romai = new RomAIAGI(initialConfig);
    await romai.initialize(initialConfig);
    await romai.start(); // Day 4: Start all components

    console.log('✅ RomAI AGI initialized with advanced cognitive capabilities!\n');

    // Test Advanced Logical Reasoning
    console.log('2️⃣ Testing Advanced Logical Reasoning...');

    const premises = [
      {
        id: 'premise-1',
        statement: 'All Romanian business meetings start with relationship building',
        confidence: 0.9,
        type: 'fact',
        source: 'cultural-knowledge'
      },
      {
        id: 'premise-2',
        statement: 'This is a Romanian business meeting',
        confidence: 0.95,
        type: 'fact',
        source: 'context-observation'
      }
    ];

    const reasoningResult = await romai.reason({ premises });
    console.log('🔍 Logical Reasoning Result:');
    console.log(JSON.stringify(reasoningResult, null, 2));
    console.log('');

    // Test Causal Reasoning
    console.log('3️⃣ Testing Causal Reasoning...');

    const situation = {
      id: 'business-meeting-situation',
      description: 'Romanian business meeting preparation scenario',
      context: {
        country: 'Romania',
        culture: 'Eastern European',
        businessType: 'formal'
      },
      entities: [
        {
          id: 'meeting-participant',
          type: 'person',
          properties: { role: 'business-partner', nationality: 'Romanian' }
        },
        {
          id: 'meeting-environment',
          type: 'setting',
          properties: { formality: 'high', cultural_context: 'Romanian' }
        }
      ],
      relationships: [
        {
          from: 'cultural-awareness',
          to: 'meeting-success',
          type: 'causes',
          strength: 0.85
        },
        {
          from: 'relationship-building',
          to: 'trust-establishment',
          type: 'results-in',
          strength: 0.9
        }
      ]
    };

    const causalResult = await romai.reason({ situation });
    console.log('🔗 Causal Reasoning Result:');
    console.log(JSON.stringify(causalResult, null, 2));
    console.log('');

    // Test Problem Solving
    console.log('4️⃣ Testing Advanced Problem Solving...');

    const problem = {
      id: 'cultural-adaptation-problem',
      description: 'How to successfully conduct business in Romania while respecting cultural norms',
      type: 'strategic',
      constraints: [
        {
          type: 'cultural',
          description: 'Must respect Romanian business etiquette',
          priority: 'high'
        },
        {
          type: 'communication',
          description: 'Language barrier considerations',
          priority: 'medium'
        }
      ],
      context: {
        domain: 'international-business',
        urgency: 'moderate'
      },
      goals: [
        'successful-meeting',
        'relationship-building',
        'cultural-respect'
      ]
    };

    const solutionResult = await romai.solve(problem);
    console.log('🎯 Problem Solving Result:');
    console.log(JSON.stringify(solutionResult, null, 2));
    console.log('');

    // Test Experience-Based Learning
    console.log('5️⃣ Testing Experience-Based Learning...');

    const businessExperience = {
      input: 'Romanian business meeting observation',
      output: 'Successful relationship establishment through cultural awareness',
      feedback: 0.92,
      context: {
        domain: 'romanian-business-culture',
        situation: 'formal-meeting',
        outcome: 'positive'
      }
    };

    const learningResult = await romai.learn(businessExperience);
    console.log('📚 Experience Learning Result:');
    console.log(JSON.stringify(learningResult, null, 2));
    console.log('');

    // Test Adaptive Behavior
    console.log('6️⃣ Testing Adaptive Behavior...');

    const positiveFeedback = {
      positive: true,
      confidence: 0.88,
      context: 'romanian-cultural-adaptation',
      details: 'Cultural sensitivity approach was very effective'
    };

    await romai.adapt(positiveFeedback);
    console.log('✅ Positive feedback adaptation completed');

    const negativeFeedback = {
      positive: false,
      confidence: 0.75,
      context: 'language-processing',
      details: 'Need improvement in Romanian language nuances'
    };

    await romai.adapt(negativeFeedback);
    console.log('✅ Negative feedback adaptation completed');
    console.log('');

    // Test Memory-Learning Integration
    console.log('7️⃣ Testing Memory-Learning Integration...');

    const culturalMemories = await romai.recall('Romanian cultural learning');
    console.log(`🧠 Retrieved ${culturalMemories.length} cultural learning memories`);

    if (culturalMemories.length > 0) {
      console.log('Sample cultural memory:');
      console.log(JSON.stringify(culturalMemories[0], null, 2));
    }
    console.log('');

    // Test Advanced Learning Analytics
    console.log('8️⃣ Analyzing Learning Performance...');

    // Get learning system status
    const learningEngine = romai.getLearningEngine();
    if (learningEngine && typeof learningEngine.getAdvancedStatus === 'function') {
      const learningStatus = learningEngine.getAdvancedStatus();
      console.log('📊 Learning Engine Status:');
      console.log(JSON.stringify(learningStatus, null, 2));

      if (typeof learningEngine.getLearningAnalytics === 'function') {
        const analytics = learningEngine.getLearningAnalytics();
        console.log('📈 Learning Analytics:');
        console.log(JSON.stringify(analytics, null, 2));
      }
    }
    console.log('');

    // Test Cognitive Engine Status
    console.log('9️⃣ Analyzing Cognitive Performance...');

    const cognitiveEngine = romai.getCognitiveEngine();
    if (cognitiveEngine && typeof cognitiveEngine.getStatus === 'function') {
      const cognitiveStatus = cognitiveEngine.getStatus();
      console.log('🧠 Cognitive Engine Status:');
      console.log(JSON.stringify(cognitiveStatus, null, 2));
    }
    console.log('');

    // Final Integration Test
    console.log('🔟 Final Integration Test...');

    // Test complex reasoning with memory and learning integration
    const complexProblem = {
      description: 'Develop a comprehensive strategy for expanding Romanian business operations',
      type: 'strategic',
      constraints: [
        {
          type: 'cultural',
          description: 'Must align with Romanian business culture',
          priority: 'high'
        }
      ],
      context: {
        domain: 'business-expansion',
        complexity: 'high'
      },
      goals: [
        'market-entry',
        'cultural-integration',
        'sustainable-growth'
      ]
    };

    const finalResult = await romai.solve(complexProblem);
    console.log('🎯 Complex Integration Result:');
    console.log(JSON.stringify(finalResult, null, 2));
    console.log('');

    // Shutdown with memory consolidation
    console.log('1️⃣1️⃣ Shutting down with learning consolidation...');
    await romai.stop();
    console.log('✅ RomAI AGI shutdown completed with learning preservation!');

    console.log('\n🎉 Day 4 Cognitive & Learning Demo completed successfully!');
    console.log('🧠 Day 4 Enhancements demonstrated:');
    console.log('   • Advanced logical reasoning (deductive, inductive, abductive)');
    console.log('   • Causal reasoning with situation analysis');
    console.log('   • Multi-paradigm problem solving');
    console.log('   • Experience-based learning with memory integration');
    console.log('   • Adaptive behavior from feedback');
    console.log('   • Memory-learning integration');
    console.log('   • Learning analytics and performance monitoring');
    console.log('   • Complex cognitive-memory-learning coordination');

  } catch (error) {
    console.error('❌ Day 4 Cognitive Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the Day 4 cognitive and learning demo
runDay4CognitiveDemo().catch(console.error);
