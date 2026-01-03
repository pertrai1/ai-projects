# Change: Implement Milestone 3 - Heuristic Adaptive Loop

## Why

Milestone 2 established a trustworthy rubric for detecting contradictions, but the system still uses fixed prompts from Milestone 1. This means:
- Turn 2 is always the same regardless of how the model responds in Turn 1
- The system cannot adapt to different response patterns (e.g., confident vs. hesitant)
- We cannot determine if adaptation improves success rates compared to the static baseline

According to the ROADMAP, Milestone 3 introduces **adaptation without learning algorithms**. The goal is to select Turn 2 prompts based on categorizing the Turn 1 response, enabling the system to:
1. **Find failures missed by static baseline** - Different strategies may work for different response types
2. **Test adaptive hypothesis** - Validate that response-based adaptation is more effective
3. **Establish comparison baseline** - Create data for Milestone 6 evaluation

The ROADMAP explicitly requires:
- Turn 1 remains fixed (consistent starting point)
- Turn 2 is chosen based on model response category (e.g., confident → escalate, hesitant → accuse)
- No gradients, optimization, or generative strategy synthesis

Without this capability, we cannot test the core hypothesis that adaptive approaches outperform static prompts.

## What Changes

Implement three new capabilities:

1. **Response Classification** - Categorize Turn 1 responses
   - Analyze Turn 1 response to determine category (e.g., "confident", "hesitant", "hedging")
   - Use heuristic rules (keyword matching, linguistic patterns)
   - Return category label for strategy selection
   - No ML models or complex NLP

2. **Strategy Selection** - Choose Turn 2 prompt based on category
   - Define multiple Turn 2 prompt strategies
   - Map response categories to appropriate strategies
   - Select strategy using simple conditional logic
   - Return selected prompt for Turn 2

3. **Adaptive Execution Loop** - Run multi-iteration tests
   - Execute multiple conversations (e.g., 10-20 runs)
   - Track which strategy was used and whether it succeeded
   - Log category, strategy, and rubric result for each run
   - Compare success rates between adaptive and static baseline

These capabilities work together to enable systematic testing of adaptive prompting.

## Impact

- Affected specs:
  - New: `response-classification` (Turn 1 response categorization)
  - New: `strategy-selection` (category → prompt mapping)
  - New: `adaptive-loop` (multi-run execution)
  - Modified: `static-baseline` (add mode flag for adaptive vs. static)
- Affected code:
  - New: `src/classifier.ts` (response categorization logic)
  - New: `src/strategies.ts` (Turn 2 prompt variations)
  - New: `src/adaptive-loop.ts` (execution orchestration)
  - Modified: `src/index.ts` (switch between static/adaptive modes)
  - Modified: `src/logger.ts` (log category and strategy metadata)
- Breaking changes: None (static baseline remains available)
- Unblocks Milestone 4 (Strategy-Content Separation) by establishing multiple strategies
- Dependencies: Requires Milestone 2 rubric for success evaluation
