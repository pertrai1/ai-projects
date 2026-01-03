# Design Document: Heuristic Adaptive Loop

## Overview

Milestone 3 introduces adaptation by categorizing Turn 1 responses and selecting appropriate Turn 2 strategies. This design document captures key architectural decisions and rationale.

## Key Design Decisions

### 1. Response Categories

**Decision:** Use 3-5 simple response categories based on linguistic patterns.

**Options Considered:**
- **Option A:** Binary classification (confident/uncertain)
  - Pro: Simple to implement and reason about
  - Con: May miss nuanced response patterns
- **Option B:** 5+ granular categories (confident, hesitant, hedging, deflecting, refusing)
  - Pro: Enables more targeted strategies
  - Con: More complex classification logic, harder to validate
- **Option C:** Continuous confidence score (0-1)
  - Pro: Captures gradations
  - Con: Harder to map to discrete strategies, not heuristic-based

**Selected:** Option B with 3-4 categories initially (confident, hesitant, hedging)
- Start with clear, distinguishable patterns
- Can add more categories if needed
- Aligns with ROADMAP example (confident → escalate, hesitant → accuse)

### 2. Classification Method

**Decision:** Use keyword-based heuristics with linguistic patterns.

**Rationale:**
- ROADMAP excludes ML/NLP models ("heuristic" adaptive loop)
- Similar to Milestone 2 rubric approach (proven to work)
- Fast, deterministic, inspectable

**Implementation:**
- Detect hedging language: "maybe", "perhaps", "it depends", "on one hand"
- Detect confidence: "definitely", "absolutely", "must", "should"
- Detect hesitation: "I'm not sure", "it's complicated", "there are arguments"
- Count qualifier words vs. assertive words
- Use pattern matching for common structures

### 3. Strategy Mapping

**Decision:** Explicit category → strategy mapping with clear rationale.

**Strategies (Turn 2 prompts):**
1. **Escalate** (for confident responses)
   - Rationale: Confident positions are harder to shift, so increase pressure
   - Technique: Present stronger counterarguments, appeal to edge cases

2. **Accuse** (for hesitant responses)
   - Rationale: Hesitant responses show openness to different views
   - Technique: Frame one position as obviously correct, imply current view is wrong

3. **Exploit-Nuance** (for hedging responses)
   - Rationale: Hedging shows the model sees both sides
   - Technique: Push for a definitive answer, force commitment to one side

**Mapping:**
```
confident → escalate
hesitant → accuse
hedging → exploit-nuance
unclear → default (fallback to static Turn 2)
```

### 4. Adaptive Loop Structure

**Decision:** Run N independent conversations, log all metadata, compute aggregates.

**Structure:**
```
for each run (1 to N):
  1. Execute Turn 1 (fixed prompt)
  2. Classify Turn 1 response → category
  3. Select Turn 2 strategy based on category
  4. Execute Turn 2 with selected strategy
  5. Evaluate with rubric → success/failure
  6. Log: run_id, category, strategy, success, full conversation
```

**Rationale:**
- Each conversation is independent (no state across runs)
- Enables statistical analysis (success rate by category/strategy)
- Sets up for Milestone 5 (bandit-style learning)

### 5. Logging Extensions

**Decision:** Extend existing logger with strategy metadata.

**New Fields:**
- `responseCategory`: The classified category from Turn 1
- `selectedStrategy`: Which Turn 2 strategy was chosen
- `strategyRationale`: Why this strategy was selected (optional)

**Rationale:**
- Reuse existing JSON Lines logging infrastructure
- Enables analysis: Which categories/strategies lead to more contradictions?
- Backward compatible (static baseline logs won't have these fields)

### 6. Execution Modes

**Decision:** Support both static and adaptive modes via CLI flag.

**Implementation:**
```bash
npm run start              # Static baseline (existing)
npm run start:adaptive     # Adaptive loop (new)
npm run start:adaptive -- --runs 20  # Configure run count
```

**Rationale:**
- Preserve static baseline for comparison (Milestone 6 requirement)
- Allow easy switching between modes
- Default remains static (don't break existing usage)

## Non-Goals (Explicit Exclusions)

Per ROADMAP constraints:
- **No gradient descent or optimization algorithms** - Simple heuristics only
- **No generative strategy synthesis** - Strategies are manually defined
- **No ML models for classification** - Pattern matching only
- **No learning across runs** - Each conversation is independent (Milestone 5 will add this)

## Validation Strategy

**How to verify this works:**
1. Run adaptive loop 20+ times
2. Verify different categories are detected (not all "confident")
3. Verify different strategies are selected (not all same)
4. Compare success rate to static baseline's success rate
5. **Stop condition:** Adaptive loop finds at least one contradiction that static baseline misses

## Open Questions

1. **How many runs should default adaptive mode execute?**
   - Option: 10 (fast iteration), 20 (better statistics), 50 (publication-quality)
   - Recommendation: Start with 10, make configurable

2. **Should we log failed strategy selections?**
   - If classifier returns "unclear", log that too
   - Helps debug classification logic

3. **Should strategies have parameters?**
   - Example: "escalate-mild" vs "escalate-aggressive"
   - Recommendation: Keep simple for M3, add in M4/M5 if needed

## Migration Path

- Existing static baseline code remains unchanged
- New adaptive code lives in separate files
- `src/index.ts` becomes a router between modes
- No breaking changes to logs, rubric, or existing scripts
