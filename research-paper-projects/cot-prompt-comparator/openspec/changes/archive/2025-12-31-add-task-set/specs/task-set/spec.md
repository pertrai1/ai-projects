## ADDED Requirements

### Requirement: Task Set
The project SHALL have a task set defined in `src/tasks.json`.

#### Scenario:
- When the project is initialized, a `src/tasks.json` file is present.

### Requirement: Task List
The `src/tasks.json` file SHALL contain a JSON array of task objects.

#### Scenario:
- When the `src/tasks.json` file is parsed, it produces an array of objects.

### Requirement: Task Structure
Each task object in the task set SHALL have the fields `id`, `category`, `question`, and `expectedAnswer`.

#### Scenario:
- When a task object is inspected, it contains the keys `id`, `category`, `question`, and `expectedAnswer`.
- **WHEN** a task is missing one of the required fields
- **THEN** the validation of the task set fails.