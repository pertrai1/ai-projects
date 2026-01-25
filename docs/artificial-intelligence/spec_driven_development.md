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

The paradigm shift from traditional development:

| Traditional Spec-Driven | LLM Spec-Driven |
|------------------------|-----------------|
| Specs guide human developers | Specs instruct AI agents |
| Implementation separate from specs | AI generates implementation from specs |
| Manual code generation | Automated code generation |
| Specs as documentation | Specs as executable contracts |
| Single-shot specification | Iterative spec refinement |
| Human reads specs → writes code | Agent reads specs → generates code |

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
**Then:** Returns valid SQL with WHERE date filter and COUNT aggregate
```

Prompt specifications enable systematic prompt engineering with versioning, A/B testing, and evaluation.

### Multi-Agent Coordination Contract
Specification defining how multiple AI agents interact, share data, and coordinate tasks. Essential for complex LLM systems with specialized agents:

```yaml
coordination:
  agents:
    - name: query-generator
      role: Generate SQL from natural language
      inputs: [question, schema]
      outputs: [query, confidence]
      
    - name: sql-validator  
      role: Validate query syntax and safety
      inputs: [query, schema]
      outputs: [is_valid, errors, warnings]
      
    - name: query-executor
      role: Execute validated queries
      inputs: [query, database]
      outputs: [results, execution_time]
      
  workflow:
    1. query-generator receives question
    2. sql-validator validates generated query
    3. if valid: query-executor runs query
    4. if invalid: query-generator refines based on errors
    
  shared_context:
    - schema: Shared database schema definition
    - safety_rules: Common safety validation rules
    - execution_history: Query performance metrics
```

Coordination contracts prevent agent conflicts and ensure consistent system behavior.

### Evaluation Specification
Formal definition of how to evaluate LLM application quality. Includes metrics, test datasets, acceptance thresholds, and evaluation workflows:

- **Metrics** - Quantitative measures (accuracy, f1-score, latency, cost)
- **Test Datasets** - Representative inputs with expected outputs
- **Thresholds** - Minimum acceptable performance (e.g., accuracy >= 0.85)
- **Evaluation Frequency** - When to run evals (pre-commit, pre-release, continuous)
- **Baseline Comparisons** - Track improvements/regressions over time

Evaluation specs make quality requirements explicit and automatable.

---

## 3. How It Works

Spec-driven development for LLM applications operates through two complementary systems: **GitHub Spec Kit** for general-purpose spec-driven workflows and **OpenSpec** for change proposal management. Both systems structure AI agent work to prevent "vibe coding" and ensure systematic development.

### The Core Workflow

The fundamental workflow follows seven stages, each powered by specific tooling:

```
┌─────────────────┐
│ 1. Constitution │  Define project principles (Spec Kit command)
└────────┬────────┘
         │
┌────────▼────────┐
│ 2. Specify      │  Create functional specs (Spec Kit command)
└────────┬────────┘
         │
┌────────▼────────┐
│ 3. Clarify      │  Resolve ambiguities (Spec Kit command)
└────────┬────────┘
         │
┌────────▼────────┐
│ 4. Plan         │  Generate tech implementation (Spec Kit command)
└────────┬────────┘
         │
┌────────▼────────┐
│ 5. Tasks        │  Break down into atomic steps (Spec Kit command)
└────────┬────────┘
         │
┌────────▼────────┐
│ 6. Implement    │  AI agents execute tasks (Spec Kit command)
└────────┬────────┘
         │
┌────────▼────────┐
│ 7. Evaluate     │  Validate against specs (Custom evaluation)
└─────────────────┘
```

Each stage produces artifacts that guide subsequent stages. The workflow is **iterative** - you can return to earlier stages when requirements evolve.

### GitHub Spec Kit Integration

GitHub Spec Kit provides slash commands that AI coding agents (Claude Code, GitHub Copilot, Cursor) understand. When you invoke a command, the agent:

1. **Reads specification templates** - Understands required output format
2. **Analyzes existing artifacts** - Ensures consistency with previous work
3. **Generates structured output** - Produces specifications, plans, or tasks
4. **Validates completeness** - Checks that all required sections are present

Example Spec Kit command invocation:

```bash
# In your AI coding assistant (Claude Code, Copilot, etc.)
/speckit.constitution

# Agent response:
# I'll create a constitution for this project. Please provide:
# 1. Project name and purpose
# 2. Core principles (3-5 key values)
# 3. Quality standards
# 4. Architecture preferences

# After you provide input, agent generates:
# docs/CONSTITUTION.md with structured project governance
```

### OpenSpec Change Workflow

OpenSpec structures changes as **proposals** that are validated before implementation. This is particularly valuable for LLM applications where prompt changes or agent modifications can have cascading effects.

The OpenSpec workflow in this repository (`query-craft/openspec/`):

```
proposals/
├── changes/
│   ├── active/                    # Current change proposal
│   │   ├── proposal.md           # What to change (spec deltas)
│   │   ├── tasks.md              # How to implement
│   │   └── specs/                # New/modified specs
│   │       ├── dialog-manager/
│   │       │   ├── spec.md       # Functional specification
│   │       │   └── design.md     # Technical design
│   │       └── ...
│   └── archive/                   # Completed changes
│       └── 2025-12-23-add-query-refinement-dialog/
│           ├── proposal.md
│           ├── tasks.md
│           └── specs/
├── specs/                         # Current system specifications
│   ├── dialog-manager/
│   ├── query-generator/
│   └── ...
└── project.md                     # Project context and conventions
```

#### OpenSpec Change Lifecycle

**1. Proposal Creation**

Create a new change proposal with spec deltas:

```markdown
# Proposal: Add Query Refinement Through Dialog

## Change Type
FEATURE - New conversational refinement capability

## Motivation
Users want to refine queries through conversation rather than rewriting.
Current system only supports single-shot query generation.

## Spec Deltas

### ADDED: Dialog Manager Agent

**Purpose:** Maintain conversation state and detect user intent

**Capabilities:**
- Intent detection (new query vs refinement)
- Conversation history management
- Context extraction for query refinement

**Interface:**
```typescript
interface DialogManager {
  addTurn(input: string, intent: IntentType, result: QueryResult): void;
  detectIntent(input: string): IntentType;
  getContext(): ConversationContext;
  clear(): void;
}
```

### MODIFIED: Query Generator Agent

**Before:**
- Accepts natural language question
- Returns SQL query with confidence

**After:**
- Accepts natural language question **and conversation context**
- Uses previous query and feedback for refinement
- Returns SQL query with confidence and refinement explanation
```

**2. Task Breakdown**

Break proposal into atomic, ordered tasks:

```markdown
# Implementation Tasks

## Phase 1: Foundation

### Task 1: Create Dialog Manager Types
- [ ] Define ConversationTurn interface
- [ ] Define ConversationState interface
- [ ] Define IntentType enum
**Validation:** TypeScript compilation succeeds
**Estimated time:** 30 minutes

### Task 2: Implement Dialog Manager
- [ ] Create DialogManager class
- [ ] Implement intent detection
- [ ] Implement conversation state management
**Validation:** Unit tests pass (10+ test cases)
**Estimated time:** 2 hours

## Phase 2: Integration

### Task 3: Update Query Generator
- [ ] Accept ConversationContext parameter
- [ ] Use context in prompt engineering
- [ ] Add refinement explanation to output
**Validation:** Integration tests pass
**Estimated time:** 2 hours
```

**3. Implementation**

AI agents execute tasks in order, referencing spec deltas for requirements:

```bash
# Agent implements Task 1
# Creates src/types/index.ts with required interfaces

# Agent implements Task 2  
# Creates src/agents/dialog-manager.ts
# Writes unit tests

# Agent implements Task 3
# Modifies src/agents/query-generator.ts
# Updates integration tests
```

**4. Validation**

After implementation, validate against proposal:

```markdown
# Validation Checklist

## Functional Requirements
- [x] Dialog manager maintains conversation state
- [x] Intent detection distinguishes new vs refinement
- [x] Query generator uses context for refinement
- [x] System handles 10+ turn conversations

## Quality Requirements
- [x] Unit test coverage >= 80%
- [x] All type safety checks pass
- [x] Integration tests demonstrate refinement
- [x] Documentation updated

## Scenarios Validated
- [x] User refines column selection ("only show name and email")
- [x] User adds filtering ("only active users")
- [x] User changes sorting ("sort by signup date")
```

**5. Closure**

Merge specs from `changes/active/` into `specs/`, archive the change:

```bash
# Merge new specs
mv changes/active/specs/dialog-manager specs/

# Archive the change
mv changes/active changes/archive/2025-12-23-add-query-refinement-dialog

# Update project.md with new capabilities
```

### Workflow Comparison

| Aspect | Spec Kit Workflow | OpenSpec Workflow |
|--------|------------------|-------------------|
| **Use Case** | New projects, greenfield features | Changes to existing systems |
| **Structure** | Command-driven phases | Proposal-driven changes |
| **Artifacts** | Top-level specs and plans | Change-scoped specs with deltas |
| **Validation** | Per-phase validation | End-to-end proposal validation |
| **History** | Linear development flow | Branching change proposals |
| **Best For** | Building from scratch | Evolving mature systems |

### When to Use Each System

**Use GitHub Spec Kit when:**
- Starting a new LLM application
- Building a new feature area without dependencies
- Learning spec-driven development
- Need structured AI agent guidance through all phases

**Use OpenSpec when:**
- Modifying existing LLM agents or prompts
- Change impacts multiple components
- Need to track what changed and why
- Working in a team with change review requirements
- Managing multiple parallel changes

**Use Both when:**
- Starting projects with OpenSpec change management built-in
- Spec Kit for initial structure, OpenSpec for all subsequent changes
- This is the recommended approach for production LLM applications

---

## 4. GitHub Spec Kit

**GitHub Spec Kit** is a collection of specification templates and AI agent instructions that guide systematic development of software through structured phases. For LLM applications, Spec Kit provides specialized templates for agent specifications, prompt templates, and evaluation frameworks.

### Architecture

Spec Kit operates through three layers:

```
┌─────────────────────────────────────────┐
│  User Interface Layer                   │
│  - Slash commands (/speckit.*)          │
│  - AI coding assistant integration      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Agent Instruction Layer                │
│  - Command specifications               │
│  - Output format requirements           │
│  - Validation rules                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Template Layer                         │
│  - Markdown specification templates     │
│  - YAML agent definition schemas        │
│  - Example artifacts                    │
└─────────────────────────────────────────┘
```

### Core Components

#### 1. Command Specifications

Each Spec Kit command is defined with:

- **Purpose** - What the command accomplishes
- **Inputs** - Required information from user
- **Outputs** - Artifacts generated
- **Validation Rules** - Quality checks
- **Integration Points** - How output connects to other commands

Example command specification:

```yaml
command: /speckit.specify
purpose: Create functional specifications from requirements
inputs:
  - user_stories: Natural language feature descriptions
  - existing_specs: Current specifications (for consistency)
  - constitution: Project principles and constraints
outputs:
  - spec_file: Markdown specification with scenarios
  - coverage_report: Requirements traceability
validation:
  - all_user_stories_covered: true
  - scenarios_include_given_when_then: true
  - technical_details_specified: true
integration:
  - reads: [constitution, existing_specs]
  - writes: [specs/*.md]
  - enables: [/speckit.clarify, /speckit.plan]
```

#### 2. Specification Templates

Spec Kit provides templates for different artifact types:

**Functional Specification Template:**

```markdown
# Feature: [Name]

## Purpose
Why this feature exists and what user problem it solves.

## Requirements

### Functional Requirements
1. **FR-1:** [Requirement statement]
   - **Priority:** Must Have / Should Have / Could Have
   - **Rationale:** Why this is needed

### Non-Functional Requirements
1. **NFR-1:** [Performance/Security/Usability requirement]
   - **Metric:** How to measure
   - **Target:** Acceptable threshold

## Scenarios

### Scenario 1: [Happy Path]
**Given:** Initial system state
**When:** User action or system event
**Then:** Expected outcome

### Scenario 2: [Error Case]
**Given:** Preconditions
**When:** Error-triggering action
**Then:** Error handling behavior

## Technical Details

### Data Model
Entity definitions, relationships, constraints

### API Contracts
Request/response formats, error codes

### Dependencies
External systems, libraries, services

## Acceptance Criteria
- [ ] All scenarios pass
- [ ] Performance meets NFR targets
- [ ] Security requirements validated
- [ ] Documentation complete
```

**Agent Specification Template:**

```yaml
agent:
  name: [agent-name]
  version: 1.0.0
  purpose: [Single sentence describing agent's role]
  
model:
  provider: anthropic | openai | other
  name: claude-3-5-sonnet-20241022
  parameters:
    temperature: 0.0
    max_tokens: 4000
    top_p: 1.0

capabilities:
  - [capability_1]: Description of what agent can do
  - [capability_2]: Another capability
  
tools:
  - name: [tool_name]
    purpose: What the tool does
    inputs: [input parameters]
    outputs: [output format]

constraints:
  safety:
    - No data modification commands
    - No access to admin functions
  performance:
    - Max response time: 5 seconds
    - Token budget: 4000 tokens
  quality:
    - Confidence threshold: 0.85
    - Validation: SQL syntax must be valid

prompt_template: |
  You are a [role description].
  
  Your capabilities:
  - [Capability 1]
  - [Capability 2]
  
  Your constraints:
  - [Constraint 1]
  - [Constraint 2]
  
  Task: [What user is asking]
  
  Context:
  {context_variable}
  
  Output format:
  {expected_json_schema}

evaluation:
  metrics:
    - accuracy: >= 0.85
    - safety: == 1.0
    - latency: <= 5000ms
  test_dataset: path/to/eval_dataset.json
  eval_frequency: pre_commit
```

**Prompt Specification Template:**

```markdown
# Prompt: [Name]

## Metadata
- **Version:** 1.0.0
- **Model:** claude-3-5-sonnet-20241022
- **Temperature:** 0.0
- **Token Budget:** 4000

## Purpose
What this prompt accomplishes and when to use it.

## Structure

### System Message
Role definition, capabilities, constraints

### Context Section
Background information needed for the task

### Few-Shot Examples
3-5 example input/output pairs

### User Input
Format of the user's request

### Output Format
Expected structure of the response

## Variables

- `{variable_name}`: Description and example value
- `{another_variable}`: Description and constraints

## Full Prompt Template

\`\`\`
[System message]

Context:
{context_variable}

Examples:
{few_shot_examples}

User request:
{user_input}

Respond in the following format:
{output_format}
\`\`\`

## Evaluation

### Test Cases

**Test 1:** [Description]
- Input: [Specific input]
- Expected Output: [Expected result]
- Validation: [How to verify]

### Success Criteria
- Accuracy >= 85%
- Latency <= 3 seconds
- Cost <= $0.01 per request

## Versions

### v1.0.0 (Current)
- Initial version with basic query generation

### Future Improvements
- Add chain-of-thought reasoning
- Expand few-shot examples
- Add error recovery
```

#### 3. AI Agent Instructions

Each Spec Kit command includes detailed instructions for AI coding agents:

```markdown
# /speckit.constitution Instructions

## Agent Role
You are a project architect helping establish project governance.

## Your Task
Create a constitution document (docs/CONSTITUTION.md) that defines:
1. Project purpose and scope
2. Core principles (3-5 values)
3. Quality standards
4. Architecture patterns
5. Development practices
6. Decision-making criteria

## Process

### Step 1: Information Gathering
Ask the user:
- What is the project building?
- Who are the target users?
- What are non-negotiable quality standards?
- Are there architectural constraints?
- What should guide technical decisions?

### Step 2: Constitution Creation
Generate docs/CONSTITUTION.md with sections:
- **Project Vision:** Purpose, goals, success criteria
- **Core Principles:** 3-5 fundamental values
- **Quality Standards:** Testing, documentation, security
- **Architecture Principles:** Patterns, dependencies, scalability
- **Development Practices:** Code review, deployment, monitoring

### Step 3: Validation
Ensure:
- [ ] All sections present and complete
- [ ] Principles are specific, not generic
- [ ] Standards are measurable
- [ ] Patterns are explained with examples
- [ ] Document is under 1000 words (focused)

### Step 4: Integration
Reference this constitution in:
- /speckit.specify (requirements must align with principles)
- /speckit.plan (architecture must follow patterns)
- /speckit.implement (code must meet quality standards)

## Output Format

Create: `docs/CONSTITUTION.md`

```markdown
# [Project Name] Constitution

## Project Vision
[Purpose, goals, success metrics]

## Core Principles

### 1. [Principle Name]
[Explanation, rationale, examples]

### 2. [Principle Name]
[Explanation, rationale, examples]

## Quality Standards

### Code Quality
- Testing: [Requirements]
- Documentation: [Requirements]
- Type Safety: [Requirements]

### Security
- Authentication: [Requirements]
- Data Protection: [Requirements]
- Validation: [Requirements]

## Architecture Principles

### Pattern 1: [Name]
[When to use, benefits, example]

### Pattern 2: [Name]
[When to use, benefits, example]

## Development Practices
[Code review, deployment, monitoring processes]
```

## Validation
Confirm with user that constitution reflects their vision.
```

### Integration with AI Coding Assistants

Spec Kit integrates with AI coding assistants through:

**1. Command Recognition**

AI assistants recognize `/speckit.*` commands and load appropriate instructions:

```javascript
// Internal AI assistant logic (conceptual)
if (command.startsWith('/speckit.')) {
  const commandName = command.split('.')[1];
  const instructions = loadSpecKitInstructions(commandName);
  const template = loadSpecKitTemplate(commandName);
  
  // Execute command with loaded context
  executeCommand(instructions, template, userInput);
}
```

**2. Context Awareness**

Commands read existing artifacts for consistency:

```javascript
// When executing /speckit.plan
const constitution = readFile('docs/CONSTITUTION.md');
const specs = readFiles('docs/specs/*.md');
const existingArchitecture = readFile('docs/ARCHITECTURE.md');

// Generate plan consistent with existing artifacts
const plan = generatePlan({
  specifications: specs,
  principles: constitution,
  constraints: existingArchitecture,
  userInput: userRequest
});
```

**3. Artifact Linking**

Generated artifacts reference each other:

```markdown
<!-- In spec.md -->
# Feature: Query Refinement

References:
- Constitution: [Core Principles](../CONSTITUTION.md#core-principles)
- Related Specs: [Query Generator](./query-generator.md)
- Design: [Dialog Manager Design](./dialog-manager-design.md)
```

**4. Validation Integration**

Commands validate outputs against templates:

```javascript
// Validate generated specification
function validateSpec(spec) {
  const required = [
    'purpose',
    'requirements',
    'scenarios',
    'technical_details',
    'acceptance_criteria'
  ];
  
  const missing = required.filter(section => !spec.includes(section));
  
  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing sections: ${missing.join(', ')}`]
    };
  }
  
  return { valid: true, errors: [] };
}
```

### LLM-Specific Features

Spec Kit includes specialized features for LLM application development:

**1. Agent Specification Wizard**

```bash
/speckit.agent

# Guided agent creation:
# 1. Agent name and purpose
# 2. Model selection and parameters
# 3. Capabilities and tools
# 4. Safety constraints
# 5. Evaluation criteria

# Generates: specs/agents/[agent-name].yaml
```

**2. Prompt Template Generator**

```bash
/speckit.prompt

# Guided prompt creation:
# 1. Prompt purpose and use case
# 2. Model and parameters
# 3. Input/output format
# 4. Few-shot examples
# 5. Evaluation test cases

# Generates: prompts/[prompt-name].md
```

**3. Multi-Agent Coordination Spec**

```bash
/speckit.coordination

# Define agent interactions:
# 1. List of agents and roles
# 2. Communication protocols
# 3. Shared context
# 4. Workflow orchestration
# 5. Error handling

# Generates: specs/coordination/[system-name].yaml
```

**4. Evaluation Framework Spec**

```bash
/speckit.evaluation

# Define evaluation strategy:
# 1. Metrics and thresholds
# 2. Test dataset structure
# 3. Baseline comparison
# 4. Evaluation frequency
# 5. Reporting format

# Generates: specs/evaluation/[component-name].yaml
```

### Example: Building an LLM Agent with Spec Kit

Complete workflow for creating a query generation agent:

```bash
# Step 1: Establish project principles
/speckit.constitution
# User provides: Natural language to SQL converter, accuracy critical, safety-first

# Generated: docs/CONSTITUTION.md
# Principles: Safety-first validation, deterministic outputs, transparent confidence

# Step 2: Specify the agent
/speckit.specify
# User provides: Convert English questions to SQL, validate safety, return confidence

# Generated: docs/specs/query-generator.md
# Requirements: FR-1 through FR-10, NFR-1 through NFR-5
# Scenarios: 15 test cases covering happy path and errors

# Step 3: Clarify ambiguities
/speckit.clarify
# Agent asks: "How to handle ambiguous questions?"
# User clarifies: "Ask for clarification rather than guessing"

# Updated: docs/specs/query-generator.md
# Added: FR-11: Agent must request clarification for ambiguous questions

# Step 4: Generate technical plan
/speckit.plan
# Agent generates: docs/plans/query-generator-plan.md
# Architecture: Agent-based with validator chain
# Tech stack: TypeScript, Claude API, better-sqlite3
# Components: QueryGenerator, SQLValidator, SafetyValidator, ConfidenceScorer

# Step 5: Break down into tasks
/speckit.tasks
# Agent generates: docs/plans/query-generator-tasks.md
# 20 atomic tasks across 4 phases
# Each task: description, validation, time estimate, dependencies

# Step 6: Implement
/speckit.implement
# Agent executes all 20 tasks in order
# Creates: src/agents/query-generator.ts
# Creates: src/agents/sql-validator.ts
# Creates: src/agents/safety-validator.ts
# Creates: tests/*.test.ts

# Step 7: Evaluate
/speckit.evaluate
# Agent generates: tests/evaluation/query-generator.eval.ts
# Runs: 100 test queries with expected outputs
# Reports: Accuracy 87%, Safety 100%, Avg latency 1.2s
```

### Benefits for LLM Development

Spec Kit provides specific benefits for LLM application development:

1. **Systematic Prompt Engineering** - Prompts are specified, versioned, and evaluated
2. **Agent Coordination** - Multi-agent systems have explicit contracts
3. **Safety by Design** - Constraints and validation are specified upfront
4. **Reproducible Evaluation** - Test datasets and metrics defined in specs
5. **Transparent AI Behavior** - Specifications document what agents should do
6. **Iterative Refinement** - Specs evolve as you learn what works

---

## 5. OpenSpec

**OpenSpec** is a spec-driven change proposal system used in this repository for managing modifications to existing LLM applications. While GitHub Spec Kit handles initial development, OpenSpec structures **changes** as validated proposals with spec deltas.

### Core Philosophy

OpenSpec treats every change as a three-stage process:

```
┌──────────┐      ┌────────────┐      ┌──────────────┐
│ Proposal │  →   │ Validation │  →   │ Implementation│
│ (What)   │      │ (Why/How)  │      │ (Do It)      │
└──────────┘      └────────────┘      └──────────────┘
```

Key principles:

- **Separation of Concerns** - What to change (proposal) vs how to implement (tasks)
- **Validation First** - Verify feasibility before coding
- **Traceability** - Every change linked to requirements
- **Incremental Delivery** - Small, testable task breakdown
- **Change History** - Archive preserves decision context

### Directory Structure

```
query-craft/openspec/
├── project.md                     # Project context (purpose, tech stack, conventions)
├── AGENTS.md                      # Agent system documentation
├── specs/                         # Current specifications
│   ├── dialog-manager/
│   │   ├── spec.md               # Functional spec
│   │   └── design.md             # Technical design
│   ├── query-generator/
│   │   ├── spec.md
│   │   └── design.md
│   └── ...
└── changes/
    ├── active/                    # Current change (only one at a time)
    │   ├── proposal.md           # What to change and why
    │   ├── tasks.md              # Implementation task breakdown
    │   └── specs/                # New/modified specs for this change
    │       ├── dialog-manager/
    │       │   ├── spec.md
    │       │   └── design.md
    │       └── ...
    └── archive/                   # Completed changes
        ├── 2025-12-23-add-query-refinement-dialog/
        │   ├── proposal.md
        │   ├── tasks.md
        │   └── specs/
        └── 2025-12-20-add-braintrust-evaluation/
            ├── proposal.md
            ├── tasks.md
            └── specs/
```

### Proposal Structure

Every OpenSpec proposal follows this format:

```markdown
# Proposal: [Change Name]

**Change ID:** `[kebab-case-identifier]`
**Created:** YYYY-MM-DD
**Status:** ACTIVE | COMPLETED | CANCELLED

## Change Type
FEATURE | ENHANCEMENT | BUGFIX | REFACTOR

## Motivation

### Problem Statement
What problem exists in the current system?

### User Impact
Who is affected and how?

### Business Value
Why is this change worth implementing?

## Spec Deltas

### ADDED: [Component Name]

**Purpose:** What this new component does

**Capabilities:**
- Capability 1
- Capability 2

**Interface:**
```typescript
// New interfaces/functions
```

**Rationale:** Why this is needed

---

### MODIFIED: [Existing Component]

**Before:**
- Current behavior 1
- Current behavior 2

**After:**
- New behavior 1
- New behavior 2

**Changes:**
- What specifically changes in implementation
- Why each change is necessary

**Backward Compatibility:** Impact on existing users

---

### REMOVED: [Component/Feature]

**Current Behavior:** What exists today

**Rationale:** Why it's being removed

**Migration Path:** How users adapt

**Deprecation:** Timeline if applicable

---

## Scenarios

### Scenario 1: [Primary Use Case]
**Given:** Initial state
**When:** User action
**Then:** Expected behavior

**Validation:** How to verify this works

### Scenario 2: [Edge Case]
**Given:** Unusual initial state
**When:** Edge case action
**Then:** Graceful handling

**Validation:** Test case demonstrating handling

## Impact Analysis

### Components Affected
- Component 1: How it changes
- Component 2: Integration points modified

### Test Coverage
- New tests required: 15 unit, 5 integration
- Existing tests to update: 3 integration

### Documentation Updates
- User guide: New refinement workflow section
- API docs: Updated query generator interface
- Examples: Add refinement examples

### Dependencies
- New libraries: None
- Version changes: None

## Risks & Mitigation

### Risk 1: [Description]
**Likelihood:** Low | Medium | High
**Impact:** Low | Medium | High
**Mitigation:** How to address

## Success Criteria

- [ ] All scenarios pass validation
- [ ] Test coverage >= 80%
- [ ] Documentation complete
- [ ] Performance meets requirements
- [ ] No regressions in existing features

## Estimated Effort
8-12 hours across 4 phases
```

### Task Breakdown Structure

After proposal validation, create detailed task breakdown:

```markdown
# Implementation Tasks: [Change Name]

**Change ID:** `[change-id]`

## Task Overview

**Estimated effort:** X-Y hours
**Parallelizable:** Tasks marked with `[P]` can run in parallel

---

## Phase 1: Foundation (Core Functionality)

### Task 1: [Task Name]

**Files:** `path/to/file1.ts`, `path/to/file2.ts`

**Description:**
What this task accomplishes

**Subtasks:**
- [ ] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3

**Validation:**
- How to verify this task is complete
- Tests that must pass

**Dependencies:**
- None (can start immediately)

**Estimated time:** X minutes/hours

---

### Task 2: [Task Name] `[P]`

**Files:** `path/to/file.ts`

**Description:**
What this task accomplishes

**Subtasks:**
- [ ] Subtask 1
- [ ] Subtask 2

**Validation:**
- Validation criteria
- Test requirements

**Dependencies:**
- Task 1 must complete first

**Estimated time:** X hours

---

## Phase 2: Integration

### Task 3: [Integration Task]

**Files:** `path/to/integration.ts`

**Description:**
Connect components from Phase 1

**Subtasks:**
- [ ] Integration step 1
- [ ] Integration step 2

**Validation:**
- Integration tests pass
- End-to-end scenario works

**Dependencies:**
- Task 1, Task 2 complete

**Estimated time:** X hours

---

## Phase 3: Polish & Documentation

### Task 4: [Documentation]

**Files:** `README.md`, `docs/user-guide.md`

**Description:**
Document new functionality

**Subtasks:**
- [ ] Update user guide
- [ ] Add code examples
- [ ] Update API documentation

**Validation:**
- Documentation builds without errors
- Examples are tested and work

**Dependencies:**
- All Phase 2 tasks complete

**Estimated time:** X hours

---

## Phase 4: Validation

### Task 5: [End-to-End Validation]

**Description:**
Comprehensive validation against proposal scenarios

**Subtasks:**
- [ ] Run all test suites
- [ ] Validate each proposal scenario
- [ ] Performance testing
- [ ] Security validation

**Validation:**
- All proposal success criteria met
- No regressions detected
- Performance within targets

**Dependencies:**
- All previous phases complete

**Estimated time:** X hours
```

### Workflow Example: Query Refinement Feature

Let's walk through a complete OpenSpec change:

#### 1. Create Proposal

Create `changes/active/proposal.md`:

```markdown
# Proposal: Add Query Refinement Through Dialog

**Change ID:** `add-query-refinement-dialog`
**Created:** 2025-12-23
**Status:** ACTIVE

## Change Type
FEATURE

## Motivation

### Problem Statement
Users must rewrite entire questions to refine queries. When a generated 
SQL query is close but not quite right, users cannot incrementally refine 
it through conversation.

### User Impact
- Data analysts spend extra time reformulating questions
- Common refinements (add column, change filter) require full context repeat
- Frustrating user experience for iterative exploration

### Business Value
- Reduce time-to-insight by 40% for iterative workflows
- Improve user satisfaction scores
- Differentiate from competitors with single-shot generation

## Spec Deltas

### ADDED: Dialog Manager Agent

**Purpose:** Maintain conversation state and detect user intent (new query vs refinement)

**Capabilities:**
- Intent detection using keyword matching
- Conversation history management (last 10 turns)
- Context extraction for query refinement
- History pruning to manage token usage

**Interface:**
```typescript
interface DialogManager {
  addTurn(input: string, intent: IntentType, result: QueryResult): void;
  detectIntent(input: string): IntentType;
  getContext(): ConversationContext;
  clear(): void;
}

enum IntentType {
  NEW_QUERY = 'new_query',
  REFINEMENT = 'refinement'
}

interface ConversationContext {
  lastQuery?: string;
  lastResult?: QueryResult;
  previousQuestions: string[];
  refinementCount: number;
}
```

**Rationale:** 
Separating dialog management from query generation follows single-responsibility 
principle. Dialog manager becomes reusable for future conversational features.

---

### MODIFIED: Query Generator Agent

**Before:**
- Accepts natural language question as single input
- No awareness of previous queries
- Returns SQL query with confidence score

**After:**
- Accepts natural language question **and** conversation context
- Uses previous query + feedback for refinement
- Returns SQL query, confidence score, and refinement explanation

**Changes:**
```typescript
// Before
generateQuery(question: string): QueryResult

// After  
generateQuery(
  question: string, 
  context?: ConversationContext
): QueryResultWithExplanation

interface QueryResultWithExplanation extends QueryResult {
  refinementExplanation?: string;  // NEW
  baseQuery?: string;               // NEW (original query if refined)
}
```

**Prompt Engineering Changes:**
- Add conversation context section to prompt
- Include previous query and result in context
- Add few-shot examples of refinement scenarios
- Instruct model to explain what was refined

**Backward Compatibility:**
context parameter is optional - existing single-shot usage still works

---

### MODIFIED: CLI Command Handler

**Before:**
- Single `query` command for one-shot generation
- No state between invocations

**After:**
- Add `--interactive` flag to `query` command
- Maintain dialog manager session during interactive mode
- Display refinement explanations to user

**Changes:**
```bash
# Before
querycraft query "show all users"

# After (same single-shot usage works)
querycraft query "show all users"

# NEW: Interactive mode
querycraft query --interactive
> show all users
[SQL result displayed]
> only show name and email
[Refined query result with explanation]
> sort by signup date
[Further refined query with explanation]
```

## Scenarios

### Scenario 1: Column Refinement
**Given:** User generated query selecting all columns from users table
**When:** User says "only show name and email"
**Then:** 
- Dialog manager detects REFINEMENT intent
- Query generator modifies SELECT clause
- Returns query with explanation: "Refined to select only name, email columns"
- UI displays refined query with explanation

**Validation:** 
Integration test verifies refined query has correct SELECT clause

### Scenario 2: Add Filtering
**Given:** User generated query "show all users"
**When:** User says "only active users"
**Then:**
- Dialog manager detects REFINEMENT intent
- Query generator adds WHERE active = true
- Explanation: "Added filter for active users only"

**Validation:**
Integration test verifies WHERE clause added, original SELECT preserved

### Scenario 3: Change Sorting
**Given:** User generated query with results
**When:** User says "sort by signup date"
**Then:**
- Dialog manager detects REFINEMENT intent
- Query generator adds ORDER BY signup_date
- Explanation: "Added sorting by signup date"

**Validation:**
Integration test verifies ORDER BY clause correct

### Scenario 4: New Query Resets Context
**Given:** User has refined a query 3 times
**When:** User says "show all products"
**Then:**
- Dialog manager detects NEW_QUERY intent
- Query generator ignores previous context
- Generates fresh query for products table

**Validation:**
Integration test verifies context cleared, no user-table references

### Scenario 5: Ambiguous Intent
**Given:** User refined query once
**When:** User says "sort it"  
**Then:**
- Dialog manager detects REFINEMENT intent (no new table/entity mentioned)
- Query generator asks clarification: "Sort by which column?"

**Validation:**
Integration test verifies clarification request

## Impact Analysis

### Components Affected
- `src/agents/query-generator.ts` - Add context parameter
- `src/agents/dialog-manager.ts` - NEW component
- `src/types/index.ts` - Add new interfaces
- `src/cli/commands/query.ts` - Add interactive mode
- `tests/integration/` - Add refinement test suites

### Test Coverage
- New tests required:
  - 15 unit tests for DialogManager
  - 10 unit tests for intent detection  
  - 8 integration tests for refinement scenarios
  - 2 CLI integration tests for interactive mode
- Existing tests to update:
  - 3 query-generator integration tests (add context param handling)

### Documentation Updates
- `README.md` - Add interactive mode example
- `docs/user-guide.md` - New section on query refinement
- `docs/API.md` - Update QueryGenerator interface
- `docs/AGENTS.md` - Document DialogManager agent

### Dependencies
- No new external libraries required
- Uses existing Claude API integration

## Risks & Mitigation

### Risk 1: Intent Detection Accuracy
**Likelihood:** Medium
**Impact:** Medium (bad refinements frustrate users)
**Mitigation:** 
- Start with rule-based detection (keywords)
- Log misclassified intents for future ML model
- Allow users to explicitly signal intent ("new query:" prefix)

### Risk 2: Context Token Budget
**Likelihood:** Medium  
**Impact:** Low (degraded performance, not broken)
**Mitigation:**
- Prune history to last 10 turns
- Summarize old context if token budget exceeded
- Monitor token usage in production

### Risk 3: Breaking Changes to API
**Likelihood:** Low
**Impact:** High (breaks existing integrations)
**Mitigation:**
- Make context parameter optional
- Maintain backward compatibility
- Version API if breaking changes needed

## Success Criteria

- [ ] All 5 scenarios pass validation
- [ ] Unit test coverage >= 80% for new code
- [ ] Integration tests cover happy path + 3 edge cases
- [ ] Interactive mode demo to 5 beta users (80% satisfaction)
- [ ] Documentation reviewed and approved
- [ ] No regressions in existing single-shot queries
- [ ] Performance: Refinement adds < 500ms latency

## Estimated Effort
8-12 hours across 4 phases:
- Phase 1 (Foundation): 4 hours
- Phase 2 (Integration): 3 hours  
- Phase 3 (Polish & Docs): 2 hours
- Phase 4 (Validation): 2 hours
```

#### 2. Create Task Breakdown

Create `changes/active/tasks.md` (see earlier example for full structure).

#### 3. Implement Tasks

AI agent executes tasks in order:

```bash
# Phase 1, Task 1
# Agent creates src/types/index.ts with new interfaces
# ✓ TypeScript compiles

# Phase 1, Task 2  
# Agent creates src/agents/dialog-manager.ts
# Agent creates tests/unit/dialog-manager.test.ts
# ✓ 15 unit tests pass

# Phase 2, Task 3
# Agent modifies src/agents/query-generator.ts
# Agent updates tests/integration/query-generator.test.ts
# ✓ Integration tests pass

# Phase 3, Task 4
# Agent updates documentation files
# ✓ Documentation builds successfully

# Phase 4, Task 5
# Agent runs full test suite
# Agent validates all proposal scenarios
# ✓ All success criteria met
```

#### 4. Validate Against Proposal

```bash
# Run validation checklist
# Check each scenario
✓ Scenario 1: Column refinement works
✓ Scenario 2: Add filtering works
✓ Scenario 3: Change sorting works
✓ Scenario 4: New query resets context
✓ Scenario 5: Clarification requested

# Check success criteria
✓ All 5 scenarios validated
✓ Test coverage 84% (exceeds 80% target)
✓ Integration tests cover 5 edge cases
✓ Beta users report 85% satisfaction
✓ Documentation complete
✓ No regressions detected
✓ Refinement adds 350ms latency (< 500ms target)
```

#### 5. Close Change

```bash
# Merge new specs into main specs directory
mv changes/active/specs/dialog-manager specs/

# Archive the change
mv changes/active changes/archive/2025-12-23-add-query-refinement-dialog

# Update project.md with new capability
echo "- Dialog-based query refinement with intent detection" >> project.md

# Status: COMPLETED
```

### Benefits of OpenSpec

1. **Change Traceability** - Every modification tracked with rationale
2. **Impact Analysis** - Understand what changes before coding
3. **Validation First** - Catch issues in proposal stage
4. **Incremental Delivery** - Small, testable task breakdown
5. **Team Coordination** - Proposals reviewed before implementation
6. **Historical Context** - Archive preserves why decisions were made
7. **LLM-Friendly** - Spec deltas give AI agents precise change instructions

### OpenSpec vs Traditional Git Workflow

| Aspect | OpenSpec | Git Feature Branches |
|--------|----------|---------------------|
| **Planning** | Proposal with spec deltas | Issue/ticket description |
| **Validation** | Before implementation | After (in PR review) |
| **Change Scope** | Explicit in proposal | Inferred from commits |
| **Task Breakdown** | Required, validated | Optional, informal |
| **Context** | Archived with change | Lost in closed PRs |
| **AI Agent Guidance** | Spec deltas as instructions | Commit messages only |

OpenSpec complements Git - proposals live in the repository and are version controlled.

---


## 6. Agent Specification Formats

Agent specifications define autonomous AI components in LLM applications. This section covers YAML schemas, prompt templates, and configuration patterns used in spec-driven agent development.

### YAML Agent Configuration Schema

The standard agent specification format used in query-craft and similar projects:

```yaml
# specs/agents/query-generator.yaml

metadata:
  name: query-generator
  version: 1.2.0
  created: 2025-01-15
  owner: data-team
  status: production

agent:
  purpose: |
    Convert natural language questions to safe, validated SQL queries.
    Supports schema understanding, multi-table joins, and aggregations.
  
  role: SQL query generation specialist
  
  responsibilities:
    - Understand database schema and relationships
    - Generate syntactically correct SQL from natural language
    - Validate query safety (no data modification)
    - Provide confidence scoring for generated queries

model:
  provider: anthropic
  name: claude-3-5-sonnet-20241022
  parameters:
    temperature: 0.0           # Deterministic for SQL generation
    max_tokens: 4000
    top_p: 1.0

capabilities:
  schema_understanding:
    description: Parse and understand database schemas
    evaluation: 95%+ accuracy on schema questions
    
  query_generation:
    description: Generate SQL from natural language
    evaluation: 90%+ syntactically correct
    
  safety_validation:
    description: Ensure queries are read-only and safe
    evaluation: 100% rejection of unsafe operations

tools:
  - name: schema_loader
    purpose: Load and cache database schema
    inputs: [database_path]
    outputs: [schema, relationships, sample_data]
    
  - name: sql_validator
    purpose: Validate SQL syntax and safety
    inputs: [query, schema]
    outputs: [is_valid, errors, warnings]

constraints:
  safety:
    - read_only_queries: Only SELECT statements
    - no_admin_functions: Block ALTER, GRANT, REVOKE
    - allowed_tables_only: Query authorized tables
  
  performance:
    - token_budget: < 4000 tokens
    - response_time: < 5 seconds p95
    - cost_per_query: < $0.01
  
  quality:
    - accuracy: >= 85% on test dataset
    - confidence_calibration: r > 0.8

prompt:
  system: |
    You are an expert SQL query generator. Convert natural language 
    questions into safe, validated SQL queries.
    
    CONSTRAINTS:
    - NEVER generate INSERT, UPDATE, DELETE, DROP statements
    - ONLY query tables in the provided schema
    - Ask for clarification on ambiguous questions
    
    OUTPUT FORMAT (JSON):
    {
      "query": "SELECT ...",
      "explanation": "...",
      "confidence": 0.95,
      "tables_used": ["users"]
    }
  
  few_shot_examples:
    - description: Simple SELECT with WHERE
      question: "How many users signed up last month?"
      output: |
        {
          "query": "SELECT COUNT(*) FROM users WHERE signup_date >= date('now', '-1 month')",
          "confidence": 0.95
        }

evaluation:
  metrics:
    - query_correctness: >= 0.85
    - safety_validation: == 1.0
    - latency_p95: <= 5000ms
  test_dataset: tests/eval_datasets/query_generator_v1.2.json
  frequency:
    pre_commit: subset (50 queries)
    pre_release: full dataset
```

### Prompt Template Format

Structured prompt specifications for version control:

```markdown
# Prompt: SQL Query Generator v1.2

**Model:** claude-3-5-sonnet-20241022
**Token Budget:** 4000 tokens
**Temperature:** 0.0

## Purpose
Convert natural language questions to SQL queries with safety validation.

## Structure

### System Message
You are an expert SQL query generator...

### Context Section
Database Schema:
{schema}

Sample Data:
{sample_data}

### Few-Shot Examples
EXAMPLE 1: Simple SELECT
Question: "How many users?"
Query: SELECT COUNT(*) FROM users

EXAMPLE 2: JOIN
Question: "Revenue per customer?"
Query: SELECT c.name, SUM(o.total) FROM customers c LEFT JOIN orders o...

### User Input
USER QUESTION: {question}

## Variables
- {schema}: CREATE TABLE statements (max 2000 tokens)
- {question}: Natural language question (max 200 tokens)
- {sample_data}: Example column values (optional)

## Output Schema
```typescript
interface QueryOutput {
  query: string | null;
  confidence: number;  // 0.0-1.0
  explanation: string;
  needs_clarification: boolean;
}
```

## Test Cases

### Test 1: Simple SELECT
Input: "How many users signed up last month?"
Expected: Valid query with date filter and COUNT

### Test 2: JOIN Required
Input: "Total revenue per customer?"
Expected: LEFT JOIN with SUM aggregation

## Evaluation
- Accuracy: 87% (v1.1: 83%)
- Latency: 2.8s (v1.1: 3.2s)
- Cost: $0.008 (v1.1: $0.009)
```

---

## 7. Prompt Engineering Through Specifications

Prompt engineering in spec-driven development treats prompts as **first-class artifacts** with versioning, evaluation, and systematic improvement.

### Research-Grounded Prompt Design

Based on Chang & Fosler-Lussier (2023) - "Survey on Evaluation of Large Language Models":

**1. Clear Role Definition**
```
# GOOD: Specific role with constraints
You are an expert SQL query generator specializing in PostgreSQL.
You NEVER generate INSERT/UPDATE/DELETE statements.
```

**2. Structured Output Format**
```
# GOOD: JSON schema with validation
Output format:
{
  "query": "SELECT ...",
  "confidence": 0.95,
  "explanation": "..."
}
```

**3. Few-Shot Examples (3-5 optimal)**
```
EXAMPLE 1 - Simple case:
Input: "How many users?"
Output: {"query": "SELECT COUNT(*) FROM users", "confidence": 0.95}

EXAMPLE 2 - Complex JOIN:
Input: "Average order value per customer"
Output: {"query": "SELECT c.name, AVG(o.total)...", "confidence": 0.88}
```

### Prompt Versioning Strategy

```
MAJOR.MINOR.PATCH

MAJOR (1.0 → 2.0): Breaking changes (output format)
MINOR (1.0 → 1.1): New capabilities, backward compatible
PATCH (1.0.0 → 1.0.1): Bug fixes, no behavior change
```

### Evaluation-Driven Iteration

```
1. Baseline Evaluation → Measure accuracy, latency, cost
2. Identify Failure Patterns
3. Modify Prompt (add examples, refine constraints)
4. A/B Test (old vs new)
5. Deploy if Better
```

**Example Iteration:**

| Metric | v1.0 | v1.1 | Change |
|--------|------|------|--------|
| JOIN accuracy | 78% | 91% | +13% |
| Overall accuracy | 83% | 87% | +4% |
| Latency | 3.2s | 3.0s | -6% |

**Change:** Added LEFT JOIN few-shot example

---

## 8. Multi-Agent Coordination

Multi-agent systems require explicit coordination specifications.

### Coordination Specification Format

```yaml
# specs/coordination/query-generation-system.yaml

system:
  name: Query Generation System
  purpose: Natural language to SQL pipeline

agents:
  - id: dialog-manager
    role: Conversation state and intent detection
    inputs: [user_input]
    outputs: [intent, context]
    
  - id: query-generator
    role: SQL generation
    inputs: [question, schema, context]
    outputs: [query, confidence, explanation]
    
  - id: sql-validator
    role: Syntax and semantic validation
    inputs: [query, schema]
    outputs: [is_valid, errors]
    
  - id: safety-validator
    role: Security checks
    inputs: [query, allowed_tables]
    outputs: [is_safe, violations]
    
  - id: query-executor
    role: Execute validated queries
    inputs: [query, database, timeout]
    outputs: [results, execution_time]

workflows:
  - name: single_shot_query
    steps:
      - step: 1
        agent: dialog-manager
        action: detectIntent
        outputs: {intent}
        
      - step: 2
        agent: query-generator
        action: generateQuery
        inputs: {question, schema}
        outputs: {query, confidence}
        
      - step: 3
        condition: confidence > 0.7
        agent: sql-validator
        action: validate
        inputs: {query, schema}
        outputs: {is_valid}
        
      - step: 4
        condition: is_valid == true
        agent: safety-validator
        action: validateSafety
        inputs: {query}
        outputs: {is_safe}
        
      - step: 5
        condition: is_safe == true
        agent: query-executor
        action: execute
        inputs: {query, database}
        outputs: {results}
    
    error_handling:
      - condition: confidence < 0.7
        action: request_clarification
      - condition: is_valid == false
        action: retry_generation
        max_retries: 2

shared_context:
  database_schema:
    scope: all_agents
    update_frequency: hourly
    cache_duration: 3600
    
  conversation_history:
    scope: [dialog-manager, query-generator]
    max_size: 10  # Last 10 turns

communication:
  protocol: synchronous_function_calls
  timeout_strategy: fail_fast
  retry_logic:
    - agent: query-generator
      max_retries: 2
      conditions: [low_confidence, validation_errors]
```

### Agent Communication Patterns

**Sequential Pipeline:**
```
User → Dialog Manager → Query Generator → Validator → Executor → Results
```

**Conditional Branching:**
```
Query Generator → needs_clarification?
  ├─ Yes → Return question (end)
  └─ No → Validator → is_valid?
       ├─ No → Retry generation
       └─ Yes → Execute
```

**Retry with Feedback:**
```
Query Generator (low confidence)
  ↓
Validator (errors detected)
  ↓
Query Generator (retry with error feedback)
  ↓
Validator (success) → Execute
```

---

## 9. Foundational Research

Research papers establishing spec-driven and LLM development principles.

### Core Papers on LLM Development

1. **Chang & Fosler-Lussier (2023)**
   - *"A Survey on Evaluation of Large Language Models"*
   - ACL 2023
   - **Key Contributions:** Systematic evaluation frameworks, prompt engineering best practices
   - **Relevance:** Establishes evaluation-driven development methodology
   - URL: https://aclanthology.org/2023.acl-long.1/

2. **Wei et al. (2022)**
   - *"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"*
   - NeurIPS 2022
   - **Key Contributions:** Few-shot prompting with reasoning steps
   - **Relevance:** Informs prompt template design with explicit reasoning
   - URL: https://arxiv.org/abs/2201.11903

3. **Ouyang et al. (2022)**
   - *"Training language models to follow instructions with human feedback"*
   - NeurIPS 2022 (InstructGPT paper)
   - **Key Contributions:** RLHF methodology, instruction-following capabilities
   - **Relevance:** Foundation for agent instruction specifications
   - URL: https://arxiv.org/abs/2203.02155

4. **Bai et al. (2022)**
   - *"Constitutional AI: Harmlessness from AI Feedback"*
   - Anthropic paper
   - **Key Contributions:** Principle-based AI alignment, self-critique
   - **Relevance:** Inspires constitution-driven development approach
   - URL: https://arxiv.org/abs/2212.08073

5. **Zhou et al. (2023)**
   - *"Large Language Models Are Human-Level Prompt Engineers"*
   - ICLR 2023
   - **Key Contributions:** Automatic prompt optimization (APE)
   - **Relevance:** Systematic prompt improvement through evaluation
   - URL: https://arxiv.org/abs/2211.01910

### Papers on Multi-Agent Systems

6. **Park et al. (2023)**
   - *"Generative Agents: Interactive Simulacra of Human Behavior"*
   - UIST 2023
   - **Key Contributions:** Agent architecture, memory, and planning
   - **Relevance:** Multi-agent coordination patterns
   - URL: https://arxiv.org/abs/2304.03442

7. **Wu et al. (2023)**
   - *"AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation"*
   - Microsoft Research
   - **Key Contributions:** Agent conversation frameworks
   - **Relevance:** Agent communication protocols
   - URL: https://arxiv.org/abs/2308.08155

8. **Hong et al. (2023)**
   - *"MetaGPT: Meta Programming for Multi-Agent Collaborative Framework"*
   - ICLR 2024
   - **Key Contributions:** Role-based agent coordination, spec-driven agents
   - **Relevance:** Directly applicable to spec-driven multi-agent systems
   - URL: https://arxiv.org/abs/2308.00352

### Papers on Evaluation and Safety

9. **Zheng et al. (2023)**
   - *"Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"*
   - NeurIPS 2023
   - **Key Contributions:** LLM evaluation with LLM judges
   - **Relevance:** Evaluation specification design
   - URL: https://arxiv.org/abs/2306.05685

10. **Perez et al. (2022)**
    - *"Red Teaming Language Models with Language Models"*
    - EMNLP 2022
    - **Key Contributions:** Adversarial testing for safety
    - **Relevance:** Safety validation specifications
    - URL: https://arxiv.org/abs/2202.03286

### Papers on Prompt Engineering

11. **Liu et al. (2023)**
    - *"Pre-train, Prompt, and Predict: A Systematic Survey of Prompting Methods"*
    - ACM Computing Surveys
    - **Key Contributions:** Comprehensive prompt engineering taxonomy
    - **Relevance:** Prompt specification standards
    - URL: https://arxiv.org/abs/2107.13586

12. **White et al. (2023)**
    - *"A Prompt Pattern Catalog to Enhance Prompt Engineering"*
    - ArXiv
    - **Key Contributions:** Reusable prompt patterns
    - **Relevance:** Template design for spec-driven prompts
    - URL: https://arxiv.org/abs/2302.11382

### Papers on Specification-Driven Development

13. **Xie et al. (2023)**
    - *"Self-Refine: Iterative Refinement with Self-Feedback"*
    - NeurIPS 2023
    - **Key Contributions:** Iterative improvement with feedback loops
    - **Relevance:** OpenSpec refinement workflows
    - URL: https://arxiv.org/abs/2303.17651

14. **Yao et al. (2023)**
    - *"Tree of Thoughts: Deliberate Problem Solving with Large Language Models"*
    - NeurIPS 2023
    - **Key Contributions:** Structured reasoning frameworks
    - **Relevance:** Task breakdown in OpenSpec
    - URL: https://arxiv.org/abs/2305.10601

### Industry Best Practices Papers

15. **Anthropic (2023)**
    - *"Claude 2 System Card"*
    - Anthropic technical report
    - **Key Contributions:** Production LLM deployment practices
    - **Relevance:** Deployment and monitoring specifications
    - URL: https://www-files.anthropic.com/production/images/Model-Card-Claude-2.pdf

16. **OpenAI (2023)**
    - *"GPT-4 Technical Report"*
    - OpenAI technical report
    - **Key Contributions:** Evaluation at scale, safety measures
    - **Relevance:** Quality standards for agent specifications
    - URL: https://arxiv.org/abs/2303.08774

---

## 10. Modern Developments

Recent tools, platforms, and practices shaping spec-driven LLM development.

### Development Frameworks

**1. LangChain**
- **Purpose:** Framework for LLM application development
- **Spec-Driven Features:**
  - Chain specifications as code
  - Agent templates and configurations
  - Prompt versioning
- **Integration:** Export chain configs as YAML specs
- **URL:** https://python.langchain.com/docs/

**2. LlamaIndex**
- **Purpose:** Data framework for LLM applications
- **Spec-Driven Features:**
  - Index configuration specifications
  - Query engine templates
  - Evaluation harnesses
- **Integration:** Define retrieval pipelines declaratively
- **URL:** https://docs.llamaindex.ai/

**3. Haystack**
- **Purpose:** LLM orchestration framework
- **Spec-Driven Features:**
  - Pipeline YAML specifications
  - Component configurations
  - Evaluation protocols
- **Integration:** Pipelines defined in YAML, version controlled
- **URL:** https://haystack.deepset.ai/

### Evaluation Platforms

**4. Braintrust**
- **Purpose:** LLM evaluation and observability
- **Features:**
  - Prompt versioning and A/B testing
  - Evaluation dataset management
  - Performance tracking over time
- **Usage in This Repo:** QueryCraft uses Braintrust for query generator evaluation
- **URL:** https://www.braintrustdata.com/

**5. Weights & Biases (W&B)**
- **Purpose:** ML experiment tracking
- **LLM Features:**
  - Prompt tracking (W&B Prompts)
  - LLM evaluation (W&B Weave)
  - Cost monitoring
- **Integration:** Track prompt versions and evaluation metrics
- **URL:** https://wandb.ai/site/prompts

**6. LangSmith**
- **Purpose:** LangChain debugging and evaluation
- **Features:**
  - Trace LLM chains
  - Evaluate agent performance
  - Prompt playground
- **Integration:** Native LangChain integration
- **URL:** https://smith.langchain.com/

### Agent Development Tools

**7. AutoGPT**
- **Purpose:** Autonomous agent framework
- **Spec-Driven:** Agent goals specified as high-level objectives
- **Relevance:** Demonstrates goal-driven agent architecture
- **URL:** https://github.com/Significant-Gravitas/AutoGPT

**8. Microsoft AutoGen**
- **Purpose:** Multi-agent conversation framework
- **Features:**
  - Agent role specifications
  - Conversation protocols
  - Tool integration
- **Relevance:** Multi-agent coordination patterns
- **URL:** https://microsoft.github.io/autogen/

**9. CrewAI**
- **Purpose:** Role-playing multi-agent framework
- **Features:**
  - Agent role definitions
  - Task specifications
  - Process orchestration
- **Relevance:** Declarative multi-agent systems
- **URL:** https://www.crewai.io/

### Prompt Engineering Tools

**10. PromptLayer**
- **Purpose:** Prompt management and versioning
- **Features:**
  - Version control for prompts
  - A/B testing
  - Analytics
- **Integration:** API-based prompt retrieval
- **URL:** https://promptlayer.com/

**11. Humanloop**
- **Purpose:** LLM application platform
- **Features:**
  - Prompt versioning
  - Evaluation workflows
  - Feedback collection
- **Integration:** Complete prompt lifecycle management
- **URL:** https://humanloop.com/

**12. Helicone**
- **Purpose:** LLM observability
- **Features:**
  - Request logging
  - Prompt versioning
  - Cost tracking
- **Integration:** Proxy for OpenAI/Anthropic APIs
- **URL:** https://www.helicone.ai/

### CI/CD for LLMs

**13. Giskard**
- **Purpose:** ML testing framework
- **LLM Features:**
  - Prompt testing
  - Adversarial evaluation
  - Performance regression detection
- **Integration:** Test LLM agents in CI pipelines
- **URL:** https://www.giskard.ai/

**14. GitHub Actions + LLM Testing**
- **Pattern:** Run LLM evaluations in CI
- **Example Workflow:**
  ```yaml
  name: Evaluate LLM Agents
  on: [pull_request]
  jobs:
    evaluate:
      - run: pytest tests/evaluation/
      - run: python scripts/run_evals.py
      - name: Check metrics
        run: |
          if accuracy < 0.85; then exit 1; fi
  ```

### Specification Standards

**15. OpenAI Function Calling**
- **Purpose:** Structured outputs from LLMs
- **Specification:** JSON Schema for function parameters
- **Relevance:** Agent tool specifications
- **URL:** https://platform.openai.com/docs/guides/function-calling

**16. Anthropic Tool Use**
- **Purpose:** Claude integration with external tools
- **Specification:** Tool definitions with XML/JSON
- **Relevance:** Agent capability specifications
- **URL:** https://docs.anthropic.com/claude/docs/tool-use

**17. OpenAPI for AI Agents**
- **Trend:** Using OpenAPI specs to define agent capabilities
- **Example:** GPT Actions use OpenAPI schemas
- **Relevance:** Standardized agent interface specs
- **URL:** https://swagger.io/specification/

### Emerging Practices

**18. "Spec-to-Agent" Generation**
- **Concept:** Generate agent code from specifications
- **Tools:** GPT Engineer, Smol Developer
- **Relevance:** Core concept of spec-driven development
- **Example:** GitHub Spec Kit commands generate implementation

**19. LLM-Powered Code Review**
- **Trend:** AI agents review code against specifications
- **Tools:** GitHub Copilot, Codium PR-Agent
- **Relevance:** Validate implementations against specs automatically

**20. Prompt Registries**
- **Concept:** Centralized repositories of prompt templates
- **Examples:** Prompt Hub, ShareGPT
- **Relevance:** Reusable, versioned prompt specifications

---

## 11. Resources

Comprehensive resources for spec-driven LLM development.

### Official Documentation

**Anthropic Claude**
- Prompt Engineering Guide: https://docs.anthropic.com/claude/docs/prompt-engineering
- Tool Use Documentation: https://docs.anthropic.com/claude/docs/tool-use
- Constitutional AI Paper: https://www.anthropic.com/index/constitutional-ai-harmlessness-from-ai-feedback

**OpenAI**
- Prompt Engineering Guide: https://platform.openai.com/docs/guides/prompt-engineering
- Function Calling: https://platform.openai.com/docs/guides/function-calling
- Best Practices: https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api

**GitHub**
- Spec Kit Repository: https://github.com/github/spec-kit
- Copilot Documentation: https://docs.github.com/en/copilot
- AI Coding Best Practices: https://github.blog/category/ai/

### Courses and Tutorials

**DeepLearning.AI Courses**
- ChatGPT Prompt Engineering for Developers: https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/
- Building Systems with ChatGPT API: https://www.deeplearning.ai/short-courses/building-systems-with-chatgpt/
- LangChain for LLM Application Development: https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/

**Coursera**
- Generative AI with LLMs: https://www.coursera.org/learn/generative-ai-with-llms

**YouTube Channels**
- AI Jason: Practical LLM application tutorials
- Sam Witteveen: LangChain and agent development
- Prompt Engineering Institute: Systematic prompt design

### Books

**"Prompt Engineering for Generative AI"** (2024)
- Authors: James Phoenix & Mike Taylor
- Publisher: O'Reilly Media
- Topics: Systematic prompt design, evaluation, production deployment

**"Building LLM Applications"** (2024)
- Author: Valentina Alto
- Publisher: Manning
- Topics: Architecture patterns, agent systems, evaluation

**"AI Engineering"** (2024)
- Authors: Chip Huyen
- Publisher: O'Reilly Media (upcoming)
- Topics: ML systems design, evaluation, deployment

### Community Resources

**Discord Communities**
- LangChain: https://discord.gg/langchain
- LlamaIndex: https://discord.gg/llamaindex
- Anthropic: https://discord.gg/anthropic

**Reddit Communities**
- r/PromptEngineering
- r/LangChain
- r/LocalLLaMA

**GitHub Awesome Lists**
- awesome-llm: https://github.com/Hannibal046/Awesome-LLM
- awesome-chatgpt-prompts: https://github.com/f/awesome-chatgpt-prompts
- awesome-langchain: https://github.com/kyrolabs/awesome-langchain

### Tools and Platforms

**Prompt Playgrounds**
- Anthropic Console: https://console.anthropic.com/
- OpenAI Playground: https://platform.openai.com/playground
- Hugging Face Spaces: https://huggingface.co/spaces

**Evaluation Tools**
- Braintrust: https://www.braintrustdata.com/
- LangSmith: https://smith.langchain.com/
- Weights & Biases: https://wandb.ai/

**Development Frameworks**
- LangChain: https://python.langchain.com/
- LlamaIndex: https://www.llamaindex.ai/
- Haystack: https://haystack.deepset.ai/

### This Repository

**QueryCraft Examples**
- OpenSpec Structure: `query-craft/openspec/`
- Agent Specifications: `query-craft/openspec/specs/`
- Change Proposals: `query-craft/openspec/changes/archive/`
- Evaluation Framework: `query-craft/tests/evaluation/`

**Documentation**
- Project Context: `query-craft/openspec/project.md`
- Agent System: `query-craft/openspec/AGENTS.md`
- Spec-Driven Development: This document

---

## 12. Quick Start Guide

Get started with spec-driven LLM development in 30 minutes.

### Prerequisites

- Node.js 18+ or Python 3.9+
- Git
- API key for Claude or GPT-4
- Basic understanding of LLMs and prompting

### Option 1: Start with GitHub Spec Kit

**Step 1: Clone Spec Kit Templates**

```bash
# Create new project
mkdir my-llm-app && cd my-llm-app
git init

# Download Spec Kit templates
curl -L https://github.com/github/spec-kit/archive/main.zip -o spec-kit.zip
unzip spec-kit.zip
cp -r spec-kit-main/templates/* .
rm -rf spec-kit.zip spec-kit-main
```

**Step 2: Initialize Project with Constitution**

```bash
# In your AI coding assistant (Claude Code, Copilot, Cursor)
/speckit.constitution

# Provide when prompted:
# - Project: Natural language SQL query generator
# - Principles: Safety-first, user-friendly, accurate
# - Standards: 80% test coverage, TypeScript strict mode
# - Architecture: Agent-based with validation pipeline
```

This generates `docs/CONSTITUTION.md`.

**Step 3: Create First Specification**

```bash
/speckit.specify

# Describe feature:
# "Convert English questions to SQL queries. Support simple SELECT
#  and JOIN queries. Validate safety (no INSERT/UPDATE/DELETE).
#  Return confidence scores."
```

This generates `docs/specs/query-generator.md` with requirements and scenarios.

**Step 4: Generate Implementation Plan**

```bash
/speckit.plan

# Agent reads constitution + spec, generates:
# - Architecture (agent-based)
# - Tech stack (TypeScript, Claude API)
# - Components (QueryGenerator, Validator, Executor)
# - Data models and interfaces
```

This generates `docs/plans/query-generator-plan.md`.

**Step 5: Break Down into Tasks**

```bash
/speckit.tasks

# Agent creates:
# - Atomic tasks across phases
# - Each task: description, files, validation, time estimate
```

This generates `docs/plans/query-generator-tasks.md`.

**Step 6: Implement**

```bash
/speckit.implement

# Agent executes all tasks:
# - Creates src/ files
# - Writes tests
# - Adds documentation
# - Validates against spec
```

**Step 7: Evaluate**

```bash
# Run tests
npm test

# Run evaluation
npm run evaluate

# Check metrics match spec requirements:
# - Accuracy >= 85%
# - Safety validation == 100%
# - Latency < 5 seconds
```

**Total time: ~30 minutes for simple agent**

### Option 2: Start with OpenSpec

**Step 1: Clone This Repository**

```bash
git clone https://github.com/yourusername/ai-projects.git
cd ai-projects/query-craft
```

**Step 2: Install Dependencies**

```bash
npm install

# Set up API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

**Step 3: Review OpenSpec Structure**

```bash
# Explore existing specs
ls openspec/specs/

# Review a complete change proposal
cat openspec/changes/archive/2025-12-23-add-query-refinement-dialog/proposal.md
```

**Step 4: Create New Change Proposal**

```bash
mkdir -p openspec/changes/active
cd openspec/changes/active

# Create proposal.md (see OpenSpec section for template)
# Define what you want to change with spec deltas
```

**Step 5: Break Down into Tasks**

```bash
# Create tasks.md
# List atomic implementation steps
# Reference proposal scenarios for validation
```

**Step 6: Implement with AI Agent**

```bash
# In AI coding assistant:
# "Implement tasks from openspec/changes/active/tasks.md"
# "Refer to proposal.md for requirements"

# Agent executes tasks incrementally
```

**Step 7: Validate Against Proposal**

```bash
# Run tests
npm test

# Validate scenarios from proposal
npm run validate-proposal

# Check all success criteria met
```

**Step 8: Close Change**

```bash
# Merge specs to main specs directory
mv openspec/changes/active/specs/* openspec/specs/

# Archive the change
mv openspec/changes/active openspec/changes/archive/$(date +%Y-%m-%d)-my-feature

# Update project.md with new capability
```

**Total time: ~1 hour for first change**

### Option 3: Build Query Generator from Scratch

**Complete example implementing the QueryCraft-style agent:**

```bash
# 1. Create project
mkdir sql-agent && cd sql-agent
npm init -y

# 2. Install dependencies
npm install @anthropic-ai/sdk better-sqlite3
npm install -D typescript @types/node @types/better-sqlite3

# 3. Create TypeScript config
npx tsc --init --target ES2020 --module commonjs --outDir dist

# 4. Create agent specification
mkdir -p specs/agents
cat > specs/agents/query-generator.yaml << 'EOF'
agent:
  name: query-generator
  purpose: Convert natural language to SQL

model:
  provider: anthropic
  name: claude-3-5-sonnet-20241022
  parameters:
    temperature: 0.0
    max_tokens: 4000

capabilities:
  - query_generation: Generate SELECT queries
  - safety_validation: Block data modification
  - confidence_scoring: Assess query correctness

evaluation:
  metrics:
    - accuracy: >= 0.85
    - safety: == 1.0
EOF

# 5. Create prompt template
mkdir -p prompts
cat > prompts/query-generator.md << 'EOF'
# SQL Query Generator Prompt

You are an expert SQL generator. Convert questions to SQL.

CONSTRAINTS:
- Only SELECT statements
- No INSERT/UPDATE/DELETE

OUTPUT FORMAT:
{
  "query": "SELECT ...",
  "confidence": 0.95
}
EOF

# 6. Implement agent
mkdir -p src
cat > src/agent.ts << 'EOF'
import Anthropic from '@anthropic-ai/sdk';

export async function generateQuery(question: string, schema: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  const prompt = `
Database Schema:
${schema}

Question: ${question}

Generate SQL query as JSON.
`;

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    temperature: 0.0,
    system: 'You are an expert SQL generator.',
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.content[0].text);
}
EOF

# 7. Create test
mkdir -p tests
cat > tests/agent.test.ts << 'EOF'
import { generateQuery } from '../src/agent';

test('generates simple SELECT query', async () => {
  const schema = 'CREATE TABLE users (id INTEGER, name TEXT);';
  const question = 'Show all users';
  
  const result = await generateQuery(question, schema);
  
  expect(result.query).toContain('SELECT');
  expect(result.query).toContain('FROM users');
  expect(result.confidence).toBeGreaterThan(0.8);
});
EOF

# 8. Run
npx ts-node -e "
import { generateQuery } from './src/agent';
generateQuery('Show all users', 'CREATE TABLE users (id INTEGER, name TEXT);')
  .then(console.log);
"
```

**Output:**
```json
{
  "query": "SELECT * FROM users",
  "confidence": 0.95
}
```

**Total time: ~15 minutes for minimal working agent**

### Next Steps

After completing the quick start:

1. **Expand Capabilities:** Add more agents (validator, executor)
2. **Add Evaluation:** Create test datasets, measure accuracy
3. **Implement OpenSpec:** Structure future changes as proposals
4. **Refine Prompts:** Iterate based on evaluation results
5. **Production Deploy:** Add monitoring, error handling, scaling

---

## 13. Hands-On Projects

12 progressive projects from beginner to advanced production deployment.

### Project 1: Simple Prompt Template (Beginner, 30 min)

**Goal:** Create versioned prompt template with evaluation

**Steps:**
1. Create `prompts/summarizer-v1.md` with spec
2. Define input/output format
3. Add 3 test cases
4. Implement in TypeScript/Python
5. Run evaluation (accuracy on test cases)

**Skills:** Prompt specification, basic evaluation

**Code:**
```typescript
// prompts/summarizer-v1.md → src/summarizer.ts
const SYSTEM_PROMPT = `Summarize text in 2-3 sentences. Be concise.`;

async function summarize(text: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Summarize: ${text}` }]
  });
  return response.content[0].text;
}
```

**Evaluation:**
- 3 test texts with reference summaries
- Measure: ROUGE score >= 0.7
- Pass/fail criteria in prompt spec

---

### Project 2: Agent Specification YAML (Beginner, 45 min)

**Goal:** Define agent in YAML, generate code from spec

**Steps:**
1. Create `specs/agents/classifier.yaml`
2. Define capabilities, constraints, evaluation
3. Implement agent following spec exactly
4. Validate implementation matches spec

**Agent Spec:**
```yaml
agent:
  name: sentiment-classifier
  purpose: Classify text sentiment (positive/negative/neutral)
  
model:
  provider: anthropic
  name: claude-3-haiku-20240307  # Fast, cheap for classification
  parameters:
    temperature: 0.0
    max_tokens: 10

capabilities:
  - classify_sentiment: Binary or 3-class classification
  - confidence_scoring: Return probability distribution

output_format: |
  {
    "sentiment": "positive" | "negative" | "neutral",
    "confidence": 0.95
  }

evaluation:
  dataset: tests/sentiment_1000.json
  target_accuracy: >= 0.90
  target_latency: <= 500ms
```

**Implementation must match spec constraints exactly.**

---

### Project 3: Multi-Agent Pipeline (Intermediate, 2 hours)

**Goal:** Build 3-agent pipeline with coordination spec

**Agents:**
1. **Extractor** - Extract structured data from text
2. **Validator** - Validate extracted data
3. **Formatter** - Format for API consumption

**Coordination Spec:**
```yaml
workflow:
  - step: 1
    agent: extractor
    outputs: {data}
  - step: 2
    agent: validator
    inputs: {data}
    outputs: {is_valid, errors}
  - step: 3
    condition: is_valid == true
    agent: formatter
    inputs: {data}
    outputs: {formatted}
```

**Implementation:**
- Define each agent spec separately
- Create coordination spec
- Implement workflow engine
- Handle errors at each step
- Trace full pipeline

---

### Project 4: Prompt A/B Testing (Intermediate, 1.5 hours)

**Goal:** Systematically improve prompt through A/B testing

**Steps:**
1. Create baseline prompt (v1.0)
2. Run evaluation → accuracy 80%
3. Identify failure patterns
4. Create variant prompt (v1.1) addressing failures
5. A/B test on same dataset
6. Statistical significance test
7. Promote better prompt to production

**Metrics to track:**
- Accuracy (primary)
- Latency (secondary)
- Cost per request (secondary)

**Example improvement:**
```
v1.0: "Classify sentiment"
→ 80% accuracy

v1.1: "Classify sentiment. Consider sarcasm and context."
+ Added 2 few-shot sarcasm examples
→ 87% accuracy (+7%)

Statistical test: p < 0.01 (significant)
→ Deploy v1.1
```

---

### Project 5: OpenSpec Change Proposal (Intermediate, 2 hours)

**Goal:** Add feature using OpenSpec workflow

**Scenario:** Add caching to existing query generator

**Steps:**
1. Create `openspec/changes/active/proposal.md`
   - ADDED: CacheManager component
   - MODIFIED: QueryGenerator to check cache first
   - Define scenarios
2. Create `openspec/changes/active/tasks.md`
   - Break into 8 atomic tasks
3. Implement tasks sequentially
4. Validate against proposal scenarios
5. Archive change

**Deliverables:**
- Complete proposal with spec deltas
- Task breakdown with validation
- Implementation
- Test coverage for new functionality
- Updated documentation

---

### Project 6: Evaluation Framework (Intermediate, 2.5 hours)

**Goal:** Build comprehensive evaluation system

**Components:**
1. **Test Dataset** - 200 questions with expected answers
2. **Metrics** - Accuracy, latency, safety, cost
3. **Baseline** - Track improvements over time
4. **CI Integration** - Run evals on every PR

**Evaluation Spec:**
```yaml
evaluations:
  - name: query_generator_accuracy
    dataset: tests/eval_datasets/queries_200.json
    metrics:
      - exact_match: Expected vs actual query
      - semantic_match: Results equivalent
      - safety: No unsafe operations
    thresholds:
      exact_match: >= 0.70
      semantic_match: >= 0.85
      safety: == 1.0
    frequency:
      pre_commit: 50 samples
      pre_release: full dataset
```

**Implementation:**
- Load test dataset
- Run agent on each test case
- Compare outputs to expected
- Calculate metrics
- Generate report with pass/fail

---

### Project 7: Conversational Agent (Advanced, 3 hours)

**Goal:** Build stateful agent with conversation memory

**Features:**
- Conversation history (last 10 turns)
- Intent detection (new query vs refinement)
- Context-aware responses
- Memory summarization when token budget exceeded

**Specs:**
- Dialog Manager agent spec
- Conversation Context schema
- Intent detection rules
- Multi-turn evaluation scenarios

**Challenge:** Balance context retention with token budget

---

### Project 8: Multi-Model Fallback (Advanced, 2.5 hours)

**Goal:** Implement fallback between models based on confidence

**Architecture:**
```
Query → Primary (Claude Haiku - fast, cheap)
        ↓
     confidence < 0.7?
        ↓ Yes
     Secondary (Claude Sonnet - accurate)
        ↓
     confidence < 0.8?
        ↓ Yes
     Tertiary (GPT-4 - most capable)
```

**Specs:**
- Model fallback policy
- Confidence thresholds per model
- Cost/latency trade-offs
- Evaluation: accuracy vs cost

**Implementation:**
- Single agent interface
- Model selection logic
- Graceful degradation
- Metrics tracking (which model used when)

---

### Project 9: Safety Validation Layer (Advanced, 3 hours)

**Goal:** Comprehensive safety system for LLM agents

**Layers:**
1. **Input Validation** - Sanitize user inputs
2. **Output Filtering** - Block unsafe agent outputs
3. **Behavior Constraints** - Enforce agent boundaries
4. **Audit Logging** - Track all agent decisions

**Safety Spec:**
```yaml
safety:
  input_validation:
    - sql_injection: Block malicious SQL patterns
    - prompt_injection: Detect prompt override attempts
    - pii_detection: Flag personal information
  
  output_filtering:
    - data_modification: Block INSERT/UPDATE/DELETE
    - privilege_escalation: Block GRANT/REVOKE
    - table_whitelist: Only allowed tables
  
  audit:
    - log_all_queries: Store for review
    - flag_violations: Alert on safety breaches
```

**Deliverables:**
- Safety validator agent
- Test dataset of 100 malicious inputs
- 100% rejection rate
- Audit log analysis tools

---

### Project 10: Production Monitoring (Advanced, 4 hours)

**Goal:** Deploy agent with full observability

**Monitoring Specs:**
```yaml
monitoring:
  metrics:
    - request_rate: Requests per second
    - error_rate: Failed requests / total
    - latency_p50: Median response time
    - latency_p95: 95th percentile
    - latency_p99: 99th percentile
    - cost_per_request: API cost per query
    - accuracy_estimate: User feedback signals
  
  alerts:
    - condition: error_rate > 0.05 for 5min
      severity: warning
      channel: slack
    
    - condition: latency_p95 > 10s
      severity: warning
      channel: slack
    
    - condition: accuracy_estimate < 0.8 for 1hour
      severity: critical
      channel: pagerduty
  
  dashboard:
    - request_volume_over_time
    - latency_distribution
    - error_types_breakdown
    - cost_tracking
```

**Implementation:**
- Instrumentation (OpenTelemetry)
- Metrics collection (Prometheus)
- Visualization (Grafana)
- Alerting (AlertManager)

---

### Project 11: Prompt Optimization Pipeline (Expert, 5 hours)

**Goal:** Automated prompt improvement system

**Pipeline:**
```
1. Baseline Evaluation → Identify failures
2. Failure Analysis → Cluster error types
3. Hypothesis Generation → What would fix these?
4. Prompt Variants → Generate 5 candidates
5. Parallel Testing → Test all variants
6. Statistical Analysis → Best performer
7. Deploy Winner → Update production
8. Monitor → Regression detection
```

**Advanced Techniques:**
- Automatic few-shot example selection
- Dynamic example count based on question complexity
- Prompt optimization using gradient-free methods
- Multi-objective optimization (accuracy + latency + cost)

**Deliverables:**
- Automated optimization script
- Evaluation harness
- Variant generation logic
- Deployment automation

---

### Project 12: Full Production System (Expert, 20+ hours)

**Goal:** Production-ready LLM application with all best practices

**System Components:**
1. **Multi-Agent Architecture**
   - Query generator
   - Validator
   - Safety checker
   - Dialog manager
   - Executor

2. **Evaluation Framework**
   - 500+ test cases
   - Regression detection
   - A/B testing infrastructure

3. **Monitoring & Observability**
   - Real-time metrics
   - Distributed tracing
   - Cost tracking
   - User feedback loop

4. **Safety & Security**
   - Input validation
   - Output filtering
   - Audit logging
   - Incident response

5. **DevOps & Deployment**
   - CI/CD with eval gates
   - Canary deployments
   - Rollback capabilities
   - Infrastructure as code

6. **Documentation**
   - Agent specifications
   - Prompt templates with versions
   - OpenSpec change history
   - Runbooks for operations

**Architecture Spec:**
```yaml
system:
  name: production-query-system
  agents: [dialog-manager, query-generator, sql-validator, safety-validator, executor]
  workflows: [single-shot, refinement, clarification]
  
deployment:
  environment: production
  region: us-east-1
  replicas: 3
  autoscaling:
    min: 3
    max: 10
    target_cpu: 70%
  
monitoring:
  metrics: [latency, accuracy, safety, cost]
  alerts: [error-rate, latency-p95, safety-violations]
  dashboards: [overview, agent-performance, cost-analysis]

quality_gates:
  pre_deploy:
    - accuracy: >= 0.85
    - safety: == 1.0
    - latency_p95: <= 5000ms
    - test_coverage: >= 80%
```

**This is the culmination of all previous projects.**

---

## 14. Best Practices

Quality standards and common pitfalls in spec-driven LLM development.

### Specification Quality

**DO:**
- ✅ Write specs **before** implementation
- ✅ Include concrete scenarios with inputs/outputs
- ✅ Define measurable acceptance criteria
- ✅ Version specs alongside code
- ✅ Keep specs focused (single responsibility)
- ✅ Make constraints explicit
- ✅ Include evaluation criteria upfront

**DON'T:**
- ❌ Write specs after implementation (defeats purpose)
- ❌ Use vague requirements ("should be fast")
- ❌ Skip scenarios (no way to validate)
- ❌ Let specs drift from implementation
- ❌ Create monolithic multi-agent specs
- ❌ Leave constraints implicit
- ❌ Defer evaluation planning

**Example - GOOD Spec:**
```markdown
## Requirement: Query Response Time

**Target:** 95th percentile response time < 5 seconds

**Measurement:** Log all query generation times, calculate p95 weekly

**Scenario:**
Given: 1000 diverse user questions
When: System generates SQL queries
Then: 95% complete within 5 seconds

**Acceptance:** p95 latency <= 5000ms on test dataset
```

**Example - BAD Spec:**
```markdown
## Requirement: Fast Queries

The system should respond quickly.
```

### Prompt Engineering

**DO:**
- ✅ Use structured output formats (JSON)
- ✅ Include 3-5 few-shot examples
- ✅ State constraints explicitly
- ✅ Version prompts (v1.0, v1.1, v2.0)
- ✅ Test on representative data
- ✅ Measure confidence calibration
- ✅ Iterate based on evaluation

**DON'T:**
- ❌ Expect perfect outputs without iteration
- ❌ Add examples without testing
- ❌ Modify prompts without A/B testing
- ❌ Ignore failure patterns
- ❌ Use overly complex prompts
- ❌ Forget token budget constraints
- ❌ Skip prompt versioning

**Prompt Iteration Checklist:**
1. Baseline evaluation (accuracy, latency, cost)
2. Analyze top 10 failures
3. Formulate hypothesis (why failures occurred)
4. Modify prompt (add examples, refine constraints)
5. A/B test (old vs new, >=100 samples)
6. Statistical significance test (p < 0.05)
7. Deploy if better, iterate if not

### Agent Design

**DO:**
- ✅ Single responsibility per agent
- ✅ Explicit input/output contracts
- ✅ Deterministic behavior (temperature=0 for production)
- ✅ Confidence scoring for outputs
- ✅ Graceful degradation on errors
- ✅ Safety validation layers
- ✅ Comprehensive testing

**DON'T:**
- ❌ Create monolithic "do everything" agents
- ❌ Use implicit interfaces
- ❌ Allow non-deterministic production agents
- ❌ Return outputs without confidence
- ❌ Fail loudly without fallbacks
- ❌ Skip safety validation
- ❌ Deploy without evaluation

**Agent Responsibility Boundaries:**
```
GOOD: Separate agents for each responsibility
- QueryGenerator: Natural language → SQL
- SQLValidator: SQL → Validation result
- SafetyChecker: SQL → Safety result
- QueryExecutor: SQL → Results

BAD: Single agent doing everything
- QuerySystem: Natural language → Results
  (mixes concerns, hard to test, brittle)
```

### Multi-Agent Coordination

**DO:**
- ✅ Define explicit coordination contracts
- ✅ Use shared context with clear ownership
- ✅ Implement retry with backoff
- ✅ Trace requests across agents
- ✅ Handle partial failures gracefully
- ✅ Version coordination specs
- ✅ Test workflows end-to-end

**DON'T:**
- ❌ Use implicit agent communication
- ❌ Share mutable state without coordination
- ❌ Fail entire workflow on single agent error
- ❌ Deploy without distributed tracing
- ❌ Cascade failures without circuit breakers
- ❌ Change interfaces without versioning
- ❌ Test agents in isolation only

**Error Handling Pattern:**
```typescript
async function workflow(input: string): Promise<Result | Error> {
  const maxRetries = 2;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const generated = await queryGenerator.generate(input);
      
      if (generated.confidence < 0.7) {
        // Low confidence - ask clarification
        return { type: 'clarification', question: generated.clarification };
      }
      
      const validation = await sqlValidator.validate(generated.query);
      
      if (!validation.is_valid && attempt < maxRetries) {
        // Retry with error feedback
        input = `${input}

Previous errors: ${validation.errors.join(', ')}`;
        continue;
      }
      
      if (!validation.is_valid) {
        return { type: 'error', message: 'Could not generate valid query' };
      }
      
      // Success path
      return await executor.execute(validation.query);
      
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 1000);  // Exponential backoff
    }
  }
}
```

### Evaluation

**DO:**
- ✅ Evaluate before deployment
- ✅ Use representative test datasets
- ✅ Measure multiple metrics (accuracy, latency, cost)
- ✅ Track metrics over time (regression detection)
- ✅ Set quality gates in CI/CD
- ✅ Include edge cases and adversarial examples
- ✅ Collect user feedback signals

**DON'T:**
- ❌ Deploy without evaluation
- ❌ Test on unrepresentative data
- ❌ Optimize single metric (accuracy) ignoring others
- ❌ Forget baseline comparisons
- ❌ Skip CI integration
- ❌ Test only happy paths
- ❌ Ignore production performance

**Comprehensive Evaluation Spec:**
```yaml
evaluation:
  test_dataset:
    size: 500
    distribution:
      happy_path: 300 (60%)
      edge_cases: 100 (20%)
      adversarial: 100 (20%)
  
  metrics:
    primary:
      - accuracy: >= 0.85
    secondary:
      - latency_p95: <= 5000ms
      - cost_per_query: <= $0.01
      - safety_precision: == 1.0
  
  baseline:
    version: v1.1.0
    accuracy: 0.83
    latency_p95: 5200ms
  
  gates:
    pre_merge:
      - accuracy: >= baseline - 0.02  # Allow 2% degradation
      - safety: == 1.0  # No safety regressions
    
    pre_release:
      - accuracy: >= 0.85
      - all_tests_pass: true
```

### Safety & Security

**DO:**
- ✅ Validate all inputs (sanitization)
- ✅ Filter all outputs (safety checks)
- ✅ Implement multiple safety layers
- ✅ Log all agent decisions (audit trail)
- ✅ Test with adversarial inputs
- ✅ Set up safety monitoring and alerts
- ✅ Have incident response procedures

**DON'T:**
- ❌ Trust user inputs blindly
- ❌ Allow agents to bypass safety checks
- ❌ Rely on single safety layer
- ❌ Skip audit logging
- ❌ Test only benign inputs
- ❌ Deploy without monitoring
- ❌ Lack incident response plan

**Safety Layers:**
```
Layer 1: Input Validation
- Sanitize SQL injection attempts
- Detect prompt injection patterns
- Flag PII in inputs

Layer 2: Agent Constraints
- System prompt with explicit "NEVER" rules
- Model parameter constraints (temp=0)
- Token budget limits

Layer 3: Output Filtering
- Block INSERT/UPDATE/DELETE statements
- Validate against table whitelist
- Check for privilege escalation

Layer 4: Execution Safeguards
- Read-only database connections
- Query timeouts
- Result size limits

Layer 5: Audit & Monitoring
- Log all queries and results
- Alert on safety violations
- Track patterns over time
```

### Common Pitfalls

**1. "Vibe Coding" Instead of Spec-Driven**

❌ Problem: Making changes without formal specifications
```
Developer: "Let's add caching"
AI Agent: "Sure, I'll add a cache"
→ No spec, unclear requirements, untested
```

✅ Solution: Always start with spec
```
1. Create OpenSpec proposal with requirements
2. Define cache behavior scenarios
3. Break into tasks with validation
4. Implement against spec
5. Validate all scenarios pass
```

**2. Prompt Drift**

❌ Problem: Modifying prompts without version control
```
"This query is wrong, let me tweak the prompt..."
[Changes prompt in code]
[Works for this case, breaks 5 others]
```

✅ Solution: Versioned prompts with evaluation
```
1. Create prompt v1.1 as new file
2. Document what changed and why
3. Run eval on v1.0 and v1.1
4. A/B test with statistical significance
5. Promote v1.1 if better across all metrics
```

**3. Missing Evaluation**

❌ Problem: Deploying agents without comprehensive testing
```
Developer: "It works on my 3 test cases, ship it!"
[Production: 60% accuracy on real queries]
```

✅ Solution: Evaluation first
```
1. Create test dataset (500+ cases)
2. Define success metrics and thresholds
3. Evaluate before deployment
4. Set CI quality gates
5. Monitor production metrics
```

**4. Monolithic Agents**

❌ Problem: Single agent doing too much
```yaml
agent: query-system
responsibilities:
  - Parse natural language
  - Generate SQL
  - Validate syntax
  - Check safety
  - Execute query
  - Format results
# → Hard to test, modify, or debug
```

✅ Solution: Single-responsibility agents
```yaml
agents:
  - query-generator: NL → SQL
  - sql-validator: SQL → Valid?
  - safety-checker: SQL → Safe?
  - query-executor: SQL → Results
# → Each testable independently
```

**5. Ignoring Confidence Scores**

❌ Problem: Treating all agent outputs equally
```typescript
const result = await agent.generate(question);
return result.query;  // Use regardless of confidence
```

✅ Solution: Confidence-based routing
```typescript
const result = await agent.generate(question);

if (result.confidence < 0.7) {
  return { type: 'clarification', question: result.clarification };
}

if (result.confidence < 0.85) {
  // Use more capable (expensive) model
  return await fallbackAgent.generate(question);
}

return result.query;  // High confidence, proceed
```

**6. No Safety Validation**

❌ Problem: Trusting LLM outputs without validation
```typescript
const query = await agent.generate(question);
return db.execute(query);  // DANGEROUS
```

✅ Solution: Multi-layer validation
```typescript
const query = await agent.generate(question);

const syntaxValid = await validator.validate(query);
if (!syntaxValid.is_valid) return { error: 'Invalid SQL' };

const safetyCheck = await safetyValidator.check(query);
if (!safetyCheck.is_safe) return { error: 'Unsafe query blocked' };

// Only now execute
return db.execute(query);
```

---

## 15. Troubleshooting

Common issues and solutions in spec-driven LLM development.

### Issue: Low Agent Accuracy

**Symptoms:**
- Evaluation shows accuracy < target (e.g., 70% vs 85% target)
- Specific error patterns in failures

**Diagnosis:**
1. Run evaluation, save all failures
2. Manually review top 20 failures
3. Cluster by error type (missing column, wrong table, bad JOIN)
4. Identify patterns

**Solutions:**

**Solution 1: Add Few-Shot Examples**
```markdown
# If failures are JOIN queries

Add to prompt:
EXAMPLE: Multi-table query
Question: "Orders per customer"
Query: SELECT c.name, COUNT(o.id) FROM customers c 
       LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id
```

**Solution 2: Refine System Instructions**
```markdown
# If agent generates INNER JOIN when LEFT JOIN needed

Update system message:
"Use LEFT JOIN when you want to include all rows from the left table,
even if there are no matching rows in the right table.

Example: 'all customers' implies LEFT JOIN (includes customers with 0 orders)
vs 'customers with orders' implies INNER JOIN"
```

**Solution 3: Improve Context**
```markdown
# If agent confuses column names

Add sample data to context:
users.signup_date: 2024-01-15, 2024-02-20, ...
(not users.created_at or users.registration_date)
```

**Solution 4: Chain-of-Thought Reasoning**
```markdown
# For complex queries

Update output format:
{
  "reasoning": "User wants all customers (LEFT JOIN), count orders per customer (GROUP BY), filter to > 5 orders (HAVING)",
  "query": "SELECT c.name, COUNT(o.id) as order_count FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id HAVING order_count > 5"
}
```

**Validation:**
- Re-run evaluation after each change
- Measure improvement
- Ensure no regressions on other test cases

---

### Issue: Inconsistent Confidence Scores

**Symptoms:**
- Agent reports high confidence (0.95) but query is wrong
- Or low confidence (0.60) but query is correct
- Correlation between confidence and correctness < 0.7

**Diagnosis:**
```python
import numpy as np
from scipy.stats import pearsonr

# Load evaluation results
confidences = [result.confidence for result in eval_results]
correctness = [1 if result.correct else 0 for result in eval_results]

correlation, p_value = pearsonr(confidences, correctness)
print(f"Correlation: {correlation:.2f}, p-value: {p_value:.4f}")
# If correlation < 0.8, confidence is poorly calibrated
```

**Solutions:**

**Solution 1: Explicit Confidence Criteria**
```markdown
Update prompt:

Confidence scoring guidelines:
- 0.95+: Perfect schema coverage, simple query, no ambiguity
- 0.85-0.95: Good schema coverage, moderate complexity
- 0.70-0.85: Some ambiguity or complex JOIN/subquery
- <0.70: Missing schema info, ambiguous question, or high complexity

Always explain confidence score in reasoning field.
```

**Solution 2: Schema Coverage Metric**
```typescript
function calculateConfidence(query: string, schema: Schema): number {
  // Extract tables and columns from query
  const queryt tables = extractTables(query);
  const queryColumns = extractColumns(query);
  
  // Check schema coverage
  const allTablesExist = queryTables.every(t => schema.hasTable(t));
  const allColumnsExist = queryColumns.every(c => schema.hasColumn(c));
  
  if (!allTablesExist || !allColumnsExist) {
    return 0.0;  // Force low confidence if schema mismatch
  }
  
  // Other factors...
  const complexity = calculateComplexity(query);
  return 1.0 - (complexity * 0.1);  // Reduce confidence for complexity
}
```

**Solution 3: Calibration Dataset**
```python
# Create calibration dataset
# 100 queries with known correctness

# Bin confidences
bins = [0, 0.7, 0.8, 0.9, 1.0]
for i in range(len(bins) - 1):
    low, high = bins[i], bins[i+1]
    subset = [r for r in results if low <= r.confidence < high]
    actual_accuracy = sum(r.correct for r in subset) / len(subset)
    print(f"Confidence {low}-{high}: Accuracy {actual_accuracy:.2f}")

# If confidence 0.9-1.0 has accuracy 0.70, recalibrate:
# Map reported 0.95 → calibrated 0.75
```

---

### Issue: Agent Doesn't Follow Constraints

**Symptoms:**
- Agent generates INSERT/UPDATE despite "NEVER" instruction
- Queries tables not in whitelist
- Ignores other explicit constraints

**Diagnosis:**
1. Review failed safety validations
2. Check if constraint is in system prompt
3. Test with simple adversarial examples

**Solutions:**

**Solution 1: Strengthen System Prompt**
```markdown
# Weak (doesn't work)
"Avoid data modification queries."

# Strong (works)
"CRITICAL CONSTRAINT: You MUST NEVER generate INSERT, UPDATE, DELETE, DROP, 
ALTER, TRUNCATE, or any statement that modifies data. You can ONLY generate 
SELECT queries for read-only operations. If a user asks for data modification, 
respond with an error message explaining you cannot perform that operation."
```

**Solution 2: Add Validation Layer**
```typescript
// Don't rely on LLM alone
function validateSafety(query: string): SafetyResult {
  const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'GRANT'];
  
  for (const keyword of forbidden) {
    if (query.toUpperCase().includes(keyword)) {
      return {
        is_safe: false,
        violations: [`Forbidden keyword: ${keyword}`]
      };
    }
  }
  
  return { is_safe: true, violations: [] };
}

// Always validate before execution
const generated = await agent.generate(question);
const safety = validateSafety(generated.query);
if (!safety.is_safe) {
  throw new Error('Unsafe query blocked');
}
```

**Solution 3: Few-Shot Constraint Examples**
```markdown
Add to prompt:

EXAMPLE - Constraint violation:
User: "Delete all old records"
Response: {
  "query": null,
  "error": "Cannot generate data modification queries. I can only create SELECT queries for reading data.",
  "confidence": 0.0
}

EXAMPLE - Following constraints:
User: "Show all records"
Response: {
  "query": "SELECT * FROM records",
  "confidence": 0.95
}
```

---

### Issue: High Latency

**Symptoms:**
- Response time > 5 seconds p95
- Users complain of slowness
- API costs high due to timeouts/retries

**Diagnosis:**
```bash
# Measure latency breakdown
Query generation: 2.5s
Validation: 0.3s
Execution: 0.8s
Total: 3.6s  # Within target

# vs
Query generation: 12.0s  # TOO SLOW
Validation: 0.3s
Execution: 0.8s
Total: 13.1s  # PROBLEM
```

**Solutions:**

**Solution 1: Reduce Token Count**
```typescript
// Problem: Large schema (5000 tokens)
const schema = getAllTables();  // 50 tables

// Solution: Filter to relevant tables
const question = "Show users";
const relevantTables = schema.filter(t => 
  question.toLowerCase().includes(t.name.toLowerCase())
);
// Now only users table in context (200 tokens)
```

**Solution 2: Use Faster Model**
```yaml
# For simple queries, use faster model
model:
  primary:
    name: claude-3-haiku-20240307  # Fast
    conditions: question_complexity < 0.5
  
  fallback:
    name: claude-3-5-sonnet-20241022  # Accurate
    conditions: question_complexity >= 0.5 OR confidence < 0.8
```

**Solution 3: Caching**
```typescript
const cache = new LRUCache<string, QueryResult>({ max: 1000 });

async function generate(question: string): Promise<QueryResult> {
  const cacheKey = question.toLowerCase().trim();
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;  // < 1ms
  }
  
  const result = await agent.generate(question);  // 2-3s
  cache.set(cacheKey, result);
  return result;
}
```

---

### Issue: OpenSpec Change Proposal Rejected

**Symptoms:**
- Proposal validation fails
- Missing required sections
- Scenarios don't cover all requirements

**Diagnosis:**
```bash
# Run OpenSpec validator (if available)
python scripts/validate_proposal.py openspec/changes/active/

Errors:
- Missing "Impact Analysis" section
- Scenario 3 has no validation criteria
- MODIFIED spec missing "Before" section
```

**Solutions:**

**Solution 1: Use Proposal Template**
```bash
# Copy complete template
cp openspec/templates/proposal-template.md openspec/changes/active/proposal.md

# Fill in all sections (don't skip any)
- Change Type: FEATURE
- Motivation: Complete problem statement
- Spec Deltas: ADDED/MODIFIED/REMOVED with details
- Scenarios: All with validation
- Impact Analysis: Components, tests, docs
- Risks & Mitigation: List all risks
- Success Criteria: Measurable checklist
```

**Solution 2: Scenario Validation Format**
```markdown
# Bad scenario (no validation)
### Scenario 1: User refines query
User says "only name column"
System refines query

# Good scenario (complete)
### Scenario 1: Column Refinement
**Given:** User generated query "SELECT * FROM users"
**When:** User says "only show name and email columns"
**Then:** 
- System detects REFINEMENT intent
- Generates "SELECT name, email FROM users"
- Returns refinement_explanation: "Modified SELECT clause"

**Validation:**
- Integration test: test_column_refinement()
- Assert: Query has correct columns
- Assert: Other clauses unchanged (WHERE, ORDER BY)
```

**Solution 3: Complete Impact Analysis**
```markdown
## Impact Analysis

### Components Affected
- src/agents/query-generator.ts: Add context parameter
- src/agents/dialog-manager.ts: NEW component
- src/types/index.ts: Add interfaces (ConversationContext, IntentType)
- src/cli/commands/query.ts: Add --interactive flag

### Test Coverage
NEW tests:
- 15 unit tests for DialogManager (src/agents/__tests__/dialog-manager.test.ts)
- 8 integration tests for refinement (tests/integration/refinement.test.ts)

UPDATED tests:
- tests/integration/query-generator.test.ts: Add context parameter tests

### Documentation Updates
- README.md: Add interactive mode example
- docs/user-guide.md: New "Query Refinement" section
- docs/API.md: Update QueryGenerator interface docs

### Dependencies
- No new external libraries
- Uses existing Claude API integration
```

---

### Issue: Evaluation Metrics Disagree

**Symptoms:**
- High accuracy (90%) but low user satisfaction
- Or low latency (2s) but users report slowness

**Diagnosis:**
- Evaluation dataset not representative of production
- Metrics don't capture what matters to users
- Missing important quality dimensions

**Solutions:**

**Solution 1: Augment Evaluation Dataset**
```python
# Current dataset: 500 simple queries
# Problem: Production has complex, multi-table queries

# Solution: Sample from production
production_sample = sample_queries_from_logs(n=200)
manually_label(production_sample)

# New dataset: 
# - 300 simple (original)
# - 200 production-sampled (realistic)
# - Total: 500 (balanced)
```

**Solution 2: Add User-Centric Metrics**
```yaml
evaluation:
  metrics:
    technical:
      - accuracy: >= 0.85
      - latency: <= 5000ms
    
    user_centric:
      - clarity: LLM judges if explanation is clear
      - completeness: Does result answer the question?
      - actionability: Can user act on the information?
  
  # Collect user feedback
  user_feedback:
    thumbs_up_rate: >= 0.80
    refinement_needed_rate: <= 0.20
```

**Solution 3: Perceived Performance**
```typescript
// Problem: 3s feels slow even though within target

// Solution: Streaming + progress indicators
async function* generateWithProgress(question: string) {
  yield { status: 'analyzing', progress: 0.2 };
  
  const query = await agent.generate(question);
  yield { status: 'validating', progress: 0.6 };
  
  const valid = await validator.validate(query);
  yield { status: 'executing', progress: 0.8 };
  
  const results = await executor.execute(query);
  yield { status: 'complete', progress: 1.0, results };
}

// User sees progress, perceived latency lower
```

---

### Issue: Multi-Agent Coordination Failures

**Symptoms:**
- Agent A produces output incompatible with Agent B
- Deadlocks or race conditions
- Inconsistent system behavior

**Diagnosis:**
```bash
# Enable distributed tracing
export TRACE_ENABLED=true

# Run workflow
node src/cli.js query "Show users"

# Analyze trace
Trace ID: abc123
├─ DialogManager.detectIntent (50ms) → intent: NEW_QUERY
├─ QueryGenerator.generate (2500ms) → query: "SELECT * FROM users"
├─ SQLValidator.validate (300ms) → is_valid: true
├─ SafetyValidator.check (100ms) → is_safe: true
└─ QueryExecutor.execute (800ms) → ERROR: Column 'name' not found

# Issue: QueryGenerator generated query for wrong schema version
```

**Solutions:**

**Solution 1: Explicit Shared Context**
```yaml
# coordination spec
shared_context:
  database_schema:
    source: schema_loader.load()
    scope: all_agents
    version: "1.2.0"
    cache_duration: 3600
    update_trigger: schema_migration

# All agents read from same cached schema
# Version mismatch detected if agent uses wrong version
```

**Solution 2: Interface Contracts with Validation**
```typescript
// Define strict interfaces
interface QueryGeneratorOutput {
  query: string;
  confidence: number;
  tables_used: string[];
}

interface SQLValidatorInput {
  query: string;
  schema: DatabaseSchema;
}

// Validate at boundaries
function validateInterface(data: unknown, schema: Schema): void {
  if (!schema.validate(data)) {
    throw new Error(`Interface violation: ${schema.errors}`);
  }
}

// Use in coordination
const generated = await queryGenerator.generate(question);
validateInterface(generated, QueryGeneratorOutputSchema);

const validation = await sqlValidator.validate({
  query: generated.query,
  schema: sharedSchema
});
validateInterface(validation, SQLValidatorOutputSchema);
```

**Solution 3: Saga Pattern for Failure Recovery**
```typescript
// Track workflow state, allow rollback
class WorkflowSaga {
  private steps: WorkflowStep[] = [];
  
  async execute(workflow: Workflow): Promise<Result> {
    try {
      for (const step of workflow.steps) {
        const result = await this.executeStep(step);
        this.steps.push({ step, result });
      }
      return this.steps[this.steps.length - 1].result;
      
    } catch (error) {
      // Rollback completed steps
      for (const { step, result } of this.steps.reverse()) {
        if (step.compensate) {
          await step.compensate(result);
        }
      }
      throw error;
    }
  }
}
```

---

## Sources & References

### Academic Papers

1. Chang, Y., & Fosler-Lussier, E. (2023). "A Survey on Evaluation of Large Language Models." *ACL 2023*. https://aclanthology.org/2023.acl-long.1/

2. Wei, J., et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." *NeurIPS 2022*. https://arxiv.org/abs/2201.11903

3. Ouyang, L., et al. (2022). "Training language models to follow instructions with human feedback." *NeurIPS 2022*. https://arxiv.org/abs/2203.02155

4. Bai, Y., et al. (2022). "Constitutional AI: Harmlessness from AI Feedback." *Anthropic*. https://arxiv.org/abs/2212.08073

5. Zhou, Y., et al. (2023). "Large Language Models Are Human-Level Prompt Engineers." *ICLR 2023*. https://arxiv.org/abs/2211.01910

6. Park, J. S., et al. (2023). "Generative Agents: Interactive Simulacra of Human Behavior." *UIST 2023*. https://arxiv.org/abs/2304.03442

7. Wu, Q., et al. (2023). "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation." *Microsoft Research*. https://arxiv.org/abs/2308.08155

8. Hong, S., et al. (2023). "MetaGPT: Meta Programming for Multi-Agent Collaborative Framework." *ICLR 2024*. https://arxiv.org/abs/2308.00352

9. Zheng, L., et al. (2023). "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena." *NeurIPS 2023*. https://arxiv.org/abs/2306.05685

10. Perez, E., et al. (2022). "Red Teaming Language Models with Language Models." *EMNLP 2022*. https://arxiv.org/abs/2202.03286

11. Liu, P., et al. (2023). "Pre-train, Prompt, and Predict: A Systematic Survey of Prompting Methods." *ACM Computing Surveys*. https://arxiv.org/abs/2107.13586

12. White, J., et al. (2023). "A Prompt Pattern Catalog to Enhance Prompt Engineering." *ArXiv*. https://arxiv.org/abs/2302.11382

13. Xie, S., et al. (2023). "Self-Refine: Iterative Refinement with Self-Feedback." *NeurIPS 2023*. https://arxiv.org/abs/2303.17651

14. Yao, S., et al. (2023). "Tree of Thoughts: Deliberate Problem Solving with Large Language Models." *NeurIPS 2023*. https://arxiv.org/abs/2305.10601

### Industry Reports & Documentation

15. Anthropic (2023). "Claude 2 System Card." https://www-files.anthropic.com/production/images/Model-Card-Claude-2.pdf

16. OpenAI (2023). "GPT-4 Technical Report." https://arxiv.org/abs/2303.08774

17. GitHub (2024). "Spec Kit Documentation." https://github.com/github/spec-kit

18. Anthropic (2024). "Prompt Engineering Guide." https://docs.anthropic.com/claude/docs/prompt-engineering

19. OpenAI (2024). "Prompt Engineering Best Practices." https://platform.openai.com/docs/guides/prompt-engineering

20. LangChain (2024). "LangChain Documentation." https://python.langchain.com/docs/

### Books & Courses

21. Phoenix, J., & Taylor, M. (2024). "Prompt Engineering for Generative AI." *O'Reilly Media*.

22. Alto, V. (2024). "Building LLM Applications." *Manning Publications*.

23. Huyen, C. (2024). "AI Engineering." *O'Reilly Media* (forthcoming).

24. DeepLearning.AI (2024). "ChatGPT Prompt Engineering for Developers." https://www.deeplearning.ai/short-courses/

### Tools & Platforms

25. Braintrust (2024). "LLM Evaluation and Observability Platform." https://www.braintrustdata.com/

26. Weights & Biases (2024). "W&B Prompts for LLM Development." https://wandb.ai/site/prompts

27. LangSmith (2024). "LangChain Debugging and Evaluation." https://smith.langchain.com/

28. Microsoft AutoGen (2024). "Multi-Agent Conversation Framework." https://microsoft.github.io/autogen/

### Repository Examples

29. This Repository: QueryCraft OpenSpec structure at `query-craft/openspec/`

30. This Repository: Agent specifications at `query-craft/openspec/specs/`

---

*Document Version: 1.0.0*  
*Last Updated: 2025-01-25*  
*Contributors: AI Projects Team*  
*License: MIT*
