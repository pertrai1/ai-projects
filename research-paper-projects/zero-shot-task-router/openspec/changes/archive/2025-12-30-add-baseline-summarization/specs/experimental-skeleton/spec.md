## MODIFIED Requirements
### Requirement: Prompt template rendering
The system SHALL define prompt templates as first-class objects that render unadorned prompt text from provided input.

#### Scenario: Render unadorned prompt
- **WHEN** a template is rendered with input text
- **THEN** the output is the template's text with the input inserted and no extra markers or labels added

#### Scenario: Render baseline summarization prompt
- **WHEN** the baseline summarization template is rendered with input text
- **THEN** the prompt text contains the baseline summarization instruction followed by the input text without extra markers
