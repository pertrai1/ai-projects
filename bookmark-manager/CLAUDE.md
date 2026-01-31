# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Pattern

Follow the **Anthropic Pattern**: write tests first, confirm they fail, then implement until they pass. This applies to every major feature phase.

## Project Overview

Bookmark manager web application — save bookmarks with auto-fetched previews, tagging with auto-suggestions, full-text search, folder organization with drag-and-drop, and public/private sharing.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma v7 ORM
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest
- **Linting/Formatting:** ESLint + Prettier
- **Deployment:** Vercel

## Commands

| Command                  | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `npm run dev`            | Start local dev server on port 3000                   |
| `npm run build`          | Production build                                      |
| `npm run lint`           | Run ESLint                                            |
| `npm run format`         | Auto-fix formatting with Prettier                     |
| `npm run format:check`   | Check formatting without fixing                       |
| `npm test`               | Run all tests (Vitest)                                |
| `npx prisma migrate dev` | Create/apply database migrations                      |
| `npx prisma generate`    | Regenerate Prisma client (also runs on `postinstall`) |
| `npx prisma validate`    | Validate Prisma schema                                |

## Architecture

- `src/app/` — Next.js App Router pages and API route handlers (`api/`)
- `src/lib/` — Shared utilities (e.g., Prisma singleton client)
- `src/generated/` — Auto-generated Prisma client (gitignored, regenerated via `postinstall`)
- `prisma/schema.prisma` — Database schema (single source of truth)
- `prisma.config.ts` — Prisma v7 config (datasource URL from `DATABASE_URL` env var)
- `tests/` — Vitest test files

## Prisma Notes

- Prisma v7 uses `prisma-client` generator outputting to `src/generated/prisma/`
- The datasource URL is configured in `prisma.config.ts` (reads `DATABASE_URL` from `.env`)
- The singleton pattern in `src/lib/prisma.ts` uses `globalThis` caching to prevent multiple clients during Next.js hot reload

## OpenSpec Workflow

This project uses **OpenSpec** (spec-driven development). There is no application source code yet — work begins by creating specifications before writing code.

### Workflow Commands

| Command                 | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `/opsx:explore`         | Think through problems and investigate (read-only, no implementation) |
| `/opsx:new <name>`      | Start a new change — creates artifacts step by step                   |
| `/opsx:ff <name>`       | Fast-forward — create all artifacts at once                           |
| `/opsx:continue <name>` | Resume work on an existing change                                     |
| `/opsx:apply <name>`    | Implement tasks from a change's specs/design                          |
| `/opsx:verify <name>`   | Verify implementation matches specs                                   |
| `/opsx:archive <name>`  | Archive a completed change                                            |
| `/opsx:onboard`         | Guided tutorial through a full OpenSpec cycle                         |

### Artifact Sequence (spec-driven schema)

1. **Proposal** — Why: problem/opportunity statement
2. **Specs** — What: requirements using WHEN/THEN/AND scenarios
3. **Design** — How: technical decisions and approach
4. **Tasks** — Implementation checklist

### Key Directories

- `openspec/config.yaml` — OpenSpec configuration (schema type, project context, per-artifact rules)
- `openspec/changes/` — Active changes (each change is a subdirectory with its artifacts)
- `openspec/changes/archive/` — Completed changes (date-prefixed for history)
- `openspec/specs/` — Main capability specs (synced from completed changes)

## Roadmap Phases

1. Project Setup & Planning (tech stack, repo structure, deployment config)
2. User Authentication (email/password + OAuth)
3. Bookmark CRUD & Link Preview (auto-fetch title/description/thumbnail)
4. Tagging & Auto-Suggestions
5. Folder Organization & Drag-and-Drop
6. Full-Text Search
7. Sharing (public/private with unique links)
8. Testing (Anthropic Pattern throughout)
9. Deployment & Final Checks (Vercel or Railway)
