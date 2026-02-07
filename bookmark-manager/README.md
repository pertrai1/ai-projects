# Bookmark Manager

A bookmark manager with superpowers, built with Claude Code using a spec-driven development approach.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma v7 ORM with PostgreSQL adapter
- **Authentication:** NextAuth.js v4 with Credentials Provider
- **Password Hashing:** bcrypt (cost factor 10)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest
- **Linting/Formatting:** ESLint + Prettier
- **Deployment:** Vercel + Neon PostgreSQL

## Features

- ✅ Email/password authentication with secure sessions
- ✅ Bookmark CRUD (create, read, update, delete) with ownership guards
- ✅ Auto-fetched link previews (title, description, thumbnail via Open Graph)
- ✅ Paginated bookmark listing with configurable page size
- ✅ URL validation with SSRF protection (blocks private IPs, localhost)
- 🔜 Tagging system with auto-suggestions based on content
- 🔜 Full-text search across all bookmarks
- 🔜 Folder organization with drag-and-drop
- 🔜 Public/private sharing with unique links

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, local, or other cloud provider)

### Setup

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - `http://localhost:3000` for development

3. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Development Commands

| Command                  | Purpose                             |
| ------------------------ | ----------------------------------- |
| `npm run dev`            | Start local dev server on port 3000 |
| `npm run build`          | Production build                    |
| `npm run lint`           | Run ESLint                          |
| `npm run format`         | Auto-fix formatting with Prettier   |
| `npm run format:check`   | Check formatting without fixing     |
| `npm test`               | Run all tests (Vitest)              |
| `npx prisma migrate dev` | Create/apply database migrations    |
| `npx prisma generate`    | Regenerate Prisma client            |
| `npx prisma studio`      | Open Prisma Studio (database GUI)   |

## Project Structure

```
bookmark-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   │   ├── [...nextauth]/  # NextAuth handler
│   │   │   │   └── register/       # User registration
│   │   │   └── health/         # Health check endpoint
│   │   ├── layout.tsx          # Root layout with SessionProvider
│   │   ├── page.tsx            # Home page
│   │   └── providers.tsx       # Client-side providers
│   ├── lib/                    # Shared utilities
│   │   ├── auth/               # Authentication utilities
│   │   │   ├── config.ts       # NextAuth configuration
│   │   │   └── password.ts     # Password hashing/validation
│   │   └── prisma.ts           # Prisma client singleton
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Auth-related types
│   │   └── next-auth.d.ts      # NextAuth type extensions
│   └── generated/              # Auto-generated files
│       └── prisma/             # Prisma client (gitignored)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── tests/                      # Vitest test files
│   ├── api/                    # API route tests
│   └── lib/                    # Library tests
├── openspec/                   # Spec-driven development artifacts
│   ├── changes/                # Active changes
│   └── specs/                  # Main capability specs
└── CLAUDE.md                   # Instructions for Claude Code
```

## Authentication System

The application uses **NextAuth.js v4** with a custom Credentials Provider for email/password authentication.

### Architecture

- **Strategy:** JWT-based sessions (30-day expiration)
  - Note: CredentialsProvider requires JWT strategy
  - Database sessions only supported with OAuth providers
- **Password Security:** bcrypt with cost factor 10
- **Session Management:** Handled by NextAuth
- **CSRF Protection:** Enabled by default via NextAuth
- **Route Protection:** Next.js 16 proxy (`src/proxy.ts`)

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/callback/credentials` - Login (handled by NextAuth)
- `GET/POST /api/auth/signout` - Logout (handled by NextAuth)
- `GET /api/auth/session` - Get current session (handled by NextAuth)
- `POST /api/bookmarks` - Create bookmark (auto-fetches link preview metadata)
- `GET /api/bookmarks` - List user's bookmarks (paginated: `?page=1&limit=20`)
- `GET /api/bookmarks/[id]` - Get single bookmark by ID
- `PUT /api/bookmarks/[id]` - Update bookmark metadata or URL
- `DELETE /api/bookmarks/[id]` - Delete bookmark (returns 204)

### Client-Side Usage

```typescript
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Not logged in</div>;

  return <div>Welcome, {session.user.email}!</div>;
}
```

### Database Schema

Key models:

- `User` - User accounts (id, email, hashed password, timestamps)
- `Session` - Active sessions (sessionToken, userId, expires)
- `Account` - OAuth accounts (ready for future OAuth integration)
- `VerificationToken` - Email verification tokens (future use)

## Database

### Prisma v7 Configuration

This project uses Prisma v7 with the PostgreSQL adapter. The datasource URL is configured in `prisma.config.ts` and reads from the `DATABASE_URL` environment variable.

### Running Migrations

```bash
# Create a new migration
npx prisma migrate dev --name description-of-change

# Apply migrations in production
npx prisma migrate deploy

# Reset database (⚠️ destroys all data)
npx prisma migrate reset
```

### Prisma Studio

View and edit your database with a GUI:

```bash
npx prisma studio
```

## Testing

The project follows the **Anthropic Pattern**: write tests first, confirm they fail, then implement until they pass.

### Running Tests

```bash
# Run all unit tests (fast, no server required)
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/lib/auth/password.test.ts
```

### Test Types

- **Unit tests**: `tests/lib/**/*.test.ts` (always run)
- **Integration tests**: `tests/api/**/*.test.ts` (skipped by default)

### Running Integration Tests

Integration tests require a running dev server:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run integration tests
npm test -- --run tests/api/auth/register.test.ts
```

Note: Integration tests are marked with `describe.skip()` to avoid failures in CI/normal test runs. To enable them, remove `.skip` from the test file.

### Test Coverage

- ✅ Password hashing and validation (12 tests)
- ✅ NextAuth configuration (6 tests)
- ✅ Health endpoint (2 tests)
- ✅ Link preview: URL validation and metadata extraction (24 tests)
- ✅ Bookmark create API (9 tests)
- ✅ Bookmark list API with pagination (8 tests)
- ✅ Bookmark get by ID API (5 tests)
- ✅ Bookmark update API (9 tests)
- ✅ Bookmark delete API (5 tests)
- ✅ Proxy middleware (6 tests)
- 🔜 Registration API integration tests (7 tests, manual run)
- 🔜 Login/logout flows
- 🔜 Session management

## Code Conventions

- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier (run `npm run format` before committing)
- **Linting:** ESLint (run `npm run lint` before committing)
- **Imports:** Use `@/` alias for src directory (e.g., `import { prisma } from '@/lib/prisma'`)
- **API Routes:** Use Next.js App Router conventions (`route.ts` files)

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"  # Your app URL
```

## Development Workflow

This project uses **OpenSpec** (spec-driven development). See `CLAUDE.md` for workflow commands.

### The Anthropic Pattern

1. Write tests first
2. Confirm tests fail (red)
3. Implement until tests pass (green)
4. Refactor if needed
5. Repeat

This approach produces better code quality and catches issues early.

## Roadmap

### 1. Project Setup & Planning ✅

- Tech stack selected (Next.js, TypeScript, Prisma, PostgreSQL, Tailwind, Vitest)
- Repository structure configured
- Linting, formatting, and testing set up
- Health-check endpoint and home page created

### 2. User Authentication ✅

- ✅ Implement basic email/password authentication
- ✅ NextAuth.js v4 with Credentials Provider
- ✅ Secure password storage (bcrypt, cost factor 10)
- ✅ Database-backed sessions (30-day expiration)
- ✅ Password validation (minimum 8 characters)
- ✅ User registration API endpoint
- ✅ TypeScript type safety
- ✅ Unit tests for password utilities (12 passing)

### 3. Bookmark CRUD & Preview ✅

- ✅ Bookmark data model with Prisma (URL, title, description, thumbnail, user ownership)
- ✅ CRUD API routes with authentication guards and ownership checks
- ✅ Link preview service with Open Graph parsing and HTML fallback
- ✅ URL validation with SSRF protection (private IP blocking)
- ✅ Paginated listing (configurable page/limit, max 100)
- ✅ 86 passing unit tests

### 4. Tagging & Suggestions

- Build tagging UI and backend
- Implement auto-suggestions based on bookmark content
- Allow manual tag edit
- Ensure test coverage

### 5. Folder Organization & Drag-and-Drop

- Data model for folders
- Implement folder CRUD operations
- Front-end drag-and-drop for folders and bookmarks
- Folder/bookmark reordering logic

### 6. Full-Text Search

- Backend and front-end search implementation
- Indexing strategies for performance

### 7. Sharing Features

- Public/private sharing of bookmarks/folders
- Generate unique links for sharing
- Set access controls

### 9. Deployment & Final Checks

- Set up a hosted PostgreSQL instance (Neon or Vercel Postgres free tier)
- Connect the repository to Vercel with root directory set to `bookmark-manager/`
- Configure `DATABASE_URL` as an environment variable in Vercel dashboard
- Deploy and verify `/api/health` returns 200 on the live URL
- Monitor deployment and resolve issues
- Documentation and onboarding guide
