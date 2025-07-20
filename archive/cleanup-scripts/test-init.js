#!/usr/bin/env node

// Test script to validate controlai-mcp server initialization
import { DatabaseService } from './dist/database/DatabaseService.js';
import { AIService } from './dist/ai/AIService.js';
import { CoordinationService } from './dist/coordination/CoordinationService.js';

async function testInitialization() {
    try {
        console.log('🚀 Testing ControlAI MCP initialization...');

        // Test database service initialization
        console.log('📊 Initializing DatabaseService...');
        const dbService = new DatabaseService();
        await dbService.initialize();
        console.log('✅ DatabaseService initialized successfully');

        // Test AI service initialization (without requiring API keys)
        console.log('🤖 Testing AIService structure...');
        try {
            const aiService = new AIService();
            console.log('⚠️  AIService structure valid (requires Azure OpenAI config to work)');
        } catch (error) {
            console.log('⚠️  AIService requires Azure OpenAI environment variables:', error.message);
        }

        // Test coordination service
        console.log('🔄 Testing CoordinationService...');
        // Use a mock AI service for testing
        const mockAIService = {
            suggestTaskAssignment: async () => [{ agentId: 'test', confidence: 80, reasoning: 'Test' }]
        };
        const coordinationService = new CoordinationService(dbService, mockAIService);
        const metrics = await coordinationService.getCoordinationMetrics();
        console.log('✅ CoordinationService working, metrics:', metrics);

        // Clean up
        await dbService.close();

        console.log('🎉 All core services initialized successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Set Azure OpenAI environment variables:');
        console.log('   - AZURE_OPENAI_ENDPOINT');
        console.log('   - AZURE_OPENAI_API_KEY');
        console.log('   - AZURE_OPENAI_DEPLOYMENT (optional)');
        console.log('2. Run: pnpm run dev');
        console.log('3. Test with VS Code MCP integration');

        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

testInitialization();
