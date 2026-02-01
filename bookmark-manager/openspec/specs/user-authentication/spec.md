## ADDED Requirements

### Requirement: User can log in with email and password
The system SHALL allow registered users to authenticate using their email address and password.

#### Scenario: Successful login with correct credentials
- **WHEN** user submits login form with correct email and password
- **THEN** system verifies password matches stored hash
- **AND** system creates a new session for the user
- **AND** system returns authentication success

#### Scenario: Login fails with incorrect password
- **WHEN** user submits login form with correct email but incorrect password
- **THEN** system returns error "Invalid credentials"
- **AND** system does NOT create a session

#### Scenario: Login fails with non-existent email
- **WHEN** user submits login form with email not in database
- **THEN** system returns error "Invalid credentials"
- **AND** system does NOT create a session

#### Scenario: Login fails with missing email
- **WHEN** user submits login form without email
- **THEN** system returns error "Email is required"
- **AND** system does NOT create a session

#### Scenario: Login fails with missing password
- **WHEN** user submits login form without password
- **THEN** system returns error "Password is required"
- **AND** system does NOT create a session

### Requirement: User can log out
The system SHALL allow authenticated users to end their session.

#### Scenario: Successful logout
- **WHEN** authenticated user requests logout
- **THEN** system invalidates the current session
- **AND** system removes session from database
- **AND** system returns logout success

#### Scenario: Logout for unauthenticated user
- **WHEN** unauthenticated user requests logout
- **THEN** system returns success (idempotent operation)
- **AND** system does NOT throw an error

### Requirement: System validates current session
The system SHALL provide a way to check if user is currently authenticated.

#### Scenario: Session check with valid session
- **WHEN** client requests session status with valid session token
- **THEN** system returns authenticated status
- **AND** system returns user information (id, email)

#### Scenario: Session check with invalid session
- **WHEN** client requests session status with invalid or expired session token
- **THEN** system returns unauthenticated status
- **AND** system does NOT return user information

#### Scenario: Session check with no session
- **WHEN** client requests session status without session token
- **THEN** system returns unauthenticated status

### Requirement: Authentication uses NextAuth.js Credentials Provider
The system SHALL use NextAuth.js with Credentials Provider for authentication operations.

#### Scenario: NextAuth handles login via API route
- **WHEN** user submits credentials to `/api/auth/callback/credentials`
- **THEN** NextAuth processes authentication
- **AND** NextAuth creates session on success

#### Scenario: NextAuth handles logout via API route
- **WHEN** user requests logout via `/api/auth/signout`
- **THEN** NextAuth invalidates session
- **AND** NextAuth clears session cookie

#### Scenario: NextAuth handles session check via API route
- **WHEN** client requests session via `/api/auth/session`
- **THEN** NextAuth returns current session state
