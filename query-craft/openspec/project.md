# Project Context

## Purpose

QueryCraft is a natural language to SQL query generator with built-in validation, safety guardrails, and evaluation framework. The system converts plain English questions into safe, validated PostgreSQL queries following research-based prompting principles.

## Tech Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **AI Model:** Claude (Anthropic)
- **Database:** PostgreSQL
- **Evaluation:** Braintrust
- **Testing:** Jest/Vitest (TODO: verify)
- **Build:** TypeScript Compiler

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
│   ├── tools/          # Utilities for SQL parsing, validation
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   └── workflows/      # Multi-step query generation workflows
├── data/
│   ├── databases/      # Sample databases
│   └── schemas/        # Database schema definitions
├── docs/
│   └── references/     # Research papers and references
├── scripts/            # Setup and utility scripts
├── specs/
│   ├── agents/         # Agent specifications
│   ├── tools/          # Tool specifications
│   ├── workflows/      # Workflow specifications
│   └── evals/          # Evaluation specifications
└── tests/              # Test files
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

- Target PostgreSQL SQL dialect
- Maximum query complexity limits (prevent cartesian products)
- API rate limits (Claude API)
- Context window management (don't exceed 70% for cross-domain)

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
async function queryWorkflow(nlQuery: string): Promise<SafeQuery> {
  const schema = await loadSchema();
  const sql = await agent.generateSQL(nlQuery, schema);
  const syntaxValid = await syntaxValidator.validate(sql);
  const schemaValid = await schemaValidator.validate(sql, schema);
  const safetyValid = await safetyValidator.validate(sql, schema);

  if (allValid) {
    return { sql, confidence, explanation };
  }
  throw new ValidationError(reasons);
}
```

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` - Required for Claude API
- `DATABASE_URL` - PostgreSQL connection string
- `BRAINTRUST_API_KEY` - For evaluation framework
- `LOG_LEVEL` - Logging verbosity
- `MAX_QUERY_COMPLEXITY` - Safety threshold

### Feature Flags

- `ALLOW_WRITE_OPERATIONS` - Enable INSERT/UPDATE (default: false)
- `STRICT_VALIDATION` - Extra validation checks (default: true)
- `ENABLE_CACHING` - Cache schema metadata (default: true)

## Performance Targets

- Query generation: < 2 seconds (p95)
- Validation: < 100ms
- End-to-end: < 3 seconds (p95)
- Accuracy: > 85% on benchmark datasets
