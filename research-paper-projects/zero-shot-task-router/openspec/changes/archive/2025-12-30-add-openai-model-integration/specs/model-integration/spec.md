## ADDED Requirements
### Requirement: OpenAI model client
The system SHALL provide an OpenAI model client that authenticates using the `OPENAI_API_KEY` environment variable and uses a single backend.

#### Scenario: Missing API key
- **WHEN** the OpenAI client is initialized without `OPENAI_API_KEY`
- **THEN** the system reports a clear error and does not attempt a request

### Requirement: Fixed decoding parameters
The system SHALL use fixed decoding parameters for OpenAI requests: model `gpt-4o-mini`, temperature 0, top_p 1, and max_tokens 256.

#### Scenario: Execute completion
- **WHEN** a prompt is sent to the OpenAI client
- **THEN** the request uses the fixed model and decoding parameters

### Requirement: CLI completion mode
The system SHALL provide a CLI option to execute the rendered prompt through the OpenAI client and print the completion output.

#### Scenario: Run completion
- **WHEN** the CLI is invoked with completion enabled and a prompt template
- **THEN** it prints the model completion to stdout
