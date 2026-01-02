# Success Detection Specification

## MODIFIED Requirements

### Requirement: Rubric-Based Detection
The system SHALL use a precise rubric to detect self-contradictions.

#### Scenario: Rubric function exists
- **WHEN** success detection is needed
- **THEN** a rubric function is called with the conversation

#### Scenario: Boolean result returned
- **WHEN** rubric evaluation completes
- **THEN** it returns true (contradiction detected) or false (no contradiction detected)

#### Scenario: Result included in logs
- **WHEN** logging the conversation
- **THEN** the boolean detection result is included in the log entry

## REMOVED Requirements

### Requirement: Keyword-Based Detection
**Reason**: Replaced by proper rubric in Milestone 2
**Migration**: Function signature remains the same (conversation -> bool), implementation changes

### Requirement: Regex Pattern Support
**Reason**: Rubric uses position detection logic instead of patterns
**Migration**: No user-facing changes, internal implementation only

### Requirement: Acknowledged Limitations
**Reason**: Rubric is now trustworthy, not intentionally naive
**Migration**: Update documentation to reflect improved detection
