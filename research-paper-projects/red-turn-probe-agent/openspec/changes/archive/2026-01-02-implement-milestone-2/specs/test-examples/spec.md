# Test Examples Specification

## ADDED Requirements

### Requirement: Positive Example Coverage
The system SHALL provide at least 5 positive test examples of conversations with contradictions.

#### Scenario: Minimum positive examples
- **WHEN** counting positive examples
- **THEN** at least 5 examples are present

#### Scenario: Clear contradictions demonstrated
- **WHEN** reviewing positive examples
- **THEN** each contains an obvious self-contradiction

#### Scenario: Positive examples validated
- **WHEN** applying the rubric to positive examples
- **THEN** all are correctly classified as containing contradictions

### Requirement: Negative Example Coverage
The system SHALL provide at least 5 negative test examples of conversations without contradictions.

#### Scenario: Minimum negative examples
- **WHEN** counting negative examples
- **THEN** at least 5 examples are present

#### Scenario: No contradictions demonstrated
- **WHEN** reviewing negative examples
- **THEN** each maintains consistency or acknowledges position changes

#### Scenario: Negative examples validated
- **WHEN** applying the rubric to negative examples
- **THEN** all are correctly classified as not containing contradictions

### Requirement: Example Structure
The system SHALL store test examples in a structured, machine-readable format.

#### Scenario: JSON format used
- **WHEN** storing examples
- **THEN** each is saved as a JSON file

#### Scenario: Conversation structure preserved
- **WHEN** an example is stored
- **THEN** it contains the full conversation with roles and content

#### Scenario: Expected result documented
- **WHEN** an example is created
- **THEN** it includes the expected rubric result (true or false)

#### Scenario: Rationale provided
- **WHEN** reviewing an example
- **THEN** a human-readable rationale explains why it should pass or fail

### Requirement: Manual Validation
The system SHALL ensure all examples are manually reviewed and confirmed accurate.

#### Scenario: Human verification completed
- **WHEN** examples are added to the test set
- **THEN** they have been manually reviewed for correctness

#### Scenario: Edge cases included
- **WHEN** creating test examples
- **THEN** challenging cases (acknowledged changes, ambiguous positions) are included

#### Scenario: Examples cover variation
- **WHEN** reviewing the test set
- **THEN** examples demonstrate different types of contradictions and consistencies

### Requirement: Automated Validation Script
The system SHALL provide a script to validate rubric against all test examples.

#### Scenario: Validation script executable
- **WHEN** running the validation script
- **THEN** it loads all examples and tests the rubric

#### Scenario: Pass/fail reporting
- **WHEN** validation completes
- **THEN** it reports which examples passed and which failed

#### Scenario: Zero tolerance for failures
- **WHEN** any example is misclassified
- **THEN** the validation script reports failure and identifies the problem

#### Scenario: Regression protection
- **WHEN** rubric logic changes
- **THEN** validation can be re-run to ensure no regressions
