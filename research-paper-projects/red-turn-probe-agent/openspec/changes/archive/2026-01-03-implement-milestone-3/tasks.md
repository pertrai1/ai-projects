# Implementation Tasks for Milestone 3

## 1. Response Classification Implementation
- [ ] 1.1 Create src/classifier.ts module
- [ ] 1.2 Implement category detection logic (confident, hesitant, hedging, unclear)
- [ ] 1.3 Add keyword matching for each category
- [ ] 1.4 Implement pattern counting (assertive vs qualifier words)
- [ ] 1.5 Add deterministic classification with case-insensitive matching
- [ ] 1.6 Return classification result with category and rationale

## 2. Strategy Selection Implementation
- [ ] 2.1 Create src/strategies.ts module
- [ ] 2.2 Define escalate strategy (for confident responses)
- [ ] 2.3 Define accuse strategy (for hesitant responses)
- [ ] 2.4 Define exploit-nuance strategy (for hedging responses)
- [ ] 2.5 Define default strategy (static baseline fallback)
- [ ] 2.6 Implement category-to-strategy mapping function
- [ ] 2.7 Return strategy metadata (name, rationale, prompt)

## 3. Adaptive Loop Implementation
- [ ] 3.1 Create src/adaptive-loop.ts module
- [ ] 3.2 Implement multi-run execution (configurable N runs)
- [ ] 3.3 Integrate classifier for Turn 1 response categorization
- [ ] 3.4 Integrate strategy selector for Turn 2 prompt selection
- [ ] 3.5 Execute Turn 1 and Turn 2 for each run
- [ ] 3.6 Evaluate with rubric for each run
- [ ] 3.7 Log all metadata (category, strategy, success)
- [ ] 3.8 Collect and display aggregate statistics

## 4. Logger Extension
- [ ] 4.1 Extend ConversationLogEntry interface with adaptive metadata
- [ ] 4.2 Add responseCategory field (optional for backward compatibility)
- [ ] 4.3 Add selectedStrategy field (optional for backward compatibility)
- [ ] 4.4 Add strategyRationale field (optional for backward compatibility)
- [ ] 4.5 Update logConversation to accept optional adaptive metadata

## 5. Entry Point Update
- [ ] 5.1 Update src/index.ts to support mode selection
- [ ] 5.2 Add CLI argument parsing for --mode flag
- [ ] 5.3 Route to static baseline or adaptive loop based on mode
- [ ] 5.4 Add --runs argument for adaptive mode configuration
- [ ] 5.5 Update package.json scripts for start:adaptive

## 6. Testing and Validation
- [ ] 6.1 Build project and fix any TypeScript errors
- [ ] 6.2 Run adaptive mode with 10 runs
- [ ] 6.3 Verify different categories are detected
- [ ] 6.4 Verify different strategies are selected
- [ ] 6.5 Verify logs contain all metadata fields
- [ ] 6.6 Compare success rates between adaptive and static modes
- [ ] 6.7 Run OpenSpec validation: openspec validate implement-milestone-3 --strict
