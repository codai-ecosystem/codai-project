/**
 * RomAI AGI - Basic Demo
 * Demonstrates the core functionality of the world's first Quantum-Ready AGI
 */

import { RomAIAGI } from '../dist/index.js';

async function runDemo() {
  console.log('🚀 RomAI AGI - Basic Demo Starting...\n');

  try {
    // Initialize RomAI AGI
    console.log('1️⃣ Initializing RomAI AGI...');
    const romai = new RomAIAGI();

    await romai.initialize({
      memory: { maxSize: 1000, persistentStorage: true },
      learning: { enabled: true, adaptiveRate: 0.1 },
      romanian: { enabled: true, culturalContext: true },
      quantum: { enabled: true, processors: 2 }
    });

    console.log('✅ RomAI AGI initialized successfully!\n');

    // Test basic reasoning
    console.log('2️⃣ Testing basic reasoning...');
    const response = await romai.reason('What can you do?');
    console.log('🤖 Response:', JSON.stringify(response, null, 2));
    console.log('');

    // Test communication
    console.log('3️⃣ Testing communication capability...');
    const message = { id: 'msg-1', content: 'Hello, how are you?', sender: 'user', timestamp: Date.now() };
    const commResponse = await romai.communicate(message);
    console.log('💬 Communication Response:', JSON.stringify(commResponse, null, 2));
    console.log('');

    // Test text perception
    console.log('4️⃣ Testing text perception...');
    const textInput = { type: 'text', data: 'Salut, cum te cheamă?' };
    const perceptionResponse = await romai.perceive(textInput);
    console.log('🇷🇴 Perception Response:', JSON.stringify(perceptionResponse, null, 2));
    console.log('');

    // Test learning
    console.log('5️⃣ Testing learning capability...');
    const learningResult = await romai.learn({
      input: 'What is AI?',
      output: 'AI is artificial intelligence',
      feedback: 1.0,
      context: { domain: 'technology' }
    });
    console.log('📚 Learning result:', JSON.stringify(learningResult, null, 2));
    console.log('');

    // Test memory
    console.log('6️⃣ Testing memory system...');
    const memoryEntry = {
      id: `memory-${Date.now()}`,
      content: 'Important fact: RomAI AGI is quantum-ready',
      timestamp: Date.now(),
      type: 'fact',
      importance: 0.9
    };
    const memoryId = await romai.remember(memoryEntry);
    console.log('💾 Memory stored with ID:', memoryId);

    const memories = await romai.recall('quantum');
    console.log('🔍 Recalled memories:', memories.length > 0 ? JSON.stringify(memories[0], null, 2) : 'No memories found');
    console.log('');

    // Get status
    console.log('7️⃣ Checking AGI status...');
    const status = romai.getStatus();
    console.log('📊 Status:', JSON.stringify(status, null, 2));
    console.log('');

    // Shutdown
    console.log('8️⃣ Shutting down...');
    await romai.stop();
    console.log('✅ RomAI AGI shutdown completed!');

    console.log('\n🎉 Demo completed successfully!');
    console.log('🌟 RomAI AGI - The world\'s first Quantum-Ready AGI with Romanian intelligence is working!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the demo
runDemo().catch(console.error);
