# Codebase Q&A: Educational RAG System

**Learn how to build intelligent code-aware RAG systems that understand query intent and adapt retrieval parameters dynamically.**

## Quick Start

```bash
# Set up project (requires Node.js)
npm install
npm run build

# Discover code files in a directory
npm start discover /path/to/codebase

# Analyze code structure
npm start analyze /path/to/file.ts

# Ask a question (phases 2+)
npm start ask "How does authentication work?"
```

## What This Project Teaches

This is an **educational system** demonstrating how to build production-grade code RAG systems. It's structured in 7 learning phases, each teaching specific concepts:

### Phase 0: Foundation (Current)
- **Goal**: Set up infrastructure
- **Teaches**: Code parsing, AST basics, metadata preservation
- **Status**: ✅ Complete
- **Key Files**:
  - `src/parser/ast-parser.ts` - Code structure extraction
  - `src/utils/file-discovery.ts` - File system traversal
  - `src/types/index.ts` - Type definitions

### Phase 1: Code-Aware Chunking
- **Goal**: Split code intelligently
- **Teaches**: Chunking strategies, token budgets, trade-offs
- **Key Learning**: Semantic chunking vs fixed chunking impact
- **Status**: ✅ Complete

### Phase 2: Intent Classification
- **Goal**: Understand query types
- **Teaches**: Query routing, entity extraction, intent types
- **Key Learning**: Why different queries need different strategies
- **Status**: ✅ Complete

### Phase 3: Adaptive Retrieval ⭐
- **Goal**: Adjust parameters per intent
- **Teaches**: Parameter tuning, ablation studies, trade-off analysis
- **Key Learning**: Why parameters matter (core learning)
- **Status**: ✅ Complete

### Phase 4: Code-Aware Response Generation
- **Goal**: Generate cited answers
- **Teaches**: Citation accuracy, hallucination prevention, prompt engineering
- **Status**: ✅ **Core Complete** (Stages 1-3)
- **What's Done**:
  - Stage 1: Real LLM integration (Anthropic/OpenAI/Mock)
  - Stage 2: Citation validation & hallucination detection
  - Stage 3: Intent-aware prompt templates (8 types)
- **Key Files**:
  - `src/agents/response-synthesizer.ts` - Answer generation with validation
  - `src/validation/citation-validator.ts` - Hallucination detection
  - `src/prompts/prompt-templates.ts` - Intent-specific prompts
  - `docs/HALLUCINATION-PATTERNS.md` - Common failure modes

### Phase 5: Evaluation Framework
- **Goal**: Systematically measure quality
- **Teaches**: Metrics design, retrieval vs generation
- **Status**: Pending

### Phase 6: Multi-turn Conversations
- **Goal**: Handle follow-ups
- **Teaches**: Context decay, conversation memory
- **Status**: Pending

### Phase 7: Documentation
- **Goal**: Document decisions
- **Teaches**: Design documentation, transparency
- **Status**: Pending

## Why Code RAG is Different

| Aspect | Document RAG | Code RAG |
|--------|--------------|----------|
| **Question type** | Content ("What is X?") | Structure ("How does X work?") |
| **Retrieval unit** | Passages | Code units (functions, classes) |
| **Dependencies** | Implicit | Explicit (imports, function calls) |
| **Scope variation** | Similar | Huge (ARCHITECTURE needs 15 results, LOCATION needs 1) |

**Solution**: Adaptive retrieval that adjusts parameters per query type.

## Key Insight: Adaptive Retrieval

```
"How does authentication work?" (ARCHITECTURE)
  → k=15, expand_query=true, broad context

"Where is validateToken defined?" (LOCATION)
  → k=3, expand_query=false, narrow context

"Why would login fail?" (DEBUGGING)
  → k=12, include_error_paths=true
```

One system, three completely different retrieval behaviors based on intent.

## Project Structure

```
codebase-qa/
├── docs/
│   ├── PLAN.md           # Full implementation plan with learning concepts
│   ├── LEARNING.md       # Learning guide (READ THIS FIRST)
│   ├── ARCHITECTURE.md   # System design (in progress)
│   ├── CHUNKING_STRATEGY.md
│   └── RETRIEVAL_PATTERNS.md
├── src/
│   ├── parser/
│   │   ├── ast-parser.ts         # Extract code structure
│   │   └── dependency-analyzer.ts (Phase 1)
│   ├── retrieval/
│   │   ├── code-chunker.ts       (Phase 1)
│   │   ├── adaptive-retriever.ts (Phase 3)
│   │   └── ...
│   ├── agents/
│   │   ├── query-router.ts       (Phase 2)
│   │   ├── response-synthesizer.ts (Phase 4)
│   │   └── ...
│   ├── vector-store/
│   │   ├── vector-store.ts
│   │   └── embedding.ts
│   ├── utils/
│   │   ├── file-discovery.ts
│   │   ├── logger.ts
│   │   └── code-metadata.ts
│   ├── types/
│   │   └── index.ts
│   └── cli.ts
├── specs/
│   ├── agents/
│   └── retrieval-strategies.yaml
├── evaluations/
│   ├── test-cases.ts
│   ├── metrics.ts
│   └── eval-runner.ts
├── package.json
├── tsconfig.json
└── README.md
```

## How to Use This for Learning

1. **Read** `docs/LEARNING.md` - Complete learning guide
2. **Read** `docs/PLAN.md` - What each phase teaches
3. **Build** each phase following the plan
4. **Experiment** - Run the ablation studies documented
5. **Document** - Record what you learned in decision log

### Example: Learning Flow for Phase 1

```
1. Understand chunking problem
   → Read about token budgets, semantic vs lexical splitting

2. Implement semantic chunking
   → Split by functions, preserve imports

3. Implement fixed chunking
   → 500-char chunks, simple split

4. Run on same test queries
   → Measure precision, recall, token efficiency

5. Document findings
   → "Semantic improved recall 15% but 20% slower"

6. Learn the lesson
   → Chunking strategy has real trade-offs
```

## Core Learning Outcomes

By the end, you'll understand:

- ✅ How to parse and structure code for RAG
- ✅ Why different code questions need different strategies
- ✅ How to design and tune retrieval parameters
- ✅ How to generate accurate, cited answers
- ✅ How to evaluate RAG systems rigorously
- ✅ Trade-offs between recall, precision, and performance
- ✅ How conversation context improves results
- ✅ Why transparent system design matters

## Technologies Used

- **Language**: TypeScript (strict mode)
- **Vector Search**: HNSW (hnswlib-node)
- **Embeddings**: OpenAI API (Phase 1+)
- **LLM**: Anthropic Claude (Phase 2+)
- **CLI**: Commander.js
- **Configuration**: YAML specs + Zod validation
- **Evaluation**: Custom harness (Braintrust optional)

## Current Status

**Completed Phases:**
- ✅ **Phase 0**: Foundation (AST parsing, file discovery)
- ✅ **Phase 1**: Code-Aware Chunking (semantic chunking, vector indexing)
- ✅ **Phase 2**: Intent Classification (query routing, 8 intent types)
- ✅ **Phase 3**: Adaptive Retrieval (k parameter tuning per intent)
- ✅ **Phase 4**: Core Response Generation (Stages 1-3 complete)
  - Stage 1: Real LLM integration
  - Stage 2: Citation validation & hallucination detection
  - Stage 3: Intent-aware prompt engineering

**Next Steps (Choose Your Path):**
1. **Phase 5**: Build evaluation harness (30-50 test queries, metrics)
2. **Phase 4 Enhancement**: Add deeper validation (Checks 2-4)
3. **Phase 6**: Multi-turn conversation support
4. **Production**: Switch to real Claude API and test with real queries

## Resources for Learning

### Foundation
- [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)
- Your existing projects: cortex, plants-fieldguide, veridex

### Retrieval
- [HNSW Algorithm](https://github.com/nmslib/hnswlib)
- "Lost in the Middle" paper (position bias)
- BM25 vs semantic search comparisons

### RAG Systems
- [Retrieval-Augmented Generation papers](https://arxiv.org/search/?query=retrieval+augmented+generation)
- [RAGAS Evaluation Framework](https://github.com/explodinggradients/ragas)
- Your plants-fieldguide evaluation approach

### Code Understanding
- Abstract Syntax Trees (ASTs)
- Program synthesis
- Dependency analysis

## Notes for Self

This project is structured specifically for **educational understanding**, not production use. Each phase teaches concepts through implementation and experimentation.

**Key learning principle**: You learn by:
1. Understanding the problem
2. Implementing solutions
3. Running experiments
4. Measuring results
5. Documenting findings

Rather than just reading about RAG, you'll build it, test it, and understand *why* things work or don't.

---

**Start here**: Read `docs/LEARNING.md` to understand the learning journey ahead.
