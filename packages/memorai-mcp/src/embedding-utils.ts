/**
 * Embedding utilities for vector similarity search
 * Provides embedding generation and similarity calculation functions
 */

import { OpenAI } from 'openai';

let azureClient: OpenAI | null = null;

/**
 * Initialize the Azure OpenAI client for embeddings
 */
export function initializeEmbeddingClient(config?: {
  apiKey?: string;
  endpoint?: string;
  deploymentName?: string;
  apiVersion?: string;
}) {
  const finalConfig = {
    apiKey: config?.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: config?.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '',
    deploymentName: config?.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
    apiVersion: config?.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
  };

  azureClient = new OpenAI({
    apiKey: finalConfig.apiKey,
    baseURL: `${finalConfig.endpoint.replace(/\/$/, '')}/openai/deployments/${finalConfig.deploymentName}`,
    defaultQuery: { 'api-version': finalConfig.apiVersion },
    defaultHeaders: {
      'api-key': finalConfig.apiKey,
    },
  });

  console.log('[EmbeddingUtils] Azure OpenAI client initialized for embeddings');
}

/**
 * Generate embedding vector for text using Azure OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!azureClient) {
    // Auto-initialize with environment variables
    initializeEmbeddingClient();
  }

  if (!azureClient) {
    console.warn('[EmbeddingUtils] Azure OpenAI client not configured, falling back to text features');
    return generateTextFallbackEmbedding(text);
  }

  try {
    const response = await azureClient.embeddings.create({
      model: 'text-embedding-3-large',
      input: text.substring(0, 8000), // Limit text length
    });

    if (response.data && response.data.length > 0) {
      return response.data[0].embedding;
    }

    console.warn('[EmbeddingUtils] No embedding data returned, using fallback');
    return generateTextFallbackEmbedding(text);

  } catch (error) {
    console.error('[EmbeddingUtils] Error generating embedding:', error);
    return generateTextFallbackEmbedding(text);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    console.warn('[EmbeddingUtils] Vector dimension mismatch');
    return 0;
  }

  if (vectorA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    const diff = vectorA[i] - vectorB[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate Manhattan distance between two vectors
 */
export function manhattanDistance(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    sum += Math.abs(vectorA[i] - vectorB[i]);
  }

  return sum;
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  if (norm === 0) {
    return new Array(vector.length).fill(0);
  }

  return vector.map(val => val / norm);
}

/**
 * Find most similar vectors using cosine similarity
 */
export function findMostSimilar(
  queryVector: number[],
  candidateVectors: { id: string; vector: number[]; data?: any }[],
  topK: number = 10,
  threshold: number = 0.1
): Array<{ id: string; similarity: number; data?: any }> {
  const similarities = candidateVectors.map(candidate => ({
    id: candidate.id,
    similarity: cosineSimilarity(queryVector, candidate.vector),
    data: candidate.data
  }));

  return similarities
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Fallback embedding generation using simple text features
 * Used when Azure OpenAI is not available
 */
function generateTextFallbackEmbedding(text: string): number[] {
  // Simple text-based features for fallback
  const features: number[] = [];
  const lowerText = text.toLowerCase();

  // Basic text statistics
  features.push(text.length / 1000); // Normalized length
  features.push(text.split(' ').length / 100); // Normalized word count
  features.push(text.split('\n').length / 10); // Normalized line count
  features.push((text.match(/[.!?]/g) || []).length / 10); // Normalized sentence count

  // Character frequency (first 26 letters)
  const charCounts = new Array(26).fill(0);
  for (const char of lowerText) {
    const charCode = char.charCodeAt(0);
    if (charCode >= 97 && charCode <= 122) { // a-z
      charCounts[charCode - 97]++;
    }
  }

  // Normalize character frequencies
  const totalChars = charCounts.reduce((sum, count) => sum + count, 0);
  if (totalChars > 0) {
    features.push(...charCounts.map(count => count / totalChars));
  } else {
    features.push(...new Array(26).fill(0));
  }

  // Common word patterns
  const commonWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'among', 'within'
  ];

  for (const word of commonWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex) || [];
    features.push(matches.length / 100); // Normalized frequency
  }

  // Pad or truncate to consistent length
  const targetLength = 100;
  if (features.length < targetLength) {
    features.push(...new Array(targetLength - features.length).fill(0));
  } else if (features.length > targetLength) {
    features.splice(targetLength);
  }

  return features;
}

/**
 * Batch generate embeddings for multiple texts
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 10
): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Calculate average vector from multiple vectors
 */
export function averageVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) {
    return [];
  }

  const dimensions = vectors[0].length;
  const avgVector = new Array(dimensions).fill(0);

  for (const vector of vectors) {
    for (let i = 0; i < dimensions; i++) {
      avgVector[i] += vector[i];
    }
  }

  return avgVector.map(val => val / vectors.length);
}

/**
 * Check if embedding client is initialized and working
 */
export async function isEmbeddingClientHealthy(): Promise<boolean> {
  try {
    if (!azureClient) {
      return false;
    }

    const testEmbedding = await generateEmbedding('test');
    return testEmbedding.length > 0;
  } catch {
    return false;
  }
}

export default {
  initializeEmbeddingClient,
  generateEmbedding,
  generateEmbeddingsBatch,
  cosineSimilarity,
  euclideanDistance,
  manhattanDistance,
  normalizeVector,
  findMostSimilar,
  averageVectors,
  isEmbeddingClientHealthy
};