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
- **Status**: Complete
- **Notes**: ESM with `"type": "module"`, NodeNext module, vitest needs `passWithNoTests: true` to exit 0 with no test files

### Task 2: Task Schema & Fixtures
- **Status**: Complete (8 tests)
- **Notes**: Zod enum for task types. Fixtures use `as const` for readonly inference. Always validate fixtures against their own schema in tests.

### Task 3: Agent & Experiment Config Schemas
- **Status**: Complete (17 tests)
- **Notes**: ExperimentConfig uses `.default()` for model and temperature. Agent roles are a closed enum — extend later if needed.

### Task 4: Answer Scorer
- **Status**: Complete (17 tests)
- **Notes**: Normalization: trim, lowercase, strip leading articles, strip trailing punctuation, collapse spaces. Does NOT do word-to-number conversion ("three" !== "3") — keep simple for v0.

### Task 5: LLM Client
- **Status**: Complete (6 tests)
- **Notes**: Interface-based design (`LLMClient`) makes mocking trivial. `response_format: { type: 'json_object' }` forces JSON output from OpenAI. Retry loop with configurable maxRetries.

### Task 6: Prompt Builder
- **Status**: Complete (11 tests)
- **Notes**: Condition logic: `expert-revealed` appends identity markers to expert's systemPrompt and deference notes to non-experts. Moderator gets all agent responses formatted in userPrompt.

### Task 7: Agent Runner
- **Status**: Complete (6 tests)
- **Notes**: `runAgent` and `runModerator` are separate functions — moderator needs different prompt construction (receives other agent responses). Both return `AgentResult` with preserved raw response.

### Task 8: Experiment Orchestrator
- **Status**: Complete (6 tests)
- **Notes**: Expert runs solo first (baseline), then all 3 contributors run in parallel via `Promise.all`, then moderator synthesizes. When mocking for tests, distinguish moderator calls by checking `user.includes('Team responses')` in the user prompt, not by system prompt content.

### Task 9: Metrics & Result Logging
- **Status**: Complete (7 tests)
- **Notes**: `computeMetrics` takes a `ReadonlyMap<taskId, correctAnswer>` for ground truth lookup. Delta = team - expert (negative = dilution). Writer creates timestamped directories under output dir.

### Task 10: CLI Entry Point
- **Status**: Complete (5 tests)
- **Notes**: Commander CLI with `run` command. Runs both conditions by default, or single condition with `--condition`. Results written to `results/` dir. Chalk for colored terminal output.

## Lessons Learned

1. **ESM imports require `.js` extensions** — even for `.ts` source files when using NodeNext module resolution
2. **`exactOptionalPropertyTypes`** means you can't assign `undefined` to optional properties without explicit `| undefined` in the type
3. **Mock LLM clients via interface** — `LLMClient` interface makes the entire test suite fast and deterministic with zero API calls
4. **Distinguish moderator from agent calls in mocks** by checking for "Team responses" in user prompt, not agent role in system prompt (system prompts may overlap)
5. **Vitest `passWithNoTests: true`** is needed in vitest.config.ts for clean CI when test files don't exist yet
6. **`as const` on fixture arrays** provides better type narrowing while still satisfying `readonly Task[]`
7. **Zod `.default()` values** are applied only when the field is `undefined`, not when explicitly set — good for optional config with sensible defaults
