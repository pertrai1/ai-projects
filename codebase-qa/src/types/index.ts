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

// ─── Phase 5: Evaluation Framework Types ─────────────────────────────
//
// TEACHING MOMENT: Why separate types for evaluation?
// The basic TestCase/EvaluationResult above works for simple unit tests.
// But a real evaluation framework needs richer metadata (difficulty, notes,
// expected citation paths) and multi-level metrics (intent, retrieval,
// citation, overall). These types capture that distinction.

/**
 * Extended test case for the Phase 5 evaluation framework.
 *
 * Adds difficulty levels, notes, and expected citation paths so we can
 * measure not just "did it get the right intent?" but "did it find the
 * right files AND cite them properly?"
 */
export interface EvalTestCase extends TestCase {
  /** How hard is this case? Easy = clear intent, hard = ambiguous or tricky */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Human notes explaining what makes this test case interesting */
  notes: string;
  /** File paths we expect to see in the citations (not just retrieval) */
  expectedCitationPaths?: string[];
}

/**
 * Per-test-case metrics at 4 distinct levels.
 *
 * WHY THIS MATTERS: A system can get the intent right but retrieve the wrong
 * chunks, or retrieve good chunks but generate a hallucinated answer. Measuring
 * at each level tells you WHERE the pipeline is breaking.
 */
export interface EvalMetrics {
  /** Level 1: Did QueryRouter classify correctly? (0 or 1) */
  intentCorrect: boolean;
  /** The actual intent returned by the router */
  actualIntent: QueryIntentType;

  /** Level 2: Retrieval quality */
  retrievalPrecision: number;  // Fraction of retrieved chunks that are relevant
  retrievalRecall: number;     // Fraction of expected chunks that were retrieved
  retrievalMRR: number;        // Mean Reciprocal Rank of first relevant result

  /** Level 3: Citation quality (from CitationValidator) */
  faithfulnessScore: number;   // 0-1, from existing validator
  citationCoverage: number;    // Do citations reference the expected files?

  /** Level 4: Weighted composite */
  overallScore: number;
}

/**
 * Aggregate report across all test cases.
 *
 * This is what gets printed to the console and saved to JSON for
 * tracking improvement over time.
 */
export interface EvalReport {
  /** When this evaluation was run */
  timestamp: string;
  /** Total test cases evaluated */
  totalCases: number;
  /** Cases where overall score >= threshold */
  passed: number;
  /** Cases where overall score < threshold */
  failed: number;

  /** Level 1 aggregate: intent accuracy per type and overall */
  intentAccuracy: {
    overall: number;
    byType: Record<string, { correct: number; total: number; accuracy: number }>;
  };

  /** Level 2 aggregate: retrieval metrics */
  retrievalQuality: {
    avgPrecision: number;
    avgRecall: number;
    avgMRR: number;
  };

  /** Level 3 aggregate: citation metrics */
  citationQuality: {
    avgFaithfulness: number;
    avgCoverage: number;
  };

  /** Level 4 aggregate: overall composite */
  overallScore: number;

  /** Detailed per-case results */
  results: Array<{
    testCase: EvalTestCase;
    metrics: EvalMetrics;
    /** Human-readable failure reason, if any */
    failureReason?: string;
  }>;

  /** Configuration used for this run */
  config: {
    passThreshold: number;
    weights: { intent: number; retrieval: number; citation: number };
    filters?: { intent?: string; difficulty?: string; id?: string };
  };
}