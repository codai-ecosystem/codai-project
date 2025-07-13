import { z } from 'zod';
import { generateObject } from 'ai';
import { AI_PROVIDERS } from './index';

// AI-Powered Code Generation
export interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  style?: 'functional' | 'object-oriented' | 'procedural';
  includeTests?: boolean;
  includeComments?: boolean;
}

export interface CodeGenerationResponse {
  code: string;
  tests?: string;
  documentation?: string;
  explanation: string;
  suggestions: string[];
}

const codeGenerationSchema = z.object({
  code: z.string().describe('The generated code'),
  tests: z.string().optional().describe('Unit tests for the code'),
  documentation: z.string().optional().describe('Documentation for the code'),
  explanation: z.string().describe('Explanation of how the code works'),
  suggestions: z.array(z.string()).describe('Suggestions for improvements'),
});

export async function generateCode(
  request: CodeGenerationRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o'
): Promise<CodeGenerationResponse> {
  const model = AI_PROVIDERS.openai[provider];

  const systemPrompt = `You are an expert software engineer and AI coding assistant. Generate high-quality, production-ready code based on the user's requirements.

Guidelines:
- Write clean, maintainable, and well-documented code
- Follow best practices for the specified language and framework
- Include proper error handling and edge case considerations
- Use modern syntax and patterns
- Optimize for readability and performance
- Include meaningful variable and function names`;

  const userPrompt = `Generate ${request.language} code${request.framework ? ` using ${request.framework}` : ''} for the following requirement:

${request.prompt}

Requirements:
- Style: ${request.style || 'functional'}
- Include tests: ${request.includeTests || false}
- Include comments: ${request.includeComments || true}

Please provide well-structured code with explanations and suggestions for improvements.`;

  const result = await generateObject({
    model,
    schema: codeGenerationSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return result.object as CodeGenerationResponse;
}
