## 1. Database Schema Setup

- [x] 1.1 Add User, Account, Session, and VerificationToken models to `prisma/schema.prisma`
- [x] 1.2 Run `npx prisma migrate dev --name add-auth-schema` to create migration
- [x] 1.3 Verify migration applied successfully and Prisma client regenerated
- [x] 1.4 Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to `.env` file

## 2. Password Security Implementation

- [x] 2.1 Write tests for password hashing utility (bcrypt, cost factor ≥10)
- [x] 2.2 Write tests for password validation (minimum 8 chars, required field)
- [x] 2.3 Implement password hashing utility using bcrypt in `src/lib/auth/password.ts`
- [x] 2.4 Implement password validation utility in `src/lib/auth/password.ts`
- [x] 2.5 Verify all password security tests pass

## 3. User Registration API

- [x] 3.1 Write tests for `/api/auth/register` endpoint
- [x] 3.1.1 Test successful registration with valid email and password
- [x] 3.1.2 Test rejection of duplicate email
- [x] 3.1.3 Test rejection of invalid email format
- [x] 3.1.4 Test rejection of short password (< 8 chars)
- [x] 3.1.5 Test rejection of missing email or password
- [x] 3.1.6 Test rejection of non-POST requests
- [x] 3.2 Implement POST handler at `src/app/api/auth/register/route.ts`
- [x] 3.2.1 Implement request validation (email format, password length)
- [x] 3.2.2 Implement duplicate email check
- [x] 3.2.3 Implement password hashing before storage
- [x] 3.2.4 Implement User record creation
- [x] 3.2.5 Implement error responses with appropriate status codes
- [ ] 3.3 Verify all registration tests pass

## 4. NextAuth Configuration

- [x] 4.1 Write tests for NextAuth configuration and providers
- [x] 4.2 Create NextAuth configuration file at `src/lib/auth/config.ts`
- [x] 4.2.1 Configure Credentials Provider with email/password
- [x] 4.2.2 Configure Prisma Adapter for database sessions
- [x] 4.2.3 Configure session strategy (database-backed)
- [x] 4.2.4 Configure callbacks (jwt, session)
- [x] 4.2.5 Configure pages (custom sign-in path if needed)
- [x] 4.3 Create NextAuth API route handler at `src/app/api/auth/[...nextauth]/route.ts`
- [x] 4.4 Verify NextAuth configuration tests pass

## 5. User Authentication (Login/Logout)

- [ ] 5.1 Write tests for login functionality
- [ ] 5.1.1 Test successful login with correct credentials
- [ ] 5.1.2 Test login failure with incorrect password
- [ ] 5.1.3 Test login failure with non-existent email
- [ ] 5.1.4 Test login failure with missing email or password
- [ ] 5.2 Write tests for logout functionality
- [ ] 5.2.1 Test successful logout (session invalidation)
- [ ] 5.2.2 Test logout for unauthenticated user (idempotent)
- [x] 5.3 Implement authorize callback in NextAuth config
- [x] 5.3.1 Implement email lookup in database
- [x] 5.3.2 Implement password verification using bcrypt.compare()
- [x] 5.3.3 Return user object on success, null on failure
- [ ] 5.4 Verify all authentication tests pass

## 6. Session Management

- [ ] 6.1 Write tests for session validation
- [ ] 6.1.1 Test valid session grants access
- [ ] 6.1.2 Test expired session denies access
- [ ] 6.1.3 Test invalid session token denies access
- [ ] 6.1.4 Test missing session token denies access
- [ ] 6.2 Write tests for session creation and destruction
- [ ] 6.2.1 Test session created on successful login
- [ ] 6.2.2 Test session destroyed on logout
- [ ] 6.2.3 Test session expiration (30 days default)
- [ ] 6.3 Verify NextAuth Prisma Adapter handles session CRUD operations
- [ ] 6.4 Verify all session management tests pass

## 7. Client-Side Authentication State

- [ ] 7.1 Write tests for SessionProvider wrapper
- [x] 7.2 Add SessionProvider to root layout at `src/app/layout.tsx`
- [x] 7.3 Create client component wrapper if needed for SessionProvider
- [ ] 7.4 Write tests for useSession hook usage
- [ ] 7.5 Verify session state is accessible in client components
- [ ] 7.6 Verify all client-side authentication tests pass

## 8. Authentication Proxy (Optional but Recommended)

- [x] 8.1 Write tests for authentication proxy
- [x] 8.1.1 Test proxy allows authenticated users to protected routes
- [x] 8.1.2 Test proxy redirects unauthenticated users
- [x] 8.2 Create proxy at `src/proxy.ts` (Next.js 16+, replaces middleware.ts)
- [x] 8.3 Configure protected route patterns
- [x] 8.4 Verify proxy tests pass

## 9. Type Safety and Type Definitions

- [x] 9.1 Create TypeScript types for auth-related data structures
- [x] 9.1.1 Define User type (excluding password)
- [x] 9.1.2 Define Session type
- [x] 9.1.3 Define API request/response types
- [x] 9.2 Extend NextAuth types for custom User fields
- [x] 9.3 Add type declarations file if needed at `src/types/next-auth.d.ts`
- [x] 9.4 Verify strict TypeScript compilation passes

## 10. Integration Testing

- [ ] 10.1 Write end-to-end registration flow test
- [ ] 10.1.1 Test registration → auto-login → session creation
- [ ] 10.2 Write end-to-end login flow test
- [ ] 10.2.1 Test login → session validation → protected resource access
- [ ] 10.3 Write end-to-end logout flow test
- [ ] 10.3.1 Test logout → session destruction → denied access
- [ ] 10.4 Test complete user journey: register → logout → login → logout
- [ ] 10.5 Verify all integration tests pass

## 11. Security Verification

- [x] 11.1 Verify passwords are hashed with bcrypt (check database records)
- [x] 11.2 Verify plaintext passwords never stored or logged
- [x] 11.3 Verify password field excluded from API responses
- [x] 11.4 Verify session cookies have HttpOnly, Secure, and SameSite flags
- [x] 11.5 Verify CSRF protection is enabled (NextAuth default)
- [x] 11.6 Verify constant-time password comparison (bcrypt.compare)
- [x] 11.7 Run security checklist from password-security spec

## 12. Documentation and Cleanup

- [x] 12.1 Add environment variable documentation to `.env.example`
- [x] 12.2 Document authentication flow in code comments
- [x] 12.3 Run `npm run lint` and fix any issues
- [x] 12.4 Run `npm run format` to ensure consistent formatting
- [x] 12.5 Run `npm test` to ensure all tests pass
- [x] 12.6 Verify `npm run build` succeeds without errors
