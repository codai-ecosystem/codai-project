import { LLMService, LLMRequestOptions, LLMResponse, Message, LLMModelConfig } from './types.js';

/**
 * Ollama API response interfaces
 */
interface OllamaCompletionRequest {
  model: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

interface OllamaCompletionResponse {
  model: string;
  response?: string;
  message?: { role: string; content: string };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Adapter for Ollama LLM service
 * Allows integration with locally hosted Ollama models
 */
export class OllamaService implements LLMService {
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  constructor(config: LLMModelConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model;
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 2048;
  }

  /**
   * Convert messages array to a single prompt string
   */
  private messagesToPrompt(messages: Message[]): string {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return `System: ${msg.content}`;
        case 'user':
          return `Human: ${msg.content}`;
        case 'assistant':
          return `Assistant: ${msg.content}`;
        default:
          return `${msg.role}: ${msg.content}`;
      }
    }).join('\n\n') + '\n\nAssistant:';
  }
  async complete(options: LLMRequestOptions): Promise<LLMResponse> {
    try {
      const endpoint = `${this.baseUrl}/api/generate`;

      // Convert messages to a single prompt
      const prompt = this.messagesToPrompt(options.messages);

      const requestBody: OllamaCompletionRequest = {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || this.temperature,
          max_tokens: options.maxTokens || this.maxTokens
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaCompletionResponse = await response.json();

      return {
        content: data.response || '',
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      };
    } catch (error) {
      console.error('Ollama completion error:', error);
      throw new Error(`Failed to complete with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  async *streamComplete(options: LLMRequestOptions): AsyncIterable<Partial<LLMResponse>> {
    try {
      const endpoint = `${this.baseUrl}/api/generate`;

      // Convert messages to a single prompt
      const prompt = this.messagesToPrompt(options.messages);

      const requestBody: OllamaCompletionRequest = {
        model: this.model,
        prompt: prompt,
        stream: true,
        options: {
          temperature: options.temperature || this.temperature,
          max_tokens: options.maxTokens || this.maxTokens
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received from Ollama');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaCompletionResponse = JSON.parse(line);
              if (data.response) {
                const response: Partial<LLMResponse> = {
                  content: data.response
                };

                if (data.done) {
                  response.usage = {
                    promptTokens: data.prompt_eval_count || 0,
                    completionTokens: data.eval_count || 0,
                    totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
                  };
                }

                yield response;
              }

              if (data.done) {
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming response chunk:', parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Ollama streaming error:', error);
      throw new Error(`Failed to stream with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async countTokens(text: string | Message[]): Promise<number> {
    // Ollama doesn't provide a direct token counting API
    // Use a rough approximation: ~4 characters per token for English text
    if (typeof text === 'string') {
      return Math.ceil(text.length / 4);
    } else {
      // For messages, count all content
      const totalLength = text.reduce((acc, msg) => {
        return acc + (msg.content?.length || 0);
      }, 0);
      return Math.ceil(totalLength / 4);
    }
  }

  /**
   * Check if Ollama service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List available models in Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }
}
