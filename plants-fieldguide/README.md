# Plants FieldGuide

Plants FieldGuide is an AI-powered CLI assistant for the USDA PLANTS Help documentation. It uses intelligent query routing, adaptive retrieval strategies, and multi-agent orchestration to help the user find the appropriate information.

## Objectives

This project demonstrates advanced concepts for building intelligent RAG systems:

### Phase 1: Foundation
- **PDF Processing & Text Extraction** - Section detection and intelligent chunking
- **Vector Embeddings & Semantic Search** - HNSW indexes for efficient similarity search
- **RAG Architecture** - Combining retrieval with LLM generation
- **Spec-Driven Agent Design** - YAML-based agent specifications

### Phase 2: Intelligence
- **Intent Classification** - Routing queries to specialized agents
- **Agent Specialization** - Focused agents for definitions, procedures, comparisons
- **Adaptive Retrieval** - Dynamic search parameter optimization
- **Multi-Source Retrieval** - Combining vector, keyword, and filtered searches
- **Result Fusion** - RRF (Reciprocal Rank Fusion) algorithm
- **Response Synthesis** - Comprehensive answers from multiple sources
- **Confidence Scoring** - Evidence-based confidence assessment
- **Conversational Memory** - Multi-turn conversations with context tracking

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Runtime | Node.js | ES2022 modules |
| Language | TypeScript | Strict mode |
| LLM | Anthropic Claude Sonnet 4.5 | `@anthropic-ai/sdk` v0.32.0 |
| Embeddings | OpenAI | `openai` v6.10.0 for embeddings API |
| Vector Store | HNSWLib | `hnswlib-node` v3.0.0 for fast similarity search |
| PDF Processing | pdf2json | Text extraction from PDF documents |
| CLI Framework | Commander.js | Command-line interface |
| Terminal UI | Ora + Chalk | Spinners and colored output |
| Config | YAML | Agent specs and workflows |
| Schema Validation | Zod | Type-safe schema validation |

## Project Structure

```
src/
├── cli.ts                     # CLI entry point with command definitions
├── agents/
│   ├── spec-executor.ts       # Agent executor for running YAML specs
│   └── workflow-executor.ts   # Workflow orchestration
├── commands/
│   ├── ask.ts                 # Basic question answering (Phase 1)
│   ├── ask-smart.ts           # Intelligent routing (Phase 2 Step 1)
│   ├── search-adaptive.ts     # Adaptive retrieval (Phase 2 Step 2)
│   ├── ask-synthesized.ts     # Response synthesis (Phase 2 Step 3)
│   ├── chat.ts                # Interactive chat (Phase 2 Step 4)
│   ├── index.ts               # PDF indexing
│   ├── debug.ts               # PDF debugging
│   └── specs.ts               # List agents
├── utils/
│   ├── agent-router.ts        # Query routing logic (Phase 2)
│   ├── adaptive-retrieval.ts  # Adaptive search (Phase 2)
│   ├── multi-source-retrieval.ts  # Multi-source retrieval (Phase 2)
│   ├── conversation-manager.ts    # Conversation memory (Phase 2)
│   ├── pdf-processor.ts       # PDF processing
│   ├── embeddings.ts          # Embedding generation
│   ├── vector-store.ts        # HNSW vector index
│   └── spec-loader.ts         # YAML spec loader
└── types/                     # TypeScript type definitions

specs/
├── agents/
│   ├── query-router.spec.yaml         # Route queries to specialists
│   ├── retrieval-strategist.spec.yaml # Optimize search parameters
│   ├── response-synthesizer.spec.yaml # Synthesize multi-source answers
│   ├── definition-lookup.spec.yaml    # Definition specialist
│   ├── how-to-guide.spec.yaml         # Procedure specialist
│   ├── comparison.spec.yaml           # Comparison specialist
│   └── ...                             # More agents
└── workflows/
    ├── question-answering.spec.yaml   # Phase 1 workflow
    └── smart-routing.spec.yaml        # Phase 2 workflow

docs/                                   # Learning documentation
data/                                   # Generated embeddings
```

## Getting Started

**Prerequisites:**

Before running FieldGuide, you need to configure API keys:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your API keys:
   - **Anthropic API Key**: https://console.anthropic.com/
   - **OpenAI API Key**: https://platform.openai.com/api-keys (for embeddings)

3. Add the keys to your `.env` file:
   ```bash
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```

**Installation:**

```bash
# Install dependencies
npm install

# Index the PLANTS documentation (required first time)
npm run cli -- index

# Ask a question
npm run cli -- ask "How do I search for plants?"
```

**Global Installation (optional):**
```bash
# Build and install globally
npm run build
npm install -g .

# Run from any directory
fieldguide ask "How do I use the plant search?"
```

## Commands

### Index Documentation

```bash
# Index the PDF (required first time)
npm run cli -- index

# Custom parameters
npm run cli -- index --chunk-size 2000 --chunk-overlap 400 --verbose
```

### Ask Questions (Basic)

```bash
# Simple question answering
npm run cli -- ask "What are wetland indicators?"

# Direct vector search (no LLM)
npm run cli -- ask "taxonomy" --direct
```

### Ask Smart (Query Routing - Step 1)

Intelligent routing to specialized agents:

```bash
# Smart routing with automatic agent selection
npm run cli -- ask-smart "What is FACW?" -v

# Educational mode - see routing decision without executing
npm run cli -- ask-smart "How do I search by state?" --show-routing

# Try different query types
npm run cli -- ask-smart "Compare native vs introduced plants" -v
npm run cli -- ask-smart "What is ethnobotany?"
npm run cli -- ask-smart "How do I filter by characteristics?" --show-routing
```

**What to observe:**
- Which agent type is selected (DEFINITION_LOOKUP, HOW_TO_GUIDE, COMPARISON, etc.)
- Confidence level in routing decision
- Reasoning behind the selection
- Keywords extracted from query

### Search Adaptive (Adaptive Retrieval - Step 2)

Dynamic search parameter optimization:

```bash
# See the retrieval strategy for a query
npm run cli -- search-adaptive "What is FACW?" --show-strategy

# Compare adaptive vs fixed k=5 search
npm run cli -- search-adaptive "What is FACW?" --compare
npm run cli -- search-adaptive "How do I filter plants?" --compare

# Execute adaptive search
npm run cli -- search-adaptive "wetland classification" -v
```

**What to observe:**
- k parameter adjustment (3 for definitions, 7 for procedures, 10 for exploration)
- When exactMatch vs query expansion is used
- Multi-pass search for comparisons
- Section filtering for procedural questions
- Efficiency gains (fewer results for simple queries)

### Ask Synthesized (Response Synthesis - Step 3)

Complete Phase 2 pipeline with multi-source retrieval:

```bash
# Full pipeline: routing + adaptive retrieval + multi-source + synthesis
npm run cli -- ask-synthesized "What is FACW?" -v

# Show which retrieval sources contributed
npm run cli -- ask-synthesized "What is FACW?" --show-sources

# Try different fusion methods
npm run cli -- ask-synthesized "What is FACW?" --fusion-method RRF
npm run cli -- ask-synthesized "What is FACW?" --fusion-method score-based

# Complex queries benefit most from multi-source
npm run cli -- ask-synthesized "Compare OBL vs FACW wetland indicators" -v
```

**What to observe:**
- Multiple retrieval sources (vector, keyword, section-filtered, expanded)
- RRF fusion combining results from different strategies
- Synthesis identifying complementary vs redundant information
- Confidence scoring based on source agreement
- Source attribution showing which strategy found what

### Chat (Conversational Memory - Step 4)

Interactive multi-turn conversations with context tracking:

```bash
# Start interactive chat session
npm run cli -- chat

# With conversation context display
npm run cli -- chat --show-context

# With verbose pipeline information
npm run cli -- chat -v
```

**Chat Commands:**
- `exit`, `quit` - End the session with summary
- `clear` - Start fresh conversation
- `stats` - Show session statistics
- `help` - Show available commands

**Example Session:**

```
You: What is FACW?
FieldGuide: FACW stands for "Facultative Wetland." This is a wetland
indicator status code...
Confidence: high

You: What about OBL?
FieldGuide: OBL stands for "Obligate Wetland." Plants with this
designation occur almost exclusively in wetlands...
Confidence: high

You: Compare them
FieldGuide: Comparing FACW and OBL:

**FACW (Facultative Wetland):**
- Occurs 67-99% in wetlands
- Sometimes found in uplands

**OBL (Obligate Wetland):**
- Occurs 99-100% in wetlands
- Rarely if ever in uplands
Confidence: high

You: stats
Session Statistics
Questions asked: 3
Topics discussed: 2
Entities mentioned: 2

```

**What to observe:**
- Follow-up question understanding (e.g., "What about OBL?", "Compare them")
- Context enrichment from previous conversation
- Session tracking with topics and entities
- Natural conversation flow without repeating context

## Utility Commands

### Debug & Info

```bash
# Analyze PDF structure
npm run cli -- debug --file ./PLANTS_Help_Document_2022.pdf

# List available agents
npm run cli -- specs
```

## Quick Start Examples

```bash
# 1. Index the documentation
npm run cli -- index

# 2. Try Phase 1 (basic RAG)
npm run cli -- ask "What is FACW?"

# 3. Try Phase 2 Step 1 (query routing)
npm run cli -- ask-smart "What is FACW?" --show-routing

# 4. Try Phase 2 Step 2 (adaptive retrieval)
npm run cli -- search-adaptive "What is FACW?" --show-strategy

# 5. Try Phase 2 Step 3 (complete pipeline)
npm run cli -- ask-synthesized "What is FACW?" -v

# 6. Try Phase 2 Step 4 (conversational chat)
npm run cli -- chat

# 7. Compare all approaches
npm run cli -- ask "What is FACW?"              # Phase 1
npm run cli -- ask-smart "What is FACW?"       # Phase 2 partial
npm run cli -- ask-synthesized "What is FACW?" # Phase 2 full
```

## Spec-Driven Agent Design

FieldGuide uses YAML-based agent specifications for modular AI behavior:

- `specs/agents/` - Agent definitions with prompts and schemas
- `specs/prompts/` - Reusable prompt templates
- `specs/tools/` - Tool specifications
- `specs/workflows/` - Multi-agent workflows

**Example Agent Spec Structure:**
```yaml
metadata:
  name: question-analyzer
  version: 1.0.0
  description: Analyzes user questions and retrieves relevant context

input_schema:
  question: string
  context: string[]

system_prompt: |
  You are an expert assistant for the PLANTS database...

model:
  provider: anthropic
  name: claude-3-5-sonnet-20241022
  temperature: 0.7
  max_tokens: 2000
```

## Architecture

### RAG Pipeline

```
1. Indexing Phase:
   a. Extract text from PDF (pdf2json)
   b. Detect sections and create chunks
   c. Generate embeddings (OpenAI/Transformers.js)
   d. Build HNSW vector index
   e. Save to disk

2. Query Phase:
   a. User asks question via CLI
   b. Generate query embedding
   c. Vector search for top-k similar chunks
   d. Retrieve chunk content + metadata
   e. Pass to Claude with context
   f. Stream response to user
```

## Document Processing

- **Section Detection** - Identifies document structure (headings, chapters)
- **Smart Chunking** - Respects section boundaries, configurable overlap
- **Metadata Preservation** - Tracks page numbers, sections, chunk positions
- **Page Assignment** - Maps chunks back to original PDF pages

## Vector Store

- **HNSW Algorithm** - Fast approximate nearest neighbor search
- **Persistent Storage** - Save/load indexes from disk
- **Batch Operations** - Efficient bulk insertion and updates
- **Metadata Tracking** - Store document metadata with vectors

## Development

**Development Mode:**
```bash
npm run dev          # Watch mode with auto-restart
npm run cli -- <cmd> # Run specific command
npm run typecheck    # Type checking without build
```

**Build:**
```bash
npm run build        # Compile TypeScript to dist/
```

**Testing:**
```bash
npm test            # Run test suite (vitest)
```

## Conventions

### Code Style
- ES modules only (`"type": "module"`)
- TypeScript strict mode
- Async/await for all I/O operations

### File Naming
- camelCase for TypeScript files: `pdfProcessor.ts`
- kebab-case for CLI commands: `debug.ts`

### TypeScript
- Target: ES2021
- Module: ES2022
- Strict type checking enabled
- Explicit return types for public APIs

## Documentation (in `docs/`)
- `ROUTING-GUIDE.md` - Query Routing
- `ADAPTIVE-RETRIEVAL.md` - Adaptive Retrieval
- `RESPONSE-SYNTHESIS.md` - Response Synthesis
- `CONVERSATIONAL-MEMORY.md` - Conversational Memory

## License

MIT
