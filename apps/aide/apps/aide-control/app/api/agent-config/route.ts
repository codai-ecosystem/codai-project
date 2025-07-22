/**
 * Agent Configuration API
 * Provides dynamic agent configurations, tool schemas, and feature flags
 * Per milestone1.prompt.md requirements
 */
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agent-config
 * Returns dynamic agent configuration including available tools, prompts, and capabilities
 */
export async function GET(request: NextRequest) {
	try {
		const agentConfig = {
			version: '1.0.0',
			agents: {
				planner: {
					enabled: true,
					model: 'gpt-4',
					maxTokens: 4000,
					temperature: 0.7,
					capabilities: ['project_planning', 'task_breakdown', 'architecture_design']
				},
				builder: {
					enabled: true,
					model: 'gpt-4',
					maxTokens: 8000,
					temperature: 0.3,
					capabilities: ['code_generation', 'file_creation', 'dependency_management']
				},
				designer: {
					enabled: true,
					model: 'gpt-4',
					maxTokens: 4000,
					temperature: 0.8,
					capabilities: ['ui_design', 'styling', 'component_generation']
				},
				tester: {
					enabled: true,
					model: 'gpt-4',
					maxTokens: 6000,
					temperature: 0.2,
					capabilities: ['test_generation', 'quality_assurance', 'bug_detection']
				},
				deployer: {
					enabled: true,
					model: 'gpt-4',
					maxTokens: 4000,
					temperature: 0.1,
					capabilities: ['deployment', 'infrastructure', 'ci_cd']
				}
			},
			prompts: {
				system: "You are AIDE, an AI-native Integrated Development Environment assistant.",
				planning: "Break down the user's request into actionable development tasks.",
				building: "Generate clean, maintainable code following best practices.",
				designing: "Create modern, responsive UI components with excellent UX.",
				testing: "Write comprehensive tests ensuring code quality and reliability.",
				deploying: "Set up robust deployment pipelines and infrastructure."
			},
			limits: {
				maxConcurrentTasks: 5,
				maxMemoryNodes: 10000,
				maxConversationHistory: 100,
				taskTimeoutMs: 300000
			}
		};

		return NextResponse.json({
			success: true,
			data: agentConfig,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Failed to get agent config:', error);
		return NextResponse.json(
			{ error: 'Failed to retrieve agent configuration' },
			{ status: 500 }
		);
	}
}
