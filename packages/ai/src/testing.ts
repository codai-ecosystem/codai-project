import { z } from 'zod';
import { generateObject } from 'ai';
import { AI_PROVIDERS } from './index';

// AI-Powered Test Generation
export interface TestGenerationRequest {
  code: string;
  language: string;
  framework: string;
  testFramework?: string;
  coverage?: 'basic' | 'comprehensive' | 'exhaustive';
}

export async function generateTests(
  request: TestGenerationRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o-mini'
): Promise<{ tests: string; coverage: string[] }> {
  const model = AI_PROVIDERS.openai[provider];

  const testSchema = z.object({
    tests: z.string().describe('Generated test code'),
    coverage: z.array(z.string()).describe('List of test scenarios covered'),
  });

  const result = await generateObject({
    model,
    schema: testSchema,
    system: `You are an expert test engineer. Generate comprehensive test suites that follow testing best practices.`,
    prompt: `Generate ${request.testFramework || 'Jest'} tests for the following ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

Coverage level: ${request.coverage || 'comprehensive'}
Framework: ${request.framework}

Include:
- Unit tests for all functions/methods
- Edge cases and error scenarios
- Mock data and fixtures
- Proper assertions and expectations`,
  });

  return result.object as { tests: string; coverage: string[] };
}
