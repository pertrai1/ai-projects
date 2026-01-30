/**
 * Core type definitions for the Codebase Q&A system
 *
 * Learning focus (Phase 0): Understanding how to structure type definitions
 * for code-aware RAG systems
 */
/**
 * Metadata associated with a code chunk
 * Preserves context about where the code came from and what it represents
 */
export interface CodeChunkMetadata {
    filePath: string;
    fileName: string;
    startLine: number;
    endLine: number;
    scopeName?: string;
    scopeType?: 'function' | 'class' | 'module' | 'interface' | 'type';
    functionSignature?: string;
    imports: string[];
    dependencies?: string[];
    dependents?: string[];
    isExported: boolean;
    documentation?: string;
    embeddingId?: string;
    chunkIndex: number;
}
/**
 * A chunk of code with its metadata
 * Represents a semantically meaningful unit of code
 */
export interface CodeChunk {
    id: string;
    content: string;
    metadata: CodeChunkMetadata;
    tokenCount?: number;
}
/**
 * Query intent types for code questions
 * Different query types need different retrieval strategies
 */
export type QueryIntentType = 'ARCHITECTURE' | 'IMPLEMENTATION' | 'DEPENDENCY' | 'USAGE' | 'DEBUGGING' | 'COMPARISON' | 'LOCATION' | 'GENERAL';
/**
 * Query intent classification result
 */
export interface QueryIntent {
    type: QueryIntentType;
    confidence: number;
    reasoning: string;
    entities: QueryEntity[];
    searchStrategy: 'focused' | 'broad' | 'multi-step';
}
/**
 * Entities extracted from a query
 * Examples: function names, file paths, class names
 */
export interface QueryEntity {
    type: 'function' | 'class' | 'module' | 'file' | 'pattern' | 'keyword';
    value: string;
    confidence: number;
}
/**
 * Retrieval strategy parameters
 * Adaptive parameters based on query intent
 */
export interface RetrievalStrategy {
    k: number;
    expandQuery: boolean;
    filters?: RetrievalFilter[];
    contextWindow: 'narrow' | 'medium' | 'broad';
    boostSignals?: string[];
}
/**
 * Filter for retrieval (e.g., filter by imports, file type)
 */
export interface RetrievalFilter {
    type: 'import' | 'file_pattern' | 'scope' | 'export_only';
    value: string | string[];
}
/**
 * Retrieved code chunk with relevance score
 */
export interface RetrievedChunk extends CodeChunk {
    relevanceScore: number;
    rankingSignals?: Record<string, number>;
    retrievalMethod?: string;
}
/**
 * Code snippet for display in responses
 */
export interface CodeSnippet {
    code: string;
    filePath: string;
    startLine: number;
    endLine: number;
    language: string;
    highlighted?: boolean;
    highlightLines?: number[];
}
/**
 * Response with citations
 */
export interface CodeQAResponse {
    content: string;
    citations: Citation[];
    confidence: number;
    reasoning?: string;
    retrievalMetrics?: {
        chunksRetrieved: number;
        chunksUsed: number;
        retrievalTime?: number;
    };
}
/**
 * Citation for code used in a response
 */
export interface Citation {
    id: string;
    chunkId: string;
    filePath: string;
    startLine: number;
    endLine: number;
    snippet: string;
    relevance: number;
}
/**
 * Conversation context for multi-turn queries
 */
export interface ConversationContext {
    id: string;
    turns: ConversationTurn[];
    activeContext: {
        mentionedFiles: Set<string>;
        mentionedFunctions: Set<string>;
        mentionedModules: Set<string>;
        lastQueryIntent?: QueryIntentType;
    };
}
/**
 * A single turn in a conversation
 */
export interface ConversationTurn {
    id: string;
    query: string;
    queryIntent: QueryIntent;
    response: CodeQAResponse;
    timestamp: number;
    retrievedChunks: RetrievedChunk[];
}
/**
 * AST node for code structure
 */
export interface CodeASTNode {
    type: 'function' | 'class' | 'interface' | 'type' | 'enum' | 'import' | 'export';
    name: string;
    startLine: number;
    endLine: number;
    parent?: string;
    children: string[];
    signature?: string;
    documentation?: string;
    imports: string[];
}
/**
 * File structure analysis
 */
export interface FileStructure {
    filePath: string;
    fileName: string;
    language: string;
    nodes: CodeASTNode[];
    imports: string[];
    exports: string[];
    dependencies: string[];
}
//# sourceMappingURL=index.d.ts.map