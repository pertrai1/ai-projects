## ADDED Requirements
### Requirement: Baseline summarization prompt
The system SHALL provide a baseline summarization prompt template with minimal phrasing to serve as a weak zero-shot baseline.

#### Scenario: Render baseline summary prompt
- **WHEN** the baseline summarization template is rendered with input text
- **THEN** the prompt text contains only a minimal summarization instruction followed by the input text
