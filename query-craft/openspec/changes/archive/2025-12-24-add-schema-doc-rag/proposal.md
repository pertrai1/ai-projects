# Proposal: Add Schema Documentation RAG

**Change ID:** `add-schema-doc-rag`
**Status:** Proposed
**Created:** 2025-12-24

## Summary

Add Retrieval-Augmented Generation (RAG) capabilities for schema documentation to improve query generation accuracy by retrieving relevant table/column descriptions, domain knowledge, and example queries based on semantic similarity to the user's natural language question.

## Problem Statement

Current limitations in schema context management:

1. **Large Schema Challenge:** When databases have many tables (50+), including the full schema in the LLM context is inefficient and violates the 70% context usage guideline from Chang & Fosler-Lussier (2023).

2. **Lack of Domain Context:** Schema JSON only includes basic table/column descriptions. Additional domain knowledge (business rules, common query patterns, data quality notes, example values) is not systematically captured or retrieved.

3. **No Semantic Retrieval:** The current system loads entire schemas. There's no mechanism to intelligently select only the most relevant tables/columns for a given question.

4. **Missing Documentation Layer:** Documentation exists inline in schema JSON but there's no separate layer for richer context (examples, warnings, best practices).

## Proposed Solution

Implement a lightweight RAG system with the following components:

### 1. Schema Documentation Format

- Store enhanced documentation in `data/schemas/<db-name>/docs/` directory
- Use structured markdown files for each table with:
  - Table purpose and business context
  - Column descriptions with domain-specific notes
  - Common query patterns and examples
  - Data quality notes and edge cases
  - Related tables and join patterns

### 2. Schema Documentation Retriever Tool

Create a new tool `schema-doc-retriever` that:
- Chunks schema documentation into semantically meaningful segments
- Generates embeddings for each segment
- Retrieves top-K most relevant segments given a natural language question
- Returns focused schema context for query generation

### 3. Enhanced Query Generator Integration

Modify `query-generator` agent to:
- First call `schema-doc-retriever` to get relevant schema context
- Use retrieved context instead of full schema (when database is large)
- Fall back to full schema for small databases (<10 tables)
- Track which retrieval strategy was used in confidence scoring

## Technology Choices

**Minimal Implementation Approach:**

- **Embeddings:** Use Claude's embeddings API (via Anthropic SDK) or simple BM25/TF-IDF for semantic matching without external dependencies
- **Storage:** Keep documentation in markdown files (human-readable, version-controllable)
- **Retrieval:** Implement basic semantic similarity scoring in-memory (no vector database initially)
- **Chunking:** Simple paragraph-level chunking with table/column metadata

**Future Enhancements (not in this proposal):**
- Vector database integration (pgvector, ChromaDB, etc.)
- More sophisticated embedding models
- Query result caching based on embeddings

## Benefits

1. **Better Context Management:** Adheres to research-based context usage guidelines
2. **Improved Accuracy:** Provides relevant domain knowledge for better query generation
3. **Scalability:** Handles larger schemas without hitting context limits
4. **Documentation Culture:** Encourages systematic schema documentation
5. **Maintainability:** Human-readable docs that can be version-controlled

## Scope

### In Scope

- Schema documentation markdown format specification
- `schema-doc-retriever` tool implementation
- Simple semantic retrieval algorithm (no vector DB required)
- Integration with `query-generator` agent
- Documentation templates and examples for ecommerce schema
- Tests for retrieval accuracy

### Out of Scope

- Vector database integration (future enhancement)
- Real-time documentation generation from database metadata
- Multi-language documentation support
- Documentation versioning across schema changes
- Query result caching

## Implementation Approach

1. Define schema documentation format and directory structure
2. Create documentation templates and populate ecommerce example
3. Implement `schema-doc-retriever` tool with basic embedding/matching
4. Modify `query-generator` to use retriever for large schemas
5. Add configuration for retrieval threshold (when to use RAG vs full schema)
6. Write tests for retrieval relevance and query generation improvement

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Retrieval returns irrelevant context | High | Implement relevance scoring threshold; fall back to full schema if low confidence |
| Documentation maintenance overhead | Medium | Start with minimal docs; provide clear templates and examples |
| Added latency from retrieval | Low | Use simple in-memory retrieval; measure and optimize if needed |
| Over-engineering with vector DB | Medium | Explicitly defer vector DB to future; use simple approach first |

## Success Criteria

1. Successfully retrieves relevant table documentation for 90%+ of test queries
2. Reduces context size by 50%+ for schemas with 20+ tables
3. Maintains or improves query generation accuracy on benchmark
4. Documentation format is intuitive and easy to maintain
5. Retrieval adds <100ms latency to query generation

## Dependencies

- Existing `query-generator` agent
- Existing `schema-loader` agent
- Schema JSON files in `data/schemas/`

## Open Questions

1. Should we support database COMMENT metadata extraction as an alternative to markdown docs?
2. What's the right relevance threshold for falling back to full schema?
3. Should retrieval be optional/configurable via CLI flag?
4. How do we handle cross-table relationships in documentation retrieval?

## References

- Chang & Fosler-Lussier (2023) - Context usage guidelines (<70% for cross-domain)
- `openspec/project.md` - Research-grounded prompting principles
- Current schema format: `data/schemas/ecommerce.json`
