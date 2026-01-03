# Strategy Selection Specification

## Purpose

Maps response categories to Turn 2 prompting strategies, enabling adaptive behavior based on how the model responded in Turn 1. Strategies are manually defined and selected via explicit rules.

## ADDED Requirements

### Requirement: Strategy Definitions

The system SHALL define multiple Turn 2 prompting strategies.

#### Scenario: Escalate strategy defined
- **WHEN** the escalate strategy is requested
- **THEN** it provides a Turn 2 prompt with stronger counterarguments
- **AND** the prompt increases pressure compared to static baseline

#### Scenario: Accuse strategy defined
- **WHEN** the accuse strategy is requested
- **THEN** it provides a Turn 2 prompt that frames one position as obviously correct
- **AND** the prompt implies the current view is mistaken

#### Scenario: Exploit-nuance strategy defined
- **WHEN** the exploit-nuance strategy is requested
- **THEN** it provides a Turn 2 prompt that demands a definitive answer
- **AND** the prompt forces commitment to one side

#### Scenario: Default strategy available
- **WHEN** no specific strategy is selected
- **THEN** the system falls back to the static baseline Turn 2 prompt

### Requirement: Category-to-Strategy Mapping

The system SHALL map response categories to appropriate strategies.

#### Scenario: Confident maps to escalate
- **WHEN** Turn 1 response is classified as "confident"
- **THEN** the escalate strategy is selected

#### Scenario: Hesitant maps to accuse
- **WHEN** Turn 1 response is classified as "hesitant"
- **THEN** the accuse strategy is selected

#### Scenario: Hedging maps to exploit-nuance
- **WHEN** Turn 1 response is classified as "hedging"
- **THEN** the exploit-nuance strategy is selected

#### Scenario: Unclear maps to default
- **WHEN** Turn 1 response is classified as "unclear"
- **THEN** the default (static baseline) strategy is selected

### Requirement: Explicit Selection Logic

The system SHALL use simple conditional logic for strategy selection.

#### Scenario: No optimization algorithms
- **WHEN** selecting a strategy
- **THEN** selection is based on explicit if/else or switch logic
- **AND** no gradient descent, ML models, or optimization is used

#### Scenario: Deterministic selection
- **WHEN** the same category is provided
- **THEN** the same strategy is always selected

### Requirement: Strategy Metadata

The system SHALL provide metadata about selected strategies.

#### Scenario: Strategy name returned
- **WHEN** a strategy is selected
- **THEN** it returns the strategy name (e.g., "escalate")

#### Scenario: Strategy rationale available
- **WHEN** a strategy is selected
- **THEN** the system can provide rationale for why that strategy was chosen
- **AND** rationale references the response category

#### Scenario: Prompt content accessible
- **WHEN** a strategy is selected
- **THEN** the actual Turn 2 prompt text is available for execution
