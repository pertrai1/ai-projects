# Project Context

## Purpose

QueryCraft is a natural language to SQL query generator with built-in validation, safety guardrails, and evaluation framework. The system converts plain English questions into safe, validated SQL queries following research-based prompting principles. Features conversational refinement and intelligent schema documentation retrieval for large databases.

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **AI Model:** Claude (Anthropic)
- **Database:** SQLite (via better-sqlite3)
- **Evaluation:** Braintrust (with autoevals)
- **Build:** TypeScript Compiler
- **CLI Framework:** Commander.js
- **UI Libraries:** Chalk, Ora

## Project Conventions

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use camelCase for variables and functions
- Use PascalCase for types and interfaces
- Prefer const over let
- Use async/await over promises
- Include JSDoc comments for public APIs

### Architecture Patterns

- **Agent-based architecture:** Separate agents for query generation, validation, and safety
- **Layered validation:** Syntax → Schema → Safety checks
- **Confidence scoring:** Every generated query includes confidence metrics
- **Research-grounded prompting:** Follow Chang & Fosler-Lussier (2023) principles (see AGENTS.md)

### Directory Structure

```
query-craft/
├── src/
│   ├── agents/         # Query generation and validation agents
│   │   ├── query-generator.ts
│   │   ├── query-refiner.ts
│   │   ├── sql-validator.ts
│   │   ├── query-executor.ts
│   │   ├── schema-loader.ts
│   │   ├── dialog-manager.ts
│   │   └── braintrust-evaluator.ts
│   ├── tools/          # Utilities for SQL parsing, validation, RAG
│   │   ├── spec-loader.ts
│   │   ├── schema-doc-loader.ts
│   │   └── schema-doc-retriever.ts
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   │   ├── llm-client.ts
│   │   ├── result-formatter.ts
│   │   └── rag-config.ts
│   └── workflows/      # Multi-step query generation workflows
│       ├── sql-generation.ts
│       ├── sql-refinement.ts
│       └── interactive-refinement.ts
├── data/
│   ├── databases/      # SQLite sample databases
│   ├── schemas/        # Database schema definitions & documentation
│   │   ├── _templates/ # Schema documentation templates
│   │   └── ecommerce/  # Example schema with docs/
│   └── evals/          # Evaluation datasets
├── docs/
│   └── references/     # Research papers and references
├── scripts/            # Setup and utility scripts
│   └── create-sample-db.ts
├── specs/
│   ├── agents/         # Agent specifications
│   ├── tools/          # Tool specifications
│   ├── workflows/      # Workflow specifications
│   └── evals/          # Evaluation specifications
├── evals/              # Braintrust evaluation scripts
│   ├── run-evals.ts
│   ├── metrics/
│   ├── reporters/
│   ├── results/
│   └── utils/
└── tests/              # Test files (in src/tests/)
```

### Testing Strategy

- Unit tests for individual components (agents, tools, validators)
- Integration tests for complete workflows
- Evaluation tests using Braintrust framework
- Test coverage for all safety guardrails
- Scenario-based testing matching spec scenarios

### Git Workflow

- Use feature branches for new capabilities
- Follow OpenSpec workflow for changes
- Commit messages should reference change IDs when applicable
- Keep commits atomic and focused

## Domain Context

### Text-to-SQL Concepts

- **Natural Language Query (NLQ):** User's question in plain English
- **SQL Generation:** Converting NLQ to executable SQL
- **Schema Context:** Database structure (tables, columns, relationships)
- **Few-shot Learning:** Providing example NLQ→SQL pairs
- **Cross-domain:** Handling queries across different database schemas
- **Query Refinement:** Iterative improvement through conversational feedback
- **Intent Detection:** Classifying user input as new query vs refinement
- **RAG (Retrieval-Augmented Generation):** Using schema documentation retrieval for large databases

### Interactive Features

- **Conversational Mode:** Multi-turn dialog with conversation history
- **Query Refinement:** Natural feedback like "only from last month" or "sort by name"
- **Dialog Management:** Rule-based intent classification for fast, deterministic behavior
- **Session State:** Maintains context across conversation turns
- **Refinement Keywords:** System recognizes "only", "also", "add", "remove", "change", etc.
- **New Query Detection:** Detects fresh queries via keywords like "show", "find", "list", etc.

### Schema Documentation RAG

- **BM25 Retrieval:** Semantic search for relevant table documentation
- **Automatic Activation:** Triggers for schemas with 10+ tables (configurable)
- **Context Management:** Reduces LLM context usage by 50%+ while maintaining accuracy
- **Table-Level Docs:** Structured markdown documentation per table
- **Relationship Expansion:** Includes related tables via foreign keys
- **Configuration:** Tunable via environment variables (topK, threshold, table count)

### Security & Safety

- **SQL Injection Prevention:** Validate all generated queries
- **Destructive Operation Prevention:** Block DROP, TRUNCATE, DELETE without WHERE
- **Schema Validation:** Ensure queries only reference existing tables/columns
- **Rate Limiting:** Control API usage
- **Audit Logging:** Track all generated queries

### Validation Layers

1. **Syntax Validation:** Ensure SQL is parseable
2. **Schema Validation:** Verify tables/columns exist
3. **Safety Validation:** Check for dangerous operations
4. **Confidence Scoring:** Assess query reliability

## Important Constraints

### Technical Constraints

- Target SQLite SQL dialect (not PostgreSQL)
- Maximum query complexity limits (prevent cartesian products)
- API rate limits (Claude API)
- Context window management (don't exceed 70% for cross-domain)
- Maximum result rows: 100 (configurable via QueryExecutor)
- Query timeout: 5000ms (5 seconds)
- Read-only database mode enforced at runtime

### Business Constraints

- Read-only operations by default
- Explicit approval required for write operations
- No access to system tables or metadata
- Must maintain audit trail

### Safety Constraints

- Never generate queries with:
  - Dynamic SQL execution
  - User-provided raw SQL
  - Unvalidated table/column names
- Always validate before execution
- Provide explanations for rejected queries

## External Dependencies

### Anthropic Claude API

- Used for: NLQ→SQL generation
- Rate limits: Respect tier limits
- Error handling: Implement exponential backoff
- Context management: Follow research principles (see AGENTS.md)

### PostgreSQL

- Target version: 12+
- Connection pooling required
- Prepared statements for execution
- Schema introspection for validation

### SQLite (Actual Implementation)

- Database engine: SQLite via better-sqlite3
- Read-only mode enforced
- Timeout configuration supported
- Local file-based databases in data/databases/

### Braintrust

- Evaluation framework
- Metrics tracking
- Dataset management
- Performance benchmarking

## Research Foundation

This project implements findings from:

**Chang, Shuaichen, and Eric Fosler-Lussier (2023).**  
_How to Prompt LLMs for Text-to-SQL: A Study in Zero-shot, Single-domain, and Cross-domain Settings._  
arXiv:2305.11853

Key takeaways:

- Use CREATE TABLE format for schema representation
- Include column-wise distinct values for database content
- Limit context usage to ~70% in cross-domain settings
- Combine few-shot examples with database content
- Normalize SQL formatting for consistency

See [openspec/AGENTS.md](./AGENTS.md#research-grounded-prompting-policy-text-to-sql) for detailed prompting principles.

## Code Examples

### Workflow Architecture

QueryCraft implements three main workflows:

1. **SqlGenerationWorkflow** - Basic NLQ to SQL generation with validation
2. **SqlRefinementWorkflow** - Refines existing queries based on user feedback
3. **InteractiveRefinementWorkflow** - Orchestrates dialog flow with intent detection

### Agent Roster

**LLM-Based Agents:**

- `QueryGenerator` - Converts NLQ to SQL using Claude with research-based prompting
- `QueryRefiner` - Refines queries based on user feedback and previous results
- `SqlValidator` - Validates syntax, schema, and safety using LLM reasoning

**Deterministic Agents:**

- `SchemaLoader` - Loads and validates database schemas (no LLM)
- `QueryExecutor` - Executes validated queries safely in read-only mode (no LLM)
- `DialogManager` - Rule-based intent detection for conversation flow (no LLM)
- `BraintrustEvaluator` - Evaluation metrics and testing (no LLM)

**RAG Tools:**

- `SchemaDocLoader` - Loads schema documentation from markdown files
- `SchemaDocRetriever` - BM25-based semantic retrieval for relevant schema docs

### Agent Pattern

```typescript
interface QueryAgent {
  generateSQL(nlQuery: string, schema: Schema): Promise<QueryResult>;
  getConfidence(result: QueryResult): number;
}

class TextToSQLAgent implements QueryAgent {
  async generateSQL(nlQuery: string, schema: Schema): Promise<QueryResult> {
    // Use Claude API with research-based prompting
    // Include schema in CREATE TABLE format
    // Add column-wise distinct values
  }
}
```

### Dialog Management Pattern

```typescript
class DialogManager {
  detectIntent(userInput: string): IntentType {
    // Rule-based intent classification
    // Check for refinement keywords: "only", "also", "add", "change"
    // Check for new query keywords: "show", "find", "list"
    // Return: "new_query" | "refinement"
  }

  updateState(turn: ConversationTurn): void {
    // Maintain conversation history
    // Track current query and results
  }
}
```

### RAG Retrieval Pattern

```typescript
class SchemaDocRetriever {
  async retrieve(question: string, schema: Schema): Promise<ScoredChunk[]> {
    // Use BM25 scoring for semantic search
    // Retrieve topK relevant documentation chunks
    // Filter by relevance threshold
    // Return scored and ranked results
  }
}
```

### Validation Pattern

```typescript
interface Validator {
  validate(sql: string, schema: Schema): ValidationResult;
}

class SafetyValidator implements Validator {
  validate(sql: string, schema: Schema): ValidationResult {
    // Check for destructive operations
    // Validate against schema
    // Return pass/fail with reasons
  }
}
```

### Workflow Pattern

```typescript
// Basic SQL Generation Workflow
async function queryWorkflow(nlQuery: string): Promise<SafeQuery> {
  const schema = await schemaLoader.execute();
  const sql = await queryGenerator.generateSQL(nlQuery, schema);
  const validation = await sqlValidator.validate(sql, schema);
  const execution = await queryExecutor.execute(sql, validation);

  return { sql, validation, execution, confidence };
}

// Interactive Refinement Workflow
async function interactiveWorkflow(userInput: string): Promise<Result> {
  const intent = dialogManager.detectIntent(userInput);

  if (intent === "new_query") {
    return await sqlGenerationWorkflow.execute(userInput);
  } else {
    return await sqlRefinementWorkflow.refine({
      feedback: userInput,
      currentQuery: state.currentQuery,
      originalQuestion: state.originalQuestion,
    });
  }
}
```

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` - Required for Claude API
- `BRAINTRUST_API_KEY` - For evaluation framework
- `LOG_LEVEL` - Logging verbosity
- `MAX_QUERY_COMPLEXITY` - Safety threshold

#### RAG Configuration

- `ENABLE_DOC_RETRIEVAL` - Enable/disable RAG retrieval (default: true)
- `DOC_RETRIEVAL_TOP_K` - Number of documentation chunks to retrieve (default: 5)
- `DOC_RELEVANCE_THRESHOLD` - Minimum relevance score 0.0-1.0 (default: 0.3)
- `RETRIEVAL_TABLE_THRESHOLD` - Minimum tables before RAG activates (default: 10)
- `RAG_DEBUG_MODE` - Show retrieval details (default: false)

### Feature Flags

- `ALLOW_WRITE_OPERATIONS` - Enable INSERT/UPDATE (default: false)
- `STRICT_VALIDATION` - Extra validation checks (default: true)
- `ENABLE_CACHING` - Cache schema metadata (default: true)

## CLI Commands

QueryCraft provides a full-featured CLI built with Commander.js:

### Commands

- `querycraft generate <question>` - Generate SQL from natural language
  - Options: `-d/--database`, `-v/--verbose`, `--no-validate`, `--no-execute`, `-f/--format`, `-l/--limit`
- `querycraft interactive` (alias: `i`) - Start interactive REPL mode with conversational refinement
  - Options: `-d/--database`
- `querycraft schemas` - List available database schemas
- `querycraft schema <database>` - Show detailed schema information
- `querycraft refine` - Refine existing query with feedback
- `querycraft validate` - Validate SQL query

### Interactive Mode Features

- Multi-turn conversations with history
- Intent detection (new query vs refinement)
- Commands: `/new`, `/history`, `/clear`, `/help`
- Natural refinements: "only last month", "sort by name", "limit to 10"
- Query execution with formatted results (table, JSON, CSV)

## Performance Targets

- Query generation: < 2 seconds (p95)
- Validation: < 100ms
- End-to-end: < 3 seconds (p95)
- Accuracy: > 85% on benchmark datasets
