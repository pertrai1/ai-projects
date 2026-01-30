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
export declare class Embedder {
    private config;
    private cache;
    constructor(config?: EmbeddingConfig);
    /**
     * Generate embedding for text
     * Mock implementation: hash-based + random for testing
     * Real implementation: call OpenAI API
     */
    embed(text: string): Promise<EmbeddingVector>;
    /**
     * Embed multiple chunks efficiently
     */
    embedChunks(chunks: CodeChunk[]): Promise<Map<string, EmbeddingVector>>;
    /**
     * Mock embedding for testing
     * Creates a deterministic but somewhat semantic embedding
     */
    private mockEmbed;
    /**
     * Real OpenAI embedding
     * Placeholder for Phase 2
     */
    private openaiEmbed;
    /**
     * Calculate cosine similarity between two embeddings
     */
    static cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number;
}
/**
 * Embedding strategy info
 */
export interface EmbeddingStrategy {
    model: string;
    dimension: number;
    maxTokens: number;
    costPer1kTokens: number;
}
/**
 * Common embedding strategies
 */
export declare const EMBEDDING_STRATEGIES: Record<string, EmbeddingStrategy>;
//# sourceMappingURL=embedding.d.ts.map