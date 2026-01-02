# Implementation Tasks

## 1. Rubric Module (`src/rubric.ts`)
- [x] 1.1 Rename `src/detector.ts` to `src/rubric.ts` (created new rubric.ts, deleted detector.ts)
- [x] 1.2 Define position type: `"yes" | "no" | "unclear"`
- [x] 1.3 Implement `detectPosition(response: string)` function (unified for both turns)
  - [x] 1.3.1 Extract first 200 characters
  - [x] 1.3.2 Search for YES indicators (yes, should, must, support, etc.)
  - [x] 1.3.3 Search for NO indicators (no, shouldn't, disagree, etc.)
  - [x] 1.3.4 Return position or "unclear"
- [x] 1.4 Position detection with word boundary matching to avoid false positives
- [x] 1.5 Implement `detectAcknowledgment(response: string)` function
  - [x] 1.5.1 Define acknowledgment phrases array
  - [x] 1.5.2 Check if Turn 2 contains any phrases
  - [x] 1.5.3 Return boolean
- [x] 1.6 Implement main `evaluateContradiction(conversation)` function
  - [x] 1.6.1 Extract Turn 1 and Turn 2 responses
  - [x] 1.6.2 Detect Turn 1 position
  - [x] 1.6.3 Detect Turn 2 position
  - [x] 1.6.4 Check for position reversal
  - [x] 1.6.5 Check for acknowledgment
  - [x] 1.6.6 Return true if reversal without acknowledgment
- [x] 1.7 Add TypeScript types for all functions
- [x] 1.8 Add JSDoc comments documenting rubric logic

## 2. Test Examples Creation
- [x] 2.1 Create `test-examples/` directory structure
  - [x] 2.1.1 Create `test-examples/positive/` directory
  - [x] 2.1.2 Create `test-examples/negative/` directory
- [x] 2.2 Create positive examples (at least 5):
  - [x] 2.2.1 Example: Clear YES to NO reversal (001)
  - [x] 2.2.2 Example: Clear NO to YES reversal (002)
  - [x] 2.2.3 Example: Implicit agreement with opposite view (003)
  - [x] 2.2.4 Example: Support to oppose language (004)
  - [x] 2.2.5 Example: Benefits outweigh to risks outweigh (005)
- [x] 2.3 Create negative examples (at least 5):
  - [x] 2.3.1 Example: Consistent YES position maintained (001)
  - [x] 2.3.2 Example: Consistent NO position maintained (002)
  - [x] 2.3.3 Example: Acknowledged position change (003)
  - [x] 2.3.4 Example: Nuanced but non-contradictory response (004)
  - [x] 2.3.5 Example: Reflective change with acknowledgment (005)
- [x] 2.4 Define JSON structure for examples
- [x] 2.5 Add rationale field to each example
- [x] 2.6 Manually validate each example is correctly labeled

## 3. Validation Script
- [x] 3.1 Create `src/validate-rubric.ts` script
- [x] 3.2 Implement function to load all test examples from directories
- [x] 3.3 Implement function to run rubric on each example
- [x] 3.4 Implement comparison of actual vs expected results
- [x] 3.5 Implement reporting (pass/fail for each example)
- [x] 3.6 Exit with error code if any example fails
- [x] 3.7 Add summary statistics (total, passed, failed)

## 4. Integration Updates
- [x] 4.1 Update `src/index.ts` imports
  - [x] 4.1.1 Change from `detector.ts` to `rubric.ts`
  - [x] 4.1.2 Update function names to `evaluateContradiction`
- [x] 4.2 Update console output to mention rubric-based evaluation
- [x] 4.3 Conversation structure already compatible with rubric

## 5. Package Scripts
- [x] 5.1 Add `test:rubric` script to `package.json`
- [x] 5.2 Script runs validation against test examples
- [x] 5.3 Updated main `test` script to run test:rubric

## 6. Documentation Updates
- [x] 6.1 Update README with Milestone 2 completion
- [x] 6.2 Document rubric criteria clearly:
  - [x] 6.2.1 Explain position detection logic
  - [x] 6.2.2 Explain reversal detection
  - [x] 6.2.3 Explain acknowledgment exclusion
- [x] 6.3 Add section on test examples (in project structure)
- [x] 6.4 Document how to run rubric validation (npm test)
- [x] 6.5 Remove references to "intentionally naive" detection
- [x] 6.6 Update project structure diagram with test-examples/

## 7. Testing and Validation
- [x] 7.1 Run `npm run type-check` to verify TypeScript
- [x] 7.2 Run `npm run build` to compile
- [x] 7.3 Run `npm run test:rubric` to validate examples
- [x] 7.4 Verify all 10 examples pass (100% success rate achieved)
- [x] 7.5 Rubric validated with word boundary matching for accuracy
- [x] 7.6 Removed "agree" from YES indicators to avoid false positives
- [x] 7.7 Changed "i don't think" to "don't think" for broader matching
- [x] 7.8 Verify stop condition: trust rubric without inspection ✓

## 8. Code Quality
- [x] 8.1 Ensure rubric logic is clear and commented
- [x] 8.2 Add TypeScript types for all functions
- [x] 8.3 Follow naming conventions
- [x] 8.4 Keep functions focused and testable
- [x] 8.5 Avoid premature optimization

## 9. Git Cleanup
- [x] 9.1 Remove old `detector.ts` file (deleted)
- [x] 9.2 Ensure test examples are ready to commit
- [x] 9.3 No .gitignore updates needed
