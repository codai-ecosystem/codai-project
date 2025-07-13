import { streamText } from 'ai';
import { AI_PROVIDERS } from './index';

// Streaming AI Chat for Development
export async function streamDevelopmentChat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  provider: keyof typeof AI_PROVIDERS.openai = 'gpt-4o'
) {
  const model = AI_PROVIDERS.openai[provider];

  return streamText({
    model,
    messages: [
      {
        role: 'system',
        content: `You are an expert AI programming assistant. Help developers with:
- Code generation and explanation
- Debugging and troubleshooting
- Architecture and design decisions
- Best practices and optimization
- Technology recommendations

Always provide practical, actionable advice with code examples when relevant.`,
      },
      ...messages,
    ],
    temperature: 0.7,
    maxTokens: 4000,
  });
}
