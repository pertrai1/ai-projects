# Phase 2: Agent Layer

**Goal**: Add intelligent agents for query understanding, hybrid search, and conversation memory

## Phase 2 Overview

Phase 1 created a working RAG system with basic vector search. Phase 2 makes it **much smarter** by adding:

- **Intent Understanding** - Parse complex queries to extract filters and intent
- **Hybrid Search** - Combine semantic search with structured filters
- **Conversation Memory** - Remember context across queries
- **Smart Query Refinement** - Improve search quality

## Architecture Evolution

### Phase 1:

```bash
User Query → Embed → Vector Search → Load Plants → Generate Response
```

### Phase:

```bash
User Query
    ↓
Intent Understanding Agent (extract filters, parse query)
    ↓
Hybrid Search (vector + structured filters)
    ↓
Reranking & Context Enhancement
    ↓
Response Generation Agent (with conversation memory)
    ↓
Natural Language Answer
```

### 1. Intent Understanding Agent

Parses queries to extract:
- **States**: "North Carolina", "VA", etc.
- **Characteristics**: "drought-tolerant", "shade-loving", "evergreen"
- **Growth habits**: "wildflowers", "trees", "shrubs"
- **Wildlife values**: "pollinators", "butterflies", "birds"
- **Query type**: Identification, recommendation, general info

**Example:**

```bash
Query: "Show me drought-tolerant wildflowers native to North Carolina"

Intent: {
  queryType: "recommendation",
  filters: {
    states: ["NC"],
    nativeStatus: "native",
    growthHabit: ["Forb/herb"],
    characteristics: { waterNeeds: "Low" }
  },
  semanticQuery: "drought tolerant wildflowers"
}
```

### 2. Hybrid Search

Combines two search strategies:
- **Vector search**: Semantic similarity (what you already have)
- **Structured filtering**: Exact matches on metadata

### 3. Conversation Memory

Tracks conversation history:
- Remember previous queries
- Reference past plants mentioned
- Context-aware follow-ups

**Example:**

```bash
User: "What native wildflowers are in North Carolina?"
Bot: [Lists 3 wildflowers]

User: "Which of those attracts butterflies?"
Bot: [Understands "those" refers to previous results]
```

### 4. Query Refinement

Improves search quality:
- Synonym expansion ("native" → "indigenous")
- Characteristic mapping ("drought-tolerant" → waterNeeds: "Low")
- State code normalization ("North Carolina" → "NC")

## Phase 2 Steps

### Step 1: Intent Models & Types
- Define intent structures
- Create filter types
- Add conversation context models

### Step 2: Intent Understanding Agent
- Build Claude-powered intent parser
- Extract structured filters from natural language
- Map characteristics to database fields

### Step 3: Query Refinement Service
- Normalize state names
- Map characteristics to filters
- Synonym expansion

### Step 4: Hybrid Search Implementation
- Combine vector search + filters
- Implement metadata filtering in Pinecone
- Rerank results

### Step 5: Conversation Memory
- Track conversation history
- Context-aware intent parsing
- Reference resolution

### Step 6: Enhanced Response Agent
- Context-aware response generation
- Reference previous context
- Improve answer quality

### Step 7: Integration & Testing
- Update PlantsNLQI orchestrator
- Update CLI with conversation mode
- End-to-end testing

## Expected Improvements

**Better Understanding:**
-  Parse complex queries with multiple filters
-  Understand state names and abbreviations
-  Map natural language characteristics to database fields

**Better Search:**
-  Find plants matching specific criteria
-  Combine semantic + exact matching
-  Higher precision results

**Better Conversations:**
-  Remember conversation context
-  Handle follow-up questions
-  Reference previous results

## Example Queries Phase 2 Enables

**Complex Filters:**
- "Show me drought-tolerant wildflowers native to North Carolina that bloom in spring"
- "Find trees in Virginia that grow over 50 feet and attract birds"

**Follow-up Questions:**
- User: "What are some native wildflowers?"
- Bot: [Lists wildflowers]
- User: "Which of those are drought-tolerant?" ← Phase 2 handles this!

**State Variations:**
- "North Carolina" → "NC"
- "Virginia" → "VA"
- Works with full names or abbreviations

## Key Technologies

**New Concepts:**
- Multi-agent systems
- Intent parsing
- Hybrid search
- Conversation state management

## Success Criteria

- [ ] Intent agent extracts filters with 90%+ accuracy
- [ ] Hybrid search returns more relevant results than vector-only
- [ ] Conversation memory works across 3+ turns
- [ ] CLI supports conversation mode
- [ ] Complex queries with multiple filters work correctly
- [ ] State names normalize correctly
- [ ] All Phase 1 functionality still works

---
