# Spec-Driven Development for LLM Applications

---

## 1. Overview

**Spec-Driven Development for LLM Applications** is an engineering methodology where formal specifications serve as executable contracts between human developers and AI coding agents. Unlike traditional spec-driven development where specifications guide human implementation, LLM-based spec-driven development treats specifications as **machine-interpretable instructions** that AI agents can directly convert into working code.

This approach represents a fundamental shift in software development:

- **Specifications become executable** - AI agents interpret and implement specs directly, not just as reference documentation
- **Specs serve as agent instructions** - Define what to build, constraints, quality standards, and validation criteria
- **Multi-agent coordination** - Shared specifications enable multiple AI agents to work on different parts of a system cohesively
- **Iterative refinement** - Structured workflows break complex tasks into phases: specify → clarify → plan → implement → validate
- **Quality through constraints** - Specifications include guardrails, safety requirements, and evaluation criteria that AI agents must satisfy
- **Technology independence** - Focus on what to build (requirements) before how to build it (implementation)

The core workflow leverages AI agents throughout:

1. **Constitution** - Establish project principles and development guidelines that govern all decisions
2. **Specification** - Define requirements, user stories, and acceptance criteria in natural language
3. **Clarification** - AI agents identify underspecified areas and ask structured questions
4. **Planning** - Generate technical implementation plans with architecture and tech stack choices
5. **Task Breakdown** - Decompose plans into atomic, ordered tasks with dependencies
6. **Implementation** - AI agents execute tasks, generate code, write tests, and validate against specs
7. **Evaluation** - Validate that implementations meet all specified requirements and quality standards

This methodology is particularly powerful for **LLM application development** where:
- Agent behaviors must be precisely specified
- Prompt templates need structured definitions
- Multi-agent systems require coordination contracts
- Evaluation frameworks must validate LLM outputs
- Iterative refinement is essential for prompt engineering

![Mindmap](../mindmaps/spec-driven-development-mindmap.png)

---

## 2. Core Concepts

### Executable Specification
A formal, machine-readable definition of system behavior that AI coding agents can interpret and implement directly. In LLM contexts, this includes agent instructions, prompt templates, evaluation criteria, and multi-agent coordination contracts. Unlike traditional specifications that guide humans, executable specifications serve as **direct input to AI agents**.

Example specification structure:
- **Purpose** - Why the capability exists (agent goal, prompt objective)
- **Requirements** - Functional and non-functional constraints (model parameters, safety guardrails)
- **Scenarios** - Concrete examples with Given/When/Then format (test cases for LLM outputs)
- **Technical Details** - Implementation constraints (token limits, latency requirements, API contracts)

### Spec Kit Commands (Slash Commands)
Structured commands that guide AI coding agents through the spec-driven development workflow. GitHub Spec Kit provides these as slash commands available in AI coding environments (Claude Code, GitHub Copilot, Cursor, etc.):

- **`/speckit.constitution`** - Define project principles and governance
- **`/speckit.specify`** - Create functional specifications from natural language requirements
- **`/speckit.clarify`** - Identify and resolve underspecified areas through structured questioning
- **`/speckit.plan`** - Generate technical implementation plans with tech stack choices
- **`/speckit.tasks`** - Break down plans into atomic tasks with dependencies
- **`/speckit.implement`** - Execute all tasks to build features according to specs
- **`/speckit.analyze`** - Validate cross-artifact consistency and coverage
- **`/speckit.checklist`** - Generate custom quality checklists for validation

These commands provide guardrails that prevent "vibe coding" (unstructured prompting) and enforce systematic development.

### Spec Delta (Change Proposal)
A structured format for proposing modifications to existing specifications. Used in workflows like OpenSpec to track requirements evolution. Deltas explicitly mark:

- **ADDED Requirements** - New functionality being introduced
- **MODIFIED Requirements** - Changes to existing requirements (before/after format)
- **REMOVED Requirements** - Requirements being deprecated (with rationale)
- **RENAMED Requirements** - Requirement ID changes for better organization

Each delta section includes scenarios demonstrating the changed behavior. This enables AI agents to understand exactly what changed and why, facilitating incremental development and change impact analysis.

### Agent Specification
A formal definition of an autonomous AI agent's capabilities, responsibilities, and constraints. Typically structured as YAML or Markdown with sections:

```yaml
agent:
  name: query-generator
  purpose: Convert natural language questions to SQL queries
  model: claude-3-5-sonnet-20241022
  capabilities:
    - schema_understanding
    - query_generation
    - safety_validation
  tools:
    - schema_loader
    - sql_validator
    - query_executor
  constraints:
    - no_data_modification
    - no_admin_commands
    - max_tokens: 4000
  evaluation:
    - query_correctness >= 0.85
    - safety_validation == 1.0
```

Agent specifications enable declarative agent design where behavior is configured through specs rather than hardcoded.

### Scenario-Based Testing
Testing methodology where each requirement includes concrete scenarios in Given/When/Then format. For LLM applications, scenarios become:

- **Evaluation test cases** - Expected inputs and outputs for LLM agents
- **Prompt validation** - Verify prompt templates produce consistent outputs
- **Multi-agent coordination** - Test agent interactions through scenarios
- **Safety validation** - Ensure guardrails prevent harmful outputs

Scenarios bridge the gap between human-readable requirements and executable tests that validate LLM behavior.

### Constitution (Project Principles)
A foundational document that establishes project governance, development standards, and decision-making criteria. In spec-driven LLM development, the constitution guides all AI agent decisions:

- **Code quality standards** - Testing requirements, documentation expectations, type safety
- **Architecture principles** - Patterns to follow, dependencies to avoid, scalability requirements  
- **User experience guidelines** - Consistency rules, accessibility standards, performance targets
- **AI-specific governance** - Model selection criteria, prompt engineering standards, safety requirements

The constitution is referenced by AI agents when making implementation decisions, ensuring consistency across all generated code.

### OpenSpec Workflow
A spec-driven development workflow system that structures changes as proposals validated before implementation. Key stages:

1. **Proposal Creation** - Define change scope with spec deltas, scenarios, and task breakdown
2. **Validation** - Verify proposal completeness, consistency, and feasibility
3. **Approval** - Human review before AI agents implement
4. **Implementation** - AI agents execute tasks following spec deltas
5. **Closure** - Merge spec deltas into main specs, archive change artifacts

OpenSpec emphasizes separating "what to change" (proposal) from "how to change it" (implementation), enabling better planning and validation.

### Prompt Specification
Formal definition of an LLM prompt template including structure, variables, constraints, and expected outputs. Prompt specs treat prompts as first-class artifacts:

```markdown
# Prompt: SQL Query Generator

## Purpose
Convert natural language questions to valid SQL queries with safety validation.

## Template Structure
- System message: Role, capabilities, constraints
- Schema context: CREATE TABLE statements, sample data
- Few-shot examples: 3-5 representative query pairs
- User question: Natural language input
- Output format: JSON with query, explanation, confidence

## Variables
- {schema}: Database schema (CREATE TABLE statements)
- {sample_data}: Representative column values
- {question}: User's natural language question
- {examples}: Few-shot query pairs

## Constraints
- Token budget: Max 4000 tokens (system + context + question)
- Temperature: 0.0 for deterministic outputs
- Model: claude-3-5-sonnet-20241022
- Safety: Must reject data modification attempts

## Expected Outputs
{
  "query": "SELECT ...",
  "explanation": "...",
  "confidence": 0.95,
  "tables_used": ["users", "orders"]
}

## Scenarios
### Scenario: Simple SELECT query
**Given:** Question "How many users signed up last month?"
**When:** Prompt is executed with e-commerce schema
**Then:** Returns valid SQL with WHER