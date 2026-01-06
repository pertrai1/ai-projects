# Strategy Selection Specification

## Purpose

Maps response categories to Turn 2 prompting strategies. Extended in Milestone 5 to support score-based selection using epsilon-greedy bandit algorithm.

## MODIFIED Requirements

### Requirement: Strategy Selection Modes

The system SHALL support both deterministic and scored selection modes.

#### Scenario: Deterministic mode uses category mapping
- **WHEN** scoring is disabled
- **THEN** category directly maps to fixed strategy (M3/M4 behavior)
- **AND** confident → escalate, hesitant → accuse, hedging → exploit-nuance

#### Scenario: Scored mode uses epsilon-greedy
- **WHEN** scoring is enabled and scorer provided
- **THEN** strategy selected via epsilon-greedy algorithm based on scores

#### Scenario: Selection accepts optional scorer
- **WHEN** selectStrategy() is called
- **THEN** scorer parameter is optional
- **AND** scorer absence triggers deterministic mode

### Requirement: Selection Result Metadata

The system SHALL return comprehensive selection metadata.

#### Scenario: Strategy name returned
- **WHEN** strategy is selected
- **THEN** result includes strategy name

#### Scenario: Selection rationale provided
- **WHEN** strategy is selected
- **THEN** result includes human-readable rationale

#### Scenario: Selection method included
- **WHEN** scored selection is used
- **THEN** result includes method ("exploit", "explore", or "deterministic")

#### Scenario: Score information available
- **WHEN** exploiting in scored mode
- **THEN** result includes success rate of selected strategy
