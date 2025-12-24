# braintrust-evaluator Δ

## ADDED Requirements

### Requirement: BT-REQ-01

The Braintrust Evaluator MUST initialize a Braintrust client with project configuration including: (Braintrust Client Initialization)
- API key from BRAINTRUST_API_KEY environment variable
- Project name: "querycraft-sql-generation"
- Graceful degradation if API key is missing (log locally instead)
- Retry logic for network failures (max 3 retries with exponential backoff)

Initialization MUST validate API key format and connectivity before proceeding.

#### Scenario: Initialize with valid API key

**Given:** BRAINTRUST_API_KEY is set in environment

**When:** BraintrustEvaluator is constructed

**Then:**
- Braintrust client is initialized successfully
- Project "querycraft-sql-generation" is connected
- No errors are thrown
- Evaluator is ready to create experiments

#### Scenario: Handle missing API key gracefully

**Given:** BRAINTRUST_API_KEY is not set in environment

**When:** BraintrustEvaluator is constructed

**Then:**
- Warning is logged about missing API key
- Evaluator switches to local logging mode
- No error is thrown
- Evaluation can still proceed (without Braintrust dashboard)

---

### Requirement: BT-REQ-02

The Braintrust Evaluator MUST create experiments with metadata including: (Experiment Creation)
- Unique experiment ID (timestamp-based or custom)
- Experiment name (descriptive, user-provided or auto-generated)
- Metadata: timestamp, git commit hash (if available), dataset version, model version
- Baseline experiment flag (optional)

Experiments MUST be created before logging any results.

#### Scenario: Create experiment with metadata

**Given:** Braintrust client is initialized

**When:** createExperiment() is called with name "eval-2025-01-15-baseline"

**Then:**
- Experiment is created in Braintrust
- Experiment ID is returned
- Metadata includes: timestamp, dataset version
- Git commit hash is included if .git directory exists
- Experiment appears in Braintrust dashboard

---

### Requirement: BT-REQ-03

The Braintrust Evaluator MUST log individual test results with complete context: (Result Logging)
- Test case input (question, expected query, category)
- Generated output (query, explanation, confidence)
- All metric scores (query_correctness, table_accuracy, safety_validation, validation_accuracy)
- Execution metadata (duration, timestamp, any errors)
- Test case ID for traceability

Results MUST be logged atomically (each test case independently) to prevent data loss on failures.

#### Scenario: Log successful test result

**Given:**
- Experiment "eval-001" is created
- Test case executed successfully with metrics calculated

**When:** logResult() is called with test case and metrics

**Then:**
- Result is logged to Braintrust experiment "eval-001"
- Log entry includes: input, output, scores, metadata
- Log appears in Braintrust dashboard under experiment
- No errors are thrown

#### Scenario: Log failed test result

**Given:**
- Experiment "eval-001" is created
- Test case execution failed with error

**When:** logResult() is called with test case and error details

**Then:**
- Result is logged with error flag
- Error message and stack trace are included
- Metrics are set to 0.0 or null
- Log appears in Braintrust with error indicator

---

### Requirement: BT-REQ-04

The Braintrust Evaluator MUST finalize experiments and calculate summary statistics: (Experiment Finalization)
- Average metrics across all test cases
- Pass/fail counts
- Per-category breakdowns
- Threshold comparisons
- Experiment duration

Finalization MUST flush all pending logs and close the experiment.

#### Scenario: Finalize experiment with results

**Given:**
- Experiment "eval-001" has 50 logged results

**When:** finalizeExperiment() is called

**Then:**
- All pending logs are flushed to Braintrust
- Summary statistics are calculated:
  - totalTests: 50
  - passedTests: 42
  - failedTests: 8
  - averageMetrics: { query_correctness: 0.85, ... }
- Experiment is marked as complete in Braintrust
- Summary is returned to caller

---

### Requirement: BT-REQ-05

The Braintrust Evaluator MUST handle errors gracefully without blocking evaluation: (Error Handling)
- Network failures → retry with backoff, fallback to local logging
- Invalid API key → switch to local mode, warn user
- Braintrust service errors → log locally, continue evaluation
- Timeout errors → abort individual log, continue with next

Error handling MUST preserve evaluation results even when Braintrust is unavailable.

#### Scenario: Handle network failure during logging

**Given:**
- Experiment is created
- Network connection is lost during logResult()

**When:** logResult() attempts to log to Braintrust

**Then:**
- Network error is caught
- Retry logic attempts 3 times with exponential backoff
- If all retries fail, result is logged locally to file
- Warning is displayed to user
- Evaluation continues with next test case

#### Scenario: Recover from transient Braintrust errors

**Given:**
- Braintrust API returns 500 error on first attempt

**When:** logResult() is called

**Then:**
- First attempt fails with 500 error
- Retry logic waits 1 second, retries
- Second attempt succeeds
- Result is logged successfully
- No user warning is shown (transient error recovered)

---

### Requirement: BT-REQ-06

The Braintrust Evaluator MUST support both cloud and local logging modes: (Dual Logging Mode)
- **Cloud mode** (default): Log to Braintrust cloud service
- **Local mode** (fallback): Log to local JSON file in `evals/results/`
- Mode switching based on API key availability and connectivity
- Local logs MUST be compatible with Braintrust import format

Users can explicitly enable local mode with `--local` flag.

#### Scenario: Cloud mode with valid API key

**Given:** BRAINTRUST_API_KEY is set and valid

**When:** Evaluator is initialized without --local flag

**Then:**
- Cloud mode is enabled
- Results are logged to Braintrust service
- No local files are created
- Dashboard link is provided to user

#### Scenario: Local mode fallback

**Given:** BRAINTRUST_API_KEY is not set

**When:** Evaluator is initialized

**Then:**
- Local mode is enabled automatically
- Results are logged to `evals/results/eval-{timestamp}.json`
- Warning shown: "Braintrust unavailable, logging locally"
- User can upload results manually later

---

### Requirement: BT-REQ-07

The Braintrust Evaluator MUST provide experiment comparison capabilities: (Experiment Comparison)
- List previous experiments
- Compare metrics between experiments
- Identify regressions (metrics that decreased)
- Highlight improvements (metrics that increased)

Comparison MUST work across experiments with same dataset version.

#### Scenario: Compare two experiments

**Given:**
- Experiment "baseline" completed with avg correctness: 0.80
- Experiment "improved-prompt" completed with avg correctness: 0.85

**When:** compareExperiments("baseline", "improved-prompt") is called

**Then:**
- Comparison shows:
  - query_correctness: +0.05 (improvement)
  - table_accuracy: +0.02 (improvement)
  - safety_validation: 0.00 (no change, still 1.0)
- Result summary indicates "Improvement detected"
- Detailed breakdown by category included

---

### Requirement: BT-REQ-08

The Braintrust Evaluator MUST meet performance targets: (Performance Requirements)
- Initialization: < 500ms (cloud mode), < 50ms (local mode)
- Log single result: < 100ms (cloud mode), < 10ms (local mode)
- Finalize experiment: < 2 seconds (cloud mode), < 100ms (local mode)
- Batch logging: Support logging 100+ results efficiently

Performance MUST not block test execution.

#### Scenario: Performance under load

**Given:** 100 test results ready to log

**When:** Results are logged sequentially

**Then:**
- Each log operation completes in < 100ms (p95)
- Total logging time < 15 seconds for 100 results
- No memory leaks occur
- CPU usage remains reasonable (< 50%)

---
