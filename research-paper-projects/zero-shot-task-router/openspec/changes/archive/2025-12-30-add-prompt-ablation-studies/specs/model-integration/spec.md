## MODIFIED Requirements
### Requirement: CLI completion mode
The system SHALL provide a CLI option to execute the rendered prompt through the OpenAI client and print the completion output.

#### Scenario: Run completion
- **WHEN** the CLI is invoked with completion enabled and a prompt template
- **THEN** it prints the model completion to stdout

#### Scenario: Run completion for multiple templates
- **WHEN** the CLI is invoked with completion enabled for multiple templates
- **THEN** it prints the completion output for each template in order
