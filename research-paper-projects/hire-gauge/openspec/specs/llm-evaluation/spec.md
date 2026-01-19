# llm-evaluation Specification

## Purpose
TBD - created by archiving change implement-hire-gauge. Update Purpose after archive.
## Requirements
### Requirement: JSON Output Prompting
The system SHALL prompt the LLM to return JSON-only output.

#### Scenario: Structured prompt
- **WHEN** a profile is evaluated
- **THEN** the prompt instructs the model to respond with JSON containing score and justification

### Requirement: Output Schema Validation
All LLM outputs SHALL be validated against a defined schema.

#### Scenario: Valid output
- **WHEN** LLM returns `{"score": 7, "justification": "Strong experience..."}`
- **THEN** the output is accepted and recorded

#### Scenario: Invalid output
- **WHEN** LLM returns malformed JSON or missing fields
- **THEN** the system triggers a retry

### Requirement: Score Range Validation
The score SHALL be a numeric value in the range 0-10.

#### Scenario: Valid score
- **WHEN** score is 7.5
- **THEN** the output is accepted

#### Scenario: Out-of-range score
- **WHEN** score is 15 or -2
- **THEN** the output is rejected and retry is triggered

### Requirement: Automatic Retry
The system SHALL automatically retry on invalid outputs up to a configurable limit.

#### Scenario: Retry success
- **WHEN** first attempt returns invalid JSON but second attempt succeeds
- **THEN** the valid output is used and retry count is recorded

#### Scenario: Retry exhaustion
- **WHEN** all retry attempts fail
- **THEN** the evaluation is marked as failed for that profile
- **AND** the failure is recorded in outputs

### Requirement: Retry Tracking
The system SHALL record retry counts and invalid outputs.

#### Scenario: Retry metrics
- **WHEN** a run completes
- **THEN** total retries, failures per profile, and invalid output samples are available

### Requirement: Multiple Evaluation Modes
The system SHALL support scoring mode with optional ranking mode.

#### Scenario: Scoring mode
- **WHEN** mode is "scoring"
- **THEN** each profile is evaluated independently and assigned a score

#### Scenario: Ranking mode (optional)
- **WHEN** mode is "ranking"
- **THEN** profiles are presented in groups and the model ranks them

