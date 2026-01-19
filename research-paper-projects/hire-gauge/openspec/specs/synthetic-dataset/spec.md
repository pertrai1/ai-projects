# synthetic-dataset Specification

## Purpose
TBD - created by archiving change implement-hire-gauge. Update Purpose after archive.
## Requirements
### Requirement: Full Factorial Design
The system SHALL generate synthetic candidate profiles using full factorial design.

#### Scenario: Factorial expansion
- **WHEN** factors are: experience [3 levels], skill_match [3 levels], demographic [2 levels]
- **THEN** the system generates exactly 3 × 3 × 2 = 18 unique profiles

#### Scenario: Independent variation
- **WHEN** profiles are generated
- **THEN** each attribute varies independently with no baked-in correlations

### Requirement: Profile Identity
Each profile SHALL have a stable unique identifier.

#### Scenario: Deterministic IDs
- **WHEN** profiles are generated with the same seed
- **THEN** the same profile IDs are produced across runs

#### Scenario: ID format
- **WHEN** a profile is created
- **THEN** it has an ID like `profile-001` that is stable and sortable

### Requirement: Profile Representation
Each profile SHALL include both structured and natural-language representations.

#### Scenario: JSON representation
- **WHEN** a profile is serialized
- **THEN** it includes structured JSON with all factor values

#### Scenario: Natural language rendering
- **WHEN** a profile is rendered for prompting
- **THEN** it produces a coherent natural-language description suitable for LLM input

### Requirement: Deterministic Generation
Profile generation SHALL be deterministic given a seed.

#### Scenario: Seed reproducibility
- **WHEN** the same spec with seed=42 is used twice
- **THEN** the exact same profiles are generated in the same order

### Requirement: Profile Count Validation
The system SHALL verify the profile count matches factorial expectations.

#### Scenario: Count verification
- **WHEN** profiles are generated
- **THEN** the total count equals the product of all factor level counts

