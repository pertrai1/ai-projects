# Implementation Tasks

## Phase 1: Foundation

### 1.1 Project Setup
- [x] 1.1.1 Initialize TypeScript project with `tsconfig.json`
- [x] 1.1.2 Install dependencies: commander, zod, dotenv, pino, yaml
- [ ] 1.1.3 Configure ESLint and Prettier
- [x] 1.1.4 Create directory structure (`src/`, `specs/`, `prompts/`, `tests/`)
- [x] 1.1.5 Add `npm run audit` script to package.json

### 1.2 Experiment Specification (experiment-spec)
- [x] 1.2.1 Define Zod schema for experiment spec (`src/spec/schema.ts`)
- [x] 1.2.2 Implement YAML loader with validation (`src/spec/loader.ts`)
- [x] 1.2.3 Create example `specs/experiment.yaml`
- [ ] 1.2.4 Write tests for spec validation (valid and invalid cases)

### 1.3 CLI Core (cli-core)
- [x] 1.3.1 Create CLI entry point with commander (`src/cli/index.ts`)
- [x] 1.3.2 Implement `--spec` flag handling
- [x] 1.3.3 Configure pino for structured logging
- [x] 1.3.4 Implement run summary output
- [x] 1.3.5 Implement exit code handling (0 for success, 1 for failure)
- [ ] 1.3.6 Write CLI integration tests

### 1.4 Synthetic Dataset Generation (synthetic-dataset)
- [x] 1.4.1 Implement factorial expansion algorithm (`src/dataset/factorial.ts`)
- [x] 1.4.2 Create profile data structure and ID generation (`src/dataset/profile.ts`)
- [x] 1.4.3 Implement natural-language profile rendering
- [x] 1.4.4 Add deterministic seeding support
- [x] 1.4.5 Verify profile count matches factorial expectation
- [ ] 1.4.6 Write tests for factorial generation

**Phase 1 Checkpoint**: CLI loads spec, generates profiles, prints summary ✅

---

## Phase 2: Evaluation Pipeline

### 2.1 Run Tracking (run-tracking)
- [x] 2.1.1 Implement run ID generation and directory creation (`src/tracking/run.ts`)
- [x] 2.1.2 Implement artifact writers for JSONL and JSON (`src/tracking/artifacts.ts`)
- [x] 2.1.3 Write `inputs.jsonl` after profile generation
- [x] 2.1.4 Implement `run_metadata.json` with git commit hash extraction
- [ ] 2.1.5 Write tests for artifact persistence

### 2.2 LLM Evaluation (llm-evaluation)
- [x] 2.2.1 Create prompt template loader (`src/evaluation/prompt.ts`)
- [x] 2.2.2 Create initial prompt templates (`prompts/v1.txt`, `prompts/v2.txt`)
- [x] 2.2.3 Implement LLM client abstraction for OpenAI (`src/evaluation/llm.ts`)
- [x] 2.2.4 Define output schema with Zod (`src/evaluation/validator.ts`)
- [x] 2.2.5 Implement output validation and retry logic
- [x] 2.2.6 Write `raw_outputs.jsonl` and `parsed_outputs.jsonl`
- [x] 2.2.7 Track retry counts and failures
- [ ] 2.2.8 Write tests for validation and retry (mocked LLM)

### 2.3 Orchestration
- [x] 2.3.1 Wire spec → profiles → evaluation → artifacts in main orchestrator (`src/index.ts`)
- [x] 2.3.2 Implement progress logging during evaluation
- [x] 2.3.3 Handle k repetitions per profile

**Phase 2 Checkpoint**: Full evaluation run producing all JSONL artifacts ✅

---

## Phase 3: Analysis & Reporting

### 3.1 Metrics Analysis (metrics-analysis)
- [x] 3.1.1 Implement per-profile variance computation (`src/metrics/variance.ts`)
- [x] 3.1.2 Identify high-variance/unstable profiles
- [x] 3.1.3 Implement main effects computation (`src/metrics/effects.ts`)
- [x] 3.1.4 Implement interaction effects (difference-in-differences)
- [x] 3.1.5 Write `metrics.json`
- [ ] 3.1.6 Write tests for statistical computations

### 3.2 Quality Gates (quality-gates)
- [x] 3.2.1 Implement gate evaluator (`src/gates/evaluator.ts`)
- [x] 3.2.2 Check interaction magnitude against threshold
- [x] 3.2.3 Check variance against threshold
- [x] 3.2.4 Generate gate failure messages
- [x] 3.2.5 Wire gate results to CLI exit code
- [ ] 3.2.6 Write tests for gate pass/fail scenarios

### 3.3 Report Generation
- [x] 3.3.1 Implement Markdown report generator (`src/report/generator.ts`)
- [x] 3.3.2 Include: run summary, factor effects, interaction effects, variance summary, unstable profiles, gate results
- [x] 3.3.3 Write `report.md`
- [ ] 3.3.4 Write tests for report content

### 3.4 Prompt Regression (prompt-regression)
- [x] 3.4.1 Implement `--diff` CLI flag for comparing runs
- [x] 3.4.2 Load metrics from two run directories
- [x] 3.4.3 Compute deltas for main and interaction effects
- [x] 3.4.4 Flag regressions based on threshold
- [x] 3.4.5 Generate diff report
- [ ] 3.4.6 Write tests for diff logic

**Phase 3 Checkpoint**: Complete audit with report and quality gates ✅

---

## Phase 4: Polish & Documentation

### 4.1 Documentation
- [x] 4.1.1 Update README with library rationales
- [x] 4.1.2 Document all CLI flags and options
- [x] 4.1.3 Add example output and report snippets

### 4.2 Final Integration
- [ ] 4.2.1 End-to-end test: clean install → single command → full report
- [ ] 4.2.2 Verify all acceptance criteria from README are met
- [ ] 4.2.3 Archive this change proposal

---

## Dependencies

```
Phase 1 ─────► Phase 2 ─────► Phase 3 ─────► Phase 4

1.2 ──► 1.3 ──► 1.4 ──► 2.1 ──► 2.2 ──► 2.3 ──► 3.1 ──► 3.2 ──► 3.3 ──► 3.4
```

Tasks within each sub-section can be parallelized where noted. Cross-phase dependencies are sequential.
