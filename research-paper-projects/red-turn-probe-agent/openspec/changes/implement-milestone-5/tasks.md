# Implementation Tasks for Milestone 5

## 1. Strategy Scorer Module
- [ ] 1.1 Create src/scorer.ts module
- [ ] 1.2 Define StrategyScore interface (attempts, successes, successRate)
- [ ] 1.3 Define ScoreMatrix type (category → strategy → score)
- [ ] 1.4 Implement StrategyScorer class with score tracking
- [ ] 1.5 Add getSuccessRate(category, strategy) method
- [ ] 1.6 Add updateScore(category, strategy, success) method
- [ ] 1.7 Add getAllScores() method for statistics display
- [ ] 1.8 Add resetScores() method to clear all data
- [ ] 1.9 Initialize all category-strategy pairs to 0/0

## 2. Epsilon-Greedy Selection
- [ ] 2.1 Add getCandidateStrategies(category) function in scorer.ts
- [ ] 2.2 Implement selectWithScoring(category, scorer, epsilon) function
- [ ] 2.3 Return selected strategy plus method (exploit/explore)
- [ ] 2.4 Handle epsilon=0 (pure exploitation) edge case
- [ ] 2.5 Handle epsilon=1 (pure exploration) edge case
- [ ] 2.6 Break ties randomly when multiple strategies have same score
- [ ] 2.7 Add selection method tracking (exploit count vs explore count)

## 3. Score Persistence (Optional)
- [ ] 3.1 Define scores directory path (scores/)
- [ ] 3.2 Define score file name (strategy-scores.json)
- [ ] 3.3 Implement saveScores(scorer) function
- [ ] 3.4 Implement loadScores() function returning ScoreMatrix or undefined
- [ ] 3.5 Add ensureScoresDirectory() helper
- [ ] 3.6 Handle file read/write errors gracefully
- [ ] 3.7 Validate loaded scores structure
- [ ] 3.8 Add scores/ directory to .gitignore

## 4. Strategy Selection Integration
- [ ] 4.1 Update selectStrategy() signature to accept optional StrategyScorer
- [ ] 4.2 Add useSco ring: boolean parameter
- [ ] 4.3 Add epsilon: number parameter (default 0.2)
- [ ] 4.4 When scoring disabled, use M4 deterministic logic
- [ ] 4.5 When scoring enabled, call selectWithScoring()
- [ ] 4.6 Return selection result with method metadata
- [ ] 4.7 Update StrategySelection interface with selectionMethod field
- [ ] 4.8 Ensure backward compatibility when scorer not provided

## 5. Adaptive Loop Integration
- [ ] 5.1 Add scoring configuration to runAdaptiveLoop parameters
- [ ] 5.2 Create StrategyScorer instance at start of loop
- [ ] 5.3 Load persisted scores if available
- [ ] 5.4 Pass scorer to selectStrategy() calls
- [ ] 5.5 Update scorer after each run with success/failure
- [ ] 5.6 Save scores after each run (if persistence enabled)
- [ ] 5.7 Track selection method counts (exploit vs explore)
- [ ] 5.8 Display score matrix in statistics output

## 6. Logger Extension
- [ ] 6.1 Extend AdaptiveMetadata with selectionMethod field
- [ ] 6.2 Add selectionMethod: "exploit" | "explore" | "deterministic" field
- [ ] 6.3 Add exploitedScore field (score of selected strategy at selection time)
- [ ] 6.4 Update logAdaptiveConversation to include selection metadata
- [ ] 6.5 Ensure backward compatibility (fields optional)

## 7. CLI Options
- [ ] 7.1 Add --epsilon <number> option to adaptive command
- [ ] 7.2 Validate epsilon is between 0 and 1
- [ ] 7.3 Add --no-scoring flag to disable scored selection
- [ ] 7.4 Add --reset-scores flag to clear persisted scores
- [ ] 7.5 Add --save-scores flag to enable score persistence
- [ ] 7.6 Update help text with new options
- [ ] 7.7 Display scoring configuration at start (epsilon, persistence)

## 8. Statistics Display Enhancement
- [ ] 8.1 Create displayScoreMatrix() function in adaptive-loop.ts
- [ ] 8.2 Format scores in table with category, strategy, attempts, successes, rate
- [ ] 8.3 Highlight highest-scoring strategy per category
- [ ] 8.4 Add selection method breakdown (exploit count, explore count, percentages)
- [ ] 8.5 Display epsilon value used
- [ ] 8.6 Show total runs and learning progress
- [ ] 8.7 Use chalk colors (green for high scores, yellow for low scores)
- [ ] 8.8 Display score file location if persistence enabled

## 9. Documentation Updates
- [ ] 9.1 Update README with scored selection explanation
- [ ] 9.2 Document epsilon-greedy algorithm briefly
- [ ] 9.3 Add CLI examples with scoring options
- [ ] 9.4 Explain score persistence and reset
- [ ] 9.5 Update milestone status to M5 complete
- [ ] 9.6 Add note about learning over time

## 10. Testing and Validation
- [ ] 10.1 Build project and fix TypeScript errors
- [ ] 10.2 Test adaptive mode with scoring: redturn adaptive --runs 30
- [ ] 10.3 Verify scores update correctly after each run
- [ ] 10.4 Verify epsilon-greedy distribution (~20% exploration)
- [ ] 10.5 Test pure exploitation: --epsilon 0
- [ ] 10.6 Test pure exploration: --epsilon 1
- [ ] 10.7 Test no-scoring mode: --no-scoring
- [ ] 10.8 Test score persistence: run, exit, run again, verify scores loaded
- [ ] 10.9 Test score reset: --reset-scores
- [ ] 10.10 Verify statistics display shows score matrix
- [ ] 10.11 Verify logs include selection method metadata
- [ ] 10.12 Compare early vs late run selections (should shift toward successful strategies)

## 11. Stop Condition Verification
- [ ] 11.1 Run 30+ conversations with scoring enabled
- [ ] 11.2 Verify strategy preferences shift based on outcomes
- [ ] 11.3 Confirm higher-scoring strategies selected more frequently
- [ ] 11.4 Document example showing learning progression
- [ ] 11.5 Verify logs show selection method changing over time
- [ ] 11.6 Update tasks.md with completion status

## 12. OpenSpec Validation
- [ ] 12.1 Run openspec validate implement-milestone-5 --strict
- [ ] 12.2 Fix any validation errors
- [ ] 12.3 Verify all spec requirements have scenarios
- [ ] 12.4 Verify proposal accurately reflects implementation
