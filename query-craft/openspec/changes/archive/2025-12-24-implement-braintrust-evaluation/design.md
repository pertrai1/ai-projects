# Design Document: Braintrust Evaluation Framework

## Architecture Overview

The evaluation framework follows a layered architecture:

```
┌─────────────────────────────────────────────────────┐
│           Evaluation Runner (Workflow)              │
│  - Orchestrates evaluation runs                     │
│  - Manages Braintrust experiments                   │
│  - Coordinates agents and calculators               │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌───────────────────┐          ┌───────────────────┐
│ Braintrust        │          │ Metric            │
│ Evaluator         │          │ Calculators       │
│ (Agent)           │          │ (Tools)           │
│                   │          │                   │
│ - Init client     │          │ - Query correct.  │
│ - Log experiments │          │ - Table accuracy  │
│ - Track metrics   │          │ - Safety valid.   │
└───────────────────┘          │ - Validation acc. │
                               │ - Confidence cal. │
                               └───────────────────┘
                                        ↓
                    ┌───────────────────────────────┐
                    │   Existing Workflows          │
                    │   - SqlGenerationWorkflow     │
                    │   (No modifications)          │
                    └───────────────────────────────┘
```

## Component Design

### 1. Braintrust Evaluator (Agent)

**Type:** Deterministic Agent (no LLM calls)

**Responsibilities:**
- Initialize Braintrust client with API key
- Create and manage experiments
- Log individual test results
- Track metrics across runs
- Handle authentication and errors

**Key Methods:**
```typescript
class BraintrustEvaluator {
  constructor(config: BraintrustConfig)

  initExperiment(name: string, metadata: Record<string, any>): string

  logResult(experimentId: string, testCase: EvalTestCase,
            result: SqlGenerationOutput, metrics: MetricResults): void

  finalizeExperiment(experimentId: string): EvaluationSummary
}
```

**Configuration:**
- BRAINTRUST_API_KEY (from environment)
- Project name: "querycraft-sql-generation"
- Experiment naming: timestamp-based or custom

**Error Handling:**
- Graceful degradation if Braintrust unavailable (log locally)
- Retry logic for network failures
- Clear error messages for missing API key

### 2. Metric Calculators (Tools)

**Type:** Utility Functions

**Design Pattern:** Pure functions for easy testing

#### Query Correctness (LLM-as-Judge)

```typescript
async function calculateQueryCorrectness(
  generated: string,
  expected: string,
  schema: DatabaseSchema
): Promise<number>
```

**Implementation:**
- Use AutoEvals `Levenshtein` or `LLMClassifierFromSpec`
- Claude as judge model (same as generation)
- Prompt template:
  ```
  Given schema: {schema}
  Expected SQL: {expected}
  Generated SQL: {generated}

  Score semantic correctness: 1.0 (exact), 0.5 (partial), 0.0 (wrong)
  ```
- Cache results to avoid repeated LLM calls

**Trade-offs:**
- Pros: Handles semantic equivalence (e.g., JOIN order)
- Cons: Slow, costs API credits
- Mitigation: Use for final eval only, not during development

#### Table Accuracy

```typescript
function calculateTableAccuracy(
  generated: string,
  expectedTables: string[]
): Promise<number>
```

**Implementation:**
- Parse SQL with simple regex for FROM/JOIN clauses
- Extract table names
- Compare sets: intersection / union
- Return Jaccard similarity

**Edge Cases:**
- Subqueries (extract tables recursively)
- Table aliases (normalize)
- Case sensitivity (normalize to lowercase)

#### Safety Validation

```typescript
function calculateSafetyValidation(
  validationResult: SqlValidatorOutput,
  shouldPass: boolean
): number
```

**Implementation:**
- Binary classification: does `safetyValid` match `shouldPass`?
- Return 1.0 if match, 0.0 if mismatch
- Log false positives/negatives for analysis

#### Validation Accuracy

```typescript
function calculateValidationAccuracy(
  validationResult: SqlValidatorOutput,
  shouldPass: boolean
): number
```

**Implementation:**
- Check if `isValid` matches `shouldPass`
- Return 1.0 if match, 0.0 if mismatch

#### Confidence Calibration

```typescript
function calculateConfidenceCalibration(
  results: EvalResult[]
): number
```

**Implementation:**
- Group results by confidence level (high/medium/low)
- Calculate average correctness per group
- Compute correlation coefficient
- Return calibration score (0.0 to 1.0)
- Requires aggregate analysis across all test cases

### 3. Evaluation Runner (Workflow)

**Type:** Orchestration Workflow

**Execution Flow:**

```
1. Load Configuration
   - Read BRAINTRUST_API_KEY
   - Load test dataset
   - Set database schema

2. Initialize Braintrust
   - Create experiment
   - Set metadata (timestamp, git commit, etc.)

3. For Each Test Case
   a. Execute SqlGenerationWorkflow
   b. Capture result
   c. Calculate all metrics
   d. Log to Braintrust
   e. Update progress

4. Aggregate Results
   - Calculate summary statistics
   - Group by category
   - Compare to thresholds

5. Generate Reports
   - Console output
   - Braintrust dashboard
   - Optional: JSON export

6. Finalize
   - Close experiment
   - Return exit code (0 if pass, 1 if fail)
```

**Parallelization:**
- Run test cases sequentially (for now)
- Future: Parallel execution with rate limiting

**Error Recovery:**
- Continue on individual test failures
- Log errors with test case context
- Include failed tests in summary

## Data Flow

### Input: Test Dataset

```json
{
  "testCases": [
    {
      "id": "simple-select-001",
      "question": "Show all users",
      "expectedQuery": "SELECT * FROM users;",
      "expectedTables": ["users"],
      "shouldPass": true,
      "category": "simple-select"
    }
  ]
}
```

### Intermediate: Evaluation Result

```typescript
interface EvaluationRecord {
  testCase: EvalTestCase;
  generated: SqlGenerationOutput;
  metrics: {
    query_correctness: number;
    table_accuracy: number;
    safety_validation: number;
    validation_accuracy: number;
  };
  passed: boolean;
  duration: number;
  timestamp: Date;
}
```

### Output: Summary Report

```typescript
interface EvaluationSummary {
  experimentId: string;
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageMetrics: {
    query_correctness: number;
    table_accuracy: number;
    safety_validation: number;
    validation_accuracy: number;
  };
  byCategory: Record<string, CategorySummary>;
  thresholdStatus: {
    query_correctness: { threshold: 0.8, actual: number, passed: boolean };
    safety_validation: { threshold: 1.0, actual: number, passed: boolean };
    validation_accuracy: { threshold: 0.9, actual: number, passed: boolean };
  };
}
```

## Integration Points

### With Existing Code

**No modifications required to:**
- SqlGenerationWorkflow
- QueryGenerator agent
- SqlValidator agent
- SchemaLoader agent

**New dependencies:**
- Test dataset (data/evals/sql-test-cases.json)
- Braintrust API key (environment variable)

### With Braintrust

**Braintrust SDK Usage:**
```typescript
import { init, log, experiment } from "braintrust";

// Initialize project
const project = init("querycraft-sql-generation");

// Create experiment
const exp = experiment("eval-run-{timestamp}");

// Log result
exp.log({
  input: { question: "..." },
  output: { query: "..." },
  scores: { correctness: 0.9, ... },
  metadata: { category: "simple-select" }
});

// Finalize
await exp.flush();
```

**Dashboard Features:**
- View metrics over time
- Compare experiments
- Drill down into individual test cases
- Export results

## Performance Considerations

### Execution Time

**Estimated time per test case:**
- SQL generation: ~2 seconds (LLM call)
- Validation: ~100ms (deterministic)
- Metric calculation:
  - Table accuracy: ~10ms (parsing)
  - Safety/validation: ~1ms (boolean check)
  - Query correctness: ~2 seconds (LLM judge)
  - Total per case: ~4-5 seconds

**For 50 test cases:**
- Sequential: ~4-5 minutes
- With caching: ~2-3 minutes

**Optimization strategies:**
- Cache LLM responses (same question → same SQL)
- Parallel execution (5 concurrent = 1 minute)
- Skip LLM judge for exact matches (fallback to string comparison)

### API Costs

**Claude API usage:**
- Generation: 50 test cases × ~500 tokens = 25K tokens
- LLM judge: 50 test cases × ~800 tokens = 40K tokens
- Total: ~65K tokens per eval run
- Cost: ~$0.50 per run (Claude Sonnet 4)

**Mitigation:**
- Use Haiku for LLM judge (10x cheaper)
- Cache responses across runs
- Sample subset for quick iterations

### Memory Usage

**Dataset size:**
- 50 test cases × ~500 bytes = ~25 KB (negligible)

**Results storage:**
- In-memory during execution: ~500 KB
- Braintrust logs: handled by SDK (streamed)

**No memory concerns** - entire eval fits easily in memory

## Testing Strategy

### Unit Tests

Test each component in isolation:

```typescript
describe('calculateTableAccuracy', () => {
  it('returns 1.0 for exact match', () => {
    const sql = 'SELECT * FROM users JOIN orders ON users.id = orders.user_id';
    const expected = ['users', 'orders'];
    expect(calculateTableAccuracy(sql, expected)).toBe(1.0);
  });

  it('returns 0.5 for partial match', () => {
    const sql = 'SELECT * FROM users';
    const expected = ['users', 'orders'];
    expect(calculateTableAccuracy(sql, expected)).toBe(0.5);
  });
});
```

### Integration Tests

Test end-to-end flow with mock Braintrust:

```typescript
describe('EvaluationRunner', () => {
  it('executes full eval run', async () => {
    const mockDataset = [/* small test set */];
    const runner = new EvaluationRunner(mockBraintrust, mockWorkflow);
    const summary = await runner.run(mockDataset);

    expect(summary.totalTests).toBe(mockDataset.length);
    expect(summary.averageMetrics.query_correctness).toBeGreaterThan(0);
  });
});
```

### Manual Testing

1. Run eval on small dataset (10 cases)
2. Verify Braintrust dashboard shows results
3. Check console output is readable
4. Confirm thresholds are checked correctly

## Future Enhancements

**Phase 2 (not in this change):**
- Real-time query execution evaluation
- Result correctness metrics (compare actual data)
- Performance benchmarking (query execution time)

**Phase 3 (not in this change):**
- Multi-model comparison (Claude vs GPT-4 vs local models)
- Automated prompt optimization based on metrics
- A/B testing framework for prompting strategies

**Phase 4 (not in this change):**
- CI/CD integration (GitHub Actions)
- Regression detection (alert on metric drops)
- Historical trend analysis

## Security Considerations

**API Key Management:**
- Store BRAINTRUST_API_KEY in .env (not committed)
- Document in .env.example
- Validate presence before running evals
- Graceful error if missing (don't crash)

**Data Privacy:**
- Test datasets are synthetic (no real user data)
- Evaluation results logged to Braintrust (external service)
- No sensitive data in test cases or queries

**SQL Safety:**
- All generated SQL goes through existing validation
- Malicious test cases are marked as shouldPass=false
- No actual execution during eval (validation only)

## Open Questions

1. **Should we run evals in CI/CD?**
   - Decision: Not in this change, but design for it
   - Add --ci flag for automated runs

2. **How to handle flaky LLM responses?**
   - Decision: Retry on validation errors, log retries
   - Set max retries = 3

3. **Should query correctness use Haiku or Sonnet for judging?**
   - Decision: Use Haiku by default (cheaper, faster)
   - Add --judge-model flag for flexibility

4. **How to version test datasets?**
   - Decision: Single JSON file for now
   - Add version field to dataset schema
   - Future: Multiple dataset files by version
