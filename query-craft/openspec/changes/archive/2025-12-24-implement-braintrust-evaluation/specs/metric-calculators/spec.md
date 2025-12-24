# metric-calculators Δ

## ADDED Requirements

### Requirement: MC-REQ-01

The metric calculators MUST implement query correctness scoring using LLM-as-judge: (Query Correctness Metric)
- Use AutoEvals library with Claude model
- Compare generated SQL with expected SQL semantically
- Return score: 1.0 (semantically correct), 0.5 (partially correct), 0.0 (incorrect)
- Include reasoning for score
- Cache results to avoid duplicate LLM calls for identical queries

The metric MUST handle semantic equivalence (e.g., different JOIN order, equivalent WHERE clauses).

#### Scenario: Score exact match

**Given:**
- Generated SQL: `SELECT * FROM users WHERE id = 1;`
- Expected SQL: `SELECT * FROM users WHERE id = 1;`

**When:** calculateQueryCorrectness() is called

**Then:**
- Score is 1.0 (exact match)
- Reasoning: "Queries are identical"
- No LLM call needed (string comparison shortcut)

#### Scenario: Score semantic equivalence

**Given:**
- Generated SQL: `SELECT u.id, u.name FROM users u WHERE u.active = true;`
- Expected SQL: `SELECT id, name FROM users WHERE active = 1;`

**When:** calculateQueryCorrectness() is called

**Then:**
- LLM judge is invoked
- Score is 1.0 (semantically equivalent, boolean representations differ)
- Reasoning: "Semantically equivalent despite different syntax"

#### Scenario: Score partial correctness

**Given:**
- Generated SQL: `SELECT * FROM users;`
- Expected SQL: `SELECT * FROM users WHERE created_at > '2024-01-01';`

**When:** calculateQueryCorrectness() is called

**Then:**
- LLM judge is invoked
- Score is 0.5 (correct table, missing filter)
- Reasoning: "Correct table and columns, but missing date filter"

#### Scenario: Score incorrect query

**Given:**
- Generated SQL: `SELECT * FROM products;`
- Expected SQL: `SELECT * FROM users;`

**When:** calculateQueryCorrectness() is called

**Then:**
- Score is 0.0 (wrong table)
- Reasoning: "Query accesses wrong table"

---

### Requirement: MC-REQ-02

The metric calculators MUST implement table accuracy scoring: (Table Accuracy Metric)
- Extract all table names from generated SQL (FROM and JOIN clauses)
- Compare with expected table list
- Calculate Jaccard similarity: intersection / union
- Handle table aliases (normalize to base table names)
- Case-insensitive comparison

The metric MUST return a score between 0.0 and 1.0.

#### Scenario: Perfect table match

**Given:**
- Generated SQL: `SELECT * FROM users JOIN orders ON users.id = orders.user_id;`
- Expected tables: ["users", "orders"]

**When:** calculateTableAccuracy() is called

**Then:**
- Extracted tables: ["users", "orders"]
- Intersection: 2, Union: 2
- Score is 1.0 (perfect match)

#### Scenario: Partial table match

**Given:**
- Generated SQL: `SELECT * FROM users;`
- Expected tables: ["users", "orders"]

**When:** calculateTableAccuracy() is called

**Then:**
- Extracted tables: ["users"]
- Intersection: 1, Union: 2
- Score is 0.5 (50% overlap)

#### Scenario: Handle table aliases

**Given:**
- Generated SQL: `SELECT u.name FROM users AS u;`
- Expected tables: ["users"]

**When:** calculateTableAccuracy() is called

**Then:**
- Extracted tables: ["users"] (alias normalized)
- Score is 1.0 (correct table identified)

#### Scenario: Case insensitive comparison

**Given:**
- Generated SQL: `SELECT * FROM USERS;`
- Expected tables: ["users"]

**When:** calculateTableAccuracy() is called

**Then:**
- Tables normalized to lowercase
- Score is 1.0 (case differences ignored)

---

### Requirement: MC-REQ-03

The metric calculators MUST implement safety validation scoring: (Safety Validation Metric)
- Compare validator's safetyValid flag with expected shouldPass flag
- Return 1.0 if classification is correct, 0.0 if incorrect
- Track false positives (marked unsafe but should pass) separately
- Track false negatives (marked safe but should fail) separately

The metric MUST catch all safety violations (100% recall required for unsafe queries).

#### Scenario: Correctly identify safe query

**Given:**
- Validator result: safetyValid = true
- Expected: shouldPass = true

**When:** calculateSafetyValidation() is called

**Then:**
- Score is 1.0 (correct classification)
- Classification: "true negative" (correctly allowed safe query)

#### Scenario: Correctly identify unsafe query

**Given:**
- Validator result: safetyValid = false
- Expected: shouldPass = false (malicious SQL injection attempt)

**When:** calculateSafetyValidation() is called

**Then:**
- Score is 1.0 (correct classification)
- Classification: "true positive" (correctly blocked unsafe query)

#### Scenario: False positive - safe query marked unsafe

**Given:**
- Validator result: safetyValid = false
- Expected: shouldPass = true

**When:** calculateSafetyValidation() is called

**Then:**
- Score is 0.0 (incorrect classification)
- Classification: "false positive"
- Warning logged: "Safe query incorrectly blocked"

#### Scenario: False negative - unsafe query marked safe

**Given:**
- Validator result: safetyValid = true
- Expected: shouldPass = false (dangerous DROP TABLE)

**When:** calculateSafetyValidation() is called

**Then:**
- Score is 0.0 (incorrect classification)
- Classification: "false negative" (CRITICAL ERROR)
- Error logged: "CRITICAL: Unsafe query not caught by validator"

---

### Requirement: MC-REQ-04

The metric calculators MUST implement validation accuracy scoring: (Validation Accuracy Metric)
- Compare validator's isValid flag with expected shouldPass flag
- Return 1.0 if correct, 0.0 if incorrect
- Distinguish between syntax errors, schema errors, and safety errors
- Provide detailed error categorization

The metric MUST identify why validation passed or failed.

#### Scenario: Valid query correctly validated

**Given:**
- Validator result: isValid = true
- Expected: shouldPass = true

**When:** calculateValidationAccuracy() is called

**Then:**
- Score is 1.0
- Validation type: "correct acceptance"

#### Scenario: Invalid query correctly rejected

**Given:**
- Validator result: isValid = false, errors = ["Table 'nonexistent' does not exist"]
- Expected: shouldPass = false

**When:** calculateValidationAccuracy() is called

**Then:**
- Score is 1.0
- Validation type: "correct rejection"
- Error category: "schema violation"

#### Scenario: Valid query incorrectly rejected

**Given:**
- Validator result: isValid = false
- Expected: shouldPass = true

**When:** calculateValidationAccuracy() is called

**Then:**
- Score is 0.0
- Validation type: "false rejection"
- Investigation needed: Why was valid query rejected?

---

### Requirement: MC-REQ-05

The metric calculators MUST implement confidence calibration scoring: (Confidence Calibration Metric)
- Group test results by confidence level (high/medium/low)
- Calculate average correctness per confidence group
- Compute calibration score: how well confidence predicts correctness
- Return score between 0.0 (poor calibration) and 1.0 (perfect calibration)

Calibration MUST be calculated across the entire test suite (aggregate metric).

#### Scenario: Well-calibrated confidence

**Given:**
- High confidence queries: 20 total, 19 correct (95% accuracy)
- Medium confidence queries: 15 total, 12 correct (80% accuracy)
- Low confidence queries: 10 total, 4 correct (40% accuracy)

**When:** calculateConfidenceCalibration() is called

**Then:**
- Calibration score: 0.92 (well-calibrated)
- Interpretation: "Confidence levels accurately predict correctness"
- High confidence reliably indicates correct queries

#### Scenario: Poor calibration - overconfident

**Given:**
- High confidence queries: 20 total, 10 correct (50% accuracy)
- Medium confidence queries: 15 total, 8 correct (53% accuracy)
- Low confidence queries: 10 total, 5 correct (50% accuracy)

**When:** calculateConfidenceCalibration() is called

**Then:**
- Calibration score: 0.15 (poorly calibrated)
- Interpretation: "Confidence does not predict correctness"
- Warning: "Model is overconfident - high confidence not reliable"

#### Scenario: Insufficient data for calibration

**Given:** Only 5 test cases total (too few for reliable calibration)

**When:** calculateConfidenceCalibration() is called

**Then:**
- Calibration score: null or 0.0
- Warning: "Insufficient data for calibration (need ≥ 20 cases)"

---

### Requirement: MC-REQ-06

The metric calculators MUST cache LLM-based metric results: (Result Caching)
- Cache query correctness scores by hash of (generated, expected) pair
- Cache TTL: 24 hours or until eval run completes
- Cache storage: in-memory during eval run
- Optional: Persist cache to disk for cross-run reuse

Caching MUST reduce redundant LLM calls by at least 50% on repeated eval runs.

#### Scenario: Cache hit on repeated query

**Given:**
- First eval: calculateQueryCorrectness() called for query A, result cached
- Second eval: same query A appears again

**When:** calculateQueryCorrectness() is called for query A

**Then:**
- Cache hit detected
- Cached score returned immediately
- No LLM call made
- Response time < 10ms

#### Scenario: Cache miss on new query

**Given:** Query B has never been evaluated before

**When:** calculateQueryCorrectness() is called for query B

**Then:**
- Cache miss detected
- LLM judge is invoked
- Result is cached for future use
- Response time ~2 seconds (LLM call)

---

### Requirement: MC-REQ-07

The metric calculators MUST provide detailed error reporting for debugging: (Error Reporting)
- When metric calculation fails, include:
  - Which metric failed
  - Input data (generated SQL, expected SQL, etc.)
  - Error message and stack trace
  - Timestamp
- Errors MUST NOT block other metrics from being calculated
- Failed metrics should return score of 0.0 with error flag

#### Scenario: Handle SQL parsing error

**Given:**
- Generated SQL is malformed and cannot be parsed
- calculateTableAccuracy() attempts to extract tables

**When:** SQL parsing fails

**Then:**
- Error is caught and logged
- Metric returns 0.0 with error flag
- Error details include: SQL text, parse error message
- Other metrics continue to execute

#### Scenario: Handle LLM judge timeout

**Given:**
- LLM judge takes > 30 seconds (timeout threshold)

**When:** calculateQueryCorrectness() waits for response

**Then:**
- Timeout error is caught
- Metric returns 0.0 with error flag: "LLM judge timeout"
- Evaluation continues with next test case
- Timeout is logged for investigation

---

### Requirement: MC-REQ-08

The metric calculators MUST meet performance targets: (Performance Requirements)
- Table accuracy: < 50ms per calculation (deterministic parsing)
- Safety validation: < 5ms per calculation (boolean comparison)
- Validation accuracy: < 5ms per calculation (boolean comparison)
- Query correctness: < 3 seconds per calculation (LLM call)
- Confidence calibration: < 100ms for full dataset (aggregate calculation)

All metrics MUST be calculated in parallel when possible.

#### Scenario: Parallel metric calculation

**Given:** All metrics need to be calculated for a single test case

**When:** Metrics are calculated in parallel

**Then:**
- Table accuracy, safety, and validation run concurrently (< 50ms total)
- Query correctness runs in parallel (< 3 seconds)
- Total time for all metrics: ~3 seconds (dominated by LLM call)
- Not 3 + 0.05 = 3.05 seconds (would be sequential)

---
