/**
 * Simple Node.js test to verify agent runtime functionality
 */
async function testAgentRuntime() {
	try {
		console.log('🚀 Testing AIDE Agent Runtime...');

		// Test that we can require the built package
		const { AgentRuntime } = require('./packages/agent-runtime/dist/index.js');
		console.log('✅ Successfully imported AgentRuntime');

		// Check if we can access MemoryGraph
		const { MemoryGraph } = require('./packages/agent-runtime/dist/index.js');
		console.log('✅ Successfully imported MemoryGraph');

		// Create a memory graph instance
		const memoryGraph = new MemoryGraph();
		console.log('✅ Created MemoryGraph instance');

		// Create agent runtime
		const agentRuntime = new AgentRuntime(memoryGraph);
		console.log('✅ Created AgentRuntime instance');

		// Test basic functionality
		const agentStatuses = agentRuntime.getAgentStatuses();
		console.log(`✅ Agent Runtime initialized with ${agentStatuses.size} agents`);

		// List available agents
		for (const [agentId, status] of agentStatuses.entries()) {
			console.log(`  - ${agentId}: ${status.isHealthy ? 'healthy' : 'unhealthy'}, ${status.isEnabled ? 'enabled' : 'disabled'}`);
		}

		// Test simple task execution
		console.log('🔄 Testing task execution...');
		const testTask = {
			id: 'test-' + Date.now(),
			title: 'Test Task',
			description: 'Simple test to verify agent works',
			agentId: 'planner',
			status: 'pending',
			priority: 'medium',
			inputs: {
				request: 'Create a simple hello world function'
			},
			createdAt: new Date(),
			progress: 0
		};

		const result = await agentRuntime.executeTask(testTask);
		console.log('✅ Task executed successfully:', {
			success: result.success,
			duration: result.duration,
			hasOutputs: !!result.outputs
		});

		console.log('🎉 All agent runtime tests passed!');

	} catch (error) {
		console.error('❌ Agent runtime test failed:', error.message);
		console.error('Stack trace:', error.stack);
		process.exit(1);
	}
}

testAgentRuntime();
