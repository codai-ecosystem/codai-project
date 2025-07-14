/**
 * Centralized Azure OpenAI Configuration Service for Codai Ecosystem
 * 
 * This service provides a standardized way to configure and use Azure OpenAI
 * across all Codai applications, ensuring consistent authentication and
 * proper configuration management.
 */

import OpenAI from 'openai';

export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AzureOpenAIResponse {
  success: boolean;
  data?: string;
  error?: string;
  metadata: {
    model: string;
    tokens?: number;
    responseTime: number;
    timestamp: string;
  };
}

export class AzureOpenAIService {
  private client: OpenAI;
  private config: AzureOpenAIConfig;
  private isHealthy: boolean = false;

  constructor(customConfig?: Partial<AzureOpenAIConfig>) {
    // Load configuration with validation
    this.config = this.loadConfiguration(customConfig);
    
    // Initialize Azure OpenAI client
    this.client = this.initializeClient();
    
    // Perform initial health check
    this.performHealthCheck();
  }

  private loadConfiguration(customConfig?: Partial<AzureOpenAIConfig>): AzureOpenAIConfig {
    const config: AzureOpenAIConfig = {
      apiKey: customConfig?.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
      endpoint: customConfig?.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '',
      deploymentName: customConfig?.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
      apiVersion: customConfig?.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
      model: customConfig?.model || process.env.AZURE_OPENAI_MODEL || 'gpt-4',
      maxTokens: customConfig?.maxTokens || parseInt(process.env.AZURE_OPENAI_MAX_TOKENS || '4000'),
      temperature: customConfig?.temperature || parseFloat(process.env.AZURE_OPENAI_TEMPERATURE || '0.1')
    };

    // Validate required configuration
    const missingFields: string[] = [];
    if (!config.apiKey) missingFields.push('AZURE_OPENAI_API_KEY');
    if (!config.endpoint) missingFields.push('AZURE_OPENAI_ENDPOINT');
    if (!config.deploymentName) missingFields.push('AZURE_OPENAI_DEPLOYMENT_NAME');

    if (missingFields.length > 0) {
      throw new Error(`Azure OpenAI configuration incomplete. Missing environment variables: ${missingFields.join(', ')}`);
    }

    // Validate endpoint format
    if (!config.endpoint.startsWith('https://') || !config.endpoint.includes('.openai.azure.com')) {
      throw new Error('AZURE_OPENAI_ENDPOINT must be a valid Azure OpenAI endpoint (https://your-resource.openai.azure.com)');
    }

    return config;
  }

  private initializeClient(): OpenAI {
    try {
      return new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`,
        defaultQuery: { 'api-version': this.config.apiVersion },
        defaultHeaders: {
          'api-key': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      throw new Error(`Failed to initialize Azure OpenAI client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      await this.healthCheck();
      this.isHealthy = true;
    } catch (error) {
      console.warn('Azure OpenAI health check failed:', error);
      this.isHealthy = false;
    }
  }

  /**
   * Generate a completion using Azure OpenAI
   */
  async generateCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<AzureOpenAIResponse> {
    const startTime = Date.now();

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.deploymentName, // Use deployment name as model for Azure
        messages,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
        stream: false, // Always use non-streaming for consistency
      });

      const response = completion.choices[0]?.message?.content || '';
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: response,
        metadata: {
          model: this.config.deploymentName,
          tokens: completion.usage?.total_tokens,
          responseTime,
          timestamp: new Date().toISOString(),
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        error: errorMessage,
        metadata: {
          model: this.config.deploymentName,
          responseTime,
          timestamp: new Date().toISOString(),
        }
      };
    }
  }

  /**
   * Health check for Azure OpenAI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testCompletion = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
        temperature: 0,
      });

      return !!testCompletion.choices[0]?.message?.content;
    } catch (error) {
      console.error('Azure OpenAI health check failed:', error);
      return false;
    }
  }

  /**
   * Get service configuration info (without sensitive data)
   */
  getServiceInfo() {
    return {
      endpoint: this.config.endpoint.replace(/https:\/\/([^.]+)\..*/, 'https://$1.***'),
      deployment: this.config.deploymentName,
      apiVersion: this.config.apiVersion,
      model: this.config.model,
      isHealthy: this.isHealthy,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update configuration at runtime
   */
  updateConfiguration(newConfig: Partial<AzureOpenAIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client = this.initializeClient();
    this.performHealthCheck();
  }

  /**
   * Static method to create service with environment validation
   */
  static createFromEnvironment(): AzureOpenAIService {
    return new AzureOpenAIService();
  }

  /**
   * Static method to validate environment configuration without creating service
   */
  static validateEnvironment(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!process.env.AZURE_OPENAI_API_KEY) {
      errors.push('AZURE_OPENAI_API_KEY is required');
    }
    
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      errors.push('AZURE_OPENAI_ENDPOINT is required');
    } else if (!process.env.AZURE_OPENAI_ENDPOINT.includes('.openai.azure.com')) {
      errors.push('AZURE_OPENAI_ENDPOINT must be a valid Azure OpenAI endpoint');
    }
    
    if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
      errors.push('AZURE_OPENAI_DEPLOYMENT_NAME is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default AzureOpenAIService;
