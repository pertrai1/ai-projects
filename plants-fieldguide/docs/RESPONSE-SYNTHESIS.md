# Response Synthesis

Combining multiple retrieval strategies and synthesizing comprehensive answers from diverse sources.

## The Multi-Source Retrieval Problem

Traditional RAG uses a single retrieval approach:

```typescript
// Traditional: One search strategy
const results = await vectorSearch(query, k=5);
const answer = await llm(query, results);
```

**Limitations:**
- Misses information found by other methods
- Vector search might miss exact keyword matches
- Single strategy = single perspective
- No validation through multiple sources

## The Response Synthesis Solution

```typescript
// Multi-source: Multiple strategies combined
const vectorResults = await vectorSearch(query);
const keywordResults = await keywordSearch(query);
const filteredResults = await sectionSearch(query, sections);

// Fusion: Combine using RRF or score-based fusion
const fusedResults = fuseResults([vector, keyword, filtered]);

// Synthesis: Create comprehensive answer
const answer = await synthesizer(query, fusedResults);
```

**Benefits:**
- **Comprehensive**: Multiple perspectives captured
- **Reliable**: Cross-validation from different sources
- **Accurate**: Exact matches + semantic matches
- **Confident**: Multiple sources = higher confidence

## Architecture

#### 1. Response Synthesizer Agent

**Purpose**: Combines information from multiple sources into one comprehensive answer

**Features:**
- Identifies complementary vs redundant information
- Resolves conflicts between sources
- Assesses source quality
- Scores confidence based on agreement
- Provides structured citations

**Output Structure:**
```json
{
  "answer": "Comprehensive synthesized answer",
  "confidence": "high|medium|low",
  "sourcesUsed": {
    "primary": 3,
    "alternative": 2,
    "total": 5
  },
  "synthesis": {
    "complementary": true,
    "redundant": false,
    "conflicting": false
  },
  "coverage": {
    "definition": true,
    "examples": true,
    "usage": false,
    "procedures": false
  },
  "citations": [...]
}
```

#### 2. Multi-Source Retrieval System

**Purpose**: Executes multiple search strategies in parallel and fuses results

**Retrieval Strategies:**
1. **Primary**: Adaptive vector search (from Step 2)
2. **Keyword**: Exact term matching emphasis
3. **Section-Filtered**: Targeted section search
4. **Expanded-Query**: Synonym-enriched search

**Fusion Methods:**
- **RRF (Reciprocal Rank Fusion)**: Rank-based combination
- **Score-Based**: Weighted score combination
- **Simple**: Deduplication + score sorting

#### 3. Ask Synthesized Command

**Purpose**: Complete Phase 2 pipeline demonstration

**Pipeline Steps:**
1. Query Routing → Determine agent type
2. Adaptive Retrieval → Optimize parameters
3. Multi-Source Retrieval → Execute multiple searches
4. Response Synthesis → Create comprehensive answer

## Concepts

### 1. **Multi-Source Retrieval**

Different strategies find different relevant information:

| Strategy | Best For | Example |
|----------|----------|---------|
| Vector Search | Semantic similarity | "wetland plants" finds "hydrophytic vegetation" |
| Keyword Search | Exact matches | "FACW" finds exact code references |
| Section Filter | Known locations | Procedures in "user-guide" section |
| Query Expansion | Synonym variations | "native" + "indigenous" + "endemic" |

### 2. **Reciprocal Rank Fusion (RRF)**

Combines rankings without needing score normalization:

```typescript
// RRF Formula
score = sum(1 / (k + rank)) for all sources

// Example:
// Chunk A:
//   - Vector search: rank 1 → 1/(60+1) = 0.016
//   - Keyword search: rank 2 → 1/(60+2) = 0.016
//   - Total: 0.032

// Chunk B:
//   - Vector search only: rank 1 → 0.016
//   - Total: 0.016

// Chunk A ranks higher (found by multiple sources!)
```

**Why RRF works:**
- Doesn't require score normalization
- Items found by multiple sources rank higher
- Robust to score distribution differences
- Simple and effective

### 3. **Response Synthesis Strategies**

#### Complementary Information

When sources provide different aspects:
```
Source A: "FACW means Facultative Wetland"
Source B: "FACW plants occur 67-99% in wetlands"
Synthesis: "FACW (Facultative Wetland) plants occur in wetlands 67-99% of the time."
```

#### Redundant Information
When sources agree:
```
Source A: "OBL plants are always in wetlands"
Source B: "Obligate wetland plants occur exclusively in wetlands"
Synthesis: "OBL (Obligate) plants occur exclusively in wetlands."
Confidence: HIGH (multiple sources confirm)
```

#### Conflicting Information
When sources disagree:
```
Source A: "Use search button in header"
Source B: "Search is in sidebar menu"
Synthesis: "Search location varies by interface version..."
Confidence: LOW (conflicting info)
```

### 4. **Source Quality Assessment**

Not all sources are equal:

```typescript
Quality = (
  relevanceScore * 0.4 +     // Vector similarity
  sectionQuality * 0.3 +     // Glossary > general
  contentType * 0.2 +        // Definition > example
  specificity * 0.1          // Exact term > related
)
```

### 5. **Confidence Scoring**

Confidence based on evidence:

- **HIGH**: 3+ high-quality sources agree
- **MEDIUM**: 1-2 good sources or partial agreement
- **LOW**: Conflicting sources or peripheral information

## Testing the System

### Basic Usage

```bash
# Complete Phase 2 pipeline
npm run cli -- ask-synthesized "What is FACW?" -v

# Show which sources contributed
npm run cli -- ask-synthesized "What is FACW?" --show-sources

# Try different fusion methods
npm run cli -- ask-synthesized "What is FACW?" --fusion-method RRF
npm run cli -- ask-synthesized "What is FACW?" --fusion-method score-based
```

### Test Different Query Types

```bash
# Definition (should use keyword + vector)
npm run cli -- ask-synthesized "What does OBL mean?" --show-sources

# Procedure (should use section-filtered + expanded)
npm run cli -- ask-synthesized "How do I search by state?" --show-sources

# Comparison (should use multi-source heavily)
npm run cli -- ask-synthesized "Compare OBL vs FACW" --show-sources

# Exploratory (should use all strategies)
npm run cli -- ask-synthesized "Tell me about wetland classification" --show-sources
```

### Compare with Previous Steps

```bash
# Phase 1: Basic RAG
npm run cli -- ask "What is FACW?"

# Phase 2 Step 1: Query Routing
npm run cli -- ask-smart "What is FACW?"

# Phase 2 Step 3: Complete Pipeline
npm run cli -- ask-synthesized "What is FACW?" -v
```

## Example Session

```bash
$ npm run cli -- ask-synthesized "What is FACW?" --show-sources -v

FieldGuide (Synthesized Mode)

FACW stands for "Facultative Wetland." This is a wetland indicator status
code used in the USDA PLANTS database to classify plants based on their
occurrence in wetland habitats.

FACW plants are defined as those that usually occur in wetlands (estimated
probability 67-99%), but are occasionally found in non-wetland areas. This
classification helps users identify which plants are adapted to wet conditions
and can be used for wetland restoration, identification, or regulatory purposes.

The FACW designation is part of a broader wetland indicator system that includes:
- OBL (Obligate Wetland): Always in wetlands
- FACW (Facultative Wetland): Usually in wetlands
- FAC (Facultative): Equally likely in wetlands or uplands
- FACU (Facultative Upland): Usually in uplands
- UPL (Upland): Rarely in wetlands

Confidence: high
Coverage: Definition, Examples, Usage
Synthesis: Complementary sources
Sources: 3 primary + 2 alternative = 5 total

Retrieval Strategies:
  • primary: 3 results (avg score: 91.2%)
  • keyword: 2 results (avg score: 88.5%)
  • expanded-query: 2 results (avg score: 84.1%)

Citations:
  1. Page 15 - Wetland Indicator Codes [high] (primary)
  2. Page 22 - Glossary [high] (keyword)
  3. Page 8 - Classification System [medium] (primary)
  4. Page 31 - Plant Characteristics [medium] (expanded-query)

You might also ask:
  • What is the difference between FACW and FAC?
  • How are wetland indicator codes determined?
  • Which plants have FACW status?

DEFINITION LOOKUP | 3 sources | RRF fusion
```
