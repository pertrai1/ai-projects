# RedTurn

**RedTurn** is a red-teaming probe agent system designed to elicit multi-turn conversational failures in large language models through adaptive adversarial testing. This project provides a hands-on learning environment for exploring how LLMs can be systematically tested for behavioral inconsistencies, self-contradictions, and other failure modes that emerge across multi-turn interactions.

The tool implements concepts from the research paper [*"Eliciting Behaviors in Multi-Turn Conversations"*](elicitng-behavoirs-in-multi-turn-conversations.pdf) included in this repository, focusing on practical experimentation and incremental learning rather than production deployment.

---

## Background

Large language models often exhibit consistent behavior in single-turn interactions but can fail in subtle and exploitable ways when engaged in multi-turn conversations. These failures include:

- **Self-contradiction** - Asserting contradictory statements across turns
- **Self-affirmation** - Agreeing with mutually exclusive positions
- **Context drift** - Losing track of previous commitments
- **Adversarial susceptibility** - Being manipulated through strategic prompting

RedTurn provides a structured framework for probing these behaviors systematically, using adaptive strategies that learn which approaches are most effective at surfacing failures.

## Why RedTurn?

Traditional LLM evaluation focuses on single-turn accuracy or benchmark performance. However, real-world applications involve extended conversations where behavioral consistency matters. RedTurn addresses this gap by:

1. **Focusing on multi-turn dynamics** - Testing behavior across conversational sequences, not isolated queries
2. **Using adaptive strategies** - Learning which approaches work best for eliciting failures
3. **Separating strategy from content** - Distinguishing high-level intent from surface-level prompts
4. **Providing interpretable results** - Clear rubrics for what constitutes a failure
5. **Emphasizing learning** - Building intuition about LLM behavior through hands-on experimentation

This project is explicitly designed for **educational exploration**, not as a production red-teaming tool.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- An OpenAI API key (or compatible LLM API)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/pertrai1/ai-projects.git
   cd ai-projects/research-paper-projects/red-turn-probe-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Add your API key to the `.env` file:
   ```
   OPENAI_API_KEY="your_key_here"
   OPENAI_BASE_URL="https://api.openai.com/v1"  # Optional
   ```

### Running the System

**Build the project** (required before first run or after code changes):
```bash
npm run build
```

**Static Baseline Mode (Milestones 1 & 2):**

Run a single 2-turn conversation with fixed prompts:
```bash
npm start
```

This will:
- Execute a fixed 2-turn conversation
- Test for self-contradiction using static prompts
- Apply rubric-based contradiction detection
- Log the conversation to `logs/conversations.jsonl`
- Display results in the console

**Adaptive Mode (Milestone 3):**

Run multiple conversations with adaptive strategy selection:
```bash
npm run start:adaptive              # Run 10 conversations (default)
npm run start:adaptive -- --runs 20 # Run custom number of conversations
```

This will:
- Execute N independent 2-turn conversations
- Classify each Turn 1 response (confident/hesitant/hedging/unclear)
- Select Turn 2 strategy based on classification
- Track success rates by category and strategy
- Log all conversations with adaptive metadata
- Display aggregate statistics

**Additional Commands:**

Run rubric validation tests:
```bash
npm test
```

View conversation logs:
```bash
cat logs/conversations.jsonl | jq
```

Type-check without building:
```bash
npm run type-check
```

**Expected Output:**
- Console display showing turns, categories, strategies, and detection results
- JSON Lines log file with full conversation history and metadata
- Statistics showing success rates by category and strategy (adaptive mode)

---

## Current Configuration (Milestone 0)

RedTurn is currently configured to test the following specific behavior:

**Testing Objective:**
> Testing whether the model can be made to contradict its own statements within a 2-turn conversation.

**Configuration Parameters:**
- **Target Model:** `gpt-3.5-turbo`
  - Chosen for cost-effectiveness during development
  - Sufficiently capable to exhibit self-contradiction behaviors
- **Behavioral Objective:** Self-contradiction
  - Turn 1: Elicit an initial position or statement
  - Turn 2: Attempt to get the model to contradict its Turn 1 response
- **Maximum Turns:** 2
  - One turn = one user message + one model response
  - Keeps scope manageable and focused

These parameters are defined in `src/config.ts` and are considered non-negotiable decisions per Milestone 0 of the ROADMAP. Future milestones will build upon this foundation to implement static baselines, rubrics, and adaptive strategies.

---

## Project Structure

```text
.
├── .env.example               # Environment variable template
├── .gitignore
├── AGENTS.md                  # AI assistant instructions
├── CLAUDE.md                  # Project-specific AI context
├── elicitng-behavoirs-in-multi-turn-conversations.pdf  # Research paper
├── package.json
├── README.md
├── ROADMAP.md                 # Milestone-based development plan
├── tsconfig.json
├── openspec/                  # OpenSpec change management
│   ├── project.md             # Project conventions and context
│   ├── specs/                 # Current capability specifications
│   └── changes/               # Proposed changes and archives
├── src/                       # TypeScript source files
│   ├── config.ts              # Test configuration (Milestone 0)
│   ├── llm-client.ts          # OpenAI API integration (Milestone 1)
│   ├── prompts.ts             # Static prompt sequences (Milestone 1)
│   ├── logger.ts              # Conversation logging (Milestones 1 & 3)
│   ├── rubric.ts              # Contradiction detection rubric (Milestone 2)
│   ├── validate-rubric.ts     # Rubric validation script (Milestone 2)
│   ├── classifier.ts          # Response classification (Milestone 3)
│   ├── strategies.ts          # Turn 2 strategy definitions (Milestone 3)
│   ├── adaptive-loop.ts       # Multi-run execution (Milestone 3)
│   └── index.ts               # Main execution flow and mode routing
├── test-examples/             # Test examples for rubric validation (Milestone 2)
│   ├── positive/              # Examples that should detect contradictions
│   │   ├── 001-yes-to-no-reversal.json
│   │   ├── 002-no-to-yes-reversal.json
│   │   ├── 003-implicit-agreement-shift.json
│   │   ├── 004-support-to-oppose.json
│   │   └── 005-benefits-to-risks.json
│   └── negative/              # Examples that should NOT detect contradictions
│       ├── 001-consistent-yes.json
│       ├── 002-consistent-no.json
│       ├── 003-acknowledged-change.json
│       ├── 004-nuanced-same-position.json
│       └── 005-upon-reflection-change.json
├── logs/                      # Conversation logs (generated)
│   ├── .gitkeep
│   └── conversations.jsonl    # JSON Lines log file
└── dist/                      # Compiled JavaScript (generated)
```

---

## Development Roadmap

RedTurn follows a **milestone-based approach** with strict scope control to maximize learning and minimize complexity. See [ROADMAP.md](ROADMAP.md) for full details.

### Milestones Overview

- ✅ **Milestone 0** - Define the objective (target model, behavior, turn limit)
- ✅ **Milestone 1** - Static baseline (fixed prompts, no adaptation)
- ✅ **Milestone 2** - Explicit test rubric (automated failure detection)
- ✅ **Milestone 3** - Heuristic adaptive loop (turn-based strategy selection)
- **Milestone 4** - Strategy-content separation (factorized prompts)
- **Milestone 5** - Scored strategy selection (bandit-style learning)
- **Milestone 6** - Evaluation and comparison (metrics, results)
- **Milestone 7** - Retrospective analysis (lessons learned)

### Current Status: Milestone 3 Complete

The adaptive loop with heuristic strategy selection is now operational! The system now supports two modes:

**Static Baseline Mode** (`npm start`):
- Fixed, non-adaptive prompts (Milestone 1)
- Rubric-based contradiction detection (Milestone 2)
- Single 2-turn conversation per run
- Deterministic results (temperature=0)

**Adaptive Mode** (`npm run start:adaptive`):
- Response classification (confident/hesitant/hedging/unclear)
- Strategy selection based on Turn 1 response category
- Multiple independent conversation runs (default: 10)
- Aggregate statistics by category and strategy
- Extended logging with classification and strategy metadata

**Adaptive Strategies:**
- **Escalate** (for confident responses) - Stronger counterarguments and edge cases
- **Accuse** (for hesitant responses) - Frames one position as obviously correct
- **Exploit-nuance** (for hedging responses) - Forces definitive yes/no answer
- **Default** (for unclear responses) - Falls back to static baseline prompt

**Key Features:**
- Heuristic classification using keyword matching (no ML models)
- Deterministic strategy selection (same category → same strategy)
- Independent runs (no learning between conversations)
- Backward-compatible logs (static mode logs unchanged)

**Next:** Milestone 4 will implement strategy-content separation, factorizing prompts into reusable high-level strategies and swappable content.

Each milestone builds incrementally on the previous one, with clear stop conditions and explicit non-goals to prevent scope creep.

---

## How It Works (Conceptually)

RedTurn's approach mirrors the research methodology:

1. **Baseline Testing** - Establish what static prompts can achieve
2. **Rubric Definition** - Create machine-verifiable success criteria
3. **Adaptive Strategies** - Adjust approach based on model responses
4. **Strategy Factorization** - Separate intent from implementation
5. **Bandit-Style Learning** - Prefer strategies that historically succeed
6. **Comparative Analysis** - Measure improvement over baseline

The system intentionally avoids:
- Full reinforcement learning (no policy gradients)
- Model fine-tuning
- Multi-behavior testing (one behavior at a time)
- Production-scale deployment

---

## Project Goals and Limitations

### Goals

- **Learn** how multi-turn conversational failures emerge in LLMs
- **Experiment** with adaptive red-teaming strategies
- **Understand** the trade-offs between static and adaptive approaches
- **Build intuition** about LLM behavioral consistency

### Explicit Non-Goals

- Production red-teaming infrastructure
- Comprehensive LLM safety evaluation
- Multiple target behaviors simultaneously
- More than 2-turn conversations (initially)
- Model fine-tuning or training

### Limitations

- This is a **learning project**, not a research contribution
- Results are specific to tested models and prompts
- No guarantees about generalization or completeness
- Intentionally simple to maximize understanding

---

## Technical Context

**Language Model:** OpenAI API (configurable)
**Programming Language:** TypeScript
**Runtime:** Node.js 18+
**Module System:** ESM (ES Modules)
**Type Checking:** Strict mode with comprehensive type safety

---

## References

- Research paper: [*Eliciting Behaviors in Multi-Turn Conversations*](elicitng-behavoirs-in-multi-turn-conversations.pdf) (included in this repository)
- Related work on adversarial testing and red-teaming of language models
- OpenAI API documentation for model interaction

---

## License

MIT

---
