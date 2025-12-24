# Change Proposal: Implement Braintrust Evaluation Framework

## Why

**Problem:**

QueryCraft currently has:
- Evaluation metrics defined in `specs/evals/sql-generation.eval.yaml`
- Braintrust and autoevals dependencies installed in package.json
- Basic eval types in src/types/index.ts
- A roadmap item: "Implement evaluation framework fully - Braintrust integration"

However, the evaluation framework is not implemented:
- No `evals/` directory with runner scripts
- No `data/evals/` directory with test datasets
- No Braintrust client initialization
- No metric calculators (query correctness, table accuracy, safety validation)
- No evaluation workflow integration
- No reporting or visualization

This prevents:
1. **Automated quality measurement** - Cannot track query generation accuracy over time
2. **Regression detection** - Cannot detect when changes degrade performance
3. **Confidence in changes** - Cannot validate that improvements actually improve metrics
4. **Research validation** - Cannot verify that Chang & Fosler-Lussier prompting principles work
5. **Safety assurance** - Cannot guarantee that all unsafe queries are caught

## What Changes

Implement a complete Braintrust-based evaluation framework that:

1. **Braintrust Integration**
   - Initialize Braintrust client with project configuration
   - Create experiments and log evaluation runs
   - Track metrics across runs
   - Support local and CI/CD evaluation modes

2. **Metric Calculators**
   - Query correctness (LLM-as-judge using Claude)
   - Table accuracy (exact match)
   - Safety validation (binary classification)
   - Validation accuracy (binary classification)
   - Confidence calibration (custom metric)

3. **Evaluation Runner**
   - Load test cases from data/evals/sql-test-cases.json
   - Execute SQL generation workflow for each test case
   - Calculate all metrics for each result
   - Log results to Braintrust
   - Generate summary report

4. **Test Datasets**
   - Create comprehensive test cases covering:
     - Simple SELECT queries
     - JOIN queries
     - Aggregation queries
     - Filter queries
     - Malicious/unsafe queries
     - Edge cases
   - Include expected queries and validation targets

5. **Reporting**
   - Console output with progress tracking
   - Summary statistics (pass rate, avg scores)
   - Per-category breakdowns
   - Threshold checking against targets
   - Braintrust dashboard integration

## Capabilities Affected

### New Capabilities
1. **braintrust-evaluator** - Agent for initializing and managing Braintrust experiments
2. **metric-calculators** - Tool for calculating evaluation metrics
3. **evaluation-runner** - Workflow for executing evaluation runs

### Existing Capabilities (No Changes)
- dialog-manager (no changes)
- interactive-refinement-workflow (no changes)

## Success Criteria

1. Running `npm run eval` executes full evaluation suite
2. All metrics are calculated and logged to Braintrust
3. Console output shows clear progress and results
4. Test cases achieve defined thresholds:
   - Query correctness: ≥ 80%
   - Safety validation: 100%
   - Validation accuracy: ≥ 90%
5. Evaluation results are viewable in Braintrust dashboard

## Non-Goals

- Real-time query execution evaluation (Phase 2)
- Multi-database evaluation (Phase 2)
- Automated prompt optimization (Phase 3)
- Integration with existing test suites (separate change)

## Dependencies

- Braintrust SDK (already installed: ^0.0.130)
- AutoEvals (already installed: ^0.0.70)
- Existing agents: SchemaLoader, QueryGenerator, SqlValidator
- Existing workflows: SqlGenerationWorkflow

## Risk Assessment

**Low Risk**
- Additive only - no changes to existing production code
- Evaluation runs independently from main CLI
- Uses existing workflows without modification
- Braintrust SDK is mature and stable

**Potential Issues**
- LLM-as-judge for query correctness may be slow (acceptable for evals)
- API costs for running full eval suite (mitigate with caching)
- Test dataset quality affects metric reliability (start small, iterate)
