/**
 * Embedding management
 *
 * Learning focus (Phase 1):
 * - How embeddings work conceptually
 * - Token budget constraints
 * - Embedding model choices
 *
 * For Phase 1, we'll use a mock embedder for testing
 * Phase 2 will add real OpenAI embeddings
 */

import { CodeChunk } from '../types/index.js';

/**
 * Embedding vector (simplified)
 * Real embeddings are 1536-dimensional (OpenAI) or similar
 * For testing, we'll use smaller dimensions
 */
export type EmbeddingVector = number[];

export interface EmbeddingConfig {
  dimension: number;
  model: 'mock' | 'openai' | 'local';
}

/**
 * Mock embedder for Phase 1 testing
 * In Phase 2, this will use real OpenAI embeddings
 *
 * Learning: How embeddings represent semantic meaning
 */
export class Embedder {
  private config: EmbeddingConfig;
  private cache: Map<string, EmbeddingVector> = new Map();

  constructor(config: EmbeddingConfig = { dimension: 384, model: 'mock' }) {
    this.config = config;
  }

  /**
   * Generate embedding for text
   * Mock implementation: hash-based + random for testing
   * Real implementation: call OpenAI API
   */
  async embed(text: string): Promise<EmbeddingVector> {
    // Check cache
    const cacheKey = `${this.config.model}:${text.substring(0, 100)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let embedding: EmbeddingVector;

    switch (this.config.model) {
      case 'mock':
        embedding = this.mockEmbed(text);
        break;
      case 'openai':
        // Phase 2: Real OpenAI embedding
        embedding = await this.openaiEmbed(text);
        break;
      case 'local':
        // Future: Local embedding model
        embedding = this.mockEmbed(text);
        break;
      default:
        throw new Error(`Unknown embedding model: ${this.config.model}`);
    }

    this.cache.set(cacheKey, embedding);
    return embedding;
  }

  /**
   * Embed multiple chunks efficiently
   */
  async embedChunks(chunks: CodeChunk[]): Promise<Map<string, EmbeddingVector>> {
    const results = new Map<string, EmbeddingVector>();

    for (const chunk of chunks) {
      const embedding = await this.embed(chunk.content);
      results.set(chunk.id, embedding);
    }

    return results;
  }

  /**
   * Mock embedding for testing
   * Creates a deterministic but somewhat semantic embedding
   */
  private mockEmbed(text: string): EmbeddingVector {
    // Use hash to create deterministic random numbers
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Create embedding based on hash + semantic features
    const embedding: EmbeddingVector = [];

    // Feature 1: Code density (percentage of non-whitespace)
    const nonWhitespace = text.replace(/\s/g, '').length;
    const codeDensity = nonWhitespace / text.length;
    embedding.push(codeDensity);

    // Feature 2: Keyword indicators
    const keywords = ['function', 'class', 'interface', 'import', 'export', 'async', 'await'];
    for (const keyword of keywords) {
      const count = (text.match(new RegExp(keyword, 'g')) || []).length;
      embedding.push(Math.min(count / 5, 1)); // Normalize to 0-1
    }

    // Feature 3: Structure indicators
    const bracketCount = (text.match(/{/g) || []).length;
    const parenCount = (text.match(/\(/g) || []).length;
    embedding.push(Math.min(bracketCount / 10, 1));
    embedding.push(Math.min(parenCount / 10, 1));

    // Feature 4: Comment ratio
    const commentLines = (text.match(/\/\//g) || []).length;
    const allLines = text.split('\n').length;
    embedding.push(commentLines / allLines);

    // Fill remaining dimensions with pseudo-random values
    const seed = Math.abs(hash);
    for (let i = embedding.length; i < this.config.dimension; i++) {
      // Pseudo-random using seed
      const x = Math.sin(seed + i) * 10000;
      embedding.push(x - Math.floor(x));
    }

    return embedding;
  }

  /**
   * Real OpenAI embedding
   * Placeholder for Phase 2
   */
  private async openaiEmbed(text: string): Promise<EmbeddingVector> {
    // Phase 2: Implement OpenAI API call
    // For now, fall back to mock
    console.warn('OpenAI embedding not yet implemented, using mock');
    return this.mockEmbed(text);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return normA > 0 && normB > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  }
}

/**
 * Embedding strategy info
 */
export interface EmbeddingStrategy {
  model: string;
  dimension: number;
  maxTokens: number;  // Max input tokens for this model
  costPer1kTokens: number;  // Cost for embeddings
}

/**
 * Common embedding strategies
 */
export const EMBEDDING_STRATEGIES: Record<string, EmbeddingStrategy> = {
  'openai-small': {
    model: 'text-embedding-3-small',
    dimension: 1536,
    maxTokens: 8191,
    costPer1kTokens: 0.02,
  },
  'openai-large': {
    model: 'text-embedding-3-large',
    dimension: 3072,
    maxTokens: 8191,
    costPer1kTokens: 0.13,
  },
  'mock': {
    model: 'mock-embedding',
    dimension: 384,
    maxTokens: Infinity,
    costPer1kTokens: 0,
  },
};
