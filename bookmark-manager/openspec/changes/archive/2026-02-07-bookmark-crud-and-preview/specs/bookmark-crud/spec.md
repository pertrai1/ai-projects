## ADDED Requirements

### Requirement: User can create a bookmark

The system SHALL allow authenticated users to create bookmarks by providing a URL. The system SHALL store the bookmark with user ownership and optional metadata fields.

#### Scenario: Create bookmark with URL only

- **WHEN** authenticated user sends POST request to `/api/bookmarks` with valid URL
- **THEN** system creates bookmark record with user as owner
- **AND** system returns 201 status with bookmark data including generated ID

#### Scenario: Create bookmark with URL and custom metadata

- **WHEN** authenticated user sends POST request with URL and optional title/description/thumbnail
- **THEN** system creates bookmark with provided metadata
- **AND** system stores custom metadata instead of fetching preview

#### Scenario: Create bookmark fails without authentication

- **WHEN** unauthenticated user sends POST request to `/api/bookmarks`
- **THEN** system returns 401 Unauthorized status
- **AND** system does not create any bookmark record

#### Scenario: Create bookmark fails with invalid URL

- **WHEN** authenticated user sends POST request with invalid URL format
- **THEN** system returns 400 Bad Request status with validation error
- **AND** system does not create any bookmark record

#### Scenario: Create bookmark fails with disallowed protocol

- **WHEN** authenticated user sends POST request with non-HTTP(S) URL (e.g., ftp://, file://)
- **THEN** system returns 400 Bad Request status
- **AND** system does not create any bookmark record

#### Scenario: Create bookmark fails with private IP address

- **WHEN** authenticated user sends POST request with localhost or private IP URL
- **THEN** system returns 400 Bad Request status to prevent SSRF attacks
- **AND** system does not create any bookmark record

#### Scenario: Create bookmark fails with URL exceeding maximum length

- **WHEN** authenticated user sends POST request with URL longer than 2048 characters
- **THEN** system returns 400 Bad Request status
- **AND** system does not create any bookmark record

### Requirement: User can list their bookmarks

The system SHALL allow authenticated users to retrieve a paginated list of their bookmarks, ordered by creation date (newest first).

#### Scenario: List bookmarks with default pagination

- **WHEN** authenticated user sends GET request to `/api/bookmarks`
- **THEN** system returns 200 status with first page of bookmarks (20 items)
- **AND** response includes pagination metadata (page, limit, total, hasMore)

#### Scenario: List bookmarks with custom pagination

- **WHEN** authenticated user sends GET request to `/api/bookmarks?page=2&limit=50`
- **THEN** system returns 200 status with requested page and limit
- **AND** system enforces maximum limit of 100 items per page

#### Scenario: List bookmarks enforces maximum limit

- **WHEN** authenticated user sends GET request with limit exceeding 100
- **THEN** system returns bookmarks with limit capped at 100
- **AND** response indicates effective limit used

#### Scenario: List bookmarks returns empty array for new user

- **WHEN** authenticated user with no bookmarks sends GET request
- **THEN** system returns 200 status with empty data array
- **AND** pagination metadata shows total of 0

#### Scenario: List bookmarks fails without authentication

- **WHEN** unauthenticated user sends GET request to `/api/bookmarks`
- **THEN** system returns 401 Unauthorized status
- **AND** system does not return any bookmark data

#### Scenario: List bookmarks returns only user's own bookmarks

- **WHEN** authenticated user sends GET request
- **THEN** system returns only bookmarks owned by that user
- **AND** system does not include bookmarks from other users

### Requirement: User can retrieve a single bookmark

The system SHALL allow authenticated users to retrieve a specific bookmark by its ID, if they own it.

#### Scenario: Get bookmark by ID

- **WHEN** authenticated user sends GET request to `/api/bookmarks/[id]` for their own bookmark
- **THEN** system returns 200 status with bookmark data

#### Scenario: Get bookmark fails for non-existent ID

- **WHEN** authenticated user sends GET request with non-existent bookmark ID
- **THEN** system returns 404 Not Found status

#### Scenario: Get bookmark fails for another user's bookmark

- **WHEN** authenticated user sends GET request for bookmark owned by different user
- **THEN** system returns 403 Forbidden status
- **AND** system does not reveal bookmark data

#### Scenario: Get bookmark fails without authentication

- **WHEN** unauthenticated user sends GET request to `/api/bookmarks/[id]`
- **THEN** system returns 401 Unauthorized status

### Requirement: User can update their bookmark

The system SHALL allow authenticated users to update their own bookmarks by modifying the URL, title, description, or thumbnail fields.

#### Scenario: Update bookmark metadata

- **WHEN** authenticated user sends PUT request to `/api/bookmarks/[id]` with updated fields
- **THEN** system updates bookmark with new values
- **AND** system returns 200 status with updated bookmark data
- **AND** system updates the `updatedAt` timestamp

#### Scenario: Update bookmark URL

- **WHEN** authenticated user sends PUT request with new valid URL
- **THEN** system validates new URL and updates bookmark
- **AND** system preserves existing metadata unless explicitly changed

#### Scenario: Update bookmark fails with invalid URL

- **WHEN** authenticated user sends PUT request with invalid URL
- **THEN** system returns 400 Bad Request status
- **AND** system does not modify existing bookmark

#### Scenario: Update bookmark fails for non-existent ID

- **WHEN** authenticated user sends PUT request to non-existent bookmark ID
- **THEN** system returns 404 Not Found status

#### Scenario: Update bookmark fails for another user's bookmark

- **WHEN** authenticated user sends PUT request to bookmark owned by different user
- **THEN** system returns 403 Forbidden status
- **AND** system does not modify the bookmark

#### Scenario: Update bookmark fails without authentication

- **WHEN** unauthenticated user sends PUT request to `/api/bookmarks/[id]`
- **THEN** system returns 401 Unauthorized status

### Requirement: User can delete their bookmark

The system SHALL allow authenticated users to permanently delete their own bookmarks.

#### Scenario: Delete bookmark

- **WHEN** authenticated user sends DELETE request to `/api/bookmarks/[id]` for their own bookmark
- **THEN** system permanently removes bookmark from database
- **AND** system returns 204 No Content status

#### Scenario: Delete bookmark fails for non-existent ID

- **WHEN** authenticated user sends DELETE request to non-existent bookmark ID
- **THEN** system returns 404 Not Found status

#### Scenario: Delete bookmark fails for another user's bookmark

- **WHEN** authenticated user sends DELETE request to bookmark owned by different user
- **THEN** system returns 403 Forbidden status
- **AND** system does not delete the bookmark

#### Scenario: Delete bookmark fails without authentication

- **WHEN** unauthenticated user sends DELETE request to `/api/bookmarks/[id]`
- **THEN** system returns 401 Unauthorized status

### Requirement: System enforces bookmark ownership

The system SHALL ensure all bookmark operations respect user ownership boundaries and foreign key integrity.

#### Scenario: Bookmarks are deleted when user account is deleted

- **WHEN** user account is deleted from system
- **THEN** all bookmarks owned by that user are automatically deleted via CASCADE

#### Scenario: Bookmark creation associates with authenticated user

- **WHEN** authenticated user creates bookmark
- **THEN** system automatically sets userId to authenticated user's ID
- **AND** system ignores any userId value in request body

### Requirement: System validates bookmark data

The system SHALL validate all bookmark data using TypeScript schemas and reject invalid requests with descriptive error messages.

#### Scenario: URL validation rejects malformed URLs

- **WHEN** user provides URL that fails WHATWG URL parsing
- **THEN** system returns 400 Bad Request with error message describing URL format issue

#### Scenario: URL validation rejects unsafe protocols

- **WHEN** user provides URL with protocol other than http or https
- **THEN** system returns 400 Bad Request with message indicating only HTTP(S) allowed

#### Scenario: URL validation rejects private IP addresses

- **WHEN** user provides URL with localhost or private IP (127.x, 10.x, 172.16-31.x, 192.168.x)
- **THEN** system returns 400 Bad Request with message indicating private IPs not allowed

#### Scenario: Optional metadata fields accept null values

- **WHEN** bookmark is created or updated without title/description/thumbnail
- **THEN** system stores null values for omitted fields
- **AND** system does not return validation errors
