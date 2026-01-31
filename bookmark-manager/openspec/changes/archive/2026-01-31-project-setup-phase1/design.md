## Context

This is a greenfield project with no existing code. The bookmark manager needs a solid foundation that supports 8 subsequent feature phases (auth, CRUD, tagging, search, folders, sharing, testing patterns, deployment). The stack must be TypeScript/Node.js-based and straightforward to implement.

The project lives inside an `ai-projects` monorepo at `bookmark-manager/`. All application code will be created within this directory.

## Goals / Non-Goals

**Goals:**

- Establish a working Next.js App Router project with TypeScript strict mode
- Configure Prisma with PostgreSQL, ready for feature schemas in later phases
- Set up linting, formatting, and testing so every future phase starts with quality guardrails
- Deploy a minimal app to Vercel to prove the pipeline works end-to-end
- Document environment setup so onboarding is frictionless

**Non-Goals:**

- No feature code — no auth, no bookmarks, no UI beyond a health-check page
- No CI/CD pipeline (GitHub Actions) — Vercel handles builds on push
- No Docker or containerization — local PostgreSQL and Vercel's managed infra are sufficient
- No component library selection — Tailwind utility classes are enough for now

## Decisions

### 1. Next.js App Router (over Pages Router or standalone Express)

App Router is the current standard for Next.js. It provides server components, API route handlers via `app/api/`, and layouts out of the box. This avoids maintaining a separate backend server — API routes and frontend live in one codebase.

*Alternative considered:* Separate Express API + React SPA. Rejected because it doubles deployment complexity and the bookmark manager doesn't need a dedicated API server.

### 2. Prisma ORM (over Drizzle, Knex, or raw SQL)

Prisma provides a declarative schema, auto-generated TypeScript types, and a migration CLI. The schema file serves as the single source of truth for the database. This is the most straightforward option for a TypeScript project.

*Alternative considered:* Drizzle ORM — lighter weight and closer to SQL, but Prisma's migration tooling and studio UI are better for a project that will evolve through many schema changes.

### 3. PostgreSQL (over SQLite or MySQL)

PostgreSQL supports full-text search natively (Phase 6 requirement), JSON columns for flexible metadata, and is the default on Vercel Postgres / Neon / Supabase. Choosing it now avoids a database migration later.

*Alternative considered:* SQLite for simplicity. Rejected because it doesn't support full-text search well and doesn't deploy easily to Vercel.

### 4. Vitest (over Jest)

Vitest is ESM-native, uses the same Vite config pipeline, and is significantly faster than Jest for TypeScript projects. It's a drop-in replacement with a near-identical API.

*Alternative considered:* Jest — more widespread but requires extra configuration for ESM and TypeScript, and slower.

### 5. Single `.env` file with `.env.example` template

Environment variables managed through a single `.env` file (gitignored) with a committed `.env.example` showing required keys. Vercel environment variables configured through their dashboard for production.

### 6. Directory structure

```
bookmark-manager/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/              # Shared utilities, Prisma client
│       └── prisma.ts
├── prisma/
│   └── schema.prisma
├── tests/
│   └── health.test.ts
├── .env.example
├── .prettierrc
├── eslint.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

`src/app/` for Next.js routes, `src/lib/` for shared code, `prisma/` at root for schema, `tests/` at root for test files. This follows Next.js conventions and keeps concerns separated.

## Risks / Trade-offs

- **[Prisma cold starts on serverless]** → Acceptable for a bookmark manager's traffic levels. Can add connection pooling (Prisma Accelerate or PgBouncer) later if needed.
- **[PostgreSQL requires external database]** → Use a free tier on Neon or Vercel Postgres for development. Document setup in `.env.example`.
- **[Monorepo path]** → The project lives inside `ai-projects/`. Vercel needs the root directory set to `bookmark-manager/` in project settings.
- **[No CI pipeline]** → Relying on Vercel's build step for deployment checks. Developers must run `npm run lint` and `npm test` locally. CI can be added later if needed.
