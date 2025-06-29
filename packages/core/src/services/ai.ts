import OpenAI from 'openai';

// AI Service Configuration
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'azure';
  apiKey: string;
  model: string;
  baseURL?: string;
}

export interface AIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export class AIService {
  private client: OpenAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
        stream: false,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No content in AI response');
      }

      return {
        id: response.id,
        content: choice.message.content,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason || 'stop',
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *streamChat(request: AIRequest): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('AI Stream Error:', error);
      throw new Error(`AI stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Code completion specific method
  async completeCode(code: string, language: string, context?: string): Promise<string> {
    const systemPrompt = `You are an expert ${language} developer. Provide code completion suggestions that are:
- Syntactically correct
- Following best practices
- Contextually appropriate
- Well-commented when needed`;

    const userPrompt = context
      ? `Context: ${context}\n\nComplete this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``
      : `Complete this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;

    const response = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for code completion
      maxTokens: 500,
    });

    return response.content;
  }

  // Code review method
  async reviewCode(code: string, language: string): Promise<{
    issues: Array<{ line: number; type: 'error' | 'warning' | 'suggestion'; message: string }>;
    suggestions: string[];
    rating: number;
  }> {
    const systemPrompt = `You are an expert code reviewer. Analyze the provided ${language} code and return a JSON response with:
- issues: Array of specific issues (line number, type, message)
- suggestions: Array of improvement suggestions
- rating: Overall code quality rating (1-10)

Focus on: security, performance, maintainability, best practices, and potential bugs.`;

    const response = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`` }
      ],
      temperature: 0.2,
      maxTokens: 1000,
    });

    try {
      return JSON.parse(response.content);
    } catch {
      // Fallback if JSON parsing fails
      return {
        issues: [],
        suggestions: [response.content],
        rating: 7,
      };
    }
  }
}

// Factory function for creating AI service instances
export function createAIService(provider: 'openai' | 'anthropic' | 'azure' = 'openai'): AIService {
  const config: AIConfig = {
    provider,
    apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    model: provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-sonnet-20240229' : 'gpt-4',
    ...(provider === 'azure' && {
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
    }),
  };

  if (!config.apiKey) {
    throw new Error(`Missing API key for ${provider}. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.`);
  }

  return new AIService(config);
}

export default AIService;
