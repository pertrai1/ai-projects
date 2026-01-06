# Change: Implement Milestone 5 - Scored Strategy Selection

## Why

Milestone 4 established template-based strategies, but strategy selection remains deterministic and category-based. Currently:

- **No learning from outcomes** - Every run is independent; the system never improves
- **Ignores historical performance** - Strategies that fail repeatedly are still selected equally
- **Misses optimization opportunities** - Cannot discover which strategies work best for which categories
- **Category-only selection** - Uses only the response category, not past success rates

According to the ROADMAP, Milestone 5 requires "lightweight reward-driven behavior without full RL." This means:

1. **Track strategy performance** - Maintain running scores showing which strategies succeed
2. **Prefer successful strategies** - Use bandit-style selection to favor high-scoring options
3. **Maintain exploration** - Don't exclusively exploit; keep trying all strategies
4. **No complex RL** - No PPO, GRPO, policy gradients, or model fine-tuning

The goal is to demonstrate that the system can **learn which strategies work better over time** while remaining simple and transparent. This is a key step toward data-driven red-teaming that adapts based on observed effectiveness.

Without this capability:
- The system cannot improve through experience
- We cannot measure whether adaptation actually helps
- Milestone 6 (evaluation) would lack meaningful comparison data

## What Changes

Implement scored strategy selection using epsilon-greedy bandit algorithm:

### 1. Strategy Scoring System

Track success rates for each strategy:

**Current behavior:**
```
category → deterministic strategy selection
```

**New behavior:**
```
category → candidate strategies → score-based selection → chosen strategy
```

**Scoring mechanism:**
- Success score: `successes / attempts` for each strategy
- Tracks independently per category (confident strategies scored separately from hesitant strategies)
- Persists across runs (in-memory for session, optionally saved to file)

### 2. Epsilon-Greedy Selection

Balance exploration vs. exploitation:

- **Exploitation (1-ε)**: Choose highest-scoring strategy for the category
- **Exploration (ε)**: Choose random strategy from candidates

**Default epsilon**: 0.2 (20% exploration, 80% exploitation)
- Ensures all strategies get tried
- Favors successful ones
- Simple to understand and tune

### 3. Score Tracking & Persistence

**In-memory tracker:**
```typescript
interface StrategyScore {
  strategyName: StrategyName;
  category: ResponseCategory;
  attempts: number;
  successes: number;
  successRate: number;
}
```

**Features:**
- Initialize all strategy-category pairs to 0/0
- Update after each run
- Calculate success rate: `successes / max(attempts, 1)`
- Display scores in statistics

**Optional persistence:**
- Save scores to `scores/strategy-scores.json` after each run
- Load on startup to continue learning across sessions
- CLI flag to reset scores: `--reset-scores`

### 4. Updated CLI Options

Add configuration for scored selection:

```bash
redturn adaptive --runs 20                    # Uses scored selection (default)
redturn adaptive --runs 20 --epsilon 0.3      # Custom exploration rate
redturn adaptive --runs 20 --no-scoring       # Disable scoring (M4 behavior)
redturn adaptive --runs 20 --reset-scores     # Clear previous scores
```

### 5. Enhanced Statistics Display

Show learning progress:

```
Strategy Scores (by category):
  confident:
    escalate: 3/5 (60.0%) ← highest
    accuse: 1/3 (33.3%)
    exploit-nuance: 0/2 (0.0%)

  hesitant:
    accuse: 4/6 (66.7%) ← highest
    escalate: 2/4 (50.0%)
    ...

Epsilon-Greedy Selection:
  Exploitation (80%): 16 selections
  Exploration (20%): 4 selections
```

## Impact

- **Affected specs:**
  - ADDED: `strategy-scoring` - Track success rates per strategy-category pair
  - MODIFIED: `strategy-selection` - Use scores for selection instead of deterministic mapping
- **Affected code:**
  - ADDED: `src/scorer.ts` - Strategy scoring tracker and epsilon-greedy selector
  - MODIFIED: `src/strategies.ts` - Integrate scoring into selection logic
  - MODIFIED: `src/adaptive-loop.ts` - Pass scorer instance, update scores after evaluation
  - MODIFIED: `src/index.ts` - Add CLI options for epsilon and score management
  - MODIFIED: `src/logger.ts` - Log selection method (exploitation vs exploration)
- **Breaking changes:** None - scoring is opt-in via CLI, defaults to deterministic M4 behavior
- **New dependencies:** None
- **Data persistence:** Optional JSON file for cross-session learning
- **Enables:** Milestone 6 can compare static vs adaptive vs scored-adaptive performance
