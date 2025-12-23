# interactive-refinement-workflow Specification

## Purpose
TBD - created by archiving change add-query-refinement-dialog. Update Purpose after archive.
## Requirements
### Requirement: IRW-REQ-01

The workflow MUST orchestrate multi-turn dialog sessions by: (Multi-Turn Dialog Orchestration)
1. Accepting user input for each turn
2. Using DialogManager to detect intent (new query vs refinement)
3. Routing to appropriate workflow (SqlGenerationWorkflow or SqlRefinementWorkflow)
4. Updating conversation state with results
5. Returning enriched results with conversation metadata

The workflow MUST preserve conversation state across turns within a session.

#### Scenario: Handle new query turn

**Given:** Interactive session initialized with database "ecommerce"

**When:**
1. User inputs "Show me all users"
2. Workflow processes turn

**Then:**
- DialogManager detects intent as 'new_query'
- SqlGenerationWorkflow is invoked
- Result includes: query, intent='new_query', turnNumber=1
- Conversation state updated with turn 1

#### Scenario: Handle refinement turn

**Given:**
- Turn 1 completed: query "SELECT * FROM users;"
- User inputs "Only from last month"

**When:** Workflow processes turn 2

**Then:**
- DialogManager detects intent as 'refinement'
- SqlRefinementWorkflow is invoked with context:
  - originalQuestion: "Show me all users"
  - currentQuery: "SELECT * FROM users;"
  - feedback: "Only from last month"
- Result includes: refined query, intent='refinement', turnNumber=2
- Conversation state updated with turn 2

---

### Requirement: IRW-REQ-02

The workflow MUST route user input based on detected intent: (Intent-Based Routing)

**For 'new_query' intent:**
- Invoke SqlGenerationWorkflow.execute()
- Input: { question: userInput, database: currentDatabase }
- Store result as new conversation turn
- Reset refinement context (no carry-over from previous query)

**For 'refinement' intent:**
- Retrieve conversation context from DialogManager
- Invoke SqlRefinementWorkflow.refine()
- Input: RefinementContext from DialogManager
- Store result as refinement turn
- Preserve conversation history

Routing MUST occur automatically without user intervention.

#### Scenario: Route to generation workflow

**Given:** DialogManager detects intent='new_query'

**When:** Workflow routes the request

**Then:**
- SqlGenerationWorkflow.execute() is called
- Input contains: question, database (schema)
- No refinement context is passed

#### Scenario: Route to refinement workflow

**Given:**
- DialogManager detects intent='refinement'
- Previous query exists: "SELECT * FROM users;"

**When:** Workflow routes the request

**Then:**
- SqlRefinementWorkflow.refine() is called
- Input contains: originalQuestion, currentQuery, feedback, previousResults
- Context is assembled from conversation state

---

### Requirement: IRW-REQ-03

The workflow MUST synchronize conversation state after each turn: (Conversation State Synchronization)
1. Add turn to DialogManager with: input, intent, result
2. Update current query and result in DialogManager
3. Trigger history pruning if needed (max 10 turns)
4. Persist session metadata (session ID, database, turn count)

State updates MUST occur atomically (all-or-nothing).

#### Scenario: Update state after successful turn

**Given:** Turn processing completed successfully with query result

**When:** Workflow updates conversation state

**Then:**
- DialogManager.addTurn() is called with turn data
- Current query updated to latest query
- Current result updated to latest result
- Turn counter incremented

#### Scenario: Handle failed turn gracefully

**Given:** Query generation/refinement fails with error

**When:** Workflow attempts state update

**Then:**
- Turn is added with error indicator
- Current query/result unchanged (preserve last successful state)
- Error message returned to user
- Conversation continues (not aborted)

---

### Requirement: IRW-REQ-04

The workflow MUST enrich results with conversation metadata: (Result Enrichment)
- `intent`: 'new_query' | 'refinement'
- `turnNumber`: Current turn number in conversation
- `sessionId`: Session identifier
- `conversationContext`: Previous turns (for UI display)
- `refinementSummary`: For refinements, what changed

Enriched results MUST be formatted for CLI display and logging.

#### Scenario: Enrich new query result

**Given:** Turn 1, new query result received from SqlGenerationWorkflow

**When:** Workflow enriches result

**Then:** Result includes:
```json
{
  "query": "SELECT * FROM users;",
  "explanation": "...",
  "confidence": "high",
  "intent": "new_query",
  "turnNumber": 1,
  "sessionId": "abc-123",
  "conversationContext": []
}
```

#### Scenario: Enrich refinement result

**Given:** Turn 3, refinement result received from SqlRefinementWorkflow

**When:** Workflow enriches result

**Then:** Result includes:
```json
{
  "query": "SELECT * FROM users WHERE created_at >= DATE('now', '-1 month');",
  "explanation": "...",
  "confidence": "high",
  "intent": "refinement",
  "turnNumber": 3,
  "sessionId": "abc-123",
  "refinementSummary": "Added WHERE clause to filter users from last month",
  "conversationContext": [/* turn 1, turn 2 */]
}
```

---

### Requirement: IRW-REQ-05

The workflow MUST handle errors gracefully: (Error Handling and Recovery)

**Generation/Refinement Failures:**
- Catch all errors from child workflows
- Return error result with conversation context preserved
- Allow user to retry or provide different input
- Do not abort conversation session

**State Synchronization Failures:**
- Log error details for debugging
- Attempt to recover conversation state
- If unrecoverable, reset conversation with user notification

**Intent Detection Failures:**
- Default to 'new_query' if uncertain
- Log ambiguous cases for analysis
- Include confidence score in result

#### Scenario: Handle generation failure

**Given:** Turn 1, SqlGenerationWorkflow.execute() throws error

**When:** Workflow processes error

**Then:**
- Error message captured and formatted
- Conversation state remains valid (no partial updates)
- Result includes: error=true, message="...", canRetry=true
- User can provide new input without restarting session

#### Scenario: Graceful degradation for ambiguous intent

**Given:** DialogManager returns intent with confidence='low'

**When:** Workflow processes turn

**Then:**
- Warning logged: "Ambiguous intent detected"
- Default routing applied (refinement if previous query exists)
- Result includes confidence='low' indicator
- User can override with explicit command (/new)

---

### Requirement: IRW-REQ-06

The workflow MUST manage session lifecycle: (Session Lifecycle Management)
- **Initialization:** Create session with unique ID, set database context
- **Active:** Process turns, maintain state, route requests
- **Reset:** Clear conversation history on user command
- **Termination:** Clean up resources, optionally log conversation

Session ID MUST remain constant throughout session lifecycle.

#### Scenario: Initialize session

**Given:** User starts interactive mode with database "ecommerce"

**When:** Workflow initializes session

**Then:**
- Unique session ID generated (UUID)
- Database context set to "ecommerce"
- Conversation state initialized (0 turns)
- DialogManager created and ready

#### Scenario: Reset session

**Given:** Active session with 5 turns

**When:** User executes `/clear` command

**Then:**
- All turns removed from conversation state
- Session ID unchanged
- Database context unchanged
- Next turn treated as turn 1 (new query)

#### Scenario: Terminate session

**Given:** Active session with conversation history

**When:** User exits interactive mode

**Then:**
- Session resources cleaned up
- Conversation state discarded (no persistence)
- Optional: Log conversation summary for analytics

---

### Requirement: IRW-REQ-07

The workflow MUST meet performance targets: (Performance Requirements)
- Turn processing overhead: < 5ms (excluding LLM calls)
- State synchronization: < 2ms
- Intent detection: < 1ms
- Result enrichment: < 1ms

Total turn latency = workflow overhead + generation/refinement time.

Target: End-to-end turn < 3 seconds (p95) including LLM calls.

#### Scenario: Measure turn overhead

**Given:** Mock LLM responses (instant, no network delay)

**When:** Workflow processes turn with mocked workflows

**Then:**
- Turn processing completes in < 5ms
- Breakdown: intent detection (1ms) + routing (1ms) + state update (2ms) + enrichment (1ms)

---

### Requirement: IRW-REQ-08

The workflow MUST integrate with existing workflows without modifications: (Integration with Existing Workflows)
- **SqlGenerationWorkflow:** Use as-is for new queries
- **SqlRefinementWorkflow:** Use as-is for refinements
- No changes to existing agent behavior (generator, refiner, validator)

Integration MUST be additive only (no breaking changes).

#### Scenario: Delegate to SqlGenerationWorkflow

**Given:** Intent detected as 'new_query'

**When:** Workflow invokes SqlGenerationWorkflow

**Then:**
- SqlGenerationWorkflow.execute() called with standard inputs
- No workflow modifications needed
- Result returned in standard format
- Workflow enriches result with conversation metadata

#### Scenario: Delegate to SqlRefinementWorkflow

**Given:** Intent detected as 'refinement'

**When:** Workflow invokes SqlRefinementWorkflow

**Then:**
- SqlRefinementWorkflow.refine() called with RefinementContext
- No workflow modifications needed
- Result returned in standard format
- Workflow enriches result with conversation metadata

---

