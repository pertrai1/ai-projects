# Ready for Phase 2: Intent Classification

## What You've Accomplished

✅ **Phase 0**: Built project foundation with AST parser and type system
✅ **Phase 1**: Implemented and tested three chunking strategies

**Current state**: You can chunk code intelligently and search with embeddings

---

## The Problem Phase 2 Solves

Currently, your system treats all queries the same:
```
Query: "anything"
    ↓
Chunk using strategy X (e.g., semantic)
    ↓
Search with k=10
    ↓
Return top 10 results
```

**But queries are different!**

```
"Where is validateToken?" → Need k=3, high precision
"How does auth work?" → Need k=15, completeness
"Why would login fail?" → Need k=12, error paths
"Show me validateToken" → Need exact match

Currently: All use k=10, same strategy, same everything
```

---

## Phase 2: Query Intent Classification

**Goal**: Understand query intent, adapt retrieval accordingly

### The Solution
```
Query: "Where is validateToken?"
    ↓
Intent Router: "LOCATION query"
    ↓
Semantic chunking (high precision)
    ↓
Search with k=3 (exact match)
    ↓
Return: Exact function definition

vs.

Query: "How does authentication work?"
    ↓
Intent Router: "ARCHITECTURE query"
    ↓
Semantic chunking (completeness)
    ↓
Search with k=15 (broad overview)
    ↓
Return: 15 related code units showing architecture
```

---

## Phase 2 Learning Path

### Step 1: Define Intent Types
```
ARCHITECTURE: "How does X work?" → Need overview
IMPLEMENTATION: "How is X implemented?" → Need code
DEPENDENCY: "What depends on X?" → Need relationships
USAGE: "How do I use X?" → Need examples
DEBUGGING: "Why would X fail?" → Need error paths
COMPARISON: "What's the difference?" → Need side-by-side
LOCATION: "Where is X?" → Need exact location
GENERAL: "Tell me about X" → Need flexibility
```

### Step 2: Build Query Router
Use Claude to classify queries:
```typescript
query: "Where is validateToken?"
    ↓ Claude analyzes ↓
{
  type: "LOCATION",
  confidence: 0.95,
  entities: ["validateToken"],
  reasoning: "Question asks for specific location"
}
```

### Step 3: Design Routing Strategy
Map intent → retrieval parameters:
```
LOCATION: k=3, exact_match=true, expand_query=false
ARCHITECTURE: k=15, expand_query=true, module_overview=true
IMPLEMENTATION: k=8, include_tests=true
DEBUGGING: k=12, include_error_handlers=true
...
```

### Step 4: Test and Measure
Compare:
- Without routing: k=10 for everything
- With routing: k varies by intent

Measure improvement in query satisfaction

### Step 5: Learn and Iterate
Document what worked:
- "LOCATION+k=3 → 94% precision"
- "ARCHITECTURE+k=15 → 85% recall"
- Trade-offs discovered

---

## What Phase 2 Will Teach You

### Concept 1: Intent Types Matter
Different questions require different retrieval approaches

### Concept 2: Entity Extraction
"Where is validateToken?" → Extract "validateToken" for better search

### Concept 3: Confidence Scoring
System should express certainty ("very confident" vs "uncertain")

### Concept 4: Routing as an Optimization
Routing decisions directly impact retrieval quality

### Concept 5: Query Types Have Patterns
You can learn to recognize intent patterns

---

## Files You'll Create in Phase 2

```
src/agents/
  ├── query-router.ts          # Intent classification logic
  └── (other agents)

src/utils/
  ├── intent-analyzer.ts       # Extract intent from query
  └── entity-extractor.ts      # Extract entities (function names, etc.)

specs/
  └── agents/
      └── query-router.spec.yaml  # Claude spec for router

evaluations/
  ├── phase-2-tests.ts         # Test intent classification
  └── intent-test-cases.json   # 20+ test queries

docs/
  └── INTENT_ROUTING.md        # Design decisions and learnings
```

---

## Quick Checklist Before Phase 2

Before starting, confirm:

- ✅ Phase 1 files compile (chunking strategies work)
- ✅ You understand the three chunking strategies
- ✅ You can explain precision vs recall
- ✅ You know what metadata each chunk carries
- ✅ You've read CHUNKING_STRATEGY.md

If unsure on any of these, review PHASE_1_SUMMARY.md

---

## Phase 2 Experiment

Like Phase 1, Phase 2 has an experiment to run:

```bash
npm start experiment phase-2 /path/to/codebase
```

This will:
1. Load test queries with known intent types
2. Test intent router on each query
3. Measure classification accuracy
4. Show impact on retrieval quality
5. Compare before/after routing

**Expected result**: ~85%+ accuracy on intent classification

---

## How Phase 2 Connects to Phase 3

**Phase 2**: "Classify query intent"
```
Query → What kind of question is this?
```

**Phase 3**: "Adapt retrieval to intent"
```
Query → Intent → Choose k value, chunking strategy, filters → Retrieve
```

Phases 2 and 3 are complementary:
- Phase 2: Understand the query
- Phase 3: Use understanding to optimize retrieval

---

## Expected Time to Phase 2 Completion

Phase 2 is lighter than Phase 1:
- Intent types are predefined (8 types)
- Routing logic is straightforward (use Claude)
- Test cases are simpler
- Experiment is similar to Phase 1

**Estimate**: Phase 2 should be ~60-70% of Phase 1 effort

---

## Key Success Metric for Phase 2

**Goal**: Achieve 85%+ accuracy on intent classification

```
20 test queries with known intents
Query "Where is X?" → System says "LOCATION" ✓
Query "How does X work?" → System says "ARCHITECTURE" ✓
...

Accuracy: 17/20 = 85% ✓
```

If below 85%, refine the router until you hit the target.

---

## Your Next Steps

1. **Read** `docs/LEARNING.md` Phase 2 section
2. **Review** Phase 1 concepts to be fresh
3. **Plan** Phase 2 implementation (intent types, routing logic)
4. **Build** query router with Claude
5. **Test** on diverse queries
6. **Document** findings

---

## One More Thing

Phase 2 is where the system starts feeling smart.

In Phase 1, you built good foundations.
In Phase 2, you add intelligence.

Different queries will get genuinely different treatment:
- LOCATION: Fast, precise answers
- ARCHITECTURE: Comprehensive overviews
- DEBUGGING: Error-focused explanations

That's when RAG starts feeling like magic.

---

**Phase 1 is complete.**

**Phase 2 awaits when you're ready.**

Good luck!
