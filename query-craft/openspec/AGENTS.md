# OpenSpec Instructions

Instructions for AI coding assistants using OpenSpec for spec-driven development.

## TL;DR Quick Checklist

- Search existing work: `openspec spec list --long`, `openspec list` (use `rg` only for full-text search)
- Decide scope: new capability vs modify existing capability
- Pick a unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Scaffold: `proposal.md`, `tasks.md`, `design.md` (only if needed), and delta specs per affected capability
- Write deltas: use `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`; include at least one `#### Scenario:` per requirement
- Validate: `openspec validate [change-id] --strict` and fix issues
- Request approval: Do not start implementation until proposal is approved

## Three-Stage Workflow

### Stage 1: Creating Changes

Create proposal when you need to:

- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns
- Optimize performance (changes behavior)
- Update security patterns

Triggers (examples):

- "Help me create a change proposal"
- "Help me plan a change"
- "Help me create a proposal"
- "I want to create a spec proposal"
- "I want to create a spec"

Loose matching guidance:

- Contains one of: `proposal`, `change`, `spec`
- With one of: `create`, `plan`, `make`, `start`, `help`

Skip proposal for:

- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

**Workflow**

1. Review `openspec/project.md`, `openspec list`, and `openspec list --specs` to understand current context.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, optional `design.md`, and spec deltas under `openspec/changes/<id>/`.
3. Draft spec deltas using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement.
4. Run `openspec validate <id> --strict` and resolve any issues before sharing the proposal.

### Stage 2: Implementing Changes

Track these steps as TODOs and complete them one by one.

1. After proposal approval, break work into incremental steps (tracked by TODOs).
2. Run `openspec spec apply <change-id>` to merge spec deltas into main specs.
3. Create core entities (types, interfaces, schemas).
4. Implement new or modified behavior following specs and `project.md` conventions.
5. Write tests for all requirements (and scenarios).
6. Run `openspec validate [change-id]` before closing the change.

When implementing complex changes, prefer small, incremental commits that can be validated at each step.

### Stage 3: Closing Changes

After successfully implementing and validating the change:

1. Ensure all code is committed
2. Run final validation: `openspec validate <change-id>`
3. Archive the change: `openspec close <change-id>`

Once archived, spec deltas are removed and changes are merged into the main specs. Do not delete or edit closed changes manually.

## OpenSpec Command Reference

### Search & Discovery

- `openspec list` - List all changes (active and closed)
- `openspec list --specs` - List capability specs
- `openspec spec list --long` - List specs with descriptions
- `rg "search term"` - Full-text search across all specs (when semantic search not enough)

### Change Management

- `openspec new <change-id>` - Create a new change proposal
- `openspec validate <change-id>` - Validate a change
- `openspec validate <change-id> --strict` - Validate with strict checks
- `openspec spec apply <change-id>` - Merge spec deltas into main specs
- `openspec close <change-id>` - Archive completed change

### Spec Operations

- `openspec spec new <capability-id>` - Create a new capability spec
- `openspec spec show <capability-id>` - Show a capability spec
- `openspec spec show <capability-id> --with-changes` - Show spec with pending changes

## Writing Effective Specs

### Structure

Each capability spec (agent, tool, workflow, prompt) has:

- **Identifier** - Unique kebab-case name
- **Purpose** - Why this capability exists
- **Requirements** - Functional and non-functional requirements
- **Scenarios** - Concrete examples of usage
- **Technical Details** - Implementation constraints, dependencies, data structures

### Delta Spec Format

When modifying existing capabilities, use delta specs:

```markdown
# <Capability Name> Δ

## ADDED Requirements

### Requirement ID: <REQ-ID>

<Requirement description>

#### Scenario: <scenario name>

Given: <preconditions>
When: <action>
Then: <expected outcome>

## MODIFIED Requirements

### Requirement ID: <REQ-ID>

**Before:**
<old requirement text>

**After:**
<new requirement text>

#### Scenario: <scenario name>

...

## REMOVED Requirements

### Requirement ID: <REQ-ID>

<requirement being removed>
Reason: <why it's being removed>

## RENAMED Requirements

### <OLD-REQ-ID> → <NEW-REQ-ID>

Reason: <why the rename>
```

### Best Practices

- **One requirement per ID** - Keep requirements atomic and testable
- **Always include scenarios** - At least one scenario per requirement
- **Be specific** - Avoid vague language like "should be fast" or "user-friendly"
- **Reference domain context** - Link to `project.md` sections when needed
- **Specify data structures** - Include types, schemas, and validation rules
- **Document error cases** - Specify what happens when things go wrong

## Capability Types

### Agents

Autonomous components that make decisions and take actions.

- Location: `specs/agents/<agent-id>.md`
- Should specify: goals, capabilities, decision criteria, tools they can use

### Tools

Functions that agents can invoke to perform actions.

- Location: `specs/tools/<tool-id>.md`
- Should specify: inputs, outputs, side effects, error conditions

### Workflows

Multi-step processes that coordinate agents and tools.

- Location: `specs/workflows/<workflow-id>.md`
- Should specify: steps, decision points, failure handling

### Prompts

LLM prompt templates with expected inputs and outputs.

- Location: `specs/prompts/<prompt-id>.md`
- Should specify: variables, tone, constraints, example outputs

## Implementation Guidelines

### Code Organization

- Create code in appropriate directories matching `project.md` structure
- Use TypeScript types that mirror spec data structures
- Follow naming conventions from `project.md`

### Testing

- Write tests for each scenario in specs
- Use scenario names as test case names
- Validate both happy paths and error conditions

### Documentation

- Keep inline code comments minimal (specs are the docs)
- Update `project.md` when adding new patterns or conventions
- Link back to specs in complex implementations

## Error Recovery

### Invalid Specs

- Run `openspec validate <change-id> --strict`
- Fix issues one by one (start with structural errors)
- Re-validate until clean

### Missing Context

- Read `project.md` for domain and technical context
- Use `openspec spec list --long` to understand existing capabilities
- Use `rg` to find similar implementations

### Conflicting Changes

- Review active changes: `openspec list`
- Coordinate with other changes or wait for them to close
- Consider creating a dependent change

---

## Research-Grounded Prompting Policy (Text-to-SQL)

This project's natural-language-to-SQL prompting strategy is informed by:

Chang, Shuaichen, and Eric Fosler-Lussier (2023).  
_How to Prompt LLMs for Text-to-SQL: A Study in Zero-shot, Single-domain, and Cross-domain Settings_.  
[arXiv:2305.11853](https://arxiv.org/abs/2305.11853)

A local copy of the paper is included in `/docs/references/chang_fosler_lussier_2023_text_to_sql.pdf`.

### Required Prompting Principles

Unless explicitly overridden, agents MUST follow these principles:

1. **Schema Representation**

   - Prefer SQL `CREATE TABLE` format when providing schema context.
   - Explicitly include foreign key relationships when available.

2. **Database Content Exposure**

   - Include representative table content when feasible.
   - Prefer **column-wise distinct values** over full row dumps to maximize value coverage.

3. **Prompt Length Discipline**

   - Do not maximize context window usage.
   - In cross-domain prompting, avoid exceeding ~70% of the model's context length unless justified.

4. **Few-Shot Strategy**

   - When operating in a single-domain setting, prefer in-domain examples.
   - Do NOT assume demonstrations replace the need for database content.

5. **Normalization**
   - Normalize schema and SQL formatting (case, spacing) for consistency and token efficiency.
   - Preserve original casing for literal values.

Any deviation from these principles MUST be documented with a clear justification.
