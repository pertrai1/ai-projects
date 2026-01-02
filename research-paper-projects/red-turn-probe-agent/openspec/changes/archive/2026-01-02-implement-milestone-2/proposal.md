# Change: Implement Milestone 2 - Explicit Test Rubric

## Why

Milestone 1's keyword-based detection is intentionally naive and unreliable. Milestone 2 replaces it with a **precise, machine-verifiable rubric** that can determine success without human judgment.

According to the ROADMAP, the goal is to "make 'failure' precise and machine-verifiable" by creating `rubric(conversation) -> bool` backed by at least 5 manually validated test cases.

This rubric is critical because:
1. **Validates baseline effectiveness** - Determines if static prompts actually elicit contradictions
2. **Enables future comparison** - Milestones 3-6 need reliable success metrics to measure improvement
3. **Replaces naive detection** - Current keyword matching has high false positive/negative rates
4. **Builds trust** - Stop condition requires trusting the rubric without manual inspection

Without a proper rubric:
- We can't reliably measure whether conversations contain contradictions
- Adaptive strategies (Milestones 3-5) have no reliable feedback signal
- Results analysis (Milestone 6) lacks valid data

The rubric must be **fully automatic** with no human judgment during execution.

## What Changes

Implement two new capabilities:

1. **Test Rubric** - Automated contradiction detection
   - Replace `detector.ts` with proper rubric logic
   - Implement clear criteria for self-contradiction
   - Return boolean with confidence/reasoning
   - No subjective or ambiguous rules

2. **Test Examples** - Validation dataset
   - At least 5 positive examples (conversations with contradictions)
   - At least 5 negative examples (conversations without contradictions)
   - Manual validation that rubric correctly classifies all examples
   - Examples stored as data files for regression testing

These capabilities work together to provide trustworthy success detection.

## Impact

- Affected specs:
  - New: `test-rubric` (rubric logic)
  - New: `test-examples` (validation dataset)
  - Modified: `success-detection` (replace implementation, keep interface)
- Affected code:
  - Updated: `src/detector.ts` → `src/rubric.ts` (rename and reimplement)
  - New: `test-examples/` directory with positive/negative examples
  - Updated: `src/index.ts` (import from rubric instead of detector)
- Breaking changes: Detector function signature may change
- Unblocks Milestone 3 (Adaptive Loop) by providing reliable feedback
- Dependencies: Requires Milestone 1 logging (conversations to evaluate)
