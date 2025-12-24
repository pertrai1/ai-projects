/**
 * Database Schema Types
 */
export interface Column {
  name: string;
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
  unique?: boolean;
  default?: string;
  description?: string;
  foreignKey?: {
    table: string;
    column: string;
  };
}

export interface Table {
  name: string;
  description?: string;
  columns: Column[];
  indexes?: Array<{
    columns: string[];
    unique?: boolean;
  }>;
}

export interface Relationship {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
  description?: string;
}

export interface DatabaseSchema {
  name: string;
  description?: string;
  version: string;
  tables: Table[];
  relationships?: Relationship[];
}

/**
 * Agent Input/Output Types (from specs)
 */

// Schema Loader
export interface SchemaLoaderInput {
  database: string;
}

export interface SchemaLoaderOutput {
  schemaName: string;
  schema: DatabaseSchema;
  tables: string[];
  relationships: Relationship[];
  validationStatus: "valid" | "invalid";
}

// Query Generator
export interface QueryGeneratorInput {
  question: string;
  schema: DatabaseSchema;
  database?: string; // Database name for RAG retrieval
  useRetrieval?: boolean; // Override auto-detection
  retrievalConfig?: {
    topK?: number;
    relevanceThreshold?: number;
  };
}

export interface QueryGeneratorOutput {
  query: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
  tablesUsed: string[];
  assumptions?: string[];
  retrievalMetadata?: RetrievalMetadata;
}

// Schema Doc Retriever
export type ChunkType =
  | "overview"
  | "column"
  | "query"
  | "relationship"
  | "example";

export interface DocumentChunk {
  content: string; // The actual text content
  table: string; // Table this chunk relates to
  chunkType: ChunkType;
  column?: string; // If chunkType is 'column'
  relatedTables: string[]; // Tables mentioned in this chunk
  keywords: string[]; // Extracted important terms
  tokens: number; // Estimated token count
}

export interface ScoredChunk {
  chunk: DocumentChunk;
  score: number; // Relevance score [0-1]
}

export interface RetrievalMetadata {
  strategy: "full" | "rag";
  tablesIncluded: string[];
  chunksRetrieved?: number; // Only present if strategy='rag'
  avgRelevanceScore?: number; // Only present if strategy='rag'
  fallbackReason?: string; // Present if RAG was attempted but fell back
  totalChunksSearched?: number;
  cacheHit?: boolean;
  timingMs?: {
    load: number;
    search: number;
    rank: number;
    total: number;
  };
}

export interface SchemaDocRetrieverInput {
  database: string; // Database name (e.g., "ecommerce")
  question: string; // Natural language question
  topK?: number; // Max chunks to return (default: 5)
  relevanceThreshold?: number; // Min score for inclusion (default: 0.3)
  debugMode?: boolean; // Enable detailed logging
}

export interface SchemaDocRetrieverOutput {
  chunks: ScoredChunk[];
  metadata: RetrievalMetadata;
}

// SQL Validator
export interface SqlValidatorInput {
  query: string;
  schema: DatabaseSchema;
}

export interface SqlValidatorOutput {
  isValid: boolean;
  syntaxValid: boolean;
  schemaValid: boolean;
  safetyValid: boolean;
  complexityScore: "low" | "medium" | "high";
  errors: string[];
  warnings?: string[];
  suggestions?: string[];
}

// Workflow
export interface SqlGenerationInput {
  question: string;
  database: string;
}

export interface SqlGenerationOutput {
  query: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
  isValid: boolean;
  safetyChecks: boolean;
  errors: string[];
  warnings?: string[];
  canExecute: boolean;
  schemaUsed: string;
  executionResult?: QueryExecutorOutput;
}

/**
 * Spec Types (for loading YAML specs)
 */
export interface AgentSpec {
  version: string;
  kind: "Agent";
  metadata: {
    name: string;
    description: string;
  };
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    type?: "deterministic" | "llm";
  };
  systemPrompt?: string;
  outputSchema: {
    type: "object";
    required: string[];
    properties: Record<string, any>;
  };
}

export interface WorkflowSpec {
  version: string;
  kind: "Workflow";
  metadata: {
    name: string;
    description: string;
  };
  steps: Array<{
    id: string;
    agent: string;
    input: Record<string, any>;
  }>;
  output: Record<string, any>;
}

/**
 * Evaluation Types
 */
export interface EvalTestCase {
  question: string;
  expectedQuery?: string;
  expectedTables?: string[];
  shouldPass: boolean;
  category:
    | "simple-select"
    | "join"
    | "aggregation"
    | "filter"
    | "malicious"
    | "edge-case";
}

export interface EvalResult {
  testCase: EvalTestCase;
  generatedQuery: string;
  metrics: {
    queryCorrectness: number;
    tableAccuracy: number;
    safetyValidation: number;
    validationAccuracy: number;
  };
  passed: boolean;
}

export interface QueryExecutorInput {
  query: string;
  validationResult: {
    isValid: boolean;
    safetyValid: boolean;
  };
  database: string;
}

export interface QueryExecutorOutput {
  success: boolean;
  executionTime: number;
  rowCount: number;
  data?: any[];
  columns?: Array<{ name: string; type: string }>;
  error?: string;
  truncated: boolean;
}

// Query Refiner
export interface QueryRefinerInput {
  originalQuestion: string;
  currentQuery: string;
  feedback: string;
  previousResults?: {
    data: any[];
    rowCount: number;
  };
  schema: DatabaseSchema;
}

export interface QueryRefinerOutput {
  refinedQuery: string;
  changes: string;
  reasoning: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Dialog Manager Types
 */

export type IntentType = "new_query" | "refinement";

export interface ConversationTurn {
  id: string;
  timestamp: Date;
  userInput: string;
  intent: IntentType;
  result?: SqlGenerationOutput;
}

export interface ConversationState {
  sessionId: string;
  database: string;
  turns: ConversationTurn[];
  currentQuery?: string;
  currentResult?: SqlGenerationOutput;
}

export interface ConversationContext {
  sessionId: string;
  database: string;
  turnCount: number;
  lastQuery?: string;
  lastResult?: SqlGenerationOutput;
  recentTurns: ConversationTurn[];
}

export interface DialogManagerInput {
  userInput: string;
  database: string;
}

export interface DialogManagerOutput {
  intent: IntentType;
  context: ConversationContext;
}

/**
 * Braintrust Evaluation Types
 */

export interface BraintrustConfig {
  apiKey?: string;
  projectName: string;
  localMode: boolean;
}

export interface MetricResults {
  queryCorrectness: number;
  tableAccuracy: number;
  safetyValidation: number;
  validationAccuracy: number;
  error?: string;
}

export interface CategorySummary {
  total: number;
  passed: number;
  failed: number;
  averageMetrics: {
    queryCorrectness: number;
    tableAccuracy: number;
    safetyValidation: number;
    validationAccuracy: number;
  };
}

export interface ThresholdCheck {
  threshold: number;
  actual: number;
  passed: boolean;
}

export interface EvaluationSummary {
  experimentId: string;
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageMetrics: {
    queryCorrectness: number;
    tableAccuracy: number;
    safetyValidation: number;
    validationAccuracy: number;
  };
  byCategory: Record<string, CategorySummary>;
  thresholdStatus: {
    queryCorrectness: ThresholdCheck;
    safetyValidation: ThresholdCheck;
    validationAccuracy: ThresholdCheck;
  };
  confidenceCalibration: number;
  totalDuration: number;
}

export interface EvaluationRecord {
  testCase: EvalTestCase;
  generated: SqlGenerationOutput;
  metrics: MetricResults;
  passed: boolean;
  duration: number;
  timestamp: Date;
  error?: string;
}

export interface DatasetMetadata {
  version: string;
  created: string;
  description: string;
}

export interface EvalDataset {
  version: string;
  created: string;
  description: string;
  testCases: Array<EvalTestCase & { id: string }>;
}

export interface MetricCalculatorResult {
  score: number;
  reasoning?: string;
  error?: string;
}

export interface ConfidenceGroup {
  confidence: "high" | "medium" | "low";
  total: number;
  correct: number;
  accuracy: number;
}
