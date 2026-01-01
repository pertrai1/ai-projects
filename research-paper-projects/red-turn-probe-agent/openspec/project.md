# Project Context

## Purpose

RedTurn is a red-teaming probe agent system for eliciting multi-turn conversational failures in large language models. The project is designed as an educational exploration of adversarial testing techniques based on the research paper "Eliciting Behaviors in Multi-Turn Conversations."

**Primary Goals:**
- Learn how multi-turn conversational failures emerge in LLMs
- Experiment with adaptive red-teaming strategies from static baselines to bandit-style learning
- Build intuition about LLM behavioral consistency and failure modes
- Implement milestone-based development with strict scope control

**Explicit Non-Goals:**
- Production red-teaming infrastructure
- Comprehensive LLM safety evaluation
- Multiple target behaviors simultaneously
- More than 2-turn conversations (initially)
- Model fine-tuning or reinforcement learning

## Tech Stack

- **Language:** TypeScript 5.9+ with strict type checking
- **Runtime:** Node.js 18+
- **Module System:** ESM (ES Modules) with NodeNext resolution
- **LLM API:** OpenAI API (configurable via environment variables)
- **Build Tool:** TypeScript Compiler (tsc)
- **Package Manager:** npm

## Project Conventions

### Code Style

- **Strict TypeScript:** All strict compiler options enabled including:
  - `noUncheckedIndexedAccess`
  - `exactOptionalPropertyTypes`
  - `noUnusedLocals` and `noUnusedParameters`
  - `noPropertyAccessFromIndexSignature`
- **Naming Conventions:**
  - camelCase for variables and functions
  - PascalCase for types and interfaces
  - UPPER_CASE for constants
- **Imports:** Use explicit `.js` extensions in import statements (ESM requirement)
- **Module Syntax:** `import` and `export` (no CommonJS)

### Architecture Patterns

- **Incremental Complexity:** Start simple, add complexity only when milestone requirements demand it
- **Strategy-Content Separation:** Separate high-level adversarial strategies from prompt content (Milestone 4+)
- **Data-Driven Design:** Rubrics, strategies, and results should be data structures, not hardcoded logic
- **Functional Core:** Prefer pure functions for testability and clarity
- **Minimal Abstractions:** Avoid premature abstraction; duplicate before abstracting

### Testing Strategy

- **Current:** No automated tests (early development phase)
- **Future (Milestone 2+):** Manual validation with explicit test rubrics
- **Rubric-Based Evaluation:** Success criteria defined as `rubric(conversation) -> bool`
- **Manual Verification:** At least 5 positive and negative examples per rubric

### Git Workflow

- **Main Branch:** `main` is the stable branch
- **Feature Development:** Create proposal via OpenSpec before implementing features
- **Commits:** Clear, descriptive commit messages
- **Milestones:** Each milestone should result in at least one commit

## Domain Context

### Multi-Turn Conversational Failures

LLMs can exhibit failures that only emerge across multiple conversation turns:
- **Self-contradiction:** Asserting incompatible statements
- **Self-affirmation:** Agreeing with mutually exclusive positions
- **Context drift:** Losing track of previous commitments
- **Adversarial susceptibility:** Being manipulated through strategic prompting

### Red-Teaming Terminology

- **Probe Agent:** System that systematically tests for failures
- **Strategy:** High-level approach to eliciting a failure (e.g., "escalate confidence")
- **Turn:** One user message + one model response
- **Rubric:** Machine-verifiable success criterion
- **Static Baseline:** Fixed prompts with no adaptation
- **Adaptive Loop:** Strategy selection based on model responses
- **Bandit-Style Learning:** Preferring historically successful strategies

### Research Foundation

The project implements concepts from "Eliciting Behaviors in Multi-Turn Conversations" (PDF in repository). Key insights:
- Strategy-content factorization improves exploration
- Adaptive approaches outperform static baselines
- Multi-turn failures are qualitatively different from single-turn issues

## Important Constraints

- **Learning Over Performance:** This is an educational project, not production software
- **Scope Discipline:** Follow the ROADMAP strictly; reject feature creep
- **Milestone-Based:** Complete one milestone fully before starting the next
- **Maximum 2 Turns Initially:** Constraint from Milestone 0 requirements
- **One Behavior at a Time:** Test a single failure mode, not multiple simultaneously
- **No RL Training:** Use heuristics and bandit algorithms, not policy gradients
- **No Fine-Tuning:** Only test pretrained models via API

## External Dependencies

- **OpenAI API:** Primary LLM provider (configurable)
  - Requires API key in `.env` file
  - Default model: TBD in Milestone 0
  - Base URL configurable for compatible APIs
- **dotenv:** Environment variable management
