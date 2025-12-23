# Change Proposal: Add Query Refinement Through Dialog

**Change ID:** `add-query-refinement-dialog`
**Status:** Proposed
**Created:** 2025-12-23

## Why

Users need the ability to iteratively refine SQL queries through natural conversation. Currently, the interactive mode treats each user input as a completely new, independent query generation request with no conversation memory. This forces users to provide complete, detailed queries upfront, which is unnatural and inefficient.

Real-world usage patterns show users want to refine queries conversationally:
- "Show me all users" → "Only from last month" → "Sort by name"
- "Find expensive products" → "Actually, over $100" → "And in stock only"

While the `query-refiner` agent and `sql-refinement` workflow exist in the codebase, they are not integrated into the interactive mode. There is no conversation tracking, no intent detection (new vs refinement), and no multi-turn context preservation.

This change addresses that gap by adding dialog management to enable natural, conversational query refinement—a Phase 2 roadmap feature that will significantly improve user experience.

## What

Enable iterative query refinement through multi-turn dialog in interactive mode, allowing users to provide feedback and refine SQL queries conversationally.

**Current Limitation:**
The interactive mode (`querycraft interactive`) currently treats each user input as an independent query generation request. There is no conversation memory or ability to refine previous queries based on user feedback.

**Existing Foundation:**
- ✅ `query-refiner` agent exists and can refine queries based on feedback
- ✅ `sql-refinement` workflow exists but is not integrated into interactive mode
- ❌ No conversation/dialog management
- ❌ No multi-turn context preservation

**User Need:**
Users often need to iteratively refine queries through natural dialog:
- "Show me all users" → "Only from last month" → "And sort by name"
- "Find expensive products" → "Actually, over $100" → "And in stock only"
- "Top customers" → "Show their email addresses too" → "Limit to 10"

This is marked as a Phase 2 feature in the roadmap (README.md:572).

## Goals

1. **Enable conversational refinement** - Users can provide feedback on previous queries
2. **Preserve conversation context** - Track query history and results across turns
3. **Integrate refinement workflow** - Connect existing refiner agent into interactive mode
4. **Maintain simplicity** - Keep the dialog flow intuitive and natural

## Non-Goals

- Building a general-purpose chatbot (focus on query refinement only)
- Implementing complex conversation branching or undo/redo
- Adding voice or visual interfaces
- Multi-database conversations (scope to single database per session)

## Scope

### New Capabilities

1. **Dialog Manager Agent** (`dialog-manager`)
   - Track conversation history (questions, queries, results)
   - Detect refinement vs new query intents
   - Manage conversation context
   - Provide conversation state to other agents

2. **Interactive Refinement Workflow** (`interactive-refinement-workflow`)
   - Orchestrate dialog flow in interactive mode
   - Route to generation or refinement based on intent
   - Integrate with existing `sql-refinement` workflow
   - Handle conversation state transitions

### Modified Capabilities

- **Interactive CLI mode** - Add conversation memory and refinement support

### Out of Scope

- Modifications to existing `query-refiner` agent (already functional)
- Changes to `sql-refinement` workflow (already functional)
- Modifications to query generation or validation logic

## Success Criteria

1. **Functional:**
   - Users can refine previous queries with natural feedback
   - Conversation history is preserved within a session
   - System correctly distinguishes refinement from new queries

2. **Quality:**
   - Refinement accuracy ≥ 90% for clear feedback
   - Intent detection (new vs refine) ≥ 85% accuracy
   - Context retrieval latency < 50ms

3. **UX:**
   - Dialog flow feels natural and intuitive
   - Users can see conversation history when needed
   - Clear indicators when refining vs generating new query

## Dependencies

- Existing `query-refiner` agent (specs/agents/query-refiner.spec.yaml)
- Existing `sql-refinement` workflow (src/workflows/sql-refinement.ts)
- Interactive CLI infrastructure (src/index.ts:189-279)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Intent detection fails (user wants new query but system thinks it's refinement) | Medium | Provide manual override commands (`/new`, `/refine`) |
| Conversation context grows too large | Low | Limit history to last N turns (e.g., 10) |
| Existing interactive mode behavior changes unexpectedly | Medium | Add feature flag for gradual rollout |

## Alternatives Considered

### Alternative 1: Command-based refinement
- **Approach:** Require explicit commands like `/refine "add limit 10"`
- **Rejected:** Less natural, higher cognitive load for users

### Alternative 2: Stateless refinement prompts
- **Approach:** Users manually provide full context in each refinement
- **Rejected:** Poor UX, defeats purpose of conversational interface

### Alternative 3: Full conversation AI
- **Approach:** Build general-purpose SQL chatbot with NLU
- **Rejected:** Over-engineered, out of scope for Phase 2

## Open Questions

1. **How many conversation turns should we preserve?**
   - Proposal: Last 10 turns (configurable)

2. **Should we support conversation branching (undo/redo)?**
   - Proposal: No, keep it simple for Phase 2

3. **How do we handle ambiguous intent?**
   - Proposal: Default to refinement if last query exists, ask for clarification if confidence is low

4. **Should conversation persist across CLI sessions?**
   - Proposal: No persistence initially (in-memory only), add file-based persistence in future if needed

## Approval

This proposal requires approval before implementation begins.

**Reviewers:**
- [ ] Project maintainer
- [ ] User experience validation

**Approval Date:** _TBD_

---

## Related Documents

- [tasks.md](./tasks.md) - Implementation task breakdown
- [design.md](./design.md) - Architectural design decisions
- [specs/dialog-manager/spec.md](./specs/dialog-manager/spec.md) - Dialog manager spec delta
- [specs/interactive-refinement-workflow/spec.md](./specs/interactive-refinement-workflow/spec.md) - Workflow spec delta
