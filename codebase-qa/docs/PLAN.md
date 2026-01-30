# Codebase Q&A System - Educational Plan

## Project Overview

Build a RAG system that answers questions about the **red-turn-probe-agent** codebase (or other projects). The system will focus on **adaptive retrieval & context** - understanding that different question types (architecture, implementation details, bug hunting, etc.) require different retrieval strategies and context window sizes.

**Educational Goal**: Learn how to build intelligent code-aware RAG systems that understand query intent and adapt retrieval parameters dynamically.

## Why This Project for Learning

1. **Concrete, Practical**: You have a real codebase to work with
2. **Progressive Complexity**: Can start simple and add sophistication
3. **Code-Specific Challenges**: Learn unique RAG problems for source code
4. **Bridge to Production**: Skills transfer directly to real-world tools
5. **Learning Validation**: Can test the system on your actual codebase knowledge

## Core Learning Areas

### 1. Code-Specific Chunking
- How to split code files to preserve context
- Balance between chunk size and number of tokens
- Preserve relationships: functions → classes → modules
- Metadata preservation: line numbers, file paths, function/class names

### 2. Intent Understanding for Code Queries
Different questions need different approaches:
- **Architecture questions**: "How does the agent system work?" → Need broad module overview
- **Implementation questions**: "How is the retry logic implemented?" → Need specific function code
- **Dependency questions**: "What does this module depend on?" → Need import analysis
- **Example questions**: "Show me how to use X" → Need usage examples
- **Debugging questions**: "Why would this error occur?" → Need error paths and edge cases

### 3. Adaptive Retrieval & Context
- Adjust `k` (number of results) based on query type
- Adjust chunk size/context window based on information need
- Expand queries differently for different intent types
- Use metadata-aware retrieval (file path, function name, line numbers)
- Handle cross-file dependencies and imports

### 4. Code-Aware Response Generation
- Cite specific line numbers and file paths
- Preserve code formatting in responses
- Explain WHY code is structured this way (not just WHAT)
- Handle multi-file explanations cohesively

## Project Structure

```
codebase-qa/
├── src/
│   ├── agents/
│   │   ├── query-router.ts              # Route query to appropriate strategy
│   │   ├── code-analyzer.ts             # Extract structure from codebase
│   │   └── response-synthesizer.ts      # Generate contextual answers
│   ├── retrieval/
│   │   ├── code-chunker.ts              # Split code with metadata
│   │   ├── adaptive-retriever.ts        # Dynamic parameter tuning per intent
│   │   ├── code-aware-search.ts         # Semantic + syntax search
│   │   └── context-expander.ts          # Get cross-file dependencies
│   ├── vector-store/
│   │   ├── vector-store.ts              # HNSW index management
│   │   └── embedding.ts                 # Code embeddings strategy
│   ├── parser/
│   │   ├── ast-parser.ts                # Extract code structure (functions, classes, imports)
│   │   └── dependency-analyzer.ts       # Track file dependencies
│   ├── utils/
│   │   ├── code-metadata.ts             # Preserve line #, file path, scope
│   │   ├── conversation-manager.ts      # Multi-turn context
│   │   └── logger.ts                    # Structured logging
│   └── cli.ts                           # Main CLI interface
├── specs/
│   ├── agents/
│   │   ├── query-router.spec.yaml       # Intent classification rules
│   │   ├── code-analyzer.spec.yaml
│   │   └── response-synthesizer.spec.yaml
│   └── retrieval-strategies.yaml        # Adaptive parameter configs
├── evaluations/
│   ├── test-cases.ts                    # Query test suite (30-50 cases)
│   ├── metrics.ts                       # Custom code-specific metrics
│   ├── eval-runner.ts                   # Evaluation harness
│   └── datasets/
│       ├── architecture-queries.json
│       ├── implementation-queries.json
│       ├── dependency-queries.json
│       └── debugging-queries.json
├── docs/
│   ├── LEARNING.md                      # Educational focus & concepts
│   ├── ARCHITECTURE.md                  # System design rationale
│   ├── CHUNKING_STRATEGY.md             # Code chunking decisions
│   └── RETRIEVAL_PATTERNS.md            # Adaptive retrieval explained
└── scripts/
    └── ingest-codebase.ts               # Load target codebase into system
```

## Implementation Phases

### Phase 0: Project Setup & Foundation - COMPLETE
**Goal**: Set up infrastructure and understand the codebase to index

Tasks:
1. Initialize TypeScript project with CLI (Commander.js)
2. Implement AST parser to extract code structure:
   - Functions with signatures
   - Classes with methods
   - Module imports/exports
   - Comments and docstrings
3. Create code metadata structure:
   - File path, line numbers, scope (function/class name)
   - Function signature
   - Related imports
4. Implement basic file discovery and reading
5. Write LEARNING.md explaining the educational goals

**Output**: Can parse a codebase and extract structured metadata

**Teaches**: ✅ How to parse and structure code for RAG purposes

**Key Concepts to Learn**:
- **Abstract Syntax Trees (ASTs)**: How to programmatically understand code structure without executing it
- **Metadata Preservation**: Why tracking context (line numbers, scope, relationships) is critical for code RAG
- **Code as Data**: Understanding code semantically, not just as text

**Resources to Research**:
- TypeScript Compiler API documentation (how to parse TS code as AST)
- "Semantic Code Search" papers (understanding code structure for retrieval)
- Your existing code parser patterns in cortex or other projects

---

### Phase 1: Code-Aware Chunking - COMPLETE
**Goal**: Split code intelligently while preserving context and semantics

Tasks:
1. Implement semantic chunking:
   - Split by functions/methods first (preserve complete functions)
   - If function too large, split at logical boundaries (loops, conditionals)
   - Keep imports at top of chunk for context
2. Implement chunk metadata:
   - File path, start/end line numbers
   - Function/class name and signature
   - Related file dependencies
3. Create chunk validation:
   - Ensure chunks are token-bounded (not too large for embedding)
   - Ensure related code stays together
4. Build ingestion script:
   - Load target codebase
   - Apply chunking
   - Create embeddings
   - Store in vector index (HNSW)
5. Experiment: Compare semantic vs fixed-size chunking on same codebase and measure retrieval quality differences

**Output**: Codebase indexed with semantically intelligent chunks

**Teaches**: ✅ Trade-offs between retrieval recall vs precision for different query types

**Key Concepts to Learn**:
- **Chunking Strategies**: Different approaches (fixed-size, semantic, content-aware) have different trade-offs
- **Token Budgets**: Embedding models have input limits; understanding token counts is essential
- **Semantic vs Lexical**: Semantic chunking preserves meaning but is slower; fixed chunking is fast but may split related code
- **Context Window**: Balance between chunk size (more context = better understanding) and search space (more chunks = slower search)

**Experiment Design**:
- Test 3 chunking strategies: (1) Fixed 500-char chunks, (2) Semantic by function, (3) Semantic with lookahead for imports
- Run both on same test queries
- Measure: retrieval precision, chunk relevance, token efficiency
- Document findings in CHUNKING_STRATEGY.md

**Resources to Research**:
- Langchain's chunking strategies documentation
- "Chunk Size in RAG Systems" research (academic papers on optimal chunking)
- Your plants-fieldguide's PDF chunking strategy (see pdf-processor.ts)

---

### Phase 2: Intent Classification for Code Queries
**Goal**: Understand different types of code questions

Tasks:
1. Define query intent types:
   - `ARCHITECTURE`: "How does X system work?" → overview of modules/structure
   - `IMPLEMENTATION`: "How is feature Y implemented?" → specific function code
   - `DEPENDENCY`: "What does module X depend on?" → import/dependency analysis
   - `USAGE`: "How do I use class X?" → usage examples, API
   - `DEBUGGING`: "Why would Z fail?" → error paths, edge cases
   - `COMPARISON`: "What's the difference between X and Y?" → side-by-side code
   - `LOCATION`: "Where is function X defined?" → file/line lookup
   - `GENERAL`: General questions about codebase
2. Create query-router agent spec:
   - System prompt for classifying intent
   - Confidence scoring
   - Extract key entities (function names, file paths, etc.)
3. Build routing logic:
   - Map intent → retrieval strategy
4. Test intent classification accuracy on 20+ diverse queries

**Output**: Query router that classifies incoming questions

**Teaches**: ✅ Why different code questions need different retrieval strategies

**Key Concepts to Learn**:
- **Query Intent**: Not all questions are the same - understanding the underlying need drives better retrieval
- **Semantic vs Keyword Routing**: Some queries route on keywords ("How do I...?" = USAGE), others need semantic understanding
- **Entity Extraction**: Questions about specific functions/modules need entity recognition
- **Confidence Scoring**: System should express certainty about its routing decision
- **Fallback Behavior**: When routing is uncertain, how should system behave?

**Experiment Design**:
- Create 20+ test queries across all intent types
- Manually classify them
- Run through your router
- Measure: intent classification accuracy, false positives in routing
- Document confusion patterns (e.g., what queries get misclassified and why)

**Resources to Research**:
- "Intent Classification in NLP" (how to design intent taxonomies)
- Your plants-fieldguide's agent-router.ts (reference implementation of intent routing)
- Zero-shot classification with LLMs (prompt engineering for intent detection)
- PLANTS-NLQI's intent-agent.ts (simpler version to understand progression)

---

### Phase 3: Adaptive Retrieval Strategies
**Goal**: Adjust retrieval parameters dynamically per query type

**THIS IS YOUR CORE LEARNING PHASE** - Focus on understanding how retrieval parameters affect answer quality

Tasks:
1. Define retrieval parameters per intent:
   ```
   ARCHITECTURE: k=15, expand_query=true, include_module_overview=true
   IMPLEMENTATION: k=8, expand_query=false, exact_function_match=true
   DEPENDENCY: k=5, filter_by_imports=true
   USAGE: k=10, boost_examples=true
   DEBUGGING: k=12, include_error_paths=true
   LOCATION: k=3, exact_name_match=true
   ```
2. Implement adaptive retriever:
   - Load intent from query router
   - Apply strategy to retrieval call
   - Validate parameter choices in specs
3. Implement context expansion:
   - For ARCHITECTURE: Add file structure overview
   - For IMPLEMENTATION: Add function signature + full implementation
   - For DEPENDENCY: Add import statements
   - For DEBUGGING: Add error handlers
4. Add result post-processing:
   - Rank by relevance to query intent
   - Boost results that match multiple signals (code similarity + semantic similarity)
   - Deduplicate overlapping chunks
5. Create spec file for retrieval strategies
6. Run ablation study: Test impact of k, query expansion, and filtering on retrieval quality

**Output**: Adaptive retrieval system that responds differently to different query types

**Teaches**: ✅ How to design adaptive retrieval parameters per query type

**Key Concepts to Learn**:
- **Recall vs Precision Trade-off**: Higher k = more results (better recall) but noise increases; ARCHITECTURE needs recall, LOCATION needs precision
- **Query Expansion**: Expanding "Cache invalidation" to "cache, invalidation, TTL, expiration" helps find related code
- **Semantic vs Structural Search**: DEPENDENCY questions need structural search (imports); IMPLEMENTATION needs semantic similarity
- **Context Window Management**: More results consume more tokens; must balance context size vs answer quality
- **Parameter Tuning as Experimentation**: Parameters aren't magic - they're hypotheses to test
- **Signal Fusion**: Combining multiple ranking signals (semantic similarity + exact name match + recency) beats single signal

**Ablation Study Design** (This teaches you parameter impact):
- Start with baseline: all intents use k=10, no expansion, no filtering
- Test 1: Vary k (5, 8, 10, 15, 20) for ARCHITECTURE queries. Measure: recall, precision, answer quality
- Test 2: Query expansion on/off for IMPLEMENTATION queries. Measure: time to answer, relevance
- Test 3: Structural filtering (imports only) for DEPENDENCY queries. Measure: noise reduction
- Document results - which changes had biggest impact? Why?

**Resources to Research**:
- "Ranking in Information Retrieval" (understand recall/precision trade-offs)
- BM25 vs semantic search comparison papers
- Your plants-fieldguide's adaptive-retrieval.ts and multi-source-retrieval.ts (RRF fusion algorithm)
- Vector database documentation on search parameters
- "Lost in the Middle" paper (position bias in long contexts)

---

### Phase 4: Code-Aware Response Generation
**Goal**: Generate accurate, traceable answers about code

Tasks:
1. Implement response synthesizer agent:
   - Takes query + retrieved chunks
   - Generates explanation
   - Always cites file paths and line numbers
2. Add code formatting:
   - Preserve syntax in responses
   - Show relevant context around retrieved code
3. Add code-specific reasoning:
   - Explain WHY code is written this way
   - Highlight important patterns/conventions
4. Handle multi-file answers:
   - When answer spans multiple files, show relationships
   - Trace dependencies between files
5. Create fallback for insufficient context:
   - Explicit "I couldn't find sufficient code evidence for X"
   - Suggest related code sections that were close

**Output**: System generates answers with proper citation and code context

**Teaches**: ✅ How to generate trustworthy, cited answers from code

**Key Concepts to Learn**:
- **Citation as Requirement**: Not optional - every claim must trace back to retrieved code
- **Hallucination Risk**: LLMs can confidently claim code exists when it doesn't; explicit verification is critical
- **Faithfulness to Sources**: Answer should match retrieval, not go beyond it
- **Confidence Calibration**: System should express uncertainty ("Based on limited evidence...")
- **Multi-file Synthesis**: Sometimes the answer requires weaving together code from multiple files
- **Explicit Refusal**: "I couldn't find evidence of X in the codebase" is better than guessing
- **Prompt Engineering for Code**: Specific instructions about citing code improve faithfulness

**Citation Testing Framework**:
- Generate 15-20 answers on diverse queries
- For each answer: manually verify every citation
  - File path exists? ✓
  - Line numbers accurate? ✓
  - Quote matches actual code? ✓
- Track hallucination rate (claims about non-existent code)
- Measure: accuracy of citations, false positive claims, confidence calibration

**Resources to Research**:
- "Faithful Summarization" papers (how to ensure outputs match sources)
- Retrieval-Augmented Generation papers (RAG vs hallucination)
- Your veridex project's governance approach (evidence-based constraints)
- Prompt engineering techniques for code synthesis
- PLANTS-FIELDGUIDE's response-synthesizer.spec.yaml (reference implementation)

---

### Phase 5: Evaluation Framework
**Goal**: Systematically measure RAG quality

Tasks:
1. Create test dataset (30-50 cases):
   - 5-10 per intent type
   - Include ambiguous queries
   - Include "trick" questions (questions with no good answer in codebase)
   - Include multi-step queries (require reasoning across files)
2. Define metrics:
   - `retrieval_accuracy`: Did we retrieve relevant code chunks?
   - `citation_accuracy`: Are cited line numbers/files correct?
   - `answer_completeness`: Does answer fully address query?
   - `hallucination_check`: Did we claim code exists that doesn't?
   - `confidence_calibration`: Is confidence rating accurate?
3. Build evaluation harness:
   - Run test cases
   - Compare against expected results
   - Track metrics over time
   - Integration with Braintrust
4. Create evaluation spec file

**Output**: Evaluation harness shows system quality with specific metrics

**Teaches**: ✅ How to evaluate RAG systems on code-specific metrics

**Key Concepts to Learn**:
- **Retrieval Metrics ≠ Generation Metrics**: Just because you retrieve relevant code doesn't mean the answer is good
- **Precision vs Recall in Evaluation**: High recall (get all relevant code) matters for architecture, but precision matters for debugging
- **Citation Metrics**: Citation accuracy should be tracked separately from answer quality
- **Hallucination Detection**: System can answer coherently while making up code - need explicit checks
- **Multi-level Evaluation**: Test at 4 levels: retrieval → generation → citation → user perception
- **Confidence Calibration**: Model confidence should match actual accuracy (if 80% confident, should be right 80% of time)
- **Ablation Testing**: Change one variable, measure impact - determines what actually matters

**Evaluation Design**:
- Create 40-50 test queries (diverse, challenging, edge cases)
- For each query, document:
  - Expected code sections (ground truth)
  - Query intent type
  - Difficulty level
  - Why it's hard (ambiguous, multi-file, rare pattern, etc.)
- Metrics to track:
  1. **Retrieval Metrics**: precision@5, recall@10, MRR
  2. **Generation Metrics**: answer completeness, correctness, conciseness
  3. **Citation Metrics**: citation accuracy, false citations
  4. **Confidence Metrics**: calibration (predicted vs actual accuracy)
- Build dashboard showing trends over time (as you improve system)

**Resources to Research**:
- "RAGAS" evaluation framework for RAG systems
- Your plants-fieldguide's evaluation approach (query-router.eval.ts, document-retriever.eval.ts)
- Information Retrieval metrics: precision, recall, NDCG, MRR
- LLM evaluation with Braintrust (your existing tool)
- "Evaluating Faithfulness in Language Models" papers

---

### Phase 6: Conversation & Context Management
**Goal**: Handle multi-turn conversations about code

Tasks:
1. Implement conversation memory:
   - Store previous queries + answers
   - Extract "active file context" (what files we've been discussing)
   - Boost retrieval from recently discussed files
2. Handle follow-up queries:
   - "What about the error case?" → understand previous context
   - "Show me the implementation" → remember what we were talking about
3. Manage context window:
   - Keep last 5-10 turns
   - Track conversation history metadata
4. Test multi-turn flows:
   - Architecture overview → Dive into specific function → Look at dependencies

**Output**: System handles multi-turn code questions naturally

**Teaches**: ✅ How conversation context improves code question answering

**Key Concepts to Learn**:
- **Context Decay**: Information from earlier turns matters less as conversation progresses (recency bias)
- **Active Context**: Not all previous information is relevant - need to extract "what are we talking about?" (files, functions, patterns)
- **Follow-up Query Disambiguation**: "What about the error case?" only makes sense if you remember previous context
- **Context Window Limits**: Keeping all conversation history = token cost; must be selective
- **Conversation Memory Patterns**: What should system remember? (previous queries, mentioned files, established context, earlier conclusions)
- **State Machine for Code Dialogs**: Architecture questions → implementation details → error handling follows a natural pattern
- **Context Boosting Strategies**: How to weight previous context in retrieval (recency decay, relevance scoring, active file boost)

**Multi-turn Testing**:
- Design 5-10 conversation flows:
  - Flow 1: Architecture → Implementation → Error Handling
  - Flow 2: "Where is X?" → "What does it depend on?" → "Show me callers"
  - Flow 3: "What changed?" → "Why?" → "Will it break Y?"
- Test without context: system struggles
- Test with context: system succeeds
- Measure: answer quality with vs without conversation history

**Context Management Design**:
1. Define "active context": (recent queries, mentioned files/functions, established intent)
2. Implement context decay: earlier turns matter less
3. Test window sizes: keep last 3 turns vs 10 turns - which is better?
4. Measure token cost vs quality trade-off

**Resources to Research**:
- Multi-turn dialogue systems research
- Your plants-fieldguide's conversation-manager.ts (reference implementation)
- "Conversational Retrieval" papers
- Context window management in LLMs
- Attention mechanisms in transformers (why some info "matters more")

---

### Phase 7: Documentation & Educational Guides
**Goal**: Make the learning explicit

Tasks:
1. Write ARCHITECTURE.md:
   - System design rationale
   - Why each component exists
   - Key design decisions
2. Write CHUNKING_STRATEGY.md:
   - Why we chunk by functions
   - Trade-offs tested
   - Impact on retrieval quality
3. Write RETRIEVAL_PATTERNS.md:
   - Explain adaptive strategies per intent type
   - Show examples of parameter tuning
   - Results of ablation studies
4. Create decision log:
   - Record why we chose HNSW over other options
   - Why we use OpenAI embeddings vs others
   - Trade-offs in chunk sizes

**Output**: Learner can understand WHY system is designed this way, not just HOW

**Teaches**: ✅ How to design systems that are transparent about their limitations

**Key Concepts to Learn**:
- **Decision Documentation**: Recording WHY choices were made (not just WHAT was chosen) enables learning
- **Failure Documentation**: Unexpected behaviors are learning opportunities - document why they happened
- **Trade-off Transparency**: Every design choice has trade-offs; making them explicit is crucial
- **Ablation Study Results**: Communicating parameter tuning results teaches readers what matters
- **Conceptual Coherence**: System architecture should match your mental model of the problem
- **Limitations as Features**: Explicitly documenting what system can't do is as important as what it can

**Documentation Artifacts**:
1. **LEARNING.md**: Your mental model of the problem
   - What is code RAG and why is it different from document RAG?
   - What problems does adaptive retrieval solve?
   - How to think about the design

2. **ARCHITECTURE.md**: Why each component exists
   - System diagram with data flow
   - Why HNSW vs other vector DBs? Why OpenAI embeddings?
   - How each component contributes to adaptive retrieval
   - What would change if requirements were different?

3. **CHUNKING_STRATEGY.md**: Why semantic chunking matters
   - Trade-off analysis: semantic vs fixed vs content-aware
   - Experimental results comparing approaches
   - When each strategy fails and why
   - Token efficiency analysis

4. **RETRIEVAL_PATTERNS.md**: Adaptive parameter tuning explained
   - For each intent type, show:
     - Why these parameter values?
     - What happens if you change them?
     - Ablation study results
   - Examples: "ARCHITECTURE k=15 vs k=5 retrieves X but misses Y"
   - Failure cases: "When adaptive retrieval fails (and why)"

5. **Decision Log**: Critical design decisions
   - Why HNSW? Considered: Pinecone, Weaviate, Chroma
   - Why OpenAI embeddings? Alternatives: Voyage, local models
   - Why chunk by function? Tested: lines 500, semantic, module-aware
   - What was surprising? What would you do differently?

**Resources to Research**:
- Technical writing for engineers
- Design documentation that explains philosophy, not just mechanics
- Your plants-fieldguide and veridex documentation (high-quality examples)
- How to write "What we learned" sections effectively

---

## Key Learning Insights to Capture

As you build, document these learnings:

1. **Chunking Impact**: How does semantic vs fixed chunking affect retrieval quality?
2. **Intent Routing Accuracy**: How often does query intent classification affect final answer quality?
3. **Parameter Tuning**: What happens when you change k from 5 → 10 → 15 for different intent types?
4. **Cross-file Dependencies**: How important is it to understand imports/dependencies for code questions?
5. **Context Window Trade-offs**: More context = better understanding, but token cost increases
6. **Confidence Calibration**: When should system say "I'm not sure" vs "Here's the answer"
7. **Multi-turn Conversation**: How much does previous context improve answer quality?

## Success Criteria

By end of project, you should understand:

- [ ] How to parse and structure code for RAG purposes
- [ ] Why different code questions need different retrieval strategies
- [ ] How to design adaptive retrieval parameters per query type
- [ ] How to generate trustworthy, cited answers from code
- [ ] How to evaluate RAG systems on code-specific metrics
- [ ] Trade-offs between retrieval recall vs precision for different query types
- [ ] How conversation context improves code question answering
- [ ] How to design systems that are transparent about their limitations

## Technology Choices

- **LLM**: Anthropic Claude (Sonnet or Opus for complexity)
- **Embeddings**: OpenAI text-embedding-3-small (or small for cost)
- **Vector Index**: HNSW (hnswlib-node) - local, fast, good for code
- **AST Parsing**: TypeScript compiler API or similar (language-specific)
- **CLI**: Commander.js
- **Specs**: YAML + Zod
- **Evaluation**: Custom harness (Braintrust optional)
- **Code Language**: TypeScript (strict mode)

## Timeline Flexibility

Phases can be done in any order or skipped based on interest:
- Core learning: Phases 1-5 (adaptive retrieval is the focus)
- Extended learning: Add phases 6-7
- Can explore variations in any phase without completing others

## Why Adaptive Retrieval & Context?

This is the right learning focus because:
1. **Unique to Code**: Generic RAG treats all queries equally; code RAG needs intent understanding
2. **High Impact**: Proper intent understanding → 2-3x better answer quality
3. **Practical**: Real code Q&A tools use intent-based routing
4. **Progressive**: Can start simple (fixed k) and evolve to sophisticated tuning
5. **Measurable**: Clearly see impact of parameter changes in evaluation
