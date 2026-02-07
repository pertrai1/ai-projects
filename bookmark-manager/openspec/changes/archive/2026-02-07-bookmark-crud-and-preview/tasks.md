## 1. Database Schema & Migration

- [x] 1.1 Add Bookmark model to `prisma/schema.prisma` with required fields (id, url, title, description, thumbnail, userId, createdAt, updatedAt)
- [x] 1.2 Add index on `url` field for performance
- [x] 1.3 Add foreign key relation from Bookmark to User with CASCADE delete
- [x] 1.4 Create database migration with `npx prisma migrate dev --name add-bookmarks`
- [x] 1.5 Regenerate Prisma client with `npx prisma generate`
- [x] 1.6 Verify schema in Prisma Studio

## 2. TypeScript Types & Validation Schemas

- [x] 2.1 Create `src/types/bookmark.ts` with Bookmark type definitions
- [x] 2.2 Define CreateBookmarkRequest and UpdateBookmarkRequest types
- [x] 2.3 Define BookmarkResponse and PaginatedBookmarksResponse types
- [x] 2.4 Create Zod validation schemas for bookmark operations in `src/lib/validation/bookmark.ts`
- [x] 2.5 Add URL validation utilities (protocol check, private IP detection, length limits)

## 3. Link Preview Service - Tests First

- [x] 3.1 Install linkedom dependency: `npm install linkedom`
- [x] 3.2 Create test file `tests/lib/link-preview.test.ts`
- [x] 3.3 Write test: URL validation accepts valid HTTP(S) URLs
- [x] 3.4 Write test: URL validation rejects non-HTTP protocols (ftp, file, javascript)
- [x] 3.5 Write test: URL validation rejects localhost and 127.0.0.1
- [x] 3.6 Write test: URL validation rejects private IPs (10.x, 172.16-31.x, 192.168.x)
- [x] 3.7 Write test: URL validation rejects URLs exceeding 2048 characters
- [x] 3.8 Write test: Extract Open Graph title, description, and image
- [x] 3.9 Write test: Fallback to HTML `<title>` and `<meta name="description">`
- [x] 3.10 Write test: Handle missing metadata fields gracefully (return nulls)
- [x] 3.11 Write test: Handle malformed HTML without crashing
- [x] 3.12 Confirm all tests fail (red)

## 4. Link Preview Service - Implementation

- [x] 4.1 Create `src/lib/link-preview/index.ts` file
- [x] 4.2 Implement URL validation function with WHATWG URL API
- [x] 4.3 Implement private IP detection (localhost, 127.x, 10.x, 172.16-31.x, 192.168.x)
- [x] 4.4 Implement fetchMetadata function with 10-second timeout
- [x] 4.5 Implement HTML parsing with linkedom
- [x] 4.6 Implement Open Graph tag extraction (og:title, og:description, og:image)
- [x] 4.7 Implement fallback to HTML meta tags (`<title>`, `<meta name="description">`)
- [x] 4.8 Add error handling for network failures, timeouts, and HTTP errors
- [x] 4.9 Add response size limit (1MB max)
- [x] 4.10 Return structured metadata object `{ title, description, thumbnail }`
- [x] 4.11 Run tests and confirm they pass (green)

## 5. POST /api/bookmarks - Tests First

- [x] 5.1 Create test file `tests/api/bookmarks/create.test.ts`
- [x] 5.2 Write test: Create bookmark with URL only (auto-fetch metadata)
- [x] 5.3 Write test: Create bookmark with custom metadata (skip auto-fetch)
- [x] 5.4 Write test: Return 201 status with bookmark data including ID
- [x] 5.5 Write test: Return 401 for unauthenticated requests
- [x] 5.6 Write test: Return 400 for invalid URL format
- [x] 5.7 Write test: Return 400 for non-HTTP(S) protocols
- [x] 5.8 Write test: Return 400 for private IP addresses (SSRF prevention)
- [x] 5.9 Write test: Return 400 for URLs exceeding 2048 characters
- [x] 5.10 Write test: Create bookmark even if metadata fetch fails
- [x] 5.11 Confirm all tests fail (red)

## 6. POST /api/bookmarks - Implementation

- [x] 6.1 Create `src/app/api/bookmarks/route.ts` file
- [x] 6.2 Implement POST handler with NextAuth session check
- [x] 6.3 Validate request body with Zod schema
- [x] 6.4 Implement URL validation (format, protocol, private IPs, length)
- [x] 6.5 Conditionally fetch metadata if title/description/thumbnail not provided
- [x] 6.6 Create bookmark in database with userId from session
- [x] 6.7 Handle metadata fetch failures gracefully (create with null fields)
- [x] 6.8 Return 201 status with created bookmark data
- [x] 6.9 Add error handling for validation errors (400) and auth errors (401)
- [x] 6.10 Run tests and confirm they pass (green)

## 7. GET /api/bookmarks - Tests First

- [x] 7.1 Create test file `tests/api/bookmarks/list.test.ts`
- [x] 7.2 Write test: List bookmarks with default pagination (page 1, limit 20)
- [x] 7.3 Write test: List bookmarks with custom pagination parameters
- [x] 7.4 Write test: Enforce maximum limit of 100 items
- [x] 7.5 Write test: Return pagination metadata (page, limit, total, hasMore)
- [x] 7.6 Write test: Return empty array for user with no bookmarks
- [x] 7.7 Write test: Return only authenticated user's bookmarks (not others')
- [x] 7.8 Write test: Return 401 for unauthenticated requests
- [x] 7.9 Write test: Order bookmarks by createdAt DESC (newest first)
- [x] 7.10 Confirm all tests fail (red)

## 8. GET /api/bookmarks - Implementation

- [x] 8.1 Implement GET handler in `src/app/api/bookmarks/route.ts`
- [x] 8.2 Add NextAuth session check (return 401 if not authenticated)
- [x] 8.3 Parse and validate pagination query parameters (page, limit)
- [x] 8.4 Set defaults: page=1, limit=20
- [x] 8.5 Enforce maximum limit of 100
- [x] 8.6 Query bookmarks with Prisma where userId matches session
- [x] 8.7 Implement pagination with `skip` and `take`
- [x] 8.8 Order by `createdAt DESC`
- [x] 8.9 Get total count for pagination metadata
- [x] 8.10 Return 200 with data array and pagination metadata
- [x] 8.11 Run tests and confirm they pass (green)

## 9. GET /api/bookmarks/[id] - Tests First

- [x] 9.1 Create test file `tests/api/bookmarks/get.test.ts`
- [x] 9.2 Write test: Get bookmark by ID for owner
- [x] 9.3 Write test: Return 404 for non-existent bookmark ID
- [x] 9.4 Write test: Return 403 for bookmark owned by different user
- [x] 9.5 Write test: Return 401 for unauthenticated requests
- [x] 9.6 Write test: Return complete bookmark data (all fields)
- [x] 9.7 Confirm all tests fail (red)

## 10. GET /api/bookmarks/[id] - Implementation

- [x] 10.1 Create `src/app/api/bookmarks/[id]/route.ts` file
- [x] 10.2 Implement GET handler with NextAuth session check
- [x] 10.3 Extract bookmark ID from route params
- [x] 10.4 Query bookmark with Prisma findUnique
- [x] 10.5 Return 404 if bookmark not found
- [x] 10.6 Check ownership: return 403 if userId doesn't match session
- [x] 10.7 Return 200 with bookmark data
- [x] 10.8 Run tests and confirm they pass (green)

## 11. PUT /api/bookmarks/[id] - Tests First

- [x] 11.1 Create test file `tests/api/bookmarks/update.test.ts`
- [x] 11.2 Write test: Update bookmark metadata (title, description, thumbnail)
- [x] 11.3 Write test: Update bookmark URL with validation
- [x] 11.4 Write test: Return 200 with updated bookmark data
- [x] 11.5 Write test: Update `updatedAt` timestamp
- [x] 11.6 Write test: Preserve existing fields when updating subset
- [x] 11.7 Write test: Return 400 for invalid URL
- [x] 11.8 Write test: Return 404 for non-existent bookmark ID
- [x] 11.9 Write test: Return 403 for bookmark owned by different user
- [x] 11.10 Write test: Return 401 for unauthenticated requests
- [x] 11.11 Confirm all tests fail (red)

## 12. PUT /api/bookmarks/[id] - Implementation

- [x] 12.1 Implement PUT handler in `src/app/api/bookmarks/[id]/route.ts`
- [x] 12.2 Add NextAuth session check
- [x] 12.3 Extract bookmark ID from route params
- [x] 12.4 Validate request body with Zod schema
- [x] 12.5 Check bookmark exists (return 404 if not)
- [x] 12.6 Check ownership (return 403 if userId doesn't match)
- [x] 12.7 Validate URL if provided in update
- [x] 12.8 Update bookmark with Prisma update (updatedAt auto-updated)
- [x] 12.9 Return 200 with updated bookmark data
- [x] 12.10 Run tests and confirm they pass (green)

## 13. DELETE /api/bookmarks/[id] - Tests First

- [x] 13.1 Create test file `tests/api/bookmarks/delete.test.ts`
- [x] 13.2 Write test: Delete bookmark returns 204 No Content
- [x] 13.3 Write test: Verify bookmark is removed from database
- [x] 13.4 Write test: Return 404 for non-existent bookmark ID
- [x] 13.5 Write test: Return 403 for bookmark owned by different user
- [x] 13.6 Write test: Return 401 for unauthenticated requests
- [x] 13.7 Confirm all tests fail (red)

## 14. DELETE /api/bookmarks/[id] - Implementation

- [x] 14.1 Implement DELETE handler in `src/app/api/bookmarks/[id]/route.ts`
- [x] 14.2 Add NextAuth session check
- [x] 14.3 Extract bookmark ID from route params
- [x] 14.4 Check bookmark exists (return 404 if not)
- [x] 14.5 Check ownership (return 403 if userId doesn't match)
- [x] 14.6 Delete bookmark with Prisma delete
- [x] 14.7 Return 204 No Content
- [x] 14.8 Run tests and confirm they pass (green)

## 15. Integration Testing & Verification

- [x] 15.1 Run all unit tests: `npm test`
- [ ] 15.2 Start dev server: `npm run dev`
- [x] 15.3 Run integration tests: `npm test -- --run tests/api/bookmarks/`
- [ ] 15.4 Test CASCADE delete: verify bookmarks deleted when user is deleted
- [ ] 15.5 Test link preview with real URLs (HTTP/HTTPS)
- [x] 15.6 Test SSRF protection with localhost and private IPs
- [x] 15.7 Test pagination edge cases (empty results, last page)
- [ ] 15.8 Test concurrent bookmark operations
- [x] 15.9 Verify all TypeScript types are correct (no `any` types)
- [x] 15.10 Run linter: `npm run lint`
- [x] 15.11 Run formatter: `npm run format:check`

## 16. Documentation & Cleanup

- [x] 16.1 Update README.md with bookmark features in Features section
- [x] 16.2 Document API endpoints in README (POST, GET, PUT, DELETE)
- [x] 16.3 Add bookmark CRUD examples to README
- [x] 16.4 Update test coverage summary in README
- [x] 16.5 Add JSDoc comments to public functions in LinkPreviewService
- [x] 16.6 Remove any console.log or debug statements
- [x] 16.7 Verify all error messages are user-friendly

## 17. Deployment Preparation

- [ ] 17.1 Test database migration on staging/development database
- [x] 17.2 Verify Prisma schema is valid: `npx prisma validate`
- [x] 17.3 Run production build: `npm run build`
- [x] 17.4 Verify no build errors or warnings
- [ ] 17.5 Test link preview service with various URL formats
- [ ] 17.6 Monitor error logs for link preview failures
- [ ] 17.7 Prepare rollback plan (document how to drop Bookmark table if needed)
