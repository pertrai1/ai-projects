# Change: Implement Milestone 1 - Static Baseline

## Why

Milestone 1 establishes a **non-adaptive baseline** that serves as the foundation for all future adaptive improvements. According to the ROADMAP, the goal is to "establish a non-adaptive baseline to expose the limits of static prompts."

This baseline is critical because:
1. **Quantifies static approach limits** - Shows what can be achieved without adaptation
2. **Provides comparison point** - Future milestones will measure improvement against this baseline
3. **Validates infrastructure** - Tests API integration, conversation flow, and logging
4. **Demonstrates determinism** - Fixed prompts should produce nearly identical outcomes (stop condition)

The ROADMAP explicitly constrains Milestone 1:
- **No loops** - Single execution path
- **No adaptation** - Prompts are fixed, not chosen based on responses
- **No learning** - No strategy selection or optimization

Without this baseline, we cannot:
- Measure the effectiveness of adaptive strategies (Milestones 3-5)
- Understand when adaptation provides value
- Validate that our rubric accurately detects failures (Milestone 2)

## What Changes

Implement three new capabilities:

1. **Static Baseline** - Core execution engine
   - Fixed 2-turn prompt sequence for eliciting self-contradictions
   - OpenAI API integration
   - Deterministic execution (no randomness)

2. **Conversation Logging** - Full conversation capture
   - Log all user prompts and model responses
   - Structured output format (JSON)
   - Timestamp and metadata tracking

3. **Success Detection** - Simple automated checks
   - Keyword-based contradiction detection
   - Regex pattern matching
   - Boolean success indicator

These capabilities work together to create an executable script that can be run repeatedly with consistent results.

## Impact

- Affected specs: 3 new capabilities (`static-baseline`, `conversation-logging`, `success-detection`)
- Affected code:
  - New file: `src/llm-client.ts` (OpenAI API wrapper)
  - New file: `src/prompts.ts` (Static prompt sequences)
  - New file: `src/logger.ts` (Conversation logging)
  - New file: `src/detector.ts` (Simple success detection)
  - Updated: `src/index.ts` (Main execution flow)
  - New dependency: OpenAI SDK in `package.json`
- No breaking changes (extending existing foundation)
- Unblocks Milestone 2 (Test Rubric) by providing conversations to evaluate
- Dependencies: Requires Milestone 0 configuration (already complete)
