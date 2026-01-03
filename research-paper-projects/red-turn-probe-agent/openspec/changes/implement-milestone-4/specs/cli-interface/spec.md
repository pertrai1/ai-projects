# CLI Interface Specification

## Purpose

Provides a user-friendly command-line interface using commander.js for argument parsing and chalk for colored output. Replaces manual argument parsing with industry-standard CLI framework that provides help text, validation, and better user experience.

## ADDED Requirements

### Requirement: Commander.js Integration

The system SHALL use commander.js for command-line argument parsing.

#### Scenario: Program metadata defined
- **WHEN** the CLI is invoked
- **THEN** program name, description, and version are displayed

#### Scenario: Help text available
- **WHEN** user runs with --help flag
- **THEN** comprehensive usage documentation is shown

#### Scenario: Version information
- **WHEN** user runs with --version flag
- **THEN** current version number is displayed

### Requirement: Command Structure

The system SHALL provide separate commands for different execution modes.

#### Scenario: Static baseline command
- **WHEN** user runs 'redturn static'
- **THEN** static baseline mode executes (single 2-turn conversation)

#### Scenario: Adaptive mode command
- **WHEN** user runs 'redturn adaptive'
- **THEN** adaptive loop executes with default 10 runs

#### Scenario: Adaptive with options
- **WHEN** user runs 'redturn adaptive --runs 20'
- **THEN** adaptive loop executes with 20 runs

#### Scenario: Content topic selection
- **WHEN** user runs 'redturn adaptive --topic healthcare'
- **THEN** healthcare content topic is used (default behavior)

### Requirement: Colored Terminal Output

The system SHALL use chalk for colored and styled terminal output.

#### Scenario: Success states in green
- **WHEN** contradictions are detected or runs complete successfully
- **THEN** success messages are displayed in green

#### Scenario: Errors in red
- **WHEN** errors occur or validation fails
- **THEN** error messages are displayed in red

#### Scenario: Information in blue
- **WHEN** displaying run progress or statistics
- **THEN** informational text is displayed in blue

#### Scenario: Warnings in yellow
- **WHEN** no contradictions detected or classifications unclear
- **THEN** warning messages are displayed in yellow

#### Scenario: Metadata dimmed
- **WHEN** displaying timestamps or secondary information
- **THEN** text is dimmed for reduced visual prominence

### Requirement: Argument Validation

The system SHALL validate command-line arguments and provide helpful error messages.

#### Scenario: Runs must be positive
- **WHEN** user provides --runs with non-positive number
- **THEN** error message explains runs must be positive integer

#### Scenario: Unknown options rejected
- **WHEN** user provides unrecognized flag
- **THEN** error message suggests correct options or --help

#### Scenario: Invalid command handled
- **WHEN** user provides unknown command
- **THEN** error message shows available commands

### Requirement: Backward Compatibility

The system SHALL maintain compatibility with previous CLI argument style.

#### Scenario: Old style arguments work
- **WHEN** user runs 'node dist/index.js --adaptive --runs 20'
- **THEN** adaptive mode executes with 20 runs (legacy support)

#### Scenario: Default command behavior
- **WHEN** user runs without command
- **THEN** static baseline mode executes (default behavior)

### Requirement: User Experience

The system SHALL provide clear, actionable feedback during execution.

#### Scenario: Progress indication
- **WHEN** running multi-run adaptive mode
- **THEN** each run's progress is displayed with run number

#### Scenario: Results summary
- **WHEN** execution completes
- **THEN** summary statistics are displayed with clear formatting

#### Scenario: Error context
- **WHEN** errors occur
- **THEN** error messages include context and potential solutions
