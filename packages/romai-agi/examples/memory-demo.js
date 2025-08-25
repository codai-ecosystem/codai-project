/**
 * RomAI AGI - Advanced Memory System Demo
 * Demonstrates Day 3 enhanced memory capabilities
 */

import { RomAIAGI } from '../dist/index.js';

async function runAdvancedMemoryDemo() {
  console.log('🧠 RomAI AGI - Advanced Memory System Demo (Day 3)\n');

  try {
    // Initialize RomAI AGI with enhanced memory configuration
    console.log('1️⃣ Initializing RomAI AGI with enhanced memory...');

    // Create initial configuration
    const initialConfig = {
      memory: {
        maxSize: 2000,
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

    // Initialize with the enhanced configuration
    await romai.initialize(initialConfig);

    console.log('✅ RomAI AGI initialized with enhanced memory system!\n');

    // Test advanced memory operations
    console.log('2️⃣ Testing advanced memory capabilities...');

    // Store complex episodic memory
    const episodeData = {
      id: `episode-${Date.now()}`,
      content: {
        event: 'Romanian cultural learning session',
        details: 'Learning about Romanian traditions and business practices',
        outcome: 'Successfully integrated cultural knowledge'
      },
      timestamp: Date.now(),
      importance: 0.85,
      context: {
        situation: 'cultural-training',
        environment: 'learning-session',
        goals: ['understand-culture', 'improve-intelligence'],
        outcomes: ['knowledge-gained', 'cultural-awareness-enhanced']
      },
      emotionalTag: 'positive-learning',
      participants: ['user', 'romai-agi']
    };

    // Test episode storage (this would use the enhanced storeEpisode method)
    console.log('📝 Storing complex episodic memory...');
    const memory1 = {
      id: 'episode-memory-1',
      content: episodeData,
      timestamp: Date.now(),
      type: 'episode',
      importance: 0.85
    };

    const episodeId = await romai.remember(memory1);
    console.log('✅ Episodic memory stored:', episodeId);

    // Store semantic knowledge
    console.log('🧩 Storing semantic knowledge...');
    const knowledgeMemory = {
      id: 'semantic-knowledge-1',
      content: {
        concept: 'Romanian Business Etiquette',
        properties: {
          formalMeetings: 'important',
          relationshipBuilding: 'high-priority',
          punctuality: 'respected',
          hierarchyRespect: 'traditional'
        },
        confidence: 0.9
      },
      timestamp: Date.now(),
      type: 'semantic',
      importance: 0.8
    };

    const knowledgeId = await romai.remember(knowledgeMemory);
    console.log('✅ Semantic knowledge stored:', knowledgeId);

    // Store working memory items
    console.log('🔄 Adding items to working memory...');
    const workingMemories = [
      {
        id: 'working-1',
        content: { task: 'Process Romanian text', priority: 'high' },
        timestamp: Date.now(),
        type: 'working',
        importance: 0.9
      },
      {
        id: 'working-2',
        content: { context: 'Business meeting preparation', focus: 'cultural-sensitivity' },
        timestamp: Date.now(),
        type: 'working',
        importance: 0.7
      }
    ];

    for (const wm of workingMemories) {
      await romai.remember(wm);
    }
    console.log('✅ Working memory items added');
    console.log('');

    // Test advanced recall capabilities
    console.log('3️⃣ Testing advanced memory recall...');

    // Test semantic recall
    console.log('🔍 Recalling Romanian business knowledge...');
    const businessMemories = await romai.recall('Romanian business');
    console.log(`📊 Found ${businessMemories.length} business-related memories`);
    if (businessMemories.length > 0) {
      console.log('Sample:', JSON.stringify(businessMemories[0], null, 2));
    }
    console.log('');

    // Test cultural recall
    console.log('🔍 Recalling cultural memories...');
    const culturalMemories = await romai.recall('cultural');
    console.log(`📊 Found ${culturalMemories.length} cultural memories`);
    console.log('');

    // Test episodic recall
    console.log('🔍 Recalling learning episodes...');
    const learningMemories = await romai.recall('learning');
    console.log(`📊 Found ${learningMemories.length} learning-related memories`);
    console.log('');

    // Test memory system analysis
    console.log('4️⃣ Analyzing memory system performance...');
    const status = romai.getStatus();
    const memoryStatus = status.components?.memory;

    if (memoryStatus) {
      console.log('🧠 Memory System Analysis:');
      console.log(`- Total memories: ${memoryStatus.memoriesCount || 'N/A'}`);
      console.log(`- Episodes: ${memoryStatus.episodesCount || 'N/A'}`);
      console.log(`- Working memory slots: ${memoryStatus.workingMemorySlots || 'N/A'}`);
      console.log(`- Semantic nodes: ${memoryStatus.semanticNodes || 'N/A'}`);
      console.log(`- MemoraiMCP integration: ${memoryStatus.memoraiIntegration || 'active'}`);
    }
    console.log('');

    // Test learning integration with memory
    console.log('5️⃣ Testing learning-memory integration...');
    const learningResult = await romai.learn({
      input: 'Romanian greeting: Bună ziua',
      output: 'Formal greeting meaning Good day',
      feedback: 0.95,
      context: {
        domain: 'romanian-language',
        type: 'cultural-learning',
        importance: 'high'
      }
    });

    console.log('📚 Learning result with memory integration:');
    console.log(JSON.stringify(learningResult, null, 2));
    console.log('');

    // Test reasoning with memory context
    console.log('6️⃣ Testing reasoning with memory context...');
    const reasoningResult = await romai.reason({
      problem: 'How should I prepare for a business meeting in Romania?',
      context: 'business-etiquette',
      useMemory: true
    });

    console.log('🤔 Reasoning result with memory:');
    console.log(JSON.stringify(reasoningResult, null, 2));
    console.log('');

    // Final status check
    console.log('7️⃣ Final memory system status...');
    const finalStatus = romai.getStatus();
    console.log('📊 Final Status:');
    console.log(JSON.stringify(finalStatus.components?.memory || {}, null, 2));
    console.log('');

    // Shutdown
    console.log('8️⃣ Shutting down with memory consolidation...');
    await romai.stop();
    console.log('✅ RomAI AGI shutdown with memory preservation completed!');

    console.log('\n🎉 Advanced Memory System Demo completed successfully!');
    console.log('🧠 Day 3 Enhancement: Memory system now features:');
    console.log('   • Working memory with attention-based slots');
    console.log('   • Episodic memory for experience storage');
    console.log('   • Semantic memory network for knowledge');
    console.log('   • MemoraiMCP integration for persistence');
    console.log('   • Advanced memory consolidation');
    console.log('   • Memory pattern analysis');

  } catch (error) {
    console.error('❌ Advanced Memory Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the advanced memory demo
runAdvancedMemoryDemo().catch(console.error);
