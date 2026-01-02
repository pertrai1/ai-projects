# Static Baseline Specification

## ADDED Requirements

### Requirement: Fixed Prompt Sequence
The system SHALL execute a predetermined 2-turn conversation sequence without adaptation.

#### Scenario: Two-turn conversation structure
- **WHEN** the baseline script runs
- **THEN** exactly 2 turns are executed (Turn 1 and Turn 2)

#### Scenario: Turn 1 elicits position
- **WHEN** Turn 1 is executed
- **THEN** the prompt asks the model to take a definitive position on a topic

#### Scenario: Turn 2 challenges position
- **WHEN** Turn 2 is executed
- **THEN** the prompt presents counterarguments and asks for reconsideration

#### Scenario: Prompts are hardcoded
- **WHEN** the script runs multiple times
- **THEN** the same prompt text is used each time (no variation)

### Requirement: OpenAI API Integration
The system SHALL communicate with the OpenAI API to generate model responses.

#### Scenario: Model specified from configuration
- **WHEN** making API requests
- **THEN** the target model from test configuration is used

#### Scenario: API credentials loaded
- **WHEN** the application starts
- **THEN** OpenAI API key is loaded from environment variables

#### Scenario: Temperature set to zero
- **WHEN** API requests are made
- **THEN** temperature parameter is set to 0 for deterministic responses

#### Scenario: Single API call per turn
- **WHEN** a turn is executed
- **THEN** exactly one API request is made to generate the response

### Requirement: Deterministic Execution
The system SHALL produce consistent results across multiple runs.

#### Scenario: No randomness in prompts
- **WHEN** the script runs
- **THEN** no random elements are included in prompts

#### Scenario: Zero temperature setting
- **WHEN** API requests are configured
- **THEN** temperature is 0 to maximize response consistency

#### Scenario: Repeatable outcomes
- **WHEN** the script is run multiple times
- **THEN** responses are nearly identical (allowing for minor API variations)

### Requirement: No Adaptive Behavior
The system SHALL NOT modify prompts based on model responses.

#### Scenario: Turn 2 prompt independent of Turn 1 response
- **WHEN** Turn 2 prompt is generated
- **THEN** it does not depend on the content of Turn 1 response

#### Scenario: No conditional logic
- **WHEN** prompts are selected
- **THEN** no if/else branching based on responses occurs

#### Scenario: No learning mechanism
- **WHEN** the script completes
- **THEN** no state or strategy preferences are persisted for future runs
