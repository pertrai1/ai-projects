## Why

With user authentication complete, users need the ability to save and manage bookmarks. This is the core functionality of the application and enables all subsequent features (tagging, search, folders, sharing). Without bookmark management, the application cannot fulfill its primary purpose.

## What Changes

- Add a `Bookmark` data model to the Prisma schema with fields for URL, title, description, thumbnail, user ownership, and timestamps
- Implement API routes for creating, reading, updating, and deleting bookmarks with authentication guards
- Build a link preview service that fetches metadata (title, description, Open Graph image) from external URLs
- Create database migrations for the new bookmark table with foreign key relationship to users
- Add TypeScript types for bookmark data and API responses
- Implement server-side validation for URLs and bookmark data

## Capabilities

### New Capabilities

- `bookmark-crud`: Core bookmark management operations (create, read, update, delete) with user ownership, validation, and authentication guards
- `link-preview`: External metadata fetching from URLs using Open Graph protocol and HTML parsing to extract title, description, and thumbnail images

### Modified Capabilities

<!-- No existing capabilities are being modified - this is purely additive functionality -->

## Impact

**Database Schema**:
- New `Bookmark` model in `prisma/schema.prisma` with relation to `User` model
- Migration required to create bookmarks table

**API Routes** (new):
- `POST /api/bookmarks` - Create bookmark with auto-fetched preview
- `GET /api/bookmarks` - List user's bookmarks (paginated)
- `GET /api/bookmarks/[id]` - Get single bookmark
- `PUT /api/bookmarks/[id]` - Update bookmark
- `DELETE /api/bookmarks/[id]` - Delete bookmark

**Dependencies**:
- HTTP client library for fetching external URLs (built-in `fetch` API)
- HTML parsing library for extracting metadata (e.g., `cheerio` or `linkedom`)
- URL validation utilities

**Security Considerations**:
- All bookmark operations require authenticated session
- Users can only access/modify their own bookmarks
- URL validation to prevent malicious input
- Rate limiting considerations for external API calls (link preview)
- Timeout handling for slow/unresponsive URLs
