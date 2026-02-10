# Agent Instructions — ExpertProbe

## Project Overview

ExpertProbe is a lightweight evaluation harness that measures whether multi-agent LLM teams outperform or dilute their strongest individual agent. It is **test infrastructure**, not an agent framework.

## Architecture

```
src/
├── cli.ts                    # Commander entry point
├── schema/
│   ├── task.ts               # Task Zod schema
│   ├── agent.ts              # Agent config schema
│   └── experiment.ts         # Experiment config + condition
├── fixtures/
│   └── tasks.ts              # Hardcoded evaluation tasks
├── config/
│   └── agents.ts             # Default 4-agent personas
├── scoring/
│   └── scorer.ts             # Deterministic answer comparison
├── llm/
│   └── client.ts             # Thin OpenAI wrapper
├── prompts/
│   └── builder.ts            # Prompt construction per condition
├── agent/
│   └── runner.ts             # Single agent execution
├── experiment/
│   └── runner.ts             # Full orchestration loop
├── metrics/
│   └── compute.ts            # Accuracy & delta computation
└── results/
    └── writer.ts             # JSON result output
tests/                        # Mirrors src/ structure, *.test.ts
```

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | ^5.7 | Language |
| Node | >=18 | Runtime |
| Vitest | ^2.1 | Testing |
| Zod | ^3.23 | Schema validation |
| OpenAI SDK | ^4.73 | LLM calls |
| Commander | ^12.1 | CLI framework |
| chalk | ^5.6 | Terminal output |
| dotenv | ^16.4 | Environment config |
| tsx | ^4.19 | Dev runner |

### Conventions (from sibling projects)

- **ESM**: `"type": "module"` in package.json, `.js` extensions in imports
- **Module**: `"module": "NodeNext"` in tsconfig
- **Tests**: Separate `tests/` directory, `*.test.ts` naming, `describe/it/expect` from vitest
- **Schemas**: Zod for all runtime validation, infer types with `z.infer<>`
- **No default exports**: Use named exports everywhere
- **Strict TypeScript**: All strict flags enabled, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`

## Key Domain Concepts

- **Task**: A question with a known correct answer (math, logic, trivia, SAT)
- **Agent**: An LLM persona (Expert, Non-Expert A, Non-Expert B, Moderator)
- **Condition**: `expert-hidden` (symmetric) or `expert-revealed` (expert identified)
- **Experiment**: Run all tasks through agents under a specific condition
- **Expert-as-baseline**: Every team score is compared against the expert's solo performance
- **Accuracy delta**: `team_accuracy - expert_accuracy` (negative = dilution)

## Execution Flow

```
For each task:
  1. Expert solo run → baseline answer
  2. Expert + Non-Expert A + Non-Expert B in parallel → 3 responses
  3. All 3 responses → Moderator → single team answer
  4. Score expert answer and team answer against ground truth
```

## Implementation Log

### Task 1: Project Scaffolding
- **Status**: Not started
- **Notes**: —

### Task 2: Task Schema & Fixtures
- **Status**: Not started
- **Notes**: —

### Task 3: Agent & Experiment Config Schemas
- **Status**: Not started
- **Notes**: —

### Task 4: Answer Scorer
- **Status**: Not started
- **Notes**: —

### Task 5: LLM Client
- **Status**: Not started
- **Notes**: —

### Task 6: Prompt Builder
- **Status**: Not started
- **Notes**: —

### Task 7: Agent Runner
- **Status**: Not started
- **Notes**: —

### Task 8: Experiment Orchestrator
- **Status**: Not started
- **Notes**: —

### Task 9: Metrics & Result Logging
- **Status**: Not started
- **Notes**: —

### Task 10: CLI Entry Point
- **Status**: Not started
- **Notes**: —

## Lessons Learned

_(Updated after each task)_
