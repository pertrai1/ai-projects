## Why

Users need a way to create accounts and securely log in to save and manage their personal bookmarks. Authentication is the foundation for user-specific features (folders, tags, sharing permissions) and is listed as Phase 2 in the project roadmap. This enables the core bookmark management functionality that follows.

## What Changes

- Add user registration with email and password
- Add secure password hashing using industry-standard libraries
- Add login/logout functionality with session management
- Add authentication middleware to protect authenticated routes
- Add user profile basic structure (email, hashed password, timestamps)
- Add database schema for users and sessions
- Add authentication API routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`)
- Add client-side authentication state management

## Capabilities

### New Capabilities

- `user-registration`: User account creation with email and password validation
- `user-authentication`: Login with email/password and session-based authentication
- `session-management`: Secure session creation, validation, and destruction
- `password-security`: Password hashing, validation, and security best practices

### Modified Capabilities

_No existing capabilities are being modified. This is new functionality._

## Impact

- **Database**: New `User` and `Session` tables in Prisma schema
- **API Routes**: New `/api/auth/*` endpoints for registration, login, logout, session validation
- **Dependencies**: Add password hashing library (bcrypt or argon2), session management library (iron-session or next-auth)
- **Middleware**: Authentication middleware for protecting routes
- **Client State**: Authentication context/hooks for managing logged-in user state
- **Environment**: New environment variables for session secrets
