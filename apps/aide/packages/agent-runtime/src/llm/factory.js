import { OpenAIService } from './openai.js';
import { AnthropicService } from './anthropic.js';
import { OllamaService } from './ollama.js';
import { createModernAIService, modernAIConfigs } from './modern-ai.js';
/**
 * Create an LLM service based on the provided configuration
 * @param config LLM model configuration
 * @param useModern Whether to use the modern AI SDK (default: true)
 * @returns Configured LLM service
 */
export function createLLMService(config, useModern = true) {
    if (useModern && ['openai', 'anthropic', 'google'].includes(config.provider)) {
        return createModernAIService(config);
    }
    // Fallback to legacy services
    switch (config.provider) {
        case 'openai':
            return new OpenAIService(config);
        case 'anthropic':
            return new AnthropicService(config);
        case 'ollama':
            return new OllamaService(config);
        case 'local':
            throw new Error('Local provider not implemented yet');
        case 'custom':
            throw new Error('Custom provider requires implementation');
        default:
            throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
}
/**
 * Default LLM configuration options by provider
 * Legacy default configs for compatibility
 */
export const defaultLLMConfigs = {
    openai: {
        provider: 'openai',
        model: 'gpt-4o',
        maxTokens: 2048,
        temperature: 0.7,
        apiKey: '',
    },
    anthropic: {
        provider: 'anthropic',
        model: 'claude-3-opus-20240229',
        maxTokens: 4096,
        temperature: 0.7,
        apiKey: '',
    },
    google: {
        provider: 'google',
        model: 'gemini-1.5-pro',
        maxTokens: 2048,
        temperature: 0.7,
        apiKey: '',
    },
    ollama: {
        provider: 'ollama',
        model: 'llama3',
        baseUrl: 'http://localhost:11434/api',
        maxTokens: 2048,
        temperature: 0.7,
    },
    local: {
        provider: 'local',
        model: 'mixtral-8x7b',
        baseUrl: 'http://localhost:8080/v1',
        maxTokens: 2048,
        temperature: 0.7,
    },
    custom: {
        provider: 'custom',
        model: 'custom-model',
    }
};
/**
 * Create common system prompts for different agent types
 */
export function createSystemPrompt(agentType, context) {
    switch (agentType) {
        case 'planner':
            return `You are an expert software project planner. Your role is to:
1. Break down user requirements into clear, actionable tasks
2. Estimate complexity and dependencies between components
3. Create a project plan with milestones
4. Organize tasks into a logical sequence
${context?.projectType ? `\nProject type: ${context.projectType}` : ''}
${context?.constraints ? `\nKey constraints: ${context.constraints}` : ''}`;
        case 'builder':
            return `You are an expert software developer. Your role is to:
1. Implement high-quality code based on requirements
2. Follow best practices and design patterns
3. Write clean, maintainable, and well-documented code
4. Implement proper error handling and edge cases
${context?.language ? `\nPrimary language: ${context.language}` : ''}
${context?.framework ? `\nFramework: ${context.framework}` : ''}`;
        case 'designer':
            return `You are an expert UI/UX designer. Your role is to:
1. Create user-friendly interface designs
2. Follow modern design principles and accessibility standards
3. Ensure visual consistency across the application
4. Design responsive layouts that work on all devices
${context?.designSystem ? `\nDesign system: ${context.designSystem}` : ''}
${context?.brandGuidelines ? `\nBrand guidelines: ${context.brandGuidelines}` : ''}`;
        case 'tester':
            return `You are an expert software tester. Your role is to:
1. Create comprehensive test plans and test cases
2. Identify edge cases and potential issues
3. Write automated tests for functionality
4. Ensure code quality and reliability
${context?.testingFramework ? `\nTesting framework: ${context.testingFramework}` : ''}`;
        case 'deployer':
            return `You are an expert DevOps engineer. Your role is to:
1. Configure deployment strategies and CI/CD pipelines
2. Set up infrastructure as code
3. Optimize application for production
4. Implement monitoring and logging
${context?.deploymentPlatform ? `\nDeployment platform: ${context.deploymentPlatform}` : ''}`;
        default:
            return `You are an AI assistant helping with software development. You are helpful and professional, always following best practices.`;
    }
}
