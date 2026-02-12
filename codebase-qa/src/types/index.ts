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
  // File information
  filePath: string;
  fileName: string;

  // Line information
  startLine: number;
  endLine: number;

  // Scope information
  scopeName?: string; // Function/class name this chunk belongs to
  scopeType?: 'function' | 'class' | 'module' | 'interface' | 'type';

  // Code structure
  functionSignature?: string;
  imports: string[]; // Import statements needed for this chunk

  // Relationships
  dependencies?: string[]; // Other files/modules this depends on
  dependents?: string[]; // Files/modules that depend on this

  // Metadata
  isExported: boolean;
  documentation?: string; // JSDoc/comments

  // For retrieval and ranking
  embeddingId?: string;
  chunkIndex: number; // Which chunk is this in the file (0-indexed)
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
export type QueryIntentType =
  | 'ARCHITECTURE' // How does X system work?
  | 'IMPLEMENTATION' // How is feature Y implemented?
  | 'DEPENDENCY' // What does module X depend on?
  | 'USAGE' // How do I use class X?
  | 'DEBUGGING' // Why would Z fail?
  | 'COMPARISON' // What's the difference between X and Y?
  | 'LOCATION' // Where is function X defined?
  | 'GENERAL'; // General questions

/**
 * Query intent classification result
 */
export interface QueryIntent {
  type: QueryIntentType;
  confidence: number; // 0-1 confidence score
  reasoning: string;
  entities: QueryEntity[]; // Extracted entities from query
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
 * Defines the retrieval strategy for a given intent.
 * This structure is loaded from `retrieval-strategies.yaml`.
 */
export interface RetrievalStrategy {
  k: number;
  expand_query?: boolean;
  include_module_overview?: boolean;
  exact_function_match?: boolean;
  filter_by_imports?: boolean;
  boost_examples?: boolean;
  include_error_paths?: boolean;
  exact_name_match?: boolean;
  description: string;
}

/**
 * A map of intent types to their corresponding retrieval strategies.
 */
export type RetrievalStrategies = {
  [key in QueryIntentType]?: RetrievalStrategy;
};

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
  relevanceScore: number; // 0-1 score
  rankingSignals?: Record<string, number>; // Individual signal scores
  retrievalMethod?: string; // 'semantic' | 'keyword' | 'structural'
}

/**
 * Code snippet for display in responses
 */
export interface CodeSnippet {
  code: string;
  filePath: string;
  startLine: number;
  endLine: number;
  language: string; // 'typescript', 'javascript', etc.
  highlighted?: boolean; // Whether to highlight specific lines
  highlightLines?: number[]; // Which lines to highlight
}

/**
 * Response with citations
 */
export interface CodeQAResponse {
  content: string;
  citations: Citation[];
  confidence: number; // How confident is the system in this answer?
  reasoning?: string; // Why was this answer chosen?
  retrievalMetrics?: {
    chunksRetrieved: number;
    chunksUsed: number;
    retrievalTime?: number;
  };
  validation?: {
    faithfulnessScore: number; // 0-1, how faithful is the answer to citations?
    passed: boolean; // Did validation pass?
    recommendation: 'accept' | 'review' | 'reject';
    issues: Array<{
      type: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
    }>;
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
  relevance: number; // How relevant is this citation to the answer?
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
  parent?: string; // Parent scope
  children: string[]; // Child nodes
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

/**
 * Evaluation test case
 */
export interface TestCase {
  id: string;
  query: string;
  expectedIntent: QueryIntentType;
  expectedChunks: {
    filePath: string;
    scopeName?: string;
  }[];
  expectedAnswer?: string;
  tags: string[];
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  testCaseId: string;
  retrievalPrecision: number;
  retrievalRecall: number;
  intentAccuracy: number;
  answerCorrectness?: number;
  citationAccuracy?: number;
}