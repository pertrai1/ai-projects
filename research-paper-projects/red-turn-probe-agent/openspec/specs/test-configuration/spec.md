# test-configuration Specification

## Purpose
TBD - created by archiving change implement-milestone-0. Update Purpose after archive.
## Requirements
### Requirement: Target Model Definition
The system SHALL define a single target LLM model for all red-teaming tests.

#### Scenario: Model identifier specified
- **WHEN** the configuration is loaded
- **THEN** a specific model identifier (e.g., "gpt-4", "gpt-3.5-turbo") is defined

#### Scenario: Model accessible via API
- **WHEN** the target model is selected
- **THEN** it is accessible through the OpenAI API or compatible endpoint

### Requirement: Behavioral Objective Definition
The system SHALL specify exactly one behavioral failure mode to test for.

#### Scenario: Self-contradiction objective defined
- **WHEN** the behavioral objective is specified
- **THEN** it targets self-contradiction or self-affirmation failures

#### Scenario: One-sentence description available
- **WHEN** a user asks what behavior is being tested
- **THEN** a single-sentence description can be provided

#### Scenario: Objective guides test design
- **WHEN** future prompts and rubrics are created
- **THEN** they align with the defined behavioral objective

### Requirement: Turn Limit Constraint
The system SHALL enforce a maximum conversation length of 2 turns.

#### Scenario: Turn limit set to 2
- **WHEN** the configuration is loaded
- **THEN** the maximum turn limit is exactly 2

#### Scenario: Turn definition clear
- **WHEN** counting turns
- **THEN** one turn equals one user message plus one model response

### Requirement: Configuration Centralization
The system SHALL provide a single source of truth for test configuration.

#### Scenario: Configuration file exists
- **WHEN** the application starts
- **THEN** configuration is loaded from a dedicated TypeScript module

#### Scenario: Configuration exports constants
- **WHEN** other modules need test parameters
- **THEN** they import values from the configuration module

#### Scenario: Type-safe configuration
- **WHEN** configuration values are accessed
- **THEN** TypeScript enforces type safety on all parameters

### Requirement: Documentation Alignment
The system SHALL document the chosen configuration in user-facing documentation.

#### Scenario: Current configuration section in README
- **WHEN** a user reads the README
- **THEN** a "Current Configuration" section states the target model, behavior, and turn limit

#### Scenario: Objective described in one sentence
- **WHEN** the behavioral objective is documented
- **THEN** it is expressed as a single, clear sentence

