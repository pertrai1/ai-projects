## ADDED Requirements

### Requirement: Answer Extraction
The project SHALL extract the final answer from the model output.

#### Scenario:
- **WHEN** the `extractAnswer` function is called with a model output
- **THEN** it returns the extracted final answer.

### Requirement: Evaluation
The project SHALL evaluate the extracted answer against the expected answer.

#### Scenario:
- **WHEN** the `evaluate` function is called with an extracted answer and an expected answer
- **THEN** it returns `true` if the answers match and `false` otherwise.

### Requirement: Results Storage
The project SHALL store the evaluation results in a structured JSON file.

#### Scenario:
- **WHEN** the evaluation is complete
- **THEN** the results are stored in `src/results/output.json`.
