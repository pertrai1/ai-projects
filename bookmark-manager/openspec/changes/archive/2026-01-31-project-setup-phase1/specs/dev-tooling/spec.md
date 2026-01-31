## ADDED Requirements

### Requirement: ESLint configuration
The project SHALL include ESLint configured with the Next.js recommended rules and TypeScript support.

#### Scenario: Lint command runs
- **WHEN** a developer runs `npm run lint`
- **THEN** ESLint SHALL check all TypeScript files in `src/`
- **AND** the command SHALL exit with code 0 on a clean project

#### Scenario: Lint catches errors
- **WHEN** code contains an unused variable
- **THEN** `npm run lint` SHALL report an error

### Requirement: Prettier configuration
The project SHALL include Prettier for consistent code formatting with a `.prettierrc` config file.

#### Scenario: Format check command
- **WHEN** a developer runs `npm run format:check`
- **THEN** Prettier SHALL report whether all files match the configured style

#### Scenario: Format fix command
- **WHEN** a developer runs `npm run format`
- **THEN** Prettier SHALL auto-fix formatting in all source files

### Requirement: Vitest test runner
The project SHALL use Vitest as the test runner with a `vitest.config.ts` configuration file.

#### Scenario: Test command runs
- **WHEN** a developer runs `npm test`
- **THEN** Vitest SHALL execute all `*.test.ts` files in the `tests/` directory
- **AND** the command SHALL exit with code 0 when all tests pass

#### Scenario: Smoke test exists
- **WHEN** the project is freshly initialized
- **THEN** there SHALL be at least one passing test that verifies the test infrastructure works (e.g., `expect(true).toBe(true)`)

### Requirement: Development server
The project SHALL support a local development server with hot module replacement.

#### Scenario: Dev server starts
- **WHEN** a developer runs `npm run dev`
- **THEN** a local development server SHALL start on port 3000
- **AND** changes to source files SHALL trigger automatic reloading
