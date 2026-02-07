## ADDED Requirements

### Requirement: System fetches link preview metadata

The system SHALL fetch metadata from external URLs to automatically populate bookmark title, description, and thumbnail fields using Open Graph protocol and HTML parsing.

#### Scenario: Fetch metadata from URL with Open Graph tags

- **WHEN** system fetches HTML from URL containing Open Graph meta tags
- **THEN** system extracts `og:title`, `og:description`, and `og:image` values
- **AND** system returns structured metadata object with title, description, and thumbnail

#### Scenario: Fetch metadata falls back to HTML meta tags

- **WHEN** system fetches HTML from URL without Open Graph tags
- **THEN** system extracts `<title>` element and `<meta name="description">` content
- **AND** system returns metadata with available fields populated

#### Scenario: Fetch metadata handles missing fields

- **WHEN** system fetches HTML from URL missing some metadata fields
- **THEN** system returns metadata object with null values for missing fields
- **AND** system does not fail the fetch operation

#### Scenario: Fetch metadata enforces timeout

- **WHEN** external URL takes longer than 10 seconds to respond
- **THEN** system aborts fetch request
- **AND** system returns null metadata or error indication

#### Scenario: Fetch metadata handles network errors

- **WHEN** external URL fetch fails due to network error or DNS failure
- **THEN** system catches error gracefully
- **AND** system returns null metadata without throwing exception

#### Scenario: Fetch metadata handles HTTP error responses

- **WHEN** external URL returns 4xx or 5xx HTTP status code
- **THEN** system treats response as failed fetch
- **AND** system returns null metadata

#### Scenario: Fetch metadata limits response size

- **WHEN** external URL returns response body exceeding 1MB
- **THEN** system stops reading response and truncates content
- **AND** system attempts to parse truncated HTML for metadata

### Requirement: System validates URLs before fetching

The system SHALL validate URLs before attempting external fetches to prevent security vulnerabilities and invalid requests.

#### Scenario: URL validation accepts valid HTTP URLs

- **WHEN** URL uses http or https protocol with valid hostname
- **THEN** system proceeds with metadata fetch

#### Scenario: URL validation rejects non-HTTP protocols

- **WHEN** URL uses ftp, file, javascript, data, or other non-HTTP protocol
- **THEN** system rejects URL without attempting fetch
- **AND** system returns validation error

#### Scenario: URL validation rejects localhost

- **WHEN** URL hostname is localhost or 127.0.0.1 or ::1
- **THEN** system rejects URL to prevent SSRF attacks
- **AND** system does not attempt fetch

#### Scenario: URL validation rejects private IP addresses

- **WHEN** URL hostname is private IP (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
- **THEN** system rejects URL to prevent SSRF attacks
- **AND** system does not attempt fetch

#### Scenario: URL validation rejects URLs exceeding length limit

- **WHEN** URL length exceeds 2048 characters
- **THEN** system rejects URL as invalid
- **AND** system returns validation error

### Requirement: System parses Open Graph metadata

The system SHALL parse Open Graph protocol meta tags from HTML to extract rich preview metadata.

#### Scenario: Parse Open Graph title

- **WHEN** HTML contains `<meta property="og:title" content="Page Title">`
- **THEN** system extracts "Page Title" as metadata title field

#### Scenario: Parse Open Graph description

- **WHEN** HTML contains `<meta property="og:description" content="Page description">`
- **THEN** system extracts description as metadata description field

#### Scenario: Parse Open Graph image

- **WHEN** HTML contains `<meta property="og:image" content="https://example.com/image.jpg">`
- **THEN** system extracts image URL as metadata thumbnail field

#### Scenario: Parse Open Graph with multiple image tags

- **WHEN** HTML contains multiple `og:image` meta tags
- **THEN** system uses first `og:image` value as thumbnail

### Requirement: System falls back to HTML meta tags

The system SHALL extract metadata from standard HTML elements when Open Graph tags are not available.

#### Scenario: Extract title from HTML title element

- **WHEN** HTML contains `<title>Page Title</title>` but no `og:title`
- **THEN** system extracts "Page Title" as metadata title field

#### Scenario: Extract description from meta description tag

- **WHEN** HTML contains `<meta name="description" content="Description">` but no `og:description`
- **THEN** system extracts description as metadata description field

#### Scenario: Open Graph takes precedence over HTML meta tags

- **WHEN** HTML contains both Open Graph and standard meta tags
- **THEN** system uses Open Graph values
- **AND** system ignores standard meta tag values

### Requirement: System handles malformed HTML gracefully

The system SHALL parse malformed or invalid HTML without crashing and extract whatever metadata is available.

#### Scenario: Parse HTML with unclosed tags

- **WHEN** HTML contains unclosed or malformed tags
- **THEN** system parses HTML using lenient parser
- **AND** system extracts available metadata fields

#### Scenario: Parse HTML with invalid UTF-8 encoding

- **WHEN** HTML response contains invalid character encoding
- **THEN** system attempts to decode HTML with fallback encodings
- **AND** system extracts metadata or returns null if decoding fails

#### Scenario: Parse empty HTML response

- **WHEN** URL returns empty response body
- **THEN** system returns metadata object with all null fields
- **AND** system does not throw parsing error

### Requirement: System integrates preview fetch with bookmark creation

The system SHALL automatically fetch and populate metadata when users create bookmarks, while allowing manual override.

#### Scenario: Auto-fetch metadata on bookmark creation

- **WHEN** user creates bookmark with URL only (no title/description/thumbnail)
- **THEN** system fetches metadata from URL before saving bookmark
- **AND** system populates bookmark fields with fetched metadata

#### Scenario: Skip auto-fetch when metadata is provided

- **WHEN** user creates bookmark with URL and custom title/description/thumbnail
- **THEN** system skips metadata fetch
- **AND** system uses provided metadata values

#### Scenario: Allow bookmark creation when preview fetch fails

- **WHEN** metadata fetch fails due to timeout or error
- **THEN** system creates bookmark with null metadata fields
- **AND** system does not block bookmark creation

#### Scenario: Preview fetch does not block bookmark update

- **WHEN** user updates bookmark URL
- **THEN** system validates new URL but does not fetch metadata
- **AND** system preserves existing metadata unless explicitly changed
