# dialog-manager Specification

## Purpose
TBD - created by archiving change add-query-refinement-dialog. Update Purpose after archive.
## Requirements
### Requirement: DM-REQ-01

The dialog manager MUST maintain conversation state for the current session, including: (Conversation State Management)
- Unique session identifier
- Current database context
- Ordered list of conversation turns (user input, intent, results)
- Current active query and result
- Timestamp for each turn

State MUST be scoped to a single interactive session and cleared on session end.

#### Scenario: Track multi-turn conversation

**Given:** An interactive session has been started with database "ecommerce"

**When:**
1. User inputs "Show me all users"
2. System generates query and stores result
3. User inputs "Only from last month"
4. System refines query and stores result

**Then:**
- Conversation state contains 2 turns
- Each turn has: input, intent, result, timestamp
- Current query is the refined query from turn 2
- Session ID remains constant across turns

---

### Requirement: DM-REQ-02

The dialog manager MUST detect refinement intent when user input: (Intent Detection - Refinement Indicators)
1. Starts with refinement keywords: "only", "also", "add", "remove", "change", "instead", "but", "actually", "sort by", "limit to", "filter", "exclude"
2. Contains modifying phrases: "too many", "too few", "wrong", "missing", "show X too"
3. Is a short modification (≤ 5 words) AND follows a successful query

Intent MUST be classified as 'refinement' if ANY indicator matches AND previous query exists.

#### Scenario: Detect refinement from keyword

**Given:**
- Conversation has 1 previous turn with query "SELECT * FROM users;"
- Previous query executed successfully

**When:** User inputs "Only from last month"

**Then:**
- Intent is detected as 'refinement'
- Confidence is 'high'

#### Scenario: Detect refinement from short modification

**Given:**
- Conversation has 1 previous turn with query "SELECT * FROM products ORDER BY price;"
- Previous query executed successfully

**When:** User inputs "limit 10"

**Then:**
- Intent is detected as 'refinement' (short phrase after successful query)
- Confidence is 'medium'

---

### Requirement: DM-REQ-03

The dialog manager MUST detect new query intent when user input: (Intent Detection - New Query Indicators)
1. Starts with question words: "show", "find", "get", "list", "what", "which", "who", "how many", "count"
2. Is a complete question (> 5 words) without refinement keywords
3. Matches explicit reset patterns: "/new", "new query", "start over"

Intent MUST be classified as 'new_query' if:
- No previous query exists (first turn), OR
- Explicit reset command detected, OR
- New query indicators present without refinement indicators

#### Scenario: Detect new query from question word

**Given:** Conversation has 1 previous turn

**When:** User inputs "Show me all products"

**Then:**
- Intent is detected as 'new_query'
- Confidence is 'high'

#### Scenario: First turn always new query

**Given:** Conversation has no previous turns

**When:** User inputs any text (e.g., "expensive items")

**Then:**
- Intent is detected as 'new_query'
- Confidence is 'high'

#### Scenario: Explicit reset command

**Given:** Conversation has 2 previous turns

**When:** User inputs "/new show customers"

**Then:**
- Intent is detected as 'new_query'
- Conversation context is reset for this query
- Confidence is 'high'

---

### Requirement: DM-REQ-04

When user input contains BOTH refinement and new query indicators, the dialog manager MUST (Intent Detection - Ambiguity Handling):
1. Default to 'refinement' if previous query exists AND confidence ≥ medium
2. Default to 'new_query' if no previous query exists
3. Return 'low' confidence for ambiguous cases

The system MAY log ambiguous cases for future LLM-based intent detection.

#### Scenario: Ambiguous input with previous query

**Given:**
- Conversation has 1 previous turn with query "SELECT * FROM users;"

**When:** User inputs "Show me only active users"
- Contains "show" (new query indicator)
- Contains "only" (refinement indicator)

**Then:**
- Intent is detected as 'refinement' (default when previous query exists)
- Confidence is 'low'

---

### Requirement: DM-REQ-05

The dialog manager MUST limit conversation history to prevent memory growth: (Conversation History Pruning)
- Maximum 10 turns preserved
- When limit exceeded, remove oldest turns (FIFO)
- Preserve session ID and database context
- Maintain current query and result

Pruning MUST occur automatically when adding a new turn that would exceed the limit.

#### Scenario: History pruning at limit

**Given:** Conversation has 10 turns (at max limit)

**When:** User adds 11th turn

**Then:**
- Conversation state contains 10 turns (max)
- Oldest turn (turn 1) is removed
- Newest turn (turn 11) is added
- Current query/result still accessible

---

### Requirement: DM-REQ-06

The dialog manager MUST provide conversation context for refinement workflows, including: (Conversation Context Retrieval)
- Original question (first turn input)
- Current query (last successful query)
- Current result (last successful execution result)
- User feedback (current turn input)
- Conversation history (recent turns for context)

Context MUST be formatted for consumption by refinement workflow.

#### Scenario: Retrieve context for refinement

**Given:**
- Turn 1: "Show me all users" → query: "SELECT * FROM users;"
- Turn 2: "Only active" → query: "SELECT * FROM users WHERE status = 'active';"

**When:** System prepares context for turn 3 refinement

**Then:** Context contains:
- originalQuestion: "Show me all users"
- currentQuery: "SELECT * FROM users WHERE status = 'active';"
- currentResult: {execution result from turn 2}
- previousTurns: [turn 1, turn 2]

---

### Requirement: DM-REQ-07

The dialog manager MUST support conversation reset operations: (Conversation Reset)
- `clear()` - Remove all turns, reset to initial state
- Session ID MUST remain constant (session continues)
- Database context MUST be preserved
- Current query/result MUST be cleared

Reset MUST be triggered by explicit user command or programmatic call.

#### Scenario: Clear conversation via command

**Given:** Conversation has 5 turns

**When:** User executes `/clear` command

**Then:**
- All turns are removed
- Session ID unchanged
- Database context unchanged
- Current query/result = null
- Next input treated as new query

---

### Requirement: DM-REQ-08

The dialog manager MUST meet performance targets: (Performance Requirements)
- Intent detection: < 1ms (p95)
- Context retrieval: < 1ms (p95)
- State updates: < 1ms (p95)
- Memory per session: < 100 KB

All operations MUST be synchronous (no async/await for state management).

#### Scenario: Intent detection performance

**Given:** Standard conversation state (5 turns, ~50 KB)

**When:** `detectIntent()` is called with user input

**Then:**
- Operation completes in < 1ms (p95)
- No network calls are made
- No LLM calls are made (rule-based only)

---

