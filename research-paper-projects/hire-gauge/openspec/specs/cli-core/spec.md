# cli-core Specification

## Purpose
TBD - created by archiving change implement-hire-gauge. Update Purpose after archive.
## Requirements
### Requirement: CLI Entry Point
The system SHALL provide a CLI entry point via `npm run audit` that accepts experiment configuration.

#### Scenario: Run with spec file
- **WHEN** user executes `npm run audit -- --spec specs/experiment.yaml`
- **THEN** the system loads and validates the spec file
- **AND** executes the experiment pipeline

#### Scenario: Missing spec file
- **WHEN** user executes `npm run audit` without `--spec` flag
- **THEN** the system exits with error code 1
- **AND** displays usage instructions

### Requirement: Run Summary Output
The system SHALL print a clear run summary at the start of each experiment.

#### Scenario: Display run summary
- **WHEN** an experiment begins execution
- **THEN** the CLI prints: run ID, evaluation mode, number of profiles, repetitions, and model name

### Requirement: Exit Code Handling
The system SHALL exit with appropriate status codes based on run outcome.

#### Scenario: Successful run
- **WHEN** the experiment completes without errors or gate failures
- **THEN** the system exits with code 0

#### Scenario: Validation failure
- **WHEN** spec validation fails
- **THEN** the system exits with code 1
- **AND** prints actionable error messages

#### Scenario: Gate failure
- **WHEN** quality gate thresholds are exceeded
- **THEN** the system exits with code 1
- **AND** prints which gates failed and why

### Requirement: Structured Logging
The system SHALL use structured JSON logging for all operations.

#### Scenario: Log format
- **WHEN** the system logs any message
- **THEN** the log entry includes timestamp, level, and structured context

