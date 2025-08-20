/**
 * CBD Embedding Service
 * Supports multiple embedding models (OpenAI, local, custom)
 */

import { EmbeddingModel } from '../types/index.js';

export class OpenAIEmbeddingModel implements EmbeddingModel {
    public readonly name = 'openai';
    public readonly dimensions = 1536;
    private apiKey: string;
    private modelName: string;

    constructor(apiKey: string, modelName: string = 'text-embedding-ada-002') {
        this.apiKey = apiKey;
        this.modelName = modelName;
    }

    async generateEmbedding(text: string): Promise<Float32Array> {
        try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: text,
                    model: this.modelName
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return new Float32Array(data.data[0].embedding);
        } catch (error) {
            throw new Error(`Failed to generate OpenAI embedding: ${error}`);
        }
    }

    async generateBatchEmbeddings(texts: string[]): Promise<Float32Array[]> {
        if (texts.length === 0) return [];

        try {
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: texts,
                    model: this.modelName
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.data.map((item: any) => new Float32Array(item.embedding));
        } catch (error) {
            throw new Error(`Failed to generate batch OpenAI embeddings: ${error}`);
        }
    }
}

export class LocalEmbeddingModel implements EmbeddingModel {
    public readonly name = 'local';
    public readonly dimensions = 384; // Default for sentence-transformers/all-MiniLM-L6-v2
    private pipeline: any;
    private modelName: string;
    private initialized = false;

    constructor(modelName: string = 'Xenova/all-MiniLM-L6-v2') {
        this.modelName = modelName;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const { pipeline } = await import('@xenova/transformers');
            this.pipeline = await pipeline('feature-extraction', this.modelName);
            this.initialized = true;
            console.log(`🤖 Initialized local embedding model: ${this.modelName}`);
        } catch (error) {
            throw new Error(`Failed to initialize local embedding model: ${error}`);
        }
    }

    async generateEmbedding(text: string): Promise<Float32Array> {
        if (!this.initialized) await this.initialize();

        try {
            const output = await this.pipeline(text, { pooling: 'mean', normalize: true });
            return new Float32Array(output.data);
        } catch (error) {
            throw new Error(`Failed to generate local embedding: ${error}`);
        }
    }

    async generateBatchEmbeddings(texts: string[]): Promise<Float32Array[]> {
        if (!this.initialized) await this.initialize();
        if (texts.length === 0) return [];

        try {
            const results = await Promise.all(
                texts.map(text => this.generateEmbedding(text))
            );
            return results;
        } catch (error) {
            throw new Error(`Failed to generate batch local embeddings: ${error}`);
        }
    }
}

export class EmbeddingService {
    private model: EmbeddingModel;

    constructor(model: EmbeddingModel) {
        this.model = model;
    }

    async generateEmbedding(text: string): Promise<Float32Array> {
        return this.model.generateEmbedding(text);
    }

    async generateBatchEmbeddings(texts: string[]): Promise<Float32Array[]> {
        return this.model.generateBatchEmbeddings(texts);
    }

    async generateConversationEmbedding(userRequest: string, assistantResponse: string): Promise<Float32Array> {
        // Combine user request and assistant response for conversation context
        const conversationText = `User: ${userRequest}\nAssistant: ${assistantResponse}`;
        return this.generateEmbedding(conversationText);
    }

    getDimensions(): number {
        return this.model.dimensions;
    }

    getModelName(): string {
        return this.model.name;
    }

    static createFromConfig(config: {
        type: 'openai' | 'local' | 'custom';
        apiKey?: string;
        modelName?: string;
    }): EmbeddingService {
        switch (config.type) {
            case 'openai':
                if (!config.apiKey) {
                    throw new Error('OpenAI API key required for OpenAI embedding model');
                }
                return new EmbeddingService(new OpenAIEmbeddingModel(config.apiKey, config.modelName));

            case 'local':
                return new EmbeddingService(new LocalEmbeddingModel(config.modelName));

            default:
                throw new Error(`Unsupported embedding model type: ${config.type}`);
        }
    }
}
