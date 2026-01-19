# Learning Guide

This document captures the key concepts and skills that can be learned from building and studying the HireGauge project.

## LLM Concepts

### Structured Output and JSON Mode

**What we implemented:** The system prompts the LLM to return JSON-only responses with a specific schema (`score` and `justification` fields).

**Key learnings:**
- LLMs can be instructed to return structured data formats
- OpenAI's `response_format: { type: 'json_object' }` enforces JSON output
- Even with JSON mode, outputs need validation—models can return valid JSON that doesn't match your schema
- Extracting JSON from responses that may contain extra text (using regex matching)

**Code reference:** `src/evaluation/validator.ts`, `src/evaluation/llm.ts`

---

### Output Validation and Guardrails

**What we implemented:** Zod schema validation for LLM outputs with automatic retry on invalid responses.

**Key learnings:**
- LLM outputs are inherently unreliable and must be validated
- Retry strategies handle transient failures and malformed outputs
- Tracking retry counts reveals model reliability patterns
- Score range validation (0-10) catches out-of-bounds responses
- Guardrails turn unpredictable model behavior into reliable system behavior

**Code reference:** `src/evaluation/validator.ts:validateOutput()`

---

### Prompt Engineering and Versioning

**What we implemented:** Versioned prompt templates (`v1.txt`, `v2.txt`) with system/user separation and placeholder substitution.

**Key learnings:**
- Prompts are code—they should be versioned and tracked
- Separating system and user prompts enables different roles
- Template variables (`{{CANDIDATE}}`) allow dynamic content injection
- Small prompt changes can significantly alter model behavior
- Prompt regression testing detects unintended behavioral changes

**Code reference:** `src/evaluation/prompt.ts`, `prompts/v1.txt`

---

### Temperature and Determinism

**What we implemented:** Temperature=0 configuration for more deterministic outputs, with multiple repetitions to measure remaining variance.

**Key learnings:**
- Temperature controls output randomness (0 = most deterministic)
- Even at temperature=0, outputs aren't perfectly deterministic
- Multiple evaluations (k repetitions) quantify output stability
- High variance profiles indicate unreliable model judgments

**Code reference:** `specs/experiment.yaml` (model.temperature), `src/metrics/variance.ts`

---

## MLOps Concepts

### Experiment Reproducibility

**What we implemented:** YAML specification files that fully define experiments with seeds, factors, thresholds, and model configuration.

**Key learnings:**
- Configuration-as-code enables reproducible experiments
- Random seeds ensure deterministic data generation
- Separating specification from execution allows experiment auditing
- Schema validation catches configuration errors before expensive runs

**Code reference:** `src/spec/schema.ts`, `specs/experiment.yaml`

---

### Run Tracking and Artifact Management

**What we implemented:** Unique run IDs, structured artifact directories, and comprehensive metadata capture.

**Key learnings:**
- Every run should have a unique identifier
- Artifacts should be organized by run for easy comparison
- Metadata captures provenance: model, parameters, timestamps, git commit
- JSONL format enables streaming writes and line-by-line processing
- Separating raw outputs from parsed outputs preserves debugging capability

**Artifact structure:**
```
runs/<run-id>/
├── inputs.jsonl        # What we sent
├── raw_outputs.jsonl   # What we received (verbatim)
├── parsed_outputs.jsonl # What we extracted
├── metrics.json        # What we computed
├── report.md           # What we concluded
└── run_metadata.json   # How we ran it
```

**Code reference:** `src/tracking/run.ts`, `src/tracking/artifacts.ts`

---

### Quality Gates and Automated Policy

**What we implemented:** Threshold-based gates that fail runs when bias or variance metrics exceed acceptable limits.

**Key learnings:**
- Evaluation findings should translate to enforceable policy
- Gates make implicit standards explicit and automated
- Non-zero exit codes integrate with CI/CD pipelines
- Clear failure messages explain why gates failed
- Thresholds should be configurable, not hardcoded

**Code reference:** `src/gates/evaluator.ts`

---

### Regression Testing for ML Systems

**What we implemented:** Diff command comparing metrics across runs to detect prompt or model regressions.

**Key learnings:**
- ML systems need regression testing beyond unit tests
- Behavioral changes may not cause code failures
- Comparing effect sizes across versions reveals drift
- Regression thresholds define "significant" changes
- Prompt changes are a common source of regressions

**Code reference:** `src/report/diff.ts`

---

## Statistical Concepts

### Factorial Experimental Design

**What we implemented:** Full factorial generation of candidate profiles where every factor combination is tested.

**Key learnings:**
- Factorial design enables causal interpretation
- Each factor varies independently (no confounding)
- Total profiles = product of all factor levels
- Cartesian product generates all combinations
- Seeded shuffling ensures reproducible ordering

**Example:** 3 experience × 3 skill × 3 pricing × 2 demographic = 54 profiles

**Code reference:** `src/dataset/factorial.ts`

---

### Main Effects (Difference-in-Means)

**What we implemented:** Computing average score differences across factor levels to identify which signals the model prioritizes.

**Key learnings:**
- Main effects reveal factor importance
- Difference-in-means: `mean(level_A) - mean(level_B)`
- Ranking effects by magnitude shows model priorities
- Large effects indicate strong model sensitivity to that factor

**Code reference:** `src/metrics/effects.ts:computeMainEffects()`

---

### Interaction Effects (Difference-in-Differences)

**What we implemented:** Computing whether the effect of one factor depends on the level of another (e.g., does skill_match affect scores differently for different demographic groups?).

**Key learnings:**
- Interaction effects reveal hidden bias patterns
- A model can have equal average scores but unequal evaluation logic
- Difference-in-differences: `(A_high - A_low) - (B_high - B_low)`
- Non-zero interactions suggest differential treatment
- This is the core insight from the research paper

**Example:** If skill improvement helps Group A more than Group B, that's an interaction effect indicating the model values skills differently across groups.

**Code reference:** `src/metrics/effects.ts:computeInteractionEffects()`

---

### Variance and Stability Analysis

**What we implemented:** Per-profile standard deviation across k repetitions to identify unstable evaluations.

**Key learnings:**
- Variance measures output consistency
- High-variance profiles indicate uncertain model judgments
- Aggregate variance summarizes overall stability
- Unstable profiles may need human review
- Variance thresholds flag unreliable results

**Code reference:** `src/metrics/variance.ts`

---

## Software Engineering Concepts

### CLI Design with Commander

**What we implemented:** Structured CLI with commands, options, and help text.

**Key learnings:**
- `commander` provides declarative CLI definition
- Required vs optional options with validation
- Subcommands organize related functionality
- Help text is auto-generated from definitions
- Exit codes communicate success/failure to shell

**Code reference:** `src/cli/index.ts`

---

### Runtime Validation with Zod

**What we implemented:** Schema definitions for experiment specs, LLM outputs, and configuration.

**Key learnings:**
- TypeScript types don't exist at runtime
- Zod bridges compile-time and runtime type safety
- `.parse()` throws on invalid data with detailed errors
- `.safeParse()` returns success/error without throwing
- Schemas can be composed and reused

**Code reference:** `src/spec/schema.ts`, `src/evaluation/validator.ts`

---

### Structured Logging with Pino

**What we implemented:** JSON-formatted logs with levels, timestamps, and contextual data.

**Key learnings:**
- Structured logs are machine-parseable
- Log levels (info, warn, error) filter verbosity
- Context objects attach relevant data to log entries
- Pino is optimized for Node.js performance
- Logs complement user-facing output

**Code reference:** `src/cli/index.ts` (logger initialization)

---

### TypeScript Module Organization

**What we implemented:** Feature-based directory structure with clear module boundaries.

**Key learnings:**
- Group by feature, not by type
- Each module exports a focused interface
- Type definitions live with their implementations
- Index files re-export public APIs
- ESM imports with `.js` extensions for Node.js

**Structure:**
```
src/
├── spec/       # Configuration handling
├── dataset/    # Data generation
├── evaluation/ # LLM interaction
├── tracking/   # Persistence
├── metrics/    # Analysis
├── gates/      # Policy enforcement
└── report/     # Output generation
```

---

## Research Translation

### From Paper to Code

**What we practiced:** Translating academic methodology into executable software.

**Key learnings:**
- Papers describe *what* to measure; code defines *how*
- Simplify without losing the core insight
- Synthetic data isolates the phenomenon under study
- Executable code makes methodology tangible
- Implementation reveals unstated assumptions

---

### Bias Auditing Framework

**What we built:** A reusable framework for auditing LLM decision-making.

**Key learnings:**
- Bias can hide in interaction effects, not just averages
- Controlled experiments enable causal claims
- Thresholds operationalize fairness criteria
- Reports translate statistics into actionable insights
- Automation enables continuous monitoring

---

## Summary

| Category | Key Takeaway |
|----------|--------------|
| LLM | Outputs need validation, retries, and guardrails |
| MLOps | Track everything: inputs, outputs, configs, metrics |
| Statistics | Interaction effects reveal what averages hide |
| Engineering | Schema validation bridges types and runtime |
| Research | Papers become real when you implement them |

This project demonstrates that building reliable LLM applications requires combining software engineering discipline with statistical rigor and ML-specific practices.
