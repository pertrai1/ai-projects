### Requirement: Next.js App Router project initialization
The system SHALL be a Next.js application using the App Router with TypeScript in strict mode. The project SHALL be initialized with `create-next-app` defaults for App Router.

#### Scenario: Project builds successfully
- **WHEN** a developer runs `npm run build`
- **THEN** the project compiles with zero errors

#### Scenario: TypeScript strict mode enforced
- **WHEN** the `tsconfig.json` is inspected
- **THEN** `strict` SHALL be set to `true`

### Requirement: Source directory layout
The application code SHALL live under `src/` with `src/app/` for Next.js routes and API handlers, and `src/lib/` for shared utilities.

#### Scenario: App directory contains routes
- **WHEN** a developer looks at `src/app/`
- **THEN** it SHALL contain `layout.tsx`, `page.tsx`, and an `api/` directory for API route handlers

#### Scenario: Shared code in lib directory
- **WHEN** a developer needs to import shared utilities (e.g., Prisma client)
- **THEN** they SHALL import from `src/lib/`

### Requirement: Tailwind CSS configuration
The project SHALL include Tailwind CSS configured to scan all files in `src/`.

#### Scenario: Tailwind classes render correctly
- **WHEN** a Tailwind utility class (e.g., `bg-blue-500`) is used in a component
- **THEN** the corresponding CSS SHALL be included in the build output

### Requirement: Environment variable template
A `.env.example` file SHALL exist at the project root documenting all required environment variables with placeholder values.

#### Scenario: Developer sets up environment
- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** all required variable names SHALL be present with comments explaining each one
- **AND** `.env` SHALL be listed in `.gitignore`
