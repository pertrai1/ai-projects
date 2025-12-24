# Implementation Tasks

## Phase 1: Foundation (Data & Types)

1. **Create test dataset**
   - Create `data/evals/` directory
   - Create `data/evals/sql-test-cases.json` with 20+ test cases
   - Include cases for all categories: simple-select, join, aggregation, filter, malicious, edge-case
   - Validate JSON structure against EvalTestCase type

2. **Extend types**
   - Review existing EvalTestCase and EvalResult types
   - Add BraintrustConfig interface
   - Add MetricResult interfaces
   - Add EvaluationSummary interface

## Phase 2: Metric Calculators

3. **Implement table accuracy calculator**
   - Create `evals/metrics/table-accuracy.ts`
   - Extract tables from generated SQL
   - Compare with expectedTables
   - Return accuracy score (0.0 to 1.0)

4. **Implement safety validation calculator**
   - Create `evals/metrics/safety-validation.ts`
   - Check if validator.safetyValid matches expectedShouldPass
   - Return binary score (1.0 or 0.0)

5. **Implement validation accuracy calculator**
   - Create `evals/metrics/validation-accuracy.ts`
   - Check if validator.isValid matches expectedShouldPass
   - Return binary score (1.0 or 0.0)

6. **Implement query correctness calculator (LLM-as-judge)**
   - Create `evals/metrics/query-correctness.ts`
   - Use AutoEvals LLM judge with Claude
   - Compare generated SQL with expected SQL semantically
   - Return score: 1.0 (correct), 0.5 (partial), 0.0 (wrong)

7. **Implement confidence calibration calculator**
   - Create `evals/metrics/confidence-calibration.ts`
   - Analyze correlation between confidence scores and correctness
   - Return calibration score

## Phase 3: Braintrust Integration

8. **Create Braintrust evaluator**
   - Create `src/agents/braintrust-evaluator.ts`
   - Initialize Braintrust client from BRAINTRUST_API_KEY
   - Create experiment with metadata
   - Implement logging functions
   - Handle local vs CI modes

9. **Configure Braintrust project**
   - Update .env.example with BRAINTRUST_API_KEY
   - Create Braintrust project configuration
   - Document setup instructions

## Phase 4: Evaluation Runner

10. **Create dataset loader**
    - Create `evals/utils/dataset-loader.ts`
    - Load test cases from JSON
    - Validate schema
    - Filter by category (optional)

11. **Create evaluation runner**
    - Create `evals/run-evals.ts`
    - Load test dataset
    - Initialize Braintrust experiment
    - For each test case:
      - Execute SqlGenerationWorkflow
      - Calculate all metrics
      - Log to Braintrust
      - Collect results
    - Generate summary report
    - Check against thresholds

12. **Implement progress tracking**
    - Add ora spinner for progress indication
    - Show current test case being evaluated
    - Display running metrics
    - Handle errors gracefully

## Phase 5: Reporting

13. **Create console reporter**
    - Create `evals/reporters/console-reporter.ts`
    - Format summary statistics
    - Show per-category breakdowns
    - Display threshold pass/fail
    - Color-code results with chalk

14. **Create metrics aggregator**
    - Create `evals/utils/metrics-aggregator.ts`
    - Calculate aggregate statistics (mean, median, p95)
    - Group by category
    - Compare against thresholds

## Phase 6: Testing & Documentation

15. **Test evaluation runner**
    - Run `npm run eval` with sample dataset
    - Verify all metrics are calculated
    - Verify Braintrust logging works
    - Verify console output is clear

16. **Document usage**
    - Update README with evaluation instructions
    - Add examples of interpreting results
    - Document how to add new test cases
    - Document how to add new metrics

17. **Update specs**
    - Finalize spec deltas
    - Run `openspec validate implement-braintrust-evaluation --strict`
    - Fix any validation errors
    - Apply specs: `openspec spec apply implement-braintrust-evaluation`

## Phase 7: Validation & Cleanup

18. **Run full evaluation suite**
    - Execute complete eval run
    - Review Braintrust dashboard
    - Verify metrics meet thresholds
    - Document any issues

19. **Code review and cleanup**
    - Review all code for consistency
    - Add JSDoc comments
    - Ensure error handling is robust
    - Check TypeScript types

20. **Archive change**
    - Commit all changes
    - Run `openspec archive implement-braintrust-evaluation`
    - Update roadmap in README

## Validation Checkpoints

After each phase:
- [ ] TypeScript compiles without errors
- [ ] No ESLint violations
- [ ] Code follows project conventions from project.md
- [ ] Types are properly defined
- [ ] Error handling is comprehensive

Final validation:
- [ ] `npm run eval` completes successfully
- [ ] All metrics are calculated correctly
- [ ] Results appear in Braintrust dashboard
- [ ] Console output is clear and helpful
- [ ] README is updated
- [ ] `openspec validate` passes
