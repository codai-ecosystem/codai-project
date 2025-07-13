import { z } from 'zod';
import { generateObject } from 'ai';
import { AI_PROVIDERS } from './index';

// AI-Powered Refactoring
export interface RefactoringRequest {
  code: string;
  language: string;
  goal: 'performance' | 'readability' | 'maintainability' | 'modernization';
  constraints?: string[];
}

export async function refactorCode(
  request: RefactoringRequest,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o'
): Promise<{ refactoredCode: string; changes: string[]; rationale: string }> {
  const model = AI_PROVIDERS.openai[provider];

  const refactorSchema = z.object({
    refactoredCode: z.string().describe('The refactored code'),
    changes: z.array(z.string()).describe('List of changes made'),
    rationale: z.string().describe('Explanation of why these changes improve the code'),
  });

  const result = await generateObject({
    model,
    schema: refactorSchema,
    system: `You are an expert software engineer specializing in code refactoring. Improve the code while maintaining its functionality.`,
    prompt: `Refactor the following ${request.language} code to improve ${request.goal}:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.constraints ? `Constraints: ${request.constraints.join(', ')}` : ''}

Goals:
- Maintain existing functionality
- Improve ${request.goal}
- Follow modern best practices
- Ensure code remains readable and maintainable`,
  });

  return result.object as { refactoredCode: string; changes: string[]; rationale: string };
}
