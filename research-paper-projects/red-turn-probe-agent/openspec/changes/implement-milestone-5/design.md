# Design Document: Scored Strategy Selection

## Context

Milestone 5 implements bandit-style learning to select strategies based on historical success rates. This is the ROADMAP's "lightweight reward-driven behavior" - simpler than full RL but smarter than random or deterministic selection.

Currently (M4), strategy selection is purely deterministic: `confident → escalate`, `hesitant → accuse`, etc. This works but never improves. M5 adds learning while keeping the system transparent and debuggable.

## Goals / Non-Goals

### Goals
- Track which strategies succeed most often for each response category
- Use epsilon-greedy algorithm to balance exploration and exploitation
- Show learning progress in statistics (scores shifting based on outcomes)
- Enable cross-session learning via optional score persistence
- Maintain backward compatibility (scoring is opt-in)
- Keep implementation simple (no neural networks, no gradient descent)

### Non-Goals
- Full reinforcement learning (PPO, GRPO, policy gradients) - explicitly forbidden by ROADMAP
- Model fine-tuning - explicitly forbidden
- Multi-armed bandit variants (UCB, Thompson sampling) - too complex for M5
- Contextual bandits - no context beyond category
- Complex reward shaping - success/failure is binary (contradiction detected or not)
- Real-time adaptation during single run - scores update between runs only

## Key Design Decisions

### 1. Epsilon-Greedy Algorithm

**Decision:** Use epsilon-greedy rather than UCB, Thompson sampling, or pure greedy.

**Rationale:**
- **Simplest bandit algorithm** - Easy to understand and debug
- **Explicit exploration parameter** - Tunable, predictable behavior
- **No probability calculations** - Just random choice vs best choice
- **Industry standard** - Well-understood, proven effective

**Algorithm:**
```python
def select_strategy(category, scores, epsilon=0.2):
    candidates = get_strategies_for_category(category)

    if random() < epsilon:
        # Explore: random selection
        return random.choice(candidates)
    else:
        # Exploit: choose highest scoring
        return max(candidates, key=lambda s: scores[category][s].success_rate)
```

**Alternative considered:** UCB1 (Upper Confidence Bound)
- Pro: Automatically balances exploration/exploitation
- Con: More complex, harder to explain, requires confidence intervals
- Decision: Epsilon-greedy is sufficient for educational project

### 2. Score Granularity

**Decision:** Track scores per `(category, strategy)` pair, not globally.

**Structure:**
```typescript
scores = {
  "confident": {
    "escalate": { attempts: 10, successes: 6, successRate: 0.6 },
    "accuse": { attempts: 5, successes: 2, successRate: 0.4 },
    "exploit-nuance": { attempts: 3, successes: 1, successRate: 0.33 },
    "default": { attempts: 1, successes: 0, successRate: 0.0 }
  },
  "hesitant": {
    // ... separate scores for hesitant category
  },
  // ...
}
```

**Rationale:**
- **Category-specific effectiveness** - "escalate" may work well for confident but poorly for hesitant
- **Finer-grained learning** - Can discover nuanced patterns
- **Matches M4 architecture** - Categories already exist, natural extension

**Alternative considered:** Global scores per strategy
- Pro: Simpler data structure
- Con: Loses category-specific information, less effective learning
- Decision: Category-specific scores provide better learning signal

### 3. Candidate Strategy Selection

**Decision:** For each category, allow ALL strategies as candidates (not just the M4 default).

**Current M4 mapping:**
- confident → `[escalate]` only
- hesitant → `[accuse]` only
- hedging → `[exploit-nuance]` only
- unclear → `[default]` only

**New M5 mapping:**
- confident → `[escalate, accuse, exploit-nuance, default]` all allowed
- hesitant → `[escalate, accuse, exploit-nuance, default]` all allowed
- hedging → `[escalate, accuse, exploit-nuance, default]` all allowed
- unclear → `[default]` only (no exploration for unclear responses)

**Rationale:**
- **Enables discovery** - Maybe "accuse" works better for confident than "escalate"
- **More exploration** - Can learn unexpected patterns
- **Still grounded** - Category provides useful prior information

**Implementation:**
```typescript
function getCandidateStrategies(category: ResponseCategory): StrategyName[] {
  if (category === "unclear") {
    return ["default"]; // No exploration for unclear
  }
  return ["escalate", "accuse", "exploit-nuance"]; // All non-default strategies
}
```

### 4. Score Initialization

**Decision:** Initialize all strategy-category pairs to 0 attempts, 0 successes.

**Cold-start problem:** With 0/0, how to choose initially?
- **Solution:** Epsilon-greedy naturally handles this
- First few runs: Random exploration (epsilon=0.2 → 20% chance each run)
- Ties broken randomly
- As data accumulates, successful strategies emerge

**Alternative considered:** Optimistic initialization (start all at 1.0 success rate)
- Pro: Encourages initial exploration
- Con: Misleading statistics, slower to converge
- Decision: Start at 0/0, rely on epsilon for exploration

### 5. Score Persistence

**Decision:** Optional file-based persistence, default to in-memory only.

**File format:** JSON
```json
{
  "confident": {
    "escalate": { "attempts": 10, "successes": 6 },
    "accuse": { "attempts": 5, "successes": 2 }
  }
}
```

**File location:** `scores/strategy-scores.json`

**Behavior:**
- Load on startup if file exists
- Save after each run completes
- `--reset-scores` flag deletes file and reinitializes

**Rationale:**
- **Cross-session learning** - Scores improve across multiple CLI invocations
- **Simple format** - Easy to inspect, debug, analyze
- **Optional** - Can still run in-memory only for quick tests

**Alternative considered:** SQLite database
- Pro: Better for complex queries
- Con: Overkill for simple key-value storage
- Decision: JSON is sufficient

### 6. Backward Compatibility

**Decision:** Scoring is opt-in via CLI flag `--scoring` (or enabled by default with `--no-scoring` to disable).

**Actually, simpler:** Enable by default, add `--no-scoring` to revert to M4 behavior.

**Rationale:**
- M5 is about learning, should be default behavior
- `--no-scoring` allows comparison with M4 deterministic selection
- Users can test both modes easily

### 7. Statistics Display

**Decision:** Show score matrix and selection breakdown in adaptive loop output.

**New output sections:**

```
Strategy Scores (updated after each run):
┌─────────────┬──────────┬─────────┬───────────────┬──────────┐
│ Category    │ Strategy │ Attempts│ Successes     │ Rate     │
├─────────────┼──────────┼─────────┼───────────────┼──────────┤
│ confident   │ escalate │ 8       │ 5             │ 62.5%    │
│ confident   │ accuse   │ 3       │ 1             │ 33.3%    │
│ hesitant    │ accuse   │ 6       │ 4             │ 66.7%    │
│ hesitant    │ escalate │ 2       │ 0             │ 0.0%     │
└─────────────┴──────────┴─────────┴───────────────┴──────────┘

Selection Method:
  Exploitation (chose best): 16/20 (80.0%)
  Exploration (random): 4/20 (20.0%)
```

**Rationale:**
- **Transparency** - Users see exactly how strategies are scored
- **Verifiability** - Can confirm scores match expectations
- **Learning visualization** - Shows adaptation happening

## Algorithm Details

### Epsilon-Greedy Selection

```typescript
function selectWithScoring(
  category: ResponseCategory,
  scorer: StrategyScorer,
  epsilon: number
): { strategy: StrategyName; method: "exploit" | "explore" } {

  const candidates = getCandidateStrategies(category);

  // Exploration: random selection
  if (Math.random() < epsilon) {
    const strategy = candidates[Math.floor(Math.random() * candidates.length)];
    return { strategy, method: "explore" };
  }

  // Exploitation: choose highest scoring
  let bestStrategy = candidates[0];
  let bestScore = scorer.getSuccessRate(category, candidates[0]);

  for (const strategy of candidates.slice(1)) {
    const score = scorer.getSuccessRate(category, strategy);
    if (score > bestScore || (score === bestScore && Math.random() < 0.5)) {
      bestStrategy = strategy;
      bestScore = score;
    }
  }

  return { strategy: bestStrategy, method: "exploit" };
}
```

### Score Update

```typescript
function updateScore(
  category: ResponseCategory,
  strategy: StrategyName,
  success: boolean
): void {
  const score = scores[category][strategy];
  score.attempts += 1;
  if (success) {
    score.successes += 1;
  }
  score.successRate = score.successes / score.attempts;
}
```

## Migration Path

1. **Add scorer module** - New file, no changes to existing code
2. **Update selectStrategy()** - Add optional scorer parameter
3. **Update adaptive loop** - Create scorer instance, pass to selection
4. **Update logger** - Add selection method metadata
5. **Update CLI** - Add epsilon and scoring flags
6. **Update statistics** - Display score matrix

**Phased rollout:**
- Phase 1: Implement scoring without persistence (in-memory only)
- Phase 2: Add file persistence
- Phase 3: Add CLI controls

## Trade-offs and Risks

### Trade-off: Epsilon Value

**Question:** What should default epsilon be?

**Options:**
- ε=0.1 (10% exploration): More exploitation, faster convergence, risk of local optima
- ε=0.2 (20% exploration): Balanced, safer default
- ε=0.3 (30% exploration): More exploration, slower to converge, discovers more

**Decision:** ε=0.2 as default
- Standard in bandit literature
- Provides good balance
- Users can override via CLI

**Risk:** Too much exploitation early can lock into suboptimal strategies
**Mitigation:** 20% exploration ensures continuous sampling

### Trade-off: Candidate Strategies

**Risk:** Allowing all strategies for all categories dilutes learning signal
**Example:** "default" strategy might get selected for "confident" and perform poorly
**Mitigation:**
- Start with reasonable defaults (M4 mapping) during exploration phase
- Statistics will show if bad matches occur frequently
- Can adjust candidate sets if needed

### Risk: Cold Start

**Problem:** First few runs have no data, selection is random
**Impact:** Initial runs may seem ineffective
**Mitigation:**
- Epsilon-greedy handles cold start naturally through exploration
- Scores accumulate quickly (10-20 runs sufficient)
- Can seed initial scores if needed (future enhancement)

### Risk: Score Persistence Conflicts

**Problem:** Multiple concurrent runs could corrupt scores file
**Mitigation:**
- File locking (future enhancement if needed)
- For now, document that concurrent runs not supported
- In-memory mode avoids issue entirely

## Validation Strategy

**Stop Condition (ROADMAP):** "Logs show strategy preferences shifting based on outcomes."

**How to verify:**
1. Run adaptive loop with 30+ runs
2. Check that strategy selection changes over time
3. Verify higher-scoring strategies selected more often
4. Confirm statistics show learning (success rates improving)
5. Compare early runs (random-ish) vs late runs (converged)

**Success criteria:**
- Scores update correctly after each run
- Epsilon-greedy selection follows expected distribution
- Strategies with higher success rates selected more frequently
- Logs contain selection method metadata
- Statistics display is clear and accurate
