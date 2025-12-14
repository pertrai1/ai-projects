# Adaptive Retrieval

## Adaptive Retrieval

A system that dynamically adjusts search parameters based on query characteristics.

## The Problem with Fixed Retrieval

Traditional RAG systems use the same search parameters for every query:

```typescript
// Traditional RAG (one size fits all)
const results = await vectorStore.search(queryEmbedding, k=5);
```

**Problems:**
- Wastes resources on simple queries ("What is FACW?" doesn't need 5 results)
- Insufficient for complex queries ("Compare X vs Y" needs more than 5 results)
- No filtering (searches entire document even when you know the section)
- Same approach for definitions, procedures, and exploratory questions

## The Adaptive Retrieval Solution

```typescript
// Adaptive RAG (smart parameter selection)
const strategy = await adaptiveRetrieval.getStrategy(query);
const results = await vectorStore.search(queryEmbedding, strategy.k);
// k might be 3, 5, 7, or 10 depending on query type!
```

**Benefits:**
- **Efficiency**: Retrieve only what you need
- **Quality**: Right approach for each query type
- **Cost**: Fewer unnecessary API calls
- **Speed**: Focused searches are faster

## Architecture

#### 1. Retrieval Strategist Agent

**Purpose**: Analyzes queries and determines optimal search parameters

**Outputs:**
- `k`: Number of results (3-10)
- `exactMatch`: Precision vs recall trade-off
- `expandQuery`: Whether to add synonyms
- `sections`: Filter to specific document sections
- `multiPass`: Multiple search rounds for comparisons
- `rerank`: Re-order results after retrieval

**Examples:**
```yaml
# Definition query: "What is FACW?"
k: 3
exactMatch: true
expandQuery: false
sections: null

# Procedural query: "How do I search by state?"
k: 7
exactMatch: false
expandQuery: true
sections: ["user-guide", "search"]

# Comparison query: "Native vs introduced plants"
k: 8
exactMatch: false
expandQuery: true
multiPass: true
```

#### 2. Adaptive Retrieval System

**Purpose**: Executes searches using optimal strategies

**Key Features:**
- **Strategy Selection**: Calls retrieval-strategist to get parameters
- **Query Expansion**: Enriches queries with synonyms
- **Multi-Pass Search**: Searches for multiple concepts separately
- **Deduplication**: Removes duplicate chunks from multi-pass searches
- **Section Filtering**: Filters results by document section


#### 3. Search Adaptive Command

**Purpose**: Educational CLI for testing adaptive retrieval

**Modes:**
- `--show-strategy`: See strategy without executing search
- `--compare`: Compare adaptive vs fixed k=5 search
- Standard: Execute adaptive search and show results

## Concepts

### 1. **Adaptive Parameter Selection**

Different queries need different approaches:

| Query Type | k | Exact Match | Expand Query | Why? |
|------------|---|-------------|--------------|------|
| Definition | 3 | ✓ Yes | ✗ No | Precise term lookup |
| How-To | 7 | ✗ No | ✓ Yes | Procedures span sections |
| Comparison | 8 | ✗ No | ✓ Yes | Need info on multiple concepts |
| Exploratory | 10 | ✗ No | ✓ Yes | Comprehensive coverage |

### 2. **Query Expansion**

For queries that benefit from synonyms:

```typescript
// Original query
"native plants"

// Expanded query (for broader retrieval)
"native plants indigenous endemic autochthonous"
```

**When to expand:**
- Exploratory questions
- Procedural questions (terminology may vary)
- Concept comparisons
- Definitions (exact term needed)
- Code/symbol lookups

### 3. **Multi-Pass Search**

For comparison queries, search each concept separately:

```typescript
// Query: "Compare OBL vs FACW"

// Pass 1: Search for "OBL"
const oblResults = await search("OBL");

// Pass 2: Search for "FACW"
const facwResults = await search("FACW");

// Combine and deduplicate
const allResults = deduplicate([...oblResults, ...facwResults]);
```

**Why this works better:**
- Each concept gets proper representation
- Avoids bias toward one concept
- Ensures comprehensive comparison

### 4. **Section Filtering**

When you know where information lives:

```typescript
// Procedural questions → user guides
sections: ["user-guide", "how-to", "tutorial"]

// Reference lookups → reference sections
sections: ["glossary", "codes", "symbols"]

// General questions → search all
sections: null
```

## Testing the System

### 1. See Strategies for Different Query Types

```bash
# Definition - should use k=3, exactMatch=true
npm run cli -- search-adaptive "What is FACW?" --show-strategy

# Procedure - should use k=7, expandQuery=true
npm run cli -- search-adaptive "How do I search by state?" --show-strategy

# Comparison - should use k=8, multiPass=true
npm run cli -- search-adaptive "Compare native vs introduced" --show-strategy

# Exploratory - should use k=10, sections=null
npm run cli -- search-adaptive "Tell me about plant characteristics" --show-strategy
```

**What to observe:**
- How k changes based on query complexity
- When exactMatch vs expandQuery is used
- Section filtering for procedural questions
- Multi-pass for comparisons

### 2. Compare Adaptive vs Fixed Search

```bash
# See the difference side-by-side
npm run cli -- search-adaptive "What is FACW?" --compare
npm run cli -- search-adaptive "How do I filter plants?" --compare
```

**What to look for:**
- Efficiency gains (fewer results for simple queries)
- Quality improvements (more results for complex queries)
- Strategy reasoning

### 3. Execute Adaptive Searches

```bash
# Run actual searches with adaptive parameters
npm run cli -- search-adaptive "wetland indicator" -v
npm run cli -- search-adaptive "search interface tutorial" -v
```

## Example Session

```bash
$ npm run cli -- search-adaptive "What is FACW?" --show-strategy

Adaptive Retrieval Strategy

Query: What is FACW?
Query Type: DEFINITION_LOOKUP

Search Parameters:
  k (results): 3
  Exact match: ✓ Yes
  Expand query: ✗ No
  Multi-pass: ✗ No
  Rerank: ✗ No
  Target sections: All sections

Reasoning:
  This is a simple definition lookup for a specific term/acronym.
  We use k=3 for focused retrieval, exact matching for precision,
  and no query expansion since the term is specific.

Confidence: high

This shows the strategy only.
  Remove --show-strategy to execute the search.

$ npm run cli -- search-adaptive "What is FACW?" --compare

Adaptive vs Fixed Search Comparison

Query: What is FACW?

ADAPTIVE SEARCH (Smart)
   Parameters: k=3, exactMatch=true
   Reasoning: Simple definition lookup needs focused retrieval
   Results: 3 chunks

   1. [95.2%] FACW stands for Facultative Wetland. Plants with this...
   2. [89.1%] Wetland indicator status codes include: OBL, FACW, FAC...
   3. [84.3%] The FACW designation means the plant usually occurs...

FIXED SEARCH (Traditional RAG)
   Parameters: k=5 (always)
   Results: 5 chunks

   1. [95.2%] FACW stands for Facultative Wetland. Plants with this...
   2. [89.1%] Wetland indicator status codes include: OBL, FACW, FAC...
   3. [84.3%] The FACW designation means the plant usually occurs...
   4. [72.1%] Plant characteristics include height, flower color...
   5. [68.4%] The database contains information about distribution...

Analysis
   Efficiency: 40% fewer results retrieved
   Why different: Simple definition doesn't need 5 results
```
