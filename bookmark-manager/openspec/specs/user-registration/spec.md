## ADDED Requirements

### Requirement: User can register with email and password
The system SHALL allow new users to create an account using their email address and a password.

#### Scenario: Successful registration with valid credentials
- **WHEN** user submits registration form with valid email and password (minimum 8 characters)
- **AND** email is not already registered
- **THEN** system creates a new user account with hashed password
- **AND** system returns success response

#### Scenario: Registration fails with existing email
- **WHEN** user submits registration form with email that already exists in database
- **THEN** system returns error "Email already registered"
- **AND** system does NOT create a new user account

#### Scenario: Registration fails with invalid email format
- **WHEN** user submits registration form with invalid email format (e.g., "notanemail")
- **THEN** system returns error "Invalid email format"
- **AND** system does NOT create a new user account

#### Scenario: Registration fails with short password
- **WHEN** user submits registration form with password less than 8 characters
- **THEN** system returns error "Password must be at least 8 characters"
- **AND** system does NOT create a new user account

#### Scenario: Registration fails with missing email
- **WHEN** user submits registration form without email
- **THEN** system returns error "Email is required"
- **AND** system does NOT create a new user account

#### Scenario: Registration fails with missing password
- **WHEN** user submits registration form without password
- **THEN** system returns error "Password is required"
- **AND** system does NOT create a new user account

### Requirement: User record includes essential fields
The system SHALL store user accounts with id, email, hashed password, and timestamps.

#### Scenario: User record created with all required fields
- **WHEN** new user successfully registers
- **THEN** system creates User record with unique id (cuid)
- **AND** record includes email (unique, indexed)
- **AND** record includes password (bcrypt hashed)
- **AND** record includes createdAt timestamp
- **AND** record includes updatedAt timestamp
- **AND** record includes emailVerified field (null initially)

### Requirement: Registration API is accessible via POST endpoint
The system SHALL provide a registration endpoint at `/api/auth/register` that accepts POST requests.

#### Scenario: Registration endpoint accepts valid POST request
- **WHEN** client sends POST request to `/api/auth/register` with JSON body containing email and password
- **THEN** system processes the registration request
- **AND** system returns JSON response with appropriate status code

#### Scenario: Registration endpoint rejects non-POST requests
- **WHEN** client sends GET, PUT, DELETE, or other non-POST request to `/api/auth/register`
- **THEN** system returns 405 Method Not Allowed error
