# Design Document: Query Refinement Through Dialog

**Change ID:** `add-query-refinement-dialog`

## Architecture Overview

This change introduces conversational capabilities to the interactive mode by adding dialog management and intent detection, while reusing existing refinement infrastructure.

```
┌─────────────────────────────────────────────────────────┐
│              Interactive CLI (Modified)                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────┐
│          Dialog Manager (NEW)                            │
│  • Track conversation history                            │
│  • Detect intent (new query vs refinement)              │
│  • Manage conversation state                             │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        v                   v
┌────────────────┐   ┌────────────────────┐
│ New Query Path │   │ Refinement Path    │
│ (Existing)     │   │ (Existing)         │
│                │   │                    │
│ SqlGeneration  │   │ SqlRefinement      │
│ Workflow       │   │ Workflow           │
└────────────────┘   └────────────────────┘
```

## Component Design

### 1. Dialog Manager

**Purpose:** Centralize conversation state management and intent detection.

**Responsibilities:**
- Store conversation history (turns, queries, results)
- Detect user intent (new query vs refinement)
- Provide conversation context to workflows
- Handle conversation lifecycle (start, turn, end)

**Data Model:**

```typescript
interface ConversationTurn {
  id: string;
  timestamp: Date;
  userInput: string;
  intent: 'new_query' | 'refinement';
  result?: SqlGenerationOutput;
}

interface ConversationState {
  sessionId: string;
  database: string;
  turns: ConversationTurn[];
  currentQuery?: string;
  currentResult?: SqlGenerationOutput;
}
```

**Key Operations:**
- `addTurn(input: string): void` - Add user input to history
- `detectIntent(input: string): 'new_query' | 'refinement'` - Classify user intent
- `getContext(): ConversationContext` - Get current conversation context
- `clear(): void` - Reset conversation state

### 2. Intent Detection Strategy

**Approach:** Rule-based classification (no LLM) for speed and reliability.

**Rules:**

1. **Refinement indicators:**
   - Starts with refinement keywords: "only", "also", "add", "remove", "change", "instead", "but", "actually", "sort by", "limit to", "filter", "exclude"
   - Contains modifying phrases: "too many", "too few", "wrong", "missing", "show me X too"
   - Short input (< 5 words) following a successful query

2. **New query indicators:**
   - Starts with question words: "show", "find", "get", "list", "what", "which", "who", "how many"
   - Contains complete question structure
   - Explicit reset commands: "/new", "new query", "start over"

3. **Ambiguity handling:**
   - If both indicators present: default to refinement if previous query exists
   - If no indicators: treat as new query
   - Confidence scoring for future LLM-based intent detection

**Rationale:** Rule-based is:
- Fast (< 1ms vs 500ms+ for LLM)
- Predictable and testable
- Sufficient for 85%+ of cases
- Can be enhanced with LLM fallback later

### 3. Interactive Refinement Workflow

**Purpose:** Orchestrate dialog flow in interactive mode.

**Flow:**

```
User Input
    ↓
┌─────────────────┐
│ Dialog Manager  │
│ • Add turn      │
│ • Detect intent │
└────────┬────────┘
         │
    Intent?
    /      \
  New    Refinement
   ↓         ↓
┌──────┐  ┌──────────────┐
│ SQL  │  │ SQL          │
│ Gen  │  │ Refinement   │
└──┬───┘  └───┬──────────┘
   │          │
   └────┬─────┘
        ↓
    Update State
        ↓
    Display Result
```

**Pseudocode:**

```typescript
async function handleInteractiveTurn(userInput: string): Promise<void> {
  // 1. Detect intent
  const intent = dialogManager.detectIntent(userInput);

  // 2. Route to appropriate workflow
  let result: SqlGenerationOutput;

  if (intent === 'new_query') {
    result = await sqlGenerationWorkflow.execute({
      question: userInput,
      database: conversationState.database
    });
  } else {
    // refinement
    const context: RefinementContext = {
      originalQuestion: conversationState.turns[0].userInput,
      currentQuery: conversationState.currentQuery!,
      currentResult: conversationState.currentResult!,
      feedback: userInput
    };
    result = await sqlRefinementWorkflow.refine(context);
  }

  // 3. Update conversation state
  dialogManager.addTurn(userInput, intent, result);

  // 4. Display result
  displayResult(result, intent);
}
```

## Data Flow

### Refinement Path (Example)

**Turn 1 (New Query):**
```
User: "Show me all users"
  → Intent: new_query
  → SQL Generation Workflow
  → Result: SELECT * FROM users;
  → Store in conversation state
```

**Turn 2 (Refinement):**
```
User: "Only from last month"
  → Intent: refinement
  → Context: {
      originalQuestion: "Show me all users",
      currentQuery: "SELECT * FROM users;",
      feedback: "Only from last month"
    }
  → SQL Refinement Workflow
  → Result: SELECT * FROM users WHERE created_at >= DATE('now', '-1 month');
  → Update conversation state
```

**Turn 3 (Refinement):**
```
User: "Sort by name"
  → Intent: refinement
  → Context: {
      originalQuestion: "Show me all users",
      currentQuery: "SELECT * FROM users WHERE created_at >= DATE('now', '-1 month');",
      feedback: "Sort by name"
    }
  → SQL Refinement Workflow
  → Result: SELECT * FROM users WHERE created_at >= DATE('now', '-1 month') ORDER BY name;
  → Update conversation state
```

## Integration Points

### Modified: Interactive CLI (`src/index.ts`)

**Changes:**
1. Initialize `DialogManager` at session start
2. Replace simple query loop with `handleInteractiveTurn()`
3. Add commands: `/new` (force new query), `/history` (show conversation), `/clear` (reset)
4. Display intent indicator in results ("✨ Refined query" vs "🆕 New query")

**Backward Compatibility:**
- First turn always treated as new query (no breaking change)
- Single-turn usage identical to current behavior
- Conversation state isolated per session (no global state)

### Reused: Existing Workflows

**No changes needed to:**
- `SqlGenerationWorkflow` - already handles new query generation
- `SqlRefinementWorkflow` - already handles refinement
- Query generator, refiner, validator agents - already functional

## Configuration

### Environment Variables

```bash
# Conversation settings
CONVERSATION_MAX_TURNS=10          # Max history to preserve (default: 10)
CONVERSATION_INTENT_LLM=false      # Use LLM for intent detection (default: false)
```

### Feature Flags

```typescript
{
  enableDialogRefinement: true,     // Enable/disable feature
  intentDetectionStrategy: 'rules', // 'rules' | 'llm' | 'hybrid'
  maxConversationTurns: 10          // History limit
}
```

## Performance Considerations

### Memory Usage

- **Per conversation:** ~5-10 KB per turn (JSON state)
- **Max per session:** 10 turns × 10 KB = 100 KB
- **Impact:** Negligible for CLI usage

### Latency

- **Intent detection:** < 1ms (rule-based)
- **Context retrieval:** < 1ms (in-memory)
- **Total overhead:** < 2ms per turn
- **Impact:** Imperceptible to user

### Optimization Opportunities

1. **Lazy loading:** Only load conversation context when needed
2. **Compression:** Compress turn history if > N turns
3. **Pruning:** Remove old execution results, keep only queries

## Error Handling

### Scenarios

1. **Intent detection fails:**
   - Fallback: Treat as new query
   - Log: Warning with user input for analysis

2. **Refinement called with no previous query:**
   - Fallback: Route to new query generation
   - User message: "Starting new query (no previous query to refine)"

3. **Conversation state corruption:**
   - Fallback: Reset conversation state
   - User message: "Conversation reset due to error"

4. **Memory exhausted (too many turns):**
   - Action: Prune oldest turns beyond limit
   - User message: "Conversation history trimmed to last N turns"

## Testing Strategy

### Unit Tests

1. **Dialog Manager:**
   - Intent detection accuracy (test cases for each rule)
   - Conversation state management
   - History pruning

2. **Interactive Workflow:**
   - Routing logic (new vs refinement)
   - Context assembly for refinement
   - State updates after each turn

### Integration Tests

1. **Multi-turn scenarios:**
   - New → Refinement → Refinement
   - New → New (conversation reset)
   - Refinement keywords trigger correctly

2. **Edge cases:**
   - Empty history (first turn)
   - Max history exceeded (pruning)
   - Rapid successive refinements

### Evaluation Metrics

1. **Intent Detection Accuracy:**
   - Target: ≥ 85% on test set
   - Test set: 100 labeled examples (50 new, 50 refinement)

2. **Refinement Success Rate:**
   - Target: ≥ 90% for clear feedback
   - Measure: LLM-as-judge correctness scoring

3. **User Experience:**
   - Conversation flow naturalness (qualitative)
   - Error recovery effectiveness

## Migration Path

### Phase 1: Foundation (This Change)
- ✅ Dialog Manager with rule-based intent detection
- ✅ Interactive workflow integration
- ✅ Basic conversation commands

### Phase 2: Enhancements (Future)
- LLM-based intent detection (hybrid mode)
- Conversation history persistence (file/DB)
- Undo/redo support

### Phase 3: Advanced (Future)
- Multi-database conversations
- Conversation branching
- Shared conversation links

## Security Considerations

### Conversation Data

- **Storage:** In-memory only (no persistence)
- **Lifetime:** Session-scoped (cleared on exit)
- **Sensitive data:** May contain query results (handle per existing query execution security)

### Intent Detection

- **No LLM by default:** Rule-based to avoid prompt injection
- **LLM fallback:** Same security as existing query generation (validated through safety checks)

## Rollout Plan

1. **Development:** Implement behind feature flag (default: OFF)
2. **Internal testing:** Enable for maintainers, gather feedback
3. **Beta:** Enable by default, add opt-out flag
4. **GA:** Remove feature flag, document in README

## Alternatives Rejected

See proposal.md for detailed alternative analysis.

## Open Design Questions

See proposal.md for open questions requiring decision before implementation.

---

**Last Updated:** 2025-12-23
**Status:** Proposed
