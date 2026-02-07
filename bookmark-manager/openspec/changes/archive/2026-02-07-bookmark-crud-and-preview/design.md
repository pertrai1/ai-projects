## Context

The bookmark manager currently has user authentication (NextAuth.js v4 with JWT sessions) and a PostgreSQL database with Prisma v7 ORM. Users can register and log in, but cannot yet save bookmarks.

This design adds the core bookmark management capabilities and external link preview fetching. The system needs to support:
- CRUD operations on bookmarks with user ownership
- Automatic metadata fetching when users save a URL
- Server-side validation and security controls
- Scalable API design for future features (tagging, folders, search)

**Current State:**
- Database: PostgreSQL with User, Account, Session, VerificationToken models
- Auth: NextAuth.js with session middleware available
- API: Next.js 16 App Router with route handlers

**Constraints:**
- Must use existing authentication system (NextAuth sessions)
- Must follow strict TypeScript patterns
- Must support the Anthropic Pattern (tests first)
- External URL fetching must have timeouts and error handling

## Goals / Non-Goals

**Goals:**
- Add Bookmark data model with user ownership (foreign key to User)
- Implement authenticated CRUD API routes for bookmarks
- Build link preview service to auto-fetch metadata from URLs
- Validate URLs and sanitize input to prevent security issues
- Support pagination for listing bookmarks
- Provide TypeScript types for all bookmark operations

**Non-Goals:**
- Tagging, folders, or search (future phases)
- Sharing or public/private controls (future phase)
- Browser extensions or bookmarklet (out of scope)
- Caching of link previews (defer until performance needs arise)
- Bulk import/export (future enhancement)

## Decisions

### 1. Database Schema: Bookmark Model

**Decision**: Add a `Bookmark` model with these fields:
- `id` (cuid, primary key)
- `url` (string, required, indexed for performance)
- `title` (string, nullable - fetched from preview or user-provided)
- `description` (string, nullable - fetched from preview)
- `thumbnail` (string, nullable - URL to image)
- `userId` (string, foreign key to User with CASCADE delete)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Rationale**:
- CUIDs match existing User model pattern
- Nullable metadata fields allow manual bookmarks without preview
- CASCADE delete ensures orphaned bookmarks are cleaned up when users are deleted
- Separate fields (vs JSON blob) enable future querying and indexing
- Index on `url` supports duplicate detection and fast lookups

**Alternatives Considered**:
- Store metadata as JSON: Less queryable, harder to validate, rejected
- UUIDs instead of CUIDs: CUIDs are already used for User model, maintain consistency

### 2. API Routes Structure

**Decision**: Create RESTful routes under `/api/bookmarks`:
- `POST /api/bookmarks` - Create (body: `{ url, title?, description?, thumbnail? }`)
- `GET /api/bookmarks` - List (query: `?page=1&limit=20`)
- `GET /api/bookmarks/[id]` - Get single
- `PUT /api/bookmarks/[id]` - Update (body: same as POST)
- `DELETE /api/bookmarks/[id]` - Delete

**Rationale**:
- RESTful conventions are familiar and well-documented
- Pagination via query params is standard practice
- ID-based routes follow Next.js dynamic route patterns
- All routes check NextAuth session before proceeding

**Alternatives Considered**:
- GraphQL: Overkill for this phase, adds complexity, rejected
- RPC-style routes (`/api/bookmark/create`): Less standard, rejected

### 3. Link Preview Implementation

**Decision**: Build a `LinkPreviewService` utility that:
1. Validates the URL format and protocol (allow http/https only)
2. Fetches the HTML with a 10-second timeout
3. Parses Open Graph tags (`og:title`, `og:description`, `og:image`)
4. Falls back to HTML `<title>` and `<meta name="description">` if OG missing
5. Returns structured metadata: `{ title, description, thumbnail }`
6. Handles errors gracefully (network failures, timeouts, invalid HTML)

**Library Choice**: Use **linkedom** for HTML parsing
- Lightweight DOM implementation (not full browser)
- Works in Node.js/Edge runtime environments
- No Chromium dependency (unlike Playwright)
- Good TypeScript support

**Rationale**:
- Open Graph is the standard for rich link previews
- Fallback to HTML meta tags handles sites without OG
- 10-second timeout prevents hanging requests
- Error handling returns `null` fields rather than failing the entire bookmark creation

**Alternatives Considered**:
- Cheerio: Popular but jQuery-like API, linkedom has better DOM standard compliance
- Puppeteer/Playwright: Too heavy for simple metadata extraction, rejected
- Third-party API (LinkPreview.net): Adds external dependency and latency, rejected for MVP

### 4. URL Validation Strategy

**Decision**: Multi-layer validation:
1. **Client-side**: Basic format check (prevent obvious typos)
2. **Server-side**: Strict validation using WHATWG URL API
   - Allow only `http:` and `https:` protocols
   - Reject localhost/private IPs (prevent SSRF attacks)
   - Max URL length: 2048 characters
3. **Zod schema**: Define TypeScript-first validation schemas

**Rationale**:
- Defense in depth: client and server validation
- WHATWG URL API is built-in (no dependencies)
- Private IP blocking prevents Server-Side Request Forgery
- Zod provides type safety and runtime validation together

**Alternatives Considered**:
- Regex-only validation: Error-prone for edge cases, rejected
- Allow all protocols: Security risk (ftp, file, etc.), rejected

### 5. Authentication Guards

**Decision**: Use NextAuth `getServerSession()` in all API routes:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

For ownership checks (update/delete):
```typescript
const bookmark = await prisma.bookmark.findUnique({ where: { id } });
if (bookmark.userId !== session.user.id) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Rationale**:
- Consistent with existing auth patterns
- Server-side session check prevents client-side bypass
- 401 for missing auth, 403 for insufficient permissions (standard HTTP)
- Prisma foreign key ensures referential integrity

**Alternatives Considered**:
- Middleware-based auth: Next.js middleware has limitations with App Router, handle per-route
- Role-based access: Not needed yet (all users equal), defer to future

### 6. Pagination Strategy

**Decision**: Offset-based pagination with query params:
- `GET /api/bookmarks?page=1&limit=20`
- Default: page 1, limit 20
- Max limit: 100 (prevent excessive data transfer)
- Return metadata: `{ data: [], page, limit, total, hasMore }`

**Rationale**:
- Simple to implement with Prisma `skip` and `take`
- Familiar pattern for developers
- Metadata enables UI pagination controls

**Alternatives Considered**:
- Cursor-based: More complex, better for infinite scroll (defer to future if needed)
- Load all at once: Doesn't scale, rejected

## Risks / Trade-offs

### [Risk] External URL Fetching Performance
- **Issue**: Fetching link previews from slow/unresponsive sites blocks bookmark creation
- **Mitigation**:
  - 10-second timeout on fetch requests
  - Allow bookmark creation even if preview fails (nullable fields)
  - Consider background job queue in future if performance degrades

### [Risk] SSRF Vulnerability via URL Input
- **Issue**: Malicious users could probe internal network by submitting private IPs
- **Mitigation**:
  - Block localhost, 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  - Use WHATWG URL validation to reject invalid schemes

### [Risk] Large Thumbnail URLs
- **Issue**: Storing external URLs means broken images if source deletes them
- **Trade-off**: Accepted for MVP - storing base64 or downloading images adds complexity
- **Future**: Consider image proxy/CDN or background re-validation

### [Risk] Rate Limiting on External Fetches
- **Issue**: Users could spam bookmark creation to DDoS external sites
- **Mitigation**:
  - NextAuth session requirement provides basic throttling (per-user)
  - Future: Add rate limiting middleware (e.g., Vercel Edge Config)

### [Risk] HTML Parsing Security
- **Issue**: Malicious HTML could exploit parser vulnerabilities
- **Mitigation**:
  - linkedom is actively maintained and receives security updates
  - Only extract specific tags (og:*, <title>, <meta>), don't execute scripts
  - Limit fetch size (e.g., 1MB max response body)

## Migration Plan

**Phase 1: Database Migration**
1. Create Prisma migration for Bookmark model
2. Run `npx prisma migrate dev --name add-bookmarks`
3. Verify schema in Prisma Studio
4. No data migration needed (new table)

**Phase 2: Implementation**
1. Add Bookmark model to Prisma schema
2. Create LinkPreviewService utility with tests
3. Implement API routes with authentication guards
4. Add TypeScript types for requests/responses
5. Write unit tests for validation logic
6. Write integration tests for API routes

**Phase 3: Deployment**
1. Push migration to production database
2. Deploy application code
3. Monitor error logs for link preview failures
4. No rollback strategy needed (purely additive)

**Rollback Strategy**: If needed, drop the bookmarks table:
```sql
DROP TABLE "Bookmark";
```
No CASCADE needed as this is a new table with no dependents.

## Open Questions

1. **Image Proxy**: Should we proxy thumbnail images through our CDN to prevent broken links?
   - **Resolution**: Defer to future. Store external URLs for MVP, revisit if users report issues.

2. **Duplicate URL Handling**: Should we prevent duplicate bookmark URLs per user?
   - **Resolution**: Allow duplicates for MVP. Users may want to save the same URL multiple times with different context (future: tags/folders differentiate). Can add unique constraint later if needed.

3. **Link Preview Caching**: Should we cache preview metadata to avoid re-fetching?
   - **Resolution**: Not for MVP. Each user fetching generates unique request. Consider Redis cache if performance becomes issue.

4. **User Feedback on Slow Fetches**: Should we show loading state or make preview async?
   - **Resolution**: Start with synchronous fetch (10s timeout). If users complain, move to background job with status polling.
