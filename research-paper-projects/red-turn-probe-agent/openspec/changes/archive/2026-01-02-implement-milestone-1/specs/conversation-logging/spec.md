# Conversation Logging Specification

## ADDED Requirements

### Requirement: Full Conversation Capture
The system SHALL log all user prompts and model responses.

#### Scenario: All turns logged
- **WHEN** a conversation completes
- **THEN** both Turn 1 and Turn 2 (user messages and model responses) are captured

#### Scenario: Verbatim content preserved
- **WHEN** messages are logged
- **THEN** the exact text of prompts and responses is recorded without modification

#### Scenario: Message roles identified
- **WHEN** logging conversation turns
- **THEN** each message is tagged with its role (user or assistant)

### Requirement: Structured Log Format
The system SHALL output logs in a machine-readable JSON format.

#### Scenario: JSON Lines format used
- **WHEN** conversations are logged
- **THEN** each conversation is written as a single JSON object on one line

#### Scenario: Conversation array included
- **WHEN** a log entry is created
- **THEN** it contains a conversation array with all messages in order

#### Scenario: Parseable by standard tools
- **WHEN** log files are processed
- **THEN** they can be read with JSON parsers and command-line tools like jq

### Requirement: Metadata Tracking
The system SHALL record metadata about each conversation.

#### Scenario: Timestamp recorded
- **WHEN** a conversation is logged
- **THEN** an ISO 8601 timestamp of when it occurred is included

#### Scenario: Model identifier logged
- **WHEN** a conversation is logged
- **THEN** the target model name is recorded

#### Scenario: Detection results included
- **WHEN** success detection runs
- **THEN** the boolean detection result is logged with the conversation

### Requirement: Log File Management
The system SHALL write logs to a designated file location.

#### Scenario: Logs directory exists
- **WHEN** logging occurs
- **THEN** logs are written to a logs/ directory

#### Scenario: Append-only logging
- **WHEN** multiple runs occur
- **THEN** new log entries are appended without overwriting previous logs

#### Scenario: Log file naming
- **WHEN** creating log files
- **THEN** a consistent naming convention is used (e.g., conversations.jsonl)
