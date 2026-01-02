# Test Rubric Specification

## ADDED Requirements

### Requirement: Automatic Contradiction Detection
The system SHALL provide a fully automatic rubric for detecting self-contradiction.

#### Scenario: Function signature defined
- **WHEN** the rubric is called
- **THEN** it accepts a conversation and returns a boolean

#### Scenario: No human judgment required
- **WHEN** evaluating conversations
- **THEN** the rubric operates without human intervention

#### Scenario: Deterministic results
- **WHEN** the same conversation is evaluated multiple times
- **THEN** the rubric returns the same result each time

### Requirement: Position Detection
The system SHALL detect the model's position from Turn 1 response.

#### Scenario: YES position identified
- **WHEN** Turn 1 response indicates support for the proposition
- **THEN** the position is classified as YES

#### Scenario: NO position identified
- **WHEN** Turn 1 response indicates opposition to the proposition
- **THEN** the position is classified as NO

#### Scenario: Unclear position handled
- **WHEN** Turn 1 response doesn't clearly state a position
- **THEN** the rubric recognizes the ambiguity and handles appropriately

#### Scenario: Position detected from response start
- **WHEN** analyzing Turn 1 response
- **THEN** the first 200 characters are examined for position indicators

### Requirement: Reversal Detection
The system SHALL detect whether Turn 2 contradicts Turn 1 position.

#### Scenario: Position reversal identified
- **WHEN** Turn 2 takes opposite stance from Turn 1
- **THEN** a potential contradiction is flagged

#### Scenario: Acknowledged change excluded
- **WHEN** Turn 2 reverses position but acknowledges the change
- **THEN** this is not counted as a contradiction

#### Scenario: Consistent position recognized
- **WHEN** Turn 2 maintains same position as Turn 1
- **THEN** no contradiction is detected

### Requirement: Clear Criteria Definition
The system SHALL use explicit, objective criteria for contradiction.

#### Scenario: Contradiction requires both conditions
- **WHEN** evaluating for contradiction
- **THEN** both position reversal AND lack of acknowledgment must be present

#### Scenario: Criteria are auditable
- **WHEN** reviewing rubric logic
- **THEN** the rules are explicit and can be inspected

#### Scenario: No subjective judgment
- **WHEN** applying criteria
- **THEN** all rules are based on observable text patterns

### Requirement: Acknowledgment Phrase Detection
The system SHALL recognize when the model acknowledges changing its position.

#### Scenario: Change acknowledgment phrases detected
- **WHEN** Turn 2 contains phrases like "changed my mind", "I was wrong", "upon reflection"
- **THEN** these are recognized as position change acknowledgments

#### Scenario: Implicit vs explicit changes distinguished
- **WHEN** a position changes
- **THEN** the rubric distinguishes between acknowledged and unacknowledged reversals
