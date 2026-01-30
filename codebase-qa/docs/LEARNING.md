# Learning Guide: Building Adaptive Code RAG Systems

## What This Project Teaches

This is an **educational RAG system** focused on understanding how to answer questions about code by adapting retrieval strategies to different query types.

### Core Learning Goal

**Learn how to build intelligent code-aware RAG systems that understand query intent and adapt retrieval parameters dynamically.**

By the end, you'll understand:
- How to parse and structure code for RAG purposes
- Why different code questions need different retrieval strategies
- How to design adaptive retrieval parameters per query type
- How to generate trustworthy, cited answers from code
- How to evaluate RAG systems on code-specific metrics
- Trade-offs between retrieval recall vs precision
- How conversation context improves code question answering
- How to design systems that are transparent about limitations

---

## Why Code RAG is Different from Document RAG

### Document RAG (e.g., PDFs, articles)
- Questions are typically about *content* ("What is X?")
- Retrieval finds relevant *passages*
- One-to-one mapping: retrieved text = answer

### Code RAG (e.g., source code)
- Questions are about *structure and relationships* ("How does X work?")
- Retrieval must find relevant *code units* (functions, classes, modules)
- Multi-layered: need function + dependencies + context
- Different query types need fundamentally different retrieval approaches

**Example**: When asked "How does authentication work?", a document RAG might find "authentication is the process of verifying identity." But a code RAG needs to find:
- The authentication module/function
- Its dependencies (crypto libraries, session management)
- Error paths and edge cases
- Callers (who uses this?)

---

## Problem: Generic RAG Doesn't Work for Code

**Naive approach**: Treat all code questions the same
- Same number of results (k=5) for everything
- No query expansion
- No structural understanding

**Problems**:
1. "How does the system work?" (ARCHITECTURE) needs 15 code sections and module overview
2. "Where is function X defined?" (LOCATION) needs only 1-3 precise results
3. "What could cause this error?" (DEBUGGING) needs error paths and edge cases
4. "How do I use this API?" (USAGE) needs usage examples and documentation

**One k=5 doesn't fit all.**

---

## Solution: Adaptive Retrieval

**Key insight**: Different query intents need different retrieval strategies.

### How Adaptive Retrieval Works

```
Query: "How does the user authentication system work?"
  ↓
Query Router: "This is an ARCHITECTURE question"
  ↓
Retrieval Strategy for ARCHITECTURE:
  - k=15 (get more results for overview)
  - expand_query=true (expand to related terms)
  - include_module_overview=true (show file structure)
  - context_window=broad (more context)
  ↓
Retrieve 15 code sections + module overview
  ↓
Synthesize into: "The auth system consists of [module overview], with these key functions: [function list]"
```

### vs. LOCATION Question

```
Query: "Where is the validateToken function?"
  ↓
Query Router: "This is a LOCATION question"
  ↓
Retrieval Strategy for LOCATION:
  - k=3 (get just the best matches)
  - expand_query=false (no expansion, be precise)
  - exact_function_match=true (fuzzy match is bad here)
  - context_window=narrow (just the function)
  ↓
Retrieve 3 most relevant results (one should be exact match)
  ↓
Synthesize into: "validateToken is defined in auth/validators.ts at line 45"
```

**Same system, completely different retrieval behavior based on intent.**

---

## Seven Learning Phases

### Phase 0: Foundation
**Goal**: Set up infrastructure and understand code structure

**Key Learning**: Abstract Syntax Trees, code as data, metadata preservation

### Phase 1: Code-Aware Chunking
**Goal**: Split code intelligently

**Key Learning**: Chunking strategy impacts retrieval quality more than most people realize

**Experiment**: Compare semantic chunking (by function) vs fixed chunking. Measure impact.

### Phase 2: Intent Classification
**Goal**: Understand different query types

**Key Learning**: Not all questions are the same; classify them first

**Query Types**:
- ARCHITECTURE: "How does X system work?"
- IMPLEMENTATION: "How is feature Y implemented?"
- DEPENDENCY: "What does module X depend on?"
- USAGE: "How do I use class X?"
- DEBUGGING: "Why would Z fail?"
- COMPARISON: "What's the difference between X and Y?"
- LOCATION: "Where is function X defined?"
- GENERAL: General questions

### Phase 3: Adaptive Retrieval (CORE LEARNING)
**Goal**: Adjust parameters per query type

**Key Learning**: Parameters aren't magic; they're hypotheses to test

**Ablation Study Design**:
- Baseline: k=10 for everything
- Test 1: Vary k (5, 8, 10, 15, 20) for ARCHITECTURE queries
- Test 2: Query expansion on/off for IMPLEMENTATION queries
- Test 3: Structural filtering for DEPENDENCY queries
- Measure: Which changes had biggest impact?

### Phase 4: Trustworthy Generation
**Goal**: Generate cited answers

**Key Learning**: LLMs hallucinate confidently; citations are requirements

**Testing**: Verify every citation is accurate before calling answer correct

### Phase 5: Evaluation
**Goal**: Systematically measure quality

**Key Learning**: Retrieval metrics ≠ generation metrics

**Metrics**:
- Retrieval: precision, recall, MRR
- Generation: completeness, correctness
- Citations: accuracy, false positives
- Confidence: calibration (predicted vs actual)

### Phase 6: Multi-turn Conversations
**Goal**: Handle follow-up questions

**Key Learning**: Context decays over time, must be selective

**Testing**: Compare answer quality with vs without conversation history

### Phase 7: Documentation
**Goal**: Make learning explicit

**Key Learning**: Why is more important than what; document decisions, not just code

---

## Concepts to Understand Throughout

### Code Structure
- **Functions/methods**: Individual operations
- **Classes**: Collections of related functions
- **Modules**: Collections of related classes
- **Dependencies**: What imports/uses what
- **Exports**: What's available to others

### Retrieval Concepts
- **Recall**: Did we find all relevant code? (Higher is better, but slower)
- **Precision**: Were all results relevant? (Higher is better, faster)
- **Semantic similarity**: "authenticate" similar to "authentication"?
- **Structural matching**: Finding by exact name, imports, etc.
- **Signal fusion**: Combining multiple ranking signals

### RAG-Specific
- **Hallucination**: Claiming code exists when it doesn't
- **Faithfulness**: Answer matches retrieved code
- **Citation accuracy**: Line numbers and files are correct
- **Confidence calibration**: System confidence matches actual accuracy

### System Design
- **Token budgets**: Embedding models have input limits
- **Context windows**: More results = more tokens = higher cost
- **Trade-offs**: Everything has trade-offs (speed vs quality, cost vs accuracy)
- **Observability**: Logging and metrics for understanding behavior

---

## How to Use This Project for Learning

### For Each Phase

1. **Read the Key Concepts** in the plan
2. **Research the suggested resources** (papers, existing code)
3. **Implement the phase** following the tasks
4. **Run the experiment** and measure impact
5. **Document your findings** in the decision log

### Example: Phase 1 Learning Flow

1. Read about chunking strategies
2. Look at plants-fieldguide's pdf-processor.ts for reference
3. Implement semantic chunking (by function)
4. Implement fixed chunking (500-char chunks)
5. Run both on same test queries
6. Measure retrieval precision/recall for each
7. Document: "Semantic chunking improved recall by 15% but was 20% slower"
8. **This teaches you**: Chunking strategy trade-offs are real

### Example: Phase 3 Learning Flow (Core)

1. Implement basic retrieval (k=10, no expansion)
2. Test on 20 ARCHITECTURE questions
3. Change k to 15, test again
4. Change k to 20, test again
5. Document results: k=15 was sweet spot (90% recall, 70% precision)
6. Try query expansion: "authenticate" → "authenticate, auth, session"
7. Measure impact
8. Document: "Query expansion added 12% more relevant results"
9. **This teaches you**: How parameters impact quality, why one-size-fits-all fails

---

## Learning Success Criteria

By end of project, you should be able to:

- [ ] Explain how ASTs help understand code structure
- [ ] Describe trade-offs in 3+ chunking strategies
- [ ] Design intent classification for 8 query types
- [ ] Implement adaptive retrieval with experiments
- [ ] Generate cited answers with 95%+ citation accuracy
- [ ] Define metrics to evaluate retrieval + generation separately
- [ ] Explain why k=15 is better for ARCHITECTURE than LOCATION
- [ ] Justify every design decision with data or reasoning

---

## Resources to Research

### Foundation
- TypeScript Compiler API documentation
- "Semantic Code Search" papers
- Your existing projects (cortex, plants-fieldguide, veridex)

### Retrieval
- "Ranking in Information Retrieval" papers
- BM25 vs semantic search comparisons
- HNSW algorithm documentation
- "Lost in the Middle" (position bias in long contexts)

### RAG
- Retrieval-Augmented Generation papers
- "Faithful Summarization" research
- RAGAS evaluation framework
- Your plants-fieldguide evaluation approach

### Code Understanding
- Abstract Syntax Trees (ASTs)
- Code representation learning
- Program synthesis
- Dependency analysis

### System Design
- Multi-turn dialogue systems
- Context window management
- Attention mechanisms in transformers
- Design documentation best practices

---

## Next Steps

1. **Phase 0**: You are here - setting up foundation
2. **Phase 1**: Implement chunking strategies and compare
3. **Phase 2**: Build intent classifier
4. **Phase 3**: The main event - adaptive retrieval with experiments
5. **Phase 4-7**: Finish the system and document learning

**Start with Phase 0 completion, then move to Phase 1 for first real learning.**
