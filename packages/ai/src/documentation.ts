import { z } from 'zod';
import { generateObject } from 'ai';
import { AI_PROVIDERS } from './index';

// AI-Powered Documentation Generation
export interface DocumentationRequest {
  code: string;
  type: 'api' | 'readme' | 'inline' | 'jsdoc';
  format: 'markdown' | 'html' | 'json';
  includeExamples?: boolean;
}

export async function generateDocumentation(
  request: DocumentationRequest,
  provider: keyof typeof AI_PROVIDERS.anthropic = 'claude-3-5-haiku'
): Promise<{ documentation: string; examples?: string[] }> {
  const model = AI_PROVIDERS.anthropic[provider];

  const docSchema = z.object({
    documentation: z.string().describe('Generated documentation'),
    examples: z.array(z.string()).optional().describe('Code examples'),
  });

  const result = await generateObject({
    model,
    schema: docSchema,
    system: `You are a technical writer specializing in software documentation. Create clear, comprehensive documentation that helps developers understand and use the code effectively.`,
    prompt: `Generate ${request.type} documentation in ${request.format} format for the following code:

\`\`\`
${request.code}
\`\`\`

Requirements:
- Clear and concise explanations
- Proper formatting for ${request.format}
- Include examples: ${request.includeExamples || false}
- Follow documentation best practices`,
  });

  return result.object as { documentation: string; examples?: string[] };
}
