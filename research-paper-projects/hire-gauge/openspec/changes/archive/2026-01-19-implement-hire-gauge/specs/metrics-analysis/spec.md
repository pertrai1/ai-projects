## ADDED Requirements

### Requirement: Per-Profile Variance
The system SHALL compute variance metrics for each profile across repetitions.

#### Scenario: Mean and standard deviation
- **WHEN** a profile is evaluated k times
- **THEN** the system computes mean score and standard deviation

#### Scenario: Unstable profile identification
- **WHEN** a profile's std dev exceeds the variance threshold
- **THEN** it is flagged as unstable in the report

### Requirement: Aggregate Variance Summary
The system SHALL report aggregate variance statistics.

#### Scenario: Summary statistics
- **WHEN** all profiles are evaluated
- **THEN** the report includes overall mean variance, max variance, and count of unstable profiles

### Requirement: Main Effects Computation
The system SHALL compute main effects for all primary factors.

#### Scenario: Difference-in-means
- **WHEN** experience has levels [junior, mid, senior]
- **THEN** main effect is computed as mean score difference between levels

#### Scenario: Factor ranking
- **WHEN** main effects are computed
- **THEN** factors are ranked by effect magnitude to show which signals the model prioritizes

### Requirement: Interaction Effects Computation
The system SHALL compute at least one interaction effect involving a demographic signal.

#### Scenario: Difference-in-differences
- **WHEN** factors include demographic and skill_match
- **THEN** the interaction effect (demographic × skill_match) is computed using difference-in-differences

#### Scenario: Interaction interpretation
- **WHEN** interaction is non-zero
- **THEN** it indicates the model applies different standards to different groups

### Requirement: Metrics Persistence
All computed metrics SHALL be persisted in `metrics.json`.

#### Scenario: Metrics structure
- **WHEN** metrics are written
- **THEN** the file includes main_effects, interaction_effects, variance_summary, and per_profile_stats
