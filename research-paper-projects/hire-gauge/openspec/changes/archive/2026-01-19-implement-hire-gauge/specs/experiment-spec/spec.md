## ADDED Requirements

### Requirement: Experiment Specification Format
The system SHALL accept experiment configuration via a YAML specification file.

#### Scenario: Valid spec structure
- **WHEN** a spec file defines factors, levels, seed, repetitions, mode, prompt version, thresholds, and model config
- **THEN** the system parses and validates all fields

#### Scenario: Invalid spec rejected
- **WHEN** a spec file is missing required fields or has invalid values
- **THEN** the system fails fast with actionable error messages listing each violation

### Requirement: Factor Definition
The specification SHALL define experimental factors with discrete levels.

#### Scenario: Multi-level factors
- **WHEN** factors define experience: [junior, mid, senior], skill_match: [low, medium, high]
- **THEN** the system recognizes each factor and its levels for factorial expansion

### Requirement: Repetition Configuration
The specification SHALL define the number of repetitions per profile (k).

#### Scenario: Minimum repetitions
- **WHEN** repetitions is set to k >= 2
- **THEN** the system accepts the configuration
- **AND** evaluates each profile k times

#### Scenario: Insufficient repetitions
- **WHEN** repetitions is set to k < 2
- **THEN** the system rejects the spec with an error

### Requirement: Threshold Configuration
The specification SHALL define quality gate thresholds.

#### Scenario: Interaction threshold
- **WHEN** max_interaction_magnitude is set to 0.5
- **THEN** interaction effects exceeding 0.5 trigger gate failure

#### Scenario: Variance threshold
- **WHEN** max_profile_variance is set to 1.5
- **THEN** profiles with variance exceeding 1.5 are flagged as unstable

### Requirement: Schema Validation
The system SHALL validate specifications against a Zod schema at runtime.

#### Scenario: Schema enforcement
- **WHEN** the spec is loaded
- **THEN** all fields are validated against their expected types and constraints
- **AND** violations produce descriptive error messages with field paths
