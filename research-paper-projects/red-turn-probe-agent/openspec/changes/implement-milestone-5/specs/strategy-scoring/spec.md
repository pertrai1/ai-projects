# Strategy Scoring Specification

## Purpose

Tracks success rates for each strategy-category pair to enable learning which strategies work best. Implements Milestone 5's "lightweight reward-driven behavior" without full reinforcement learning.

## ADDED Requirements

### Requirement: Score Tracking

The system SHALL track success and failure counts for each strategy-category combination.

#### Scenario: Strategy scores initialized to zero
- **WHEN** the scorer is created
- **THEN** all strategy-category pairs start with 0 attempts and 0 successes

#### Scenario: Score updated after run
- **WHEN** a run completes with a strategy and outcome
- **THEN** the attempts count increments by 1
- **AND** if successful, the successes count increments by 1

#### Scenario: Success rate calculated
- **WHEN** retrieving a strategy score
- **THEN** success rate is computed as successes / max(attempts, 1)

#### Scenario: Scores tracked per category
- **WHEN** updating scores
- **THEN** each response category maintains separate scores for strategies
- **AND** "escalate" for "confident" is tracked independently from "escalate" for "hesitant"

### Requirement: Score Retrieval

The system SHALL provide access to strategy scores for selection and display.

#### Scenario: Get success rate for strategy-category pair
- **WHEN** requesting a success rate
- **THEN** the system returns the current success rate (0.0 to 1.0)

#### Scenario: Get all scores for statistics
- **WHEN** displaying statistics
- **THEN** the system provides complete score matrix with all categories and strategies

#### Scenario: Scores available during selection
- **WHEN** selecting a strategy
- **THEN** the selector can query success rates for all candidate strategies

### Requirement: Score Persistence (Optional)

The system SHALL optionally save and load scores across sessions.

#### Scenario: Scores saved to file
- **WHEN** persistence is enabled and run completes
- **THEN** scores are written to JSON file in scores/ directory

#### Scenario: Scores loaded on startup
- **WHEN** persistence enabled and score file exists
- **THEN** scores are loaded and used for initial selection

#### Scenario: Score file format is JSON
- **WHEN** saving scores
- **THEN** file contains category-strategy-score mappings in JSON format
- **AND** file is human-readable and editable

#### Scenario: Missing score file handled gracefully
- **WHEN** score file doesn't exist
- **THEN** system initializes with zero scores without error

### Requirement: Score Reset

The system SHALL support clearing accumulated scores.

#### Scenario: Scores reset via CLI flag
- **WHEN** user runs with --reset-scores flag
- **THEN** all scores are cleared to 0/0
- **AND** persisted score file is deleted if it exists

#### Scenario: Reset confirms fresh start
- **WHEN** scores are reset
- **THEN** subsequent run starts with no historical data
