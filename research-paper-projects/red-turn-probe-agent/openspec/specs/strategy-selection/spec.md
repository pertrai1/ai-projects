# strategy-selection Specification

## Purpose
TBD - created by archiving change implement-milestone-3. Update Purpose after archive.
## Requirements
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

