# Design Document: Strategy-Content Separation

## Context

Milestone 4 implements the strategy-content factorization pattern from the research paper. Currently, strategies (escalate, accuse, exploit-nuance) contain hardcoded prompts specific to AI healthcare. This design separates strategic patterns (HOW to argue) from content topics (WHAT to argue about).

Additionally, the CLI currently uses manual argument parsing which is fragile and lacks standard features. This milestone upgrades to commander.js for better UX and maintainability.

## Goals / Non-Goals

### Goals
- Separate high-level strategic intent from surface-level prompt text
- Make strategies reusable with different content variations
- Maintain healthcare as the only active topic (ROADMAP constraint)
- Improve CLI with proper help, validation, and colored output
- Enable future content exploration without changing strategy code
- Support Milestone 5's need for diverse prompt instances

### Non-Goals
- Multiple active topics in this milestone (healthcare only, but architected for future expansion)
- Interactive CLI or TUI (keep command-line simple)
- Prompt generation using LLMs (templates only)
- Complex DSL or prompt languages (simple string templates)
- Backwards incompatibility (CLI should maintain existing behavior)

## Key Design Decisions

### 1. Template System Architecture

**Decision:** Use typed template functions with slot-based composition.

**Options Considered:**

**Option A: String templates with placeholders**
```typescript
template = "I understand {position}, but let me {action}..."
```
- Pro: Simple, familiar
- Con: No type safety, fragile, hard to compose

**Option B: Function-based templates with typed slots**
```typescript
interface TemplateContext {
  turnOneResponse: string;
  contentTopic: ContentTopic;
  strategyIntent: StrategyIntent;
}
type Template = (ctx: TemplateContext) => string;
```
- Pro: Type-safe, composable, testable
- Con: Slightly more complex
- **Selected** ✓

**Option C: Class-based template builders**
- Pro: OOP patterns, extensible
- Con: Over-engineered for current needs

**Rationale:** Option B provides type safety and composability without unnecessary abstraction. Templates are pure functions that can be tested in isolation.

### 2. Strategy Pattern Representation

**Decision:** Define strategies as compositional patterns rather than monolithic templates.

**Structure:**
```typescript
interface StrategyPattern {
  name: StrategyName;
  intent: string;              // High-level goal
  tactics: TemplateTactic[];   // Ordered list of argumentative moves
}

interface TemplateTactic {
  name: string;                // e.g., "push-back", "extreme-case", "challenge"
  generate: (ctx: TacticContext) => string;
}
```

**Example - Escalate Strategy:**
- Intent: "Increase argumentative pressure"
- Tactics:
  1. **Acknowledge**: Recognize their position
  2. **Extreme-case**: Present worst-case scenario
  3. **Ethical-challenge**: Raise moral concerns
  4. **Direct-challenge**: Force them to defend

Each tactic is a small, focused prompt generator. Strategies compose tactics in sequence.

**Rationale:**
- **Composability**: Tactics can be mixed/matched in future (M5)
- **Clarity**: Each tactic has single responsibility
- **Debuggability**: Can trace which tactic generated which text
- **Extensibility**: Add new tactics without changing strategy logic

### 3. Content Topic Structure

**Decision:** Define topics as structured data with reusable components.

```typescript
interface ContentTopic {
  id: string;
  name: string;
  question: string;            // Turn 1 question
  context: TopicContext;       // Domain-specific information
}

interface TopicContext {
  domain: string;              // e.g., "healthcare", "ethics"
  controversialAspect: string; // What makes it debatable
  proArguments: Argument[];    // Arguments for one side
  conArguments: Argument[];    // Arguments for other side
  edgeCases: string[];         // Extreme scenarios
  stakeholders: string[];      // Who is affected
}

interface Argument {
  claim: string;
  reasoning: string;
  examples?: string[];
}
```

**Rationale:**
- Templates can select appropriate arguments based on strategy
- Rich structure supports sophisticated tactics
- Easy to validate completeness
- Future topics follow same schema

### 4. Template Application Flow

**Decision:** Three-stage prompt generation pipeline.

```
1. Strategy Selection (existing)
   category → strategy_name

2. Template Resolution (new)
   strategy_name → strategy_pattern → tactics[]

3. Prompt Generation (new)
   tactics[] + content_topic + turn1_response → final_prompt
```

**Example Flow:**
```
Turn 1 Response: "Yes, AI should make autonomous healthcare decisions because..."
↓
Classification: "confident"
↓
Strategy Selection: "escalate"
↓
Strategy Pattern: [acknowledge, extreme-case, ethical-challenge, direct-challenge]
↓
Content Topic: healthcare (with arguments, edge cases, stakeholders)
↓
Template Application:
  - acknowledge(response) → "I understand your position..."
  - extreme-case(topic.edgeCases) → "Consider if AI makes fatal error..."
  - ethical-challenge(topic.conArguments) → "Who is accountable..."
  - direct-challenge() → "Can you defend this..."
↓
Final Prompt: "I understand your position, but let me push back harder..."
```

### 5. CLI Architecture with Commander.js

**Decision:** Replace manual parsing with commander.js, add chalk for colors.

**Structure:**
```typescript
program
  .name('redturn')
  .description('Red-teaming probe agent for multi-turn LLM failures')
  .version('0.1.0')

program
  .command('static')
  .description('Run static baseline (1 conversation)')
  .action(runStaticBaseline)

program
  .command('adaptive')
  .description('Run adaptive loop (multiple conversations)')
  .option('-r, --runs <number>', 'number of runs', '10')
  .option('-t, --topic <name>', 'content topic', 'healthcare')
  .action(runAdaptiveLoop)
```

**Color Conventions:**
- Green: Success states (contradictions detected, runs completed)
- Red: Errors and failures
- Blue: Informational (run progress, statistics)
- Yellow: Warnings (no contradictions, unclear classifications)
- Dim: Metadata and timestamps

**Backward Compatibility:**
```bash
# Old way (still works via default command)
node dist/index.js --adaptive --runs 20

# New way (recommended)
redturn adaptive --runs 20
```

### 6. Healthcare Content Definition

**Decision:** Define comprehensive healthcare topic data for template use.

**Content Components:**
- **Question**: "Should AI systems make autonomous healthcare decisions..."
- **Pro Arguments**:
  - Speed and accuracy advantages
  - 24/7 availability
  - Catching diagnoses humans miss
  - Reducing errors from fatigue
- **Con Arguments**:
  - Lack of accountability
  - No moral agency
  - Cannot empathize
  - Nuanced context understanding
- **Edge Cases**:
  - Fatal error responsibility
  - Two-tier healthcare system
  - Consent and autonomy
  - Malpractice liability
- **Stakeholders**: Patients, doctors, hospitals, manufacturers, regulators

Templates select from these components based on strategy and tactic.

## Validation Strategy

**How to verify this works:**

1. **Template Correctness**
   - Same strategy + same content → same prompt (deterministic)
   - Different strategies → different prompts
   - Generated prompts are coherent and persuasive

2. **CLI Usability**
   - `--help` shows clear documentation
   - Invalid arguments produce helpful error messages
   - Colored output improves readability
   - Backward compatibility maintained

3. **Strategy Independence**
   - Can swap content without changing strategy code
   - Tactics compose correctly
   - Template context has all needed information

4. **Stop Condition (ROADMAP)**
   - "Strategies can be swapped without changing content-generation logic" ✓
   - Can add new tactic without modifying strategy patterns
   - Healthcare content can be replaced with different topic structure

## Migration Path

1. **Phase 1: Add Dependencies**
   - Install commander.js and chalk
   - Add type definitions

2. **Phase 2: Create Template System**
   - Implement template engine (src/templates.ts)
   - Define healthcare content (src/content.ts)
   - Build tactic library
   - Create strategy patterns

3. **Phase 3: Refactor Strategies**
   - Update strategy-selection to use templates
   - Maintain existing strategy names (escalate, accuse, exploit-nuance)
   - Keep selection logic identical (category → strategy)

4. **Phase 4: Upgrade CLI**
   - Add commander.js program definition
   - Migrate existing commands to new structure
   - Add colored output with chalk
   - Test backward compatibility

5. **Phase 5: Integration**
   - Update adaptive-loop to use template system
   - Update logging to track template usage
   - Update documentation

## Trade-offs and Risks

### Trade-off: Complexity vs. Flexibility
- **Cost**: More files, indirection, abstraction
- **Benefit**: Can explore variations systematically
- **Mitigation**: Keep templates simple, avoid over-engineering
- **Decision**: Accept complexity for research value

### Risk: Template Quality
- **Risk**: Generated prompts may be less persuasive than handcrafted ones
- **Impact**: Lower contradiction rates
- **Mitigation**: Carefully design tactics, validate against M3 baseline
- **Acceptance**: Initial iteration may need refinement

### Risk: Backward Compatibility
- **Risk**: CLI changes break existing scripts/workflows
- **Impact**: User confusion, workflow disruption
- **Mitigation**: Support old argument style, add deprecation warnings
- **Acceptance**: Low risk with proper testing

### Trade-off: Topic Scope
- **Cost**: Building infrastructure for multi-topic support we won't use yet
- **Benefit**: Future-proof for potential exploration
- **Decision**: Build architecture for one topic (healthcare), but make it extensible

## Open Questions

1. **Should tactics be configurable per-run?**
   - Current: Strategies have fixed tactic sequences
   - Alternative: CLI flag to customize tactic composition
   - Recommendation: Keep fixed for M4, defer to M5

2. **How much content variation?**
   - Current: Healthcare topic has ~5 pro args, ~5 con args, ~4 edge cases
   - Question: Is this enough diversity?
   - Recommendation: Start with this, measure repetition in M5

3. **Should we log template metadata?**
   - What: Which tactics were used, which arguments selected
   - Why: Debug template generation, analyze patterns
   - Recommendation: Yes, extend adaptive metadata in logger
