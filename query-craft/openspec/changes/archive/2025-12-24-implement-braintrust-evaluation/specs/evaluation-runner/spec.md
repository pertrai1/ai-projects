# evaluation-runner Δ

## ADDED Requirements

### Requirement: ER-REQ-01

The evaluation runner MUST load test datasets from JSON files: (Dataset Loading)
- Load from `data/evals/sql-test-cases.json`
- Validate JSON schema matches EvalTestCase type
- Support filtering by category (e.g., only "simple-select" tests)
- Support sampling (e.g., first 10 tests for quick runs)
- Provide clear error messages for malformed datasets

Dataset loading MUST fail fast if dataset is invalid.

#### Scenario: Load complete dataset

**Given:** `data/evals/sql-test-cases.json` contains 50 valid test cases

**When:** loadDataset() is called without filters

**Then:**
- All 50 test cases are loaded
- Each test case is validated against schema
- Dataset metadata is extracted (version, created date)
- Test cases are returned as typed array

#### Scenario: Filter by category

**Given:** Dataset contains 20 simple-select, 15 join, 10 aggregation, 5 malicious tests

**When:** loadDataset({ category: "malicious" }) is called

**Then:**
- Only 5 malicious test cases are loaded
- Filtered dataset is returned
- Log message: "Loaded 5 of 50 test cases (category: malicious)"

#### Scenario: Sample dataset for quick testing

**Given:** Dataset contains 50 test cases

**When:** loadDataset({ sample: 10 }) is called

**Then:**
- First 10 test cases are loaded
- Log message: "Loaded 10 of 50 test cases (sampled)"
- Useful for rapid iteration during development

#### Scenario: Handle invalid dataset

**Given:** Dataset JSON is malformed (missing required fields)

**When:** loadDataset() is called

**Then:**
- Validation error is thrown with specific field missing
- Error message: "Invalid test case at index 5: missing 'expectedTables'"
- No test cases are loaded (fail fast)

---

### Requirement: ER-REQ-02

The evaluation runner MUST orchestrate the complete evaluation workflow: (Workflow Orchestration)
1. Load dataset
2. Initialize Braintrust evaluator
3. Create experiment
4. For each test case:
   - Execute SqlGenerationWorkflow
   - Calculate all metrics
   - Log result to Braintrust
   - Update progress display
5. Aggregate results
6. Finalize experiment
7. Generate reports

The workflow MUST handle errors gracefully and continue with remaining test cases.

#### Scenario: Execute complete evaluation run

**Given:**
- Dataset with 50 test cases loaded
- Braintrust API key configured

**When:** EvaluationRunner.run() is called

**Then:**
- Progress bar shows: "Evaluating: 1/50"
- Each test case executes SqlGenerationWorkflow
- All 5 metrics calculated per test case
- Results logged to Braintrust experiment
- Final summary displayed:
  - Total: 50, Passed: 42, Failed: 8
  - Avg correctness: 0.84
  - All thresholds met: YES

#### Scenario: Handle individual test failures

**Given:**
- Test case 10 causes SqlGenerationWorkflow to throw error

**When:** Runner executes test case 10

**Then:**
- Error is caught and logged
- Test case marked as failed with error details
- Evaluation continues with test case 11
- Failed test included in summary report
- Exit code: 1 (failures occurred)

---

### Requirement: ER-REQ-03

The evaluation runner MUST execute SqlGenerationWorkflow for each test case: (Workflow Execution)
- Use existing SqlGenerationWorkflow without modifications
- Pass test case question and database schema
- Capture complete result including query, validation, confidence
- Measure execution time per test case
- Handle timeouts (max 30 seconds per test case)

Workflow execution MUST be isolated (one test case failure doesn't affect others).

#### Scenario: Execute workflow for test case

**Given:**
- Test case: { question: "Show all users", database: "ecommerce" }

**When:** Runner executes workflow for this test case

**Then:**
- SqlGenerationWorkflow.execute() is called with:
  - question: "Show all users"
  - database: "ecommerce"
- Result captured: { query: "SELECT * FROM users;", confidence: "high", ... }
- Execution time recorded: 1.8 seconds
- No modifications to SqlGenerationWorkflow code

#### Scenario: Handle workflow timeout

**Given:**
- Test case execution takes > 30 seconds (LLM hanging)

**When:** Runner waits for workflow result

**Then:**
- Timeout error is thrown after 30 seconds
- Test case marked as failed: "Execution timeout"
- Evaluation continues with next test case
- Timeout logged for investigation

---

### Requirement: ER-REQ-04

The evaluation runner MUST calculate all metrics for each test result: (Metric Calculation)
- Query correctness (using metric-calculators)
- Table accuracy (using metric-calculators)
- Safety validation (using metric-calculators)
- Validation accuracy (using metric-calculators)
- Metrics MUST be calculated in parallel when possible
- Failed metric calculations should not block other metrics

All metrics MUST be included in logged results.

#### Scenario: Calculate all metrics successfully

**Given:**
- Test case executed, result captured
- Expected query, tables, and validation defined

**When:** calculateMetrics() is called

**Then:**
- All 5 metrics calculated:
  - query_correctness: 0.9
  - table_accuracy: 1.0
  - safety_validation: 1.0
  - validation_accuracy: 1.0
  - (confidence_calibration calculated at aggregate level)
- Metrics calculated in parallel (< 3 seconds total)
- All metrics included in result

#### Scenario: Handle metric calculation failure

**Given:**
- Query correctness LLM call fails with API error

**When:** calculateMetrics() is called

**Then:**
- query_correctness: 0.0 (error flag set)
- Other metrics complete successfully
- Error logged: "Query correctness failed: API timeout"
- Evaluation continues (partial metrics better than none)

---

### Requirement: ER-REQ-05

The evaluation runner MUST aggregate results and calculate summary statistics: (Result Aggregation)
- Total test count, passed count, failed count
- Average metrics across all tests
- Per-category breakdowns (simple-select, join, etc.)
- Threshold comparisons (did we meet targets?)
- Confidence calibration (aggregate metric)
- Execution time statistics (total, average, p95)

Aggregation MUST handle partial results (some test cases failed).

#### Scenario: Aggregate complete results

**Given:**
- 50 test cases executed, 42 passed, 8 failed
- Metrics collected for all test cases

**When:** aggregateResults() is called

**Then:** Summary includes:
```json
{
  "totalTests": 50,
  "passedTests": 42,
  "failedTests": 8,
  "averageMetrics": {
    "query_correctness": 0.84,
    "table_accuracy": 0.91,
    "safety_validation": 1.0,
    "validation_accuracy": 0.88
  },
  "byCategory": {
    "simple-select": { passed: 18/20, avg_correctness: 0.92 },
    "join": { passed: 12/15, avg_correctness: 0.78 },
    ...
  },
  "thresholdStatus": {
    "query_correctness": { target: 0.80, actual: 0.84, passed: true },
    "safety_validation": { target: 1.0, actual: 1.0, passed: true },
    "validation_accuracy": { target: 0.90, actual: 0.88, passed: false }
  },
  "confidenceCalibration": 0.87
}
```

#### Scenario: Handle partial results

**Given:**
- 50 test cases, 5 failed to execute (errors)
- 45 completed with metrics

**When:** aggregateResults() is called

**Then:**
- Summary based on 45 completed tests
- Failed tests excluded from average metrics
- Note included: "5 test cases failed to execute"
- Threshold checks still performed

---

### Requirement: ER-REQ-06

The evaluation runner MUST display progress during execution: (Progress Display)
- Show current test case number (e.g., "15/50")
- Show current test case question
- Show running average of key metrics
- Use ora spinner for visual feedback
- Update every test case completion
- Show estimated time remaining

Progress display MUST not interfere with result logging.

#### Scenario: Display progress during run

**Given:** Evaluation of 50 test cases is running

**When:** Test case 15 completes

**Then:** Console shows:
```
⠹ Evaluating: 15/50 (30%)
  Current: "Show top customers by revenue"
  Running avg correctness: 0.85
  Est. time remaining: 2m 30s
```

#### Scenario: Handle progress in CI mode

**Given:** Runner is executed with --ci flag (no TTY)

**When:** Test cases execute

**Then:**
- No spinner shown (not compatible with CI logs)
- Progress logged as text: "[15/50] Show top customers..."
- Every 10th test case logs summary
- Final report logged in structured format (JSON)

---

### Requirement: ER-REQ-07

The evaluation runner MUST generate comprehensive reports: (Report Generation)
- Console report (human-readable summary)
- Braintrust dashboard link
- Optional JSON export for CI/CD integration
- Optional detailed HTML report
- Report MUST include:
  - Overall pass/fail status
  - All metrics with threshold comparisons
  - Failed test cases with reasons
  - Recommendations for improvement

Reports MUST be generated even if some tests fail.

#### Scenario: Generate console report

**Given:** Evaluation completed with summary statistics

**When:** generateReport() is called

**Then:** Console displays:
```
╔════════════════════════════════════════════════╗
║       QueryCraft Evaluation Report              ║
╚════════════════════════════════════════════════╝

Experiment: eval-2025-01-15-baseline
Total Tests: 50  |  Passed: 42  |  Failed: 8

Metrics:
  ✓ Query Correctness:     0.84 / 0.80 (PASS)
  ✓ Table Accuracy:        0.91 / N/A
  ✓ Safety Validation:     1.00 / 1.00 (PASS)
  ✗ Validation Accuracy:   0.88 / 0.90 (FAIL)
  ℹ Confidence Calibration: 0.87 (well-calibrated)

By Category:
  simple-select:  18/20 passed (90%)
  join:           12/15 passed (80%)
  aggregation:     8/10 passed (80%)
  filter:          4/5 passed (80%)
  malicious:       0/0 passed (N/A)

View full results: https://braintrust.dev/app/querycraft/exp/...

Overall: FAILED (1 threshold not met)
```

#### Scenario: Export JSON for CI

**Given:** Runner executed with --json flag

**When:** generateReport({ format: "json" }) is called

**Then:**
- JSON file created: `evals/results/eval-{timestamp}.json`
- File contains all test results and metrics
- CI can parse JSON for automated checks
- Exit code reflects pass/fail status

---

### Requirement: ER-REQ-08

The evaluation runner MUST support command-line configuration: (CLI Configuration)
- `--dataset <path>`: Custom dataset file
- `--category <name>`: Filter by category
- `--sample <n>`: Sample first N test cases
- `--ci`: CI mode (no interactive output)
- `--json`: Export JSON report
- `--local`: Force local logging (skip Braintrust)
- `--verbose`: Detailed logging

Configuration MUST be documented in --help output.

#### Scenario: Run with custom dataset

**Given:** Custom dataset at `data/evals/custom-tests.json`

**When:** `npm run eval -- --dataset data/evals/custom-tests.json` is executed

**Then:**
- Custom dataset is loaded instead of default
- Evaluation runs with custom test cases
- Results logged normally

#### Scenario: Run in CI mode

**Given:** Evaluation executed in CI environment

**When:** `npm run eval -- --ci --json` is executed

**Then:**
- No interactive spinner (CI-compatible output)
- JSON report exported to results directory
- Exit code: 0 (pass) or 1 (fail)
- CI can check exit code for pipeline status

---

### Requirement: ER-REQ-09

The evaluation runner MUST integrate with existing workflows without modification: (Non-Invasive Integration)
- Use SqlGenerationWorkflow as-is (no code changes)
- Use existing agents (SchemaLoader, QueryGenerator, SqlValidator)
- Evaluation is completely separate from CLI execution
- No impact on production code paths

Integration MUST be additive only (no breaking changes).

#### Scenario: Execute workflow without changes

**Given:** SqlGenerationWorkflow.execute() exists

**When:** Runner invokes workflow for test case

**Then:**
- Workflow is called with standard interface
- No workflow code is modified
- Workflow behavior unchanged
- Results are captured and evaluated externally

---

### Requirement: ER-REQ-10

The evaluation runner MUST meet performance targets: (Performance Requirements)
- Dataset loading: < 100ms for 1000 test cases
- Workflow overhead: < 50ms per test case
- Metric calculation overhead: < 100ms per test case (excluding LLM)
- Report generation: < 1 second
- Total runtime: ~4-5 seconds per test case (dominated by LLM calls)

For 50 test cases: target total runtime < 5 minutes.

#### Scenario: Performance benchmark

**Given:** 50 test cases, mocked LLM responses (instant)

**When:** Evaluation runs with mocks

**Then:**
- Total runtime: < 10 seconds (2ms overhead per test)
- Breakdown:
  - Dataset loading: 50ms
  - Workflow overhead: 100ms (50 × 2ms)
  - Metric calculation: 5 seconds (50 × 100ms)
  - Report generation: 500ms
- With real LLM: ~4 minutes (50 × 5 seconds)

---
