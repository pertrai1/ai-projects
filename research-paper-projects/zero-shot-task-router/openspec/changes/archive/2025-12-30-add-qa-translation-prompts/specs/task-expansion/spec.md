## ADDED Requirements
### Requirement: QA prompt template
The system SHALL provide a minimal QA prompt template that accepts a single input string containing the question (and optional context).

#### Scenario: Render QA prompt
- **WHEN** the QA template is rendered with input text
- **THEN** the prompt text contains a minimal QA instruction followed by the input text

### Requirement: Translation prompt template
The system SHALL provide an English-to-Spanish translation prompt template that accepts a single input string.

#### Scenario: Render translation prompt
- **WHEN** the translation template is rendered with input text
- **THEN** the prompt text contains a minimal translation instruction followed by the input text

### Requirement: Phase 6 observations template
The system SHALL provide a Phase 6 observations template under `observations/` for logging QA and translation runs.

#### Scenario: Record task expansion outputs
- **WHEN** a user runs the QA and translation prompts
- **THEN** they can record inputs and outputs in the Phase 6 observations template
