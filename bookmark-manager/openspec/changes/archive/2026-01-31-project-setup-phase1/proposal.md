## Why

The bookmark manager project needs a foundation before any features can be built. There is currently no application code, no project structure, and no tech stack decision. Phase 1 establishes the repository structure, tooling, and deployment pipeline so that all subsequent phases (auth, CRUD, tagging, search, sharing) can build on a working, deployable skeleton.

## What Changes

- Select and lock in the tech stack: Next.js (App Router) + TypeScript for frontend and API routes, PostgreSQL for the database, Prisma as the ORM, and Tailwind CSS for styling
- Initialize the Next.js project with TypeScript configuration
- Set up Prisma with an initial database schema (empty migrations, connection config)
- Configure ESLint and Prettier for consistent code style
- Set up Vitest for unit/integration testing with a passing smoke test
- Create a minimal deployable app (health-check page/endpoint) to validate the pipeline
- Configure deployment to Vercel with environment variable management
- Add a `.env.example` documenting required environment variables

## Capabilities

### New Capabilities

- `project-structure`: Repository layout, directory conventions, and TypeScript/Next.js configuration
- `dev-tooling`: Linting (ESLint), formatting (Prettier), testing (Vitest), and local development workflow
- `database-setup`: PostgreSQL connection via Prisma, migration workflow, and schema conventions
- `deployment-pipeline`: Vercel deployment configuration, environment variables, and health-check endpoint

### Modified Capabilities

_None — this is a greenfield project with no existing specs._

## Impact

- **Repository**: Entire project structure created from scratch
- **Dependencies**: Next.js, TypeScript, Prisma, PostgreSQL driver, Tailwind CSS, Vitest, ESLint, Prettier
- **Deployment**: Vercel project created and connected to the repository
- **Environment**: Requires a PostgreSQL database URL (local for dev, hosted for production)
