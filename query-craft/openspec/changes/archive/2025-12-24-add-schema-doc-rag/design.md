# Design: Schema Documentation RAG

**Change ID:** `add-schema-doc-rag`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Natural Language Query                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Query Generator     │
                    │     (Agent)          │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴───────────────┐
                │                              │
                ▼                              ▼
     ┌────────────────────┐        ┌─────────────────────┐
     │ Schema Loader      │        │ Schema Doc Retriever│
     │ (existing)         │        │ (new tool)          │
     └─────────┬──────────┘        └──────────┬──────────┘
               │                               │
               │                               │
     ┌─────────▼─────────┐          ┌─────────▼──────────┐
     │ data/schemas/     │          │ data/schemas/      │
     │ ecommerce.json    │          │ ecommerce/docs/    │
     └───────────────────┘          └────────────────────┘
               │                               │
               │                               │
               └───────────┬───────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │  Formatted Schema    │
                │  Context for LLM     │
                └──────────────────────┘
```

## Decision: Retrieval Strategy

### Option 1: Full Schema (Current Behavior)
- Load entire schema JSON
- Format all tables and columns
- Works well for small schemas (<10 tables)
- Violates 70% context limit for large schemas

### Option 2: RAG-based Focused Schema (Proposed)
- Retrieve relevant documentation based on question
- Format only retrieved tables/columns
- Reduces context usage for large schemas
- Requires documentation maintenance

### Decision: Hybrid Approach
Use RAG when schema is large (configurable threshold), fall back to full schema for small databases.

**Heuristic:**
```typescript
const shouldUseRetrieval = (schema: DatabaseSchema) => {
  const tableCount = schema.tables.length;
  const enabledInConfig = config.ENABLE_DOC_RETRIEVAL;

  return enabledInConfig && tableCount >= config.RETRIEVAL_TABLE_THRESHOLD;
};
```

**Default threshold:** 10 tables

## Schema Documentation Format

### Directory Structure

```
data/schemas/
├── ecommerce.json                 # Existing schema definition
└── ecommerce/
    └── docs/
        ├── _index.md             # Database overview
        ├── users.md              # Per-table documentation
        ├── products.md
        └── orders.md
```

### Markdown Format Specification

Each table documentation file follows this structure:

```markdown
# Table: <table_name>

## Purpose

Brief description of what this table represents and its role in the system.

## Business Context

Domain-specific information, business rules, ownership, data sensitivity.

## Columns

### <column_name>

- **Type:** <sql_type>
- **Description:** <detailed description>
- **Domain:** <value constraints, enum values, or ranges>
- **Nullable:** <yes/no>
- **Notes:** <edge cases, data quality issues, etc.>

(Repeat for each important column)

## Common Queries

### Query Pattern: <pattern_name>

Description of when and why this query pattern is used.

```sql
SELECT ...
FROM <table_name>
WHERE ...
```

**Use case:** <explanation>
**Returns:** <description of result>

(Repeat for common patterns)

## Relationships

- **Related tables:** <list of frequently joined tables>
- **Join patterns:** <typical join conditions>

## Examples

Representative data examples or value distributions.

## Notes

- Data quality considerations
- Historical context
- Migration notes
- Known issues or limitations
```

### Metadata Extraction

From markdown files, extract:
- **Table name:** From `# Table: <name>` header
- **Sections:** Map sections to chunk types (purpose, columns, queries, etc.)
- **Code blocks:** Extract SQL examples with context
- **Column info:** Parse column subsections for targeted retrieval

## Document Chunking Strategy

### Chunking Levels

1. **Table-level chunk:** Entire table overview (Purpose + Business Context)
2. **Column-level chunks:** Individual column descriptions
3. **Query pattern chunks:** Each common query with context
4. **Relationship chunks:** Join patterns and related tables

### Chunk Structure

```typescript
interface DocumentChunk {
  // Content
  content: string;           // The actual text content

  // Metadata
  table: string;             // Table this chunk relates to
  chunkType: ChunkType;      // 'overview' | 'column' | 'query' | 'relationship'
  column?: string;           // If chunkType is 'column'

  // Retrieval
  embedding?: number[];      // Future: for vector similarity
  tokens: number;            // Estimated token count

  // Context
  relatedTables: string[];   // Tables mentioned in this chunk
  keywords: string[];        // Extracted important terms
}

type ChunkType = 'overview' | 'column' | 'query' | 'relationship' | 'example';
```

### Chunking Algorithm

```
For each table documentation file:
  1. Parse markdown into sections
  2. Create table-level chunk from Purpose + Business Context
  3. For each column subsection:
     - Create column-level chunk with full column details
  4. For each common query:
     - Create query-pattern chunk with SQL + use case
  5. Create relationship chunk from Relationships section

  Attach metadata to each chunk:
  - table name
  - chunk type
  - related tables (from FK references, join patterns)
  - keywords (extract from headers, column names)
```

## Retrieval Algorithm

### Phase 1: Simple Lexical Matching (Initial Implementation)

Use BM25 or TF-IDF scoring:

```typescript
function retrieveRelevantChunks(
  question: string,
  chunks: DocumentChunk[],
  topK: number = 5
): ScoredChunk[] {
  // 1. Tokenize question
  const queryTokens = tokenize(question);

  // 2. Score each chunk using BM25
  const scored = chunks.map(chunk => ({
    chunk,
    score: bm25Score(queryTokens, chunk.content)
  }));

  // 3. Sort by score and take top-K
  const ranked = scored.sort((a, b) => b.score - a.score);

  // 4. Apply relevance threshold
  const filtered = ranked.filter(s => s.score >= RELEVANCE_THRESHOLD);

  return filtered.slice(0, topK);
}
```

**BM25 Parameters:**
- k1 = 1.5 (term frequency saturation)
- b = 0.75 (length normalization)

### Phase 2: Semantic Matching (Future Enhancement)

Replace lexical matching with embedding-based similarity:

```typescript
function retrieveRelevantChunks(
  question: string,
  chunks: DocumentChunk[],
  topK: number = 5
): ScoredChunk[] {
  // 1. Generate question embedding
  const questionEmbedding = await generateEmbedding(question);

  // 2. Compute cosine similarity with each chunk
  const scored = chunks.map(chunk => ({
    chunk,
    score: cosineSimilarity(questionEmbedding, chunk.embedding!)
  }));

  // 3. Rank and filter
  return scored
    .sort((a, b) => b.score - a.score)
    .filter(s => s.score >= SEMANTIC_THRESHOLD)
    .slice(0, topK);
}
```

**Embedding Options:**
- Anthropic Voyage embeddings
- OpenAI embeddings (text-embedding-3-small)
- Sentence Transformers (local, no API calls)

## Query Generator Integration

### Modified Workflow

```typescript
async function generateQuery(input: QueryGeneratorInput): Promise<QueryGeneratorOutput> {
  // 1. Load base schema
  const schema = await schemaLoader.execute({ database: input.database });

  // 2. Determine retrieval strategy
  const useRetrieval = shouldUseRetrieval(schema.schema);

  let schemaContext: string;
  let retrievalMetadata: RetrievalMetadata | undefined;

  if (useRetrieval) {
    // 3a. Retrieve relevant documentation
    const retrieved = await schemaDocRetriever.execute({
      question: input.question,
      database: input.database,
      topK: config.DOC_RETRIEVAL_TOP_K
    });

    // 3b. Format focused schema from retrieved chunks
    schemaContext = formatFocusedSchema(schema.schema, retrieved.chunks);
    retrievalMetadata = {
      strategy: 'rag',
      chunksRetrieved: retrieved.chunks.length,
      tablesIncluded: [...new Set(retrieved.chunks.map(c => c.table))],
      avgRelevanceScore: mean(retrieved.chunks.map(c => c.score))
    };
  } else {
    // 3c. Use full schema (current behavior)
    schemaContext = formatFullSchema(schema.schema);
    retrievalMetadata = {
      strategy: 'full',
      tablesIncluded: schema.tables
    };
  }

  // 4. Generate query with LLM (unchanged)
  const response = await llmClient.generateJSON(
    systemPrompt,
    buildUserMessage(input.question, schemaContext)
  );

  // 5. Include retrieval metadata in output
  return {
    ...response,
    retrievalMetadata
  };
}
```

### Focused Schema Formatting

When using retrieval, format only the relevant parts:

```typescript
function formatFocusedSchema(
  schema: DatabaseSchema,
  chunks: ScoredChunk[]
): string {
  // Extract unique tables from retrieved chunks
  const relevantTables = new Set(chunks.map(c => c.table));

  // Include related tables (from FK relationships)
  const expandedTables = expandWithRelationships(
    schema,
    Array.from(relevantTables)
  );

  // Format only these tables
  const filtered = {
    ...schema,
    tables: schema.tables.filter(t => expandedTables.has(t.name))
  };

  // Add retrieved documentation context
  let formatted = formatSchemaStructure(filtered);
  formatted += "\n## Retrieved Documentation\n\n";

  for (const { chunk, score } of chunks) {
    formatted += `### ${chunk.table}`;
    if (chunk.column) formatted += `.${chunk.column}`;
    formatted += `\n${chunk.content}\n\n`;
  }

  return formatted;
}
```

### Relationship Expansion

Always include tables that are directly related to retrieved tables:

```typescript
function expandWithRelationships(
  schema: DatabaseSchema,
  tables: string[]
): Set<string> {
  const expanded = new Set(tables);

  // Add tables referenced by foreign keys
  for (const table of tables) {
    const tableObj = schema.tables.find(t => t.name === table);
    if (!tableObj) continue;

    for (const col of tableObj.columns) {
      if (col.foreignKey) {
        expanded.add(col.foreignKey.table);
      }
    }
  }

  return expanded;
}
```

## Configuration

### Environment Variables

```bash
# Enable/disable retrieval
ENABLE_DOC_RETRIEVAL=true

# Retrieval parameters
DOC_RETRIEVAL_TOP_K=5
DOC_RELEVANCE_THRESHOLD=0.3
RETRIEVAL_TABLE_THRESHOLD=10

# Future: embedding configuration
# EMBEDDING_PROVIDER=anthropic
# EMBEDDING_MODEL=voyage-2
```

### Runtime Configuration

```typescript
interface RAGConfig {
  enabled: boolean;
  topK: number;
  relevanceThreshold: number;
  tableThreshold: number;
  debugMode: boolean;
}

const defaultConfig: RAGConfig = {
  enabled: true,
  topK: 5,
  relevanceThreshold: 0.3,
  tableThreshold: 10,
  debugMode: false
};
```

## Performance Considerations

### Latency Budget

- **Documentation loading:** <10ms (cached after first load)
- **Chunking:** <10ms (pre-computed on load)
- **Retrieval scoring:** <50ms (for 100 chunks)
- **Schema formatting:** <30ms
- **Total overhead:** <100ms

### Optimization Strategies

1. **Caching:**
   - Cache loaded documentation per database
   - Cache computed chunks
   - Invalidate on file changes

2. **Pre-computation:**
   - Generate embeddings offline (Phase 2)
   - Store in metadata files alongside docs

3. **Lazy Loading:**
   - Only load docs when retrieval is needed
   - Stream large documentation files

### Memory Usage

For typical schemas:
- 10 tables × 5 chunks/table × 500 tokens/chunk = ~25k tokens in memory
- Negligible compared to LLM context window

## Error Handling

### Fallback Strategy

```typescript
async function retrieveWithFallback(input: SchemaDocRetrieverInput) {
  try {
    // Attempt RAG retrieval
    const chunks = await retriever.execute(input);

    if (chunks.length === 0 || avgScore(chunks) < MIN_CONFIDENCE) {
      console.warn('Low-quality retrieval, falling back to full schema');
      return { strategy: 'full', chunks: [] };
    }

    return { strategy: 'rag', chunks };
  } catch (error) {
    console.error('Retrieval failed, using full schema:', error);
    return { strategy: 'full', chunks: [] };
  }
}
```

### Edge Cases

1. **Missing documentation:** Fall back to schema JSON descriptions
2. **Empty retrieval results:** Use full schema
3. **Malformed markdown:** Log error, skip that file
4. **Question too short:** Use full schema (not enough signal for retrieval)

## Testing Strategy

### Unit Tests

- Test chunk generation from markdown
- Test BM25 scoring correctness
- Test relevance filtering
- Test relationship expansion

### Integration Tests

- Test end-to-end retrieval with sample questions
- Verify correct tables are retrieved
- Measure context size reduction
- Compare accuracy with/without RAG

### Evaluation Metrics

1. **Retrieval Quality:**
   - Precision@K: % of retrieved chunks that are relevant
   - Recall@K: % of relevant chunks that were retrieved
   - MRR (Mean Reciprocal Rank): Position of first relevant result

2. **Query Generation Impact:**
   - Accuracy: % of queries that are correct
   - Context size: Average tokens used (should decrease)
   - Latency: End-to-end generation time

3. **User Experience:**
   - Success rate: % of queries that get good results
   - Confidence calibration: Do confidence scores match accuracy?

## Future Enhancements

Not in this proposal, but documented for reference:

1. **Vector database integration:** Store embeddings in pgvector, ChromaDB, or Pinecone
2. **Query result caching:** Cache generated SQL for similar questions
3. **Documentation auto-generation:** Extract docs from database metadata (COMMENT)
4. **Multi-modal documentation:** Support images, diagrams in documentation
5. **Feedback loop:** Learn from user corrections to improve retrieval
6. **Cross-database retrieval:** Learn patterns across different schemas
7. **Temporal documentation:** Version docs alongside schema migrations

## Trade-offs

| Aspect | Full Schema | RAG Approach |
|--------|-------------|--------------|
| Context size | Large (all tables) | Focused (relevant only) |
| Implementation complexity | Simple | Moderate |
| Accuracy for small schemas | Good | Same (fallback) |
| Accuracy for large schemas | Poor (context overflow) | Better (focused) |
| Maintenance | Low | Higher (docs) |
| Latency | Baseline | +<100ms |
| Scalability | Limited | Good |

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Use markdown for docs | Human-readable, version-controllable, widely supported |
| Start with BM25, not embeddings | Simpler, no API dependencies, faster initial implementation |
| Hybrid (full + RAG) approach | Maintains backward compatibility, adaptive to schema size |
| Expand with relationships | Ensures FK-related tables are included for valid joins |
| Threshold at 10 tables | Based on typical context limits and performance testing |
| Top-K = 5 chunks | Balances coverage with context efficiency |
| Relevance threshold = 0.3 | Empirically determined (to be validated in testing) |
