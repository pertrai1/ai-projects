# experimental-skeleton Specification

## Purpose
TBD - created by archiving change add-experimental-skeleton. Update Purpose after archive.
## Requirements
### Requirement: Prompt template rendering
The system SHALL define prompt templates as first-class objects that render unadorned prompt text from provided input.

#### Scenario: Render unadorned prompt
- **WHEN** a template is rendered with input text
- **THEN** the output is the template's text with the input inserted and no extra markers or labels added

#### Scenario: Render baseline summarization prompt
- **WHEN** the baseline summarization template is rendered with input text
- **THEN** the prompt text contains the baseline summarization instruction followed by the input text without extra markers

### Requirement: CLI prompt runner
The system SHALL provide a CLI command that accepts flags for template selection and input text and prints the constructed prompt to stdout.

#### Scenario: Run CLI with flags
- **WHEN** the user runs the CLI with a template flag and input flag
- **THEN** stdout contains the exact prompt text produced by the selected template

### Requirement: Stub model client
The system SHALL include a language model client interface with a stub implementation that produces a deterministic placeholder completion without calling an external service.

#### Scenario: Call stub client
- **WHEN** the stub client is invoked with a prompt string
- **THEN** it returns a deterministic placeholder completion string

