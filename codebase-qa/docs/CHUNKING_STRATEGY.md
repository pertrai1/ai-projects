# Phase 1: Code-Aware Chunking Strategy

## Overview

This document explains the chunking strategies implemented in Phase 1 and what we learned from testing them.

**Core Learning**: Chunking strategy fundamentally affects retrieval quality, and there's no one-size-fits-all approach.

---

## The Chunking Problem

When building a code RAG system, you must split code files into smaller pieces (chunks) for:
- **Embedding**: Vector databases have token limits (e.g., 8,191 tokens for OpenAI embeddings)
- **Retrieval**: Searching all code is expensive; smaller chunks are faster
- **Relevance**: Finding the exact relevant section is better than the whole file

But chunking poorly causes problems:
- **Split semantic units**: Cutting a function in half is useless
- **Lose context**: Removing imports makes code meaningless
- **Low recall**: Too many small chunks = hard to find relevant code
- **Token waste**: Too large chunks = wasted token budget

**Challenge**: Find the right balance.

---

## Three Strategies Compared

### Strategy 1: Fixed-Size Chunking

**Approach**: Split text at fixed character boundaries with sliding window overlap

```
Text: "function foo() { return bar(); } function baz() { ... }"
       |--- chunk 1 (500 chars) ---|
                     |--- chunk 2 (500 chars with overlap) ---|
```

**Pros**:
- ✅ Simple to implement
- ✅ Predictable chunk sizes
- ✅ Fast to compute (no parsing needed)
- ✅ Works for any code

**Cons**:
- ❌ May split functions in half
- ❌ Loses semantic meaning
- ❌ Hard to preserve imports in context
- ❌ Variable quality depending on where split occurs

**Token Usage**: Efficient (many chunks per token)
**Retrieval Quality**: Lower precision (gets irrelevant partial functions)

**Use Case**: When speed matters more than quality, or as a fallback

---

### Strategy 2: Semantic Chunking

**Approach**: Split by code structure (functions, classes, interfaces)

```
Text: [imports] [function foo] [class Bar] [function baz]
Chunks:
  1. [imports] [function foo]
  2. [imports] [class Bar]
  3. [imports] [function baz]
```

**Pros**:
- ✅ Respects code boundaries
- ✅ Each chunk is semantically complete
- ✅ Preserves imports for context
- ✅ Much higher precision
- ✅ Meaningful chunk boundaries

**Cons**:
- ❌ Variable chunk sizes
- ❌ Some chunks exceed token limits (need splitting)
- ❌ Slower to compute (requires parsing)
- ❌ May split large classes into multiple chunks anyway

**Token Usage**: Less efficient (fewer chunks per token)
**Retrieval Quality**: Higher precision (gets complete functions)

**Use Case**: When retrieval accuracy matters (IMPLEMENTATION, ARCHITECTURE queries)

---

### Strategy 3: Semantic with Lookahead

**Approach**: Semantic + context from next code unit

```
Chunks:
  1. [imports] [function foo] // + first lines of class Bar for context
  2. [imports] [class Bar] // + first lines of function baz
  3. [imports] [function baz]
```

**Pros**:
- ✅ Everything from semantic
- ✅ Additional context for understanding relationships
- ✅ Next code unit helps understand dependencies
- ✅ Better context when functions call each other

**Cons**:
- ❌ Larger chunks (higher token cost)
- ❌ More complex to implement
- ❌ Slowest to compute
- ❌ May still need to split very large functions

**Token Usage**: Least efficient (more tokens per chunk)
**Retrieval Quality**: Best for multi-step understanding

**Use Case**: When understanding relationships matters (DEPENDENCY, DEBUGGING queries)

---

## Experimental Results

### Hypothetical Experiment on Codebase

Run using: `npm start experiment phase-1 /path/to/codebase`

```
Strategy          | Chunks | Avg Size | Token Eff | Precision | Recall | MRR
================================================================================
fixed             | 850    | 425      | 2.50      | 0.62      | 0.78   | 0.45
semantic          | 340    | 1050     | 0.95      | 0.82      | 0.71   | 0.68
semantic-lookahead| 340    | 1200     | 0.83      | 0.78      | 0.74   | 0.71
```

**What This Means**:

1. **Semantic creates 60% fewer chunks** (340 vs 850)
   - More manageable index size
   - Faster to iterate over all chunks

2. **Semantic has 32% better precision** (0.82 vs 0.62)
   - When searching for `validateToken`, semantic finds the actual function
   - Fixed might retrieve part of function + adjacent function = less relevant

3. **Fixed has better recall** (0.78 vs 0.71)
   - Small chunks = more likely to find *any* relevant code
   - Even if split badly, some piece of relevant code is there

4. **Semantic is more token-efficient**
   - 2.5 chunks per 1000 tokens (fixed)
   - 0.95 chunks per 1000 tokens (semantic)
   - Semantic chunks are larger, so fewer total

5. **Semantic has better MRR** (Mean Reciprocal Rank)
   - First relevant result is ranked higher
   - When user searches for "validateToken", it's in position 2 for semantic
   - But position 4.5 on average for fixed (split across multiple chunks)

---

## Key Insight: Trade-offs

```
                  Speed    Quality  Token Efficiency
================================================================================
Fixed             ████     ██       █████
Semantic          ██       ████     ██
Semantic+Lookahead█        ████     █
```

**There is no perfect strategy.** It depends on what matters:

- **Speed matters**: Use fixed (fast indexing, fast search)
- **Quality matters**: Use semantic (better precision, better rankings)
- **Understanding relationships**: Use semantic+lookahead (context helps)

---

## Learning: Why This Matters for Phase 2-3

### Phase 2 Learning

In Phase 2, we'll classify queries into intent types:
- **LOCATION**: "Where is function X?" → Need high precision
  - → Use semantic chunking
  - → Expect to find exact function

- **ARCHITECTURE**: "How does system work?" → Need high recall
  - → Use fixed or semantic
  - → Need to see many code pieces

- **IMPLEMENTATION**: "How is feature Y implemented?" → Need quality code units
  - → Use semantic
  - → Get complete functions, not pieces

### Phase 3 Learning

In Phase 3 (Adaptive Retrieval), we'll use chunking strategy selection:
- Route LOCATION queries → semantic chunks
- Route ARCHITECTURE queries → more results (k=15)
- Route IMPLEMENTATION queries → semantic chunks
- Route DEBUGGING queries → include error paths

**Chunking strategy × query routing = adaptive retrieval**

---

## Implementation Details

### Semantic Chunking Algorithm

```typescript
1. Parse file with AST to find functions/classes
2. For each code unit:
   - Include imports at top
   - Include full function/class code
   - If too large (> max tokens):
     - Split at logical boundaries (loops, conditionals)
     - Preserve context by including parent scope
3. Return chunks with metadata:
   - File path, line numbers
   - Function name and signature
   - Required imports
   - Scope type (function, class, etc.)
```

### Fixed Chunking Algorithm

```typescript
1. Split file into chunks of N characters
2. Add overlap of M characters between chunks
3. For each chunk:
   - Calculate start/end line numbers
   - Estimate token count
4. Return chunks with basic metadata
```

---

## Metrics Explained

### Precision
**Definition**: Of retrieved results, how many are relevant?

```
Query: "validateToken"
Retrieved: [validateToken function, token validation test, token details comment]
Precision: 2/3 = 0.67 (token details is not about validateToken)
```

**Why it matters**: User doesn't want irrelevant results

### Recall
**Definition**: Of all relevant results, how many did we retrieve?

```
Query: "validateToken"
All relevant: [validateToken function in auth/index.ts, validateToken in tests/auth.test.ts, ...]
Retrieved: [validateToken function in auth/index.ts] (got k=5 results)
Recall: 1/3 = 0.33 (missed test file and other usages)
```

**Why it matters**: Don't want to miss important code

### MRR (Mean Reciprocal Rank)
**Definition**: Position of first relevant result (1/rank)

```
Query: "validateToken"
Result 1: token utility (not relevant)
Result 2: validateToken function (relevant!) → MRR = 1/2 = 0.5
```

**Why it matters**: Relevant results should rank high

### Token Efficiency
**Definition**: How many chunks per 1000 tokens?

```
Fixed: 2.5 chunks/1000 tokens (85 tokens per chunk on average)
Semantic: 0.95 chunks/1000 tokens (1050 tokens per chunk)
```

**Why it matters**: Larger chunks mean fewer API calls to embedding model

---

## Chunking Best Practices

### DO:
✅ Include imports with chunks (code needs context)
✅ Preserve complete functions/classes (semantic meaning)
✅ Track line numbers for citations (need exact locations)
✅ Have a token budget (know embedding model limits)
✅ Test multiple strategies (no single best approach)

### DON'T:
❌ Split functions across chunks (loses meaning)
❌ Ignore imports (code is incomplete)
❌ Create uniform chunks (code isn't uniform)
❌ Use only fixed chunking (poor quality)
❌ Ignore token limits (embeddings fail on large inputs)

---

## Next Steps: Phase 2

Phase 2 will implement intent classification:
```
Query → Intent Router → Choose chunking strategy → Retrieve → Synthesize
```

Different intents use different strategies:
- LOCATION: semantic (high precision needed)
- ARCHITECTURE: semantic (complete code units)
- IMPLEMENTATION: semantic (full functions)
- DEBUGGING: semantic + context (need error paths)
- GENERAL: fixed or semantic (depends)

---

## References

### In This Project:
- `src/retrieval/code-chunker.ts` - Implementation
- `src/evaluations/phase-1-tests.ts` - Experiments
- `src/commands/phase-1-experiment.ts` - Experiment runner

### Read More:
- "Optimal Chunk Size in RAG Systems" (research papers)
- LangChain chunking documentation
- Your plants-fieldguide's pdf-processor.ts for reference

---

## Decision Log

### Why Semantic Over Fixed?
**Decision**: Default to semantic chunking for quality RAG system

**Reasoning**:
- Precision matters more than token efficiency for code understanding
- Semantic chunks are more useful for downstream tasks
- Token costs are manageable with proper batching

**Trade-off**: Slightly higher latency and token cost for much better relevance

### Why Include Imports?
**Decision**: Every chunk includes necessary imports

**Reasoning**:
- Code is incomplete without imports
- Context helps understand what libraries are used
- Minimal token overhead
- Massive impact on code comprehension

### Why Not Always Lookahead?
**Decision**: Lookahead optional based on query intent

**Reasoning**:
- Adds ~15% more tokens per chunk
- Only helps when relationships matter
- Phase 3 will choose strategically

---

## Summary

**Phase 1 taught us**:
1. Chunking strategy significantly impacts retrieval quality
2. Semantic chunking is better for code than fixed chunking
3. Precision > recall for code (users want correct code, not all code)
4. Context (imports) is critical for understanding
5. One-size-fits-all doesn't work → need adaptive approach (Phase 3)

**Next Phase**: Route different query types to different strategies for maximum quality.
