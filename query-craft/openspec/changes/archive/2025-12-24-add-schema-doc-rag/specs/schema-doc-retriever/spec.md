# Schema Documentation Retriever Δ

**Capability ID:** `schema-doc-retriever`
**Type:** Tool
**Delta Type:** New capability

## ADDED Requirements

### Requirement: SDR-REQ-01

The retriever MUST load and parse schema documentation from markdown files in `data/schemas/<database>/docs/` directory into structured chunks with metadata. (Documentation Loading and Parsing)

#### Scenario: Load documentation for existing schema

**Given:** The ecommerce database has documentation files in `data/schemas/ecommerce/docs/`
**When:** The retriever loads documentation for "ecommerce" database
**Then:** All table documentation files (users.md, products.md, orders.md) are loaded and parsed successfully

#### Scenario: Handle missing documentation directory

**Given:** A database schema exists but has no documentation directory
**When:** The retriever attempts to load documentation
**Then:** It returns an empty result set without throwing an error, allowing fallback to full schema

#### Scenario: Skip malformed documentation files

**Given:** One documentation file has invalid markdown syntax
**When:** The retriever loads all documentation
**Then:** It logs a warning about the malformed file and successfully loads other valid files

### Requirement: SDR-REQ-02

The retriever MUST chunk documentation into semantically meaningful segments with appropriate metadata including table, chunk type, related tables, and keywords. (Semantic Chunking)

#### Scenario: Create table-level overview chunk

**Given:** A table documentation file with Purpose and Business Context sections
**When:** The chunking process runs
**Then:** A single overview chunk is created containing both sections with chunk type "overview"

#### Scenario: Create column-level chunks

**Given:** A table documentation file with 5 column subsections
**When:** The chunking process runs
**Then:** 5 separate column chunks are created, each tagged with the column name and chunk type "column"

#### Scenario: Extract query pattern chunks

**Given:** Documentation includes 3 common query patterns with SQL examples
**When:** The chunking process runs
**Then:** 3 query chunks are created with SQL code and use case description, chunk type "query"

#### Scenario: Preserve metadata in chunks

**Given:** A table has foreign key relationships mentioned in documentation
**When:** Chunks are created
**Then:** Each chunk includes relatedTables metadata with referenced table names

### Requirement: SDR-REQ-03

The retriever MUST retrieve top-K most relevant chunks using semantic similarity, ranking chunks by relevance to the user's question. (Semantic Retrieval)

#### Scenario: Retrieve relevant table documentation

**Given:** User asks "Show me all orders from last month"
**When:** Retrieval runs with K=5
**Then:** The top chunk is from the orders table, mentioning the created_at column

#### Scenario: Retrieve across multiple tables

**Given:** User asks "Which users have placed the most orders?"
**When:** Retrieval runs with K=5
**Then:** Chunks from both users and orders tables appear in top-5 results

#### Scenario: Return empty result for irrelevant query

**Given:** User asks question about tables not in the schema
**When:** Retrieval runs with relevance threshold 0.3
**Then:** No chunks exceed the threshold, empty result is returned

#### Scenario: Rank by relevance score

**Given:** Multiple chunks match the query with different relevance
**When:** Retrieval returns results
**Then:** Chunks are ordered by descending relevance score, with scores included in output

### Requirement: SDR-REQ-04

The retriever MUST apply a relevance threshold to filter low-quality results, returning only chunks that meet the minimum threshold. (Relevance Filtering)

#### Scenario: Filter out low-relevance chunks

**Given:** Query matches 10 chunks with scores ranging from 0.1 to 0.8
**When:** Retrieval runs with threshold 0.3 and K=5
**Then:** Only chunks with score ≥ 0.3 are returned, even if fewer than K

#### Scenario: Handle all chunks below threshold

**Given:** Query produces no chunks above relevance threshold
**When:** Retrieval completes
**Then:** Empty result set is returned with metadata indicating no relevant documentation found

### Requirement: SDR-REQ-05

The retriever MUST support configurable retrieval parameters including top-K count and relevance threshold. (Configurable Parameters)

#### Scenario: Configure top-K parameter

**Given:** Retrieval is configured with topK=3
**When:** A query matches 10 relevant chunks
**Then:** Exactly 3 chunks are returned (the top-3 by score)

#### Scenario: Configure relevance threshold

**Given:** Retrieval is configured with relevanceThreshold=0.5
**When:** A query matches chunks with scores [0.7, 0.6, 0.4, 0.3]
**Then:** Only chunks with scores ≥ 0.5 are returned (first two chunks)

#### Scenario: Use default parameters when not specified

**Given:** No retrieval parameters are provided in input
**When:** Retrieval executes
**Then:** Default values (topK=5, relevanceThreshold=0.3) are used

### Requirement: SDR-REQ-06

The retriever MUST expand retrieved tables to include directly related tables via foreign key relationships. (Relationship Expansion)

#### Scenario: Include foreign key referenced tables

**Given:** Retrieval returns chunks from the "orders" table
**When:** Relationship expansion runs
**Then:** The "users" table is also included (orders.user_id references users.id)

#### Scenario: Bidirectional relationship expansion

**Given:** Retrieval returns chunks from the "users" table
**When:** Relationship expansion runs
**Then:** The "orders" table is included (because it references users)

#### Scenario: Limit expansion depth

**Given:** Tables have multi-level foreign key relationships (A→B→C)
**When:** Retrieval returns table A
**Then:** Only direct relationships (B) are included, not transitive ones (C)

### Requirement: SDR-REQ-07

The retriever MUST cache loaded documentation and generated chunks to avoid reloading on subsequent retrievals. (Performance Caching)

#### Scenario: Cache hit on repeated retrieval

**Given:** Documentation has been loaded once for "ecommerce" database
**When:** A second retrieval request comes for the same database
**Then:** Cached chunks are used, no file I/O occurs

#### Scenario: Invalidate cache on configuration change

**Given:** Documentation is cached with certain chunking parameters
**When:** Chunking configuration changes
**Then:** Cache is invalidated and documentation is re-chunked

### Requirement: SDR-REQ-08

The retriever MUST return detailed retrieval metadata including total chunks searched, relevance scores, and timing information. (Retrieval Metadata)

#### Scenario: Include retrieval statistics

**Given:** Retrieval completes successfully
**When:** Output is returned
**Then:** Metadata includes: total chunks searched, chunks returned, avg relevance score, tables included

#### Scenario: Include timing information

**Given:** Retrieval completes and debug mode is enabled
**When:** Output is returned
**Then:** Output metadata includes timing breakdown (load, chunk, search, rank)
