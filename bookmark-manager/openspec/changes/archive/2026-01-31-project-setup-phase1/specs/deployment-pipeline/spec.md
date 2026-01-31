## ADDED Requirements

### Requirement: Health-check API endpoint
The application SHALL expose a `GET /api/health` endpoint that returns the application status.

#### Scenario: Health check returns OK
- **WHEN** a GET request is made to `/api/health`
- **THEN** the response status SHALL be 200
- **AND** the response body SHALL be JSON containing `{ "status": "ok" }`

#### Scenario: Health check is unauthenticated
- **WHEN** a GET request is made to `/api/health` without any credentials
- **THEN** the response SHALL still return 200 with the status payload

### Requirement: Health-check page
The application SHALL display a minimal home page confirming the app is running.

#### Scenario: Home page renders
- **WHEN** a user navigates to `/`
- **THEN** the page SHALL render with the application name "Bookmark Manager"
- **AND** the page SHALL indicate the app is running successfully

### Requirement: Vercel deployment configuration
The project SHALL be deployable to Vercel with the root directory set to `bookmark-manager/`.

#### Scenario: Vercel build succeeds
- **WHEN** Vercel runs the build step
- **THEN** `npm run build` SHALL complete without errors

#### Scenario: Environment variables on Vercel
- **WHEN** the project is deployed to Vercel
- **THEN** `DATABASE_URL` SHALL be configured as an environment variable in the Vercel dashboard
- **AND** the application SHALL use it to connect to the production database

### Requirement: Production database
The deployment SHALL use a hosted PostgreSQL instance (Neon, Vercel Postgres, or similar free tier).

#### Scenario: Production database is accessible
- **WHEN** the application is deployed to Vercel
- **THEN** it SHALL connect to the hosted PostgreSQL instance via `DATABASE_URL`
- **AND** the `/api/health` endpoint SHALL return 200
