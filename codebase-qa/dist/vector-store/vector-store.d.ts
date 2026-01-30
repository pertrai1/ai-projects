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
export declare class VectorStore {
    private embedder;
    private chunks;
    private useApproximateSearch;
    constructor(embedder: Embedder, useApproximateSearch?: boolean);
    /**
     * Index a chunk
     */
    index(chunk: CodeChunk): Promise<void>;
    /**
     * Index multiple chunks
     */
    indexBatch(chunks: CodeChunk[]): Promise<void>;
    /**
     * Search for similar chunks
     */
    search(query: string, k?: number): Promise<SearchResults>;
    /**
     * Brute-force search (exact nearest neighbors)
     * Computes similarity to all indexed items
     *
     * For small datasets this is fine
     * For large datasets, Phase 2 will use HNSW
     */
    private branchAndBound;
    /**
     * Get statistics about the index
     */
    getStats(): {
        indexSize: number;
        totalChunks: number;
        totalTokens: number;
        avgChunkSize: number;
    };
    /**
     * Clear the index
     */
    clear(): void;
    /**
     * Get all indexed chunks
     */
    getAllChunks(): CodeChunk[];
}
/**
 * Comparison between search strategies
 * This helps understand the HNSW vs brute-force trade-off
 */
export declare function compareSearchStrategies(query: string, k: number, vectorStore: VectorStore): Promise<{
    exactResults: SearchResults;
    approximateResults: SearchResults;
    speedupFactor: number;
    accuracyDrop: number;
}>;
//# sourceMappingURL=vector-store.d.ts.map