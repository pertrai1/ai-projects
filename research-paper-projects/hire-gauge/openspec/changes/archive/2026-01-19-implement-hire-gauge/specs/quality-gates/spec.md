## ADDED Requirements

### Requirement: Threshold-Based Gates
The system SHALL evaluate metrics against configured thresholds.

#### Scenario: Interaction magnitude gate
- **WHEN** any interaction effect exceeds max_interaction_magnitude
- **THEN** the gate fails

#### Scenario: Variance gate
- **WHEN** any profile variance exceeds max_profile_variance
- **THEN** the gate fails (or profile is flagged, depending on config)

### Requirement: Gate Failure Reporting
When a gate fails, the system SHALL provide clear explanation.

#### Scenario: Failure message
- **WHEN** interaction (demographic × skill_match) = 0.7 exceeds threshold 0.5
- **THEN** the report states: "GATE FAILED: demographic × skill_match interaction (0.7) exceeds threshold (0.5)"

### Requirement: Non-Zero Exit on Gate Failure
The system SHALL exit with non-zero status when gates fail.

#### Scenario: Exit code
- **WHEN** any gate fails
- **THEN** the CLI exits with code 1

### Requirement: Gate Summary
The system SHALL include a gate summary in the report.

#### Scenario: Pass summary
- **WHEN** all gates pass
- **THEN** report includes "All quality gates passed"

#### Scenario: Fail summary
- **WHEN** one or more gates fail
- **THEN** report lists each failed gate with metric value and threshold
