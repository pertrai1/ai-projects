/**
 * Vector store using HNSW algorithm
 *
 * Learning focus (Phase 1):
 * - How vector stores work
 * - HNSW for fast approximate nearest neighbor search
 * - Indexing and retrieval
 *
 * HNSW = Hierarchical Navigable Small World
 * - Fast approximate nearest neighbor search
 * - Works well for high-dimensional data
 * - Better than brute force for large datasets
 */

import { RetrievedChunk, CodeChunk } from '../types/index.js';
import { EmbeddingVector, Embedder } from './embedding.js';

/**
 * Vector store index entry
 */
interface IndexEntry {
  id: string;
  embedding: EmbeddingVector;
  chunk: CodeChunk;
}

/**
 * Search results
 */
export interface SearchResults {
  results: RetrievedChunk[];
  query: string;
  queryEmbedding?: EmbeddingVector;
  searchTime: number;
  strategy: 'exact' | 'approximate' | 'hybrid';
}

/**
 * Simple in-memory vector store
 * For Phase 1, we'll use brute-force search (exact nearest neighbors)
 * Phase 2 will add HNSW for efficiency
 *
 * Learning: Start simple, then optimize
 */
export class VectorStore {
  private embedder: Embedder;
  private chunks: Map<string, IndexEntry> = new Map();
  private useApproximateSearch: boolean;

  constructor(embedder: Embedder, useApproximateSearch: boolean = false) {
    this.embedder = embedder;
    this.useApproximateSearch = useApproximateSearch;
  }

  /**
   * Index a chunk
   */
  async index(chunk: CodeChunk): Promise<void> {
    const embedding = await this.embedder.embed(chunk.content);

    this.chunks.set(chunk.id, {
      id: chunk.id,
      embedding,
      chunk,
    });
  }

  /**
   * Index multiple chunks
   */
  async indexBatch(chunks: CodeChunk[]): Promise<void> {
    const embeddings = await this.embedder.embedChunks(chunks);

    for (const chunk of chunks) {
      const embedding = embeddings.get(chunk.id);
      if (embedding) {
        this.chunks.set(chunk.id, {
          id: chunk.id,
          embedding,
          chunk,
        });
      }
    }
  }

  /**
   * Search for similar chunks with optional filtering
   */
  async search(
    query: string, 
    k: number = 10, 
    filter?: (chunk: CodeChunk) => boolean
  ): Promise<SearchResults> {
    const startTime = Date.now();

    // Embed query
    const queryEmbedding = await this.embedder.embed(query);

    // Search
    const candidates = this.branchAndBound(queryEmbedding, k, filter);

    const searchTime = Date.now() - startTime;

    // Convert to RetrievedChunk format
    const results: RetrievedChunk[] = candidates.map((candidate) => ({
      ...candidate.chunk,
      relevanceScore: candidate.score,
      retrievalMethod: 'semantic',
    }));

    return {
      results,
      query,
      queryEmbedding,
      searchTime,
      strategy: this.useApproximateSearch ? 'approximate' : 'exact',
    };
  }

  /**
   * Brute-force search (exact nearest neighbors)
   * Computes similarity to all indexed items
   *
   * For small datasets this is fine
   * For large datasets, Phase 2 will use HNSW
   */
  private branchAndBound(
    queryEmbedding: EmbeddingVector,
    k: number,
    filter?: (chunk: CodeChunk) => boolean
  ): Array<{ chunk: CodeChunk; score: number }> {
    const candidates: Array<{ chunk: CodeChunk; score: number }> = [];

    // Compute similarity to all indexed chunks
    for (const entry of this.chunks.values()) {
      // Apply filter if provided
      if (filter && !filter(entry.chunk)) {
        continue;
      }

      const score = Embedder.cosineSimilarity(queryEmbedding, entry.embedding);
      candidates.push({
        chunk: entry.chunk,
        score,
      });
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Return top k
    return candidates.slice(0, k);
  }

  /**
   * Get statistics about the index
   */
  getStats(): {
    indexSize: number;
    totalChunks: number;
    totalTokens: number;
    avgChunkSize: number;
  } {
    let totalTokens = 0;
    let totalChars = 0;

    for (const entry of this.chunks.values()) {
      totalTokens += entry.chunk.tokenCount || 0;
      totalChars += entry.chunk.content.length;
    }

    return {
      indexSize: this.chunks.size,
      totalChunks: this.chunks.size,
      totalTokens,
      avgChunkSize: this.chunks.size > 0 ? Math.round(totalChars / this.chunks.size) : 0,
    };
  }

  /**
   * Clear the index
   */
  clear(): void {
    this.chunks.clear();
  }

  /**
   * Get all indexed chunks
   */
  getAllChunks(): CodeChunk[] {
    return Array.from(this.chunks.values()).map((entry) => entry.chunk);
  }
}

/**
 * Comparison between search strategies
 * This helps understand the HNSW vs brute-force trade-off
 */
export async function compareSearchStrategies(
  query: string,
  k: number,
  vectorStore: VectorStore
): Promise<{
  exactResults: SearchResults;
  approximateResults: SearchResults;
  speedupFactor: number;
  accuracyDrop: number;
}> {
  // Exact search (brute force)
  const exactStart = Date.now();
  const exactResults = await vectorStore.search(query, k);
  const exactTime = Date.now() - exactStart;

  // For now, approximate is same as exact
  // Phase 2 will implement HNSW approximation
  const approximateResults = { ...exactResults };
  const approximateTime = exactTime;

  return {
    exactResults,
    approximateResults,
    speedupFactor: approximateTime > 0 ? exactTime / approximateTime : 1,
    accuracyDrop: 0, // No drop when both are same strategy
  };
}
