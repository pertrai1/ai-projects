### Requirement: Prisma ORM integration
The project SHALL use Prisma as the ORM with a `prisma/schema.prisma` file as the single source of truth for the database schema.

#### Scenario: Prisma schema is valid
- **WHEN** a developer runs `npx prisma validate`
- **THEN** the schema SHALL pass validation with no errors

#### Scenario: Prisma client is generated
- **WHEN** a developer runs `npx prisma generate`
- **THEN** a typed Prisma client SHALL be generated and importable from `src/lib/prisma.ts`

### Requirement: PostgreSQL connection
The project SHALL connect to a PostgreSQL database using a connection string from the `DATABASE_URL` environment variable.

#### Scenario: Database connection configured
- **WHEN** `prisma/schema.prisma` and `prisma.config.ts` are inspected
- **THEN** the datasource provider in `schema.prisma` SHALL be `postgresql`
- **AND** `prisma.config.ts` SHALL reference the `DATABASE_URL` environment variable for the datasource URL

#### Scenario: Missing database URL
- **WHEN** `DATABASE_URL` is not set
- **THEN** any database operation SHALL fail with a clear error message rather than silently using a default

### Requirement: Migration workflow
The project SHALL support Prisma migrations for evolving the database schema.

#### Scenario: Create a migration
- **WHEN** a developer modifies `prisma/schema.prisma` and runs `npx prisma migrate dev`
- **THEN** a new migration SQL file SHALL be created in `prisma/migrations/`

#### Scenario: Initial schema is minimal
- **WHEN** the initial schema is inspected
- **THEN** it SHALL contain only the datasource and generator configuration with no models (models will be added in later phases)

### Requirement: Singleton Prisma client
The project SHALL export a singleton Prisma client from `src/lib/prisma.ts` to prevent multiple client instances in development (Next.js hot reload issue).

#### Scenario: Prisma client reuse in development
- **WHEN** Next.js hot-reloads during development
- **THEN** the same Prisma client instance SHALL be reused via `globalThis` caching
