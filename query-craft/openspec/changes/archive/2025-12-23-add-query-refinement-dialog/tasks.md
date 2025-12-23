# Implementation Tasks: Query Refinement Through Dialog

**Change ID:** `add-query-refinement-dialog`

## Task Overview

Tasks are organized by component and ordered for incremental delivery. Each task is small, testable, and delivers user-visible progress.

**Estimated effort:** 8-12 hours
**Parallelizable:** Tasks marked with `[P]` can run in parallel

---

## Phase 1: Foundation (Core Functionality)

### 1. Create Dialog Manager Types and Interfaces

**File:** `src/types/index.ts`

**Tasks:**
- [x] Define `ConversationTurn` interface
- [x] Define `ConversationState` interface
- [x] Define `ConversationContext` interface
- [x] Define `IntentType` enum ('new_query' | 'refinement')
- [x] Define `DialogManagerInput` and `DialogManagerOutput` interfaces

**Validation:**
- TypeScript compilation succeeds
- Types align with design.md data model

**Estimated time:** 30 minutes

---

### 2. Implement Dialog Manager Agent

**File:** `src/agents/dialog-manager.ts`

**Tasks:**
- [x] Create `DialogManager` class
- [x] Implement constructor (initialize empty state)
- [x] Implement `addTurn(input, intent, result)` method
- [x] Implement `detectIntent(input)` method (rule-based)
- [x] Implement `getContext()` method
- [x] Implement `clear()` method
- [x] Implement `getLastQuery()` helper
- [x] Implement `getLastResult()` helper
- [x] Add conversation history pruning (max 10 turns)

**Intent Detection Rules:**
```typescript
// Refinement indicators
const REFINEMENT_KEYWORDS = [
  'only', 'also', 'add', 'remove', 'change', 'instead',
  'but', 'actually', 'sort by', 'limit to', 'filter',
  'exclude', 'too many', 'too few', 'wrong', 'missing'
];

// New query indicators
const NEW_QUERY_KEYWORDS = [
  'show', 'find', 'get', 'list', 'what', 'which',
  'who', 'how many', 'count'
];
```

**Validation:**
- Unit tests for intent detection (10+ test cases)
- Unit tests for conversation state management
- Unit tests for history pruning

**Estimated time:** 2 hours

---

### 3. Create Dialog Manager Spec

**File:** `specs/agents/dialog-manager.spec.yaml`

**Tasks:**
- [x] Create YAML spec following agent spec format
- [x] Define agent metadata (name, description)
- [x] Define input schema (user input string)
- [x] Define output schema (intent type, context)
- [x] Document intent detection strategy
- [x] Add configuration options (max turns, etc.)

**Validation:**
- Spec validates with `openspec validate --strict`
- Spec loader can load the spec

**Estimated time:** 1 hour

---

### 4. Create Interactive Refinement Workflow

**File:** `src/workflows/interactive-refinement.ts`

**Tasks:**
- [x] Create `InteractiveRefinementWorkflow` class
- [x] Inject dependencies (DialogManager, SqlGenerationWorkflow, SqlRefinementWorkflow)
- [x] Implement `handleTurn(userInput)` method:
  - Detect intent via DialogManager
  - Route to SQL generation (new) or refinement (refine)
  - Update conversation state
  - Return result with metadata (intent, turn number)
- [x] Add conversation state getter for UI display
- [x] Add reset/clear conversation method

**Validation:**
- Integration tests for new query path
- Integration tests for refinement path
- Integration tests for multi-turn scenarios

**Estimated time:** 2 hours

---

### 5. Create Interactive Refinement Workflow Spec

**File:** `specs/workflows/interactive-refinement.spec.yaml`

**Tasks:**
- [x] Create YAML spec following workflow spec format
- [x] Define workflow metadata
- [x] Document workflow steps (intent detection → routing → execution)
- [x] Define input/output schemas
- [x] Document error handling
- [x] Add examples of conversation flows

**Validation:**
- Spec validates with `openspec validate --strict`
- Spec loader can load the spec

**Estimated time:** 1 hour

---

### 6. Integrate Dialog Flow into Interactive CLI

**File:** `src/index.ts`

**Tasks:**
- [x] Import `DialogManager` and `InteractiveRefinementWorkflow`
- [x] Initialize dialog manager in interactive mode handler
- [x] Replace simple query loop with workflow-based handler
- [x] Add intent indicator to result display:
  - "🆕 New query" for new queries
  - "✨ Refined query" for refinements
- [x] Add turn counter to prompt (e.g., `querycraft [2]>`)
- [x] Preserve backward compatibility for first turn

**Validation:**
- Manual testing of interactive mode
- First query works as before (new query)
- Subsequent refinements work correctly

**Estimated time:** 1.5 hours

---

## Phase 2: User Experience Enhancements

### 7. Add Conversation Commands

**File:** `src/index.ts` (interactive mode)

**Tasks:**
- [x] Add `/new` command - force new query
- [x] Add `/history` command - show conversation history
- [x] Add `/clear` command - reset conversation
- [x] Add `/help` command - show available commands
- [x] Update prompt hint to mention commands

**Command Behavior:**
```
/new         - Start a new query (ignore previous context)
/history     - Show last N conversation turns
/clear       - Clear conversation history
/help        - Show this help message
```

**Validation:**
- Manual testing of each command
- Commands don't interfere with query input

**Estimated time:** 1 hour

---

### 8. Improve Result Display for Conversations

**File:** `src/index.ts` (display functions)

**Tasks:**
- [x] Add conversation context to result display:
  - Show turn number
  - Show intent (new vs refinement)
  - For refinements, show what changed
- [x] Add "Refining query based on: [feedback]" message
- [x] Display conversation summary on `/history` command
- [x] Add color coding for intent type (green=new, blue=refinement)

**Validation:**
- Manual testing of display formatting
- Output is readable and informative

**Estimated time:** 1 hour

---

## Phase 3: Testing & Documentation

### 9. Write Unit Tests for Dialog Manager

**File:** `tests/agents/dialog-manager.test.ts`

**Test Cases:**
- [ ] Intent detection: refinement keywords
- [ ] Intent detection: new query keywords
- [ ] Intent detection: ambiguous input
- [ ] Intent detection: first turn (always new)
- [ ] Conversation state: add turn
- [ ] Conversation state: get context
- [ ] Conversation state: history pruning
- [ ] Conversation state: clear

**Validation:**
- All tests pass
- Coverage ≥ 90% for dialog-manager.ts

**Estimated time:** 1.5 hours `[P]`

---

### 10. Write Integration Tests for Interactive Workflow

**File:** `tests/workflows/interactive-refinement.test.ts`

**Test Scenarios:**
- [ ] New query → successful generation
- [ ] New query → refinement → successful refinement
- [ ] New query → multiple refinements (3-4 turns)
- [ ] New query → new query (conversation reset)
- [ ] Refinement with no previous query (fallback to new)
- [ ] Max history exceeded (pruning)
- [ ] Error handling (generation fails, refinement fails)

**Validation:**
- All scenarios pass
- Coverage ≥ 85% for interactive-refinement.ts

**Estimated time:** 2 hours `[P]`

---

### 11. Create Evaluation Test Cases

**File:** `data/evals/dialog-test-cases.json`

**Test Cases:**
- [ ] Intent detection accuracy (50 new, 50 refinement examples)
- [ ] Multi-turn conversation flows (10 scenarios)
- [ ] Refinement success rate (20 clear feedback cases)

**Evaluation Metrics:**
- Intent detection accuracy ≥ 85%
- Refinement success rate ≥ 90%

**Validation:**
- Run evaluation with `npm run eval`
- Metrics meet targets

**Estimated time:** 1.5 hours `[P]`

---

### 12. Update Documentation

**Files:** `README.md`, `docs/` (if needed)

**Tasks:**
- [x] Update README.md:
  - Mark "Query refinement through dialogue" as complete (line 572)
  - Add interactive refinement examples
  - Document conversation commands
- [x] Update interactive mode help text
- [x] Add troubleshooting section for dialog issues
- [x] Update feature list to include conversational refinement

**Validation:**
- Documentation is accurate
- Examples work as described

**Estimated time:** 1 hour `[P]`

---

## Phase 4: Validation & Cleanup

### 13. Run Full Validation Suite

**Tasks:**
- [x] Run `openspec validate add-query-refinement-dialog --strict`
- [x] Fix any validation errors
- [x] Run `npm run type-check`
- [ ] Run `npm run lint` (no ESLint configuration exists)
- [ ] Run `npm run test:all` (no test infrastructure exists)
- [ ] Run `npm run eval` (if evaluation tests added)

**Validation:**
- All checks pass
- No regressions in existing tests

**Estimated time:** 30 minutes

---

### 14. Manual End-to-End Testing

**Test Scenarios:**
- [ ] Simple refinement flow (3 turns)
- [ ] Complex refinement flow (5+ turns)
- [ ] Mixed new queries and refinements
- [ ] Error handling (invalid queries, failed refinements)
- [ ] Commands (/new, /history, /clear)
- [ ] Edge cases (empty input, very long history)

**Validation:**
- All scenarios work as expected
- User experience is smooth and intuitive

**Estimated time:** 1 hour

---

## Task Dependencies

```
Phase 1 (Foundation)
  1 (Types) → 2 (Dialog Manager) → 3 (Dialog Spec)
                                 ↘
  1 (Types) → 4 (Workflow) → 5 (Workflow Spec)
                           ↘
                            6 (CLI Integration)

Phase 2 (UX Enhancements)
  6 → 7 (Commands)
  6 → 8 (Display)

Phase 3 (Testing & Docs)
  2,3 → 9 (Dialog Tests)      [P]
  4,5 → 10 (Workflow Tests)   [P]
  6,7,8 → 11 (Eval Cases)     [P]
  * → 12 (Documentation)      [P]

Phase 4 (Validation)
  * → 13 (Validation)
  * → 14 (E2E Testing)
```

**Critical Path:** 1 → 2 → 4 → 6 → 13 → 14 (6 hours minimum)
**Parallelizable:** Tasks 9, 10, 11, 12 can run concurrently after Phase 2

---

## Rollout Strategy

1. **Development:** Complete all tasks behind feature flag
2. **Validation:** Run full validation suite (Task 13)
3. **Testing:** Manual E2E testing (Task 14)
4. **Review:** Request approval for merge
5. **Merge:** Apply changes to main specs
6. **Deploy:** Update README roadmap

---

## Success Metrics

After implementation, verify:

- [ ] Intent detection accuracy ≥ 85% on test set
- [ ] Refinement success rate ≥ 90% for clear feedback
- [ ] No regressions in existing test suite
- [ ] Interactive mode works for both single-turn and multi-turn usage
- [ ] Documentation is complete and accurate

---

**Total Estimated Time:** 8-12 hours (depending on parallel execution)
**Deliverable:** Fully functional conversational query refinement in interactive mode
