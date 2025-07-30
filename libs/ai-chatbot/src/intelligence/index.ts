/**
 * CODAI AI Chatbot Core - AI Intelligence Engine
 * Handles AI processing, OpenAI integration, and intelligent response generation
 */

import { EventEmitter } from 'events';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { encoding_for_model } from 'tiktoken';
import * as nlp from 'compromise';
import * as sentiment from 'sentiment';
import {
  Message,
  AIResponse,
  ConversationContext,
  AIModelConfig,
  PersonalityConfig,
  ChatbotCapability
} from '../types';

export interface AIIntelligenceConfig {
  modelConfig: AIModelConfig;
  personalityConfig: PersonalityConfig;
  capabilities: ChatbotCapability[];
}

export interface ProcessingResult {
  intent?: string;
  entities?: any[];
  sentiment?: any;
  confidence: number;
  topics?: string[];
}

export class AIIntelligence extends EventEmitter {
  private config: AIIntelligenceConfig;
  private openai: OpenAI;
  private tokenEncoder: any;
  private sentimentAnalyzer: any;

  constructor(config: AIIntelligenceConfig) {
    super();
    this.config = config;
    this.initializeServices();
  }

  private initializeServices(): void {
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: this.config.modelConfig.baseUrl,
      defaultHeaders: this.config.modelConfig.headers
    });

    // Initialize token encoder
    try {
      this.tokenEncoder = encoding_for_model(this.config.modelConfig.model as any);
    } catch (error) {
      console.warn('Could not initialize token encoder, using default');
      this.tokenEncoder = null;
    }

    // Initialize sentiment analyzer
    this.sentimentAnalyzer = new sentiment();

    console.log(`🧠 AI Intelligence Engine initialized with ${this.config.modelConfig.model}`);
  }

  /**
   * Process a user message and generate AI response
   */
  async processMessage(message: Message, context: ConversationContext): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Analyze the user message
      const analysis = await this.analyzeMessage(message);

      // Step 2: Prepare conversation history
      const conversationHistory = await this.prepareConversationHistory(context);

      // Step 3: Generate AI response
      const aiResponse = await this.generateResponse(
        message,
        conversationHistory,
        analysis,
        context
      );

      // Step 4: Post-process response
      const processedResponse = await this.postProcessResponse(aiResponse, analysis);

      const processingTime = Date.now() - startTime;

      // Emit events for monitoring
      this.emit('intentClassified', {
        conversationId: message.conversationId,
        userId: message.userId,
        intent: analysis.intent,
        confidence: analysis.confidence
      });

      this.emit('entityExtracted', {
        conversationId: message.conversationId,
        userId: message.userId,
        entities: analysis.entities
      });

      return {
        content: processedResponse.content,
        confidence: analysis.confidence,
        metadata: {
          intent: analysis.intent,
          entities: analysis.entities || [],
          sentiment: analysis.sentiment,
          topics: analysis.topics || [],
          model: this.config.modelConfig.model,
          processingSteps: ['analysis', 'generation', 'post-processing']
        },
        tokens: {
          prompt: this.countTokens(conversationHistory.map(m => m.content).join(' ')),
          completion: this.countTokens(processedResponse.content),
          total: 0
        },
        processingTime
      };
    } catch (error) {
      console.error('AI processing failed:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  /**
   * Analyze user message for intent, entities, and sentiment
   */
  private async analyzeMessage(message: Message): Promise<ProcessingResult> {
    const content = message.content;

    // Natural Language Processing with compromise
    const doc = nlp(content);

    // Extract entities
    const entities = [
      ...doc.people().out('array').map(person => ({ type: 'person', value: person, confidence: 0.8 })),
      ...doc.places().out('array').map(place => ({ type: 'place', value: place, confidence: 0.7 })),
      ...doc.organizations().out('array').map(org => ({ type: 'organization', value: org, confidence: 0.7 })),
      ...doc.topics().out('array').map(topic => ({ type: 'topic', value: topic, confidence: 0.6 }))
    ];

    // Sentiment analysis
    const sentimentResult = this.sentimentAnalyzer.analyze(content);

    // Intent classification (simple rule-based, can be enhanced with ML)
    const intent = this.classifyIntent(content, doc);

    // Topic extraction
    const topics = doc.topics().out('array');

    // Calculate overall confidence
    const confidence = this.calculateConfidence(entities, sentimentResult, intent);

    return {
      intent,
      entities,
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        tokens: sentimentResult.tokens,
        words: sentimentResult.words,
        positive: sentimentResult.positive,
        negative: sentimentResult.negative
      },
      topics,
      confidence
    };
  }

  /**
   * Classify user intent based on message content
   */
  private classifyIntent(content: string, doc: any): string {
    const contentLower = content.toLowerCase();

    // Question intents
    if (doc.has('#Question') || contentLower.includes('?')) {
      if (contentLower.includes('what') || contentLower.includes('how') || contentLower.includes('why')) {
        return 'information_request';
      }
      return 'question';
    }

    // Greeting intents
    if (contentLower.match(/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b/)) {
      return 'greeting';
    }

    // Request intents
    if (contentLower.match(/\b(please|can you|could you|would you|help me|assist)\b/)) {
      return 'request';
    }

    // Farewell intents
    if (contentLower.match(/\b(goodbye|bye|farewell|see you|talk soon)\b/)) {
      return 'farewell';
    }

    // Complaint/problem intents
    if (contentLower.match(/\b(problem|issue|error|bug|broken|not working)\b/)) {
      return 'problem_report';
    }

    // Compliment intents
    if (contentLower.match(/\b(thank|thanks|great|awesome|perfect|excellent)\b/)) {
      return 'appreciation';
    }

    return 'general_conversation';
  }

  /**
   * Prepare conversation history for AI model
   */
  private async prepareConversationHistory(context: ConversationContext): Promise<ChatCompletionMessageParam[]> {
    const messages: ChatCompletionMessageParam[] = [];

    // System message with personality and context
    const systemMessage = this.buildSystemMessage(context);
    messages.push({ role: 'system', content: systemMessage });

    // Add relevant context from memory
    const contextMemory = await this.buildContextFromMemory(context);
    if (contextMemory) {
      messages.push({ role: 'system', content: contextMemory });
    }

    return messages;
  }

  /**
   * Build system message with personality and context
   */
  private buildSystemMessage(context: ConversationContext): string {
    const personality = this.config.personalityConfig;
    const capabilities = this.config.capabilities;

    let systemMessage = `You are ${personality.name || 'an AI assistant'}, ${personality.description || 'a helpful and knowledgeable AI'}.

Personality Traits:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Expertise Level: ${personality.expertiseLevel}

Your capabilities include: ${capabilities.join(', ')}.

User Preferences:
- Language: ${context.userPreferences.language}
- Communication Style: ${context.userPreferences.communicationStyle}
- Response Length: ${context.userPreferences.responseLength}

Context:
- Current Topic: ${context.currentTopic || 'General conversation'}
- Previous Topics: ${context.previousTopics.join(', ') || 'None'}

Guidelines:
1. Be helpful, accurate, and engaging
2. Adapt your responses to the user's preferences
3. Use the conversation context to provide relevant responses
4. If you're unsure about something, say so
5. Stay within your capabilities and knowledge cutoff`;

    return systemMessage;
  }

  /**
   * Build context information from memory
   */
  private async buildContextFromMemory(context: ConversationContext): string {
    const relevantMemory = [];

    // Add working memory items
    if (context.workingMemory.length > 0) {
      const workingMemoryContext = context.workingMemory
        .slice(0, 3) // Limit to most relevant items
        .map(item => `- ${item.key}: ${JSON.stringify(item.value)}`)
        .join('\n');

      relevantMemory.push(`Recent Context:\n${workingMemoryContext}`);
    }

    // Add long-term memory insights
    if (context.longTermMemory.length > 0) {
      const longTermContext = context.longTermMemory
        .slice(0, 2) // Limit to most confident items
        .map(item => `- ${item.content}`)
        .join('\n');

      relevantMemory.push(`User Background:\n${longTermContext}`);
    }

    return relevantMemory.length > 0 ? relevantMemory.join('\n\n') : '';
  }

  /**
   * Generate AI response using OpenAI
   */
  private async generateResponse(
    message: Message,
    conversationHistory: ChatCompletionMessageParam[],
    analysis: ProcessingResult,
    context: ConversationContext
  ): Promise<{ content: string }> {
    // Add user message to conversation
    conversationHistory.push({
      role: 'user',
      content: message.content
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.modelConfig.model,
        messages: conversationHistory,
        max_tokens: this.config.modelConfig.maxTokens,
        temperature: this.config.modelConfig.temperature,
        top_p: this.config.modelConfig.topP,
        frequency_penalty: this.config.modelConfig.frequencyPenalty,
        presence_penalty: this.config.modelConfig.presencePenalty,
        ...(this.config.modelConfig.responseFormat && {
          response_format: this.config.modelConfig.responseFormat
        })
      });

      const responseContent = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

      return { content: responseContent };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return { content: 'I apologize, but I encountered an error while processing your request. Please try again.' };
    }
  }

  /**
   * Post-process the AI response
   */
  private async postProcessResponse(
    response: { content: string },
    analysis: ProcessingResult
  ): Promise<{ content: string }> {
    let content = response.content;

    // Apply personality adjustments based on intent
    if (analysis.intent === 'greeting') {
      content = this.adjustGreetingTone(content);
    } else if (analysis.intent === 'problem_report') {
      content = this.adjustProblemSolvingTone(content);
    }

    // Ensure response length matches user preference
    content = this.adjustResponseLength(content);

    return { content };
  }

  /**
   * Helper methods for response adjustment
   */
  private adjustGreetingTone(content: string): string {
    // Ensure greeting responses are warm and welcoming
    if (!content.toLowerCase().includes('hello') && !content.toLowerCase().includes('hi')) {
      return `Hello! ${content}`;
    }
    return content;
  }

  private adjustProblemSolvingTone(content: string): string {
    // Make problem-solving responses more empathetic
    const empathyPhrases = [
      "I understand that can be frustrating.",
      "I'm here to help you resolve this.",
      "Let's work through this together."
    ];

    const randomPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    return `${randomPhrase} ${content}`;
  }

  private adjustResponseLength(content: string): string {
    const userPreference = this.config.personalityConfig.style;

    if (userPreference === 'concise' && content.length > 200) {
      // Truncate to first few sentences for concise preference
      const sentences = content.split(/[.!?]+/);
      return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
    }

    return content;
  }

  private calculateConfidence(entities: any[], sentiment: any, intent: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on entity extraction
    if (entities.length > 0) {
      confidence += Math.min(entities.length * 0.1, 0.3);
    }

    // Increase confidence based on sentiment clarity
    if (Math.abs(sentiment.comparative) > 0.5) {
      confidence += 0.1;
    }

    // Increase confidence for clear intents
    const clearIntents = ['greeting', 'farewell', 'question', 'request'];
    if (clearIntents.includes(intent)) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private countTokens(text: string): number {
    if (!this.tokenEncoder) {
      // Rough estimation: ~4 characters per token
      return Math.ceil(text.length / 4);
    }

    try {
      return this.tokenEncoder.encode(text).length;
    } catch (error) {
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Get AI model status and metrics
   */
  async getStatus(): Promise<any> {
    return {
      model: this.config.modelConfig.model,
      provider: this.config.modelConfig.provider,
      capabilities: this.config.capabilities,
      personality: {
        name: this.config.personalityConfig.name,
        tone: this.config.personalityConfig.tone,
        style: this.config.personalityConfig.style
      },
      tokenizer: !!this.tokenEncoder,
      openaiClient: !!this.openai
    };
  }
}

export default AIIntelligence;
