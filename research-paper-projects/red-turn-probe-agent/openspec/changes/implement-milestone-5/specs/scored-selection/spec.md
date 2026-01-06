# Scored Selection Specification

## Purpose

Implements epsilon-greedy bandit algorithm for strategy selection based on historical success rates. Enables learning which strategies work best while maintaining exploration.

## ADDED Requirements

### Requirement: Epsilon-Greedy Selection

The system SHALL use epsilon-greedy algorithm to balance exploration and exploitation.

#### Scenario: Exploitation selects highest-scoring strategy
- **WHEN** random value exceeds epsilon
- **THEN** the strategy with highest success rate for the category is selected
- **AND** selection method is marked as "exploit"

#### Scenario: Exploration selects randomly
- **WHEN** random value is less than epsilon
- **THEN** a random strategy from candidates is selected
- **AND** selection method is marked as "explore"

#### Scenario: Default epsilon is 0.2
- **WHEN** no epsilon value is specified
- **THEN** system uses ε=0.2 (20% exploration, 80% exploitation)

#### Scenario: Custom epsilon configurable via CLI
- **WHEN** user specifies --epsilon 0.3
- **THEN** system uses ε=0.3 for selection decisions

#### Scenario: Epsilon bounds validated
- **WHEN** user provides epsilon value
- **THEN** system validates it is between 0.0 and 1.0
- **AND** rejects invalid values with clear error message

### Requirement: Candidate Strategy Selection

The system SHALL determine which strategies are eligible for each category.

#### Scenario: All non-default strategies for main categories
- **WHEN** category is confident, hesitant, or hedging
- **THEN** candidates include escalate, accuse, and exploit-nuance

#### Scenario: Only default for unclear category
- **WHEN** category is unclear
- **THEN** only default strategy is candidate (no exploration)

#### Scenario: Candidate selection precedes scoring
- **WHEN** selecting with scores
- **THEN** system first determines candidates based on category
- **AND** then applies epsilon-greedy to candidates

### Requirement: Tie Breaking

The system SHALL handle ties when multiple strategies have equal scores.

#### Scenario: Random tie breaking
- **WHEN** multiple strategies have identical success rates
- **THEN** system randomly selects among tied strategies
- **AND** no strategy has preference in tie situations

#### Scenario: Cold start with all zeros
- **WHEN** no data exists (all strategies at 0/0)
- **THEN** selection falls back to exploration (random choice)

### Requirement: Selection Metadata

The system SHALL track how each strategy was selected.

#### Scenario: Selection method recorded
- **WHEN** a strategy is selected
- **THEN** method ("exploit" or "explore") is returned
- **AND** method is logged for analysis

#### Scenario: Score at selection time captured
- **WHEN** exploiting highest score
- **THEN** the success rate of selected strategy is recorded
- **AND** available in logs for verification

#### Scenario: Selection counts tracked
- **WHEN** running multiple conversations
- **THEN** system tracks total exploit vs explore selections
- **AND** displays breakdown in statistics

### Requirement: Backward Compatibility

The system SHALL support disabling scored selection.

#### Scenario: No-scoring flag disables learning
- **WHEN** user runs with --no-scoring flag
- **THEN** strategy selection uses M4 deterministic mapping
- **AND** no scores are updated or saved

#### Scenario: Deterministic selection marked in logs
- **WHEN** scoring is disabled
- **THEN** selection method is "deterministic" in metadata

## MODIFIED Requirements

### Requirement: Statistics Display

The system SHALL display strategy scores and learning progress.

#### Scenario: Score matrix shown after runs
- **WHEN** adaptive loop completes
- **THEN** statistics include score matrix with attempts, successes, and rates

#### Scenario: Highest scoring strategies highlighted
- **WHEN** displaying scores
- **THEN** best-performing strategy per category is visually indicated

#### Scenario: Selection method breakdown displayed
- **WHEN** showing statistics
- **THEN** exploitation vs exploration counts and percentages are shown

#### Scenario: Learning progress visible
- **WHEN** scores have sufficient data
- **THEN** users can see which strategies are winning/losing
