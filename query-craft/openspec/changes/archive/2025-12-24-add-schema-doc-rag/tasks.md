# Implementation Tasks: Add Schema Documentation RAG

**Change ID:** `add-schema-doc-rag`

## Implementation Status

**Last Updated:** 2025-12-24

### Phase Completion
- [x] Phase 1: Documentation Format & Infrastructure (Complete)
- [x] Phase 2: Schema Documentation Retriever Tool (Complete)
- [x] Phase 3: Query Generator Integration (Complete)
- [x] Phase 4: Testing & Validation (Core tests complete)
- [ ] Phase 5: Documentation & Polish (Pending)

### Completed Tasks
- [x] Task 1.1: Define schema documentation format specification
- [x] Task 1.2: Create documentation templates
- [x] Task 1.3: Document ecommerce schema tables
- [x] Task 2.1: Create retriever tool types and interfaces
- [x] Task 2.2: Implement documentation loader
- [x] Task 2.3: Implement document chunking
- [x] Task 2.4: Implement semantic retrieval algorithm (BM25)
- [x] Task 2.5: Add retriever configuration
- [x] Task 3.1: Modify query generator to support retrieval mode
- [x] Task 3.2: Implement focused schema formatting
- [x] Task 3.3: Add retrieval metadata to query output
- [x] Task 3.4: Update system prompts for retrieval mode
- [x] Task 4.1: Create unit tests for retriever (Basic tests implemented)
- [ ] Task 4.2: Integration tests for query generation (Deferred)
- [ ] Task 4.3: Retrieval relevance evaluation (Deferred)
- [ ] Task 4.4: Performance benchmarking (Deferred)
- [ ] Task 5.1: Write user documentation
- [ ] Task 5.2: Add CLI flags for retrieval control
- [ ] Task 5.3: Update project specs with RAG information

### Notes
- Core implementation complete and functional
- Basic tests passing (4/4 tests in schema-doc-retriever test)
- RAG automatically activates for schemas with 10+ tables
- Configuration available via environment variables
- Deferred tasks can be completed in follow-up work

## Task Breakdown

### Phase 1: Documentation Format & Infrastructure

**Task 1.1:** Define schema documentation format specification
- Create documentation format spec in `design.md`
- Define directory structure: `data/schemas/<db-name>/docs/`
- Specify markdown format for table and column documentation
- Define metadata fields (table name, relationships, examples)
- **Validation:** Format spec is complete and unambiguous
- **Estimated complexity:** Small

**Task 1.2:** Create documentation templates
- Create template file: `data/schemas/_templates/table-doc.md`
- Include sections: Purpose, Columns, Common Queries, Examples, Notes
- Add inline comments explaining each section
- **Validation:** Template is clear and easy to follow
- **Dependencies:** Task 1.1
- **Estimated complexity:** Small

**Task 1.3:** Document ecommerce schema tables
- Create `data/schemas/ecommerce/docs/users.md`
- Create `data/schemas/ecommerce/docs/products.md`
- Create `data/schemas/ecommerce/docs/orders.md`
- Include example queries and domain context for each table
- **Validation:** Documentation is comprehensive and accurate
- **Dependencies:** Task 1.2
- **Estimated complexity:** Small

### Phase 2: Schema Documentation Retriever Tool

**Task 2.1:** Create retriever tool types and interfaces
- Add types to `src/types/index.ts`: `SchemaDocRetrieverInput`, `SchemaDocRetrieverOutput`
- Define chunk structure: `DocumentChunk` with content, table, metadata
- Define retrieval configuration options
- **Validation:** Types compile without errors
- **Estimated complexity:** Small

**Task 2.2:** Implement documentation loader
- Create `src/tools/schema-doc-loader.ts`
- Load markdown files from `data/schemas/<db>/docs/` directory
- Parse markdown and extract metadata (table name, section headers)
- Handle missing documentation gracefully
- **Validation:** Successfully loads ecommerce docs
- **Dependencies:** Task 1.3, Task 2.1
- **Estimated complexity:** Medium

**Task 2.3:** Implement document chunking
- Add chunking logic to `schema-doc-loader.ts`
- Split documents into semantic chunks (by section, paragraph)
- Preserve table/column context in each chunk
- Add chunk metadata (table, section type, tokens)
- **Validation:** Chunks are semantically coherent and properly tagged
- **Dependencies:** Task 2.2
- **Estimated complexity:** Medium

**Task 2.4:** Implement semantic retrieval algorithm
- Create `src/tools/schema-doc-retriever.ts`
- Implement simple similarity scoring (BM25 or TF-IDF initially)
- Support top-K retrieval with configurable K
- Add relevance threshold for quality filtering
- Return ranked chunks with scores
- **Validation:** Retrieves relevant docs for sample queries
- **Dependencies:** Task 2.3
- **Estimated complexity:** Large

**Task 2.5:** Add retriever configuration
- Add config options to environment variables or config file
- Support: `ENABLE_DOC_RETRIEVAL`, `DOC_RETRIEVAL_TOP_K`, `DOC_RELEVANCE_THRESHOLD`
- Set sensible defaults (K=5, threshold=0.3)
- **Validation:** Config loads correctly and affects retrieval
- **Dependencies:** Task 2.4
- **Estimated complexity:** Small

### Phase 3: Query Generator Integration

**Task 3.1:** Modify query generator to support retrieval mode
- Update `query-generator.ts` to accept optional retrieval mode flag
- Add logic to determine when to use retrieval (large schema heuristic)
- Integrate `schema-doc-retriever` before formatting schema
- **Validation:** Generator correctly routes to retrieval or full schema mode
- **Dependencies:** Task 2.4
- **Estimated complexity:** Medium

**Task 3.2:** Implement focused schema formatting
- Add method to format schema from retrieved chunks only
- Include only relevant tables/columns based on retrieval
- Preserve relationship information for retrieved tables
- **Validation:** Formatted schema is complete for retrieved context
- **Dependencies:** Task 3.1
- **Estimated complexity:** Medium

**Task 3.3:** Add retrieval metadata to query output
- Extend `QueryGeneratorOutput` to include retrieval metadata
- Track: retrieval strategy used, chunks retrieved, relevance scores
- Include in confidence scoring logic
- **Validation:** Output includes complete retrieval metadata
- **Dependencies:** Task 3.2
- **Estimated complexity:** Small

**Task 3.4:** Update system prompts for retrieval mode
- Modify query generator spec/prompts to explain focused schema context
- Add guidance about working with retrieved documentation
- Test prompt effectiveness with focused vs. full schema
- **Validation:** Prompts produce accurate queries with retrieved context
- **Dependencies:** Task 3.2
- **Estimated complexity:** Small

### Phase 4: Testing & Validation

**Task 4.1:** Create unit tests for retriever
- Test documentation loading and parsing
- Test chunking correctness and metadata preservation
- Test retrieval ranking and scoring
- Test edge cases (missing docs, empty query, no relevant docs)
- **Validation:** All retriever tests pass
- **Dependencies:** Task 2.4
- **Estimated complexity:** Medium

**Task 4.2:** Create integration tests for query generation
- Test query generation with retrieval enabled
- Compare accuracy with/without retrieval
- Test on schemas of varying sizes
- Measure context size reduction
- **Validation:** Retrieval maintains or improves accuracy
- **Dependencies:** Task 3.3
- **Estimated complexity:** Large

**Task 4.3:** Add retrieval relevance evaluation
- Create test dataset of questions with expected relevant tables
- Measure precision@K and recall@K for retrieval
- Ensure 90%+ relevant table retrieval
- **Validation:** Retrieval meets success criteria
- **Dependencies:** Task 4.1
- **Estimated complexity:** Medium

**Task 4.4:** Performance benchmarking
- Measure retrieval latency (target <100ms)
- Measure end-to-end query generation time with/without retrieval
- Profile and optimize if needed
- **Validation:** Meets latency requirements
- **Dependencies:** Task 4.2
- **Estimated complexity:** Small

### Phase 5: Documentation & Polish

**Task 5.1:** Write user documentation
- Document how to create schema documentation
- Provide examples and best practices
- Explain when RAG is used vs. full schema
- Add troubleshooting guide
- **Validation:** Documentation is clear and complete
- **Dependencies:** Task 4.4
- **Estimated complexity:** Small

**Task 5.2:** Add CLI flags for retrieval control
- Add `--no-retrieval` flag to force full schema mode
- Add `--retrieval-debug` flag to show retrieval details
- Update help text and examples
- **Validation:** Flags work correctly
- **Dependencies:** Task 3.1
- **Estimated complexity:** Small

**Task 5.3:** Update project specs with RAG information
- Update `openspec/project.md` with RAG architecture
- Document new conventions for schema documentation
- Add code examples for retriever usage
- **Validation:** Project docs accurately reflect new capability
- **Dependencies:** Task 5.1
- **Estimated complexity:** Small

## Task Sequencing

### Can be parallelized:
- Task 1.1, 1.2 (documentation format work)
- Task 2.1 (types can be defined early)
- Task 5.1 (documentation can be drafted alongside implementation)

### Sequential dependencies:
1. Phase 1 must complete before Phase 2
2. Phase 2 must complete before Phase 3
3. Phase 3 must complete before Phase 4
4. Phase 4 must complete before Phase 5

### Critical path:
Task 1.1 → 1.2 → 1.3 → 2.2 → 2.3 → 2.4 → 3.1 → 3.2 → 4.2 → 5.1

## Validation Strategy

After each task:
- Run `npm run type-check` to ensure TypeScript compilation
- Run relevant test suite
- Manually verify behavior with ecommerce schema
- Update task status in this document

Final validation:
- Run `openspec validate add-schema-doc-rag --strict`
- Run full test suite: `npm run test:all`
- Run evaluation suite: `npm run eval`
- Verify all success criteria from proposal.md

## Notes

- Start with minimal implementation (no vector DB, simple scoring)
- Focus on ecommerce schema for initial implementation
- Measure impact on query accuracy before/after
- Keep retrieval logic simple and maintainable
- Consider adding observability (logging retrieval decisions)
