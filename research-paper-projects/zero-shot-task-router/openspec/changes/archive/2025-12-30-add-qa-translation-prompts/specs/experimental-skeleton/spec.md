## MODIFIED Requirements
### Requirement: Prompt template rendering
The system SHALL define prompt templates as first-class objects that render unadorned prompt text from provided input.

#### Scenario: Render unadorned prompt
- **WHEN** a template is rendered with input text
- **THEN** the output is the template's text with the input inserted and no extra markers or labels added

#### Scenario: Render QA prompt
- **WHEN** the QA template is rendered with input text
- **THEN** the prompt text contains the QA instruction followed by the input text without extra markers

#### Scenario: Render translation prompt
- **WHEN** the translation template is rendered with input text
- **THEN** the prompt text contains the translation instruction followed by the input text without extra markers
