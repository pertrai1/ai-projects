## MODIFIED Requirements
### Requirement: CLI prompt runner
The system SHALL provide a CLI command that accepts flags for template selection and input text and prints the constructed prompt to stdout.

#### Scenario: Run CLI with flags
- **WHEN** the user runs the CLI with a template flag and input flag
- **THEN** stdout contains the exact prompt text produced by the selected template

#### Scenario: Run CLI with file or stdin input
- **WHEN** the user provides input via a file path or stdin
- **THEN** the prompt is constructed using the resolved input text
