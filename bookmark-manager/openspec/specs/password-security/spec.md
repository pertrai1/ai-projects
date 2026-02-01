## ADDED Requirements

### Requirement: Passwords are hashed using bcrypt
The system SHALL hash all passwords using bcrypt before storing in database.

#### Scenario: Password hashed during registration
- **WHEN** user registers with password "MyP@ssw0rd"
- **THEN** system hashes password using bcrypt
- **AND** system stores bcrypt hash (not plaintext) in User.password field
- **AND** stored hash begins with "$2b$" or "$2a$" (bcrypt identifier)

#### Scenario: Password hash uses appropriate cost factor
- **WHEN** system hashes password
- **THEN** bcrypt cost factor is at least 10 rounds
- **AND** hash computation takes measurable time (protection against brute force)

### Requirement: Password verification uses constant-time comparison
The system SHALL verify passwords using bcrypt's compare function to prevent timing attacks.

#### Scenario: Correct password verification succeeds
- **WHEN** user logs in with correct password
- **THEN** system uses bcrypt.compare() to verify against stored hash
- **AND** verification returns true
- **AND** user is authenticated

#### Scenario: Incorrect password verification fails
- **WHEN** user logs in with incorrect password
- **THEN** system uses bcrypt.compare() to verify against stored hash
- **AND** verification returns false
- **AND** user is NOT authenticated

#### Scenario: Password comparison is constant-time
- **WHEN** system verifies password
- **THEN** comparison time does NOT reveal password similarity
- **AND** bcrypt.compare() prevents timing attack vectors

### Requirement: Plaintext passwords are never stored or logged
The system SHALL ensure plaintext passwords do NOT persist beyond initial request processing.

#### Scenario: Password not stored in plaintext
- **WHEN** user registers or updates password
- **THEN** system immediately hashes password
- **AND** plaintext password is NOT written to database
- **AND** plaintext password is NOT written to logs
- **AND** only bcrypt hash is persisted

#### Scenario: API responses do not include password hashes
- **WHEN** system returns user data via API
- **THEN** response does NOT include password field
- **AND** response does NOT include password hash
- **AND** sensitive fields are excluded from serialization

### Requirement: Password validation enforces minimum security requirements
The system SHALL validate password meets minimum security standards before accepting.

#### Scenario: Valid password meets minimum length
- **WHEN** user submits password with 8 or more characters
- **THEN** system accepts password for hashing
- **AND** system proceeds with registration or login

#### Scenario: Short password is rejected
- **WHEN** user submits password with fewer than 8 characters
- **THEN** system returns error "Password must be at least 8 characters"
- **AND** system does NOT hash or store password

#### Scenario: Empty password is rejected
- **WHEN** user submits empty or whitespace-only password
- **THEN** system returns error "Password is required"
- **AND** system does NOT hash or store password

### Requirement: Password field is never included in User queries by default
The system SHALL exclude password field from default User queries and API responses.

#### Scenario: User query excludes password by default
- **WHEN** system queries User table for session or profile data
- **THEN** query does NOT select password field
- **AND** returned User object does NOT contain password

#### Scenario: Password can be explicitly selected when needed
- **WHEN** system needs to verify password (login flow)
- **THEN** system explicitly selects password field in query
- **AND** password is used only for bcrypt comparison
- **AND** password is NOT returned to client
