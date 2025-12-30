## ADDED Requirements
### Requirement: Summarization prompt variants
The system SHALL provide 3–4 minimal summarization prompt variants for ablation studies.

#### Scenario: Render summarization variants
- **WHEN** a summarization variant is rendered with input text
- **THEN** the prompt text uses the variant's minimal phrasing followed by the input text

### Requirement: Observations log
The system SHALL provide a Phase 5 observations template under `observations/` for documenting prompt variants and outputs.

#### Scenario: Record ablation outputs
- **WHEN** a user runs a prompt ablation
- **THEN** they can record the variants and outputs in the observations template
