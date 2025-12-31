## ADDED Requirements

### Requirement: Project Structure
The project SHALL have a `src` directory, and the `src` directory SHALL contain `prompts`, `tasks`, and `results` directories.

#### Scenario: Initial project structure
- **WHEN** the project is initialized
- **THEN** a `src` directory is present at the root of the project
- **AND** the `src` directory contains the subdirectories `prompts`, `tasks`, and `results`.

### Requirement: Placeholder Files
The project SHALL have placeholder files to establish the basic file structure.

#### Scenario: Placeholder files are present
- **WHEN** the project is initialized
- **THEN** the following files are present:
  - `src/index.ts`
  - `src/runner.ts`
  - `src/tasks.json`

### Requirement: Package Configuration
The project SHALL have a `package.json` file with a `start` script.

#### Scenario: `package.json` is configured
- **WHEN** the project is initialized
- **THEN** a `package.json` file is present at the root of the project
- **AND** the `package.json` file contains a `start` script that runs `ts-node src/index.ts`.

### Requirement: TypeScript Configuration
The project SHALL have a `tsconfig.json` file.

#### Scenario: `tsconfig.json` is present
- **WHEN** the project is initialized
- **THEN** a `tsconfig.json` file is present at the root of the project.