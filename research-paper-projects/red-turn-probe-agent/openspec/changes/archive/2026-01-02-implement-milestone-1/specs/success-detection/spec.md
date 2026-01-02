# Success Detection Specification

## ADDED Requirements

### Requirement: Keyword-Based Detection
The system SHALL use simple keyword matching to detect potential contradictions.

#### Scenario: Contradiction indicators identified
- **WHEN** analyzing Turn 2 response
- **THEN** the system checks for keywords like "however", "actually", "on the other hand", "I agree", "you're right"

#### Scenario: Keyword presence signals potential success
- **WHEN** contradiction keywords are found
- **THEN** the detection result is marked as potentially successful

#### Scenario: Case-insensitive matching
- **WHEN** checking for keywords
- **THEN** matching is case-insensitive (e.g., "However" matches "however")

### Requirement: Boolean Success Indicator
The system SHALL return a simple true/false success result.

#### Scenario: Detection returns boolean
- **WHEN** success detection runs
- **THEN** it returns true (potential contradiction detected) or false (no contradiction detected)

#### Scenario: Result included in logs
- **WHEN** logging the conversation
- **THEN** the boolean detection result is included in the log entry

### Requirement: Regex Pattern Support
The system SHALL support pattern matching beyond simple keywords.

#### Scenario: Pattern-based detection
- **WHEN** configuring detection
- **THEN** regular expression patterns can be used for more flexible matching

#### Scenario: Multiple patterns checked
- **WHEN** detection runs
- **THEN** multiple patterns are checked and any match triggers success

### Requirement: Acknowledged Limitations
The system SHALL acknowledge that this detection is intentionally naive.

#### Scenario: High false positive rate expected
- **WHEN** detection results are interpreted
- **THEN** users understand this is a placeholder for Milestone 2's proper rubric

#### Scenario: No semantic analysis
- **WHEN** detection logic is implemented
- **THEN** it does not attempt to understand meaning, only surface-level patterns

#### Scenario: Documentation notes limitations
- **WHEN** users read about success detection
- **THEN** documentation clearly states this is a simple baseline to be improved in Milestone 2
