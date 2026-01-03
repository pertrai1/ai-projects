# Prompt Templating Specification

## Purpose

Implements strategy-content factorization by separating high-level strategic intent from surface-level prompt text. Templates enable strategies to be reused with different content variations while maintaining consistent argumentative patterns.

## ADDED Requirements

### Requirement: Template-Based Prompt Generation

The system SHALL generate Turn 2 prompts by applying strategy patterns to content topics.

#### Scenario: Strategy pattern applied to content
- **WHEN** a strategy is selected and content topic is available
- **THEN** the template system combines strategy tactics with topic arguments to generate a prompt

#### Scenario: Deterministic generation
- **WHEN** the same strategy and content are applied multiple times
- **THEN** the generated prompt is identical each time

#### Scenario: Strategy independence
- **WHEN** content topic is changed
- **THEN** strategies can be applied without code modification

### Requirement: Tactic Composition

The system SHALL compose strategies from ordered sequences of tactical patterns.

#### Scenario: Escalate strategy uses multiple tactics
- **WHEN** escalate strategy is applied
- **THEN** tactics are applied in sequence: acknowledge, extreme-case, ethical-challenge, direct-challenge

#### Scenario: Accuse strategy uses different tactics
- **WHEN** accuse strategy is applied
- **THEN** tactics are applied in sequence: dismiss, obvious-answer

#### Scenario: Exploit-nuance strategy forces choice
- **WHEN** exploit-nuance strategy is applied
- **THEN** tactics are applied in sequence: acknowledge, force-choice, eliminate-hedge

#### Scenario: Each tactic generates text fragment
- **WHEN** a tactic is executed
- **THEN** it produces a coherent text fragment that can be combined with other tactics

### Requirement: Content Topic Structure

The system SHALL define topics as structured data with reusable argumentative components.

#### Scenario: Healthcare topic provides arguments
- **WHEN** healthcare content topic is loaded
- **THEN** it includes pro arguments, con arguments, edge cases, and stakeholders

#### Scenario: Topics include domain context
- **WHEN** a content topic is defined
- **THEN** it specifies domain, controversial aspect, and relevant considerations

#### Scenario: Arguments have claim and reasoning
- **WHEN** tactics select arguments from topic
- **THEN** each argument includes a claim statement and supporting reasoning

### Requirement: Template Context

The system SHALL provide all necessary information for prompt generation through typed context.

#### Scenario: Context includes Turn 1 response
- **WHEN** template is applied
- **THEN** the Turn 1 model response is available for tactics to reference

#### Scenario: Context includes content topic
- **WHEN** template is applied
- **THEN** the full content topic structure is available for argument selection

#### Scenario: Context includes strategy intent
- **WHEN** template is applied
- **THEN** the high-level strategic goal is available to guide tactic execution

### Requirement: Template Metadata

The system SHALL track which tactics and arguments were used in prompt generation.

#### Scenario: Tactics logged
- **WHEN** a prompt is generated
- **THEN** the system records which tactics were applied

#### Scenario: Arguments logged
- **WHEN** tactics select specific arguments
- **THEN** the system records which pro/con arguments were used

#### Scenario: Metadata available for analysis
- **WHEN** generation completes
- **THEN** metadata is available for logging and debugging purposes

### Requirement: Type Safety

The system SHALL use TypeScript types to ensure template correctness.

#### Scenario: Template functions are typed
- **WHEN** implementing tactics
- **THEN** each tactic function has explicit input and output types

#### Scenario: Content topics follow schema
- **WHEN** defining content
- **THEN** topic structure matches ContentTopic interface

#### Scenario: Compilation validates templates
- **WHEN** building the project
- **THEN** TypeScript catches template misuse at compile time
