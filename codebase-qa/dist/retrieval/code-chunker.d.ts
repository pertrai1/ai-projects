/**
 * Code-aware chunking strategies
 *
 * Learning focus (Phase 1):
 * - Chunking strategies have different trade-offs
 * - Semantic chunking preserves meaning but is slower
 * - Fixed chunking is fast but may split related code
 * - Token budgets constrain chunk size
 *
 * This module implements 3 strategies to compare:
 * 1. Fixed-size chunking (baseline)
 * 2. Semantic chunking (by function/class)
 * 3. Semantic with lookahead (preserve imports)
 */
import { CodeChunk } from '../types/index.js';
/**
 * Token estimator - rough approximation
 * More accurate would use actual tokenizer from embedding model
 */
export declare function estimateTokenCount(text: string): number;
/**
 * Chunk configuration
 */
export interface ChunkingConfig {
    strategy: 'fixed' | 'semantic' | 'semantic-with-lookahead';
    maxTokens?: number;
    maxChars?: number;
    overlapTokens?: number;
}
/**
 * Chunking result with metadata
 */
export interface ChunkingResult {
    chunks: CodeChunk[];
    strategy: string;
    statistics: {
        totalChunks: number;
        avgChunkSize: number;
        minChunkSize: number;
        maxChunkSize: number;
        totalTokens: number;
        avgTokensPerChunk: number;
    };
}
/**
 * Semantic Chunking Strategy
 * Chunks by functions/classes/interfaces
 * Preserves complete code units
 *
 * Pros: Semantically meaningful chunks, respects code boundaries
 * Cons: Variable size, may exceed token limits, slower parsing
 */
export declare class SemanticChunker {
    private parser;
    private maxTokens;
    constructor(maxTokens?: number);
    chunkFile(filePath: string, content: string): CodeChunk[];
    /**
     * Find where imports end in a file
     */
    private findImportsEnd;
    /**
     * Split large code nodes at logical boundaries
     */
    private splitLargeNode;
}
/**
 * Fixed-Size Chunking Strategy
 * Chunks at fixed character/token boundaries
 * Simple sliding window approach
 *
 * Pros: Fast, predictable, simple to implement
 * Cons: May split related code, loses semantic meaning
 */
export declare class FixedChunker {
    private chunkSize;
    private overlapSize;
    constructor(chunkSize?: number, overlapSize?: number);
    chunkFile(filePath: string, content: string): CodeChunk[];
}
/**
 * Semantic Chunking with Lookahead
 * Like semantic, but also includes related context
 * - Imports at top of chunk
 * - Next class/function for context
 *
 * Pros: Better context, respects boundaries
 * Cons: Slower, more complex
 */
export declare class SemanticWithLookaheadChunker extends SemanticChunker {
    /**
     * Override to add lookahead for next code unit
     */
    chunkFile(filePath: string, content: string): CodeChunk[];
}
/**
 * Chunk multiple files using a strategy
 */
export declare function chunkCodebase(files: Map<string, string>, config: ChunkingConfig): Promise<ChunkingResult>;
//# sourceMappingURL=code-chunker.d.ts.map