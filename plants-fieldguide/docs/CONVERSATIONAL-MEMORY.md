# Conversational Memory

The ability to have multi-turn conversations where the system remembers context from previous questions and understands follow-ups.

## The Problem with Stateless Q&A

Traditional RAG systems are stateless - each question is independent:

```bash
You: "What is FACW?"
Bot: "FACW stands for Facultative Wetland..."

You: "What about OBL?"
Bot: ❌ "I don't understand 'What about' - please be more specific"

You: "Compare them"
Bot: ❌ "Compare what? Please specify what you want to compare"
```

**Problems:**
- Can't understand pronouns ("them", "it", "these")
- Can't handle follow-ups ("What about...", "How about...")
- No conversation flow (feels robotic)
- User must repeat context every time

## The Conversational Memory Solution

```bash
You: "What is FACW?"
Bot: "FACW stands for Facultative Wetland..."
     [Remembers: discussing wetland indicators, entity "FACW"]

You: "What about OBL?"
Bot: [Enriches to: "What about OBL wetland indicator?"]
     "OBL stands for Obligate Wetland..."
     [Remembers: entities "FACW", "OBL"]

You: "Compare them"
Bot: [Enriches to: "Compare FACW and OBL"]
     "FACW vs OBL: FACW plants occur 67-99% in wetlands..."
```

**Benefits:**
- Natural conversation flow
- Understands follow-up questions
- Resolves pronouns using context
- Maintains topic continuity
- Feels human-like

# Concepts

### 1. **Session Management Pattern**

Maintain state across interactions:

```typescript
class ConversationManager {
  private session: ConversationSession;

  addTurn(turn) {
    this.session.turns.push(turn);
    this.updateContext(turn);
  }

  getRecentHistory(maxTurns = 3) {
    return this.session.turns.slice(-maxTurns);
  }
}
```

### 2. **Context Extraction**

Extract topics and entities from conversation:

```typescript
// Simple approach (production would use NER)
const acronyms = answer.match(/\b[A-Z]{2,}\b/g);
// Finds: ["FACW", "OBL", "FAC"]

const keywords = routing.keywords;
// Gets: ["wetland", "indicator", "classification"]
```

### 3. **Query Enrichment**

Add context to follow-up questions:

```typescript
// Original: "What about OBL?"
// Enriched: "[Context: discussing wetland indicators] What about OBL?"

// Original: "Compare them"
// Enriched: "[Referring to: FACW and OBL] Compare them"
```

### 4. **Context Window Management**

Can't send full history (token limits!):

```typescript
// Only send recent N turns
getRecentHistory(maxTurns = 3) {
  return this.session.turns.slice(-maxTurns);
}

// Or send compressed summary
getContextSummary() {
  return `Topics: ${topics.join(", ")}. Entities: ${entities.join(", ")}`;
}
```

### 5. **Follow-Up Detection**

Identify when questions need context:

```typescript
isFollowUp(question) {
  const lowercaseQ = question.toLowerCase();

  return (
    lowercaseQ.startsWith("what about") ||
    lowercaseQ.startsWith("how about") ||
    lowercaseQ.includes("compare them") ||
    lowercaseQ.includes("also") ||
    lowercaseQ.length < 15  // Very short = likely follow-up
  );
}
```

### 6. **REPL Pattern**

Read-Eval-Print Loop:

```typescript
while (true) {
  // READ: Get user input
  const question = await prompt();

  // EVAL: Process
  const answer = await processQuestion(question, conversation);

  // PRINT: Display result
  console.log(answer);

  // LOOP: Repeat
}
```

## Testing the Chat

### Basic Usage

```bash
# Start interactive chat
npm run cli -- chat

# With context display
npm run cli -- chat --show-context

# With verbose pipeline info
npm run cli -- chat -v
```

### Example Session

```bash
$ npm run cli -- chat

PLANTS FieldGuide - Interactive Chat

Ask questions about the PLANTS database.
Type "exit", "quit", or press Ctrl+C to end the session.
Type "clear" to start a new conversation.
Type "stats" to see session statistics.

You: What is FACW?

FieldGuide:
FACW stands for "Facultative Wetland." This is a wetland indicator status
code used to classify plants based on their occurrence in wetlands...

Confidence: high

You: What about OBL?

FieldGuide:
OBL stands for "Obligate Wetland." Plants with this designation occur
almost exclusively in wetlands (estimated probability 99-100%)...

Confidence: high

You: Compare them

FieldGuide:
Comparing FACW and OBL:

**FACW (Facultative Wetland):**
- Occurs 67-99% in wetlands
- Sometimes found in uplands
- Moderately wetland-dependent

**OBL (Obligate Wetland):**
- Occurs 99-100% in wetlands
- Rarely if ever in uplands
- Strictly wetland-dependent

Key difference: OBL plants are more strictly tied to wetland habitats...

Confidence: high

You: stats

Session Statistics

Questions asked: 3
Session duration: 2 minutes
Topics discussed: 3
Entities mentioned: 2

Topics: wetland, indicators, classification
Entities: FACW, OBL

You: exit

Session summary:
  Questions asked: 3
  Duration: 2 minutes
  Topics discussed: 3
```

## Advanced Patterns

### Context Compression

Instead of sending full history:

```typescript
// Full history (expensive)
conversationHistory: turns.map(t => `Q: ${t.question}\nA: ${t.answer}`).join("\n\n")
// Could be 1000s of tokens!

// Compressed (efficient)
conversationHistory: turns.slice(-2).map(t => `Q: ${t.question}\nA: ${t.answer.substring(0, 200)}...`).join("\n\n")
// ~400 tokens max
```

### Entity Tracking

```typescript
// Extract entities (simplified NER)
const acronymPattern = /\b[A-Z]{2,}\b/g;
const entities = text.match(acronymPattern);
// ["FACW", "OBL", "FAC", "FACU", "UPL"]

// Keep recent entities for pronoun resolution
context.entities = entities.slice(-10);
```

### Pronoun Resolution

```typescript
// "Compare them" where them = last 2 entities
if (question.includes("them") && context.entities.length >= 2) {
  enrichedQuery = `[Referring to: ${context.entities.slice(-2).join(" and ")}] ${question}`;
}
```

## Performance Considerations

### Memory Growth

Conversation history grows unbounded without limits:

```typescript
// BAD: Store everything forever
this.session.turns.push(turn);

// GOOD: Limit size
if (this.session.context.topics.length > 10) {
  this.session.context.topics = this.session.context.topics.slice(-10);
}
```

### Token Management

Each question includes history:

```
Question tokens:     ~20
Recent history (2):  ~400
Context summary:     ~50
Total per question:  ~470 tokens

vs. without memory:  ~20 tokens

Trade-off: 23x more tokens, but natural conversation
```
