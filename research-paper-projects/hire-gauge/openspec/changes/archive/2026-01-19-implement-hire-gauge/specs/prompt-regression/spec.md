## ADDED Requirements

### Requirement: Multiple Prompt Versions
The system SHALL support multiple prompt versions stored in `prompts/`.

#### Scenario: Version loading
- **WHEN** spec specifies prompt_version: "v2"
- **THEN** the system loads `prompts/v2.txt`

### Requirement: Prompt Version Diffing
The CLI SHALL support comparing results across prompt versions.

#### Scenario: Diff command
- **WHEN** user runs `npm run audit -- --diff runs/run-v1 runs/run-v2`
- **THEN** the system compares metrics between runs

### Requirement: Effect Change Highlighting
The diff report SHALL highlight changes in effects.

#### Scenario: Main effect changes
- **WHEN** experience main effect changed from 1.2 to 0.8
- **THEN** the diff shows: "experience: 1.2 → 0.8 (Δ -0.4)"

#### Scenario: Interaction effect changes
- **WHEN** demographic × skill_match interaction changed from 0.3 to 0.6
- **THEN** the diff flags this as a potential regression

### Requirement: Regression Detection
The system SHALL detect significant regressions in prompt behavior.

#### Scenario: Regression threshold
- **WHEN** an interaction effect increases significantly between versions
- **THEN** the diff report flags it as a regression

#### Scenario: Regression warning
- **WHEN** regressions are detected
- **THEN** the report includes explicit warnings about prompt changes that may have introduced bias
