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
}

export interface QueryGeneratorOutput {
  query: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
  tablesUsed: string[];
  assumptions?: string[];
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
    query_correctness: number;
    table_accuracy: number;
    safety_validation: number;
    validation_accuracy: number;
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
