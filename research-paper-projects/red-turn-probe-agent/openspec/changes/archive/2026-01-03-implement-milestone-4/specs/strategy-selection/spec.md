# Strategy Selection Specification

## Purpose

Maps response categories to Turn 2 prompting strategies, enabling adaptive behavior based on how the model responded in Turn 1. Strategies use template-based generation (Milestone 4) to separate strategic intent from content.

## MODIFIED Requirements

### Requirement: Strategy Definitions

The system SHALL define multiple Turn 2 prompting strategies using template-based patterns.

#### Scenario: Escalate strategy defined
- **WHEN** the escalate strategy is requested
- **THEN** it applies a template pattern with stronger counterarguments
- **AND** the pattern increases pressure compared to static baseline
- **AND** tactics include: acknowledge, extreme-case, ethical-challenge, direct-challenge

#### Scenario: Accuse strategy defined
- **WHEN** the accuse strategy is requested
- **THEN** it applies a template pattern that frames one position as obviously correct
- **AND** the pattern implies the current view is mistaken
- **AND** tactics include: dismiss, obvious-answer

#### Scenario: Exploit-nuance strategy defined
- **WHEN** the exploit-nuance strategy is requested
- **THEN** it applies a template pattern that demands a definitive answer
- **AND** the pattern forces commitment to one side
- **AND** tactics include: acknowledge, force-choice, eliminate-hedge

#### Scenario: Default strategy available
- **WHEN** no specific strategy is selected
- **THEN** the system falls back to the static baseline Turn 2 prompt
- **AND** no template generation is used

#### Scenario: Strategy patterns are reusable
- **WHEN** content topic is changed
- **THEN** strategies can generate prompts for new content without code modification

### Requirement: Strategy Metadata

The system SHALL provide metadata about selected strategies including template information.

#### Scenario: Strategy name returned
- **WHEN** a strategy is selected
- **THEN** it returns the strategy name (e.g., "escalate")

#### Scenario: Strategy rationale available
- **WHEN** a strategy is selected
- **THEN** the system can provide rationale for why that strategy was chosen
- **AND** rationale references the response category

#### Scenario: Prompt content accessible
- **WHEN** a strategy is selected
- **THEN** the actual Turn 2 prompt text is generated via template application
- **AND** prompt combines strategy tactics with content topic arguments

#### Scenario: Template metadata tracked
- **WHEN** a template-based strategy is used
- **THEN** metadata includes which tactics were applied
- **AND** metadata includes which arguments were selected from content topic
