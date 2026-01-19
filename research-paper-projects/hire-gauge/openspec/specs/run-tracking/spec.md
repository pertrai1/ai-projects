# run-tracking Specification

## Purpose
TBD - created by archiving change implement-hire-gauge. Update Purpose after archive.
## Requirements
### Requirement: Run Artifact Directory
Every run SHALL write artifacts to `runs/<runId>/`.

#### Scenario: Directory creation
- **WHEN** a run starts
- **THEN** a unique run directory is created

### Requirement: Input Artifact
The system SHALL persist generated inputs.

#### Scenario: inputs.jsonl
- **WHEN** profiles are generated
- **THEN** they are written to `inputs.jsonl` with one profile per line

### Requirement: Raw Output Artifact
The system SHALL persist raw LLM responses.

#### Scenario: raw_outputs.jsonl
- **WHEN** LLM responses are received
- **THEN** they are written verbatim to `raw_outputs.jsonl`

### Requirement: Parsed Output Artifact
The system SHALL persist validated/parsed outputs.

#### Scenario: parsed_outputs.jsonl
- **WHEN** outputs are validated
- **THEN** parsed results are written to `parsed_outputs.jsonl`

### Requirement: Metrics Artifact
The system SHALL persist computed metrics.

#### Scenario: metrics.json
- **WHEN** analysis completes
- **THEN** all metrics are written to `metrics.json`

### Requirement: Report Artifact
The system SHALL generate a human-readable report.

#### Scenario: report.md
- **WHEN** a run completes
- **THEN** a Markdown report summarizing findings is written to `report.md`

### Requirement: Run Metadata
The system SHALL record run provenance in metadata.

#### Scenario: run_metadata.json contents
- **WHEN** a run completes
- **THEN** `run_metadata.json` includes: model identifier, decoding parameters, prompt version, timestamp, run ID, and git commit hash (if available)

