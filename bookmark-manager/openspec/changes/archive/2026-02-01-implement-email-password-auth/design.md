## Context

The bookmark manager currently has no authentication system. Users cannot create accounts or log in. This design covers implementing email/password authentication as Phase 2 of the project roadmap.

**Current state:**
- Next.js 16 App Router with TypeScript
- Prisma v7 with PostgreSQL (empty schema)
- Dependencies already installed: `next-auth` v4.24.13, `bcrypt` v6.0.0, `@auth/prisma-adapter` v2.11.1

**Constraints:**
- Must follow Anthropic Pattern (tests first, then implementation)
- Must use strict TypeScript
- Prisma v7 outputs to `src/generated/prisma/`
- Database URL configured via `prisma.config.ts` (reads `DATABASE_URL` from `.env`)

## Goals / Non-Goals

**Goals:**
- Secure user registration and login with email/password
- Session-based authentication for subsequent requests
- Protected API routes and pages requiring authentication
- Basic user profile (id, email, timestamps)
- Password security best practices (hashing, validation)

**Non-Goals:**
- OAuth/social login (Phase 2, separate change)
- Password reset/forgot password flow
- Email verification
- Multi-factor authentication
- User roles/permissions (future)
- Account deletion/management UI

## Decisions

### 1. NextAuth.js vs Custom Auth

**Decision:** Use NextAuth.js (already installed) with Credentials Provider

**Rationale:**
- Already in dependencies (`next-auth@4.24.13`)
- Battle-tested library with security best practices built-in
- Provides session management, CSRF protection, JWT signing
- Works well with Prisma Adapter for database sessions
- Simplifies future OAuth integration
- Reduces custom security code we need to maintain

**Alternatives considered:**
- Custom auth with `iron-session`: More control but higher security risk, more boilerplate
- Auth0/Clerk: External service adds cost and latency, overkill for MVP

### 2. Session Strategy

**Decision:** Database sessions using Prisma Adapter

**Rationale:**
- More secure than JWT-only (can revoke sessions server-side)
- Simpler to implement logout and session invalidation
- Prisma Adapter (`@auth/prisma-adapter`) already installed
- Aligns with future multi-device support
- NextAuth v4 recommends database sessions for production

**Alternatives considered:**
- JWT-only sessions: Simpler but cannot revoke, harder to track active sessions
- Hybrid (JWT + DB): Adds complexity without clear benefit at this scale

### 3. Password Hashing

**Decision:** Use bcrypt (already installed)

**Rationale:**
- `bcrypt@6.0.0` already in dependencies
- Industry standard, well-audited
- Adaptive cost factor (can increase rounds as hardware improves)
- NextAuth Credentials Provider works seamlessly with bcrypt

**Alternatives considered:**
- Argon2: Slightly better security but requires native bindings, deployment complexity
- scrypt: Good but bcrypt is more widely adopted and already installed

### 4. Database Schema

**Decision:** Use NextAuth's standard schema with custom User fields

**Schema:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  emailVerified DateTime? // for future email verification
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[] // for future OAuth
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

**Rationale:**
- Account, Session, VerificationToken tables required by NextAuth Prisma Adapter
- Custom `password` field added to User model
- Keeps door open for OAuth (Account model ready)
- `emailVerified` field for future email verification
- Uses `cuid()` for IDs (collision-resistant, URL-safe)

### 5. API Routes Structure

**Decision:** NextAuth API route handler + custom registration endpoint

**Routes:**
- `/api/auth/[...nextauth]/route.ts` — NextAuth handler (login, logout, session)
- `/api/auth/register/route.ts` — Custom registration endpoint

**Rationale:**
- NextAuth handles all auth operations except registration
- Separate registration endpoint gives control over validation and password hashing
- Follows Next.js App Router conventions (`route.ts` files)
- Clean separation of concerns

### 6. Client-Side State Management

**Decision:** NextAuth `useSession` hook + SessionProvider

**Rationale:**
- Built-in with NextAuth
- Provides `session`, `status` (loading/authenticated/unauthenticated)
- Automatic session refresh
- No additional state library needed
- Simple and idiomatic for Next.js

**Alternatives considered:**
- Context API: Already provided by NextAuth's SessionProvider
- Zustand/Redux: Overkill for auth state alone

### 7. Password Validation

**Decision:** Server-side validation with minimum requirements

**Requirements:**
- Minimum 8 characters
- Email format validation (basic regex)
- Unique email check against database

**Rationale:**
- Simple but secure baseline
- Server-side enforcement prevents client bypass
- Can enhance later (password strength meter, zxcvbn)

**Non-requirements:**
- Complex password rules (research shows they reduce security)
- Client-side validation (server is source of truth)

## Risks / Trade-offs

**[Risk]** NextAuth v4 is in maintenance mode (v5 is beta)
→ **Mitigation:** v4 is stable and widely used. v5 migration path is documented. Can upgrade post-MVP.

**[Risk]** Database sessions add latency vs JWT
→ **Mitigation:** Acceptable for MVP. Can optimize with Redis sessions if needed at scale.

**[Risk]** No email verification allows fake email registrations
→ **Mitigation:** Documented as non-goal for Phase 2. Add in Phase 2b or Phase 3.

**[Risk]** No rate limiting on registration/login
→ **Mitigation:** Add as separate security hardening task post-MVP.

**[Trade-off]** Using bcrypt over Argon2
→ **Impact:** Slightly less resistant to GPU attacks, but widely supported and already installed.

**[Trade-off]** No password reset flow
→ **Impact:** Users locked out if they forget passwords. Accept for MVP, prioritize in Phase 3.

## Migration Plan

**Initial deployment:**
1. Add Prisma schema changes
2. Run `npx prisma migrate dev --name add-auth-schema`
3. Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `.env` and Vercel env vars
4. Deploy API routes and client components
5. Test registration and login flows in staging

**Rollback strategy:**
- If auth fails, remove auth middleware (app remains accessible)
- Revert Prisma migration if schema issues
- No data loss risk (new tables only)

**Future migrations:**
- OAuth providers: Add via NextAuth providers config (no schema changes needed)
- Email verification: Add verification flow using existing `emailVerified` field

## Open Questions

_None at this time. All technical decisions finalized._
