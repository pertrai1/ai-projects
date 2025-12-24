# Query Generator Δ

**Capability ID:** `query-generator`
**Type:** Agent
**Delta Type:** Modification

## ADDED Requirements

### Requirement: QG-RAG-01

The query generator MUST support retrieval-augmented schema context, using retrieved documentation instead of full schema for large databases with fallback capability. (RAG Integration)

#### Scenario: Use RAG for large schema

**Given:** The database has 25 tables and RAG is enabled
**When:** Query generator receives a natural language question
**Then:** It invokes schema-doc-retriever to get focused context before generating the query

#### Scenario: Use full schema for small database

**Given:** The database has 5 tables
**When:** Query generator receives a natural language question
**Then:** It uses the full schema directly without invoking retrieval (current behavior)

#### Scenario: Fall back to full schema on retrieval failure

**Given:** Schema doc retrieval fails or returns empty results
**When:** Query generator attempts RAG mode
**Then:** It falls back to full schema mode and logs the fallback decision

### Requirement: QG-RAG-02

The query generator MUST format focused schema context from retrieved chunks, including only relevant tables and their documentation when using RAG mode. (Focused Schema Formatting)

#### Scenario: Format schema with retrieved documentation

**Given:** Retriever returns 5 chunks covering 2 tables (orders, users)
**When:** Query generator formats schema context
**Then:** Schema includes only orders and users tables, plus their relationships, with documentation from retrieved chunks

#### Scenario: Expand schema with related tables

**Given:** Retrieval returns chunks from orders table
**When:** Schema formatting runs
**Then:** Users table is also included in formatted schema (due to FK relationship) even if not directly retrieved

#### Scenario: Include CREATE TABLE format per research guidelines

**Given:** Retrieved chunks provide context for specific tables
**When:** Schema is formatted for LLM
**Then:** Tables use CREATE TABLE SQL format as specified in research-grounded prompting guidelines

### Requirement: QG-RAG-03

The query generator MUST include retrieval metadata in query output, capturing the retrieval strategy used and its effectiveness. (Retrieval Metadata Output)

#### Scenario: Include RAG metadata in output

**Given:** Query was generated using RAG mode
**When:** Query generator returns output
**Then:** Output includes retrievalMetadata with strategy="rag", chunksRetrieved, tablesIncluded, avgRelevanceScore

#### Scenario: Include full schema metadata

**Given:** Query was generated using full schema mode
**When:** Query generator returns output
**Then:** Output includes retrievalMetadata with strategy="full", tablesIncluded

#### Scenario: Use metadata in confidence scoring

**Given:** RAG retrieval had low average relevance scores (<0.4)
**When:** Confidence is calculated
**Then:** Overall confidence is reduced to account for uncertain context selection

### Requirement: QG-RAG-04

The query generator MUST support configuration for RAG behavior through environment variables and runtime parameters. (RAG Configuration)

#### Scenario: Disable RAG via configuration

**Given:** ENABLE_DOC_RETRIEVAL is set to false
**When:** Query generator runs
**Then:** Full schema mode is always used regardless of database size

#### Scenario: Configure table threshold for RAG

**Given:** RETRIEVAL_TABLE_THRESHOLD is set to 15
**When:** Database has 12 tables
**Then:** Full schema mode is used (below threshold)

#### Scenario: Force RAG mode via CLI flag

**Given:** User passes --use-retrieval flag
**When:** Database has 3 tables (below default threshold)
**Then:** RAG mode is used anyway (flag overrides heuristic)

## MODIFIED Requirements

### Requirement: QG-CORE-02

The query generator MUST format database schema for LLM context using either full schema or focused schema (from RAG) depending on database size and configuration, maintaining CREATE TABLE format and research-based prompting principles in both modes. (Adaptive Schema Formatting)

**Before:**
The query generator formats the entire database schema into a human-readable string representation for LLM consumption, including all tables, columns, and relationships.

**After:**
The query generator formats database schema using either full or focused (RAG-based) modes based on database size, always maintaining CREATE TABLE format and research-based prompting principles.

#### Scenario: Format full schema (unchanged behavior)

**Given:** RAG is disabled or database is small
**When:** Schema formatting runs
**Then:** All tables and columns are included in formatted output, matching current behavior

#### Scenario: Format focused schema (new behavior)

**Given:** RAG is enabled and retrieval returned 3 relevant tables
**When:** Schema formatting runs
**Then:** Only retrieved tables (plus their FK-related tables) are included, reducing context size by >50%

## ADDED Technical Details

### Modified Input Schema

```typescript
interface QueryGeneratorInput {
  question: string;
  schema: DatabaseSchema;

  // NEW: Optional RAG configuration
  useRetrieval?: boolean;        // Override auto-detection
  retrievalConfig?: {
    topK?: number;
    relevanceThreshold?: number;
  };
}
```

### Modified Output Schema

```typescript
interface QueryGeneratorOutput {
  query: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  tablesUsed: string[];
  assumptions?: string[];

  // NEW: Retrieval metadata
  retrievalMetadata: RetrievalMetadata;
}

interface RetrievalMetadata {
  strategy: 'full' | 'rag';
  tablesIncluded: string[];
  chunksRetrieved?: number;         // Only present if strategy='rag'
  avgRelevanceScore?: number;       // Only present if strategy='rag'
  fallbackReason?: string;          // Present if RAG was attempted but fell back
}
```

### New Dependencies

- **schema-doc-retriever tool:** Called when RAG mode is active
- **Configuration:** Reads ENABLE_DOC_RETRIEVAL, RETRIEVAL_TABLE_THRESHOLD env vars

### Algorithm Changes

```typescript
async function execute(input: QueryGeneratorInput): Promise<QueryGeneratorOutput> {
  // NEW: Determine retrieval strategy
  const shouldUseRAG = determineStrategy(input);

  let schemaContext: string;
  let retrievalMetadata: RetrievalMetadata;

  if (shouldUseRAG) {
    // NEW: RAG path
    try {
      const retrieval = await schemaDocRetriever.execute({
        database: input.schema.name,
        question: input.question,
        ...input.retrievalConfig
      });

      if (retrieval.chunks.length > 0) {
        schemaContext = formatFocusedSchema(input.schema, retrieval.chunks);
        retrievalMetadata = {
          strategy: 'rag',
          tablesIncluded: retrieval.metadata.tablesIncluded,
          chunksRetrieved: retrieval.chunks.length,
          avgRelevanceScore: retrieval.metadata.avgRelevanceScore
        };
      } else {
        // Fall back to full schema
        schemaContext = formatFullSchema(input.schema);
        retrievalMetadata = {
          strategy: 'full',
          tablesIncluded: input.schema.tables.map(t => t.name),
          fallbackReason: 'No relevant documentation found'
        };
      }
    } catch (error) {
      // Fall back on error
      schemaContext = formatFullSchema(input.schema);
      retrievalMetadata = {
        strategy: 'full',
        tablesIncluded: input.schema.tables.map(t => t.name),
        fallbackReason: `Retrieval failed: ${error.message}`
      };
    }
  } else {
    // UNCHANGED: Full schema path
    schemaContext = formatFullSchema(input.schema);
    retrievalMetadata = {
      strategy: 'full',
      tablesIncluded: input.schema.tables.map(t => t.name)
    };
  }

  // UNCHANGED: LLM call and response processing
  const response = await llmClient.generateJSON(
    systemPrompt,
    buildUserMessage(input.question, schemaContext)
  );

  // NEW: Include retrieval metadata in output
  return {
    ...response,
    retrievalMetadata
  };
}

// NEW: Strategy determination logic
function determineStrategy(input: QueryGeneratorInput): boolean {
  if (input.useRetrieval !== undefined) {
    return input.useRetrieval; // Explicit override
  }

  if (!config.ENABLE_DOC_RETRIEVAL) {
    return false; // RAG disabled globally
  }

  const tableCount = input.schema.tables.length;
  return tableCount >= config.RETRIEVAL_TABLE_THRESHOLD;
}
```

## Integration Points

### New Integration

- **Calls:** `schema-doc-retriever` tool when in RAG mode
- **Reads:** Additional configuration parameters for RAG

### Existing Integration (Unchanged)

- **Called by:** SQL generation workflow, SQL refinement workflow
- **Uses:** LLM client, spec loader
- **Returns:** Query generation output (now with added metadata)

## Testing Requirements

### New Tests

1. **RAG mode activation:**
   - Test threshold-based strategy selection
   - Test explicit override via useRetrieval flag
   - Test configuration-based disabling

2. **Focused schema formatting:**
   - Test schema includes only relevant tables
   - Test relationship expansion works correctly
   - Test documentation is properly integrated

3. **Fallback behavior:**
   - Test fallback when retrieval returns empty
   - Test fallback on retrieval error
   - Test metadata includes fallback reason

4. **Output metadata:**
   - Test metadata structure for both modes
   - Test confidence adjustment based on retrieval quality

### Modified Tests

1. **Schema formatting tests:**
   - Extend to cover both full and focused modes
   - Verify both maintain CREATE TABLE format

## Backward Compatibility

- **Fully backward compatible:** When RAG is disabled or database is small, behavior is identical to current implementation
- **No breaking changes:** Existing inputs work unchanged
- **Additive changes only:** New fields in output are additional, not replacing existing fields

## Performance Impact

- **RAG mode overhead:** +<100ms for retrieval
- **Context reduction:** Focused schema reduces LLM token usage by 50-70% for large schemas
- **Net latency:** May improve for large schemas due to faster LLM processing with smaller context
