## ADDED Requirements

### Requirement: Model Execution
The project SHALL execute the prompts and store the raw model outputs.

#### Scenario:
- **WHEN** the application is run
- **THEN** for each task, the standard and chain-of-thought prompts are executed.
- **AND** the raw model outputs are stored in the `src/results` directory.

### Requirement: Result File Naming
The result files SHALL be named using the format `<task-id>-<prompt-type>.txt`.

#### Scenario:
- **WHEN** the results are stored
- **THEN** the file names are in the format `<task-id>-<prompt-type>.txt`.
