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

### Running the Project

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Run the probe agent:
   ```bash
   npm run start
   ```

3. Type-check without building:
   ```bash
   npm run type-check
   ```

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
│   └── index.ts               # Application entry point
└── dist/                      # Compiled JavaScript (generated)
```

---

## Development Roadmap

RedTurn follows a **milestone-based approach** with strict scope control to maximize learning and minimize complexity. See [ROADMAP.md](ROADMAP.md) for full details.

### Milestones Overview

- **Milestone 0** - Define the objective (target model, behavior, turn limit)
- **Milestone 1** - Static baseline (fixed prompts, no adaptation)
- **Milestone 2** - Explicit test rubric (automated failure detection)
- **Milestone 3** - Heuristic adaptive loop (turn-based strategy selection)
- **Milestone 4** - Strategy-content separation (factorized prompts)
- **Milestone 5** - Scored strategy selection (bandit-style learning)
- **Milestone 6** - Evaluation and comparison (metrics, results)
- **Milestone 7** - Retrospective analysis (lessons learned)

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
