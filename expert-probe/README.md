# ExpertProbe: A Harness for Evaluating Expertise Dilution in Multi-Agent Systems

## Overview

**ExpertProbe** is a reusable evaluation harness designed to measure how multi-agent systems perform relative to their strongest individual agent.

Recent research shows that unconstrained, self-organizing LLM teams often fail to match—or even significantly underperform—their best member due to consensus-seeking behavior and expertise dilution. ExpertProbe exists to make this failure mode observable, measurable, and reproducible.

Rather than proposing new agent architectures, ExpertProbe focuses on controlled experimentation:

- Does a team outperform its expert?
- What happens when the expert is revealed vs hidden?
- How does team size affect performance?
- Which aggregation strategies preserve or destroy expert signal?

ExpertProbe is intentionally lightweight. It is not an agent framework, not a workflow engine, and not an autonomous system. It is test infrastructure—closer to a benchmarking harness or unit-test runner for multi-agent reasoning behavior.

## Core Purpose

ExpertProbe answers one primary question:

> Does this multi-agent configuration leverage expertise—or dilute it?

From that, it enables systematic exploration of:

- Expert identification vs expert utilization
- Consensus vs authority-driven aggregation
- Team size scaling effects
- Robustness trade-offs (e.g., resistance to adversarial agents)

## Design Philosophy

ExpertProbe is built around several principles:

- Expert-as-baseline
  Every team is evaluated against its strongest individual agent, not a human or external benchmark.
- Configuration over code
  Agent roles, prompts, and aggregation strategies are treated as declarative inputs.
- Reproducibility first
  The same tasks and metrics can be rerun across configurations and time.
- Minimalism by default
  The smallest harness capable of surfacing expertise dilution is preferred over complex orchestration.
- Research translation
  Paper claims are turned into executable experiments rather than summaries or opinions.

## What ExpertProbe Is (and Is Not)

ExpertProbe is:

- An evaluation harness
- A comparative testing tool
- A bridge between agent research and engineering practice

ExpertProbe is not:

- An agent framework
- A prompt engineering playground
- A production multi-agent system

## Intended Use Cases

- Reproducing findings from multi-agent research papers
- Comparing aggregation strategies (consensus, voting, expert-first, weighted)
- Stress-testing multi-agent designs before production use
- Building intuition about when “more agents” makes results worse
- Creating reusable evaluation artifacts for agent research

## Developer Setup

### Prerequisites

- Node.js >= 18
- An OpenAI-compatible API key

### Installation

```bash
npm install
```

### Environment

Copy the example and add your API key:

```bash
cp .env.example .env
```

`.env` requires:

```
OPENAI_API_KEY=your_key_here
```

Optionally set `OPENAI_BASE_URL` if using a gateway or proxy.

### Running Tests

```bash
npm test            # single run (83 tests)
npm run test:watch  # watch mode
npm run typecheck   # type-check without emit
```

All tests are deterministic — no API calls, no network, no flakiness. LLM interactions are tested through interface mocks.

### Building

```bash
npm run build       # compiles to dist/
```

## Running the Experiment

### Quick Start

```bash
npx tsx src/cli.ts run
```

This runs both conditions (expert-hidden and expert-revealed) against all 5 built-in tasks using `gpt-4o-mini` at temperature 0.

### CLI Options

```
expert-probe run [options]

  -c, --condition <condition>  expert-hidden | expert-revealed (default: both)
  -m, --model <model>          LLM model name (default: gpt-4o-mini)
  -t, --temperature <temp>     LLM temperature 0–2 (default: 0)
  -o, --output-dir <dir>       Where to write result JSON (default: results/)
```

### Examples

Run only the expert-revealed condition:

```bash
npx tsx src/cli.ts run --condition expert-revealed
```

Use a different model with higher temperature:

```bash
npx tsx src/cli.ts run --model gpt-4o --temperature 0.3
```

### Output

Each run creates a timestamped directory under `results/` containing:

- `metrics.json` — Expert accuracy, team accuracy, accuracy delta, per-task breakdown
- `raw-results.json` — Full agent responses, reasoning, and scoring details

A negative accuracy delta (team < expert) indicates the expertise dilution effect was reproduced.

### Built-in Tasks

The harness ships with 5 evaluation tasks spanning different domains:

| ID | Type | Question | Answer |
|----|------|----------|--------|
| math-001 | Math | What is 17 * 24? | 408 |
| math-002 | Math | What is the square root of 144? | 12 |
| logic-001 | Logic | If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly? | No |
| trivia-001 | Trivia | What is the chemical symbol for gold? | Au |
| sat-001 | SAT | Architect is to building as author is to: (A) library (B) book (C) reading (D) writing | B |

### Architecture Overview

```
For each task:
  1. Expert solo run → baseline answer
  2. Expert + Non-Expert A + Non-Expert B in parallel → 3 responses
  3. All 3 responses → Moderator → single team answer
  4. Score expert answer and team answer against ground truth
  5. Compute accuracy delta (team − expert)
```

The four agents are:

1. **Expert** — Precise, methodical domain expert (baseline)
2. **Non-Expert A** — Confident, fast-thinking generalist
3. **Non-Expert B** — Skeptical contrarian who challenges assumptions
4. **Moderator** — Consensus synthesizer who produces the team's final answer

## Initial Scope

The initial version of ExpertProbe focuses on:

- Single-task runs
- Small agent teams (1 expert + N non-experts)
- Explicit expert vs team accuracy comparison
- Transparent logging of agent deliberation and final decisions

Later versions may extend to:

- Parameter sweeps
- Robustness testing
- Judge-model scoring
- Visualization of expertise dilution effects

## First Experiment: Measuring Expert Dilution

This walkthrough describes the **minimum experiment** that validates ExpertProbe’s core purpose:
**detecting whether a multi-agent team underperforms its strongest individual agent**.

The goal of this experiment is not optimization or performance—it is _mechanism discovery_.

---

### Experiment Goal

Verify whether a self-organizing agent team:

- matches,
- exceeds, or
- **falls below**

The performance of its designated Expert agent on the same task set.

A negative result (team < expert) is considered a **successful reproduction** of the expertise dilution effect.

---

### Hypothesis

> A multi-agent team using free-form deliberation and consensus aggregation will underperform its Expert agent, even when the Expert is explicitly identified.

---

### Task Selection

Choose a small set of tasks with **clear, objectively correct answers**.

Recommended characteristics:

- Discrete answers (numeric, multiple-choice, short fact)
- Low ambiguity
- Short context window

Example task types:

- Logic puzzles
- Math problems
- SAT-style questions
- Domain trivia with known answers

Each task must be runnable independently and scored deterministically.

---

### Agent Configuration

This first experiment uses **four agents**:

1. **Expert Agent**
   - Optimized for accuracy
   - Acts as the baseline for comparison

2. **Non-Expert Agent A**
   - Confident generalist
   - Contributes fast but potentially shallow reasoning

3. **Non-Expert Agent B**
   - Skeptical contrarian
   - Challenges assumptions and introduces doubt

4. **Moderator (Aggregator)**
   - Produces a single team answer
   - Attempts to integrate all viewpoints
   - Prefers consensus over authority

No agent is allowed to ask follow-up questions during execution.

---

### Experimental Conditions

Run the experiment under **two conditions**.

#### Condition A — Expert Hidden

- No agent is told who the Expert is
- All opinions are treated symmetrically
- The Moderator synthesizes based on discussion alone

#### Condition B — Expert Revealed

- The Expert agent is explicitly identified in prompts
- Non-experts are instructed to defer where appropriate
- The Moderator is instructed to heavily weight the Expert

Both conditions use the **same tasks**, **same agents**, and **same aggregation logic**.

---

### Execution Steps

For each task:

1. Run the **Expert Agent alone**
   - Record its final answer
   - This establishes the baseline

2. Run all **three contributor agents in parallel**
   - Expert
   - Non-Expert A
   - Non-Expert B

3. Pass all agent responses to the **Moderator**
   - The Moderator produces a single team answer

4. Score:
   - Expert answer correctness
   - Team answer correctness

Repeat for all tasks in the set.

---

### Metrics Collected

For each run, record:

- Expert accuracy
- Team accuracy
- Accuracy delta (Team − Expert)
- Agent final answers
- Moderator summary and final decision

Optional (but recommended):

- Confidence language
- Disagreement markers
- Length of deliberation

---

### Expected Outcome

If the experiment reproduces the paper’s findings:

- The Expert will outperform the team overall
- Revealing the Expert will reduce—but not eliminate—the gap
- The Moderator will often soften or blend the Expert’s answer
- The accuracy delta will be negative

This confirms that:

- The system can _identify_ expertise
- But fails to reliably _leverage_ it under consensus pressure

---

### Interpretation Guidance

A failed reproduction (team ≥ expert) does **not** invalidate the experiment.
Instead, it should trigger inspection of:

- Aggregation rules
- Prompt strength
- Task ambiguity
- Scoring strictness

ExpertProbe is designed to surface _where_ and _why_ outcomes differ—not to enforce a predetermined result.

---

### Completion Criteria (v0)

This experiment is considered complete when:

- Both conditions run successfully
- Expert and team accuracy are logged
- Accuracy deltas are computed
- Results are reproducible across multiple runs

No visualization, optimization, or automation is required at this stage.

---

### Why This Experiment Matters

This walkthrough establishes:

- The Expert-as-baseline evaluation pattern
- The concept of expertise dilution as a measurable effect
- The foundation for future experiments (team size, aggregation strategies, robustness testing)

All future ExpertProbe experiments build on this structure.
