import { z } from 'zod';
import { generateObject } from 'ai';
import { AI_PROVIDERS } from './index';

// Smart Code Review
export interface CodeReviewRequest {
  code: string;
  language: string;
  context?: string;
  focusAreas?: ('performance' | 'security' | 'maintainability' | 'style')[];
}

export interface CodeReviewResponse {
  overallScore: number;
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    line?: number;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    suggestion?: string;
  }>;
  strengths: string[];
  recommendations: string[];
}

export async function reviewCode(
  request: CodeReviewRequest,
  provider: keyof typeof AI_PROVIDERS.anthropic = 'claude-3-5-sonnet'
): Promise<CodeReviewResponse> {
  const model = AI_PROVIDERS.anthropic[provider];

  const reviewSchema = z.object({
    overallScore: z.number().min(0).max(100).describe('Overall code quality score'),
    issues: z.array(z.object({
      type: z.enum(['error', 'warning', 'suggestion']),
      line: z.number().optional(),
      message: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      category: z.string(),
      suggestion: z.string().optional(),
    })),
    strengths: z.array(z.string()).describe('Positive aspects of the code'),
    recommendations: z.array(z.string()).describe('General improvement recommendations'),
  });

  const focusAreas = request.focusAreas || ['performance', 'security', 'maintainability', 'style'];

  const result = await generateObject({
    model,
    schema: reviewSchema,
    system: `You are a senior software engineer conducting a thorough code review. Analyze the code for quality, best practices, and potential improvements.`,
    prompt: `Review the following ${request.language} code:

\`\`\`${request.language}
${request.code}
\`\`\`

${request.context ? `Context: ${request.context}` : ''}

Focus on: ${focusAreas.join(', ')}

Provide detailed feedback on:
- Code quality and best practices
- Performance optimizations
- Security vulnerabilities
- Maintainability concerns
- Style and readability
- Potential bugs or issues`,
  });

  return result.object as CodeReviewResponse;
}
