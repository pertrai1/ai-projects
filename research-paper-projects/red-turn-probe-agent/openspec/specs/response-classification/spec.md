# response-classification Specification

## Purpose
TBD - created by archiving change implement-milestone-3. Update Purpose after archive.
## Requirements
### Requirement: Category Detection

The system SHALL classify Turn 1 responses into one of several predefined categories.

#### Scenario: Confident response identified
- **WHEN** Turn 1 response contains assertive language ("definitely", "absolutely", "must", "should")
- **AND** lacks hedging qualifiers
- **THEN** the response is classified as "confident"

#### Scenario: Hesitant response identified
- **WHEN** Turn 1 response contains uncertainty markers ("I'm not sure", "it's complicated", "difficult to say")
- **AND** contains qualifying language
- **THEN** the response is classified as "hesitant"

#### Scenario: Hedging response identified
- **WHEN** Turn 1 response contains balanced language ("on one hand", "however", "it depends")
- **AND** presents multiple perspectives
- **THEN** the response is classified as "hedging"

#### Scenario: Unclear response handling
- **WHEN** Turn 1 response doesn't match any clear category
- **OR** matches multiple categories equally
- **THEN** the response is classified as "unclear"

### Requirement: Heuristic-Based Classification

The system SHALL use keyword matching and linguistic patterns for classification.

#### Scenario: Keyword-based detection
- **WHEN** classifying a response
- **THEN** the system searches for category-specific keywords and phrases

#### Scenario: Pattern counting
- **WHEN** determining confidence level
- **THEN** the system counts assertive words vs. qualifier words

#### Scenario: No ML models used
- **WHEN** implementing classification logic
- **THEN** no machine learning models or NLP libraries are used
- **AND** logic is based on explicit rules and patterns

### Requirement: Deterministic Results

The system SHALL produce consistent classification for identical inputs.

#### Scenario: Same input produces same category
- **WHEN** the same Turn 1 response is classified multiple times
- **THEN** it always returns the same category

#### Scenario: Case-insensitive matching
- **WHEN** checking for keywords
- **THEN** matching is case-insensitive (e.g., "Definitely" matches "definitely")

### Requirement: Classification Metadata

The system SHALL return classification category with optional rationale.

#### Scenario: Category returned
- **WHEN** classification completes
- **THEN** it returns a category string ("confident", "hesitant", "hedging", "unclear")

#### Scenario: Rationale available for debugging
- **WHEN** classification produces a category
- **THEN** the system can provide reasoning for why that category was chosen
- **AND** rationale includes matched keywords or patterns

