## ADDED Requirements

### Requirement: System creates database-backed sessions
The system SHALL store user sessions in the database using the Prisma Adapter.

#### Scenario: Session created on successful login
- **WHEN** user successfully logs in
- **THEN** system creates Session record in database
- **AND** Session includes unique sessionToken
- **AND** Session includes userId reference
- **AND** Session includes expiration timestamp

#### Scenario: Session token is stored in secure cookie
- **WHEN** session is created
- **THEN** system sets secure HTTP-only cookie with sessionToken
- **AND** cookie has appropriate SameSite and Secure flags

### Requirement: System validates sessions on protected requests
The system SHALL verify session validity before granting access to protected resources.

#### Scenario: Valid session grants access
- **WHEN** request includes valid, non-expired session token
- **THEN** system retrieves session from database
- **AND** system loads associated user data
- **AND** system grants access to protected resource

#### Scenario: Expired session denies access
- **WHEN** request includes session token with expiration in the past
- **THEN** system removes expired session from database
- **AND** system denies access to protected resource
- **AND** system returns unauthenticated status

#### Scenario: Invalid session token denies access
- **WHEN** request includes session token not found in database
- **THEN** system denies access to protected resource
- **AND** system returns unauthenticated status

#### Scenario: Missing session token denies access
- **WHEN** request to protected resource has no session token
- **THEN** system denies access to protected resource
- **AND** system returns unauthenticated status

### Requirement: System destroys sessions on logout
The system SHALL remove session from database when user logs out.

#### Scenario: Logout removes session from database
- **WHEN** authenticated user logs out
- **THEN** system deletes Session record from database
- **AND** system clears session cookie

#### Scenario: Logout handles already-removed session
- **WHEN** user logs out but session already removed from database
- **THEN** system completes logout successfully
- **AND** system clears session cookie

### Requirement: Session database schema follows NextAuth standard
The system SHALL use NextAuth-compatible Session model in Prisma schema.

#### Scenario: Session table has required fields
- **WHEN** database migration is applied
- **THEN** Session table includes id field (cuid, primary key)
- **AND** Session table includes sessionToken field (unique)
- **AND** Session table includes userId field (foreign key to User)
- **AND** Session table includes expires field (DateTime)
- **AND** Session table has foreign key constraint with CASCADE delete

### Requirement: Sessions expire after period of inactivity
The system SHALL set expiration on sessions to enforce automatic timeout.

#### Scenario: New session has default expiration
- **WHEN** new session is created
- **THEN** session expires field is set to 30 days from creation
- **AND** session is automatically removed after expiration

#### Scenario: Expired sessions are cleaned up
- **WHEN** system attempts to validate expired session
- **THEN** system removes session from database
- **AND** system treats request as unauthenticated
